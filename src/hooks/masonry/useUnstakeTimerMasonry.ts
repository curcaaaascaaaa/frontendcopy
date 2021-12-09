import { useEffect, useState } from 'react';
import useFrostFinance from './../useFrostFinance';
import { AllocationTime } from '../../frost-finance/types';

const useUnstakeTimerMasonry = () => {
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const frostFinance = useFrostFinance();

  useEffect(() => {
    if (frostFinance) {
      frostFinance.getUserUnstakeTime().then(setTime);
    }
  }, [frostFinance]);
  return time;
};

export default useUnstakeTimerMasonry;
