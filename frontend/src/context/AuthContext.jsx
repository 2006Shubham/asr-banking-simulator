import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

const STORAGE_KEY = "asr_bank_session";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from localStorage on application boot
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.user && session.token) {
          setUser(session.user);
          setCustomer(session.customer);
          setToken(session.token);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.error("Failed to restore ASR Bank session from storage:", err);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login function
   * Delegates credential validation to authService.
   * On success: persists session in localStorage and sets state.
   */
  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);

      const session = {
        token: data.token,
        user: data.user,
        customer: data.customer,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

      setUser(data.user);
      setCustomer(data.customer);
      setToken(data.token);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please verify your credentials.";
      return { success: false, error: message };
    }
  };

  /**
   * Logout function
   * Clears state and localStorage session.
   */
  const logout = () => {
    authService.logout();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setCustomer(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
