import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeemOnMasonry = (description?: string) => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    const alertDesc = description || 'Redeem FSHARE from Masonry';
    handleTransactionReceipt(frostFinance.exitFromMasonry(), alertDesc);
  }, [frostFinance, description, handleTransactionReceipt]);
  return { onRedeem: handleRedeem };
};

export default useRedeemOnMasonry;
