package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dao.AccountDao;
import com.asr.asr_banking_simulator.dao.TransactionDao;
import com.asr.asr_banking_simulator.dto.TransferRequest;
import com.asr.asr_banking_simulator.model.Account;
import com.asr.asr_banking_simulator.model.Transaction;
import com.asr.asr_banking_simulator.repository.AccountRepository;
import com.asr.asr_banking_simulator.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class TransactionController {

    private final TransactionRepository transactionRepo;
    private final AccountRepository accountRepo;
    private final TransactionDao transactionDao;
    private final AccountDao accountDao;

    public TransactionController(TransactionRepository transactionRepo, AccountRepository accountRepo,
                                 TransactionDao transactionDao, AccountDao accountDao) {
        this.transactionRepo = transactionRepo;
        this.accountRepo = accountRepo;
        this.transactionDao = transactionDao;
        this.accountDao = accountDao;
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepo.findAllByOrderByTxnDateDesc();
    }

    /**
     * READ: Retrieves account transactions using manual SQL via TransactionDao & JDBC.
     */
    @GetMapping("/account/{accNo}")
    public List<Transaction> getTransactionsByAccount(@PathVariable String accNo) {
        return transactionDao.findTransactionsByAccount(accNo);
    }

    @GetMapping("/{txnId}")
    public ResponseEntity<?> getTransactionById(@PathVariable String txnId) {
        return transactionRepo.findById(txnId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction txn) {
        if (txn.getTxnDate() == null) {
            txn.setTxnDate(LocalDateTime.now());
        }
        if (txn.getStatus() == null) {
            txn.setStatus("Success");
        }
        if (txn.getRefNo() == null) {
            txn.setRefNo("TXN/" + System.currentTimeMillis() + "/" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        }
        Transaction saved = transactionRepo.save(txn);
        return ResponseEntity.ok(saved);
    }

    /**
     * STAGE 6: ATOMIC FUND TRANSFER VIA PURE JDBC TRANSACTION
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Directly executes multi-step transfer with conn.setAutoCommit(false),
     * row-level locking (SELECT ... FOR UPDATE), and explicit rollback on failure.
     * ============================================================================
     */
    @PostMapping("/transfer")
    public ResponseEntity<?> executeTransfer(@RequestBody TransferRequest request) {
        try {
            Transaction debitTxn = transactionDao.transferFundsWithAcid(request);
            BigDecimal remainingBalance = accountDao.findAccountByNumber(request.getFromAccNo())
                    .map(Account::getBalance)
                    .orElse(BigDecimal.ZERO);

            return ResponseEntity.ok(Map.of(
                    "message", "Transfer executed successfully under ACID transaction guarantees",
                    "transaction", debitTxn,
                    "remainingBalance", remainingBalance
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Database transaction failed and was rolled back: " + e.getMessage()));
        }
    }
}

