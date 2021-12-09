import { useCallback } from 'react';
import useFrostFinance from '../useFrostFinance';
import useHandleTransactionReceipt from '../useHandleTransactionReceipt';
// import { BigNumber } from "ethers";
import { parseUnits } from 'ethers/lib/utils';


const useSwapFBondToFShare = () => {
  const frostFinance = useFrostFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapFShare = useCallback(
  	(fbondAmount: string) => {
	  	const fbondAmountBn = parseUnits(fbondAmount, 18);
	  	handleTransactionReceipt(
	  		frostFinance.swapFBondToFShare(fbondAmountBn),
	  		`Swap ${fbondAmount} FBond to FShare`
	  	);
  	},
  	[frostFinance, handleTransactionReceipt]
  );
  return { onSwapFShare: handleSwapFShare };
};

export default useSwapFBondToFShare;