package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @Column(name = "txn_id", length = 30, nullable = false)
    private String txnId;

    @Column(name = "acc_no", length = 30, nullable = false)
    private String accNo;

    @Column(name = "txn_type", length = 10, nullable = false)
    private String txnType;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "txn_date", nullable = false)
    private LocalDateTime txnDate;

    @Column(name = "channel", length = 20, nullable = false)
    private String channel;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Success";

    @Column(name = "ref_no", length = 50, nullable = false, unique = true)
    private String refNo;

    @Column(name = "description", length = 255, nullable = false)
    private String description;

    public Transaction() {}

    public Transaction(String txnId, String accNo, String txnType, BigDecimal amount, LocalDateTime txnDate, String channel, String status, String refNo, String description) {
        this.txnId = txnId;
        this.accNo = accNo;
        this.txnType = txnType;
        this.amount = amount;
        this.txnDate = txnDate;
        this.channel = channel;
        this.status = status;
        this.refNo = refNo;
        this.description = description;
    }

    public String getTxnId() { return txnId; }
    public void setTxnId(String txnId) { this.txnId = txnId; }

    public String getAccNo() { return accNo; }
    public void setAccNo(String accNo) { this.accNo = accNo; }

    public String getTxnType() { return txnType; }
    public void setTxnType(String txnType) { this.txnType = txnType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getTxnDate() { return txnDate; }
    public void setTxnDate(LocalDateTime txnDate) { this.txnDate = txnDate; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRefNo() { return refNo; }
    public void setRefNo(String refNo) { this.refNo = refNo; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
