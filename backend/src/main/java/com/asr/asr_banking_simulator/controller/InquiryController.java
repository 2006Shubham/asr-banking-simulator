package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dao.InquiryDao;
import com.asr.asr_banking_simulator.dto.*;
import com.asr.asr_banking_simulator.model.Customer;
import com.asr.asr_banking_simulator.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * InquiryController — REST API for Role-Based Support & Management
 * ============================================================================
 * Exposes distinct, secure endpoints for:
 * 1. Customer: submit inquiries, track status, reply to threads.
 * 2. Employee: view assigned cases, claim from unassigned queue, post updates & internal notes, escalate.
 * 3. Manager: branch-wide oversight, assignment/reassignment, workload management, SQL analytics.
 * ============================================================================
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class InquiryController {

    private final InquiryDao inquiryDao;
    private final CustomerRepository customerRepo;

    public InquiryController(InquiryDao inquiryDao, CustomerRepository customerRepo) {
        this.inquiryDao = inquiryDao;
        this.customerRepo = customerRepo;
    }

    // ========================================================================
    // 1. CUSTOMER INQUIRY ENDPOINTS
    // ========================================================================

    @PostMapping("/customer/inquiries")
    public ResponseEntity<?> createCustomerInquiry(@RequestBody CreateInquiryRequest req,
                                                   @RequestHeader(value = "X-User-Id", defaultValue = "USR001") String userId) {
        if (req.getCustId() == null || req.getSubject() == null || req.getDescription() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Customer ID, subject, and description are required."));
        }

        try {
            InquiryDto created = inquiryDao.createInquiry(req, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Database error creating inquiry: " + e.getMessage()));
        }
    }

    @GetMapping("/customer/inquiries/customer/{custId}")
    public List<InquiryDto> getCustomerInquiries(@PathVariable String custId) {
        return inquiryDao.findInquiriesByCustomer(custId);
    }

    @GetMapping("/customer/inquiries/{inquiryId}")
    public ResponseEntity<?> getCustomerInquiryById(@PathVariable String inquiryId) {
        return inquiryDao.findInquiryById(inquiryId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/inquiries/{inquiryId}/messages")
    public List<InquiryMessageDto> getCustomerInquiryMessages(@PathVariable String inquiryId) {
        // Customers only receive customer-visible messages (is_internal = FALSE)
        return inquiryDao.findMessagesByInquiryId(inquiryId, false);
    }

    @PostMapping("/customer/inquiries/{inquiryId}/reply")
    public ResponseEntity<?> customerReply(@PathVariable String inquiryId,
                                           @RequestBody Map<String, String> body,
                                           @RequestHeader(value = "X-User-Id", defaultValue = "USR001") String userId) {
        String messageText = body.get("messageText");
        if (messageText == null || messageText.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message text cannot be empty"));
        }

        try {
            InquiryMessageDto msg = inquiryDao.addMessage(inquiryId, userId, "Customer", false, messageText.trim());
            return ResponseEntity.status(HttpStatus.CREATED).body(msg);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to append customer reply: " + e.getMessage()));
        }
    }

    // ========================================================================
    // 2. EMPLOYEE WORKSPACE ENDPOINTS
    // ========================================================================

    @GetMapping("/employee/dashboard-stats")
    public ResponseEntity<?> getEmployeeDashboardStats(@RequestParam(defaultValue = "EMP002") String empId,
                                                       @RequestParam(defaultValue = "BR001") String branchId) {
        List<InquiryDto> assigned = inquiryDao.findInquiriesForEmployee(empId, branchId, "assigned");
        List<InquiryDto> queue = inquiryDao.findInquiriesForEmployee(empId, branchId, "queue");
        List<InquiryDto> allBranch = inquiryDao.findInquiriesForEmployee(empId, branchId, "all_branch");

        long assignedCount = assigned.stream()
                .filter(i -> !"RESOLVED".equalsIgnoreCase(i.getStatus()) && !"CLOSED".equalsIgnoreCase(i.getStatus()))
                .count();

        long inProgressCount = assigned.stream()
                .filter(i -> "IN_PROGRESS".equalsIgnoreCase(i.getStatus()))
                .count();

        long waitingCustomerCount = assigned.stream()
                .filter(i -> "WAITING_FOR_CUSTOMER".equalsIgnoreCase(i.getStatus()))
                .count();

        long resolvedCount = assigned.stream()
                .filter(i -> "RESOLVED".equalsIgnoreCase(i.getStatus()) || "CLOSED".equalsIgnoreCase(i.getStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("assignedActive", assignedCount);
        stats.put("unassignedQueue", queue.size());
        stats.put("inProgress", inProgressCount);
        stats.put("waitingCustomer", waitingCustomerCount);
        stats.put("resolvedByMe", resolvedCount);
        stats.put("totalBranchInquiries", allBranch.size());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/employee/inquiries")
    public List<InquiryDto> getEmployeeInquiries(@RequestParam(defaultValue = "EMP002") String empId,
                                                @RequestParam(defaultValue = "BR001") String branchId,
                                                @RequestParam(defaultValue = "assigned") String filter) {
        return inquiryDao.findInquiriesForEmployee(empId, branchId, filter);
    }

    @PostMapping("/employee/inquiries/{inquiryId}/claim")
    public ResponseEntity<?> claimInquiry(@PathVariable String inquiryId,
                                          @RequestBody Map<String, String> body) {
        String empId = body.get("empId");
        String userId = body.get("userId");

        if (empId == null || userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "empId and userId are required to claim ticket."));
        }

        try {
            boolean success = inquiryDao.claimInquiry(inquiryId, empId, userId);
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Inquiry successfully claimed and assigned."));
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("success", false, "message", "This inquiry has already been claimed or is no longer open."));
            }
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Database error: " + e.getMessage()));
        }
    }

    @PatchMapping("/employee/inquiries/{inquiryId}/status")
    public ResponseEntity<?> updateInquiryStatus(@PathVariable String inquiryId,
                                                 @RequestBody InquiryActionRequest req) {
        if (req.getNewStatus() == null || req.getUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "newStatus and userId are required"));
        }

        try {
            boolean updated = inquiryDao.updateInquiryStatus(inquiryId, req.getNewStatus(), req.getUserId(), req.getEmpId(), req.getRemarks());
            if (updated) {
                return ResponseEntity.ok(Map.of("success", true, "status", req.getNewStatus()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Inquiry not found"));
            }
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update status: " + e.getMessage()));
        }
    }

    @PostMapping("/employee/inquiries/{inquiryId}/messages")
    public ResponseEntity<?> addEmployeeMessage(@PathVariable String inquiryId,
                                                @RequestBody InquiryActionRequest req) {
        if (req.getMessageText() == null || req.getMessageText().isBlank() || req.getUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "messageText and userId are required"));
        }

        String role = req.getUserRole() != null ? req.getUserRole() : "Employee";
        boolean isInternal = Boolean.TRUE.equals(req.getIsInternal());

        try {
            InquiryMessageDto msg = inquiryDao.addMessage(inquiryId, req.getUserId(), role, isInternal, req.getMessageText().trim());
            return ResponseEntity.status(HttpStatus.CREATED).body(msg);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to add message: " + e.getMessage()));
        }
    }

    @PostMapping("/employee/inquiries/{inquiryId}/escalate")
    public ResponseEntity<?> escalateInquiry(@PathVariable String inquiryId,
                                             @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String remarks = body.get("remarks");

        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId is required to escalate"));
        }

        try {
            boolean success = inquiryDao.escalateInquiry(inquiryId, userId, remarks);
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Inquiry escalated to Branch Manager"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Inquiry not found"));
            }
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Database escalation error: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/inquiries/{inquiryId}/messages")
    public List<InquiryMessageDto> getEmployeeInquiryMessages(@PathVariable String inquiryId) {
        // Staff see all messages including internal notes (is_internal = TRUE)
        return inquiryDao.findMessagesByInquiryId(inquiryId, true);
    }

    @GetMapping("/employee/inquiries/{inquiryId}/history")
    public List<InquiryHistoryDto> getInquiryHistory(@PathVariable String inquiryId) {
        return inquiryDao.findHistoryByInquiryId(inquiryId);
    }

    @GetMapping("/employee/customers/search")
    public List<Customer> searchCustomers(@RequestParam(required = false, defaultValue = "") String query) {
        String cleanQuery = query == null ? "" : query.trim().toLowerCase();
        if (cleanQuery.isEmpty()) {
            return customerRepo.findAll();
        }
        return customerRepo.findAll().stream()
                .filter(c -> (c.getCustId() != null && c.getCustId().toLowerCase().contains(cleanQuery)) ||
                             (c.getName() != null && c.getName().toLowerCase().contains(cleanQuery)) ||
                             (c.getPhone() != null && c.getPhone().contains(cleanQuery)) ||
                             (c.getEmail() != null && c.getEmail().toLowerCase().contains(cleanQuery)))
                .toList();
    }

    // ========================================================================
    // 3. MANAGER OVERSIGHT & REPORTING ENDPOINTS
    // ========================================================================

    @GetMapping("/manager/dashboard-stats")
    public ResponseEntity<?> getManagerDashboardStats(@RequestParam(defaultValue = "BR001") String branchId) {
        BranchReportDto report = inquiryDao.getBranchReport(branchId);
        List<EmployeeWorkloadDto> workload = inquiryDao.getEmployeeWorkload(branchId);

        Map<String, Object> response = new HashMap<>();
        response.put("report", report);
        response.put("workload", workload);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/manager/inquiries")
    public List<InquiryDto> getManagerInquiries(@RequestParam(defaultValue = "BR001") String branchId,
                                                @RequestParam(defaultValue = "all_branch") String filter) {
        return inquiryDao.findInquiriesForEmployee(null, branchId, filter);
    }

    @PostMapping("/manager/inquiries/{inquiryId}/assign")
    public ResponseEntity<?> assignInquiryByManager(@PathVariable String inquiryId,
                                                    @RequestBody Map<String, String> body) {
        String targetEmpId = body.get("targetEmpId");
        String managerUserId = body.get("managerUserId");
        String remarks = body.get("remarks");

        if (targetEmpId == null || managerUserId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "targetEmpId and managerUserId are required"));
        }

        try {
            boolean success = inquiryDao.assignInquiry(inquiryId, targetEmpId, managerUserId, remarks);
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Inquiry reassigned to employee " + targetEmpId));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Inquiry not found"));
            }
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Assignment failed: " + e.getMessage()));
        }
    }

    @GetMapping("/manager/employees")
    public List<EmployeeWorkloadDto> getBranchEmployeeWorkload(@RequestParam(defaultValue = "BR001") String branchId) {
        return inquiryDao.getEmployeeWorkload(branchId);
    }

    @GetMapping("/manager/reports/inquiries")
    public BranchReportDto getManagerInquiryReport(@RequestParam(defaultValue = "BR001") String branchId) {
        return inquiryDao.getBranchReport(branchId);
    }
}

