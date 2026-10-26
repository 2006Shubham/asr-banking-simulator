package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.FixedDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FixedDepositRepository extends JpaRepository<FixedDeposit, String> {
    List<FixedDeposit> findByCustId(String custId);
    List<FixedDeposit> findByBranchId(String branchId);
    List<FixedDeposit> findByStatus(String status);
}
