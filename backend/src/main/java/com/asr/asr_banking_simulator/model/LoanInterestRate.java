package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "loan_interest_rates")
public class LoanInterestRate {

    @Id
    @Column(name = "loan_type", length = 50, nullable = false)
    private String loanType;

    @Column(name = "base_interest_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal baseInterestRate;

    @Column(name = "min_tenure", nullable = false)
    private Integer minTenure;

    @Column(name = "max_tenure", nullable = false)
    private Integer maxTenure;

    @Column(name = "description", length = 255, nullable = false)
    private String description;

    public LoanInterestRate() {}

    public LoanInterestRate(String loanType, BigDecimal baseInterestRate, Integer minTenure, Integer maxTenure, String description) {
        this.loanType = loanType;
        this.baseInterestRate = baseInterestRate;
        this.minTenure = minTenure;
        this.maxTenure = maxTenure;
        this.description = description;
    }

    public String getLoanType() { return loanType; }
    public void setLoanType(String loanType) { this.loanType = loanType; }

    public BigDecimal getBaseInterestRate() { return baseInterestRate; }
    public void setBaseInterestRate(BigDecimal baseInterestRate) { this.baseInterestRate = baseInterestRate; }

    public Integer getMinTenure() { return minTenure; }
    public void setMinTenure(Integer minTenure) { this.minTenure = minTenure; }

    public Integer getMaxTenure() { return maxTenure; }
    public void setMaxTenure(Integer maxTenure) { this.maxTenure = maxTenure; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
