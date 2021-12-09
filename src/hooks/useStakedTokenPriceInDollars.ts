import { useCallback, useEffect, useState } from 'react';

import useFrostFinance from './useFrostFinance';
import config from '../config';
import ERC20 from '../frost-finance/ERC20';

const useStakedTokenPriceInDollars = (stakedTokenName: string, stakedToken: ERC20) => {
  const [stakedTokenPriceInDollars, setStakedTokenPriceInDollars] = useState('0');
  const frostFinance = useFrostFinance();
  const isUnlocked = frostFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await frostFinance.getDepositTokenPriceInDollars(stakedTokenName, stakedToken);
    setStakedTokenPriceInDollars(balance);
  }, [stakedToken, stakedTokenName, frostFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshStakedTokenPriceInDollars = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshStakedTokenPriceInDollars);
    }
  }, [isUnlocked, setStakedTokenPriceInDollars, frostFinance, fetchBalance]);

  return stakedTokenPriceInDollars;
};

export default useStakedTokenPriceInDollars;
