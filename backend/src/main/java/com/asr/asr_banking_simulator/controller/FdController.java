package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.model.FdInterest;
import com.asr.asr_banking_simulator.model.FixedDeposit;
import com.asr.asr_banking_simulator.repository.FdInterestRepository;
import com.asr.asr_banking_simulator.repository.FixedDepositRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fds")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class FdController {

    private final FixedDepositRepository fdRepo;
    private final FdInterestRepository fdInterestRepo;

    public FdController(FixedDepositRepository fdRepo, FdInterestRepository fdInterestRepo) {
        this.fdRepo = fdRepo;
        this.fdInterestRepo = fdInterestRepo;
    }

    @GetMapping
    public List<FixedDeposit> getAllFDs() {
        return fdRepo.findAll();
    }

    @GetMapping("/customer/{custId}")
    public List<FixedDeposit> getFDsByCustomer(@PathVariable String custId) {
        return fdRepo.findByCustId(custId);
    }

    @GetMapping("/{fdId}")
    public ResponseEntity<?> getFDById(@PathVariable String fdId) {
        return fdRepo.findById(fdId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{fdId}/interests")
    public List<FdInterest> getInterestsByFD(@PathVariable String fdId) {
        return fdInterestRepo.findByFdIdOrderByCalcDateAsc(fdId);
    }

    @PostMapping
    public ResponseEntity<FixedDeposit> createFD(@RequestBody FixedDeposit fd) {
        if (fd.getFdId() == null || fd.getFdId().isBlank()) {
            long count = fdRepo.count() + 1;
            String generatedId = String.format("FD%03d", count);
            while (fdRepo.existsById(generatedId)) {
                count++;
                generatedId = String.format("FD%03d", count);
            }
            fd.setFdId(generatedId);
        }

        if (fd.getBranchId() == null || fd.getBranchId().isBlank()) {
            fd.setBranchId("BR001");
        }

        if (fd.getStartDate() == null) {
            fd.setStartDate(LocalDate.now());
        }
        if (fd.getMaturityDate() == null && fd.getDurationMonths() != null) {
            fd.setMaturityDate(fd.getStartDate().plusMonths(fd.getDurationMonths()));
        }
        if (fd.getStatus() == null) {
            fd.setStatus("Active");
        }

        FixedDeposit saved = fdRepo.save(fd);

        // Auto-generate initial projected interest record in fd_interest
        if (saved.getAmount() != null && saved.getInterestRate() != null && saved.getDurationMonths() != null) {
            java.math.BigDecimal years = java.math.BigDecimal.valueOf(saved.getDurationMonths())
                    .divide(java.math.BigDecimal.valueOf(12), 4, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal rateFraction = saved.getInterestRate()
                    .divide(java.math.BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal interest = saved.getAmount()
                    .multiply(rateFraction)
                    .multiply(years)
                    .setScale(2, java.math.RoundingMode.HALF_UP);

            long intCount = fdInterestRepo.count() + 1;
            String intId = String.format("FDI%03d", intCount);
            while (fdInterestRepo.existsById(intId)) {
                intCount++;
                intId = String.format("FDI%03d", intCount);
            }

            FdInterest fdi = new FdInterest(
                    intId,
                    saved.getFdId(),
                    interest,
                    saved.getStartDate(),
                    saved.getMaturityDate(),
                    "Pending"
            );
            fdInterestRepo.save(fdi);
        }

        return ResponseEntity.ok(saved);
    }
}
