package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
public class Loan {

    @Id
    @Column(name = "loan_id", length = 20, nullable = false)
    private String loanId;

    @Column(name = "branch_id", length = 20, nullable = false)
    private String branchId;

    @Column(name = "loan_type", length = 50, nullable = false)
    private String loanType;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "interest_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal interestRate;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Column(name = "sanction_date", nullable = false)
    private LocalDate sanctionDate;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Active";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Loan() {}

    public Loan(String loanId, String branchId, String loanType, BigDecimal amount, BigDecimal interestRate, Integer durationMonths, LocalDate sanctionDate, LocalDate issueDate, String status) {
        this.loanId = loanId;
        this.branchId = branchId;
        this.loanType = loanType;
        this.amount = amount;
        this.interestRate = interestRate;
        this.durationMonths = durationMonths;
        this.sanctionDate = sanctionDate;
        this.issueDate = issueDate;
        this.status = status;
    }

    public String getLoanId() { return loanId; }
    public void setLoanId(String loanId) { this.loanId = loanId; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getLoanType() { return loanType; }
    public void setLoanType(String loanType) { this.loanType = loanType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public Integer getDurationMonths() { return durationMonths; }
    public Integer getTenure() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }

    public LocalDate getSanctionDate() { return sanctionDate; }
    public void setSanctionDate(LocalDate sanctionDate) { this.sanctionDate = sanctionDate; }

    public LocalDate getIssueDate() { return issueDate; }
    public LocalDate getStartDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
