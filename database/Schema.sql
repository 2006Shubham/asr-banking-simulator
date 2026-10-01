create database if not exists asr_banking;

use asr_banking;

CREATE TABLE IF NOT EXISTS Customer
(
	cust_id VARCHAR(15) PRIMARY KEY,
    name VARCHAR(20),
    phone numeric(10,0),
    email VARCHAR(20),
    aadhar_no NUMERIC(12,0),
    address VARCHAR(40),
    pass VARCHAR(255),
    
    CONSTRAINT chk_aadhar CHECK(aadhar_no > 99999999999),
    CONSTRAINT chk_phone CHECK(phone > 999999999)
);

CREATE TABLE IF NOT EXISTS Account
(
	acc_no VARCHAR(15) PRIMARY KEY,
    balance NUMERIC(20, 2),
    acc_type VARCHAR(20),
    open_date DATE,
    status VARCHAR(20),
    cust_id VARCHAR(15),
    
    FOREIGN KEY(cust_id) REFERENCES Customer(cust_id),
    
    CONSTRAINT chk_bal CHECK (balance >= 0),
    
    CONSTRAINT chk_status CHECK(status in ('Active', 'Dormant','Frozen', 'Closed'))
)

