import api from "./api";

/**
 * ASR Bank — Inquiry Service
 * Connects Customer, Employee, and Manager frontend pages to
 * the Spring Boot InquiryController via real backend API calls.
 * No mock mode — all data comes from MySQL through InquiryDao.
 */
const inquiryService = {
  // ─── CUSTOMER ────────────────────────────────────────────────────────────

  /** Create a new customer inquiry (POST /api/customer/inquiries) */
  createInquiry: async (payload, userId) => {
    const response = await api.post("/api/customer/inquiries", payload, {
      headers: { "X-User-Id": userId },
    });
    return response.data;
  },

  /** Fetch all inquiries for a specific customer */
  getCustomerInquiries: async (custId) => {
    const response = await api.get(`/api/customer/inquiries/customer/${custId}`);
    return response.data;
  },

  /** Get a single inquiry by ID */
  getInquiryById: async (inquiryId) => {
    const response = await api.get(`/api/customer/inquiries/${inquiryId}`);
    return response.data;
  },

  /** Get customer-visible messages for an inquiry (internal notes excluded) */
  getCustomerMessages: async (inquiryId) => {
    const response = await api.get(`/api/customer/inquiries/${inquiryId}/messages`);
    return response.data;
  },

  /** Customer replies to an open inquiry */
  customerReply: async (inquiryId, messageText, userId) => {
    const response = await api.post(
      `/api/customer/inquiries/${inquiryId}/reply`,
      { messageText },
      { headers: { "X-User-Id": userId } }
    );
    return response.data;
  },

  // ─── EMPLOYEE ────────────────────────────────────────────────────────────

  /** Get employee dashboard stats (counts by status category) */
  getEmployeeDashboardStats: async (empId, branchId) => {
    const response = await api.get("/api/employee/dashboard-stats", {
      params: { empId, branchId },
    });
    return response.data;
  },

  /**
   * Get employee inquiries with filter:
   * "assigned" (mine), "queue" (unassigned branch), "all_branch", "escalated"
   */
  getEmployeeInquiries: async (empId, branchId, filter = "assigned") => {
    const response = await api.get("/api/employee/inquiries", {
      params: { empId, branchId, filter },
    });
    return response.data;
  },

  /** Atomically claim an unassigned ticket from the queue */
  claimInquiry: async (inquiryId, empId, userId) => {
    const response = await api.post(`/api/employee/inquiries/${inquiryId}/claim`, {
      empId,
      userId,
    });
    return response.data;
  },

  /** Update inquiry status (IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED, etc.) */
  updateInquiryStatus: async (inquiryId, newStatus, userId, empId, remarks) => {
    const response = await api.patch(`/api/employee/inquiries/${inquiryId}/status`, {
      newStatus,
      userId,
      empId,
      remarks,
    });
    return response.data;
  },

  /** Add employee response or internal staff note to an inquiry */
  addEmployeeMessage: async (inquiryId, messageText, userId, userRole, isInternal = false) => {
    const response = await api.post(`/api/employee/inquiries/${inquiryId}/messages`, {
      messageText,
      userId,
      userRole,
      isInternal,
    });
    return response.data;
  },

  /** Escalate inquiry to Branch Manager */
  escalateInquiry: async (inquiryId, userId, remarks) => {
    const response = await api.post(`/api/employee/inquiries/${inquiryId}/escalate`, {
      userId,
      remarks,
    });
    return response.data;
  },

  /** Get all messages for an inquiry (staff can see internal notes) */
  getEmployeeMessages: async (inquiryId) => {
    const response = await api.get(`/api/employee/inquiries/${inquiryId}/messages`);
    return response.data;
  },

  /** Get full audit trail history for an inquiry */
  getInquiryHistory: async (inquiryId) => {
    const response = await api.get(`/api/employee/inquiries/${inquiryId}/history`);
    return response.data;
  },

  /** Search customers by name, ID, phone, or email */
  searchCustomers: async (query) => {
    const response = await api.get("/api/employee/customers/search", {
      params: { query },
    });
    return response.data;
  },

  // ─── MANAGER ─────────────────────────────────────────────────────────────

  /** Get branch overview KPIs (report + workload) */
  getManagerDashboardStats: async (branchId) => {
    const response = await api.get("/api/manager/dashboard-stats", {
      params: { branchId },
    });
    return response.data;
  },

  /** Get all branch inquiries with optional filter ("all_branch", "escalated") */
  getManagerInquiries: async (branchId, filter = "all_branch") => {
    const response = await api.get("/api/manager/inquiries", {
      params: { branchId, filter },
    });
    return response.data;
  },

  /** Assign/reassign an inquiry to a specific employee (Manager action) */
  assignInquiry: async (inquiryId, targetEmpId, managerUserId, remarks) => {
    const response = await api.post(`/api/manager/inquiries/${inquiryId}/assign`, {
      targetEmpId,
      managerUserId,
      remarks,
    });
    return response.data;
  },

  /** Get employee workload distribution for the branch */
  getEmployeeWorkload: async (branchId) => {
    const response = await api.get("/api/manager/employees", {
      params: { branchId },
    });
    return response.data;
  },

  /** Get full branch report with aggregated SQL metrics */
  getBranchReport: async (branchId) => {
    const response = await api.get("/api/manager/reports/inquiries", {
      params: { branchId },
    });
    return response.data;
  },
};

export default inquiryService;

