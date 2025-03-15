import * as Icon from 'react-feather';

const SidebarData = [
  {
    title: 'Trang Chủ',
    href: '/',
    id: 1,
    icon: <Icon.Home />,
    collapisble: false,
  },
  {
    title: 'Profile',
    href: `/profile/`,
    id: 1.1,
    icon: <Icon.User />,
    collapisble: false,
  },
  {
    title: 'Create Post',
    href: '/post/create',
    id: 1.2,
    icon: <Icon.Edit />,
    collapisble: false,
  },
  // {
  //   title: 'Search',
  //   href: '/search',
  //   id: 1.3,
  //   icon: <Icon.Search />,
  //   collapisble: false,
  // },
];

export default SidebarData;
