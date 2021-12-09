import { useEffect, useState } from 'react';
import useFrostFinance from '../useFrostFinance';
import { FShareSwapperStat } from '../../frost-finance/types';
import useRefresh from '../useRefresh';

const useFShareSwapperStats = (account: string) => {
  const [stat, setStat] = useState<FShareSwapperStat>();
  const { fastRefresh/*, slowRefresh*/ } = useRefresh();
  const frostFinance = useFrostFinance();

  useEffect(() => {
    async function fetchFShareSwapperStat() {
      try{
        if(frostFinance.myAccount) {
          setStat(await frostFinance.getFShareSwapperStat(account));
        }
      }
      catch(err){
        console.error(err);
      }
    }
    fetchFShareSwapperStat();
  }, [setStat, frostFinance, fastRefresh, account]);

  return stat;
};

export default useFShareSwapperStats;