package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dao.AccountDao;
import com.asr.asr_banking_simulator.dto.AccountTypeSummaryDto;
import com.asr.asr_banking_simulator.dto.BranchLiquidityDto;
import com.asr.asr_banking_simulator.dto.CustomerAccountBranchDto;
import com.asr.asr_banking_simulator.dto.CustomerPortfolioSummaryDto;
import com.asr.asr_banking_simulator.dto.CustomerTierDto;
import com.asr.asr_banking_simulator.dto.FdMaturityQuoteDto;
import com.asr.asr_banking_simulator.dto.StatusUpdateRequest;
import com.asr.asr_banking_simulator.model.Account;
import com.asr.asr_banking_simulator.model.Customer;
import com.asr.asr_banking_simulator.repository.AccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AccountController {

    private final AccountRepository accountRepo;
    private final AccountDao accountDao;

    public AccountController(AccountRepository accountRepo, AccountDao accountDao) {
        this.accountRepo = accountRepo;
        this.accountDao = accountDao;
    }

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountDao.findAllAccounts();
    }

    /**
     * READ: Retrieves accounts for a customer using our manually written SQL via AccountDao & JDBC.
     */
    @GetMapping("/customer/{custId}")
    public List<Account> getAccountsByCustomer(@PathVariable String custId) {
        return accountDao.findAccountsByCustomerId(custId);
    }

    /**
     * MULTI-TABLE JOIN: Retrieves accounts joined with customer details and branch details.
     * Uses 3-Table SQL INNER JOIN executed via JDBC in AccountDao.
     */
    @GetMapping("/customer/{custId}/details")
    public List<CustomerAccountBranchDto> getCustomerAccountsWithBranch(@PathVariable String custId) {
        return accountDao.findCustomerAccountsWithBranch(custId);
    }

    /**
     * STAGE 4 AGGREGATION: Retrieves summary statistics grouped by account type (Savings vs Current).
     * Uses SQL GROUP BY + COUNT + SUM + AVG + MIN + MAX executed via JDBC.
     */
    @GetMapping("/summary/by-type")
    public List<AccountTypeSummaryDto> getAccountTypeSummary() {
        return accountDao.getAccountTypeSummary();
    }

    /**
     * STAGE 4 AGGREGATION: Retrieves customer portfolio aggregate metrics.
     * Uses SQL LEFT JOIN + GROUP BY + COALESCE executed via JDBC.
     */
    @GetMapping("/customer/{custId}/summary")
    public ResponseEntity<CustomerPortfolioSummaryDto> getCustomerPortfolioSummary(@PathVariable String custId) {
        return accountDao.getCustomerPortfolioSummary(custId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * STAGE 5 SUBQUERY: Retrieves high-value accounts exceeding bank average.
     * Uses SQL Scalar Subquery in WHERE clause via JDBC.
     */
    @GetMapping("/high-value")
    public List<Account> getHighValueAccounts() {
        return accountDao.findHighValueAccountsAboveAverage();
    }

    /**
     * STAGE 5 SUBQUERY: Retrieves customers who hold accounts but have never opened an FD.
     * Uses SQL EXISTS + NOT EXISTS anti-join via JDBC.
     */
    @GetMapping("/deposit-only-customers")
    public List<Customer> getDepositOnlyCustomers() {
        return accountDao.findDepositOnlyCustomers();
    }

    /**
     * STAGE 8 VIEW: Retrieves branch liquidity metrics from the virtual view `view_branch_liquidity_summary`.
     */
    @GetMapping("/views/branch-liquidity")
    public List<BranchLiquidityDto> getBranchLiquidityFromView() {
        return accountDao.findBranchLiquidityFromView();
    }

    /**
     * READ: Retrieves a single account by primary key using our manually written SQL via AccountDao & JDBC.
     */
    @GetMapping("/{accNo}")
    public ResponseEntity<?> getAccountByNumber(@PathVariable String accNo) {
        return accountDao.findAccountByNumber(accNo)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * CREATE: Creates a new account via manual SQL INSERT in AccountDao.
     */
    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        Account saved = accountDao.insertAccount(account);
        return ResponseEntity.ok(saved);
    }

    /**
     * UPDATE: Modifies account status via manual SQL UPDATE in AccountDao.
     */
    @PatchMapping("/{accNo}/status")
    public ResponseEntity<?> updateAccountStatus(@PathVariable String accNo, @RequestBody StatusUpdateRequest request) {
        boolean updated = accountDao.updateAccountStatus(accNo, request.getStatus());
        if (updated) {
            return accountDao.findAccountByNumber(accNo)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE: Deletes an account using manual SQL DELETE.
     * Demonstrates foreign key ON DELETE RESTRICT protection when child rows exist.
     */
    @DeleteMapping("/{accNo}")
    public ResponseEntity<?> deleteAccount(@PathVariable String accNo) {
        try {
            boolean deleted = accountDao.deleteAccount(accNo);
            if (deleted) {
                return ResponseEntity.ok(java.util.Map.of("message", "Account " + accNo + " deleted successfully."));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * SOFT DELETE: Closes an account (sets status to 'Closed') preserving transaction history.
     */
    @PostMapping("/{accNo}/close")
    public ResponseEntity<?> closeAccount(@PathVariable String accNo) {
        boolean closed = accountDao.closeAccount(accNo);
        if (closed) {
            return ResponseEntity.ok(java.util.Map.of("message", "Account " + accNo + " closed successfully."));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * STAGE 10: USER-DEFINED FUNCTION (UDF) — FD MATURITY QUOTE
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Invokes the MySQL User-Defined Function `fn_calculate_fd_maturity` via SQL SELECT.
     * ============================================================================
     */
    @GetMapping("/functions/fd-maturity-quote")
    public ResponseEntity<FdMaturityQuoteDto> getFdMaturityQuote(
            @RequestParam BigDecimal principal,
            @RequestParam BigDecimal rate,
            @RequestParam int months) {
        return ResponseEntity.ok(accountDao.calculateFdMaturity(principal, rate, months));
    }

    /**
     * STAGE 10: MULTI-FUNCTION SQL QUERY — CUSTOMER TIER & DATA MASKING
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Demonstrates calling `fn_customer_tier` and `fn_mask_account_number` inside
     * a relational projection query.
     * ============================================================================
     */
    @GetMapping("/functions/customer-tier/{custId}")
    public ResponseEntity<?> getCustomerTierAndMaskedAccount(@PathVariable String custId) {
        return accountDao.getCustomerTierAndMaskedAccount(custId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * STAGE 11: DATABASE TRIGGER BALANCE AUDIT TRAIL
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Exposes the immutable balance audit log generated automatically by the
     * MySQL AFTER UPDATE trigger `trg_accounts_after_update`.
     * ============================================================================
     */
    @GetMapping("/{accNo}/audit-trail")
    public ResponseEntity<List<com.asr.asr_banking_simulator.dto.AccountBalanceAuditDto>> getAccountAuditTrail(@PathVariable String accNo) {
        return ResponseEntity.ok(accountDao.findBalanceAuditTrail(accNo));
    }
}
