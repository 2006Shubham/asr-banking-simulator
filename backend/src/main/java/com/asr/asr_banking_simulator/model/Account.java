package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @Column(name = "acc_no", length = 30, nullable = false)
    private String accNo;

    @Column(name = "cust_id", length = 20, nullable = false)
    private String custId;

    @Column(name = "branch_id", length = 20, nullable = false)
    private String branchId;

    @Column(name = "acc_type", length = 20, nullable = false)
    private String accType;

    @Column(name = "balance", precision = 15, scale = 2, nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "open_date", nullable = false)
    private LocalDate openDate;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Active";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Account() {}

    public Account(String accNo, String custId, String branchId, String accType, BigDecimal balance, LocalDate openDate, String status) {
        this.accNo = accNo;
        this.custId = custId;
        this.branchId = branchId;
        this.accType = accType;
        this.balance = balance;
        this.openDate = openDate;
        this.status = status;
    }

    public String getAccNo() { return accNo; }
    public void setAccNo(String accNo) { this.accNo = accNo; }

    public String getCustId() { return custId; }
    public void setCustId(String custId) { this.custId = custId; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getAccType() { return accType; }
    public void setAccType(String accType) { this.accType = accType; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public LocalDate getOpenDate() { return openDate; }
    public void setOpenDate(LocalDate openDate) { this.openDate = openDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Transient
    private String branchName;

    @Transient
    private String ifscCode;

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
}
