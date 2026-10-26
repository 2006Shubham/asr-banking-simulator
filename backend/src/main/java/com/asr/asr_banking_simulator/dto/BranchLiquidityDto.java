package com.asr.asr_banking_simulator.dto;

import java.math.BigDecimal;

/**
 * BranchLiquidityDto — Data Transfer Object for Database View (view_branch_liquidity_summary)
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 8):
 * Represents aggregated branch liquidity metrics queried directly from the
 * virtual SQL view `view_branch_liquidity_summary`.
 * ============================================================================
 */
public class BranchLiquidityDto {

    private String branchId;
    private String branchName;
    private String city;
    private long totalAccounts;
    private BigDecimal totalDeposits;
    private BigDecimal avgAccountBalance;

    public BranchLiquidityDto() {}

    public BranchLiquidityDto(String branchId, String branchName, String city,
                              long totalAccounts, BigDecimal totalDeposits, BigDecimal avgAccountBalance) {
        this.branchId = branchId;
        this.branchName = branchName;
        this.city = city;
        this.totalAccounts = totalAccounts;
        this.totalDeposits = totalDeposits;
        this.avgAccountBalance = avgAccountBalance;
    }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public long getTotalAccounts() { return totalAccounts; }
    public void setTotalAccounts(long totalAccounts) { this.totalAccounts = totalAccounts; }

    public BigDecimal getTotalDeposits() { return totalDeposits; }
    public void setTotalDeposits(BigDecimal totalDeposits) { this.totalDeposits = totalDeposits; }

    public BigDecimal getAvgAccountBalance() { return avgAccountBalance; }
    public void setAvgAccountBalance(BigDecimal avgAccountBalance) { this.avgAccountBalance = avgAccountBalance; }
}
