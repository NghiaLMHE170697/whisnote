import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import React from 'react';
import LogoDarkText from '../../assets/images/logos/logo-text.png';
import { ReactComponent as LogoWhiteIcon } from '../../assets/images/logos/logo.svg';
import LogoWhiteText from '../../assets/images/logos/logo-light-text.png';

const Logo = () => {
  const isDarkMode = useSelector((state) => state.customizer.isDark);
  const toggleMiniSidebar = useSelector((state) => state.customizer.isMiniSidebar);
  const activeSidebarBg = useSelector((state) => state.customizer.sidebarBg);
  return (
    <Link to="/" className="d-flex align-items-center gap-2">
      {isDarkMode || activeSidebarBg !== 'white' ? (
        <>
          <LogoWhiteIcon width="50px" />
          {toggleMiniSidebar ? '' : <img src={LogoWhiteText} className="d-none d-lg-block" alt='logo-text' />}
        </>
      ) : (
        <>
          <LogoWhiteIcon width="50px"/>
          {toggleMiniSidebar ? '' : <img src={LogoDarkText} className="d-none d-lg-block" alt='logo-text' />}
        </>
      )}
    </Link>
  );
};

export default Logo;
