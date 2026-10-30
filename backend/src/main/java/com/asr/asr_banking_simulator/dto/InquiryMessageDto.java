package com.asr.asr_banking_simulator.dto;

import java.time.LocalDateTime;

public class InquiryMessageDto {
    private String messageId;
    private String inquiryId;
    private String senderUserId;
    private String senderName;
    private String senderRole;
    private boolean isInternal;
    private String messageText;
    private LocalDateTime createdAt;

    public InquiryMessageDto() {}

    public String getMessageId() { return messageId; }
    public void setMessageId(String messageId) { this.messageId = messageId; }

    public String getInquiryId() { return inquiryId; }
    public void setInquiryId(String inquiryId) { this.inquiryId = inquiryId; }

    public String getSenderUserId() { return senderUserId; }
    public void setSenderUserId(String senderUserId) { this.senderUserId = senderUserId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public boolean isInternal() { return isInternal; }
    public void setInternal(boolean internal) { isInternal = internal; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

