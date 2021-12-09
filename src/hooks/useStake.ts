import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import { Bank } from '../frost-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';

const useStake = (bank: Bank) => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      const amountBn = parseUnits(amount, bank.depositToken.decimal);
      handleTransactionReceipt(
        frostFinance.stake(bank.contract, bank.poolId, amountBn),
        `Stake ${amount} ${bank.depositTokenName} to ${bank.contract}`,
      );
    },
    [bank, frostFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStake;
