package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan_installments")
public class LoanInstallment {

    @Id
    @Column(name = "installment_id", length = 20, nullable = false)
    private String installmentId;

    @Column(name = "loan_id", length = 20, nullable = false)
    private String loanId;

    @Column(name = "installment_no", nullable = false)
    private Integer installmentNo;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "paid_on")
    private LocalDate paidOn;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Pending";

    public LoanInstallment() {}

    public LoanInstallment(String installmentId, String loanId, Integer installmentNo, LocalDate dueDate, BigDecimal amount, LocalDate paidOn, String status) {
        this.installmentId = installmentId;
        this.loanId = loanId;
        this.installmentNo = installmentNo;
        this.dueDate = dueDate;
        this.amount = amount;
        this.paidOn = paidOn;
        this.status = status;
    }

    public String getInstallmentId() { return installmentId; }
    public void setInstallmentId(String installmentId) { this.installmentId = installmentId; }

    public String getLoanId() { return loanId; }
    public void setLoanId(String loanId) { this.loanId = loanId; }

    public Integer getInstallmentNo() { return installmentNo; }
    public void setInstallmentNo(Integer installmentNo) { this.installmentNo = installmentNo; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getPaidOn() { return paidOn; }
    public void setPaidOn(LocalDate paidOn) { this.paidOn = paidOn; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
