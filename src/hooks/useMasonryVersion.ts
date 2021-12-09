import { useCallback, useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import useStakedBalanceOnMasonry from './useStakedBalanceOnMasonry';

const useMasonryVersion = () => {
  const [masonryVersion, setMasonryVersion] = useState('latest');
  const frostFinance = useFrostFinance();
  const stakedBalance = useStakedBalanceOnMasonry();

  const updateState = useCallback(async () => {
    setMasonryVersion(await frostFinance.fetchMasonryVersionOfUser());
  }, [frostFinance?.isUnlocked, stakedBalance]);

  useEffect(() => {
    if (frostFinance?.isUnlocked) {
      updateState().catch((err) => console.error(err.stack));
    }
  }, [frostFinance?.isUnlocked, stakedBalance]);

  return masonryVersion;
};

export default useMasonryVersion;
