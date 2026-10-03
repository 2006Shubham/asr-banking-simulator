/**
 * ASR Bank - API Service Layer
 * ============================================================================
 * Central access point for all API services communicating with Spring Boot REST
 * endpoints (or mock data store when VITE_USE_MOCK=true).
 *
 * Current:
 *   Component ──> Service ──> Mock Data Store (src/data/mockData.js)
 *
 * Future (Production Spring Boot):
 *   Component ──> Service ──> Axios (src/services/api.js) ──> Spring Boot API ──> MySQL
 * ============================================================================
 */

export { default as api } from "./api";
export { default as authService } from "./authService";
export { default as customerService } from "./customerService";
export { default as accountService } from "./accountService";
export { default as transactionService } from "./transactionService";
export { default as loanService } from "./loanService";
export { default as loanInstallmentService } from "./loanInstallmentService";
export { default as fdService } from "./fdService";
export { default as fdInterestService } from "./fdInterestService";
export { default as cardService } from "./cardService";
export { default as kycService } from "./kycService";
