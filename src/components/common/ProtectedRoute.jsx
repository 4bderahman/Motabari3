import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserType } from '../../utility-functions/auth-utils';

const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const isAuth = isAuthenticated();
  const userType = getUserType();

  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 