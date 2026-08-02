// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMe } from "../services/authService";
import { AuthContext, AuthProvider } from "./AuthContext";

vi.mock("../services/authService", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

const mockedGetMe = vi.mocked(getMe);

const AuthState = () => (
  <AuthContext.Consumer>
    {({ token, user, isLoading }) => (
      <div>
        <span data-testid="token">{token ?? "aucun"}</span>
        <span data-testid="user">{user?.email ?? "aucun"}</span>
        <span data-testid="loading">{String(isLoading)}</span>
      </div>
    )}
  </AuthContext.Consumer>
);

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetMe.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("restaure la session une seule fois au montage", async () => {
    localStorage.setItem("token", "token-restaure");
    mockedGetMe.mockResolvedValue({
      id: "user-1",
      email: "citoyen@example.com",
      role: "CITIZEN",
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(mockedGetMe).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("user")).toHaveTextContent("citoyen@example.com");
  });

  it("synchronise le jeton exposé avec le stockage restauré", async () => {
    localStorage.setItem("token", "token-stocke");
    mockedGetMe.mockResolvedValue({
      id: "user-2",
      email: "agent@example.com",
      role: "MUNICIPAL_AGENT",
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("token")).toHaveTextContent("token-stocke");
    });
  });

  it("retire un jeton invalide lorsque la restauration échoue", async () => {
    localStorage.setItem("token", "token-invalide");
    mockedGetMe.mockRejectedValue(new Error("Session expirée"));

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token")).toHaveTextContent("aucun");
    expect(screen.getByTestId("user")).toHaveTextContent("aucun");
  });
});
