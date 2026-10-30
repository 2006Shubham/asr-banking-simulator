package com.asr.asr_banking_simulator;

import com.asr.asr_banking_simulator.dto.*;
import com.asr.asr_banking_simulator.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class InquiryDtoAndAuthTests {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void testPasswordHashVerification() {
        // Known seed hash from Initialize.sql for 'demo123'
        String samplePassword = "demo123";
        String encodedHash = passwordEncoder.encode(samplePassword);

        assertTrue(passwordEncoder.matches(samplePassword, encodedHash));
        assertFalse(passwordEncoder.matches("wrong_password", encodedHash));
    }

    @Test
    void testInquiryDtoLifecycle() {
        InquiryDto dto = new InquiryDto();
        dto.setInquiryId("INQ1001");
        dto.setCustId("CUST001");
        dto.setCustomerName("Suraj Walke");
        dto.setBranchId("BR001");
        dto.setCategory("Transactions");
        dto.setSubject("Debit query");
        dto.setDescription("Transaction debit question");
        dto.setStatus("OPEN");
        dto.setPriority("High");
        dto.setCreatedAt(LocalDateTime.now());

        assertEquals("INQ1001", dto.getInquiryId());
        assertEquals("OPEN", dto.getStatus());
        assertEquals("High", dto.getPriority());
        assertEquals("CUST001", dto.getCustId());
    }

    @Test
    void testInquiryMessageDtoInternalFlag() {
        InquiryMessageDto staffNote = new InquiryMessageDto();
        staffNote.setMessageId("MSG1001");
        staffNote.setInquiryId("INQ1001");
        staffNote.setSenderRole("Employee");
        staffNote.setInternal(true);
        staffNote.setMessageText("Internal fraud check completed.");

        assertTrue(staffNote.isInternal());
        assertEquals("Employee", staffNote.getSenderRole());

        InquiryMessageDto customerMsg = new InquiryMessageDto();
        customerMsg.setInternal(false);
        assertFalse(customerMsg.isInternal());
    }

    @Test
    void testEmployeeRoleAssociation() {
        Employee emp = new Employee();
        emp.setEmpId("EMP001");
        emp.setUserId("USR101");
        emp.setBranchId("BR001");
        emp.setName("Rajesh Sharma");
        emp.setDesignation("Branch Manager");

        assertEquals("USR101", emp.getUserId());
        assertEquals("Branch Manager", emp.getDesignation());
    }

    @Test
    void testBranchReportDtoMetrics() {
        BranchReportDto report = new BranchReportDto();
        report.setTotalInquiries(10);
        report.setOpenInquiries(2);
        report.setAssignedInquiries(4);
        report.setEscalatedInquiries(1);
        report.setResolvedInquiries(3);
        report.setAvgResolutionHours(4.5);

        assertEquals(10, report.getTotalInquiries());
        assertEquals(2, report.getOpenInquiries());
        assertEquals(4.5, report.getAvgResolutionHours());
    }
}

