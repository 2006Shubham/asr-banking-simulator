package com.asr.asr_banking_simulator.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * CustomerAccountBranchDto — Flattened Data Transfer Object for 3-Table SQL JOIN
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project):
 * In relational databases, normalized data is partitioned across multiple tables
 * (customers, accounts, branches) to eliminate redundancy (3NF).
 *
 * When an application screen needs to display an account alongside its customer
 * owner and its home branch details, a multi-table SQL JOIN is executed.
 * This DTO receives the tabular result set rows and encapsulates the combined data
 * into a structured Java object suitable for JSON transmission to React.
 * ============================================================================
 */
public class CustomerAccountBranchDto {

    // Customer Demographics (from `customers` table)
    private String custId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Account Contract Details (from `accounts` table)
    private String accNo;
    private String accType;
    private BigDecimal balance;
    private LocalDate openDate;
    private String accountStatus;

    // Home Branch Details (from `branches` table)
    private String branchId;
    private String branchName;
    private String ifscCode;
    private String branchCity;

    public CustomerAccountBranchDto() {}

    public CustomerAccountBranchDto(String custId, String customerName, String customerEmail, String customerPhone,
                                    String accNo, String accType, BigDecimal balance, LocalDate openDate,
                                    String accountStatus, String branchId, String branchName, String ifscCode,
                                    String branchCity) {
        this.custId = custId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.accNo = accNo;
        this.accType = accType;
        this.balance = balance;
        this.openDate = openDate;
        this.accountStatus = accountStatus;
        this.branchId = branchId;
        this.branchName = branchName;
        this.ifscCode = ifscCode;
        this.branchCity = branchCity;
    }

    public String getCustId() { return custId; }
    public void setCustId(String custId) { this.custId = custId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getAccNo() { return accNo; }
    public void setAccNo(String accNo) { this.accNo = accNo; }

    public String getAccType() { return accType; }
    public void setAccType(String accType) { this.accType = accType; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public LocalDate getOpenDate() { return openDate; }
    public void setOpenDate(LocalDate openDate) { this.openDate = openDate; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getBranchCity() { return branchCity; }
    public void setBranchCity(String branchCity) { this.branchCity = branchCity; }
}
