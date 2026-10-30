package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @Column(name = "cust_id", length = 20, nullable = false)
    private String custId;

    @Column(name = "user_id", length = 20, nullable = true, unique = true)
    private String userId;

    @Column(name = "branch_id", length = 20, nullable = false)
    private String branchId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Column(name = "gender", length = 10, nullable = false)
    private String gender;

    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(name = "aadhar_no", length = 20, nullable = false, unique = true)
    private String aadharNo;

    @Column(name = "pan_no", length = 15, nullable = false, unique = true)
    private String panNo;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Customer() {}

    public Customer(String custId, String userId, String branchId, String name, String email, LocalDate dob, String gender, String phone, String address, String aadharNo, String panNo) {
        this.custId = custId;
        this.userId = userId;
        this.branchId = branchId;
        this.name = name;
        this.email = email;
        this.dob = dob;
        this.gender = gender;
        this.phone = phone;
        this.address = address;
        this.aadharNo = aadharNo;
        this.panNo = panNo;
    }

    public String getCustId() { return custId; }
    public void setCustId(String custId) { this.custId = custId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAadharNo() { return aadharNo; }
    public void setAadharNo(String aadharNo) { this.aadharNo = aadharNo; }

    public String getPanNo() { return panNo; }
    public void setPanNo(String panNo) { this.panNo = panNo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
