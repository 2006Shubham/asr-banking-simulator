create database if not exists asr_banking;

use asr_banking;

CREATE TABLE IF NOT EXISTS Customer
(
    cust_id VARCHAR(15) PRIMARY KEY,
    cust_name VARCHAR(20),
    cust_phone NUMERIC(10,0),
    cust_email VARCHAR(20),
    cust_dob DATE,
    cust_address VARCHAR(40),
    cust_age INTEGER,
    cust_gender VARCHAR(1),
    
    CONSTRAINT chk_phone CHECK(cust_phone > 999999999)
);

CREATE TABLE IF NOT EXISTS Account
(
    acc_num VARCHAR(15) PRIMARY KEY,
    acc_balance NUMERIC(20, 2),
    acc_type VARCHAR(20),
    acc_open_date DATE,
    acc_status VARCHAR(20),
    acc_branch_id VARCHAR(20),
    
    CONSTRAINT chk_bal CHECK (acc_balance >= 0),
    CONSTRAINT chk_status CHECK(acc_status in ('Active', 'Dormant', 'Frozen', 'Closed'))
);

CREATE TABLE IF NOT EXISTS Holds_Account
(
    cust_id VARCHAR(15),
    acc_num VARCHAR(15),
    PRIMARY KEY (cust_id, acc_num),
    CONSTRAINT fk_ha_cust FOREIGN KEY (cust_id) REFERENCES Customer(cust_id),
    CONSTRAINT fk_ha_acc FOREIGN KEY (acc_num) REFERENCES Account(acc_num)
);

CREATE TABLE IF NOT EXISTS Branch
(
    branch_id INT AUTO_INCREMENT,
    branch_name VARCHAR(20) NOT NULL,
    branch_city VARCHAR(50) NOT NULL,
    branch_address VARCHAR(150),
    branch_contact VARCHAR(15),
    branch_asset DECIMAL(15,2) DEFAULT 0.00,

    PRIMARY KEY(branch_id)
);

CREATE TABLE IF NOT EXISTS FixedDeposit
(
    fd_id VARCHAR(20) PRIMARY KEY,
    cust_id VARCHAR(20),
    fd_duration NUMERIC(2,0),
    fd_amount NUMERIC(20,2),
    fd_start_data DATE,
    CONSTRAINT fk_fd_cust FOREIGN KEY (cust_id) REFERENCES Customer(cust_id)
);

CREATE TABLE IF NOT EXISTS Employee
(
    emp_id VARCHAR(10) PRIMARY KEY,
    emp_branch_id VARCHAR(20),
    emp_designation VARCHAR(20),
    emp_salary VARCHAR(20),
    emp_mail VARCHAR(20),
    emp_phone NUMERIC(10,0)
);

CREATE TABLE IF NOT EXISTS Loan
(
    loan_id VARCHAR(20) PRIMARY KEY,
    loan_branch_id VARCHAR(20),
    loan_duration NUMERIC(2,0),
    loan_amount NUMERIC(20,0),
    loan_type VARCHAR(2),
    loan_issued_data DATE,
    loan_sanctioned_data DATE
);

CREATE TABLE IF NOT EXISTS Loan_Borrows
(
    loan_id VARCHAR(20),
    cust_id VARCHAR(20),
    PRIMARY KEY (loan_id, cust_id),
    CONSTRAINT fk_lb_loan FOREIGN KEY (loan_id) REFERENCES Loan(loan_id),
    CONSTRAINT fk_lb_cust FOREIGN KEY (cust_id) REFERENCES Customer(cust_id)
);

CREATE TABLE IF NOT EXISTS LoanInterestRate
(
    loan_type VARCHAR(10) PRIMARY KEY,
    loan_rate NUMERIC(3,2)
);

CREATE TABLE IF NOT EXISTS CARD
(
    card_no VARCHAR(15) PRIMARY KEY,
    card_issue_date DATE,
    card_expire_date DATE,
    card_type VARCHAR(1),
    cust_id VARCHAR(20),
    CONSTRAINT fk_card_cust FOREIGN KEY (cust_id) REFERENCES Customer(cust_id)
);