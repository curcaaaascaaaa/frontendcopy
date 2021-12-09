import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import useFrostFinance from '../../hooks/useFrostFinance';
import { Bank } from '../../frost-finance';
import config, { bankDefinitions } from '../../config';

const Banks: React.FC = ({ children }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const frostFinance = useFrostFinance();
  const isUnlocked = frostFinance?.isUnlocked;

  const fetchPools = useCallback(async () => {
    const banks: Bank[] = [];

    for (const bankInfo of Object.values(bankDefinitions)) {
      if (bankInfo.finished) {
        if (!frostFinance.isUnlocked) continue;

        // only show pools staked by user
        const balance = await frostFinance.stakedBalanceOnBank(
          bankInfo.contract,
          bankInfo.poolId,
          frostFinance.myAccount,
        );
        if (balance.lte(0)) {
          continue;
        }
      }
      banks.push({
        ...bankInfo,
        address: config.deployments[bankInfo.contract].address,
        depositToken: frostFinance.externalTokens[bankInfo.depositTokenName],
        earnToken: bankInfo.earnTokenName === 'FROST' ? frostFinance.FROST : frostFinance.FSHARE,
      });
    }
    banks.sort((a, b) => (a.sort > b.sort ? 1 : -1));
    setBanks(banks);
  }, [frostFinance, setBanks]);

  useEffect(() => {
    if (frostFinance) {
      fetchPools().catch((err) => console.error(`Failed to fetch pools: ${err.stack}`));
    }
  }, [isUnlocked, frostFinance, fetchPools]);

  return <Context.Provider value={{ banks }}>{children}</Context.Provider>;
};

export default Banks;
