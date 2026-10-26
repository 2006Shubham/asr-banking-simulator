package com.asr.asr_banking_simulator.dto;

import java.math.BigDecimal;

/**
 * CustomerPortfolioSummaryDto — Data Transfer Object for JOIN + GROUP BY Aggregations
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project):
 * Represents the result of aggregating accounts for a specific customer:
 *
 *   γ_{c.cust_id, c.name}, COUNT(a.acc_no), SUM(a.balance), AVG(a.balance)(customers ⟕ accounts)
 *
 * This provides the customer's total financial portfolio summary across all their
 * active accounts using SQL aggregate functions.
 * ============================================================================
 */
public class CustomerPortfolioSummaryDto {

    private String custId;
    private String customerName;
    private int totalAccounts;
    private BigDecimal totalBalance;
    private BigDecimal avgBalance;

    public CustomerPortfolioSummaryDto() {}

    public CustomerPortfolioSummaryDto(String custId, String customerName, int totalAccounts,
                                       BigDecimal totalBalance, BigDecimal avgBalance) {
        this.custId = custId;
        this.customerName = customerName;
        this.totalAccounts = totalAccounts;
        this.totalBalance = totalBalance;
        this.avgBalance = avgBalance;
    }

    public String getCustId() {
        return custId;
    }

    public void setCustId(String custId) {
        this.custId = custId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public int getTotalAccounts() {
        return totalAccounts;
    }

    public void setTotalAccounts(int totalAccounts) {
        this.totalAccounts = totalAccounts;
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
}
