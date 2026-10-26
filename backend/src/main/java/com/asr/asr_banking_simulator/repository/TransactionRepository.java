package com.asr.asr_banking_simulator.repository;

import com.asr.asr_banking_simulator.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByAccNoOrderByTxnDateDesc(String accNo);
    List<Transaction> findAllByOrderByTxnDateDesc();
    Optional<Transaction> findByRefNo(String refNo);
}
