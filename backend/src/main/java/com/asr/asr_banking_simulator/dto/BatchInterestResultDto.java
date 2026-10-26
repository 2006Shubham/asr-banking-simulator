package com.asr.asr_banking_simulator.dto;

import java.math.BigDecimal;

/**
 * BatchInterestResultDto — Data Transfer Object for Batch Cursor Execution
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 12):
 * Captures execution statistics returned by the MySQL cursor-based batch procedure
 * `sp_batch_accrue_monthly_interest` via JDBC CallableStatement.
 * ============================================================================
 */
public class BatchInterestResultDto {

    private int accountsProcessed;
    private BigDecimal totalInterestDisbursed;
    private BigDecimal annualRate;
    private String statusCode;
    private String statusMessage;

    public BatchInterestResultDto() {
    }

    public BatchInterestResultDto(int accountsProcessed, BigDecimal totalInterestDisbursed, BigDecimal annualRate, String statusCode, String statusMessage) {
        this.accountsProcessed = accountsProcessed;
        this.totalInterestDisbursed = totalInterestDisbursed;
        this.annualRate = annualRate;
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }

    public int getAccountsProcessed() {
        return accountsProcessed;
    }

    public void setAccountsProcessed(int accountsProcessed) {
        this.accountsProcessed = accountsProcessed;
    }

    public BigDecimal getTotalInterestDisbursed() {
        return totalInterestDisbursed;
    }

    public void setTotalInterestDisbursed(BigDecimal totalInterestDisbursed) {
        this.totalInterestDisbursed = totalInterestDisbursed;
    }

    public BigDecimal getAnnualRate() {
        return annualRate;
    }

    public void setAnnualRate(BigDecimal annualRate) {
        this.annualRate = annualRate;
    }

    public String getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(String statusCode) {
        this.statusCode = statusCode;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }
}
