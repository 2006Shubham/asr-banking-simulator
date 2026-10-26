package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.LoanInterestRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanInterestRateRepository extends JpaRepository<LoanInterestRate, String> {
}
