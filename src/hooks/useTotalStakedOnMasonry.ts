import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useFrostFinance from './useFrostFinance';
import useRefresh from './useRefresh';

const useTotalStakedOnMasonry = () => {
  const [totalStaked, setTotalStaked] = useState(BigNumber.from(0));
  const frostFinance = useFrostFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = frostFinance?.isUnlocked;

  useEffect(() => {
    async function fetchTotalStaked() {
      try {
        setTotalStaked(await frostFinance.getTotalStakedInMasonry());
      } catch(err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
     fetchTotalStaked();
    }
  }, [isUnlocked, slowRefresh, frostFinance]);

  return totalStaked;
};

export default useTotalStakedOnMasonry;
