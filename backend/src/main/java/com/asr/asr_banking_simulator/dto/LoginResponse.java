package com.asr.asr_banking_simulator.dto;

import com.asr.asr_banking_simulator.model.Branch;
import com.asr.asr_banking_simulator.model.Customer;
import com.asr.asr_banking_simulator.model.Employee;
import com.asr.asr_banking_simulator.model.User;

public class LoginResponse {
    private String token;
    private User user;
    private Customer customer;
    private Employee employee;
    private Branch branch;

    public LoginResponse() {}

    public LoginResponse(String token, User user, Customer customer) {
        this.token = token;
        this.user = user;
        this.customer = customer;
    }

    public LoginResponse(String token, User user, Customer customer, Employee employee, Branch branch) {
        this.token = token;
        this.user = user;
        this.customer = customer;
        this.employee = employee;
        this.branch = branch;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
}
