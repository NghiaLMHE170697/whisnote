import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ element: Component, ...rest }) => {
    const isAuthenticated = !!localStorage.getItem('token'); // Replace with your authentication logic

    return isAuthenticated ? <Component {...rest} /> : <Navigate to="/auth/login" />;
};

ProtectedRoutes.propTypes = {
    element: PropTypes.elementType.isRequired,
};

export default ProtectedRoutes;