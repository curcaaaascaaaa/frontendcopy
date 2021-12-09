import { useCallback, useEffect, useState } from 'react';
import useFrostFinance from '../useFrostFinance';
import { useWallet } from 'use-wallet';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

const useEstimateFShare = (fbondAmount: string) => {
  const [estimateAmount, setEstimateAmount] = useState<string>('');
  const { account } = useWallet();
  const frostFinance = useFrostFinance();

  const estimateAmountOfFShare = useCallback(async () => {
    const fbondAmountBn = parseUnits(fbondAmount);
    const amount = await frostFinance.estimateAmountOfFShare(fbondAmountBn.toString());
    setEstimateAmount(amount);
  }, [account]);

  useEffect(() => {
    if (account) {
      estimateAmountOfFShare().catch((err) => console.error(`Failed to get estimateAmountOfFShare: ${err.stack}`));
    }
  }, [account, estimateAmountOfFShare]);

  return estimateAmount;
};

export default useEstimateFShare;