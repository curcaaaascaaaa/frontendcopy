import { useEffect, useState } from 'react';
import useFrostFinance from './useFrostFinance';
import { AllocationTime } from '../frost-finance/types';
import useRefresh from './useRefresh';


const useTreasuryAllocationTimes = () => {
  const { slowRefresh } = useRefresh();
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const frostFinance = useFrostFinance();
  useEffect(() => {
    if (frostFinance) {
      frostFinance.getTreasuryNextAllocationTime().then(setTime);
    }
  }, [frostFinance, slowRefresh]);
  return time;
};

export default useTreasuryAllocationTimes;
