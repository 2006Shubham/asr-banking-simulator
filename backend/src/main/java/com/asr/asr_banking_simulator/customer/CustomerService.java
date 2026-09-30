package com.asr.asr_banking_simulator.customer;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService
{

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository)
    {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getCustomers()
    {
        return customerRepository.findAll();
    }

    public Customer getCustomer(String custId)
    {
        return customerRepository.findById(custId)
        .orElseThrow(() -> new ResponseStatusException(
        HttpStatus.NOT_FOUND, "Customer not found: " + custId));
    }

    public Customer addCustomer(Customer customer)
    {
        if(customerRepository.existsById(customer.getCustId()))
        {
            throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Customer already exists: " + customer.getCustId());
        }
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(String custId, Customer update)
    {
        Customer customer = getCustomer(custId);
        customer.update(update.getName(), update.getPhone(), update.getEmail(),
        update.getAadharNo(), update.getAddress(), update.getPassword());
        return customerRepository.save(customer);
    }

    public void removeCustomer(String custId)
    {
        Customer customer = getCustomer(custId);
        customerRepository.delete(customer);
    }
}