import api from "./api";
import { mockFDs, mockFDInterests } from "../data/mockData";

/**
 * ASR Bank - Fixed Deposit Service
 * Decoupled data layer for customer Fixed Deposits and interest payout schedules.
 * Ready for live Spring Boot REST API endpoints:
 *   GET /api/fds/customer/{custId}
 *   GET /api/fds/{fdId}/interests
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const fdService = {
  /**
   * Get all fixed deposits for a customer
   * @param {string} custId
   */
  getFDsByCustomer: async (custId = "CUST001") => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockFDs.filter((fd) => fd.custId === custId);
    }
    const response = await api.get(`/api/fds/customer/${custId}`);
    return response.data;
  },

  /**
   * Get all interest payout accruals for a specific FD
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

export default fdService;
