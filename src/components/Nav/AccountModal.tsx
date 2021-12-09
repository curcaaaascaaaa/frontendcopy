import React, { useMemo } from 'react';
import styled from 'styled-components';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';

import Label from '../Label';
import Modal, { ModalProps } from '../Modal';
import ModalTitle from '../ModalTitle';
import useFrostFinance from '../../hooks/useFrostFinance';
import TokenSymbol from '../TokenSymbol';

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const frostFinance = useFrostFinance();

  const frostBalance = useTokenBalance(frostFinance.FROST);
  const displayFrostBalance = useMemo(() => getDisplayBalance(frostBalance), [frostBalance]);

  const fshareBalance = useTokenBalance(frostFinance.FSHARE);
  const displayFshareBalance = useMemo(() => getDisplayBalance(fshareBalance), [fshareBalance]);

  const fbondBalance = useTokenBalance(frostFinance.FBOND);
  const displayFbondBalance = useMemo(() => getDisplayBalance(fbondBalance), [fbondBalance]);

  // const avaxBalance = useTokenBalance(frostFinance.AVAX);
  // const displayAvaxBalance = useMemo(() => getDisplayBalance(avaxBalance), [avaxBalance]);

  return (
    <Modal>
      <ModalTitle text="My Wallet" />

      <Balances>
        <StyledBalanceWrapper>
          <TokenSymbol symbol="FROST" />
          <StyledBalance>
            <StyledValue>{displayFrostBalance}</StyledValue>
            <Label text="FROST Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="FSHARE" />
          <StyledBalance>
            <StyledValue>{displayFshareBalance}</StyledValue>
            <Label text="FSHARE Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="FBOND" />
          <StyledBalance>
            <StyledValue>{displayFbondBalance}</StyledValue>
            <Label text="FBOND Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        {/* <StyledBalanceWrapper>
          <TokenSymbol symbol="WAVAX" />
          <StyledBalance>
            <StyledValue>{displayAvaxBalance}</StyledValue>
            <Label text="AVAX Available" />
          </StyledBalance>
        </StyledBalanceWrapper> */}
      </Balances>
    </Modal>
  );
};

const StyledValue = styled.div`
  //color: ${(props) => props.theme.color.grey[300]};
  font-size: 30px;
  font-weight: 700;
`;

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const Balances = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`;

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 ${(props) => props.theme.spacing[3]}px;
`;

export default AccountModal;
