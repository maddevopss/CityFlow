import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import PublicLayout from "./components/public/PublicLayout";
import Login from "./pages/Login";
import PublicPlaceholderPage from "./pages/public/PublicPlaceholderPage";
import ProtectedRoute from "./components/common/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const Exports = lazy(() => import("./pages/Exports"));
const InspectionsPage = lazy(() => import("./pages/InspectionsPage"));
const InspectionDetail = lazy(() => import("./pages/InspectionDetail"));
const InspectionCalendar = lazy(() => import("./pages/InspectionCalendar"));
const InspectionDashboard = lazy(() => import("./pages/InspectionDashboard"));
const InspectionTrends = lazy(() => import("./pages/InspectionTrends"));
const CitizenPortalPage = lazy(() => import("./pages/CitizenPortalPage"));
const MunicipalCitizenRequestsPage = lazy(
  () => import("./pages/MunicipalCitizenRequestsPage"),
);
const MunicipalCitizenRequestDetailPage = lazy(
  () => import("./pages/MunicipalCitizenRequestDetailPage"),
);
const CitizenServiceLevelsPage = lazy(
  () => import("./pages/CitizenServiceLevelsPage"),
);
const CitizenEscalationHistoryPage = lazy(
  () => import("./pages/CitizenEscalationHistoryPage"),
);
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const PermitsPage = lazy(() => import("./pages/PermitsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2 },
  },
});

const routeFallback = (
  <div role="status" aria-live="polite">
    Chargement de la page…
  </div>
);

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const publicPage = (title: string, description: string) => (
  <PublicPlaceholderPage title={title} description={description} />
);

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter future={routerFuture}>
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route
                index
                element={publicPage(
                  "Bienvenue sur CityFlow",
                  "La page d’accueil publique sera livrée dans la PR 2.",
                )}
              />
              <Route
                path="signup"
                element={publicPage(
                  "Créer un compte",
                  "Le parcours d’inscription sera livré dans la PR 3.",
                )}
              />
              <Route
                path="forgot-password"
                element={publicPage(
                  "Mot de passe oublié",
                  "Le parcours de récupération sera livré dans la PR 4.",
                )}
              />
              <Route
                path="reset-password/:token"
                element={publicPage(
                  "Réinitialiser le mot de passe",
                  "La réinitialisation sécurisée sera livrée dans la PR 4.",
                )}
              />
              <Route
                path="contact"
                element={publicPage(
                  "Nous joindre",
                  "Le formulaire de contact sera livré dans la PR 5.",
                )}
              />
              <Route path="about" element={publicPage("À propos", "Cette page sera livrée dans la PR 6.")} />
              <Route path="privacy" element={publicPage("Politique de confidentialité", "Cette page sera livrée dans la PR 6.")} />
              <Route path="terms" element={publicPage("Conditions d’utilisation", "Cette page sera livrée dans la PR 6.")} />
              <Route path="cookies" element={publicPage("Politique sur les témoins", "Cette page sera livrée dans la PR 6.")} />
              <Route path="accessibility" element={publicPage("Accessibilité", "Cette page sera livrée dans la PR 6.")} />
              <Route path="not-found" element={publicPage("Page introuvable", "La page demandée n’existe pas ou a été déplacée.")} />
            </Route>

            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute requiredRole="CITIZEN">
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/app" element={<Dashboard />} />
              <Route
                path="/events"
                element={
                  <ProtectedRoute requiredRole="VIEWER">
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/new"
                element={
                  <ProtectedRoute requiredRole="MUNICIPAL_AGENT">
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute requiredRole="MUNICIPAL_AGENT">
                    <EditEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exports"
                element={
                  <ProtectedRoute requiredRole="MUNICIPAL_AGENT">
                    <Exports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/permits"
                element={
                  <ProtectedRoute requiredRole="VIEWER">
                    <PermitsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspections"
                element={
                  <ProtectedRoute requiredRole="INSPECTOR">
                    <InspectionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspections/dashboard"
                element={
                  <ProtectedRoute requiredRole="INSPECTOR">
                    <InspectionDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspections/trends"
                element={
                  <ProtectedRoute requiredRole="INSPECTOR">
                    <InspectionTrends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspections/calendar"
                element={
                  <ProtectedRoute requiredRole="INSPECTOR">
                    <InspectionCalendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspections/:id"
                element={
                  <ProtectedRoute requiredRole="INSPECTOR">
                    <InspectionDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute requiredRole="CITIZEN">
                    <CitizenPortalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/municipal/citizen-requests"
                element={
                  <ProtectedRoute requiredRole="MUNICIPAL_AGENT">
                    <MunicipalCitizenRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/municipal/citizen-requests/service-levels"
                element={
                  <ProtectedRoute requiredRole="MUNICIPAL_AGENT">
                    <CitizenServiceLevelsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/municipal/citizen-requests/escalations/history"
                element={
                  <ProtectedRoute requiredRole="MANAGER">
                    <CitizenEscalationHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/municipal/citizen-requests/:id"
                element={
                  <ProtectedRoute requiredRole="MUNICIPAL_AGENT">
                    <MunicipalCitizenRequestDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute requiredRole="CITIZEN">
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
