package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.Kyc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KycRepository extends JpaRepository<Kyc, String> {
    List<Kyc> findByCustId(String custId);
    List<Kyc> findByCustIdAndStatus(String custId, String status);
}
