import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import { TokenStat } from '../frost-finance/types';
import useRefresh from './useRefresh';

const useCashPriceInEstimatedTWAP = () => {
  const [stat, setStat] = useState<TokenStat>();
  const frostFinance = useFrostFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchCashPrice() {
      try {
        setStat(await frostFinance.getFrostStatInEstimatedTWAP());
      }catch(err) {
        console.error(err);
      }
    }
    fetchCashPrice();
  }, [setStat, frostFinance, slowRefresh]);

  return stat;
};

export default useCashPriceInEstimatedTWAP;
