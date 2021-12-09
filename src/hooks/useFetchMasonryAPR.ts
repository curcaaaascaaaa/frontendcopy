import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import useRefresh from './useRefresh';

const useFetchMasonryAPR = () => {
  const [apr, setApr] = useState<number>(0);
  const frostFinance = useFrostFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchMasonryAPR() {
      try {
        setApr(await frostFinance.getMasonryAPR());
      } catch(err){
        console.error(err);
      }
    }
   fetchMasonryAPR();
  }, [setApr, frostFinance, slowRefresh]);

  return apr;
};

export default useFetchMasonryAPR;
