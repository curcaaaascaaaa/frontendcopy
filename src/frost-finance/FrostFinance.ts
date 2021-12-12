// import { Fetcher, Route, Token } from '@uniswap/sdk';
// import { Fetcher as FetcherSpirit, Token as TokenSpirit } from '@spiritswap/sdk';
// import { Fetcher, Route, Token } from '@spookyswap/sdk';
import { Fetcher as FetcherSpirit, Token as TokenSpirit } from '@traderjoe-xyz/sdk';
import { Fetcher, Route, Token } from '@traderjoe-xyz/sdk';
import { Configuration } from './config';
import { ContractName, TokenStat, AllocationTime, LPStat, Bank, PoolStats, FShareSwapperStat } from './types';
import { BigNumber, Contract, ethers, EventFilter } from 'ethers';
import { decimalToBalance } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import ERC20 from './ERC20';
import { getFullDisplayBalance, getDisplayBalance } from '../utils/formatBalance';
import { getDefaultProvider } from '../utils/provider';
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';
import config, { bankDefinitions } from '../config';
import moment from 'moment';
import { parseUnits } from 'ethers/lib/utils';
import { AVAX_TICKER, TRADERJOE_ROUTER_ADDR, FROST_TICKER } from '../utils/constants';
/**
 * An API module of Frozen Capital contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class FrostFinance {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  contracts: { [name: string]: Contract };
  externalTokens: { [name: string]: ERC20 };
  masonryVersionOfUser?: string;

  FROSTWAVAX_LP: Contract;
  FROST: ERC20;
  FSHARE: ERC20;
  FBOND: ERC20;
  AVAX: ERC20;

  constructor(cfg: Configuration) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
    }
    this.externalTokens = {};
    for (const [symbol, [address, decimal]] of Object.entries(externalTokens)) {
      this.externalTokens[symbol] = new ERC20(address, provider, symbol, decimal);
    }
    this.FROST = new ERC20(deployments.frost.address, provider, 'FROST');
    this.FSHARE = new ERC20(deployments.fShare.address, provider, 'FSHARE');
    this.FBOND = new ERC20(deployments.fBond.address, provider, 'FBOND');
    this.AVAX = this.externalTokens['WAVAX'];

    // Uniswap V2 Pair
    this.FROSTWAVAX_LP = new Contract(externalTokens['FROST-AVAX-LP'][0], IUniswapV2PairABI, provider);

    this.config = cfg;
    this.provider = provider;
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */
  unlockWallet(provider: any, account: string) {
    const newProvider = new ethers.providers.Web3Provider(provider, this.config.chainId);
    this.signer = newProvider.getSigner(0);
    this.myAccount = account;
    for (const [name, contract] of Object.entries(this.contracts)) {
      this.contracts[name] = contract.connect(this.signer);
    }
    const tokens = [this.FROST, this.FSHARE, this.FBOND, ...Object.values(this.externalTokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }
    this.FROSTWAVAX_LP = this.FROSTWAVAX_LP.connect(this.signer);
    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
    this.fetchMasonryVersionOfUser()
      .then((version) => (this.masonryVersionOfUser = version))
      .catch((err) => {
        console.error(`Failed to fetch masonry version: ${err.stack}`);
        this.masonryVersionOfUser = 'latest';
      });
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //===================FROM SPOOKY TO DISPLAY =========================
  //=========================IN HOME PAGE==============================
  //===================================================================

  async getFrostStat(): Promise<TokenStat> {
    const { FrostAvaxRewardPool, FrostAvaxLpFrostRewardPool, FrostAvaxLpFrostRewardPoolOld } = this.contracts;
    const supply = await this.FROST.totalSupply();
    const frostRewardPoolSupply = await this.FROST.balanceOf(FrostAvaxRewardPool.address);
    const frostRewardPoolSupply2 = await this.FROST.balanceOf(FrostAvaxLpFrostRewardPool.address);
    const frostRewardPoolSupplyOld = await this.FROST.balanceOf(FrostAvaxLpFrostRewardPoolOld.address);
    const frostCirculatingSupply = supply
      .sub(frostRewardPoolSupply)
      .sub(frostRewardPoolSupply2)
      .sub(frostRewardPoolSupplyOld);
    const priceInAVAX = await this.getTokenPriceFromPancakeswap(this.FROST);
    const priceOfOneAVAX = await this.getWAVAXPriceFromPancakeswap();
    const priceOfFrostInDollars = (Number(priceInAVAX) * Number(priceOfOneAVAX)).toFixed(2);

    return {
      tokenInAvax: priceInAVAX,
      priceInDollars: priceOfFrostInDollars,
      totalSupply: getDisplayBalance(supply, this.FROST.decimal, 0),
      circulatingSupply: getDisplayBalance(frostCirculatingSupply, this.FROST.decimal, 0),
    };
  }

  /**
   * Calculates various stats for the requested LP
   * @param name of the LP token to load stats for
   * @returns
   */
  async getLPStat(name: string): Promise<LPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = name.startsWith('FROST') ? this.FROST : this.FSHARE;
    const isFrost = name.startsWith('FROST');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const avaxAmountBN = await this.AVAX.balanceOf(lpToken.address);
    const avaxAmount = getDisplayBalance(avaxAmountBN, 18);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const avaxAmountInOneLP = Number(avaxAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isFrost);
    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(2).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(2).toString();
    return {
      tokenAmount: tokenAmountInOneLP.toFixed(2).toString(),
      avaxAmount: avaxAmountInOneLP.toFixed(2).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(2).toString(),
    };
  }

  /**
   * Use this method to get price for Frost
   * @returns TokenStat for FBOND
   * priceInAVAX
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async gefBondStat(): Promise<TokenStat> {
    const { Treasury } = this.contracts;
    const frostStat = await this.getFrostStat();
    const bondFrostRatioBN = await Treasury.gefBondPremiumRate();
    const modifier = bondFrostRatioBN / 1e18 > 1 ? bondFrostRatioBN / 1e18 : 1;
    const bondPriceInAVAX = (Number(frostStat.tokenInAvax) * modifier).toFixed(2);
    const priceOfFBondInDollars = (Number(frostStat.priceInDollars) * modifier).toFixed(2);
    const supply = await this.FBOND.displayedTotalSupply();
    return {
      tokenInAvax: bondPriceInAVAX,
      priceInDollars: priceOfFBondInDollars,
      totalSupply: supply,
      circulatingSupply: supply,
    };
  }

  /**
   * @returns TokenStat for FSHARE
   * priceInAVAX
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async gefShareStat(): Promise<TokenStat> {
    const { FrostAvaxLPFShareRewardPool } = this.contracts;

    const supply = await this.FSHARE.totalSupply();

    const priceInAVAX = await this.getTokenPriceFromPancakeswap(this.FSHARE);
    const frostRewardPoolSupply = await this.FSHARE.balanceOf(FrostAvaxLPFShareRewardPool.address);
    const fShareCirculatingSupply = supply.sub(frostRewardPoolSupply);
    const priceOfOneAVAX = await this.getWAVAXPriceFromPancakeswap();
    const priceOfSharesInDollars = (Number(priceInAVAX) * Number(priceOfOneAVAX)).toFixed(2);

    return {
      tokenInAvax: priceInAVAX,
      priceInDollars: priceOfSharesInDollars,
      totalSupply: getDisplayBalance(supply, this.FSHARE.decimal, 0),
      circulatingSupply: getDisplayBalance(fShareCirculatingSupply, this.FSHARE.decimal, 0),
    };
  }

  async getFrostStatInEstimatedTWAP(): Promise<TokenStat> {
    const { SeigniorageOracle, FrostAvaxRewardPool } = this.contracts;
    const expectedPrice = await SeigniorageOracle.twap(this.FROST.address, ethers.utils.parseEther('1'));

    const supply = await this.FROST.totalSupply();
    const frostRewardPoolSupply = await this.FROST.balanceOf(FrostAvaxRewardPool.address);
    const frostCirculatingSupply = supply.sub(frostRewardPoolSupply);
    return {
      tokenInAvax: getDisplayBalance(expectedPrice),
      priceInDollars: getDisplayBalance(expectedPrice),
      totalSupply: getDisplayBalance(supply, this.FROST.decimal, 0),
      circulatingSupply: getDisplayBalance(frostCirculatingSupply, this.FROST.decimal, 0),
    };
  }

  async getFrostPriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getFrostUpdatedPrice();
  }

  async gefBondsPurchasable(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBurnableFrostLeft();
  }

  /**
   * Calculates the TVL, APR and daily APR of a provided pool/bank
   * @param bank
   * @returns
   */
  async getPoolAPRs(bank: Bank): Promise<PoolStats> {
    if (this.myAccount === undefined) return;
    const depositToken = bank.depositToken;
    const poolContract = this.contracts[bank.contract];
    const depositTokenPrice = await this.getDepositTokenPriceInDollars(bank.depositTokenName, depositToken);
    const stakeInPool = await depositToken.balanceOf(bank.address);
    const TVL = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const stat = bank.earnTokenName === 'FROST' ? await this.getFrostStat() : await this.gefShareStat();
    const tokenPerSecond = await this.getTokenPerSecond(
      bank.earnTokenName,
      bank.contract,
      poolContract,
      bank.depositTokenName,
    );

    const tokenPerHour = tokenPerSecond.mul(60).mul(60);
    const totalRewardPricePerYear =
      Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24).mul(365)));
    const totalRewardPricePerDay = Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24)));
    const totalStakingTokenInPool =
      Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const dailyAPR = (totalRewardPricePerDay / totalStakingTokenInPool) * 100;
    const yearlyAPR = (totalRewardPricePerYear / totalStakingTokenInPool) * 100;
    return {
      dailyAPR: dailyAPR.toFixed(2).toString(),
      yearlyAPR: yearlyAPR.toFixed(2).toString(),
      TVL: TVL.toFixed(2).toString(),
    };
  }

  /**
   * Method to return the amount of tokens the pool yields per second
   * @param earnTokenName the name of the token that the pool is earning
   * @param contractName the contract of the pool/bank
   * @param poolContract the actual contract of the pool
   * @returns
   */
  async getTokenPerSecond(
    earnTokenName: string,
    contractName: string,
    poolContract: Contract,
    depositTokenName: string,
  ) {
    if (earnTokenName === 'FROST') {
      if (!contractName.endsWith('FrostRewardPool')) {
        const rewardPerSecond = await poolContract.frostPerSecond();
        if (depositTokenName === 'WAVAX') {
          return rewardPerSecond.mul(6000).div(11000).div(24);
        } else if (depositTokenName === 'BOO') {
          return rewardPerSecond.mul(2500).div(11000).div(24);
        } else if (depositTokenName === 'ZOO') {
          return rewardPerSecond.mul(1000).div(11000).div(24);
        } else if (depositTokenName === 'SHIBA') {
          return rewardPerSecond.mul(1500).div(11000).div(24);
        }
        return rewardPerSecond.div(24);
      }
      const poolStartTime = await poolContract.poolStartTime();
      const startDateTime = new Date(poolStartTime.toNumber() * 1000);
      const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;
      if (Date.now() - startDateTime.getTime() > FOUR_DAYS) {
        return await poolContract.epochFrostPerSecond(1);
      }
      return await poolContract.epochFrostPerSecond(0);
    }
    const rewardPerSecond = await poolContract.fSharePerSecond();
    if (depositTokenName.startsWith('FROST')) {
      return rewardPerSecond.mul(35500).div(59500);
    } else {
      return rewardPerSecond.mul(24000).div(59500);
    }
  }

  /**
   * Method to calculate the tokenPrice of the deposited asset in a pool/bank
   * If the deposited token is an LP it will find the price of its pieces
   * @param tokenName
   * @param pool
   * @param token
   * @returns
   */
  async getDepositTokenPriceInDollars(tokenName: string, token: ERC20) {
    let tokenPrice;
    const priceOfOneAvaxInDollars = await this.getWAVAXPriceFromPancakeswap();
    if (tokenName === 'WAVAX') {
      tokenPrice = priceOfOneAvaxInDollars;
    } else {
      if (tokenName === 'FROST-AVAX-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.FROST, true);
      } else if (tokenName === 'FSHARE-AVAX-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.FSHARE, false);
      } else if (tokenName === 'SHIBA') {
        tokenPrice = await this.getTokenPriceFromSpiritswap(token);
      } else {
        tokenPrice = await this.getTokenPriceFromPancakeswap(token);
        tokenPrice = (Number(tokenPrice) * Number(priceOfOneAvaxInDollars)).toString();
      }
    }
    return tokenPrice;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //=========================== END ===================================
  //===================================================================

  async getCurrentEpoch(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.epoch();
  }

  async gefBondOraclePriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.gefBondPremiumRate();
  }

  /**
   * Buy bonds with cash.
   * @param amount amount of cash to purchase bonds with.
   */
  async buyBonds(amount: string | number): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const treasuryFrostPrice = await Treasury.getFrostPrice();
    return await Treasury.buyBonds(decimalToBalance(amount), treasuryFrostPrice);
  }

  /**
   * Redeem bonds for cash.
   * @param amount amount of bonds to redeem.
   */
  async redeemBonds(amount: string): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const priceForFrost = await Treasury.getFrostPrice();
    return await Treasury.redeemBonds(decimalToBalance(amount), priceForFrost);
  }

  async getTotalValueLocked(): Promise<Number> {
    let totalValue = 0;
    for (const bankInfo of Object.values(bankDefinitions)) {
      const pool = this.contracts[bankInfo.contract];
      const token = this.externalTokens[bankInfo.depositTokenName];
      const tokenPrice = await this.getDepositTokenPriceInDollars(bankInfo.depositTokenName, token);
      const tokenAmountInPool = await token.balanceOf(pool.address);
      const value = Number(getDisplayBalance(tokenAmountInPool, token.decimal)) * Number(tokenPrice);
      const poolValue = Number.isNaN(value) ? 0 : value;
      totalValue += poolValue;
    }

    const FSHAREPrice = (await this.gefShareStat()).priceInDollars;
    const masonryfShareBalanceOf = await this.FSHARE.balanceOf(this.currentMasonry().address);
    const masonryTVL = Number(getDisplayBalance(masonryfShareBalanceOf, this.FSHARE.decimal)) * Number(FSHAREPrice);

    return totalValue + masonryTVL;
  }

  /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be AVAX in most cases)
   * @param isFrost sanity check for usage of frost token or fShare
   * @returns price of the LP token
   */
  async getLPTokenPrice(lpToken: ERC20, token: ERC20, isFrost: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    const stat = isFrost === true ? await this.getFrostStat() : await this.gefShareStat();
    const priceOfToken = stat.priceInDollars;
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);
    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

  async earnedFromBank(
    poolName: ContractName,
    earnTokenName: String,
    poolId: Number,
    account = this.myAccount,
  ): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      if (earnTokenName === 'FROST') {
        return await pool.pendingFROST(poolId, account);
      } else {
        return await pool.pendingShare(poolId, account);
      }
    } catch (err) {
      console.error(`Failed to call earned() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  async stakedBalanceOnBank(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      let userInfo = await pool.userInfo(poolId, account);
      return await userInfo.amount;
    } catch (err) {
      console.error(`Failed to call balanceOf() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  /**
   * Deposits token to given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async stake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.deposit(poolId, amount);
  }

  /**
   * Withdraws token from given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async unstake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.withdraw(poolId, amount);
  }

  /**
   * Transfers earned token reward from given pool to my account.
   */
  async harvest(poolName: ContractName, poolId: Number): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    //By passing 0 as the amount, we are asking the contract to only redeem the reward and not the currently staked token
    return await pool.withdraw(poolId, 0);
  }

  /**
   * Harvests and withdraws deposited tokens from the pool.
   */
  async exit(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    let userInfo = await pool.userInfo(poolId, account);
    return await pool.withdraw(poolId, userInfo.amount);
  }

  async fetchMasonryVersionOfUser(): Promise<string> {
    return 'latest';
  }

  currentMasonry(): Contract {
    if (!this.masonryVersionOfUser) {
      //throw new Error('you must unlock the wallet to continue.');
    }
    return this.contracts.Masonry;
  }

  isOldMasonryMember(): boolean {
    return this.masonryVersionOfUser !== 'latest';
  }

  async getTokenPriceFromPancakeswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;
    const { WAVAX } = this.config.externalTokens;

    const wavax = new Token(chainId, WAVAX[0], WAVAX[1]);
    const token = new Token(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wavaxToToken = await Fetcher.fetchPairData(wavax, token, this.provider);
      const priceInBUSD = new Route([wavaxToToken], token);

      return priceInBUSD.midPrice.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceFromSpiritswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;

    const { WAVAX } = this.externalTokens;

    const wavax = new TokenSpirit(chainId, WAVAX.address, WAVAX.decimal);
    const token = new TokenSpirit(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wavaxToToken = await FetcherSpirit.fetchPairData(wavax, token, this.provider);
      const liquidityToken = wavaxToToken.liquidityToken;
      let avaxBalanceInLP = await WAVAX.balanceOf(liquidityToken.address);
      let avaxAmount = Number(getFullDisplayBalance(avaxBalanceInLP, WAVAX.decimal));
      let shibaBalanceInLP = await tokenContract.balanceOf(liquidityToken.address);
      let shibaAmount = Number(getFullDisplayBalance(shibaBalanceInLP, tokenContract.decimal));
      const priceOfOneAvaxInDollars = await this.getWAVAXPriceFromPancakeswap();
      let priceOfShiba = (avaxAmount / shibaAmount) * Number(priceOfOneAvaxInDollars);
      return priceOfShiba.toString();
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getWAVAXPriceFromPancakeswap(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { WAVAX, USDTE } = this.externalTokens;
    try {
      const usdte_wavax_lp_pair = this.externalTokens['USDT-AVAX-LP'];
      let avax_amount_BN = await WAVAX.balanceOf(usdte_wavax_lp_pair.address);
      let avax_amount = Number(getFullDisplayBalance(avax_amount_BN, WAVAX.decimal));
      let usdte_amount_BN = await USDTE.balanceOf(usdte_wavax_lp_pair.address);
      let usdte_amount = Number(getFullDisplayBalance(usdte_amount_BN, USDTE.decimal));
      return (usdte_amount / avax_amount).toString();
    } catch (err) {
      console.error(`Failed to fetch token price of WAVAX: ${err}`);
    }
  }

  //===================================================================
  //===================================================================
  //===================== MASONRY METHODS =============================
  //===================================================================
  //===================================================================

  async getMasonryAPR() {
    const Masonry = this.currentMasonry();
    const latestSnapshotIndex = await Masonry.latestSnapshotIndex();
    const lastHistory = await Masonry.masonryHistory(latestSnapshotIndex);

    const lastRewardsReceived = lastHistory[1];

    const FSHAREPrice = (await this.gefShareStat()).priceInDollars;
    const FROSTPrice = (await this.getFrostStat()).priceInDollars;
    const epochRewardsPerShare = lastRewardsReceived / 1e18;

    //Mgod formula
    const amountOfRewardsPerDay = epochRewardsPerShare * Number(FROSTPrice) * 4;
    const masonryfShareBalanceOf = await this.FSHARE.balanceOf(Masonry.address);
    const masonryTVL = Number(getDisplayBalance(masonryfShareBalanceOf, this.FSHARE.decimal)) * Number(FSHAREPrice);
    const realAPR = ((amountOfRewardsPerDay * 100) / masonryTVL) * 365;
    return realAPR;
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Masonry
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserClaimRewardFromMasonry(): Promise<boolean> {
    const Masonry = this.currentMasonry();
    return await Masonry.canClaimReward(this.myAccount);
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Masonry
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserUnstakeFromMasonry(): Promise<boolean> {
    const Masonry = this.currentMasonry();
    const canWithdraw = await Masonry.canWithdraw(this.myAccount);
    const stakedAmount = await this.getStakedSharesOnMasonry();
    const notStaked = Number(getDisplayBalance(stakedAmount, this.FSHARE.decimal)) === 0;
    const result = notStaked ? true : canWithdraw;
    return result;
  }

  async timeUntilClaimRewardFromMasonry(): Promise<BigNumber> {
    // const Masonry = this.currentMasonry();
    // const mason = await Masonry.masons(this.myAccount);
    return BigNumber.from(0);
  }

  async getTotalStakedInMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    return await Masonry.totalSupply();
  }

  async stakeShareToMasonry(amount: string): Promise<TransactionResponse> {
    if (this.isOldMasonryMember()) {
      throw new Error("you're using old masonry. please withdraw and deposit the FSHARE again.");
    }
    const Masonry = this.currentMasonry();
    return await Masonry.stake(decimalToBalance(amount));
  }

  async getStakedSharesOnMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.gefShareOf(this.myAccount);
    }
    return await Masonry.balanceOf(this.myAccount);
  }

  async getEarningsOnMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.getCashEarningsOf(this.myAccount);
    }
    return await Masonry.earned(this.myAccount);
  }

  async withdrawShareFromMasonry(amount: string): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    return await Masonry.withdraw(decimalToBalance(amount));
  }

  async harvestCashFromMasonry(): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.claimDividends();
    }
    return await Masonry.claimReward();
  }

  async exitFromMasonry(): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    return await Masonry.exit();
  }

  async getTreasuryNextAllocationTime(): Promise<AllocationTime> {
    const { Treasury } = this.contracts;
    const nextEpochTimestamp: BigNumber = await Treasury.nextEpochPoint();
    const nextAllocation = new Date(nextEpochTimestamp.mul(1000).toNumber());
    const prevAllocation = new Date(Date.now());

    return { from: prevAllocation, to: nextAllocation };
  }
  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to claim
   * their reward from the masonry
   * @returns Promise<AllocationTime>
   */
  async getUserClaimRewardTime(): Promise<AllocationTime> {
    const { Masonry, Treasury } = this.contracts;
    const nextEpochTimestamp = await Masonry.nextEpochPoint(); //in unix timestamp
    const currentEpoch = await Masonry.epoch();
    const mason = await Masonry.masons(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const periodInHours = period / 60 / 60; // 6 hours, period is displayed in seconds which is 21600
    const rewardLockupEpochs = await Masonry.rewardLockupEpochs();
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(rewardLockupEpochs);

    const fromDate = new Date(Date.now());
    if (targetEpochForClaimUnlock - currentEpoch <= 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - currentEpoch - 1;
      const endDate = moment(toDate)
        .add(delta * periodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to unstake
   * from the masonry
   * @returns Promise<AllocationTime>
   */
  async getUserUnstakeTime(): Promise<AllocationTime> {
    const { Masonry, Treasury } = this.contracts;
    const nextEpochTimestamp = await Masonry.nextEpochPoint();
    const currentEpoch = await Masonry.epoch();
    const mason = await Masonry.masons(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const PeriodInHours = period / 60 / 60;
    const withdrawLockupEpochs = await Masonry.withdrawLockupEpochs();
    const fromDate = new Date(Date.now());
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(withdrawLockupEpochs);
    const stakedAmount = await this.getStakedSharesOnMasonry();
    if (currentEpoch <= targetEpochForClaimUnlock && Number(stakedAmount) === 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - Number(currentEpoch) - 1;
      const endDate = moment(toDate)
        .add(delta * PeriodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  async watchAssetInMetamask(assetName: string): Promise<boolean> {
    const { ethereum } = window as any;
    if (ethereum && ethereum.networkVersion === config.chainId.toString()) {
      let asset;
      let assetUrl;
      if (assetName === 'FROST') {
        asset = this.FROST;
        assetUrl = 'https://frost.finance/presskit/frost_icon_noBG.png';
      } else if (assetName === 'FSHARE') {
        asset = this.FSHARE;
        assetUrl = 'https://frost.finance/presskit/fshare_icon_noBG.png';
      } else if (assetName === 'FBOND') {
        asset = this.FBOND;
        assetUrl = 'https://frost.finance/presskit/fbond_icon_noBG.png';
      }
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: asset.address,
            symbol: asset.symbol,
            decimals: 18,
            image: assetUrl,
          },
        },
      });
    }
    return true;
  }

  async provideFrostAvaxLP(avaxAmount: string, frostAmount: BigNumber): Promise<TransactionResponse> {
    const { TaxOffice } = this.contracts;
    let overrides = {
      value: parseUnits(avaxAmount, 18),
    };
    return await TaxOffice.addLiquidityETHTaxFree(frostAmount, frostAmount.mul(992).div(1000), parseUnits(avaxAmount, 18).mul(992).div(1000), overrides);
  }

  async quoteFromTraderJoe(tokenAmount: string, tokenName: string): Promise<string> {
    const { TraderJoeRouter } = this.contracts;
    const { _reserve0, _reserve1 } = await this.FROSTWAVAX_LP.getReserves();
    let quote;
    if (tokenName === 'FROST') {
      quote = await TraderJoeRouter.quote(parseUnits(tokenAmount), _reserve1, _reserve0);
    } else {
      quote = await TraderJoeRouter.quote(parseUnits(tokenAmount), _reserve0, _reserve1);
    }
    return (quote / 1e18).toString();
  }

  /**
   * @returns an array of the regulation events till the most up to date epoch
   */
  async listenForRegulationsEvents(): Promise<any> {
    const { Treasury } = this.contracts;

    const treasuryDaoFundedFilter = Treasury.filters.DaoFundFunded();
    const treasuryDevFundedFilter = Treasury.filters.DevFundFunded();
    const treasuryMasonryFundedFilter = Treasury.filters.MasonryFunded();
    const boughfBondsFilter = Treasury.filters.BoughfBonds();
    const redeemBondsFilter = Treasury.filters.RedeemedBonds();

    let epochBlocksRanges: any[] = [];
    let masonryFundEvents = await Treasury.queryFilter(treasuryMasonryFundedFilter);
    var events: any[] = [];
    masonryFundEvents.forEach(function callback(value, index) {
      events.push({ epoch: index + 1 });
      events[index].masonryFund = getDisplayBalance(value.args[1]);
      if (index === 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
      }
      if (index > 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
        epochBlocksRanges[index - 1].endBlock = value.blockNumber;
      }
    });

    epochBlocksRanges.forEach(async (value, index) => {
      events[index].bondsBought = await this.gefBondsWithFilterForPeriod(
        boughfBondsFilter,
        value.startBlock,
        value.endBlock,
      );
      events[index].bondsRedeemed = await this.gefBondsWithFilterForPeriod(
        redeemBondsFilter,
        value.startBlock,
        value.endBlock,
      );
    });
    let DEVFundEvents = await Treasury.queryFilter(treasuryDevFundedFilter);
    DEVFundEvents.forEach(function callback(value, index) {
      events[index].devFund = getDisplayBalance(value.args[1]);
    });
    let DAOFundEvents = await Treasury.queryFilter(treasuryDaoFundedFilter);
    DAOFundEvents.forEach(function callback(value, index) {
      events[index].daoFund = getDisplayBalance(value.args[1]);
    });
    return events;
  }

  /**
   * Helper method
   * @param filter applied on the query to the treasury events
   * @param from block number
   * @param to block number
   * @returns the amount of bonds events emitted based on the filter provided during a specific period
   */
  async gefBondsWithFilterForPeriod(filter: EventFilter, from: number, to: number): Promise<number> {
    const { Treasury } = this.contracts;
    const bondsAmount = await Treasury.queryFilter(filter, from, to);
    return bondsAmount.length;
  }

  async estimateZapIn(tokenName: string, lpName: string, amount: string): Promise<number[]> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    let estimate;
    if (tokenName === AVAX_TICKER) {
      estimate = await zapper.estimateZapIn(lpToken.address, TRADERJOE_ROUTER_ADDR, parseUnits(amount, 18));
    } else {
      const token = tokenName === FROST_TICKER ? this.FROST : this.FSHARE;
      estimate = await zapper.estimateZapInToken(
        token.address,
        lpToken.address,
        TRADERJOE_ROUTER_ADDR,
        parseUnits(amount, 18),
      );
    }
    return [estimate[0] / 1e18, estimate[1] / 1e18];
  }
  async zapIn(tokenName: string, lpName: string, amount: string): Promise<TransactionResponse> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    if (tokenName === AVAX_TICKER) {
      let overrides = {
        value: parseUnits(amount, 18),
      };
      return await zapper.zapIn(lpToken.address, TRADERJOE_ROUTER_ADDR, this.myAccount, overrides);
    } else {
      const token = tokenName === FROST_TICKER ? this.FROST : this.FSHARE;
      return await zapper.zapInToken(
        token.address,
        parseUnits(amount, 18),
        lpToken.address,
        TRADERJOE_ROUTER_ADDR,
        this.myAccount,
      );
    }
  }
  async swapFBondToFShare(fbondAmount: BigNumber): Promise<TransactionResponse> {
    const { FShareSwapper } = this.contracts;
    return await FShareSwapper.swapFBondToFShare(fbondAmount);
  }
  async estimateAmountOfFShare(fbondAmount: string): Promise<string> {
    const { FShareSwapper } = this.contracts;
    try {
      const estimateBN = await FShareSwapper.estimateAmountOfFShare(parseUnits(fbondAmount, 18));
      return getDisplayBalance(estimateBN, 18, 6);
    } catch (err) {
      console.error(`Failed to fetch estimate fshare amount: ${err}`);
    }
  }

  async getFShareSwapperStat(address: string): Promise<FShareSwapperStat> {
    const { FShareSwapper } = this.contracts;
    const fshareBalanceBN = await FShareSwapper.getFShareBalance();
    const fbondBalanceBN = await FShareSwapper.getFBondBalance(address);
    // const frostPriceBN = await FShareSwapper.getFrostPrice();
    // const fsharePriceBN = await FShareSwapper.getFSharePrice();
    const rateFSharePerFrostBN = await FShareSwapper.getFShareAmountPerFrost();
    const fshareBalance = getDisplayBalance(fshareBalanceBN, 18, 5);
    const fbondBalance = getDisplayBalance(fbondBalanceBN, 18, 5);
    return {
      fshareBalance: fshareBalance.toString(),
      fbondBalance: fbondBalance.toString(),
      // frostPrice: frostPriceBN.toString(),
      // fsharePrice: fsharePriceBN.toString(),
      rateFSharePerFrost: rateFSharePerFrostBN.toString(),
    };
  }
}
