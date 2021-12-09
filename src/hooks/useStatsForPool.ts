import { useCallback, useState, useEffect } from 'react';
import useFrostFinance from './useFrostFinance';
import { Bank } from '../frost-finance';
import { PoolStats } from '../frost-finance/types';
import config from '../config';

const useStatsForPool = (bank: Bank) => {
  const frostFinance = useFrostFinance();

  const [poolAPRs, setPoolAPRs] = useState<PoolStats>();

  const fetchAPRsForPool = useCallback(async () => {
    setPoolAPRs(await frostFinance.getPoolAPRs(bank));
  }, [frostFinance, bank]);

  useEffect(() => {
    fetchAPRsForPool().catch((err) => console.error(`Failed to fetch FBOND price: ${err.stack}`));
    const refreshInterval = setInterval(fetchAPRsForPool, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPoolAPRs, frostFinance, fetchAPRsForPool]);

  return poolAPRs;
};

export default useStatsForPool;
