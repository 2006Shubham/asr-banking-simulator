package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.model.Loan;
import com.asr.asr_banking_simulator.model.LoanInstallment;
import com.asr.asr_banking_simulator.repository.LoanInstallmentRepository;
import com.asr.asr_banking_simulator.repository.LoanRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class LoanController {

    private final LoanRepository loanRepo;
    private final LoanInstallmentRepository installmentRepo;

    public LoanController(LoanRepository loanRepo, LoanInstallmentRepository installmentRepo) {
        this.loanRepo = loanRepo;
        this.installmentRepo = installmentRepo;
    }

    @GetMapping
    public List<Loan> getAllLoans() {
        return loanRepo.findAll();
    }

    /**
     * Retrieves loans for a customer via the loan_borrows junction table.
     */
    @GetMapping("/customer/{custId}")
    public List<Loan> getLoansByCustomer(@PathVariable String custId) {
        return loanRepo.findLoansByCustomerId(custId);
    }

    @GetMapping("/{loanId}")
    public ResponseEntity<?> getLoanById(@PathVariable String loanId) {
        return loanRepo.findById(loanId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{loanId}/installments")
    public List<LoanInstallment> getInstallmentsByLoan(@PathVariable String loanId) {
        return installmentRepo.findByLoanIdOrderByInstallmentNoAsc(loanId);
    }

    @PostMapping("/{loanId}/installments/{installmentId}/pay")
    public ResponseEntity<?> payInstallment(@PathVariable String loanId, @PathVariable String installmentId) {
        return installmentRepo.findById(installmentId).map(inst -> {
            inst.setStatus("Paid");
            inst.setPaidOn(LocalDate.now());
            LoanInstallment saved = installmentRepo.save(inst);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
