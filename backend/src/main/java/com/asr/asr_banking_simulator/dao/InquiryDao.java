package com.asr.asr_banking_simulator.dao;

import com.asr.asr_banking_simulator.dto.*;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * InquiryDao — Explicit SQL & Java JDBC Implementation
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project):
 * This DAO manages the full lifecycle of Customer Inquiries, Support Tickets,
 * Communication Threads, and Managerial Oversight using raw JDBC and manually
 * written SQL queries with PreparedStatement.
 *
 * Core Concepts Illustrated:
 * 1. Parameterized Queries:
 *    All inputs are bound via PreparedStatement to eliminate SQL injection.
 * 2. ACID Transaction Demarcation:
 *    Multi-table mutations (inquiry creation, claim, history log, thread messages)
 *    run under manual transaction control: conn.setAutoCommit(false),
 *    conn.commit(), and conn.rollback().
 * 3. Concurrency Protection (Atomic Conditional Updates):
 *    Ticket claiming uses `WHERE assigned_emp_id IS NULL AND status = 'OPEN'`
 *    to prevent race conditions between concurrent employee claims.
 * 4. SQL Aggregations & Group By:
 *    Management reporting utilizes COUNT(), AVG(), CASE WHEN, and GROUP BY.
 * ============================================================================
 */
@Repository
public class InquiryDao {

    private final DataSource dataSource;

    public InquiryDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Creates a new customer inquiry and logs the initial message and history atomically.
     */
    public InquiryDto createInquiry(CreateInquiryRequest req, String userId) throws SQLException {
        String inquiryId = "INQ" + System.currentTimeMillis() % 1000000;
        String messageId = "MSG" + System.currentTimeMillis() % 1000000;

        String insertInquirySql = """
            INSERT INTO inquiries (inquiry_id, cust_id, branch_id, acc_no, category, subject, description, priority, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', NOW())
        """;

        String insertMessageSql = """
            INSERT INTO inquiry_messages (message_id, inquiry_id, sender_user_id, sender_role, is_internal, message_text, created_at)
            VALUES (?, ?, ?, 'Customer', FALSE, ?, NOW())
        """;

        String insertHistorySql = """
            INSERT INTO inquiry_history (inquiry_id, changed_by_user_id, action, old_status, new_status, remarks, created_at)
            VALUES (?, ?, 'CREATED', NULL, 'OPEN', 'Inquiry registered by customer via NetBanking', NOW())
        """;

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement psInq = conn.prepareStatement(insertInquirySql)) {
                    psInq.setString(1, inquiryId);
                    psInq.setString(2, req.getCustId());
                    psInq.setString(3, req.getBranchId());
                    if (req.getAccNo() != null && !req.getAccNo().isBlank()) {
                        psInq.setString(4, req.getAccNo());
                    } else {
                        psInq.setNull(4, Types.VARCHAR);
                    }
                    psInq.setString(5, req.getCategory());
                    psInq.setString(6, req.getSubject());
                    psInq.setString(7, req.getDescription());
                    psInq.setString(8, req.getPriority() != null ? req.getPriority() : "Medium");
                    psInq.executeUpdate();
                }

                try (PreparedStatement psMsg = conn.prepareStatement(insertMessageSql)) {
                    psMsg.setString(1, messageId);
                    psMsg.setString(2, inquiryId);
                    psMsg.setString(3, userId);
                    psMsg.setString(4, req.getDescription());
                    psMsg.executeUpdate();
                }

                try (PreparedStatement psHist = conn.prepareStatement(insertHistorySql)) {
                    psHist.setString(1, inquiryId);
                    psHist.setString(2, userId);
                    psHist.executeUpdate();
                }

                conn.commit();
            } catch (SQLException ex) {
                conn.rollback();
                throw ex;
            }
        }

        return findInquiryById(inquiryId).orElse(null);
    }

    /**
     * Retrieves all inquiries submitted by a given customer.
     */
    public List<InquiryDto> findInquiriesByCustomer(String custId) {
        String sql = """
            SELECT i.inquiry_id, i.cust_id, c.name AS customer_name, c.phone AS customer_phone,
                   i.branch_id, b.branch_name, i.acc_no, i.category, i.subject, i.description,
                   i.priority, i.status, i.assigned_emp_id, e.name AS assigned_emp_name,
                   i.created_at, i.updated_at, i.resolved_at,
                   (SELECT COUNT(*) FROM inquiry_messages m WHERE m.inquiry_id = i.inquiry_id AND m.is_internal = FALSE) AS messages_count
            FROM inquiries i
            JOIN customers c ON i.cust_id = c.cust_id
            JOIN branches b ON i.branch_id = b.branch_id
            LEFT JOIN employees e ON i.assigned_emp_id = e.emp_id
            WHERE i.cust_id = ?
            ORDER BY i.created_at DESC
        """;

        List<InquiryDto> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, custId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapInquiryDto(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Retrieves inquiries for employees with queue filtering.
     * filter values:
     * - "assigned": assigned to this employee
     * - "queue": unassigned in employee's branch
     * - "all_branch": all inquiries in employee's branch
     */
    public List<InquiryDto> findInquiriesForEmployee(String empId, String branchId, String filter) {
        StringBuilder sql = new StringBuilder("""
            SELECT i.inquiry_id, i.cust_id, c.name AS customer_name, c.phone AS customer_phone,
                   i.branch_id, b.branch_name, i.acc_no, i.category, i.subject, i.description,
                   i.priority, i.status, i.assigned_emp_id, e.name AS assigned_emp_name,
                   i.created_at, i.updated_at, i.resolved_at,
                   (SELECT COUNT(*) FROM inquiry_messages m WHERE m.inquiry_id = i.inquiry_id) AS messages_count
            FROM inquiries i
            JOIN customers c ON i.cust_id = c.cust_id
            JOIN branches b ON i.branch_id = b.branch_id
            LEFT JOIN employees e ON i.assigned_emp_id = e.emp_id
            WHERE\s
        """);

        if ("assigned".equalsIgnoreCase(filter)) {
            sql.append("i.assigned_emp_id = ? ORDER BY i.created_at DESC");
        } else if ("queue".equalsIgnoreCase(filter)) {
            sql.append("i.branch_id = ? AND i.assigned_emp_id IS NULL AND i.status = 'OPEN' ORDER BY i.created_at ASC");
        } else if ("escalated".equalsIgnoreCase(filter)) {
            sql.append("i.branch_id = ? AND i.status = 'ESCALATED' ORDER BY i.created_at DESC");
        } else {
            sql.append("i.branch_id = ? ORDER BY i.created_at DESC");
        }

        List<InquiryDto> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            if ("assigned".equalsIgnoreCase(filter)) {
                ps.setString(1, empId);
            } else {
                ps.setString(1, branchId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapInquiryDto(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Retrieves an individual inquiry by ID.
     */
    public Optional<InquiryDto> findInquiryById(String inquiryId) {
        String sql = """
            SELECT i.inquiry_id, i.cust_id, c.name AS customer_name, c.phone AS customer_phone,
                   i.branch_id, b.branch_name, i.acc_no, i.category, i.subject, i.description,
                   i.priority, i.status, i.assigned_emp_id, e.name AS assigned_emp_name,
                   i.created_at, i.updated_at, i.resolved_at,
                   (SELECT COUNT(*) FROM inquiry_messages m WHERE m.inquiry_id = i.inquiry_id) AS messages_count
            FROM inquiries i
            JOIN customers c ON i.cust_id = c.cust_id
            JOIN branches b ON i.branch_id = b.branch_id
            LEFT JOIN employees e ON i.assigned_emp_id = e.emp_id
            WHERE i.inquiry_id = ?
        """;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, inquiryId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapInquiryDto(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /**
     * Retrieves messages for an inquiry thread.
     * If includeInternal is false, internal staff notes are omitted (for customers).
     */
    public List<InquiryMessageDto> findMessagesByInquiryId(String inquiryId, boolean includeInternal) {
        String sql = """
            SELECT m.message_id, m.inquiry_id, m.sender_user_id, m.sender_role,
                   m.is_internal, m.message_text, m.created_at,
                   COALESCE(c.name, e.name, u.username) AS sender_name
            FROM inquiry_messages m
            JOIN users u ON m.sender_user_id = u.user_id
            LEFT JOIN customers c ON u.user_id = c.user_id
            LEFT JOIN employees e ON u.user_id = e.user_id
            WHERE m.inquiry_id = ?\s
        """ + (includeInternal ? "" : " AND m.is_internal = FALSE ") +
        " ORDER BY m.created_at ASC";

        List<InquiryMessageDto> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, inquiryId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    InquiryMessageDto dto = new InquiryMessageDto();
                    dto.setMessageId(rs.getString("message_id"));
                    dto.setInquiryId(rs.getString("inquiry_id"));
                    dto.setSenderUserId(rs.getString("sender_user_id"));
                    dto.setSenderRole(rs.getString("sender_role"));
                    dto.setSenderName(rs.getString("sender_name"));
                    dto.setInternal(rs.getBoolean("is_internal"));
                    dto.setMessageText(rs.getString("message_text"));
                    Timestamp ts = rs.getTimestamp("created_at");
                    if (ts != null) dto.setCreatedAt(ts.toLocalDateTime());
                    list.add(dto);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Retrieves audit trail history for an inquiry.
     */
    public List<InquiryHistoryDto> findHistoryByInquiryId(String inquiryId) {
        String sql = """
            SELECT h.history_id, h.inquiry_id, h.changed_by_user_id, h.action,
                   h.old_status, h.new_status, h.old_emp_id, h.new_emp_id, h.remarks,
                   h.created_at, COALESCE(c.name, e.name, u.username) AS changed_by_name
            FROM inquiry_history h
            JOIN users u ON h.changed_by_user_id = u.user_id
            LEFT JOIN customers c ON u.user_id = c.user_id
            LEFT JOIN employees e ON u.user_id = e.user_id
            WHERE h.inquiry_id = ?
            ORDER BY h.created_at ASC
        """;

        List<InquiryHistoryDto> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, inquiryId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    InquiryHistoryDto dto = new InquiryHistoryDto();
                    dto.setHistoryId(rs.getLong("history_id"));
                    dto.setInquiryId(rs.getString("inquiry_id"));
                    dto.setChangedByUserId(rs.getString("changed_by_user_id"));
                    dto.setChangedByName(rs.getString("changed_by_name"));
                    dto.setAction(rs.getString("action"));
                    dto.setOldStatus(rs.getString("old_status"));
                    dto.setNewStatus(rs.getString("new_status"));
                    dto.setOldEmpId(rs.getString("old_emp_id"));
                    dto.setNewEmpId(rs.getString("new_emp_id"));
                    dto.setRemarks(rs.getString("remarks"));
                    Timestamp ts = rs.getTimestamp("created_at");
                    if (ts != null) dto.setCreatedAt(ts.toLocalDateTime());
                    list.add(dto);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Atomically claims an unassigned inquiry.
     * Prevents race conditions using conditional SQL:
     * WHERE assigned_emp_id IS NULL AND status = 'OPEN'
     */
    public boolean claimInquiry(String inquiryId, String empId, String userId) throws SQLException {
        String updateSql = """
            UPDATE inquiries
            SET assigned_emp_id = ?, status = 'ASSIGNED', updated_at = NOW()
            WHERE inquiry_id = ? AND assigned_emp_id IS NULL AND status = 'OPEN'
        """;

        String historySql = """
            INSERT INTO inquiry_history (inquiry_id, changed_by_user_id, action, old_status, new_status, old_emp_id, new_emp_id, remarks, created_at)
            VALUES (?, ?, 'CLAIMED', 'OPEN', 'ASSIGNED', NULL, ?, 'Inquiry claimed by employee', NOW())
        """;

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                int rows;
                try (PreparedStatement psUpdate = conn.prepareStatement(updateSql)) {
                    psUpdate.setString(1, empId);
                    psUpdate.setString(2, inquiryId);
                    rows = psUpdate.executeUpdate();
                }

                if (rows == 1) {
                    try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                        psHist.setString(1, inquiryId);
                        psHist.setString(2, userId);
                        psHist.setString(3, empId);
                        psHist.executeUpdate();
                    }
                    conn.commit();
                    return true;
                } else {
                    conn.rollback();
                    return false;
                }
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        }
    }

    /**
     * Updates inquiry status and logs to audit trail.
     */
    public boolean updateInquiryStatus(String inquiryId, String newStatus, String userId, String empId, String remarks) throws SQLException {
        Optional<InquiryDto> existingOpt = findInquiryById(inquiryId);
        if (existingOpt.isEmpty()) return false;
        InquiryDto existing = existingOpt.get();

        String updateSql = """
            UPDATE inquiries
            SET status = ?,
                resolved_at = CASE WHEN ? IN ('RESOLVED', 'CLOSED') THEN NOW() ELSE resolved_at END,
                updated_at = NOW()
            WHERE inquiry_id = ?
        """;

        String historySql = """
            INSERT INTO inquiry_history (inquiry_id, changed_by_user_id, action, old_status, new_status, old_emp_id, new_emp_id, remarks, created_at)
            VALUES (?, ?, 'STATUS_CHANGE', ?, ?, ?, ?, ?, NOW())
        """;

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setString(1, newStatus);
                    ps.setString(2, newStatus);
                    ps.setString(3, inquiryId);
                    ps.executeUpdate();
                }

                try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                    psHist.setString(1, inquiryId);
                    psHist.setString(2, userId);
                    psHist.setString(3, existing.getStatus());
                    psHist.setString(4, newStatus);
                    psHist.setString(5, existing.getAssignedEmpId());
                    psHist.setString(6, existing.getAssignedEmpId());
                    psHist.setString(7, remarks != null ? remarks : "Status updated to " + newStatus);
                    psHist.executeUpdate();
                }

                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        }
    }

    /**
     * Escalates an inquiry to the branch manager.
     */
    public boolean escalateInquiry(String inquiryId, String userId, String remarks) throws SQLException {
        Optional<InquiryDto> existingOpt = findInquiryById(inquiryId);
        if (existingOpt.isEmpty()) return false;
        InquiryDto existing = existingOpt.get();

        String updateSql = "UPDATE inquiries SET status = 'ESCALATED', updated_at = NOW() WHERE inquiry_id = ?";
        String historySql = """
            INSERT INTO inquiry_history (inquiry_id, changed_by_user_id, action, old_status, new_status, old_emp_id, new_emp_id, remarks, created_at)
            VALUES (?, ?, 'ESCALATED', ?, 'ESCALATED', ?, ?, ?, NOW())
        """;

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setString(1, inquiryId);
                    ps.executeUpdate();
                }

                try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                    psHist.setString(1, inquiryId);
                    psHist.setString(2, userId);
                    psHist.setString(3, existing.getStatus());
                    psHist.setString(4, existing.getAssignedEmpId());
                    psHist.setString(5, existing.getAssignedEmpId());
                    psHist.setString(6, remarks != null ? remarks : "Case escalated for managerial decision");
                    psHist.executeUpdate();
                }

                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        }
    }

    /**
     * Assigns or reassigns an inquiry to an employee (Manager action).
     */
    public boolean assignInquiry(String inquiryId, String targetEmpId, String managerUserId, String remarks) throws SQLException {
        Optional<InquiryDto> existingOpt = findInquiryById(inquiryId);
        if (existingOpt.isEmpty()) return false;
        InquiryDto existing = existingOpt.get();

        String updateSql = "UPDATE inquiries SET assigned_emp_id = ?, status = 'ASSIGNED', updated_at = NOW() WHERE inquiry_id = ?";
        String historySql = """
            INSERT INTO inquiry_history (inquiry_id, changed_by_user_id, action, old_status, new_status, old_emp_id, new_emp_id, remarks, created_at)
            VALUES (?, ?, 'ASSIGNED', ?, 'ASSIGNED', ?, ?, ?, NOW())
        """;

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setString(1, targetEmpId);
                    ps.setString(2, inquiryId);
                    ps.executeUpdate();
                }

                try (PreparedStatement psHist = conn.prepareStatement(historySql)) {
                    psHist.setString(1, inquiryId);
                    psHist.setString(2, managerUserId);
                    psHist.setString(3, existing.getStatus());
                    psHist.setString(4, existing.getAssignedEmpId());
                    psHist.setString(5, targetEmpId);
                    psHist.setString(6, remarks != null ? remarks : "Inquiry assigned to staff by branch manager");
                    psHist.executeUpdate();
                }

                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        }
    }

    /**
     * Appends a message or internal note to an inquiry thread.
     */
    public InquiryMessageDto addMessage(String inquiryId, String senderUserId, String senderRole, boolean isInternal, String messageText) throws SQLException {
        String messageId = "MSG" + System.currentTimeMillis() % 1000000;
        String insertSql = """
            INSERT INTO inquiry_messages (message_id, inquiry_id, sender_user_id, sender_role, is_internal, message_text, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        """;

        String touchSql = "UPDATE inquiries SET updated_at = NOW() WHERE inquiry_id = ?";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                    ps.setString(1, messageId);
                    ps.setString(2, inquiryId);
                    ps.setString(3, senderUserId);
                    ps.setString(4, senderRole);
                    ps.setBoolean(5, isInternal);
                    ps.setString(6, messageText);
                    ps.executeUpdate();
                }

                try (PreparedStatement psTouch = conn.prepareStatement(touchSql)) {
                    psTouch.setString(1, inquiryId);
                    psTouch.executeUpdate();
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        }

        List<InquiryMessageDto> messages = findMessagesByInquiryId(inquiryId, true);
        return messages.stream()
                .filter(m -> m.getMessageId().equals(messageId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Calculates employee workload and inquiry distribution using SQL aggregation.
     */
    public List<EmployeeWorkloadDto> getEmployeeWorkload(String branchId) {
        String sql = """
            SELECT e.emp_id, e.name, e.designation, e.email, e.phone, e.status,
                   COUNT(CASE WHEN i.status IN ('ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER') THEN 1 END) AS active_cases,
                   COUNT(CASE WHEN i.status = 'RESOLVED' THEN 1 END) AS resolved_cases,
                   COUNT(CASE WHEN i.status = 'ESCALATED' THEN 1 END) AS escalated_cases
            FROM employees e
            LEFT JOIN inquiries i ON e.emp_id = i.assigned_emp_id
            WHERE e.branch_id = ?
            GROUP BY e.emp_id, e.name, e.designation, e.email, e.phone, e.status
            ORDER BY active_cases DESC, e.name ASC
        """;

        List<EmployeeWorkloadDto> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    EmployeeWorkloadDto dto = new EmployeeWorkloadDto();
                    dto.setEmpId(rs.getString("emp_id"));
                    dto.setName(rs.getString("name"));
                    dto.setDesignation(rs.getString("designation"));
                    dto.setEmail(rs.getString("email"));
                    dto.setPhone(rs.getString("phone"));
                    dto.setStatus(rs.getString("status"));
                    dto.setActiveCases(rs.getInt("active_cases"));
                    dto.setResolvedCases(rs.getInt("resolved_cases"));
                    dto.setEscalatedCases(rs.getInt("escalated_cases"));
                    list.add(dto);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Calculates comprehensive branch-level inquiry analytics.
     */
    public BranchReportDto getBranchReport(String branchId) {
        BranchReportDto report = new BranchReportDto();

        String totalsSql = """
            SELECT COUNT(*) AS total_inquiries,
                   COUNT(CASE WHEN status = 'OPEN' THEN 1 END) AS open_inquiries,
                   COUNT(CASE WHEN status = 'ASSIGNED' THEN 1 END) AS assigned_inquiries,
                   COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS in_progress_inquiries,
                   COUNT(CASE WHEN status = 'ESCALATED' THEN 1 END) AS escalated_inquiries,
                   COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) AS resolved_inquiries,
                   AVG(CASE WHEN resolved_at IS NOT NULL
                            THEN TIMESTAMPDIFF(MINUTE, created_at, resolved_at) / 60.0
                            ELSE NULL END) AS avg_resolution_hours
            FROM inquiries
            WHERE branch_id = ?
        """;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(totalsSql)) {
            ps.setString(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    report.setTotalInquiries(rs.getInt("total_inquiries"));
                    report.setOpenInquiries(rs.getInt("open_inquiries"));
                    report.setAssignedInquiries(rs.getInt("assigned_inquiries"));
                    report.setInProgressInquiries(rs.getInt("in_progress_inquiries"));
                    report.setEscalatedInquiries(rs.getInt("escalated_inquiries"));
                    report.setResolvedInquiries(rs.getInt("resolved_inquiries"));
                    report.setAvgResolutionHours(rs.getDouble("avg_resolution_hours"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // Category breakdown
        String catSql = "SELECT category, COUNT(*) AS cnt FROM inquiries WHERE branch_id = ? GROUP BY category";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(catSql)) {
            ps.setString(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    report.getCategoryBreakdown().put(rs.getString("category"), rs.getInt("cnt"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // Status breakdown
        String statusSql = "SELECT status, COUNT(*) AS cnt FROM inquiries WHERE branch_id = ? GROUP BY status";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(statusSql)) {
            ps.setString(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    report.getStatusBreakdown().put(rs.getString("status"), rs.getInt("cnt"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // Priority breakdown
        String prioSql = "SELECT priority, COUNT(*) AS cnt FROM inquiries WHERE branch_id = ? GROUP BY priority";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(prioSql)) {
            ps.setString(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    report.getPriorityBreakdown().put(rs.getString("priority"), rs.getInt("cnt"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return report;
    }

    /**
     * Helper to map ResultSet row to InquiryDto.
     */
    private InquiryDto mapInquiryDto(ResultSet rs) throws SQLException {
        InquiryDto dto = new InquiryDto();
        dto.setInquiryId(rs.getString("inquiry_id"));
        dto.setCustId(rs.getString("cust_id"));
        dto.setCustomerName(rs.getString("customer_name"));
        dto.setCustomerPhone(rs.getString("customer_phone"));
        dto.setBranchId(rs.getString("branch_id"));
        dto.setBranchName(rs.getString("branch_name"));
        dto.setAccNo(rs.getString("acc_no"));
        dto.setCategory(rs.getString("category"));
        dto.setSubject(rs.getString("subject"));
        dto.setDescription(rs.getString("description"));
        dto.setPriority(rs.getString("priority"));
        dto.setStatus(rs.getString("status"));
        dto.setAssignedEmpId(rs.getString("assigned_emp_id"));
        dto.setAssignedEmpName(rs.getString("assigned_emp_name"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) dto.setCreatedAt(createdAt.toLocalDateTime());

        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) dto.setUpdatedAt(updatedAt.toLocalDateTime());

        Timestamp resolvedAt = rs.getTimestamp("resolved_at");
        if (resolvedAt != null) dto.setResolvedAt(resolvedAt.toLocalDateTime());

        dto.setMessagesCount(rs.getInt("messages_count"));
        return dto;
    }
}

