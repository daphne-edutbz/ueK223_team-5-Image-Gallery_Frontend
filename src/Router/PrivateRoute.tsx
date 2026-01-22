import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import * as jwt from 'jsonwebtoken';
import ActiveUserContext from '../Contexts/ActiveUserContext';
import AuthorityService from '../Services/AuthorityService';
import { Button } from '@mui/material';
import authorities from '../config/Authorities';

/**
 * Props für PrivateRoute Komponente
 * @property element - Die zu rendernde React-Komponente
 * @property requiredAuths - Benötigte Berechtigungen für Zugriff
 */
interface Props {
  element: React.ReactElement;
  requiredAuths: authorities[];
}

/** JWT Token Struktur */
type JWTType = {
  iss: string;
  exp: number;
};

/**
 * PrivateRoute schützt Routen vor unautorisiertem Zugriff.
 * Prüft JWT-Token Gültigkeit und erforderliche Berechtigungen.
 * Leitet bei fehlendem Login zu /login, bei fehlenden Rechten zu /unauthorized.
 */
const PrivateRoute: React.FC<Props> = ({
  requiredAuths: requiredAuths,
  element: RouteComponent,
}) => {
  const activeUserContext = useContext(ActiveUserContext);
  /**
   * isLoggedIn checks if the token, which is saved inside the localStorage,
   * exists, isn't expired yet and has been issued by the correct issuer.
   * If all of the above is true the user is seen as logged in.
   */
  const isLoggedIn = () => {
    let tokenString = localStorage.getItem('token');
    if (!tokenString) {
      console.error('no token found');
      return false;
    }
    tokenString = tokenString.replace('Bearer ', '');
    const token: JWTType = jwt.decode(tokenString) as JWTType;
    // Check if token does not exist or doesn't have an expiration claim or is expired.
    return !(!token || !token.exp || token.exp < Date.now() / 1000);

  };
  /**
   * If the user is not logged in call activeUserContext.logout, which destroys
   * all locally saved user data and redirects to /login.
   */
  if (!isLoggedIn()) {
    activeUserContext.logout();
    return <Navigate to='/login' replace={true} />;
  }
  /**
   * Check if the active user has at least 1 of the needed authorities.
   * If no authorities are needed true is returned.
   */
  let hasNeededAuthorities =
    requiredAuths.length === 0 ||
    requiredAuths.some(AuthorityService.hasAuthority);

  /**
   * If the user doesn't possess the needed authorities Redirect the user to
   * /unauthorized
   */
  if (!hasNeededAuthorities) {
    return <Navigate to='/unauthorized' replace={true} />;
  }

  // All checks passed
  return (
    //Pagelayout puts the Navigation, Menu etc. around the component
    <div>
      <Button onClick={activeUserContext.logout}>Logout</Button>
      {RouteComponent}
    </div>
  );
};
export default PrivateRoute;
