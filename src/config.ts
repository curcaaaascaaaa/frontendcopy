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
      WAVAX: ['0xd00ae08403b9bbb9124bb305c09058e32c39a48c', 18],
      USDTE: ['0xafda926d549a67229d8db529638e0bafcdb66458', 6],
      JOE: ['0x439d3502ae521ca0f83c68e086d6552a6a79295d', 18],
      'USDT-AVAX-LP': ['0xE7e3461C2C03c18301F66Abc9dA1F385f45047bA', 18],
      'FROST-AVAX-LP': ['0x13Fe199F19c8F719652985488F150762A5E9c3A8', 18],
      'FSHARE-AVAX-LP': ['0x20bc90bB41228cb9ab412036F80CE4Ef0cAf1BD5', 18],
    },
    baseLaunchDate: new Date('2021-06-02 13:00:00Z'),
    bondLaunchesAt: new Date('2020-12-03T15:00:00Z'),
    masonryLaunchesAt: new Date('2020-12-11T00:00:00Z'),
    refreshInterval: 10000,
  },
  production: {
    chainId: ChainId.AVALANCHE,
    networkName: 'Avalanche Mainnet C-Chain',
    avaxscanUrl: 'https://snowtrace.io/',
    defaultProvider: 'https://api.avax.network/ext/bc/C/rpc',
    deployments: require('./frost-finance/deployments/deployments.mainnet.json'),
    externalTokens: {
      WAVAX: ['0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 18],
      USDTE: ['0xc7198437980c041c805a1edcba50c1ce5db95118', 6],
      JOE: ['0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd', 18],
      'USDT-AVAX-LP': ['0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c', 18],
      'FROST-AVAX-LP': ['0x2A651563C9d3Af67aE0388a5c8F89b867038089e', 18],
      'FSHARE-AVAX-LP': ['0x4733bc45eF91cF7CcEcaeeDb794727075fB209F2', 18],
    },
    baseLaunchDate: new Date('2021-06-02 13:00:00Z'),
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
    poolId: 0,
    sectionInUI: 0,
    contract: 'FrostAvaxRewardPool',
    depositTokenName: 'WAVAX',
    earnTokenName: 'FROST',
    finished: false,
    sort: 1,
    closedForStaking: true,
  },
  FrostBooRewardPool: {
    name: 'Earn FROST by JOE',
    poolId: 1,
    sectionInUI: 0,
    contract: 'FrostBooGenesisRewardPool',
    depositTokenName: 'JOE',
    earnTokenName: 'FROST',
    finished: false,
    sort: 2,
    closedForStaking: true,
  },
  FrostShibaRewardPool: {
    name: 'Earn FROST by SHIBA',
    poolId: 2,
    sectionInUI: 0,
    contract: 'FrostShibaGenesisRewardPool',
    depositTokenName: 'SHIBA',
    earnTokenName: 'FROST',
    finished: false,
    sort: 3,
    closedForStaking: true,
  },
  FrostZooRewardPool: {
    name: 'Earn FROST by ZOO',
    poolId: 3,
    sectionInUI: 0,
    contract: 'FrostZooGenesisRewardPool',
    depositTokenName: 'ZOO',
    earnTokenName: 'FROST',
    finished: false,
    sort: 4,
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
    closedForStaking: true,
  },
  FrostAvaxLPFrostRewardPoolOld: {
    name: 'Earn FROST by FROST-AVAX LP',
    poolId: 0,
    sectionInUI: 1,
    contract: 'FrostAvaxLpFrostRewardPoolOld',
    depositTokenName: 'FROST-AVAX-LP',
    earnTokenName: 'FROST',
    finished: true,
    sort: 9,
    closedForStaking: true,
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
  TshareAvaxLPFShareRewardPool: {
    name: 'Earn FSHARE by FSHARE-AVAX LP',
    poolId: 1,
    sectionInUI: 2,
    contract: 'TshareAvaxLPFShareRewardPool',
    depositTokenName: 'FSHARE-AVAX-LP',
    earnTokenName: 'FSHARE',
    finished: false,
    sort: 7,
    closedForStaking: false,
  },
};

export default configurations[process.env.NODE_ENV || 'development'];
