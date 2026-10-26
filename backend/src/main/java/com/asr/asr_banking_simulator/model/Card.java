package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    @Column(name = "card_no", length = 30, nullable = false)
    private String cardNo;

    @Column(name = "cust_id", length = 20, nullable = false)
    private String custId;

    @Column(name = "acc_no", length = 30)
    private String accNo;

    @Column(name = "card_type", length = 20, nullable = false)
    private String cardType;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "cvv_hash", length = 64, nullable = false)
    private String cvvHash = "***";

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Active";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Card() {}

    public Card(String cardNo, String custId, String accNo, String cardType, LocalDate issueDate, LocalDate expiryDate, String cvvHash, String status) {
        this.cardNo = cardNo;
        this.custId = custId;
        this.accNo = accNo;
        this.cardType = cardType;
        this.issueDate = issueDate;
        this.expiryDate = expiryDate;
        this.cvvHash = cvvHash;
        this.status = status;
    }

    public String getCardNo() { return cardNo; }
    public void setCardNo(String cardNo) { this.cardNo = cardNo; }

    public String getCustId() { return custId; }
    public void setCustId(String custId) { this.custId = custId; }

    public String getAccNo() { return accNo; }
    public void setAccNo(String accNo) { this.accNo = accNo; }

    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getCvvHash() { return cvvHash; }
    public void setCvvHash(String cvvHash) { this.cvvHash = cvvHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
