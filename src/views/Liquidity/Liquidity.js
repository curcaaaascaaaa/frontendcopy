import React, { useMemo, useState } from 'react';
import Page from '../../components/Page';
import { createGlobalStyle } from 'styled-components';
import HomeImage from '../../assets/img/home-avax.png';
import useLpStats from '../../hooks/useLpStats';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import useFrostStats from '../../hooks/useFrostStats';
import TokenInput from '../../components/TokenInput';
import useFrostFinance from '../../hooks/useFrostFinance';
import { useWallet } from 'use-wallet';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';
import useApproveTaxOffice from '../../hooks/useApproveTaxOffice';
import { ApprovalState } from '../../hooks/useApprove';
import useProvideFrostAvaxLP from '../../hooks/useProvideFrostAvaxLP';
import { Alert } from '@material-ui/lab';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
  }
`;
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const ProvideLiquidity = () => {
  const [frostAmount, setFrostAmount] = useState(0);
  const [avaxAmount, setAvaxAmount] = useState(0);
  const [lpTokensAmount, setLpTokensAmount] = useState(0);
  const { balance } = useWallet();
  const frostStats = useFrostStats();
  const frostFinance = useFrostFinance();
  const [approveTaxOfficeStatus, approveTaxOffice] = useApproveTaxOffice();
  const frostBalance = useTokenBalance(frostFinance.FROST);
  const avaxBalance = (balance / 1e18).toFixed(4);
  const { onProvideFrostAvaxLP } = useProvideFrostAvaxLP();
  const frostAvaxLpStats = useLpStats('FROST-AVAX-LP');

  const frostLPStats = useMemo(() => (frostAvaxLpStats ? frostAvaxLpStats : null), [frostAvaxLpStats]);
  const frostPriceInAVAX = useMemo(() => (frostStats ? Number(frostStats.tokenInAvax).toFixed(2) : null), [frostStats]);
  const avaxPriceInFROST = useMemo(() => (frostStats ? Number(1 / frostStats.tokenInAvax).toFixed(2) : null), [frostStats]);
  // const classes = useStyles();

  const handleFrostChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setFrostAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setFrostAmount(e.currentTarget.value);
    const quoteFromTraderJoe = await frostFinance.quoteFromTraderJoe(e.currentTarget.value, 'FROST');
    setAvaxAmount(quoteFromTraderJoe);
    setLpTokensAmount(quoteFromTraderJoe / frostLPStats.avaxAmount);
  };

  const handleAvaxChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setAvaxAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setAvaxAmount(e.currentTarget.value);
    const quoteFromTraderJoe = await frostFinance.quoteFromTraderJoe(e.currentTarget.value, 'AVAX');
    setFrostAmount(quoteFromTraderJoe);

    setLpTokensAmount(quoteFromTraderJoe / frostLPStats.tokenAmount);
  };
  const handleFrostSelectMax = async () => {
    const quoteFromTraderJoe = await frostFinance.quoteFromTraderJoe(getDisplayBalance(frostBalance), 'FROST');
    setFrostAmount(getDisplayBalance(frostBalance));
    setAvaxAmount(quoteFromTraderJoe);
    setLpTokensAmount(quoteFromTraderJoe / frostLPStats.avaxAmount);
  };
  const handleAvaxSelectMax = async () => {
    const quoteFromTraderJoe = await frostFinance.quoteFromTraderJoe(avaxBalance, 'AVAX');
    setAvaxAmount(avaxBalance);
    setFrostAmount(quoteFromTraderJoe);
    setLpTokensAmount(avaxBalance / frostLPStats.avaxAmount);
  };
  return (
    <Page>
      <BackgroundImage />
      <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
        Provide Liquidity
      </Typography>

      <Grid container justify="center">
        <Box style={{ width: '600px' }}>
          <Alert variant="filled" severity="warning" style={{ marginBottom: '10px' }}>
            <b>This and <a href="https://traderjoexyz.com/"  rel="noopener noreferrer" target="_blank">Traderjoe</a> are the only ways to provide Liquidity on FROST-AVAX pair without paying tax.</b>
          </Alert>
          <Grid item xs={12} sm={12}>
            <Paper>
              <Box mt={4}>
                <Grid item xs={12} sm={12} style={{ borderRadius: 15 }}>
                  <Box p={4}>
                    <Grid container>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleFrostSelectMax}
                          onChange={handleFrostChange}
                          value={frostAmount}
                          max={getDisplayBalance(frostBalance)}
                          symbol={'FROST'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleAvaxSelectMax}
                          onChange={handleAvaxChange}
                          value={avaxAmount}
                          max={avaxBalance}
                          symbol={'AVAX'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <p>1 FROST = {frostPriceInAVAX} AVAX</p>
                        <p>1 AVAX = {avaxPriceInFROST} FROST</p>
                        <p>LP tokens ≈ {lpTokensAmount.toFixed(2)}</p>
                      </Grid>
                      <Grid xs={12} justifyContent="center" style={{ textAlign: 'center' }}>
                        {approveTaxOfficeStatus === ApprovalState.APPROVED ? (
                          <Button
                            variant="contained"
                            onClick={() => onProvideFrostAvaxLP(avaxAmount.toString(), frostAmount.toString())}
                            color="primary"
                            style={{ margin: '0 10px', color: '#fff' }}
                          >
                            Supply
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => approveTaxOffice()}
                            color="secondary"
                            style={{ margin: '0 10px' }}
                          >
                            Approve
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Box>
      </Grid>
    </Page>
  );
};

export default ProvideLiquidity;
