import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import { TokenStat } from '../frost-finance/types';
import useRefresh from './useRefresh';

const useShareStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const frostFinance = useFrostFinance();

  useEffect(() => {
    async function fetchSharePrice() {
      try {
        setStat(await frostFinance.gefShareStat());
      } catch(err){
        console.error(err)
      }
    }
    fetchSharePrice();
  }, [setStat, frostFinance, slowRefresh]);

  return stat;
};

export default useShareStats;
