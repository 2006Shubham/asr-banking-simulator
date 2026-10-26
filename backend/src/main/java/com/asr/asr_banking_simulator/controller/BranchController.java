package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.model.Branch;
import com.asr.asr_banking_simulator.repository.BranchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class BranchController {

    private final BranchRepository branchRepo;

    public BranchController(BranchRepository branchRepo) {
        this.branchRepo = branchRepo;
    }

    @GetMapping
    public List<Branch> getAllBranches() {
        return branchRepo.findAll();
    }

    @GetMapping("/{branchId}")
    public ResponseEntity<?> getBranchById(@PathVariable String branchId) {
        return branchRepo.findById(branchId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
