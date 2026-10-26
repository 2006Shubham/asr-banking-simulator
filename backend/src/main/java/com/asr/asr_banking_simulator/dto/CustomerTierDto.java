package com.asr.asr_banking_simulator.dto;

/**
 * CustomerTierDto — Customer Wealth & Risk Tier via Database Stored Functions
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 10):
 * Demonstrates combining multiple Stored Functions (`fn_customer_tier` and
 * `fn_mask_account_number`) in a single SQL query.
 * ============================================================================
 */
public class CustomerTierDto {

    private String custId;
    private String customerName;
    private String tier;
    private String maskedAccount;

    public CustomerTierDto() {
    }

    public CustomerTierDto(String custId, String customerName, String tier, String maskedAccount) {
        this.custId = custId;
        this.customerName = customerName;
        this.tier = tier;
        this.maskedAccount = maskedAccount;
    }

    public String getCustId() {
        return custId;
    }

    public void setCustId(String custId) {
        this.custId = custId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getMaskedAccount() {
        return maskedAccount;
    }

    public void setMaskedAccount(String maskedAccount) {
        this.maskedAccount = maskedAccount;
    }
}
