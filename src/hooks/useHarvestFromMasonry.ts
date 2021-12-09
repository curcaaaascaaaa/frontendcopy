import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useHarvestFromMasonry = () => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(frostFinance.harvestCashFromMasonry(), 'Claim FROST from Masonry');
  }, [frostFinance, handleTransactionReceipt]);

  return { onReward: handleReward };
};

export default useHarvestFromMasonry;
