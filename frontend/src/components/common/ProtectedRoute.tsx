import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  children: React.ReactNode;
}

const roleHierarchy: Record<UserRole, number> = {
  VIEWER: 0,
  CONTRACTOR: 1,
  INSPECTOR: 2,
  MUNICIPAL_AGENT: 3,
  MANAGER: 4,
  ADMIN: 5
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
