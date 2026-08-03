// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const renderProtectedRoute = (requiredRole: "CITIZEN" | "ADMIN" = "CITIZEN") =>
  render(
    <MemoryRouter initialEntries={["/protected"]} future={routerFuture}>
      <Routes>
        <Route path="/login" element={<div>Connexion</div>} />
        <Route path="/" element={<div>Accueil</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Contenu protégé</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("annonce la restauration lorsqu’un jeton existe", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      token: "token",
      user: null,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Restauration de la session en cours.",
    );
  });

  it("redirige immédiatement sans session restaurable", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      token: null,
      user: null,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getAllByText("Connexion").length).toBeGreaterThan(0);
  });

  it("redirige un rôle insuffisant vers l’accueil", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      token: "token",
      user: { role: "CITIZEN" },
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute("ADMIN");

    expect(screen.getByText("Accueil")).toBeInTheDocument();
  });

  it("refuse une session authentifiée sans utilisateur résolu", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      token: "token",
      user: null,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getAllByText("Connexion").length).toBeGreaterThan(0);
  });
});
