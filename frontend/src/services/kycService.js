import api from "./api";
import { mockKYC } from "../data/mockData";

/**
 * ASR Bank - KYC Service
 * Manages regulatory customer identity verification records under PMLA guidelines.
 *
 * Current: Returns relationally consistent records from mockData.js.
 * Future Spring Boot Endpoint:
 *   GET /api/kyc/customer/{custId}
 *   GET /api/kyc/{kycId}
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const kycService = {
  /**
   * Get all KYC records for a specific customer
   * @param {string} custId
   */
  getKYCByCustomer: async (custId = "CUST001") => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockKYC.filter((k) => k.custId === custId);
    }
    const response = await api.get(`/api/kyc/customer/${custId}`);
    return response.data;
  },

  /**
   * Get a single KYC record by ID
   * @param {string} kycId
   */
  getKYCById: async (kycId) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      const record = mockKYC.find((k) => k.kycId === kycId);
      if (!record) throw new Error(`KYC record ${kycId} not found`);
      return record;
    }
    const response = await api.get(`/api/kyc/${kycId}`);
    return response.data;
  },
};

export default kycService;
