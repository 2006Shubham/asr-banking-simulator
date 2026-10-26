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
        return ResponseEntity.ok(saved);
    }
}
