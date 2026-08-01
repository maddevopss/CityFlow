import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/EventsPage';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Exports from './pages/Exports';
import InspectionsPage from './pages/InspectionsPage';
import InspectionDetail from './pages/InspectionDetail';
import InspectionCalendar from './pages/InspectionCalendar';
import ProtectedRoute from './components/common/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2
    }
  }
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/events" element={<ProtectedRoute requiredRole="VIEWER"><EventsPage /></ProtectedRoute>} />
              <Route path="/events/new" element={<ProtectedRoute requiredRole="MUNICIPAL_AGENT"><CreateEvent /></ProtectedRoute>} />
              <Route path="/events/:id/edit" element={<ProtectedRoute requiredRole="MUNICIPAL_AGENT"><EditEvent /></ProtectedRoute>} />
              <Route path="/exports" element={<ProtectedRoute requiredRole="MUNICIPAL_AGENT"><Exports /></ProtectedRoute>} />
              <Route path="/inspections" element={<ProtectedRoute requiredRole="INSPECTOR"><InspectionsPage /></ProtectedRoute>} />
              <Route path="/inspections/calendar" element={<ProtectedRoute requiredRole="INSPECTOR"><InspectionCalendar /></ProtectedRoute>} />
              <Route path="/inspections/:id" element={<ProtectedRoute requiredRole="INSPECTOR"><InspectionDetail /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
