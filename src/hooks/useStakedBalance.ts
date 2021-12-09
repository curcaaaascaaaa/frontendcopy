import { useCallback, useEffect, useState } from 'react';

import { BigNumber } from 'ethers';
import useFrostFinance from './useFrostFinance';
import { ContractName } from '../frost-finance';
import config from '../config';

const useStakedBalance = (poolName: ContractName, poolId: Number) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const frostFinance = useFrostFinance();
  const isUnlocked = frostFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await frostFinance.stakedBalanceOnBank(poolName, poolId, frostFinance.myAccount);
    setBalance(balance);
  }, [poolName, poolId, frostFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [isUnlocked, poolName, setBalance, frostFinance, fetchBalance]);

  return balance;
};

export default useStakedBalance;
