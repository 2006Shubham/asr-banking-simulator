import api from "./api";
import { mockCustomer, mockKYC, mockUser } from "../data/mockData";

/**
 * ASR Bank - Customer & KYC Service
 * Decoupled data layer for customer profiles and KYC regulatory compliance records.
 * Ready for future Spring Boot REST API:
 *   GET /api/customers/{custId}
 *   GET /api/customers/{custId}/kyc
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const customerService = {
  /**
   * Get customer profile by ID
   * @param {string} custId
   */
  getCustomerProfile: async (custId = "CUST001") => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockCustomer;
    }
    const response = await api.get(`/api/customers/${custId}`);
    return response.data;
  },

  /**
   * Get KYC verification records for customer
   * @param {string} custId
   */
  getKYCRecords: async (custId = "CUST001") => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockKYC.filter((k) => k.custId === custId);
    }
    const response = await api.get(`/api/customers/${custId}/kyc`);
    return response.data;
  },
};

export default customerService;
