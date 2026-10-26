package com.asr.asr_banking_simulator.dto;

import java.math.BigDecimal;

/**
 * FdMaturityQuoteDto — Data Transfer Object for Stored Function fn_calculate_fd_maturity
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 10):
 * Returns compound interest maturity calculation performed directly by the
 * database user-defined function (UDF).
 * ============================================================================
 */
public class FdMaturityQuoteDto {

    private BigDecimal principal;
    private BigDecimal annualRate;
    private int durationMonths;
    private BigDecimal maturityAmount;

    public FdMaturityQuoteDto() {
    }

    public FdMaturityQuoteDto(BigDecimal principal, BigDecimal annualRate, int durationMonths, BigDecimal maturityAmount) {
        this.principal = principal;
        this.annualRate = annualRate;
        this.durationMonths = durationMonths;
        this.maturityAmount = maturityAmount;
    }

    public BigDecimal getPrincipal() {
        return principal;
    }

    public void setPrincipal(BigDecimal principal) {
        this.principal = principal;
    }

    public BigDecimal getAnnualRate() {
        return annualRate;
    }

    public void setAnnualRate(BigDecimal annualRate) {
        this.annualRate = annualRate;
    }

    public int getDurationMonths() {
        return durationMonths;
    }

    public void setDurationMonths(int durationMonths) {
        this.durationMonths = durationMonths;
    }

    public BigDecimal getMaturityAmount() {
        return maturityAmount;
    }

    public void setMaturityAmount(BigDecimal maturityAmount) {
        this.maturityAmount = maturityAmount;
    }
}
