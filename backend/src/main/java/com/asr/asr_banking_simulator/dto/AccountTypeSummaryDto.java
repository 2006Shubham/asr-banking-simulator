package com.asr.asr_banking_simulator.dto;

import java.math.BigDecimal;

/**
 * AccountTypeSummaryDto — Data Transfer Object for SQL GROUP BY Aggregation
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project):
 * In Relational Algebra, grouping partitions tuples into subsets and computes
 * aggregate functions (COUNT, SUM, AVG) per partition:
 *
 *   γ_{acc_type}, COUNT(acc_no), SUM(balance), AVG(balance)(accounts)
 *
 * This DTO captures the aggregated summary metrics per account type (e.g. Savings,
 * Current) returned from manual JDBC query execution.
 * ============================================================================
 */
public class AccountTypeSummaryDto {

    private String accType;
    private long accountCount;
    private BigDecimal totalBalance;
    private BigDecimal avgBalance;
    private BigDecimal minBalance;
    private BigDecimal maxBalance;

    public AccountTypeSummaryDto() {}

    public AccountTypeSummaryDto(String accType, long accountCount, BigDecimal totalBalance,
                                 BigDecimal avgBalance, BigDecimal minBalance, BigDecimal maxBalance) {
        this.accType = accType;
        this.accountCount = accountCount;
        this.totalBalance = totalBalance;
        this.avgBalance = avgBalance;
        this.minBalance = minBalance;
        this.maxBalance = maxBalance;
    }

    public String getAccType() {
        return accType;
    }

    public void setAccType(String accType) {
        this.accType = accType;
    }

    public long getAccountCount() {
        return accountCount;
    }

    public void setAccountCount(long accountCount) {
        this.accountCount = accountCount;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public void setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
    }

    public BigDecimal getAvgBalance() {
        return avgBalance;
    }

    public void setAvgBalance(BigDecimal avgBalance) {
        this.avgBalance = avgBalance;
    }

    public BigDecimal getMinBalance() {
        return minBalance;
    }

    public void setMinBalance(BigDecimal minBalance) {
        this.minBalance = minBalance;
    }

    public BigDecimal getMaxBalance() {
        return maxBalance;
    }

    public void setMaxBalance(BigDecimal maxBalance) {
        this.maxBalance = maxBalance;
    }
}
