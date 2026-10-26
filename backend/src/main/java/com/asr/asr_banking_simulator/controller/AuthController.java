package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dto.LoginRequest;
import com.asr.asr_banking_simulator.dto.LoginResponse;
import com.asr.asr_banking_simulator.model.Customer;
import com.asr.asr_banking_simulator.model.User;
import com.asr.asr_banking_simulator.repository.CustomerRepository;
import com.asr.asr_banking_simulator.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuthController {

    private final UserRepository userRepo;
    private final CustomerRepository customerRepo;

    public AuthController(UserRepository userRepo, CustomerRepository customerRepo) {
        this.userRepo = userRepo;
        this.customerRepo = customerRepo;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }

        String username = request.getUsername().trim();
        String password = request.getPassword().trim();

        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Username or Password. Please try again."));
        }

        User user = userOpt.get();

        // Support demo password "demo123" or exact hash match
        boolean passwordValid = password.equals("demo123") || 
                                password.equals(user.getPasswordHash()) ||
                                user.getPasswordHash().contains(password);

        if (!passwordValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Username or Password. Please try again."));
        }

        Customer customer = customerRepo.findByUserId(user.getUserId()).orElse(null);

        String token = "asr-jwt-token-" + user.getUserId() + "-" + System.currentTimeMillis();
        return ResponseEntity.ok(new LoginResponse(token, user, customer));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
