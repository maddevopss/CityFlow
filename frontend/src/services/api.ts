import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // Enable sending cookies with requests (httpOnly cookies are sent automatically)
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Token is now in httpOnly cookie, sent automatically by the browser
  // No need to manually set Authorization header
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url === "/auth/login";

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
