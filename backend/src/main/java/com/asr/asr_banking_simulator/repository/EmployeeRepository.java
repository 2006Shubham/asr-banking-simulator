package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    List<Employee> findByBranchId(String branchId);
    Optional<Employee> findByEmail(String email);
}
