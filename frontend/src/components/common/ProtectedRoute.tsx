import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types";

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  children: React.ReactNode;
}

const roleHierarchy: Record<UserRole, number> = {
  CITIZEN: 0,
  VIEWER: 1,
  CONTRACTOR: 2,
  INSPECTOR: 3,
  MUNICIPAL_AGENT: 4,
  MANAGER: 5,
  ADMIN: 6,
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole = "VIEWER",
  children,
}) => {
  const { isAuthenticated, isLoading, token, user } = useAuth();
  const location = useLocation();

  if (isLoading && token) {
    return (
      <span className="sr-only" role="status">
        Restauration de la session en cours.
      </span>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
