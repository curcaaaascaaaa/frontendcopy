import React, { /*useCallback, useEffect, */useMemo, useState } from 'react';
import Page from '../../components/Page';
import PitImage from '../../assets/img/pit.png';
import { createGlobalStyle } from 'styled-components';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useWallet } from 'use-wallet';
import UnlockWallet from '../../components/UnlockWallet';
import PageHeader from '../../components/PageHeader';
import { Box,/* Paper, Typography,*/ Button, Grid } from '@material-ui/core';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import useFrostFinance from '../../hooks/useFrostFinance';
import { getDisplayBalance/*, getBalance*/ } from '../../utils/formatBalance';
import { BigNumber/*, ethers*/ } from 'ethers';
import useSwapFBondToFShare from '../../hooks/FShareSwapper/useSwapFBondToFShare';
import useApprove, { ApprovalState } from '../../hooks/useApprove';
import useFShareSwapperStats from '../../hooks/FShareSwapper/useFShareSwapperStats';
import TokenInput from '../../components/TokenInput';
import Card from '../../components/Card';
import CardContent from '../../components/CardContent';
import TokenSymbol from '../../components/TokenSymbol';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${PitImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const Sbs: React.FC = () => {
  const { path } = useRouteMatch();
  const { account } = useWallet();
  const frostFinance = useFrostFinance();
  const [fbondAmount, setFbondAmount] = useState('');
  const [fshareAmount, setFshareAmount] = useState('');

  const [approveStatus, approve] = useApprove(frostFinance.FBOND, frostFinance.contracts.FShareSwapper.address);
  const { onSwapFShare } = useSwapFBondToFShare();
  const fshareSwapperStat = useFShareSwapperStats(account);

  const fshareBalance = useMemo(() => (fshareSwapperStat ? Number(fshareSwapperStat.fshareBalance) : 0), [fshareSwapperStat]);
  const bondBalance = useMemo(() => (fshareSwapperStat ? Number(fshareSwapperStat.fbondBalance) : 0), [fshareSwapperStat]);

  const handleFBondChange = async (e: any) => {
    if (e.currentTarget.value === '') {
      setFbondAmount('');
      setFshareAmount('');
      return
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setFbondAmount(e.currentTarget.value);
    const updateFShareAmount = await frostFinance.estimateAmountOfFShare(e.currentTarget.value);
    setFshareAmount(updateFShareAmount);  
  };

  const handleFBondSelectMax = async () => {
    setFbondAmount(String(bondBalance));
    const updateFShareAmount = await frostFinance.estimateAmountOfFShare(String(bondBalance));
    setFshareAmount(updateFShareAmount); 
  };

  const handleFShareSelectMax = async () => {
    setFshareAmount(String(fshareBalance));
    const rateFSharePerFrost = (await frostFinance.getFShareSwapperStat(account)).rateFSharePerFrost;
    const updateFBondAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(rateFSharePerFrost))).mul(Number(fshareBalance) * 1e6);
    setFbondAmount(getDisplayBalance(updateFBondAmount, 18, 6));
  };

  const handleFShareChange = async (e: any) => {
    const inputData = e.currentTarget.value;
    if (inputData === '') {
      setFshareAmount('');
      setFbondAmount('');
      return
    }
    if (!isNumeric(inputData)) return;
    setFshareAmount(inputData);
    const rateFSharePerFrost = (await frostFinance.getFShareSwapperStat(account)).rateFSharePerFrost;
    const updateFBondAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(rateFSharePerFrost))).mul(Number(inputData) * 1e6);
    setFbondAmount(getDisplayBalance(updateFBondAmount, 18, 6));
  }

  return (
    <Switch>
      <Page>
        <BackgroundImage />
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader icon={'🏦'} title="FBond -> FShare Swap" subtitle="Swap FBond to FShare" />
            </Route>
            <Box mt={5}>
              <Grid container justify="center" spacing={6}>
                <StyledBoardroom>
                  <StyledCardsWrapper>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>FBonds</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={frostFinance.FBOND.symbol} size={54} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handleFBondSelectMax}
                                onChange={handleFBondChange}
                                value={fbondAmount}
                                max={bondBalance}
                                symbol="FBond"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${bondBalance} FBOND Available in Wallet`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
                    </StyledCardWrapper>
                    <Spacer size="lg"/>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>FShare</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={frostFinance.FSHARE.symbol} size={54} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handleFShareSelectMax}
                                onChange={handleFShareChange}
                                value={fshareAmount}
                                max={fshareBalance}
                                symbol="FShare"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${fshareBalance} FSHARE Available in Swapper`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
              
                    </StyledCardWrapper>
                  </StyledCardsWrapper>
                </StyledBoardroom>
              </Grid>
            </Box>

            <Box mt={5}>
              <Grid container justify="center">
                <Grid item xs={8}>
                  <Card>
                    <CardContent>
                      <StyledApproveWrapper>
                      {approveStatus !== ApprovalState.APPROVED ? (
                        <Button
                          disabled={approveStatus !== ApprovalState.NOT_APPROVED}
                          color="primary"
                          variant="contained"
                          onClick={approve}
                          size="medium"
                        >
                          Approve FBOND
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => onSwapFShare(fbondAmount.toString())}
                          size="medium"
                        >
                          Swap
                        </Button>
                      )}
                      </StyledApproveWrapper>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <UnlockWallet />
        )}
      </Page>
    </Switch>
  );
};

const StyledBoardroom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledApproveWrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
`;
const StyledCardTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: 20px;
  font-weight: 700;
  height: 64px;
  justify-content: center;
  margin-top: ${(props) => -props.theme.spacing[3]}px;
`;

const StyledCardIcon = styled.div`
  background-color: ${(props) => props.theme.color.grey[900]};
  width: 72px;
  height: 72px;
  border-radius: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
`;

const StyledExchanger = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[5]}px;
`;

const StyledToken = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-weight: 600;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledDesc = styled.span``;

export default Sbs;
