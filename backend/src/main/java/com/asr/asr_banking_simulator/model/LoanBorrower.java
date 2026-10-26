package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "loan_borrows")
public class LoanBorrower {

    @EmbeddedId
    private LoanBorrowerId id;

    @Column(name = "borrower_type", length = 20, nullable = false)
    private String borrowerType = "Primary";

    @Column(name = "added_on", nullable = false)
    private LocalDate addedOn;

    public LoanBorrower() {}

    public LoanBorrower(LoanBorrowerId id, String borrowerType, LocalDate addedOn) {
        this.id = id;
        this.borrowerType = borrowerType;
        this.addedOn = addedOn;
    }

    public LoanBorrower(String loanId, String custId, String borrowerType, LocalDate addedOn) {
        this.id = new LoanBorrowerId(loanId, custId);
        this.borrowerType = borrowerType;
        this.addedOn = addedOn;
    }

    public LoanBorrowerId getId() { return id; }
    public void setId(LoanBorrowerId id) { this.id = id; }

    public String getLoanId() { return id != null ? id.getLoanId() : null; }
    public String getCustId() { return id != null ? id.getCustId() : null; }

    public String getBorrowerType() { return borrowerType; }
    public void setBorrowerType(String borrowerType) { this.borrowerType = borrowerType; }

    public LocalDate getAddedOn() { return addedOn; }
    public void setAddedOn(LocalDate addedOn) { this.addedOn = addedOn; }
}
