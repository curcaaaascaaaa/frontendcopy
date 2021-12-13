// import { ChainId } from '@pancakeswap-libs/sdk';
// import { ChainId } from '@spookyswap/sdk';
import { ChainId } from '@traderjoe-xyz/sdk';
import { Configuration } from './frost-finance/config';
import { BankInfo } from './frost-finance';

const configurations: { [env: string]: Configuration } = {
  development: {
    chainId: ChainId.FUJI,
    networkName: 'Avalanche FUJI C-Chain',
    avaxscanUrl: 'https://testnet.snowtrace.io/',
    defaultProvider: 'https://api.avax-test.network/ext/bc/C/rpc',
    deployments: require('./frost-finance/deployments/deployments.testing.json'),
    externalTokens: {
      WAVAX: ['0xd00ae08403B9bbb9124bB305C09058E32C39A48c', 18],
      LINK: ['0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846', 18],
      JOE: ['0xa1d923f6B52A1F3938F1f9BC0f5022Ea109865B6', 18],
      USDTE: ['0x627e29C1854897B50F0cCeFf2f9A1e769d2be1AA', 18],
      'FROST-AVAX-LP': ['0x6Af7503fc3573DFCA60EA602b2De58358fE0843E', 18],
      'FSHARE-AVAX-LP': ['0x2b7b5e9c0520a19c6cf4f42c3a2747bee7625e66', 18],
      'USDT-AVAX-LP': ['0xd68becd47a4e3d88bdcc10a575015450f1fa5718', 18],
    },
    baseLaunchDate: new Date(),
    bondLaunchesAt: new Date('2020-12-03T15:00:00Z'),
    masonryLaunchesAt: new Date('2020-12-11T00:00:00Z'),
    refreshInterval: 10000,
  },
  production: {
    chainId: ChainId.AVALANCHE,
    networkName: 'Avalanche Mainnet C-Chain',
    avaxscanUrl: 'https://snowtrace.io/',
    defaultProvider: 'https://api.avax-test.network/ext/bc/C/rpc',
    deployments: require('./frost-finance/deployments/deployments.testing.json'),
    externalTokens: {
      WAVAX: ['0xd00ae08403B9bbb9124bB305C09058E32C39A48c', 18],
      LINK: ['0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846', 18],
      JOE: ['0xa1d923f6B52A1F3938F1f9BC0f5022Ea109865B6', 18],
      USDTE: ['0x627e29C1854897B50F0cCeFf2f9A1e769d2be1AA', 18],
      'USDT-AVAX-LP': ['0xd68becd47a4e3d88bdcc10a575015450f1fa5718', 18],
      'FROST-AVAX-LP': ['0x6Af7503fc3573DFCA60EA602b2De58358fE0843E', 18],
      'FSHARE-AVAX-LP': ['0x2b7b5e9c0520a19c6cf4f42c3a2747bee7625e66', 18],
    },
    baseLaunchDate: new Date(),
    bondLaunchesAt: new Date('2020-12-03T15:00:00Z'),
    masonryLaunchesAt: new Date('2020-12-11T00:00:00Z'),
    refreshInterval: 10000,
  },
};

export const bankDefinitions: { [contractName: string]: BankInfo } = {
  /*
  Explanation:
  name: description of the card
  poolId: the poolId assigned in the contract
  sectionInUI: way to distinguish in which of the 3 pool groups it should be listed
        - 0 = Single asset stake pools
        - 1 = LP asset staking rewarding FROST
        - 2 = LP asset staking rewarding FSHARE
  contract: the contract name which will be loaded from the deployment.environmnet.json
  depositTokenName : the name of the token to be deposited
  earnTokenName: the rewarded token
  finished: will disable the pool on the UI if set to true
  sort: the order of the pool
  */
  FrostAvaxRewardPool: {
    name: 'Earn FROST by AVAX',
    poolId: 1,
    sectionInUI: 0,
    contract: 'FrostWavaxGenesisRewardPool',
    depositTokenName: 'WAVAX',
    earnTokenName: 'FROST',
    finished: false,
    sort: 1,
    closedForStaking: true,
  },
  FrostBooRewardPool: {
    name: 'Earn FROST by LINK',
    poolId: 2,
    sectionInUI: 0,
    contract: 'FrostLinkGenesisRewardPool',
    depositTokenName: 'LINK',
    earnTokenName: 'FROST',
    finished: false,
    sort: 2,
    closedForStaking: true,
  },
  FrostShibaRewardPool: {
    name: 'Earn FROST by JOE',
    poolId: 3,
    sectionInUI: 0,
    contract: 'FrostJoeGenesisRewardPool',
    depositTokenName: 'JOE',
    earnTokenName: 'FROST',
    finished: false,
    sort: 3,
    closedForStaking: true,
  },
  FrostAvaxLPFrostRewardPool: {
    name: 'Earn FROST by FROST-AVAX LP',
    poolId: 0,
    sectionInUI: 1,
    contract: 'FrostAvaxLpFrostRewardPool',
    depositTokenName: 'FROST-AVAX-LP',
    earnTokenName: 'FROST',
    finished: false,
    sort: 5,
    closedForStaking: false,
  },
  FrostAvaxLPFShareRewardPool: {
    name: 'Earn FSHARE by FROST-AVAX LP',
    poolId: 0,
    sectionInUI: 2,
    contract: 'FrostAvaxLPFShareRewardPool',
    depositTokenName: 'FROST-AVAX-LP',
    earnTokenName: 'FSHARE',
    finished: false,
    sort: 6,
    closedForStaking: false,
  },
  FshareAvaxLPFShareRewardPool: {
    name: 'Earn FSHARE by FSHARE-AVAX LP',
    poolId: 1,
    sectionInUI: 2,
    contract: 'FshareAvaxLPFShareRewardPool',
    depositTokenName: 'FSHARE-AVAX-LP',
    earnTokenName: 'FSHARE',
    finished: false,
    sort: 7,
    closedForStaking: false,
  },
};

export default configurations[process.env.NODE_ENV || 'development'];
