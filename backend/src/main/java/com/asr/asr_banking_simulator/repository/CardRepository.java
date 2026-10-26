package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, String> {
    List<Card> findByCustId(String custId);
    List<Card> findByAccNo(String accNo);
    List<Card> findByCustIdAndStatus(String custId, String status);
}
