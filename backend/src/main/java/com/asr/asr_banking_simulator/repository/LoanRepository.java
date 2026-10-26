package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, String> {

    List<Loan> findByBranchId(String branchId);
    List<Loan> findByStatus(String status);

    /**
     * Query all loans associated with a customer through the loan_borrows junction table.
     */
    @Query("SELECT l FROM Loan l, LoanBorrower lb WHERE l.loanId = lb.id.loanId AND lb.id.custId = :custId")
    List<Loan> findLoansByCustomerId(@Param("custId") String custId);
}
