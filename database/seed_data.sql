-- ==============================================================================
-- ASR BANKING SIMULATOR - DEMO SEED DATA SCRIPT
-- Project: Advanced Core Banking & DBMS Simulator
-- Description: Idempotent script to populate demo customers, employees, and managers
-- Team Members: Rutuja Peherkar, Suraj Wakhure, Atharva Wadekar, Shubham Deshmukh
-- ==============================================================================

USE asr_banking;

-- ------------------------------------------------------------------------------
-- 1. USERS (Authentication Credentials)
-- Password for all demo accounts is 'demo123'
-- BCrypt Hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
-- ------------------------------------------------------------------------------
INSERT INTO users (user_id, username, password_hash, role, contact_no, status) VALUES
-- Manager & Staff
('USR103', 'atharva_mgr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Manager', '+91 98220 10001', 'Active'),
('USR104', 'shubham_emp', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Employee', '+91 98220 10002', 'Active'),

-- 11 Demonstration Customers
('USR010', 'rutuja_p', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10010', 'Active'),
('USR011', 'suraj_wakhure', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10011', 'Active'),
('USR012', 'anushka_u', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10012', 'Active'),
('USR013', 'arpita_n', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10013', 'Active'),
('USR014', 'vishal_r', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10014', 'Active'),
('USR015', 'akash_s', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10015', 'Active'),
('USR016', 'harsh_k', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10016', 'Active'),
('USR017', 'omkar_p', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10017', 'Active'),
('USR018', 'kiran_k', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10018', 'Active'),
('USR019', 'harshada_c', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10019', 'Active'),
('USR020', 'siddhi_s', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Customer', '+91 98220 10020', 'Active')
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    contact_no = VALUES(contact_no),
    status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 2. EMPLOYEES & MANAGERS
-- ------------------------------------------------------------------------------
INSERT INTO employees (emp_id, user_id, branch_id, name, designation, salary, email, phone, hire_date, status) VALUES
('EMP005', 'USR104', 'BR001', 'Shubham Deshmukh', 'Senior Operations Executive', 72000.00, 'shubham.deshmukh.staff@asrbank.com', '+91 98220 10002', '2023-06-15', 'Active'),
('EMP006', 'USR103', 'BR001', 'Atharva Wadekar', 'Branch Manager', 125000.00, 'atharva.wadekar.mgr@asrbank.com', '+91 98220 10001', '2022-03-01', 'Active')
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    branch_id = VALUES(branch_id),
    name = VALUES(name),
    designation = VALUES(designation),
    salary = VALUES(salary),
    email = VALUES(email),
    phone = VALUES(phone),
    hire_date = VALUES(hire_date),
    status = VALUES(status);

-- Set Atharva Wadekar as Manager for Pune Main Branch (BR001)
UPDATE branches SET manager_id = 'EMP006' WHERE branch_id = 'BR001';

-- ------------------------------------------------------------------------------
-- 3. CUSTOMERS (11 Distinct Demo Records)
-- ------------------------------------------------------------------------------
INSERT INTO customers (cust_id, user_id, branch_id, name, email, dob, gender, phone, address, aadhar_no, pan_no) VALUES
('CUST010', 'USR010', 'BR001', 'Rutuja Peherkar', 'rutuja.peherkar.demo@asrbank.com', '2001-08-14', 'Female', '+91 98220 10010', 'B-402, Shivajinagar, Pune, Maharashtra 411005', '9012 3456 1001', 'ABCDE1001F'),
('CUST011', 'USR011', 'BR001', 'Suraj Wakhure', 'suraj.wakhure.demo@asrbank.com', '2000-11-20', 'Male', '+91 98220 10011', 'A-104, Kothrud, Pune, Maharashtra 411038', '9012 3456 1002', 'ABCDE1002F'),
('CUST012', 'USR012', 'BR001', 'Anushka Udawant', 'anushka.udawant.demo@asrbank.com', '2002-04-12', 'Female', '+91 98220 10012', 'Flat 203, Aundh, Pune, Maharashtra 411007', '9012 3456 1003', 'ABCDE1003F'),
('CUST013', 'USR013', 'BR001', 'Arpita Nikam', 'arpita.nikam.demo@asrbank.com', '2001-09-25', 'Female', '+91 98220 10013', 'Row House 12, Baner, Pune, Maharashtra 411045', '9012 3456 1004', 'ABCDE1004F'),
('CUST014', 'USR014', 'BR001', 'Vishal Rathod', 'vishal.rathod.demo@asrbank.com', '1999-07-19', 'Male', '+91 98220 10014', 'C-301, Viman Nagar, Pune, Maharashtra 411014', '9012 3456 1005', 'ABCDE1005F'),
('CUST015', 'USR015', 'BR001', 'Akash Sose', 'akash.sose.demo@asrbank.com', '2000-03-30', 'Male', '+91 98220 10015', 'Plot 45, Hadapsar, Pune, Maharashtra 411028', '9012 3456 1006', 'ABCDE1006F'),
('CUST016', 'USR016', 'BR001', 'Harsh Kathar', 'harsh.kathar.demo@asrbank.com', '2001-12-05', 'Male', '+91 98220 10016', 'Green Glen 10, Kalyani Nagar, Pune, Maharashtra 411006', '9012 3456 1007', 'ABCDE1007F'),
('CUST017', 'USR017', 'BR001', 'Omkar Patil', 'omkar.patil.demo@asrbank.com', '2000-06-18', 'Male', '+91 98220 10017', 'Shree Nilaya 5, Sinhagad Road, Pune, Maharashtra 411041', '9012 3456 1008', 'ABCDE1008F'),
('CUST018', 'USR018', 'BR001', 'Kiran Kelode', 'kiran.kelode.demo@asrbank.com', '2001-02-22', 'Male', '+91 98220 10018', 'Building D-5, Wakad, Pune, Maharashtra 411057', '9012 3456 1009', 'ABCDE1009F'),
('CUST019', 'USR019', 'BR001', 'Harshada Chaudhari', 'harshada.chaudhari.demo@asrbank.com', '2002-05-15', 'Female', '+91 98220 10019', 'Sai Residency, Pimple Saudagar, Pune, Maharashtra 411027', '9012 3456 1010', 'ABCDE1010F'),
('CUST020', 'USR020', 'BR001', 'Siddhi Shelke', 'siddhi.shelke.demo@asrbank.com', '2002-10-08', 'Female', '+91 98220 10020', 'Prabhat Heights 8, Karve Nagar, Pune, Maharashtra 411052', '9012 3456 1011', 'ABCDE1011F')
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    branch_id = VALUES(branch_id),
    name = VALUES(name),
    email = VALUES(email),
    dob = VALUES(dob),
    gender = VALUES(gender),
    phone = VALUES(phone),
    address = VALUES(address),
    aadhar_no = VALUES(aadhar_no),
    pan_no = VALUES(pan_no);

-- ------------------------------------------------------------------------------
-- 4. ACCOUNTS (Active Savings Accounts for each Demo Customer)
-- ------------------------------------------------------------------------------
INSERT INTO accounts (acc_no, cust_id, branch_id, acc_type, balance, open_date, status) VALUES
('ACC010', 'CUST010', 'BR001', 'Savings', 85000.00, '2024-01-10', 'Active'),
('ACC011', 'CUST011', 'BR001', 'Savings', 92500.00, '2024-01-11', 'Active'),
('ACC012', 'CUST012', 'BR001', 'Savings', 64000.00, '2024-01-12', 'Active'),
('ACC013', 'CUST013', 'BR001', 'Savings', 112000.00, '2024-01-15', 'Active'),
('ACC014', 'CUST014', 'BR001', 'Savings', 48500.00, '2024-01-16', 'Active'),
('ACC015', 'CUST015', 'BR001', 'Savings', 73200.00, '2024-01-18', 'Active'),
('ACC016', 'CUST016', 'BR001', 'Savings', 58000.00, '2024-01-20', 'Active'),
('ACC017', 'CUST017', 'BR001', 'Savings', 96400.00, '2024-01-22', 'Active'),
('ACC018', 'CUST018', 'BR001', 'Savings', 67500.00, '2024-01-25', 'Active'),
('ACC019', 'CUST019', 'BR001', 'Savings', 88900.00, '2024-01-26', 'Active'),
('ACC020', 'CUST020', 'BR001', 'Savings', 124500.00, '2024-01-28', 'Active')
ON DUPLICATE KEY UPDATE
    cust_id = VALUES(cust_id),
    branch_id = VALUES(branch_id),
    acc_type = VALUES(acc_type),
    balance = VALUES(balance),
    open_date = VALUES(open_date),
    status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 5. KYC VERIFICATION RECORDS
-- ------------------------------------------------------------------------------
INSERT INTO kyc (kyc_id, cust_id, kyc_type, doc_details, verified_on, verified_by, status) VALUES
('KYC010', 'CUST010', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1001)', '2024-01-10', 'Operations Admin', 'Verified'),
('KYC011', 'CUST011', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1002)', '2024-01-11', 'Operations Admin', 'Verified'),
('KYC012', 'CUST012', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1003)', '2024-01-12', 'Operations Admin', 'Verified'),
('KYC013', 'CUST013', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1004)', '2024-01-15', 'Operations Admin', 'Verified'),
('KYC014', 'CUST014', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1005)', '2024-01-16', 'Operations Admin', 'Verified'),
('KYC015', 'CUST015', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1006)', '2024-01-18', 'Operations Admin', 'Verified'),
('KYC016', 'CUST016', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1007)', '2024-01-20', 'Operations Admin', 'Verified'),
('KYC017', 'CUST017', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1008)', '2024-01-22', 'Operations Admin', 'Verified'),
('KYC018', 'CUST018', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1009)', '2024-01-25', 'Operations Admin', 'Verified'),
('KYC019', 'CUST019', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1010)', '2024-01-26', 'Operations Admin', 'Verified'),
('KYC020', 'CUST020', 'Aadhaar Card', 'UIDAI Biometric Verified (XXXX XXXX 1011)', '2024-01-28', 'Operations Admin', 'Verified')
ON DUPLICATE KEY UPDATE
    cust_id = VALUES(cust_id),
    kyc_type = VALUES(kyc_type),
    doc_details = VALUES(doc_details),
    verified_on = VALUES(verified_on),
    verified_by = VALUES(verified_by),
    status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 6. DEBIT CARDS FOR ACTIVE DEMO CUSTOMERS
-- ------------------------------------------------------------------------------
INSERT INTO cards (card_no, cust_id, acc_no, card_type, issue_date, expiry_date, cvv_hash, status) VALUES
('4532XXXXXXXX1010', 'CUST010', 'ACC010', 'Debit', '2024-01-10', '2028-01-10', '***', 'Active'),
('4532XXXXXXXX1011', 'CUST011', 'ACC011', 'Debit', '2024-01-11', '2028-01-11', '***', 'Active'),
('4532XXXXXXXX1012', 'CUST012', 'ACC012', 'Debit', '2024-01-12', '2028-01-12', '***', 'Active'),
('4532XXXXXXXX1013', 'CUST013', 'ACC013', 'Debit', '2024-01-15', '2028-01-15', '***', 'Active'),
('4532XXXXXXXX1014', 'CUST014', 'ACC014', 'Debit', '2024-01-16', '2028-01-16', '***', 'Active'),
('4532XXXXXXXX1015', 'CUST015', 'ACC015', 'Debit', '2024-01-18', '2028-01-18', '***', 'Active'),
('4532XXXXXXXX1016', 'CUST016', 'ACC016', 'Debit', '2024-01-20', '2028-01-20', '***', 'Active'),
('4532XXXXXXXX1017', 'CUST017', 'ACC017', 'Debit', '2024-01-22', '2028-01-22', '***', 'Active'),
('4532XXXXXXXX1018', 'CUST018', 'ACC018', 'Debit', '2024-01-25', '2028-01-25', '***', 'Active'),
('4532XXXXXXXX1019', 'CUST019', 'ACC019', 'Debit', '2024-01-26', '2028-01-26', '***', 'Active'),
('4532XXXXXXXX1020', 'CUST020', 'ACC020', 'Debit', '2024-01-28', '2028-01-28', '***', 'Active')
ON DUPLICATE KEY UPDATE
    cust_id = VALUES(cust_id),
    acc_no = VALUES(acc_no),
    card_type = VALUES(card_type),
    issue_date = VALUES(issue_date),
    expiry_date = VALUES(expiry_date),
    cvv_hash = VALUES(cvv_hash),
    status = VALUES(status);

