package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    Optional<Customer> findByUserId(String userId);
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByAadharNo(String aadharNo);
    List<Customer> findByBranchId(String branchId);
}
