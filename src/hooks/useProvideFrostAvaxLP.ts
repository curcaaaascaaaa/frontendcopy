import { useCallback } from 'react';
import useFrostFinance from './useFrostFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from '../utils/constants'

const useProvideFrostAvaxLP = () => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideFrostAvaxLP = useCallback(
    (avaxAmount: string, frostAmount: string) => {
      const frostAmountBn = parseUnits(frostAmount);
      handleTransactionReceipt(
        frostFinance.provideFrostAvaxLP(avaxAmount, frostAmountBn),
        `Provide Frost-AVAX LP ${frostAmount} ${avaxAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [frostFinance, handleTransactionReceipt],
  );
  return { onProvideFrostAvaxLP: handleProvideFrostAvaxLP };
};

export default useProvideFrostAvaxLP;
