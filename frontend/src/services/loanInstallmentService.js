import api from "./api";
import { mockInstallments } from "../data/mockData";

/**
 * ASR Bank - Loan Installment Service
 * Manages loan repayment schedules, EMI calculations, and settlement logs.
 *
 * Current: Reads from mockData.js (simulated delay).
 * Future Spring Boot Endpoint:
 *   GET  /api/loans/{loanId}/installments
 *   POST /api/loans/{loanId}/installments/{installmentId}/pay
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const loanInstallmentService = {
  /**
   * Get all installments for a specific loan facility
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

  /**
   * Simulate or execute paying a scheduled EMI installment
   * @param {string} loanId
   * @param {string} installmentId
   */
  payInstallment: async (loanId, installmentId) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const installment = mockInstallments.find(
        (i) => i.installmentId === installmentId && i.loanId === loanId
      );
      if (!installment) throw new Error("Installment not found");
      return {
        ...installment,
        status: "Paid",
        paidOn: new Date().toISOString().split("T")[0],
      };
    }
    const response = await api.post(
      `/api/loans/${loanId}/installments/${installmentId}/pay`
    );
    return response.data;
  },
};

export default loanInstallmentService;
