import { useEffect, useState } from 'react';
import useRefresh from '../useRefresh';
import useFrostFinance from './../useFrostFinance';

const useClaimRewardCheck = () => {
  const  { slowRefresh } = useRefresh();
  const [canClaimReward, setCanClaimReward] = useState(false);
  const frostFinance = useFrostFinance();
  const isUnlocked = frostFinance?.isUnlocked;

  useEffect(() => {
    async function canUserClaimReward() {
      try {
        setCanClaimReward(await frostFinance.canUserClaimRewardFromMasonry());
      } catch(err){
        console.error(err);
      };
    }
    if (isUnlocked) {
      canUserClaimReward();
    }
  }, [isUnlocked, slowRefresh, frostFinance]);

  return canClaimReward;
};

export default useClaimRewardCheck;
