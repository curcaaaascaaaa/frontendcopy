import { useContext } from 'react';
import { Context } from '../contexts/FrostFinanceProvider';

const useFrostFinance = () => {
  const { frostFinance } = useContext(Context);
  return frostFinance;
};

export default useFrostFinance;
