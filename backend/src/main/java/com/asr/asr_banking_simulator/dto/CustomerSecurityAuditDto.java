package com.asr.asr_banking_simulator.dto;

import java.time.LocalDateTime;

/**
 * CustomerSecurityAuditDto — Data Transfer Object for Customer Security Audit Log
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 11):
 * Captures records written automatically by the MySQL AFTER UPDATE trigger
 * `trg_customers_after_update` when sensitive customer PII is modified.
 * ============================================================================
 */
public class CustomerSecurityAuditDto {

    private Long logId;
    private String custId;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private LocalDateTime changedAt;
    private String dbUser;

    public CustomerSecurityAuditDto() {
    }

    public CustomerSecurityAuditDto(Long logId, String custId, String fieldName, String oldValue, String newValue, LocalDateTime changedAt, String dbUser) {
        this.logId = logId;
        this.custId = custId;
        this.fieldName = fieldName;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.changedAt = changedAt;
        this.dbUser = dbUser;
    }

    public Long getLogId() {
        return logId;
    }

    public void setLogId(Long logId) {
        this.logId = logId;
    }

    public String getCustId() {
        return custId;
    }

    public void setCustId(String custId) {
        this.custId = custId;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }

    public String getDbUser() {
        return dbUser;
    }

    public void setDbUser(String dbUser) {
        this.dbUser = dbUser;
    }
}
