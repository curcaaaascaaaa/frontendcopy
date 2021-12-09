import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useStakeToMasonry = () => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      handleTransactionReceipt(frostFinance.stakeShareToMasonry(amount), `Stake ${amount} FSHARE to the masonry`);
    },
    [frostFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStakeToMasonry;
