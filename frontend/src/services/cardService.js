import api from "./api";
import { mockCards } from "../data/mockData";

/**
 * ASR Bank - Card Service
 * Decoupled data layer for customer debit and credit cards.
 * Ready for future Spring Boot REST API:
 *   GET /api/cards/customer/{custId}
 *   PATCH /api/cards/{cardNo}/status
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const cardService = {
  /**
   * Get all cards for a customer
   * @param {string} custId
   */
  getCardsByCustomer: async (custId = "CUST001") => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockCards.filter((card) => card.custId === custId);
    }
    const response = await api.get(`/api/cards/customer/${custId}`);
    return response.data;
  },

  /**
   * Get all cards (for admin or lookup)
   */
  getAllCards: async () => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockCards;
    }
    const response = await api.get("/api/cards");
    return response.data;
  },
};

export default cardService;
