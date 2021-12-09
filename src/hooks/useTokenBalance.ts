import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../frost-finance/ERC20';
import useFrostFinance from './useFrostFinance';
import config from '../config';

const useTokenBalance = (token: ERC20) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const frostFinance = useFrostFinance();
  const isUnlocked = frostFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    setBalance(await token.balanceOf(frostFinance.myAccount));
  }, [token, frostFinance.myAccount]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(`Failed to fetch token balance: ${err.stack}`));
      let refreshInterval = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [isUnlocked, token, fetchBalance, frostFinance]);

  return balance;
};

export default useTokenBalance;
