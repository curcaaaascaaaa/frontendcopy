import React, { useMemo } from 'react';
import Page from '../../components/Page';
import HomeImage from '../../assets/img/home-avax.png';
import CashImage from '../../assets/img/crypto_snow_cash.svg';
import Image from 'material-ui-image';
import styled from 'styled-components';
import { Alert } from '@material-ui/lab';
import { createGlobalStyle } from 'styled-components';
import CountUp from 'react-countup';
import CardIcon from '../../components/CardIcon';
import TokenSymbol from '../../components/TokenSymbol';
import useFrostStats from '../../hooks/useFrostStats';
import useLpStats from '../../hooks/useLpStats';
import useModal from '../../hooks/useModal';
import useZap from '../../hooks/useZap';
import useBondStats from '../../hooks/useBondStats';
import usefShareStats from '../../hooks/usefShareStats';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';
import { frost as frostTesting, fShare as fShareTesting } from '../../frost-finance/deployments/deployments.testing.json';
import { frost as frostProd, fShare as fShareProd } from '../../frost-finance/deployments/deployments.mainnet.json';

import MetamaskFox from '../../assets/img/metamask-fox.svg';

import { Box, Button, Card, CardContent, Grid, Paper } from '@material-ui/core';
import ZapModal from '../Bank/components/ZapModal';

import { makeStyles } from '@material-ui/core/styles';
import useFrostFinance from '../../hooks/useFrostFinance';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

const useStyles = makeStyles((theme) => ({
  button: {
    [theme.breakpoints.down('415')]: {
      marginTop: '10px',
    },
  },
}));

const Home = () => {
  const classes = useStyles();
  const TVL = useTotalValueLocked();
  const frostAvaxLpStats = useLpStats('FROST-AVAX-LP');
  const fShareAvaxLpStats = useLpStats('FSHARE-AVAX-LP');
  const frostStats = useFrostStats();
  const fShareStats = usefShareStats();
  const fBondStats = useBondStats();
  const frostFinance = useFrostFinance();

  let frost;
  let fShare;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    frost = frostTesting;
    fShare = fShareTesting;
  } else {
    frost = frostProd;
    fShare = fShareProd;
  }

  const buyFrostAddress = 'https://traderjoexyz.com/swap?outputCurrency=' + frost.address;
  const buyFShareAddress = 'https://traderjoexyz.com/swap?outputCurrency=' + fShare.address;

  const frostLPStats = useMemo(() => (frostAvaxLpStats ? frostAvaxLpStats : null), [frostAvaxLpStats]);
  const fshareLPStats = useMemo(() => (fShareAvaxLpStats ? fShareAvaxLpStats : null), [fShareAvaxLpStats]);
  const frostPriceInDollars = useMemo(
    () => (frostStats ? Number(frostStats.priceInDollars).toFixed(2) : null),
    [frostStats],
  );
  const frostPriceInAVAX = useMemo(() => (frostStats ? Number(frostStats.tokenInAvax).toFixed(4) : null), [frostStats]);
  const frostCirculatingSupply = useMemo(() => (frostStats ? String(frostStats.circulatingSupply) : null), [frostStats]);
  const frostTotalSupply = useMemo(() => (frostStats ? String(frostStats.totalSupply) : null), [frostStats]);

  const fSharePriceInDollars = useMemo(
    () => (fShareStats ? Number(fShareStats.priceInDollars).toFixed(2) : null),
    [fShareStats],
  );
  const fSharePriceInAVAX = useMemo(
    () => (fShareStats ? Number(fShareStats.tokenInAvax).toFixed(4) : null),
    [fShareStats],
  );
  const fShareCirculatingSupply = useMemo(
    () => (fShareStats ? String(fShareStats.circulatingSupply) : null),
    [fShareStats],
  );
  const fShareTotalSupply = useMemo(() => (fShareStats ? String(fShareStats.totalSupply) : null), [fShareStats]);

  const fBondPriceInDollars = useMemo(
    () => (fBondStats ? Number(fBondStats.priceInDollars).toFixed(2) : null),
    [fBondStats],
  );
  const fBondPriceInAVAX = useMemo(() => (fBondStats ? Number(fBondStats.tokenInAvax).toFixed(4) : null), [fBondStats]);
  const fBondCirculatingSupply = useMemo(
    () => (fBondStats ? String(fBondStats.circulatingSupply) : null),
    [fBondStats],
  );
  const fBondTotalSupply = useMemo(() => (fBondStats ? String(fBondStats.totalSupply) : null), [fBondStats]);

  const frostLpZap = useZap({ depositTokenName: 'FROST-AVAX-LP' });
  const fshareLpZap = useZap({ depositTokenName: 'FSHARE-AVAX-LP' });

  const StyledLink = styled.a`
    font-weight: 700;
    text-decoration: none;
  `;

  const [onPresentFrostZap, onDissmissFrostZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        frostLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissFrostZap();
      }}
      tokenName={'FROST-AVAX-LP'}
    />,
  );

  const [onPresentTshareZap, onDissmissTshareZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        fshareLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissTshareZap();
      }}
      tokenName={'FSHARE-AVAX-LP'}
    />,
  );

  return (
    <Page>
      <BackgroundImage />
      <Grid container spacing={3}>
        {/* Logo */}
        <Grid container item xs={12} sm={4} justify="center">
          {/* <Paper>xs=6 sm=3</Paper> */}
          <Image color="none" style={{ width: '300px', paddingTop: '0px' }} src={CashImage} />
        </Grid>
        {/* Explanation text */}
        <Grid item xs={12} sm={8}>
          <Paper>
            <Box p={4}>
              <h2>Welcome to Frost Finance</h2>
              <p>The first algorithmic stablecoin on Avalanche, pegged to the price of 1 AVAX via seigniorage.</p>
              <p>
                Stake your FROST-AVAX LP in the Cabin to earn FSHARE rewards.
                Then stake your earned FSHARE in the Lodge to earn more FROST!
              </p>
            </Box>
          </Paper>



        </Grid>

        <Grid container spacing={3}>
    <Grid item  xs={12} sm={12} justify="center"  style={{ margin: '12px', display: 'flex' }}>
            <Alert variant="filled" severity="warning">
              <b>
      Please visit our <StyledLink target="_blank" href="https://docs.frost.finance">documentation</StyledLink> before purchasing FROST or FSHARE!</b>
            </Alert>
        </Grid>
        </Grid>

        {/* TVL */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent align="center">
              <h2>Total Value Locked</h2>
              <CountUp style={{ fontSize: '25px' }} end={TVL} separator="," prefix="$" />
            </CardContent>
          </Card>
        </Grid>

        {/* Wallet */}
        <Grid item xs={12} sm={8}>
          <Card style={{ height: '100%' }}>
            <CardContent align="center" style={{ marginTop: '2.5%' }}>
              {/* <h2 style={{ marginBottom: '20px' }}>Wallet Balance</h2> */}
              <Button color="primary" href="/masonry" variant="contained" style={{ marginRight: '10px' }}>
                Stake Now
              </Button>
              <Button href="/cabin" variant="contained" style={{ marginRight: '10px' }}>
                Farm Now
              </Button>
              <Button
                color="primary"
                target="_blank"
                href={buyFrostAddress}
                variant="contained"
                style={{ marginRight: '10px' }}
                className={classes.button}
              >
                Buy FROST
              </Button>
              <Button variant="contained" target="_blank" href={buyFShareAddress} className={classes.button}>
                Buy FSHARE
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* FROST */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>FROST</h2>
              <Button
                onClick={() => {
                  frostFinance.watchAssetInMetamask('FROST');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="FROST" />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{frostPriceInAVAX ? frostPriceInAVAX : '-.----'} AVAX</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px', alignContent: 'flex-start' }}>
                  ${frostPriceInDollars ? frostPriceInDollars : '-.--'}
                </span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(frostCirculatingSupply * frostPriceInDollars).toFixed(2)} <br />
                Circulating Supply: {frostCirculatingSupply} <br />
                Total Supply: {frostTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* FSHARE */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>FSHARE</h2>
              <Button
                onClick={() => {
                  frostFinance.watchAssetInMetamask('FSHARE');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="FSHARE" />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{fSharePriceInAVAX ? fSharePriceInAVAX : '-.----'} AVAX</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px' }}>${fSharePriceInDollars ? fSharePriceInDollars : '-.--'}</span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(fShareCirculatingSupply * fSharePriceInDollars).toFixed(2)} <br />
                Circulating Supply: {fShareCirculatingSupply} <br />
                Total Supply: {fShareTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* FBOND */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>FBOND</h2>
              <Button
                onClick={() => {
                  frostFinance.watchAssetInMetamask('FBOND');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="FBOND" />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{fBondPriceInAVAX ? fBondPriceInAVAX : '-.----'} AVAX</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px' }}>${fBondPriceInDollars ? fBondPriceInDollars : '-.--'}</span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(fBondCirculatingSupply * fBondPriceInDollars).toFixed(2)} <br />
                Circulating Supply: {fBondCirculatingSupply} <br />
                Total Supply: {fBondTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent align="center">
              <h2>FROST-AVAX Chilly LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="FROST-AVAX-LP" />
                </CardIcon>
              </Box>
              <Box mt={2}>
                <Button color="primary" onClick={onPresentFrostZap} variant="contained">
                  Zap In
                </Button>
              </Box>
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {frostLPStats?.tokenAmount ? frostLPStats?.tokenAmount : '-.--'} FROST /{' '}
                  {frostLPStats?.avaxAmount ? frostLPStats?.avaxAmount : '-.--'} AVAX
                </span>
              </Box>
              <Box>${frostLPStats?.priceOfOne ? frostLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${frostLPStats?.totalLiquidity ? frostLPStats.totalLiquidity : '-.--'} <br />
                Total supply: {frostLPStats?.totalSupply ? frostLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent align="center">
              <h2>FSHARE-AVAX Chilly LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="FSHARE-AVAX-LP" />
                </CardIcon>
              </Box>
              <Box mt={2}>
                <Button color="primary" onClick={onPresentTshareZap} variant="contained">
                  Zap In
                </Button>
              </Box>
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {fshareLPStats?.tokenAmount ? fshareLPStats?.tokenAmount : '-.--'} FSHARE /{' '}
                  {fshareLPStats?.avaxAmount ? fshareLPStats?.avaxAmount : '-.--'} AVAX
                </span>
              </Box>
              <Box>${fshareLPStats?.priceOfOne ? fshareLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${fshareLPStats?.totalLiquidity ? fshareLPStats.totalLiquidity : '-.--'}
                <br />
                Total supply: {fshareLPStats?.totalSupply ? fshareLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
};

export default Home;
