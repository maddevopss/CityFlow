// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { getMe, login, logout } from "./authService";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

describe("authService", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGet.mockReset();
    mockedPost.mockReset();
  });

  it("enregistre le jeton retourné après une connexion réussie", async () => {
    const response = {
      token: "token-valide",
      user: {
        id: "user-1",
        email: "citoyen@example.com",
        role: "CITIZEN",
      },
    };
    mockedPost.mockResolvedValue({ data: response });

    await expect(
      login({ email: "citoyen@example.com", password: "secret" }),
    ).resolves.toEqual(response);

    expect(mockedPost).toHaveBeenCalledWith("/auth/login", {
      email: "citoyen@example.com",
      password: "secret",
    });
    // Token is now stored as httpOnly cookie by backend (not accessible in JavaScript)
  });

  it("enregistre le refreshToken en localStorage si fourni par le backend", async () => {
    const response = {
      token: "token-valide",
      refreshToken: "refresh-token-valide",
      user: {
        id: "user-1",
        email: "citoyen@example.com",
        role: "CITIZEN",
      },
    };
    mockedPost.mockResolvedValue({ data: response });

    await login({ email: "citoyen@example.com", password: "secret" });

    expect(localStorage.getItem("refreshToken")).toBe("refresh-token-valide");
  });

  it("retourne l’utilisateur courant depuis /auth/me", async () => {
    const user = {
      id: "user-2",
      email: "agent@example.com",
      role: "MUNICIPAL_AGENT",
    };
    mockedGet.mockResolvedValue({ data: user });

    await expect(getMe()).resolves.toEqual(user);
    expect(mockedGet).toHaveBeenCalledWith("/auth/me");
  });

  it("nettoie les données client lors de la déconnexion", async () => {
    localStorage.setItem("refreshToken", "refresh-token-a-retirer");
    sessionStorage.setItem("session-data", "data");
    mockedPost.mockResolvedValue({ data: {} });

    await logout();

    expect(mockedPost).toHaveBeenCalledWith("/auth/logout", {});
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(sessionStorage.getItem("session-data")).toBeNull();
    // httpOnly token is automatically cleared by backend (not accessible in JavaScript)
  });

  it("continue le logout côté client même si l'appel API échoue", async () => {
    localStorage.setItem("refreshToken", "refresh-token-a-retirer");
    mockedPost.mockRejectedValue(new Error("API Error"));

    await logout();

    expect(mockedPost).toHaveBeenCalledWith("/auth/logout", {});
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});
