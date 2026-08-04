import api from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const { data } = await api.post("/auth/login", credentials);
  // Token is now stored as httpOnly cookie by the backend
  // refreshToken is returned for client-side storage (optional, for refresh flow)
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logout = async () => {
  try {
    // Call backend logout endpoint to revoke server-side session
    await api.post("/auth/logout", {});
  } catch (error) {
    console.error("Logout API failed:", error);
    // Continue with client-side cleanup even if server call fails
  } finally {
    // Clear client-side data
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    sessionStorage.clear();
  }
};
