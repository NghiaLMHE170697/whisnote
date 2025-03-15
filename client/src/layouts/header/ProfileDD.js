import React from 'react';
import { DropdownItem } from 'reactstrap';
import { User, Star } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import user1 from '../../assets/images/users/user1.jpg';

const ProfileDD = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const avatar = localStorage.getItem('avatar') ? localStorage.getItem('avatar') : user1;
  const userId = localStorage.getItem('userId');

  return (
    <div>
      <div className="d-flex gap-3 p-3 border-bottom pt-2 align-items-center">
        <img src={avatar} alt="user" className="rounded-circle" width="55" />
        <span>
          <h5 className="mb-0 fw-medium">{username}</h5>
          {/* <small className='text-muted'>info@wrappixel.com</small> */}
        </span>
      </div>
      <DropdownItem className="px-4 py-3" onClick={() => navigate(`/profile/${userId}`)}>
        <User size={20} className="text-muted" />
        &nbsp; My Profile
      </DropdownItem>
      <DropdownItem className="px-4 py-3">
        <Star size={20} className="text-muted" />
        &nbsp; My Balance
      </DropdownItem>
      {/* <DropdownItem className="px-4 py-3">
        <Droplet size={20} className="text-muted" />
        &nbsp; Customize
      </DropdownItem>
      <DropdownItem divider />
      <DropdownItem className="px-4 py-3">
        <Settings size={20} className="text-muted" />
        &nbsp; Settings
      </DropdownItem>
      <DropdownItem divider /> */}
    </div>
  );
};

export default ProfileDD;
