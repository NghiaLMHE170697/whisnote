import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/loader/Loadable';
import ProtectedRoutes from './ProtectedRoutes'; // Import the PrivateRoute component
/****Layouts*****/

const FullLayout = Loadable(lazy(() => import('../layouts/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/BlankLayout')));
/***** Pages ****/

// const Minimal = Loadable(lazy(() => import('../views/dashboards/Minimal')));
// const Analytical = Loadable(lazy(() => import('../views/dashboards/Analytical')));
// const Demographical = Loadable(lazy(() => import('../views/dashboards/Demographical')));
// const Modern = Loadable(lazy(() => import('../views/dashboards/Modern')));
const Home = Loadable(lazy(() => import('../views/Home')));

/***** Apps ****/
// const Notes = Loadable(lazy(() => import('../views/apps/notes/Notes')));
// const Chat = Loadable(lazy(() => import('../views/apps/chat/Chat')));
// const Contacts = Loadable(lazy(() => import('../views/apps/contacts/Contacts')));
// const Calendar = Loadable(lazy(() => import('../views/apps/calendar/CalendarApp')));
// const Email = Loadable(lazy(() => import('../views/apps/email/Email')));
// const Shop = Loadable(lazy(() => import('../views/apps/ecommerce/Shop')));
// const ShopDetail = Loadable(lazy(() => import('../views/apps/ecommerce/ShopDetail')));
// const Treeview = Loadable(lazy(() => import('../views/apps/treeview/TreeView')));
// const TicketList = Loadable(lazy(() => import('../views/apps/ticket/TicketList')));
// const TicketDetail = Loadable(lazy(() => import('../views/apps/ticket/TicketDetail')));

/***** Ui Elements ****/
// const Alerts = Loadable(lazy(() => import('../views/ui/Alerts')));
// const Badges = Loadable(lazy(() => import('../views/ui/Badges')));
// const Buttons = Loadable(lazy(() => import('../views/ui/Buttons')));
// const Cards = Loadable(lazy(() => import('../views/ui/Cards')));
// const Grid = Loadable(lazy(() => import('../views/ui/Grid')));
// const Tables = Loadable(lazy(() => import('../views/ui/Tables')));
// const Forms = Loadable(lazy(() => import('../views/ui/Forms')));
// const Breadcrumbs = Loadable(lazy(() => import('../views/ui/Breadcrumbs')));
// const Dropdowns = Loadable(lazy(() => import('../views/ui/DropDown')));
// const BtnGroup = Loadable(lazy(() => import('../views/ui/BtnGroup')));
// const Collapse = Loadable(lazy(() => import('../views/ui/Collapse')));
// const ListGroup = Loadable(lazy(() => import('../views/ui/ListGroup')));
// const Modal = Loadable(lazy(() => import('../views/ui/Modal')));
// const Navbar = Loadable(lazy(() => import('../views/ui/Navbar')));
// const Nav = Loadable(lazy(() => import('../views/ui/Nav')));
// const Pagination = Loadable(lazy(() => import('../views/ui/Pagination')));
// const Popover = Loadable(lazy(() => import('../views/ui/Popover')));
// const Progress = Loadable(lazy(() => import('../views/ui/Progress')));
// const Spinner = Loadable(lazy(() => import('../views/ui/Spinner')));
// const Tabs = Loadable(lazy(() => import('../views/ui/Tabs')));
// const Toasts = Loadable(lazy(() => import('../views/ui/Toasts')));
// const Tooltip = Loadable(lazy(() => import('../views/ui/Tooltip')));

/***** Form Layout Pages ****/
// const FormBasic = Loadable(lazy(() => import('../views/form-layouts/FormBasic')));
// const FormGrid = Loadable(lazy(() => import('../views/form-layouts/FormGrid')));
// const FormGroup = Loadable(lazy(() => import('../views/form-layouts/FormGroup')));
// const FormInput = Loadable(lazy(() => import('../views/form-layouts/FormInput')));

/***** Form Pickers Pages ****/
// const Datepicker = Loadable(lazy(() => import('../views/form-pickers/DateTimePicker')));
// const TagSelect = Loadable(lazy(() => import('../views/form-pickers/TagSelect')));

/***** Form Validation Pages ****/
// const FormValidate = Loadable(lazy(() => import('../views/form-validation/FormValidation')));
// const FormSteps = Loadable(lazy(() => import('../views/form-steps/Steps')));
// const FormEditor = Loadable(lazy(() => import('../views/form-editor/FormEditor')));
/***** Table Pages ****/
// const Basictable = Loadable(lazy(() => import('../views/tables/TableBasic')));
// const CustomReactTable = Loadable(lazy(() => import('../views/tables/CustomReactTable')));
// const ReactBootstrapTable = Loadable(lazy(() => import('../views/tables/ReactBootstrapTable')));

/***** Chart Pages ****/
// const ApexCharts = Loadable(lazy(() => import('../views/charts/ApexCharts')));
// const ChartJs = Loadable(lazy(() => import('../views/charts/ChartJs')));

/***** Sample Pages ****/
//const StarterKit = Loadable(lazy(() => import('../views/sample-pages/StarterKit')));
const Profile = Loadable(lazy(() => import('../views/sample-pages/Profile')));
const CreatePost = Loadable(lazy(() => import('../views/CreatePost')));
// const Gallery = Loadable(lazy(() => import('../views/sample-pages/Gallery')));
// const SearchResult = Loadable(lazy(() => import('../views/sample-pages/SearchResult')));
// const HelperClass = Loadable(lazy(() => import('../views/sample-pages/HelperClass')));

/***** Icon Pages ****/
// const Bootstrap = Loadable(lazy(() => import('../views/icons/Bootstrap')));
// const Feather = Loadable(lazy(() => import('../views/icons/Feather')));

/***** Map Pages ****/
//const CustomVectorMap = Loadable(lazy(() => import('../views/maps/CustomVectorMap')));

/***** Widget Pages ****/
//const Widget = Loadable(lazy(() => import('../views/widget/Widget')));

/***** CASL Access Control ****/
//const CASL = Loadable(lazy(() => import('../views/apps/accessControlCASL/AccessControl')));

/***** Auth Pages ****/
const Error = Loadable(lazy(() => import('../views/auth/Error')));
const RegisterFormik = Loadable(lazy(() => import('../views/auth/RegisterFormik')));
const LoginFormik = Loadable(lazy(() => import('../views/auth/LoginFormik')));
const Maintanance = Loadable(lazy(() => import('../views/auth/Maintanance')));
const LockScreen = Loadable(lazy(() => import('../views/auth/LockScreen')));
const RecoverPassword = Loadable(lazy(() => import('../views/auth/RecoverPassword')));

/*****Routes******/

const ThemeRoutes = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', name: 'Home', element: <ProtectedRoutes element={Home} /> },
      { path: '/profile/:userId', name: 'Profile', exact: true, element: <ProtectedRoutes element={Profile} /> },
      { path: '/post/create', name: 'Create Post', exact: true, element: <ProtectedRoutes element={CreatePost} /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
      { path: 'registerformik', element: <RegisterFormik /> },
      { path: 'login', element: <LoginFormik /> },
      { path: 'maintanance', element: <Maintanance /> },
      { path: 'lockscreen', element: <LockScreen /> },
      { path: 'recoverpwd', element: <RecoverPassword /> },
    ],
  },
];

export default ThemeRoutes;
