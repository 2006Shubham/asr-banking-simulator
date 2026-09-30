import api from "./api";
import { mockUser, mockCustomer } from "../data/mockData";

/**
 * ASR Bank - Authentication Service
 *
 * Current: Validates against mock credentials (suraj_w / demo123).
 * Future: Calls Spring Boot backend via POST /api/auth/login.
 *
 * This clean abstraction ensures the UI does not require modification
 * when transitioning from mock to backend REST APIs.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const authService = {
  /**
   * Login user with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{token: string, user: object, customer: object}>}
   */
  login: async (username, password) => {
    if (USE_MOCK) {
      // Simulate realistic banking network verification (300ms)
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

      // Explicit error message for invalid credentials
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
   * Invalidate session on server (optional when live)
   */
  logout: async () => {
    if (!USE_MOCK) {
      try {
        await api.post("/api/auth/logout");
      } catch (err) {
        console.warn("Backend logout notification failed", err);
      }
    }
  },
};

export default authService;
