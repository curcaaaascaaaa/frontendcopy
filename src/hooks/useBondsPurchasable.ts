import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../frost-finance/ERC20';
import useFrostFinance from './useFrostFinance';
import config from '../config';

const useBondsPurchasable = () => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const frostFinance = useFrostFinance();

  useEffect(() => {
    async function fetchBondsPurchasable() {
        try {
            setBalance(await frostFinance.gefBondsPurchasable());
        }
        catch(err) {
            console.error(err);
        }
      }
    fetchBondsPurchasable();
  }, [setBalance, frostFinance]);

  return balance;
};

export default useBondsPurchasable;
