package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, String> {
    Optional<Branch> findByIfscCode(String ifscCode);
    List<Branch> findByCityIgnoreCase(String city);
}
