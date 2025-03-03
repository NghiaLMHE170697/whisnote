import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import React from 'react';
import LogoDarkText from '../../assets/images/logos/logo-text.png';
import { ReactComponent as LogoWhiteIcon } from '../../assets/images/logos/logo.svg';
import LogoWhiteText from '../../assets/images/logos/logo-light-text.png';


const HorizontalLogo = () => {
  const isDarkMode = useSelector((state) => state.customizer.isDark);
  const activetopbarBg = useSelector((state) => state.customizer.topbarBg);
  return (
    <Link to="/" className="d-flex align-items-center gap-2">
      {isDarkMode || activetopbarBg !== 'white' ? (
        <>
          <LogoWhiteIcon width="50px" />
          <img src={LogoWhiteText} className="d-none d-lg-block" alt='logo-text' />
        </>
      ) : (
        <>
          <LogoWhiteIcon width="50px" />
          <img src={LogoDarkText} className="d-none d-lg-block" alt='logo-text' />
        </>
      )}
    </Link>
  );
};

export default HorizontalLogo;
