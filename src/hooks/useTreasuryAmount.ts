import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useFrostFinance from './useFrostFinance';

const useTreasuryAmount = () => {
  const [amount, setAmount] = useState(BigNumber.from(0));
  const frostFinance = useFrostFinance();

  useEffect(() => {
    if (frostFinance) {
      const { Treasury } = frostFinance.contracts;
      frostFinance.FROST.balanceOf(Treasury.address).then(setAmount);
    }
  }, [frostFinance]);
  return amount;
};

export default useTreasuryAmount;
