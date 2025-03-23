import React from 'react';
import {
  Button,
  Nav,
  UncontrolledDropdown,
} from 'reactstrap';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import SidebarData from '../sidebardata/SidebarData';
import Logo from '../../logo/Logo';
import { ToggleMobileSidebar } from '../../../store/customizer/CustomizerSlice';
import NavItemContainer from './NavItemContainer';
import NavSubMenu from './NavSubMenu';

import user1 from '../../../assets/images/users/user4.jpg';

const Sidebar = () => {
  const location = useLocation();
  const currentURL = location.pathname.split('/').slice(0, -1).join('/');

  const avatar = (localStorage.getItem("avatar") !== "null") ? localStorage.getItem("avatar") : user1;
  const username = localStorage.getItem("username") !== null ? localStorage.getItem("username") : "John Deo";
  const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage

  const activeBg = useSelector((state) => state.customizer.sidebarBg);
  const isFixed = useSelector((state) => state.customizer.isSidebarFixed);
  const dispatch = useDispatch();

  return (
    <div className={`sidebarBox shadow bg-${activeBg} ${isFixed ? 'fixedSidebar' : ''}`}>
      <SimpleBar style={{ height: '100%' }}>
        {/********Logo*******/}
        <div className="d-flex p-3 align-items-center">
          <Logo />
          <Button
            close
            size="sm"
            className="ms-auto d-sm-block d-lg-none"
            onClick={() => dispatch(ToggleMobileSidebar())}
          />
        </div>
        {/********Sidebar Content*******/}
        <div className="py-4 text-center profile-area">
          <img src={avatar} alt="John Deo" width={80} className="rounded-circle mb-2" />
          <UncontrolledDropdown>
            <div caret className="bg-transparent border-0">
              {username}
            </div>
          </UncontrolledDropdown>
        </div>
        <div>
          <Nav vertical className={activeBg === 'white' ? '' : 'lightText'}>
            {SidebarData.map((navi) => {
              if (navi.caption) {
                return (
                  <div className="navCaption fw-bold text-uppercase mt-4" key={navi.caption}>
                    {navi.caption}
                  </div>
                );
              }
              if (navi.children) {
                return (
                  <NavSubMenu
                    key={navi.id}
                    icon={navi.icon}
                    title={navi.title}
                    items={navi.children}
                    suffix={navi.suffix}
                    suffixColor={navi.suffixColor}
                    // toggle={() => toggle(navi.id)}
                    // collapsed={collapsed === navi.id}
                    isUrl={currentURL === navi.href}
                  />
                );
              }
              return (
                <NavItemContainer
                  key={navi.id}
                  //toggle={() => toggle(navi.id)}
                  className={location.pathname === navi.href ? 'activeLink' : ''}
                  to={navi.id === 1.1 // Check if this is the Profile item by its id
                    ? `/profile/${userId}` // Use dynamic userId
                    : navi.href // Use default href for other items
                  }
                  title={navi.title}
                  suffix={navi.suffix}
                  suffixColor={navi.suffixColor}
                  icon={navi.icon}
                />
              );
            })}
          </Nav>
        </div>
      </SimpleBar>
    </div>
  );
};

export default Sidebar;
