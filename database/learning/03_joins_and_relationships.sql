-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 03: SQL JOINs, Referential Integrity & Multi-Table Relationships
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- 1. THEORETICAL FOUNDATION: HOW RELATIONAL JOINS WORK
-- ============================================================================
-- In Relational Algebra, a Theta Join (R ⋈_θ S) is mathematically defined as:
--       R ⋈_θ S = σ_θ (R × S)
--
-- 1. Cartesian Product (R × S):
--    Combines every tuple of R with every tuple of S.
--    If R has 10 rows and S has 5 rows, R × S produces 50 intermediate rows.
--
-- 2. Selection (σ_θ):
--    Filters the Cartesian Product retaining only tuples satisfying the condition θ
--    (usually primary key = foreign key: e.g., accounts.cust_id = customers.cust_id).
--
-- MySQL's Query Optimizer:
-- Instead of generating huge Cartesian products, InnoDB uses:
--   - Nested Loop Join (NLJ) with B-Tree Index lookups
--   - Block Nested Loop / Hash Join (in MySQL 8.0+)
-- ============================================================================


-- ============================================================================
-- QUERY 3.1: 2-Table INNER JOIN (Customers ⋈ Accounts)
-- ============================================================================
-- Purpose:
--   Retrieves all accounts alongside their owning customer demographic details.
-- Relationship:
--   1:N (One Customer owns Many Accounts)
-- Foreign Key:
--   accounts.cust_id REFERENCES customers(cust_id)
-- ============================================================================

SELECT 
    c.cust_id,
    c.name AS customer_name,
    c.email,
    c.phone,
    a.acc_no,
    a.acc_type,
    a.balance,
    a.status AS account_status
FROM 
    customers c
INNER JOIN 
    accounts a ON c.cust_id = a.cust_id
WHERE 
    c.cust_id = 'CUST001'
ORDER BY 
    a.acc_no ASC;

-- Expected Output:
-- +---------+---------------+-------------------+-----------------+--------+----------+-----------+----------------+
-- | cust_id | customer_name | email             | phone           | acc_no | acc_type | balance   | account_status |
-- +---------+---------------+-------------------+-----------------+--------+----------+-----------+----------------+
-- | CUST001 | Suraj Walke   | suraj@example.com | +91 98765 43210 | ACC001 | Savings  |  44000.50 | Active         |
-- | CUST001 | Suraj Walke   | suraj@example.com | +91 98765 43210 | ACC002 | Current  | 121000.00 | Active         |
-- +---------+---------------+-------------------+-----------------+--------+----------+-----------+----------------+


-- ============================================================================
-- QUERY 3.2: 3-Table INNER JOIN (Customers ⋈ Accounts ⋈ Branches)
-- ============================================================================
-- Purpose:
--   Retrieves accounts with BOTH customer demographics and home branch details.
-- Relationships:
--   customers (1) ──── (N) accounts (N) ──── (1) branches
-- Joining Logic:
--   - Join 1: c.cust_id = a.cust_id   (Identifies account owner)
--   - Join 2: a.branch_id = b.branch_id (Identifies branch maintaining the account)
-- ============================================================================

SELECT 
    c.cust_id,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    a.acc_no,
    a.acc_type,
    a.balance,
    a.open_date,
    a.status AS account_status,
    b.branch_id,
    b.branch_name,
    b.ifsc_code,
    b.city AS branch_city
FROM 
    customers c
INNER JOIN 
    accounts a ON c.cust_id = a.cust_id
INNER JOIN 
    branches b ON a.branch_id = b.branch_id
WHERE 
    c.cust_id = 'CUST001'
ORDER BY 
    a.acc_no ASC;

-- Expected Output:
-- +---------+---------------+-------------------+-----------------+--------+----------+-----------+------------+----------------+-----------+--------------------------+-------------+-------------+
-- | cust_id | customer_name | customer_email    | customer_phone  | acc_no | acc_type | balance   | open_date  | account_status | branch_id | branch_name              | ifsc_code   | branch_city |
-- +---------+---------------+-------------------+-----------------+--------+----------+-----------+------------+----------------+-----------+--------------------------+-------------+-------------+
-- | CUST001 | Suraj Walke   | suraj@example.com | +91 98765 43210 | ACC001 | Savings  |  44000.50 | 2024-01-15 | Active         | BR001     | Pune FC Road Main Branch | ASRB0000101 | Pune        |
-- | CUST001 | Suraj Walke   | suraj@example.com | +91 98765 43210 | ACC002 | Current  | 121000.00 | 2024-05-10 | Active         | BR001     | Pune FC Road Main Branch | ASRB0000101 | Pune        |
-- +---------+---------------+-------------------+-----------------+--------+----------+-----------+------------+----------------+-----------+--------------------------+-------------+-------------+


-- ============================================================================
-- QUERY 3.3: Many-to-Many (M:N) JOIN via Junction Table (Customers ⋈ loan_borrows ⋈ loans)
-- ============================================================================
-- Academic Significance:
--   Demonstrates why normalized database design uses junction tables for M:N.
--   A loan can have multiple co-borrowers, and a customer can hold multiple loans.
-- Relationship:
--   customers (M) ──── (loan_borrows) ──── (N) loans
-- ============================================================================

SELECT 
    c.cust_id,
    c.name AS customer_name,
    lb.borrower_type,
    lb.added_on,
    l.loan_id,
    l.loan_type,
    l.amount AS sanctioned_amount,
    l.interest_rate,
    l.duration_months,
    l.status AS loan_status
FROM 
    customers c
INNER JOIN 
    loan_borrows lb ON c.cust_id = lb.cust_id
INNER JOIN 
    loans l ON lb.loan_id = l.loan_id
WHERE 
    c.cust_id = 'CUST001'
ORDER BY 
    l.loan_id ASC;

-- Expected Output:
-- +---------+---------------+---------------+------------+---------+-----------+-------------------+---------------+-----------------+-------------+
-- | cust_id | customer_name | borrower_type | added_on   | loan_id | loan_type | sanctioned_amount | interest_rate | duration_months | loan_status |
-- +---------+---------------+---------------+------------+---------+-----------+-------------------+---------------+-----------------+-------------+
-- | CUST001 | Suraj Walke   | Primary       | 2025-01-10 | LN001   | Personal  |         200000.00 |         10.50 |              24 | Active      |
-- | CUST001 | Suraj Walke   | Primary       | 2024-06-15 | LN002   | Vehicle   |         450000.00 |          8.75 |              36 | Active      |
-- +---------+---------------+---------------+------------+---------+-----------+-------------------+---------------+-----------------+-------------+


-- ============================================================================
-- QUERY 3.4: LEFT OUTER JOIN (Preserving Unmatched Tuples)
-- ============================================================================
-- DBMS Concept:
--   - INNER JOIN only returns rows where the join condition matches in BOTH tables.
--   - LEFT JOIN returns ALL rows from the left table (customers), even if there are
--     ZERO matching rows in the right table (loan_borrows). Missing attributes are filled with NULL.
-- ============================================================================

SELECT 
    c.cust_id,
    c.name AS customer_name,
    c.email,
    l.loan_id,
    l.loan_type,
    l.amount
FROM 
    customers c
LEFT JOIN 
    loan_borrows lb ON c.cust_id = lb.cust_id
LEFT JOIN 
    loans l ON lb.loan_id = l.loan_id
ORDER BY 
    c.cust_id ASC;

-- Notice: If a customer has no loans, their cust_id and name still appear,
-- while loan_id, loan_type, and amount will be NULL!
