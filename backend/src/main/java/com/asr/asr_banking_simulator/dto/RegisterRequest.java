package com.asr.asr_banking_simulator.dto;

public class RegisterRequest {

    private String accountNo;
    private String email;
    private String phone;
    private String username;
    private String password;

    public RegisterRequest() {}

    public RegisterRequest(String accountNo, String email, String phone, String username, String password) {
        this.accountNo = accountNo;
        this.email = email;
        this.phone = phone;
        this.username = username;
        this.password = password;
    }

    public String getAccountNo() { return accountNo; }
    public void setAccountNo(String accountNo) { this.accountNo = accountNo; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

