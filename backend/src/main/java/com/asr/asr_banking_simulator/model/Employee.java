package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @Column(name = "emp_id", length = 20, nullable = false)
    private String empId;

    @Column(name = "user_id", length = 20, unique = true)
    private String userId;

    @Column(name = "branch_id", length = 20, nullable = false)
    private String branchId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "designation", length = 50, nullable = false)
    private String designation;

    @Column(name = "salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal salary;

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Active";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Employee() {}

    public Employee(String empId, String branchId, String name, String designation, BigDecimal salary, String email, String phone, LocalDate hireDate, String status) {
        this.empId = empId;
        this.branchId = branchId;
        this.name = name;
        this.designation = designation;
        this.salary = salary;
        this.email = email;
        this.phone = phone;
        this.hireDate = hireDate;
        this.status = status;
    }

    public String getEmpId() { return empId; }
    public void setEmpId(String empId) { this.empId = empId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
