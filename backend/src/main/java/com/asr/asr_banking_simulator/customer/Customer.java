package com.asr.asr_banking_simulator.customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "Customer")
public class Customer
{

    @Id
    @Column(name = "cust_id", length = 15)
    private String custId;

    @Column(length = 20)
    private String name;

    @Column(precision = 10, scale = 0)
    private Long phone;

    @Column(length = 20)
    private String email;

    @Column(name = "aadhar_no", precision = 12, scale = 0)
    private Long aadharNo;

    @Column(length = 40)
    private String address;

    @Column(name = "pass", length = 30)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    protected Customer()
    {
    }

    public Customer(String custId, String name, Long phone, String email,
    Long aadharNo, String address, String password)
    {
        this.custId = custId;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.aadharNo = aadharNo;
        this.address = address;
        this.password = password;
    }

    public String getCustId()
    {
        return custId;
    }

    public String getName()
    {
        return name;
    }

    public Long getPhone()
    {
        return phone;
    }

    public String getEmail()
    {
        return email;
    }

    public Long getAadharNo()
    {
        return aadharNo;
    }

    public String getAddress()
    {
        return address;
    }

    public String getPassword()
    {
        return password;
    }

    public void update(String name, Long phone, String email, Long aadharNo,
    String address, String password)
    {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.aadharNo = aadharNo;
        this.address = address;
        this.password = password;
    }
}