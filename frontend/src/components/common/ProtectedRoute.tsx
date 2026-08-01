import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
type AppRole = 'ADMIN' | 'MUNICIPAL_AGENT' | 'INSPECTOR' | 'CONTRACTOR' | 'VIEWER' | 'PERMIT_REVIEWER' | 'ASSET_MANAGER' | 'PUBLIC_WORKS_MANAGER' | 'FIELD_WORKER' | 'CITIZEN_SERVICE_AGENT' | 'MUNICIPAL_MANAGER' | 'EXECUTIVE_VIEWER';
interface ProtectedRouteProps { requiredRole?: AppRole; children: React.ReactNode }
const roleHierarchy: Record<AppRole, number> = { VIEWER: 0, CONTRACTOR: 1, FIELD_WORKER: 2, INSPECTOR: 2, PERMIT_REVIEWER: 3, ASSET_MANAGER: 3, PUBLIC_WORKS_MANAGER: 3, CITIZEN_SERVICE_AGENT: 3, EXECUTIVE_VIEWER: 3, MUNICIPAL_AGENT: 3, MUNICIPAL_MANAGER: 4, ADMIN: 5 };
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole = 'VIEWER', children }) => { const { isAuthenticated, user } = useAuth(); if (!isAuthenticated) return <Navigate to="/login" replace />; const userLevel = user ? roleHierarchy[user.role as AppRole] ?? -1 : -1; if (userLevel < roleHierarchy[requiredRole]) return <Navigate to="/" replace />; return <>{children}</>; };
export default ProtectedRoute;
