package com.asr.asr_banking_simulator.dto;

import com.asr.asr_banking_simulator.model.Customer;
import com.asr.asr_banking_simulator.model.User;

public class LoginResponse {
    private String token;
    private User user;
    private Customer customer;

    public LoginResponse() {}

    public LoginResponse(String token, User user, Customer customer) {
        this.token = token;
        this.user = user;
        this.customer = customer;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
}
