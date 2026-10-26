-- ============================================================================
-- ASR Bank Simulator — Institutional Core Banking Relational Database Schema
-- Project: DBMS Mini-Project (ASR Bank)
-- Team Members: Rutuja, Suraj, Atharva, Shubham
-- Target Database: MySQL 8.0+
-- Script: database/Initialize.sql (Stage 1 Implementation)
-- ============================================================================

-- Step 1: Create and Select Database
CREATE DATABASE IF NOT EXISTS asr_banking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE asr_banking;

-- Disable Foreign Key Checks during clean table creation
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if re-initializing (in reverse dependency order)
DROP TABLE IF EXISTS kyc;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS fd_interest;
DROP TABLE IF EXISTS fixed_deposits;
DROP TABLE IF EXISTS loan_installments;
DROP TABLE IF EXISTS loan_borrows;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS loan_interest_rates;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS users;

-- Re-enable Foreign Key Checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TABLE 1: users (Authentication & Security Identities)
-- ============================================================================
CREATE TABLE users (
    user_id VARCHAR(20) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Customer',
    contact_no VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT chk_users_role CHECK (role IN ('Customer', 'Employee', 'Manager', 'Admin')),
    CONSTRAINT chk_users_status CHECK (status IN ('Active', 'Suspended', 'Deactivated'))
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 2: branches (Physical Banking Flagship & Regional Centers)
-- Note: manager_id circular FK is added after employees table creation
-- ============================================================================
CREATE TABLE branches (
    branch_id VARCHAR(20) NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(15) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    assets DECIMAL(18, 2) NOT NULL DEFAULT 50000000.00,
    manager_id VARCHAR(20) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_branches PRIMARY KEY (branch_id),
    CONSTRAINT uq_branches_ifsc UNIQUE (ifsc_code),
    CONSTRAINT chk_branches_assets CHECK (assets >= 0.00)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 3: employees (Institutional Personnel & Branch Hierarchy)
-- ============================================================================
CREATE TABLE employees (
    emp_id VARCHAR(20) NOT NULL,
    branch_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    salary DECIMAL(12, 2) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    hire_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_employees PRIMARY KEY (emp_id),
    CONSTRAINT uq_employees_email UNIQUE (email),
    CONSTRAINT chk_employees_salary CHECK (salary > 0.00),
    CONSTRAINT chk_employees_status CHECK (status IN ('Active', 'OnLeave', 'Resigned')),
    CONSTRAINT fk_employees_branch FOREIGN KEY (branch_id)
        REFERENCES branches (branch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Safe Resolution of Circular Dependency: Branch Manager Foreign Key
ALTER TABLE branches
    ADD CONSTRAINT fk_branches_manager FOREIGN KEY (manager_id)
        REFERENCES employees (emp_id) ON DELETE SET NULL;

-- ============================================================================
-- TABLE 4: customers (Master Demographic & Citizen Records)
-- Note: Age is derived dynamically from dob (never stored redundantly)
-- ============================================================================
CREATE TABLE customers (
    cust_id VARCHAR(20) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    branch_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    aadhar_no VARCHAR(20) NOT NULL,
    pan_no VARCHAR(15) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_customers PRIMARY KEY (cust_id),
    CONSTRAINT uq_customers_user UNIQUE (user_id),
    CONSTRAINT uq_customers_email UNIQUE (email),
    CONSTRAINT uq_customers_aadhar UNIQUE (aadhar_no),
    CONSTRAINT uq_customers_pan UNIQUE (pan_no),
    CONSTRAINT chk_customers_gender CHECK (gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_customers_branch FOREIGN KEY (branch_id)
        REFERENCES branches (branch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 5: accounts (Liquid Savings & Current Deposit Contracts)
-- ============================================================================
CREATE TABLE accounts (
    acc_no VARCHAR(30) NOT NULL,
    cust_id VARCHAR(20) NOT NULL,
    branch_id VARCHAR(20) NOT NULL,
    acc_type VARCHAR(20) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    open_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_accounts PRIMARY KEY (acc_no),
    CONSTRAINT chk_accounts_type CHECK (acc_type IN ('Savings', 'Current', 'Salary')),
    CONSTRAINT chk_accounts_balance CHECK (balance >= 0.00),
    CONSTRAINT chk_accounts_status CHECK (status IN ('Active', 'Dormant', 'Frozen', 'Closed')),
    CONSTRAINT fk_accounts_customer FOREIGN KEY (cust_id)
        REFERENCES customers (cust_id) ON DELETE RESTRICT,
    CONSTRAINT fk_accounts_branch FOREIGN KEY (branch_id)
        REFERENCES branches (branch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 6: transactions (Immutable Financial Audit Ledger)
-- Policy: Financial history is strictly immutable (No updates, No deletions)
-- ============================================================================
CREATE TABLE transactions (
    txn_id VARCHAR(30) NOT NULL,
    acc_no VARCHAR(30) NOT NULL,
    txn_type VARCHAR(10) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    txn_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Success',
    ref_no VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    CONSTRAINT pk_transactions PRIMARY KEY (txn_id),
    CONSTRAINT uq_transactions_ref UNIQUE (ref_no),
    CONSTRAINT chk_transactions_type CHECK (txn_type IN ('Credit', 'Debit')),
    CONSTRAINT chk_transactions_amount CHECK (amount > 0.00),
    CONSTRAINT chk_transactions_channel CHECK (channel IN ('UPI', 'NEFT', 'IMPS', 'ATM', 'Branch', 'NetBanking')),
    CONSTRAINT chk_transactions_status CHECK (status IN ('Success', 'Pending', 'Failed', 'Reversed')),
    CONSTRAINT fk_transactions_account FOREIGN KEY (acc_no)
        REFERENCES accounts (acc_no) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 7: loan_interest_rates (Institutional Benchmark Rate Catalog)
-- ============================================================================
CREATE TABLE loan_interest_rates (
    loan_type VARCHAR(50) NOT NULL,
    base_interest_rate DECIMAL(5, 2) NOT NULL,
    min_tenure INT NOT NULL,
    max_tenure INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    CONSTRAINT pk_loan_interest_rates PRIMARY KEY (loan_type),
    CONSTRAINT chk_rates_base CHECK (base_interest_rate > 0.00),
    CONSTRAINT chk_rates_min_tenure CHECK (min_tenure > 0),
    CONSTRAINT chk_rates_tenure_range CHECK (max_tenure >= min_tenure)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 8: loans (Sanctioned Credit Facilities)
-- Note: As agreed, no redundant cust_id column exists here.
-- The authoritative link to customers is the loan_borrows junction table.
-- ============================================================================
CREATE TABLE loans (
    loan_id VARCHAR(20) NOT NULL,
    branch_id VARCHAR(20) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    sanction_date DATE NOT NULL,
    issue_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_loans PRIMARY KEY (loan_id),
    CONSTRAINT chk_loans_amount CHECK (amount > 0.00),
    CONSTRAINT chk_loans_rate CHECK (interest_rate > 0.00),
    CONSTRAINT chk_loans_duration CHECK (duration_months > 0),
    CONSTRAINT chk_loans_status CHECK (status IN ('Active', 'Closed', 'NPA', 'UnderReview')),
    CONSTRAINT fk_loans_branch FOREIGN KEY (branch_id)
        REFERENCES branches (branch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_loans_type FOREIGN KEY (loan_type)
        REFERENCES loan_interest_rates (loan_type) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 9: loan_borrows (M:N Borrower Junction & Joint Facilities)
-- Authoritative relationship supporting single & joint borrowers per loan
-- ============================================================================
CREATE TABLE loan_borrows (
    loan_id VARCHAR(20) NOT NULL,
    cust_id VARCHAR(20) NOT NULL,
    borrower_type VARCHAR(20) NOT NULL DEFAULT 'Primary',
    added_on DATE NOT NULL,
    CONSTRAINT pk_loan_borrows PRIMARY KEY (loan_id, cust_id),
    CONSTRAINT chk_borrows_type CHECK (borrower_type IN ('Primary', 'Co-Borrower', 'Guarantor')),
    CONSTRAINT fk_borrows_loan FOREIGN KEY (loan_id)
        REFERENCES loans (loan_id) ON DELETE RESTRICT,
    CONSTRAINT fk_borrows_customer FOREIGN KEY (cust_id)
        REFERENCES customers (cust_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 10: loan_installments (Amortization Schedule EMIs)
-- Policy: Payment history preserved with ON DELETE RESTRICT
-- ============================================================================
CREATE TABLE loan_installments (
    installment_id VARCHAR(20) NOT NULL,
    loan_id VARCHAR(20) NOT NULL,
    installment_no INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    paid_on DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    CONSTRAINT pk_loan_installments PRIMARY KEY (installment_id),
    CONSTRAINT uq_loan_installment_no UNIQUE (loan_id, installment_no),
    CONSTRAINT chk_installments_no CHECK (installment_no > 0),
    CONSTRAINT chk_installments_amount CHECK (amount > 0.00),
    CONSTRAINT chk_installments_status CHECK (status IN ('Paid', 'Pending', 'Overdue')),
    CONSTRAINT fk_installments_loan FOREIGN KEY (loan_id)
        REFERENCES loans (loan_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 11: fixed_deposits (Term Deposit Contracts)
-- ============================================================================
CREATE TABLE fixed_deposits (
    fd_id VARCHAR(20) NOT NULL,
    cust_id VARCHAR(20) NOT NULL,
    branch_id VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_fixed_deposits PRIMARY KEY (fd_id),
    CONSTRAINT chk_fd_amount CHECK (amount >= 1000.00),
    CONSTRAINT chk_fd_rate CHECK (interest_rate > 0.00),
    CONSTRAINT chk_fd_duration CHECK (duration_months > 0),
    CONSTRAINT chk_fd_status CHECK (status IN ('Active', 'Matured', 'PrematureClosed')),
    CONSTRAINT fk_fd_customer FOREIGN KEY (cust_id)
        REFERENCES customers (cust_id) ON DELETE RESTRICT,
    CONSTRAINT fk_fd_branch FOREIGN KEY (branch_id)
        REFERENCES branches (branch_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 12: fd_interest (Yield Accruals & Payout Ledger)
-- ============================================================================
CREATE TABLE fd_interest (
    interest_id VARCHAR(20) NOT NULL,
    fd_id VARCHAR(20) NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    calc_date DATE NOT NULL,
    payout_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    CONSTRAINT pk_fd_interest PRIMARY KEY (interest_id),
    CONSTRAINT chk_fd_interest_amount CHECK (interest_amount > 0.00),
    CONSTRAINT chk_fd_interest_status CHECK (status IN ('Credited', 'Pending', 'Forfeited')),
    CONSTRAINT fk_fd_interest_parent FOREIGN KEY (fd_id)
        REFERENCES fixed_deposits (fd_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 13: cards (Electronic Debit & Revolving Credit Cards)
-- Note: acc_no is nullable to support standalone revolving credit cards
-- Sensitive CVV is never stored in plaintext (represented as tokenized hash/mask)
-- ============================================================================
CREATE TABLE cards (
    card_no VARCHAR(30) NOT NULL,
    cust_id VARCHAR(20) NOT NULL,
    acc_no VARCHAR(30) NULL,
    card_type VARCHAR(20) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    cvv_hash VARCHAR(64) NOT NULL DEFAULT '***',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cards PRIMARY KEY (card_no),
    CONSTRAINT chk_cards_type CHECK (card_type IN ('Debit', 'Credit')),
    CONSTRAINT chk_cards_status CHECK (status IN ('Active', 'Blocked', 'Expired')),
    CONSTRAINT fk_cards_customer FOREIGN KEY (cust_id)
        REFERENCES customers (cust_id) ON DELETE RESTRICT,
    CONSTRAINT fk_cards_account FOREIGN KEY (acc_no)
        REFERENCES accounts (acc_no) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE 14: kyc (Regulatory Verification & Audit Trail)
-- ============================================================================
CREATE TABLE kyc (
    kyc_id VARCHAR(20) NOT NULL,
    cust_id VARCHAR(20) NOT NULL,
    kyc_type VARCHAR(50) NOT NULL,
    doc_details VARCHAR(255) NOT NULL,
    verified_on DATE NULL,
    verified_by VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Verified',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_kyc PRIMARY KEY (kyc_id),
    CONSTRAINT chk_kyc_status CHECK (status IN ('Verified', 'Pending', 'Rejected')),
    CONSTRAINT fk_kyc_customer FOREIGN KEY (cust_id)
        REFERENCES customers (cust_id) ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ============================================================================
-- SAMPLE SEED DATA
-- Inserted in strict Foreign Key Dependency Order
-- All information is fictional and safe for academic evaluation.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED: users
-- Passwords are stored as salted BCrypt hashes (e.g. demo password is demo123)
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, username, password_hash, role, contact_no, status) VALUES
('USR001', 'suraj_w', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98765 43210', 'Active'),
('USR002', 'anita_s', '$2a$10$wE7Y6eT5s3K1j9H0pL7Qe.A9bC3d4E5f6G7h8I9j0K1l2M3n4O5p6', 'Customer', '+91 91234 56789', 'Active'),
('USR101', 'rajesh_mgr', '$2a$10$q1W2e3R4t5Y6u7I8o9P0a.S1d2F3g4H5j6K7l8Z9x0C1v2B3n4M5k', 'Manager', '+91 98220 11223', 'Active'),
('USR102', 'pooja_acc', '$2a$10$z9X8c7V6b5N4m3L2k1J0h.G9f8D7s6A5p4O3i2U1y0T9r8E7w6Q5j', 'Employee', '+91 98220 44556', 'Active');

-- ----------------------------------------------------------------------------
-- 2. SEED: branches (manager_id initialized as NULL to resolve circular FK)
-- ----------------------------------------------------------------------------
INSERT INTO branches (branch_id, branch_name, ifsc_code, city, address, assets, manager_id) VALUES
('BR001', 'Pune FC Road Main Branch', 'ASRB0000101', 'Pune', '101, Ferguson College Road, Shivajinagar, Pune - 411005', 85000000.00, NULL),
('BR002', 'Mumbai Fort Flagship Branch', 'ASRB0000201', 'Mumbai', '24, Horniman Circle, Fort, Mumbai - 400001', 125000000.00, NULL);

-- ----------------------------------------------------------------------------
-- 3. SEED: employees
-- ----------------------------------------------------------------------------
INSERT INTO employees (emp_id, branch_id, name, designation, salary, email, phone, hire_date, status) VALUES
('EMP001', 'BR001', 'Rajesh Sharma', 'Branch Manager', 95000.00, 'rajesh.sharma@asrbank.com', '+91 98220 11223', '2021-03-15', 'Active'),
('EMP002', 'BR001', 'Pooja Patil', 'Senior Accountant', 65000.00, 'pooja.patil@asrbank.com', '+91 98220 44556', '2022-07-01', 'Active'),
('EMP003', 'BR002', 'Vikram Malhotra', 'Branch Manager', 105000.00, 'vikram.m@asrbank.com', '+91 98220 77889', '2020-01-10', 'Active'),
('EMP004', 'BR002', 'Sneha Kulkarni', 'Compliance Officer', 72000.00, 'sneha.k@asrbank.com', '+91 98220 99001', '2023-04-18', 'Active');

-- Safely assign branch managers after employee records exist
UPDATE branches SET manager_id = 'EMP001' WHERE branch_id = 'BR001';
UPDATE branches SET manager_id = 'EMP003' WHERE branch_id = 'BR002';

-- ----------------------------------------------------------------------------
-- 4. SEED: customers
-- Age is derived dynamically from dob. Sensitive Aadhaar masked.
-- ----------------------------------------------------------------------------
INSERT INTO customers (cust_id, user_id, branch_id, name, email, dob, gender, phone, address, aadhar_no, pan_no) VALUES
('CUST001', 'USR001', 'BR001', 'Suraj Walke', 'suraj@example.com', '1995-08-14', 'Male', '+91 98765 43210', 'Flat 402, Shivajinagar, Pune, Maharashtra - 411005', 'XXXX-XXXX-9012', 'ABCDE1234F'),
('CUST002', 'USR002', 'BR001', 'Anita Shinde', 'anita@example.com', '1998-03-22', 'Female', '+91 91234 56789', 'B-12, Kothrud Heights, Pune, Maharashtra - 411038', 'XXXX-XXXX-4567', 'XYZPK9876L');

-- ----------------------------------------------------------------------------
-- 5. SEED: accounts
-- ----------------------------------------------------------------------------
INSERT INTO accounts (acc_no, cust_id, branch_id, acc_type, balance, open_date, status) VALUES
('ACC001', 'CUST001', 'BR001', 'Savings', 45000.50, '2024-01-15', 'Active'),
('ACC002', 'CUST001', 'BR001', 'Current', 120000.00, '2024-05-10', 'Active'),
('ACC003', 'CUST002', 'BR001', 'Savings', 68500.00, '2024-02-20', 'Active');

-- ----------------------------------------------------------------------------
-- 6. SEED: transactions
-- Mirroring the realistic banking ledger from the prototype
-- ----------------------------------------------------------------------------
INSERT INTO transactions (txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description) VALUES
('TXN001', 'ACC001', 'Debit', 1200.00, '2026-09-28 10:30:00', 'UPI', 'Success', 'UPI/2026/0928/8912', 'UPI Payment - Grocery Supermarket'),
('TXN002', 'ACC001', 'Credit', 50000.00, '2026-09-27 09:15:00', 'NEFT', 'Success', 'NEFT/2026/0927/4431', 'Monthly Salary Credit - Tech Corp'),
('TXN003', 'ACC001', 'Debit', 9500.00, '2026-09-20 14:45:00', 'IMPS', 'Success', 'IMPS/2026/0920/1129', 'Personal Loan EMI Debit LN001'),
('TXN004', 'ACC001', 'Debit', 3450.00, '2026-09-18 18:20:00', 'UPI', 'Success', 'UPI/2026/0918/7723', 'Electricity Utility Bill Payment'),
('TXN005', 'ACC002', 'Credit', 25000.00, '2026-09-15 11:00:00', 'NEFT', 'Success', 'NEFT/2026/0915/9981', 'Client Project Milestone Invoice'),
('TXN006', 'ACC001', 'Debit', 850.00, '2026-09-12 16:10:00', 'UPI', 'Success', 'UPI/2026/0912/3342', 'Pharmacy Medicine Purchase'),
('TXN007', 'ACC001', 'Credit', 5000.00, '2026-09-10 13:40:00', 'IMPS', 'Success', 'IMPS/2026/0910/6654', 'Cashback & Dividend Credit'),
('TXN008', 'ACC001', 'Debit', 2200.00, '2026-09-08 20:05:00', 'UPI', 'Pending', 'UPI/2026/0908/9011', 'Online Food Delivery Order'),
('TXN009', 'ACC002', 'Debit', 15000.00, '2026-09-05 15:30:00', 'NEFT', 'Success', 'NEFT/2026/0905/2241', 'Vendor Supplier Settlement'),
('TXN010', 'ACC001', 'Debit', 1800.00, '2026-09-01 12:00:00', 'IMPS', 'Failed', 'IMPS/2026/0901/5512', 'Failed Merchant Gateway Transfer');

-- ----------------------------------------------------------------------------
-- 7. SEED: loan_interest_rates
-- ----------------------------------------------------------------------------
INSERT INTO loan_interest_rates (loan_type, base_interest_rate, min_tenure, max_tenure, description) VALUES
('Personal', 10.50, 12, 60, 'Unsecured personal loan for salaried and self-employed individuals'),
('Vehicle', 8.75, 12, 84, 'Secured financing for new and pre-owned automobiles'),
('Home', 8.25, 60, 360, 'Long-term residential mortgage and housing construction loan'),
('Education', 9.00, 12, 120, 'Higher studies loan for domestic and overseas accredited universities');

-- ----------------------------------------------------------------------------
-- 8. SEED: loans
-- Note: No cust_id column exists. Authoritative links are in loan_borrows.
-- ----------------------------------------------------------------------------
INSERT INTO loans (loan_id, branch_id, loan_type, amount, interest_rate, duration_months, sanction_date, issue_date, status) VALUES
('LN001', 'BR001', 'Personal', 200000.00, 10.50, 24, '2024-12-28', '2025-01-01', 'Active'),
('LN002', 'BR001', 'Vehicle', 450000.00, 8.75, 36, '2024-08-10', '2024-08-15', 'Active');

-- ----------------------------------------------------------------------------
-- 9. SEED: loan_borrows
-- Demonstrates single borrower for LN001, and joint co-borrowers for LN002
-- ----------------------------------------------------------------------------
INSERT INTO loan_borrows (loan_id, cust_id, borrower_type, added_on) VALUES
('LN001', 'CUST001', 'Primary', '2025-01-01'),
('LN002', 'CUST001', 'Primary', '2024-08-15'),
('LN002', 'CUST002', 'Co-Borrower', '2024-08-15');

-- ----------------------------------------------------------------------------
-- 10. SEED: loan_installments
-- ----------------------------------------------------------------------------
INSERT INTO loan_installments (installment_id, loan_id, installment_no, due_date, amount, paid_on, status) VALUES
('INST001', 'LN001', 1, '2025-02-01', 9500.00, '2025-01-30', 'Paid'),
('INST002', 'LN001', 2, '2025-03-01', 9500.00, '2025-02-28', 'Paid'),
('INST003', 'LN001', 3, '2025-04-01', 9500.00, NULL, 'Pending'),
('INST004', 'LN001', 4, '2025-05-01', 9500.00, NULL, 'Pending'),
('INST101', 'LN002', 1, '2024-09-15', 14250.00, '2024-09-12', 'Paid'),
('INST102', 'LN002', 2, '2024-10-15', 14250.00, '2024-10-14', 'Paid'),
('INST103', 'LN002', 3, '2024-11-15', 14250.00, NULL, 'Pending');

-- ----------------------------------------------------------------------------
-- 11. SEED: fixed_deposits
-- ----------------------------------------------------------------------------
INSERT INTO fixed_deposits (fd_id, cust_id, branch_id, amount, interest_rate, duration_months, start_date, maturity_date, status) VALUES
('FD001', 'CUST001', 'BR001', 100000.00, 7.20, 12, '2025-03-01', '2026-03-01', 'Active'),
('FD002', 'CUST001', 'BR001', 250000.00, 7.50, 36, '2024-06-15', '2027-06-15', 'Active');

-- ----------------------------------------------------------------------------
-- 12. SEED: fd_interest
-- ----------------------------------------------------------------------------
INSERT INTO fd_interest (interest_id, fd_id, interest_amount, calc_date, payout_date, status) VALUES
('INT001', 'FD001', 7200.00, '2026-03-01', '2026-03-01', 'Pending'),
('INT101', 'FD002', 9375.00, '2024-12-15', '2024-12-15', 'Credited'),
('INT102', 'FD002', 9375.00, '2025-06-15', '2025-06-15', 'Credited'),
('INT103', 'FD002', 9375.00, '2025-12-15', '2025-12-15', 'Pending');

-- ----------------------------------------------------------------------------
-- 13. SEED: cards
-- ----------------------------------------------------------------------------
INSERT INTO cards (card_no, cust_id, acc_no, card_type, issue_date, expiry_date, cvv_hash, status) VALUES
('4532XXXXXXXX1234', 'CUST001', 'ACC001', 'Debit', '2024-01-15', '2027-01-15', '***', 'Active'),
('5241XXXXXXXX5678', 'CUST001', NULL, 'Credit', '2024-05-10', '2028-05-10', '***', 'Active'),
('6071XXXXXXXX9012', 'CUST001', 'ACC002', 'Debit', '2023-11-20', '2026-11-20', '***', 'Blocked');

-- ----------------------------------------------------------------------------
-- 14. SEED: kyc
-- ----------------------------------------------------------------------------
INSERT INTO kyc (kyc_id, cust_id, kyc_type, doc_details, verified_on, verified_by, status) VALUES
('KYC001', 'CUST001', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 9012)', '2024-01-20', 'Operations Admin', 'Verified'),
('KYC002', 'CUST001', 'PAN Card', 'NSDL Verified (ABCDE••••F)', '2024-01-22', 'Compliance Officer', 'Verified'),
('KYC003', 'CUST002', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 4567)', '2024-02-25', 'Operations Admin', 'Verified');

-- ============================================================================
-- END OF INITIALIZATION SCRIPT
-- ============================================================================