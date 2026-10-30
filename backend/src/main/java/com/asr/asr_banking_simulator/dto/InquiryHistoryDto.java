package com.asr.asr_banking_simulator.dto;

import java.time.LocalDateTime;

public class InquiryHistoryDto {
    private Long historyId;
    private String inquiryId;
    private String changedByUserId;
    private String changedByName;
    private String action;
    private String oldStatus;
    private String newStatus;
    private String oldEmpId;
    private String newEmpId;
    private String remarks;
    private LocalDateTime createdAt;

    public InquiryHistoryDto() {}

    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }

    public String getInquiryId() { return inquiryId; }
    public void setInquiryId(String inquiryId) { this.inquiryId = inquiryId; }

    public String getChangedByUserId() { return changedByUserId; }
    public void setChangedByUserId(String changedByUserId) { this.changedByUserId = changedByUserId; }

    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getOldStatus() { return oldStatus; }
    public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getOldEmpId() { return oldEmpId; }
    public void setOldEmpId(String oldEmpId) { this.oldEmpId = oldEmpId; }

    public String getNewEmpId() { return newEmpId; }
    public void setNewEmpId(String newEmpId) { this.newEmpId = newEmpId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

