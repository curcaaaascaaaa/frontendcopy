import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import { Bank } from '../frost-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeem = (bank: Bank) => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    handleTransactionReceipt(frostFinance.exit(bank.contract, bank.poolId), `Redeem ${bank.contract}`);
  }, [bank, frostFinance, handleTransactionReceipt]);

  return { onRedeem: handleRedeem };
};

export default useRedeem;
