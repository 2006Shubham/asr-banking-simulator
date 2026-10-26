package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc")
public class Kyc {

    @Id
    @Column(name = "kyc_id", length = 20, nullable = false)
    private String kycId;

    @Column(name = "cust_id", length = 20, nullable = false)
    private String custId;

    @Column(name = "kyc_type", length = 50, nullable = false)
    private String kycType;

    @Column(name = "doc_details", length = 255, nullable = false)
    private String docDetails;

    @Column(name = "verified_on")
    private LocalDate verifiedOn;

    @Column(name = "verified_by", length = 50, nullable = false)
    private String verifiedBy;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Verified";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Kyc() {}

    public Kyc(String kycId, String custId, String kycType, String docDetails, LocalDate verifiedOn, String verifiedBy, String status) {
        this.kycId = kycId;
        this.custId = custId;
        this.kycType = kycType;
        this.docDetails = docDetails;
        this.verifiedOn = verifiedOn;
        this.verifiedBy = verifiedBy;
        this.status = status;
    }

    public String getKycId() { return kycId; }
    public void setKycId(String kycId) { this.kycId = kycId; }

    public String getCustId() { return custId; }
    public void setCustId(String custId) { this.custId = custId; }

    public String getKycType() { return kycType; }
    public void setKycType(String kycType) { this.kycType = kycType; }

    public String getDocDetails() { return docDetails; }
    public void setDocDetails(String docDetails) { this.docDetails = docDetails; }

    public LocalDate getVerifiedOn() { return verifiedOn; }
    public void setVerifiedOn(LocalDate verifiedOn) { this.verifiedOn = verifiedOn; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
