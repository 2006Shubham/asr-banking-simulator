package com.asr.asr_banking_simulator.dto;

import java.math.BigDecimal;

public class TransferRequest {
    private String fromAccNo;
    private String toAccNo;
    private BigDecimal amount;
    private String channel;
    private String description;
    private String beneficiary;

    public TransferRequest() {}

    public TransferRequest(String fromAccNo, String toAccNo, BigDecimal amount, String channel, String description, String beneficiary) {
        this.fromAccNo = fromAccNo;
        this.toAccNo = toAccNo;
        this.amount = amount;
        this.channel = channel;
        this.description = description;
        this.beneficiary = beneficiary;
    }

    public String getFromAccNo() { return fromAccNo; }
    public void setFromAccNo(String fromAccNo) { this.fromAccNo = fromAccNo; }

    public String getToAccNo() { return toAccNo; }
    public void setToAccNo(String toAccNo) { this.toAccNo = toAccNo; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBeneficiary() { return beneficiary; }
    public void setBeneficiary(String beneficiary) { this.beneficiary = beneficiary; }
}
