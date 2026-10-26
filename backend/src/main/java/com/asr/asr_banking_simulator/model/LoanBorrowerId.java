package com.asr.asr_banking_simulator.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class LoanBorrowerId implements Serializable {

    @Column(name = "loan_id", length = 20, nullable = false)
    private String loanId;

    @Column(name = "cust_id", length = 20, nullable = false)
    private String custId;

    public LoanBorrowerId() {}

    public LoanBorrowerId(String loanId, String custId) {
        this.loanId = loanId;
        this.custId = custId;
    }

    public String getLoanId() { return loanId; }
    public void setLoanId(String loanId) { this.loanId = loanId; }

    public String getCustId() { return custId; }
    public void setCustId(String custId) { this.custId = custId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LoanBorrowerId that = (LoanBorrowerId) o;
        return Objects.equals(loanId, that.loanId) && Objects.equals(custId, that.custId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(loanId, custId);
    }
}
