import { useEffect, useState } from 'react';
import useFrostFinance from './../useFrostFinance';
import useRefresh from '../useRefresh';

const useWithdrawCheck = () => {
  const [canWithdraw, setCanWithdraw] = useState(false);
  const frostFinance = useFrostFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = frostFinance?.isUnlocked;

  useEffect(() => {
    async function canUserWithdraw() {
      try {
        setCanWithdraw(await frostFinance.canUserUnstakeFromMasonry());
      } catch (err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
      canUserWithdraw();
    }
  }, [isUnlocked, frostFinance, slowRefresh]);

  return canWithdraw;
};

export default useWithdrawCheck;
