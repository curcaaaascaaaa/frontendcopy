import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import { Bank } from '../frost-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useZap = (bank: Bank) => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleZap = useCallback(
    (zappingToken: string, tokenName: string, amount: string) => {
      handleTransactionReceipt(
        frostFinance.zapIn(zappingToken, tokenName, amount),
        `Zap ${amount} in ${bank.depositTokenName}.`,
      );
    },
    [bank, frostFinance, handleTransactionReceipt],
  );
  return { onZap: handleZap };
};

export default useZap;
