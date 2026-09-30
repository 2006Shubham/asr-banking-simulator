package com.asr.asr_banking_simulator.customer;

import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
public class CustomerController
{

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService)
    {
        this.customerService = customerService;
    }

    @GetMapping
    public List<Customer> getCustomers()
    {
        return customerService.getCustomers();
    }

    @GetMapping("/{custId}")
    public Customer getCustomer(@PathVariable String custId)
    {
        return customerService.getCustomer(custId);
    }

    @PostMapping
    public ResponseEntity<Customer> addCustomer(@RequestBody Customer customer)
    {
        Customer savedCustomer = customerService.addCustomer(customer);
        return ResponseEntity.created(URI.create("/api/customers/" + savedCustomer.getCustId()))
        .body(savedCustomer);
    }

    @PutMapping("/{custId}")
    public Customer updateCustomer(@PathVariable String custId, @RequestBody Customer customer)
    {
        return customerService.updateCustomer(custId, customer);
    }

    @DeleteMapping("/{custId}")
    public ResponseEntity<Void> removeCustomer(@PathVariable String custId)
    {
        customerService.removeCustomer(custId);
        return ResponseEntity.noContent().build();
    }
}
