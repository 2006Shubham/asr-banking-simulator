package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.model.Customer;
import com.asr.asr_banking_simulator.model.Kyc;
import com.asr.asr_banking_simulator.repository.CustomerRepository;
import com.asr.asr_banking_simulator.repository.KycRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class CustomerController {

    private final CustomerRepository customerRepo;
    private final KycRepository kycRepo;
    private final com.asr.asr_banking_simulator.dao.AccountDao accountDao;

    public CustomerController(CustomerRepository customerRepo, KycRepository kycRepo, com.asr.asr_banking_simulator.dao.AccountDao accountDao) {
        this.customerRepo = customerRepo;
        this.kycRepo = kycRepo;
        this.accountDao = accountDao;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepo.findAll();
    }

    @GetMapping("/{custId}")
    public ResponseEntity<?> getCustomerById(@PathVariable String custId) {
        return customerRepo.findById(custId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{custId}/kyc")
    public List<Kyc> getCustomerKyc(@PathVariable String custId) {
        return kycRepo.findByCustId(custId);
    }

    @PutMapping("/{custId}")
    public ResponseEntity<?> updateCustomer(@PathVariable String custId, @RequestBody Customer updated) {
        return customerRepo.findById(custId).map(existing -> {
            if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
            if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
            if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
            Customer saved = customerRepo.save(existing);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * STAGE 11: DATABASE TRIGGER CUSTOMER SECURITY AUDIT LOG
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Exposes PII security modifications captured automatically by the
     * MySQL AFTER UPDATE trigger `trg_customers_after_update`.
     * ============================================================================
     */
    @GetMapping("/{custId}/security-audit")
    public List<com.asr.asr_banking_simulator.dto.CustomerSecurityAuditDto> getCustomerSecurityAudit(@PathVariable String custId) {
        return accountDao.findCustomerSecurityAudit(custId);
    }
}
