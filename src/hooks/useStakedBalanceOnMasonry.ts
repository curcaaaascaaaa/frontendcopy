import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useFrostFinance from './useFrostFinance';
import useRefresh from './useRefresh';

const useStakedBalanceOnMasonry = () => {
  const { slowRefresh } = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const frostFinance = useFrostFinance();
  const isUnlocked = frostFinance?.isUnlocked;
  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await frostFinance.getStakedSharesOnMasonry());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [slowRefresh, isUnlocked, frostFinance]);
  return balance;
};

export default useStakedBalanceOnMasonry;
