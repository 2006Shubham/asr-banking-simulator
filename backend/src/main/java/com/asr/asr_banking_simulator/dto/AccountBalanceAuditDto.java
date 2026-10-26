package com.asr.asr_banking_simulator.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AccountBalanceAuditDto — Data Transfer Object for Database Trigger Audit Log
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 11):
 * Captures records written automatically by the MySQL AFTER UPDATE trigger
 * `trg_accounts_after_update` to `account_balance_audit_log`.
 * ============================================================================
 */
public class AccountBalanceAuditDto {

    private Long auditId;
    private String accNo;
    private BigDecimal oldBalance;
    private BigDecimal newBalance;
    private BigDecimal deltaAmount;
    private String changeType;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime changedAt;
    private String dbUser;
    private String triggerEvent;

    public AccountBalanceAuditDto() {
    }

    public AccountBalanceAuditDto(Long auditId, String accNo, BigDecimal oldBalance, BigDecimal newBalance,
                                  BigDecimal deltaAmount, String changeType, String oldStatus, String newStatus,
                                  LocalDateTime changedAt, String dbUser, String triggerEvent) {
        this.auditId = auditId;
        this.accNo = accNo;
        this.oldBalance = oldBalance;
        this.newBalance = newBalance;
        this.deltaAmount = deltaAmount;
        this.changeType = changeType;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedAt = changedAt;
        this.dbUser = dbUser;
        this.triggerEvent = triggerEvent;
    }

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public String getAccNo() {
        return accNo;
    }

    public void setAccNo(String accNo) {
        this.accNo = accNo;
    }

    public BigDecimal getOldBalance() {
        return oldBalance;
    }

    public void setOldBalance(BigDecimal oldBalance) {
        this.oldBalance = oldBalance;
    }

    public BigDecimal getNewBalance() {
        return newBalance;
    }

    public void setNewBalance(BigDecimal newBalance) {
        this.newBalance = newBalance;
    }

    public BigDecimal getDeltaAmount() {
        return deltaAmount;
    }

    public void setDeltaAmount(BigDecimal deltaAmount) {
        this.deltaAmount = deltaAmount;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public String getOldStatus() {
        return oldStatus;
    }

    public void setOldStatus(String oldStatus) {
        this.oldStatus = oldStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
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

    public String getTriggerEvent() {
        return triggerEvent;
    }

    public void setTriggerEvent(String triggerEvent) {
        this.triggerEvent = triggerEvent;
    }
}
