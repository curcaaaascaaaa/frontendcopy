import React from 'react';

//Graveyard ecosystem logos
import frostLogo from '../../assets/img/crypto_snow_cash.svg';
import fShareLogo from '../../assets/img/crypto_snow_share.svg';
import frostLogoPNG from '../../assets/img/crypto_frost_cash.f2b44ef4.png';
import fShareLogoPNG from '../../assets/img/crypto_frost_share.bf1a6c52.png';
import fBondLogo from '../../assets/img/crypto_snow_bond.svg';

import frostAvaxLpLogo from '../../assets/img/frost_avax_lp.svg';
import fshareAvaxLpLogo from '../../assets/img/fshare_avax_lp.svg';

import wavaxLogo from '../../assets/img/avalanche_avax_logo.svg';
import joeLogo from '../../assets/img/joe.png';
import zooLogo from '../../assets/img/zoo_logo.svg';
import linkLogo from '../../assets/img/link.png';

const logosBySymbol: { [title: string]: string } = {
  //Real tokens
  //=====================
  FROST: frostLogo,
  FROSTPNG: frostLogoPNG,
  FSHAREPNG: fShareLogoPNG,
  FSHARE: fShareLogo,
  FBOND: fBondLogo,
  WAVAX: wavaxLogo,
  JOE: joeLogo,
  LINK: linkLogo,
  ZOO: zooLogo,
  'FROST-AVAX-LP': frostAvaxLpLogo,
  'FSHARE-AVAX-LP': fshareAvaxLpLogo,
};

type LogoProps = {
  symbol: string;
  size?: number;
};

const TokenSymbol: React.FC<LogoProps> = ({ symbol, size = 64 }) => {
  if (!logosBySymbol[symbol]) {
    throw new Error(`Invalid Token Logo symbol: ${symbol}`);
  }
  return <img src={logosBySymbol[symbol]} alt={`${symbol} Logo`} width={size} height={size} />;
};

export default TokenSymbol;
