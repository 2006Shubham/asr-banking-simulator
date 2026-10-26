package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dto.StatusUpdateRequest;
import com.asr.asr_banking_simulator.model.Card;
import com.asr.asr_banking_simulator.repository.CardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class CardController {

    private final CardRepository cardRepo;

    public CardController(CardRepository cardRepo) {
        this.cardRepo = cardRepo;
    }

    @GetMapping
    public List<Card> getAllCards() {
        return cardRepo.findAll();
    }

    @GetMapping("/customer/{custId}")
    public List<Card> getCardsByCustomer(@PathVariable String custId) {
        return cardRepo.findByCustId(custId);
    }

    @GetMapping("/{cardNo}")
    public ResponseEntity<?> getCardByNumber(@PathVariable String cardNo) {
        return cardRepo.findById(cardNo)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{cardNo}/status")
    public ResponseEntity<?> updateCardStatus(@PathVariable String cardNo, @RequestBody StatusUpdateRequest request) {
        return cardRepo.findById(cardNo).map(card -> {
            card.setStatus(request.getStatus());
            Card saved = cardRepo.save(card);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
