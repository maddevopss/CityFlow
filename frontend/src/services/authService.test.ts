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
    expect(localStorage.getItem("token")).toBe("token-valide");
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

  it("retire le jeton local lors de la déconnexion", () => {
    localStorage.setItem("token", "token-a-retirer");

    logout();

    expect(localStorage.getItem("token")).toBeNull();
  });
});
