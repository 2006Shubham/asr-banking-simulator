package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dto.TransferRequest;
import com.asr.asr_banking_simulator.model.Account;
import com.asr.asr_banking_simulator.model.Transaction;
import com.asr.asr_banking_simulator.repository.AccountRepository;
import com.asr.asr_banking_simulator.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    public TransactionController(TransactionRepository transactionRepo, AccountRepository accountRepo) {
        this.transactionRepo = transactionRepo;
        this.accountRepo = accountRepo;
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepo.findAllByOrderByTxnDateDesc();
    }

    @GetMapping("/account/{accNo}")
    public List<Transaction> getTransactionsByAccount(@PathVariable String accNo) {
        return transactionRepo.findByAccNoOrderByTxnDateDesc(accNo);
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

    @PostMapping("/transfer")
    @Transactional
    public ResponseEntity<?> executeTransfer(@RequestBody TransferRequest request) {
        if (request.getFromAccNo() == null || request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid transfer parameters"));
        }

        Optional<Account> fromAccOpt = accountRepo.findById(request.getFromAccNo());
        if (fromAccOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Source account not found"));
        }

        Account fromAcc = fromAccOpt.get();

        if (fromAcc.getBalance().compareTo(request.getAmount()) < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Insufficient funds for this transfer"));
        }

        // Deduct source account balance
        fromAcc.setBalance(fromAcc.getBalance().subtract(request.getAmount()));
        accountRepo.save(fromAcc);

        String txnId = "TXN" + System.currentTimeMillis();
        String refNo = (request.getChannel() != null ? request.getChannel() : "UPI") + "/" 
                + LocalDateTime.now().getYear() + "/" 
                + String.format("%04d", (int)(Math.random() * 10000));

        String desc = request.getDescription() != null && !request.getDescription().isBlank() 
                ? request.getDescription() 
                : "Transfer to " + (request.getBeneficiary() != null ? request.getBeneficiary() : request.getToAccNo());

        Transaction debitTxn = new Transaction(
                txnId,
                fromAcc.getAccNo(),
                "Debit",
                request.getAmount(),
                LocalDateTime.now(),
                request.getChannel() != null ? request.getChannel() : "UPI",
                "Success",
                refNo,
                desc
        );

        transactionRepo.save(debitTxn);

        // If target account is an internal account in this bank, credit it as well
        if (request.getToAccNo() != null) {
            accountRepo.findById(request.getToAccNo()).ifPresent(toAcc -> {
                toAcc.setBalance(toAcc.getBalance().add(request.getAmount()));
                accountRepo.save(toAcc);

                Transaction creditTxn = new Transaction(
                        "TXN" + (System.currentTimeMillis() + 1),
                        toAcc.getAccNo(),
                        "Credit",
                        request.getAmount(),
                        LocalDateTime.now(),
                        request.getChannel() != null ? request.getChannel() : "UPI",
                        "Success",
                        refNo + "-CR",
                        "Transfer received from " + fromAcc.getAccNo()
                );
                transactionRepo.save(creditTxn);
            });
        }

        return ResponseEntity.ok(Map.of(
                "message", "Transfer executed successfully",
                "transaction", debitTxn,
                "remainingBalance", fromAcc.getBalance()
        ));
    }
}
