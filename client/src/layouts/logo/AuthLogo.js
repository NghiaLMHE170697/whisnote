import React from 'react';
import { useSelector } from 'react-redux';

import LogoDarkText from '../../assets/images/logos/logo-text.png';
import { ReactComponent as LogoWhiteIcon } from '../../assets/images/logos/logo.svg';
import LogoWhiteText from '../../assets/images/logos/logo-light-text.png';

const AuthLogo = () => {
  const isDarkMode = useSelector((state) => state.customizer.isDark);

  return (
    <div className="p-4 d-flex justify-content-center gap-2">
      {isDarkMode !== false ? (
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
    </div>
  );
};

export default AuthLogo;
