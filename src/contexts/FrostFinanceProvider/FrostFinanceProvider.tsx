import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import FrostFinance from '../../frost-finance';
import config from '../../config';

export interface FrostFinanceContext {
  frostFinance?: FrostFinance;
}

export const Context = createContext<FrostFinanceContext>({ frostFinance: null });

export const FrostFinanceProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [frostFinance, setFrostFinance] = useState<FrostFinance>();

  useEffect(() => {
    if (!frostFinance) {
      const frost = new FrostFinance(config);
      if (account) {
        // wallet was unlocked at initialization
        frost.unlockWallet(ethereum, account);
      }
      setFrostFinance(frost);
    } else if (account) {
      frostFinance.unlockWallet(ethereum, account);
    }
  }, [account, ethereum, frostFinance]);

  return <Context.Provider value={{ frostFinance }}>{children}</Context.Provider>;
};
