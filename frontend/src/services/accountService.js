import api from "./api";
import { mockAccounts } from "../data/mockData";

/**
 * ASR Bank - Account Service
 * Provides functions to fetch customer accounts and balances.
 * Prepared for future Spring Boot REST API: GET /api/accounts/customer/{custId}
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const accountService = {
  /**
   * Get all accounts belonging to a customer
   * @param {string} custId
   */
  getAccountsByCustomer: async (custId = "CUST001") => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockAccounts.filter((a) => a.custId === custId);
    }
    const response = await api.get(`/api/accounts/customer/${custId}`);
    return response.data;
  },

  /**
   * Alias for getAccountsByCustomer (matches REST consumer convention)
   * @param {string} custId
   */
  getAccounts: async (custId = "CUST001") => {
    return accountService.getAccountsByCustomer(custId);
  },

  /**
   * Get account details by account number
   * @param {string} accNo
   */
  getAccountByNumber: async (accNo) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const acc = mockAccounts.find((a) => a.accNo === accNo);
      if (!acc) throw new Error("Account not found");
      return acc;
    }
    const response = await api.get(`/api/accounts/${accNo}`);
    return response.data;
  },
};

export default accountService;
