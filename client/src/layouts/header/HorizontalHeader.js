import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navbar,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  Button,
  Container,
  Badge
} from 'reactstrap';
import { Menu, ArrowUpRight, CheckCircle } from 'react-feather';
import { useSelector, useDispatch } from 'react-redux';
import user1 from '../../assets/images/users/user4.jpg';

import { ToggleMobileSidebar } from '../../store/customizer/CustomizerSlice';
import ProfileDD from './ProfileDD';

import HorizontalLogo from '../logo/HorizontalLogo';

const HorizontalHeader = () => {
  const isDarkMode = useSelector((state) => state.customizer.isDark);
  const topbarColor = useSelector((state) => state.customizer.topbarBg);
  // const isMobileSidebar = useSelector((state) => state.customizer.isMobileSidebar);
  const avatar = localStorage.getItem('avatar') ? localStorage.getItem('avatar') : user1;
  const [role, setUserRole] = useState(localStorage.getItem('role') || 'free');
  const nav = useNavigate();
  const dispatch = useDispatch();

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
      className="shadow HorizontalTopbar p-0"
    >
      <Container fluid className="d-flex align-items-center boxContainer">
        {/******************************/}
        {/**********Logo**********/}
        {/******************************/}
        <div className="pe-4 py-3 ">
          <HorizontalLogo />
        </div>
        {/******************************/}
        {/**********Toggle Buttons**********/}
        {/******************************/}

        <Nav className="me-auto" navbar>
          <Button
            color={topbarColor}
            className="d-sm-block d-lg-none"
            onClick={() => dispatch(ToggleMobileSidebar())}
          >
            <Menu size={22} />
          </Button>

        </Nav>
        {/******************************/}
        {/**********Profile DD**********/}
        {/******************************/}
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
          <UncontrolledDropdown>
            <DropdownToggle tag="span" className="p-2 cursor-pointer ">
              <img src={avatar} alt="profile" className="rounded-circle" width="30" />
            </DropdownToggle>
            <DropdownMenu className="ddWidth" end>
              <ProfileDD />

              <div className="p-2 px-3">
                <Button color="danger" size="sm" onClick={handleLogOut}>
                  Logout
                </Button>
              </div>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default HorizontalHeader;
