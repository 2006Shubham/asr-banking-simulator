package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "branches")
public class Branch {

    @Id
    @Column(name = "branch_id", length = 20, nullable = false)
    private String branchId;

    @Column(name = "branch_name", length = 100, nullable = false)
    private String branchName;

    @Column(name = "ifsc_code", length = 15, nullable = false, unique = true)
    private String ifscCode;

    @Column(name = "city", length = 50, nullable = false)
    private String city;

    @Column(name = "address", length = 255, nullable = false)
    private String address;

    @Column(name = "assets", precision = 18, scale = 2, nullable = false)
    private BigDecimal assets = new BigDecimal("50000000.00");

    @Column(name = "manager_id", length = 20)
    private String managerId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Branch() {}

    public Branch(String branchId, String branchName, String ifscCode, String city, String address, BigDecimal assets, String managerId) {
        this.branchId = branchId;
        this.branchName = branchName;
        this.ifscCode = ifscCode;
        this.city = city;
        this.address = address;
        this.assets = assets;
        this.managerId = managerId;
    }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getAssets() { return assets; }
    public void setAssets(BigDecimal assets) { this.assets = assets; }

    public String getManagerId() { return managerId; }
    public void setManagerId(String managerId) { this.managerId = managerId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
