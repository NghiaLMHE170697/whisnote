import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Navbar,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  Button,
  Badge
} from 'reactstrap';
import { ArrowUpRight, CheckCircle } from 'react-feather';
import * as Icon from 'react-feather';
import user1 from '../../assets/images/users/user4.jpg';
import { ToggleMiniSidebar, ToggleMobileSidebar } from '../../store/customizer/CustomizerSlice';
import ProfileDD from './ProfileDD';
import Logo from '../logo/Logo';

const Header = () => {
  const isDarkMode = useSelector((state) => state.customizer.isDark);
  const topbarColor = useSelector((state) => state.customizer.topbarBg);
  const dispatch = useDispatch();
  const avatar = localStorage.getItem('avatar') ? localStorage.getItem('avatar') : user1;
  const [role, setUserRole] = useState(localStorage.getItem('role') || 'free');
  const nav = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('role') || 'free');
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Also check on mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('role');
    window.location.href = '/auth/login';
  }

  return (
    <Navbar
      color={topbarColor}
      dark={!isDarkMode}
      light={isDarkMode}
      expand="lg"
      className="topbar"
    >
      {/******************************/}
      {/**********Toggle Buttons**********/}
      {/******************************/}
      <div className="d-flex align-items-center">
        <Button
          color={topbarColor}
          className="d-none d-lg-block"
          onClick={() => dispatch(ToggleMiniSidebar())}
        >
          <Icon.Menu size={22} />
        </Button>
        <div href="/" className="d-sm-flex d-lg-none">
          <Logo />
        </div>
        <Button
          color={topbarColor}
          className="d-sm-block d-lg-none"
          onClick={() => dispatch(ToggleMobileSidebar())}
        >
          <Icon.Menu size={22} />
        </Button>
      </div>

      {/******************************/}
      {/**********Left Nav Bar**********/}
      {/******************************/}

      <Nav className="me-auto d-none d-lg-flex" navbar>

      </Nav>

      <div className="d-flex align-items-center">
        {role === 'free' ? (
          <Button
            color={topbarColor}
            className="me-2 d-flex align-items-center"
            onClick={() => nav('/pricing')} // Replace with your pricing page route
          >
            <span className="me-1">Đăng ký gói trả phí</span>
            <ArrowUpRight size={16} />
          </Button>
        ) : (
          <Badge color="success" className="me-2 d-flex align-items-center">
            <CheckCircle size={16} className="me-1" />
            Premium
          </Badge>
        )}
        {/******************************/}
        {/**********Notification DD**********/}
        {/******************************/}
        {/* <UncontrolledDropdown>
          <DropdownToggle color={topbarColor}>
            <Icon.Bell size={22} />
          </DropdownToggle>
          <DropdownMenu className="ddWidth">
            <DropdownItem header>
              <span className="mb-0 fs-5 text-dark fw-medium">Notifications</span>
            </DropdownItem>
            <DropdownItem divider />
            <SimpleBar style={{ maxHeight: '350px' }}>
              <NotificationDD />
            </SimpleBar>
            <DropdownItem divider />
            <div className="p-2 px-3">
              <Button color="primary" size="sm" block>
                Check All
              </Button>
            </div>
          </DropdownMenu>
        </UncontrolledDropdown> */}
        {/******************************/}
        {/**********Message DD**********/}
        {/******************************/}
        {/******************************/}
        {/**********Mega DD**********/}
        {/******************************/}
        {/* <UncontrolledDropdown className="mega-dropdown mx-1">
          <DropdownToggle className="bg-transparent border-0" color={topbarColor}>
            <Icon.Grid size={22} />
          </DropdownToggle>
          <DropdownMenu>
            <MegaDD />
          </DropdownMenu>
        </UncontrolledDropdown> */}
        {/******************************/}
        {/**********Profile DD**********/}
        {/******************************/}
        <UncontrolledDropdown>
          <DropdownToggle color={topbarColor}>
            <img src={avatar} alt="profile" className="rounded-circle" width="30" />
          </DropdownToggle>
          <DropdownMenu className="ddWidth">
            <ProfileDD />
            <div className="p-2 px-3">
              <Button color="danger" size="sm" onClick={handleLogOut}>
                Logout
              </Button>
            </div>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    </Navbar>
  );
};

export default Header;
