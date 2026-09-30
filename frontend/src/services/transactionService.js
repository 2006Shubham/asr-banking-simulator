import api from "./api";
import { mockTransactions } from "../data/mockData";

/**
 * ASR Bank - Transaction Service
 * Provides ledger retrieval and statement filtering capabilities.
 * Prepared for future Spring Boot REST API: GET /api/transactions/account/{accNo}
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const transactionService = {
  /**
   * Get all transactions or transactions for a specific account
   * @param {string} accNo - Optional account number filter
   */
  getTransactions: async (accNo) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (accNo && accNo !== "ALL") {
        return mockTransactions.filter((t) => t.accNo === accNo);
      }
      return [...mockTransactions];
    }

    const endpoint = accNo && accNo !== "ALL"
      ? `/api/transactions/account/${accNo}`
      : `/api/transactions`;
    const response = await api.get(endpoint);
    return response.data;
  },
};

export default transactionService;
