package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dto.StatusUpdateRequest;
import com.asr.asr_banking_simulator.model.Account;
import com.asr.asr_banking_simulator.repository.AccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AccountController {

    private final AccountRepository accountRepo;

    public AccountController(AccountRepository accountRepo) {
        this.accountRepo = accountRepo;
    }

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountRepo.findAll();
    }

    @GetMapping("/customer/{custId}")
    public List<Account> getAccountsByCustomer(@PathVariable String custId) {
        return accountRepo.findByCustId(custId);
    }

    @GetMapping("/{accNo}")
    public ResponseEntity<?> getAccountByNumber(@PathVariable String accNo) {
        return accountRepo.findById(accNo)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        if (account.getOpenDate() == null) {
            account.setOpenDate(LocalDate.now());
        }
        if (account.getStatus() == null) {
            account.setStatus("Active");
        }
        Account saved = accountRepo.save(account);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{accNo}/status")
    public ResponseEntity<?> updateAccountStatus(@PathVariable String accNo, @RequestBody StatusUpdateRequest request) {
        return accountRepo.findById(accNo).map(acc -> {
            acc.setStatus(request.getStatus());
            Account saved = accountRepo.save(acc);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
