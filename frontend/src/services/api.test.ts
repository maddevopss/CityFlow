import { beforeEach, describe, expect, it, vi } from "vitest";

const interceptorMocks = vi.hoisted(() => {
  const state: {
    requestHandler?: (config: unknown) => unknown;
    responseErrorHandler?: (error: unknown) => Promise<never>;
  } = {};

  const client = {
    interceptors: {
      request: {
        use: vi.fn((handler: (config: unknown) => unknown) => {
          state.requestHandler = handler;
        }),
      },
      response: {
        use: vi.fn(
          (
            _successHandler: (response: unknown) => unknown,
            errorHandler: (error: unknown) => Promise<never>,
          ) => {
            state.responseErrorHandler = errorHandler;
          },
        ),
      },
    },
  };

  return {
    client,
    create: vi.fn(() => client),
    state,
  };
});

vi.mock("axios", () => ({
  default: {
    create: interceptorMocks.create,
  },
}));

await import("./api");

describe("intercepteurs API", () => {
  const getItem = vi.fn();
  const removeItem = vi.fn();

  beforeEach(() => {
    getItem.mockReset();
    removeItem.mockReset();
    vi.stubGlobal("localStorage", { getItem, removeItem });
    vi.stubGlobal("window", { location: { href: "/" } });
  });

  it("ajoute le jeton Bearer aux requêtes authentifiées", () => {
    getItem.mockReturnValue("token-valide");
    const config = { headers: {} as Record<string, string> };

    const result = interceptorMocks.state.requestHandler?.(
      config,
    ) as typeof config;

    expect(result.headers.Authorization).toBe("Bearer token-valide");
  });

  it("préserve un refus normal de connexion", async () => {
    const error = {
      config: { url: "/auth/login" },
      response: { status: 401 },
    };

    await expect(
      interceptorMocks.state.responseErrorHandler?.(error),
    ).rejects.toBe(error);

    expect(removeItem).not.toHaveBeenCalled();
    expect(window.location.href).toBe("/");
  });

  it("nettoie la session et redirige après un autre 401", async () => {
    const error = {
      config: { url: "/auth/me" },
      response: { status: 401 },
    };

    await expect(
      interceptorMocks.state.responseErrorHandler?.(error),
    ).rejects.toBe(error);

    expect(removeItem).toHaveBeenCalledWith("token");
    expect(window.location.href).toBe("/login");
  });
});
