package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.FdInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FdInterestRepository extends JpaRepository<FdInterest, String> {
    List<FdInterest> findByFdIdOrderByCalcDateAsc(String fdId);
    List<FdInterest> findByFdIdAndStatus(String fdId, String status);
}
