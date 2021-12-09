import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import { LPStat } from '../frost-finance/types';
import useRefresh from './useRefresh';

const useLpStats = (lpTicker: string) => {
  const [stat, setStat] = useState<LPStat>();
  const { slowRefresh } = useRefresh();
  const frostFinance = useFrostFinance();

  useEffect(() => {
    async function fetchLpPrice() {
      try{
        setStat(await frostFinance.getLPStat(lpTicker));
      }
      catch(err){
        console.error(err);
      }
    }
    fetchLpPrice();
  }, [setStat, frostFinance, slowRefresh, lpTicker]);

  return stat;
};

export default useLpStats;
