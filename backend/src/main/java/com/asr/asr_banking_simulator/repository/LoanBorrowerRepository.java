package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.LoanBorrower;
import com.asr.asr_banking_simulator.model.LoanBorrowerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanBorrowerRepository extends JpaRepository<LoanBorrower, LoanBorrowerId> {
    List<LoanBorrower> findByIdLoanId(String loanId);
    List<LoanBorrower> findByIdCustId(String custId);
}
