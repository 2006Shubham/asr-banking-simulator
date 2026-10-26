-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 01: Basic SQL Queries, Filtering, Sorting & Projections
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- QUERY 1.1: Retrieve Customer Accounts (Simple SELECT with Filter & Sort)
-- ============================================================================
-- DBMS Concept:
--   1. Projection: Choosing specific columns rather than `SELECT *`.
--      Why? Reduces network I/O, prevents memory bloat, avoids leaking internal columns.
--   2. Selection: Filtering rows based on a predicate in the WHERE clause (`cust_id = ?`).
--      Why? Utilizes index on foreign key `fk_accounts_customer` for fast lookup.
--   3. Ordering: Sorting output rows deterministically using ORDER BY (`acc_no ASC`).
--
-- Security Principle (SQL Injection Prevention):
--   In Java, the parameter '?' is never concatenated with raw user input.
--   Instead, a PreparedStatement sends the query structure and parameter values separately.
-- ============================================================================

SELECT 
    acc_no, 
    cust_id, 
    branch_id, 
    acc_type, 
    balance, 
    open_date, 
    status
FROM 
    accounts
WHERE 
    cust_id = 'CUST001'
ORDER BY 
    acc_no ASC;

-- Expected Output:
-- +--------+---------+-----------+----------+-----------+------------+--------+
-- | acc_no | cust_id | branch_id | acc_type | balance   | open_date  | status |
-- +--------+---------+-----------+----------+-----------+------------+--------+
-- | ACC001 | CUST001 | BR001     | Savings  |  44000.50 | 2024-01-15 | Active |
-- | ACC002 | CUST001 | BR001     | Current  | 121000.00 | 2024-05-10 | Active |
-- +--------+---------+-----------+----------+-----------+------------+--------+


-- ============================================================================
-- QUERY 1.2: Retrieve Account by Account Number (Primary Key Point Lookup)
-- ============================================================================
-- DBMS Concept:
--   - Single-row lookup utilizing the Primary Key index (B+ Tree traversal).
--   - Computational complexity: O(log N) disk reads.
-- ============================================================================

SELECT 
    acc_no, 
    cust_id, 
    branch_id, 
    acc_type, 
    balance, 
    open_date, 
    status
FROM 
    accounts
WHERE 
    acc_no = 'ACC001';

-- Expected Output:
-- +--------+---------+-----------+----------+-----------+------------+--------+
-- | acc_no | cust_id | branch_id | acc_type | balance   | open_date  | status |
-- +--------+---------+-----------+----------+-----------+------------+--------+
-- | ACC001 | CUST001 | BR001     | Savings  |  44000.50 | 2024-01-15 | Active |
-- +--------+---------+-----------+----------+-----------+------------+--------+
