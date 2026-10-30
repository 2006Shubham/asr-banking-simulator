package com.asr.asr_banking_simulator.dto;

import java.time.LocalDateTime;

public class InquiryDto {
    private String inquiryId;
    private String custId;
    private String customerName;
    private String customerPhone;
    private String branchId;
    private String branchName;
    private String accNo;
    private String category;
    private String subject;
    private String description;
    private String priority;
    private String status;
    private String assignedEmpId;
    private String assignedEmpName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private int messagesCount;

    public InquiryDto() {}

    public String getInquiryId() { return inquiryId; }
    public void setInquiryId(String inquiryId) { this.inquiryId = inquiryId; }

    public String getCustId() { return custId; }
    public void setCustId(String custId) { this.custId = custId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getAccNo() { return accNo; }
    public void setAccNo(String accNo) { this.accNo = accNo; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedEmpId() { return assignedEmpId; }
    public void setAssignedEmpId(String assignedEmpId) { this.assignedEmpId = assignedEmpId; }

    public String getAssignedEmpName() { return assignedEmpName; }
    public void setAssignedEmpName(String assignedEmpName) { this.assignedEmpName = assignedEmpName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public int getMessagesCount() { return messagesCount; }
    public void setMessagesCount(int messagesCount) { this.messagesCount = messagesCount; }
}

