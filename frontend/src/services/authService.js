import api from "./api";
import { mockUser, mockCustomer } from "../data/mockData";

/**
 * ASR Bank - Authentication Service
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const authService = {
  /**
   * Login user with username and password
   */
  login: async (username, password) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const cleanUser = username?.trim();
      const cleanPass = password?.trim();

      if (cleanUser === "suraj_w" && cleanPass === "demo123") {
        return {
          token: "mock-jwt-asr-bank-session-token-2026",
          user: mockUser,
          customer: mockCustomer,
        };
      }
      throw new Error(
        "Invalid Username or Password. Please check your NetBanking credentials and try again."
      );
    }

    // Live Spring Boot API Integration:
    const response = await api.post("/api/auth/login", {
      username: username?.trim(),
      password,
    });
    return response.data;
  },

  /**
   * Register user for NetBanking using existing bank account
   */
  register: async ({ accountNo, email, phone, username, password }) => {
    const response = await api.post("/api/auth/register", {
      accountNo: accountNo?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      username: username?.trim(),
      password,
    });
    return response.data;
  },

  /**
   * Invalidate session
   */
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.warn("Backend logout notification failed", err);
    }
  },
};

export default authService;
