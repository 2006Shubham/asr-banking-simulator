import api from "./api";
import { mockFDInterests } from "../data/mockData";

/**
 * ASR Bank - Fixed Deposit Interest Service
 * Manages term deposit interest accruals and payout calculations.
 *
 * Current: Consumes mockFDInterests from mockData.js.
 * Future Spring Boot Endpoint:
 *   GET /api/fds/{fdId}/interests
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const fdInterestService = {
  /**
   * Get all interest accruals for a specific Fixed Deposit
   * @param {string} fdId
   */
  getInterestsByFD: async (fdId) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockFDInterests.filter((item) => item.fdId === fdId);
    }
    const response = await api.get(`/api/fds/${fdId}/interests`);
    return response.data;
  },
};

export default fdInterestService;
