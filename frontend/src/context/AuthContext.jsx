import { createContext, useState, useEffect } from "react";
import authService from "@/services/authService";
import api from "@/api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authService.getMe();
        setUser(response);
      } catch (error) {
        console.error("Error fetching user:", error);
        if (error.response?.status === 401) {
          // api.js's response interceptor already clears the token and
          // redirects to /login on 401 — nothing to duplicate here.
          setUser(null);
        } else {
          // Network error / server unreachable / 5xx: the token may still
          // be valid, so keep it and let a refresh retry getMe().
          setConnectionError(true);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  function applyLoginResponse(response) {
    localStorage.setItem("token", response.access_token);
    localStorage.setItem("isGuest", response.user.is_guest ? "1" : "0");
    setUser(response.user);
    return response;
  }

  async function login(data) {
    const response = await authService.login(data);
    return applyLoginResponse(response);
  }

  async function loginAsGuest() {
    const response = await authService.demoLogin();
    return applyLoginResponse(response);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("isGuest");
      setUser(null);
    }
  }

  function updateUser(partial) {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, connectionError, login, loginAsGuest, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
