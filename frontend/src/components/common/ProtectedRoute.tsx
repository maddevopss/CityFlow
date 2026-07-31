import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  requiredRole?: 'ADMIN' | 'MUNICIPAL_AGENT' | 'CONTRACTOR' | 'VIEWER';
  children: React.ReactNode;
}

const roleHierarchy: Record<string, number> = {
  VIEWER: 0,
  CONTRACTOR: 1,
  MUNICIPAL_AGENT: 2,
  ADMIN: 3
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole = 'VIEWER', children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
