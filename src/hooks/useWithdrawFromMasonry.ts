import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useWithdrawFromMasonry = () => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleWithdraw = useCallback(
    (amount: string) => {
      handleTransactionReceipt(
        frostFinance.withdrawShareFromMasonry(amount),
        `Withdraw ${amount} FSHARE from the masonry`,
      );
    },
    [frostFinance, handleTransactionReceipt],
  );
  return { onWithdraw: handleWithdraw };
};

export default useWithdrawFromMasonry;
