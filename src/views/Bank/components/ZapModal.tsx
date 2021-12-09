import React, { useState, useMemo } from 'react';

import { Button, Select, MenuItem, InputLabel, Typography, withStyles } from '@material-ui/core';
// import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal';
import ModalActions from '../../../components/ModalActions';
import ModalTitle from '../../../components/ModalTitle';
import TokenInput from '../../../components/TokenInput';
import styled from 'styled-components';

import { getDisplayBalance } from '../../../utils/formatBalance';
import Label from '../../../components/Label';
import useLpStats from '../../../hooks/useLpStats';
import useTokenBalance from '../../../hooks/useTokenBalance';
import useFrostFinance from '../../../hooks/useFrostFinance';
import { useWallet } from 'use-wallet';
import useApproveZapper, { ApprovalState } from '../../../hooks/useApproveZapper';
import { FROST_TICKER, FSHARE_TICKER, AVAX_TICKER } from '../../../utils/constants';
import { Alert } from '@material-ui/lab';

interface ZapProps extends ModalProps {
  onConfirm: (zapAsset: string, lpName: string, amount: string) => void;
  tokenName?: string;
  decimals?: number;
}

const ZapModal: React.FC<ZapProps> = ({ onConfirm, onDismiss, tokenName = '', decimals = 18 }) => {
  const frostFinance = useFrostFinance();
  const { balance } = useWallet();
  const avaxBalance = (Number(balance) / 1e18).toFixed(4).toString();
  const frostBalance = useTokenBalance(frostFinance.FROST);
  const fshareBalance = useTokenBalance(frostFinance.FSHARE);
  const [val, setVal] = useState('');
  const [zappingToken, setZappingToken] = useState(AVAX_TICKER);
  const [zappingTokenBalance, setZappingTokenBalance] = useState(avaxBalance);
  const [estimate, setEstimate] = useState({ token0: '0', token1: '0' }); // token0 will always be AVAX in this case
  const [approveZapperStatus, approveZapper] = useApproveZapper(zappingToken);
  const frostAvaxLpStats = useLpStats('FROST-AVAX-LP');
  const fShareAvaxLpStats = useLpStats('FSHARE-AVAX-LP');
  const frostLPStats = useMemo(() => (frostAvaxLpStats ? frostAvaxLpStats : null), [frostAvaxLpStats]);
  const fshareLPStats = useMemo(() => (fShareAvaxLpStats ? fShareAvaxLpStats : null), [fShareAvaxLpStats]);
  const avaxAmountPerLP = tokenName.startsWith(FROST_TICKER) ? frostLPStats?.avaxAmount : fshareLPStats?.avaxAmount;
  /**
   * Checks if a value is a valid number or not
   * @param n is the value to be evaluated for a number
   * @returns
   */
  function isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  const handleChangeAsset = (event: any) => {
    const value = event.target.value;
    setZappingToken(value);
    setZappingTokenBalance(avaxBalance);
    if (event.target.value === FSHARE_TICKER) {
      setZappingTokenBalance(getDisplayBalance(fshareBalance, decimals));
    }
    if (event.target.value === FROST_TICKER) {
      setZappingTokenBalance(getDisplayBalance(frostBalance, decimals));
    }
  };

  const handleChange = async (e: any) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setVal(e.currentTarget.value);
      setEstimate({ token0: '0', token1: '0' });
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setVal(e.currentTarget.value);
    const estimateZap = await frostFinance.estimateZapIn(zappingToken, tokenName, String(e.currentTarget.value));
    setEstimate({ token0: estimateZap[0].toString(), token1: estimateZap[1].toString() });
  };

  const handleSelectMax = async () => {
    setVal(zappingTokenBalance);
    const estimateZap = await frostFinance.estimateZapIn(zappingToken, tokenName, String(zappingTokenBalance));
    setEstimate({ token0: estimateZap[0].toString(), token1: estimateZap[1].toString() });
  };

  return (
    <Modal>
      <ModalTitle text={`Zap in ${tokenName}`} />
      <Typography variant="h6" align="center">
        Powered by{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://mlnl.finance">
          mlnl.finance
        </a>
      </Typography>

      <StyledActionSpacer />
      <InputLabel style={{ color: '#be0011' }} id="label">
        Select asset to zap with
      </InputLabel>
      <Select
        onChange={handleChangeAsset}
        style={{ color: '#be0011' }}
        labelId="label"
        id="select"
        value={zappingToken}
      >
        <StyledMenuItem value={AVAX_TICKER}>AVAX</StyledMenuItem>
        <StyledMenuItem value={FSHARE_TICKER}>FSHARE</StyledMenuItem>
        {/* Frost as an input for zapping will be disabled due to issues occuring with the Gatekeeper system */}
        {/* <StyledMenuItem value={FROST_TICKER}>FROST</StyledMenuItem> */}
      </Select>
      <TokenInput
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        value={val}
        max={zappingTokenBalance}
        symbol={zappingToken}
      />
      <Label text="Zap Estimations" />
      <StyledDescriptionText>
        {' '}
        {tokenName}: {Number(estimate.token0) / Number(avaxAmountPerLP)}
      </StyledDescriptionText>
      <StyledDescriptionText>
        {' '}
        ({Number(estimate.token0)} {AVAX_TICKER} / {Number(estimate.token1)}{' '}
        {tokenName.startsWith(FROST_TICKER) ? FROST_TICKER : FSHARE_TICKER}){' '}
      </StyledDescriptionText>
      <ModalActions>
        <Button
          color="primary"
          variant="contained"
          onClick={() =>
            approveZapperStatus !== ApprovalState.APPROVED ? approveZapper() : onConfirm(zappingToken, tokenName, val)
          }
        >
          {approveZapperStatus !== ApprovalState.APPROVED ? 'Approve' : "Let's go"}
        </Button>
      </ModalActions>

      <StyledActionSpacer />
      <Alert variant="filled" severity="warning">
        Beta feature. Use at your own risk!
      </Alert>
    </Modal>
  );
};

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledDescriptionText = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 22px;
  justify-content: flex-start;
`;
const StyledMenuItem = withStyles({
  root: {
    backgroundColor: 'white',
    color: '#be0011',
    '&:hover': {
      backgroundColor: 'grey',
      color: '#be0011',
    },
    selected: {
      backgroundColor: 'black',
    },
  },
})(MenuItem);

export default ZapModal;
