package com.asr.asr_banking_simulator.dto;

public class CreateInquiryRequest {
    private String custId;
    private String branchId;
    private String accNo;
    private String category;
    private String subject;
    private String description;
    private String priority = "Medium";

    public CreateInquiryRequest() {}

    public String getCustId() { return custId; }
    public void setCustId(String custId) { this.custId = custId; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getAccNo() { return accNo; }
    public void setAccNo(String accNo) { this.accNo = accNo; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}

