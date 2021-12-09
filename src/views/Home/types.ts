import { TokenStat } from '../../frost-finance/types';

export interface OverviewData {
  cash?: TokenStat;
  bond?: TokenStat;
  share?: TokenStat;
}
