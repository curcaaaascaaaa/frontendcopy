import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import { BigNumber } from 'ethers';
import useRefresh from './useRefresh';

const useCurrentEpoch = () => {
  const [currentEpoch, setCurrentEpoch] = useState<BigNumber>(BigNumber.from(0));
  const frostFinance = useFrostFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchCurrentEpoch () {
      try {
        setCurrentEpoch(await frostFinance.getCurrentEpoch());
      } catch(err) {
        console.error(err);
      }
    }
    fetchCurrentEpoch();
  }, [setCurrentEpoch, frostFinance, slowRefresh]);

  return currentEpoch;
};

export default useCurrentEpoch;
