package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.model.Kyc;
import com.asr.asr_banking_simulator.repository.KycRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kyc")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class KycController {

    private final KycRepository kycRepo;

    public KycController(KycRepository kycRepo) {
        this.kycRepo = kycRepo;
    }

    @GetMapping
    public List<Kyc> getAllKyc() {
        return kycRepo.findAll();
    }

    @GetMapping("/customer/{custId}")
    public List<Kyc> getKycByCustomer(@PathVariable String custId) {
        return kycRepo.findByCustId(custId);
    }

    @GetMapping("/{kycId}")
    public ResponseEntity<?> getKycById(@PathVariable String kycId) {
        return kycRepo.findById(kycId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
