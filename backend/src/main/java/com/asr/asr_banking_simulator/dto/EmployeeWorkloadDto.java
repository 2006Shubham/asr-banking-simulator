package com.asr.asr_banking_simulator.dto;

public class EmployeeWorkloadDto {
    private String empId;
    private String name;
    private String designation;
    private String email;
    private String phone;
    private String status;
    private int activeCases;
    private int resolvedCases;
    private int escalatedCases;

    public EmployeeWorkloadDto() {}

    public String getEmpId() { return empId; }
    public void setEmpId(String empId) { this.empId = empId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getActiveCases() { return activeCases; }
    public void setActiveCases(int activeCases) { this.activeCases = activeCases; }

    public int getResolvedCases() { return resolvedCases; }
    public void setResolvedCases(int resolvedCases) { this.resolvedCases = resolvedCases; }

    public int getEscalatedCases() { return escalatedCases; }
    public void setEscalatedCases(int escalatedCases) { this.escalatedCases = escalatedCases; }
}

