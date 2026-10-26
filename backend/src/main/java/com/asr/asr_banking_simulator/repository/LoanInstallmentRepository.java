package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.LoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanInstallmentRepository extends JpaRepository<LoanInstallment, String> {
    List<LoanInstallment> findByLoanIdOrderByInstallmentNoAsc(String loanId);
    List<LoanInstallment> findByLoanIdAndStatus(String loanId, String status);
}
