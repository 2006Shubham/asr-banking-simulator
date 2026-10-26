package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    List<Account> findByCustId(String custId);
    List<Account> findByBranchId(String branchId);
    List<Account> findByStatus(String status);
}
