import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import { TokenStat } from '../frost-finance/types';
import useRefresh from './useRefresh';

const useBondStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const frostFinance = useFrostFinance();

  useEffect(() => {
    async function fetchBondPrice() {
      try {
        setStat(await frostFinance.gefBondStat());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchBondPrice();
  }, [setStat, frostFinance, slowRefresh]);

  return stat;
};

export default useBondStats;
