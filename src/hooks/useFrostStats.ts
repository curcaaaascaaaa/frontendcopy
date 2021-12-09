import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import { TokenStat } from '../frost-finance/types';
import useRefresh from './useRefresh';

const useFrostStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { fastRefresh } = useRefresh();
  const frostFinance = useFrostFinance();

  useEffect(() => {
    async function fetchFrostPrice(){
      try {
        setStat(await frostFinance.getFrostStat());
      }
      catch(err){
        console.error(err)
      }
    }
    fetchFrostPrice();
  }, [setStat, frostFinance, fastRefresh]);

  return stat;
};

export default useFrostStats;
