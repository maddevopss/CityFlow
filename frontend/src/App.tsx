import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import ProtectedRoute from './components/common/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const EditEvent = lazy(() => import('./pages/EditEvent'));
const Exports = lazy(() => import('./pages/Exports'));
const InspectionsPage = lazy(() => import('./pages/InspectionsPage'));
const InspectionDetail = lazy(() => import('./pages/InspectionDetail'));
const InspectionCalendar = lazy(() => import('./pages/InspectionCalendar'));
const InspectionDashboard = lazy(() => import('./pages/InspectionDashboard'));
const InspectionTrends = lazy(() => import('./pages/InspectionTrends'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } }
});

const PageFallback = () => (
  <div role="status" aria-live="polite" className="flex min-h-48 items-center justify-center p-8 text-gray-600">
    Chargement de la page…
  </div>
);

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/events" element={<ProtectedRoute requiredRole="VIEWER"><EventsPage /></ProtectedRoute>} />
              <Route path="/events/new" element={<ProtectedRoute requiredRole="MUNICIPAL_AGENT"><CreateEvent /></ProtectedRoute>} />
              <Route path="/events/:id/edit" element={<ProtectedRoute requiredRole="MUNICIPAL_AGENT"><EditEvent /></ProtectedRoute>} />
              <Route path="/exports" element={<ProtectedRoute requiredRole="MUNICIPAL_AGENT"><Exports /></ProtectedRoute>} />
              <Route path="/inspections" element={<ProtectedRoute requiredRole="INSPECTOR"><InspectionsPage /></ProtectedRoute>} />
              <Route path="/inspections/dashboard" element={<ProtectedRoute requiredRole="INSPECTOR"><InspectionDashboard /></ProtectedRoute>} />
              <Route path="/inspections/trends" element={<ProtectedRoute requiredRole="INSPECTOR"><InspectionTrends /></ProtectedRoute>} />
              <Route path="/inspections/calendar" element={<ProtectedRoute requiredRole="INSPECTOR"><InspectionCalendar /></ProtectedRoute>} />
              <Route path="/inspections/:id" element={<ProtectedRoute requiredRole="INSPECTOR"><InspectionDetail /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
