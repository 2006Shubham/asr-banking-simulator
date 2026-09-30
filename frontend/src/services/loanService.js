import api from "./api";
import { mockLoans, mockInstallments } from "../data/mockData";

/**
 * ASR Bank - Loan Service
 * Provides access to customer loans and installment amortization schedules.
 * Prepared for future Spring Boot REST API:
 *   GET /api/loans/customer/{custId}
 *   GET /api/loans/{loanId}/installments
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const loanService = {
  /**
   * Get all loans for a customer
   * @param {string} custId
   */
  getLoansByCustomer: async (custId = "CUST001") => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockLoans.filter((l) => l.custId === custId);
    }
    const response = await api.get(`/api/loans/customer/${custId}`);
    return response.data;
  },

  /**
   * Get installment schedule for a loan
   * @param {string} loanId
   */
  getInstallmentsByLoan: async (loanId) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockInstallments.filter((inst) => inst.loanId === loanId);
    }
    const response = await api.get(`/api/loans/${loanId}/installments`);
    return response.data;
  },
};

export default loanService;
