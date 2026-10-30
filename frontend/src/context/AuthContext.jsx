import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

const STORAGE_KEY = "asr_bank_session";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [branch, setBranch] = useState(null);
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
          setCustomer(session.customer || null);
          setEmployee(session.employee || null);
          setBranch(session.branch || null);
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
   * Login function — delegates to authService.
   */
  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);

      const session = {
        token: data.token,
        user: data.user,
        customer: data.customer || null,
        employee: data.employee || null,
        branch: data.branch || null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

      setUser(data.user);
      setCustomer(data.customer || null);
      setEmployee(data.employee || null);
      setBranch(data.branch || null);
      setToken(data.token);
      setIsAuthenticated(true);

      return { success: true, user: data.user, role: data.user?.role };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please verify your credentials.";
      return { success: false, error: message };
    }
  };

  /**
   * Register function
   */
  const register = async (payload) => {
    try {
      const res = await authService.register(payload);
      return { success: true, data: res };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please check your account details.";
      return { success: false, error: message };
    }
  };

  /**
   * Logout function — clears state and localStorage.
   */
  const logout = () => {
    authService.logout();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setCustomer(null);
    setEmployee(null);
    setBranch(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  // Role helper utilities
  const isCustomer = () => user?.role === "Customer";
  const isEmployee = () => user?.role === "Employee";
  const isManager = () => user?.role === "Manager";
  const isAdmin = () => user?.role === "Admin";
  const isStaff = () => isEmployee() || isManager() || isAdmin();

  /**
   * Returns the home route based on the logged-in user's role (or explicit role passed).
   */
  const getRoleHome = (roleOverride) => {
    const role = roleOverride || user?.role;
    if (!role) return "/dashboard";
    switch (role) {
      case "Customer": return "/dashboard";
      case "Employee": return "/employee/dashboard";
      case "Manager":  return "/manager/dashboard";
      case "Admin":    return "/dashboard";
      default:         return "/dashboard";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        employee,
        branch,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        isCustomer,
        isEmployee,
        isManager,
        isAdmin,
        isStaff,
        getRoleHome,
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
