import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { Bank } from '../frost-finance';

const useHarvest = (bank: Bank) => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(
      frostFinance.harvest(bank.contract, bank.poolId),
      `Claim ${bank.earnTokenName} from ${bank.contract}`,
    );
  }, [bank, frostFinance, handleTransactionReceipt]);

  return { onReward: handleReward };
};

export default useHarvest;
