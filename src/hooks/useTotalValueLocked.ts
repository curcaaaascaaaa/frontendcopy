import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import useRefresh from './useRefresh';

const useTotalValueLocked = () => {
  const [totalValueLocked, setTotalValueLocked] = useState<Number>(0);
  const { slowRefresh } = useRefresh();
  const frostFinance = useFrostFinance();

  useEffect(() => {
    async function fetchTVL() {
      try {
        setTotalValueLocked(await frostFinance.getTotalValueLocked());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchTVL();
  }, [setTotalValueLocked, frostFinance, slowRefresh]);

  return totalValueLocked;
};

export default useTotalValueLocked;
