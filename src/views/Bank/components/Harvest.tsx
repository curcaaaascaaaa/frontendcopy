import React, { useMemo } from 'react';
import styled from 'styled-components';

import { Button, Card, CardContent } from '@material-ui/core';
// import Button from '../../../components/Button';
// import Card from '../../../components/Card';
// import CardContent from '../../../components/CardContent';
import CardIcon from '../../../components/CardIcon';
import Label from '../../../components/Label';
import Value from '../../../components/Value';

import useEarnings from '../../../hooks/useEarnings';
import useHarvest from '../../../hooks/useHarvest';

import { getDisplayBalance } from '../../../utils/formatBalance';
import TokenSymbol from '../../../components/TokenSymbol';
import { Bank } from '../../../frost-finance';
import useFrostStats from '../../../hooks/useFrostStats';
import useShareStats from '../../../hooks/usefShareStats';

interface HarvestProps {
  bank: Bank;
}

const Harvest: React.FC<HarvestProps> = ({ bank }) => {
  const earnings = useEarnings(bank.contract, bank.earnTokenName, bank.poolId);
  const { onReward } = useHarvest(bank);
  const frostStats = useFrostStats();
  const fShareStats = useShareStats();

  const tokenName = bank.earnTokenName === 'FSHARE' ? 'FSHARE' : 'FROST';
  const tokenStats = bank.earnTokenName === 'FSHARE' ? fShareStats : frostStats;
  const tokenPriceInDollars = useMemo(
    () => (tokenStats ? Number(tokenStats.priceInDollars).toFixed(2) : null),
    [tokenStats],
  );
  const earnedInDollars = (Number(tokenPriceInDollars) * Number(getDisplayBalance(earnings))).toFixed(2);
  return (
    <Card>
      <CardContent>
        <StyledCardContentInner>
          <StyledCardHeader>
            <CardIcon>
              <TokenSymbol symbol={bank.earnToken.symbol} />
            </CardIcon>
            <Value value={getDisplayBalance(earnings)} />
            <Label text={`≈ $${earnedInDollars}`} />
            <Label text={`${tokenName} Earned`} />
          </StyledCardHeader>
          <StyledCardActions>
            <Button onClick={onReward} disabled={earnings.eq(0)} color="primary" variant="contained">
              Claim
            </Button>
          </StyledCardActions>
        </StyledCardContentInner>
      </CardContent>
    </Card>
  );
};

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

export default Harvest;
