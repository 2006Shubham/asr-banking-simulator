-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 05: Nested Queries, Subqueries & Set Operations
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- 1. THEORETICAL FOUNDATION: SUBQUERY TYPES & EVALUATION STRATEGIES
-- ============================================================================
-- A subquery is an inner query nested within an outer SQL statement (SELECT, INSERT,
-- UPDATE, DELETE).
--
-- Subquery Classifications:
-- 1. Scalar Subquery:
--    Returns exactly ONE row and ONE column (a single scalar value).
--    Can be used wherever a constant literal or expression is expected.
--    Example: WHERE balance > (SELECT AVG(balance) FROM accounts)
--
-- 2. Multi-Row Subquery:
--    Returns a single column with multiple rows (a set of scalar values).
--    Evaluated using set comparison operators: IN, NOT IN, ANY/SOME, ALL.
--    Example: WHERE cust_id IN (SELECT cust_id FROM loans WHERE amount > 100000)
--
-- 3. Independent (Uncorrelated) Subquery:
--    Does NOT reference columns from the outer query.
--    The database optimizer evaluates it ONCE before outer query execution,
--    materializing or caching the result.
--
-- 4. Correlated Subquery:
--    References one or more columns from the outer query's current row.
--    Conceptually, it must be evaluated ONCE FOR EACH ROW evaluated by the outer query
--    (like an inner loop in nested-loop processing).
--
-- 5. Existential Quantification (EXISTS / NOT EXISTS):
--    Corresponds to mathematical First-Order Relational Calculus (∃ and ¬∃).
--    Evaluates whether the subquery produces at least one row (TRUE) or zero rows (FALSE).
--    Short-circuit execution: stops as soon as the first matching tuple is found.
--
-- 6. Critical Viva Pitfall — NOT IN vs NOT EXISTS with NULLs (Three-Valued Logic):
--    If a subquery returning a column contains even a single NULL,
--    'val NOT IN (SELECT col FROM ...)' evaluates to UNKNOWN, returning ZERO rows!
--    'NOT EXISTS' is completely immune to this problem because it only checks for row existence.
-- ============================================================================


-- ============================================================================
-- QUERY 5.1: Scalar Subquery in WHERE Clause
-- ============================================================================
-- Business Goal:
--   Identify High-Net-Worth accounts whose balance is strictly above the bank-wide
--   average balance across all active accounts.
-- Execution:
--   Inner query runs once -> calculates avg (₹77,833.50).
--   Outer query filters accounts where balance > 77833.50.
-- ============================================================================

SELECT 
    acc_no,
    cust_id,
    branch_id,
    acc_type,
    balance,
    status
FROM 
    accounts
WHERE 
    balance > (
        SELECT AVG(balance) 
        FROM accounts 
        WHERE status = 'Active'
    )
    AND status = 'Active'
ORDER BY 
    balance DESC;

-- Expected Output:
-- +--------+---------+-----------+----------+-----------+--------+
-- | acc_no | cust_id | branch_id | acc_type | balance   | status |
-- +--------+---------+-----------+----------+-----------+--------+
-- | ACC002 | CUST001 | BR001     | Current  | 121000.00 | Active |
-- +--------+---------+-----------+----------+-----------+--------+


-- ============================================================================
-- QUERY 5.2: Independent Multi-Row Subquery with IN Operator
-- ============================================================================
-- Business Goal:
--   Find customer demographic details for customers holding accounts with
--   balances of ₹100,000 or greater.
-- ============================================================================

SELECT 
    cust_id,
    name AS customer_name,
    email,
    phone
FROM 
    customers
WHERE 
    cust_id IN (
        SELECT DISTINCT cust_id 
        FROM accounts 
        WHERE balance >= 100000.00 
          AND status = 'Active'
    )
ORDER BY 
    cust_id ASC;

-- Expected Output:
-- +---------+---------------+-------------------+-----------------+
-- | cust_id | customer_name | email             | phone           |
-- +---------+---------------+-------------------+-----------------+
-- | CUST001 | Suraj Walke   | suraj@example.com | +91 98765 43210 |
-- +---------+---------------+-------------------+-----------------+


-- ============================================================================
-- QUERY 5.3: Correlated Subquery (Comparison Against Group Average)
-- ============================================================================
-- Business Goal:
--   Find accounts whose balance exceeds the average balance of THEIR OWN HOME BRANCH.
-- Correlation:
--   sub.branch_id = a.branch_id links the inner query to outer row 'a'.
-- ============================================================================

SELECT 
    a.acc_no,
    a.cust_id,
    a.branch_id,
    a.acc_type,
    a.balance
FROM 
    accounts a
WHERE 
    a.balance > (
        SELECT AVG(sub.balance)
        FROM accounts sub
        WHERE sub.branch_id = a.branch_id 
          AND sub.status = 'Active'
    )
    AND a.status = 'Active'
ORDER BY 
    a.balance DESC;

-- Expected Output:
-- +--------+---------+-----------+----------+-----------+
-- | acc_no | cust_id | branch_id | acc_type | balance   |
-- +--------+---------+-----------+----------+-----------+
-- | ACC002 | CUST001 | BR001     | Current  | 121000.00 |
-- +--------+---------+-----------+----------+-----------+


-- ============================================================================
-- QUERY 5.4: Correlated Existential Subquery with EXISTS (Semi-Join)
-- ============================================================================
-- Business Goal:
--   Find all branch locations that maintain at least one large loan (sanctioned >= ₹300,000).
-- Performance:
--   Uses short-circuit evaluation: evaluates to TRUE as soon as the 1st row matches.
-- ============================================================================

SELECT 
    b.branch_id,
    b.branch_name,
    b.city,
    b.ifsc_code
FROM 
    branches b
WHERE 
    EXISTS (
        SELECT 1 
        FROM loans l 
        WHERE l.branch_id = b.branch_id 
          AND l.amount >= 300000.00
    )
ORDER BY 
    b.branch_id ASC;

-- Expected Output:
-- +-----------+--------------------------+------+-------------+
-- | branch_id | branch_name              | city | ifsc_code   |
-- +-----------+--------------------------+------+-------------+
-- | BR001     | Pune FC Road Main Branch | Pune | ASRB0000101 |
-- +-----------+--------------------------+------+-------------+


-- ============================================================================
-- QUERY 5.5: Correlated Anti-Join with NOT EXISTS
-- ============================================================================
-- Business Goal:
--   Identify cross-sell opportunities: Find active customers who hold bank accounts,
--   but have NEVER opened any Fixed Deposit (FD).
-- Safe from 3VL NULL issues:
--   Unlike 'NOT IN (SELECT cust_id FROM fixed_deposits)', NOT EXISTS is 100% NULL-safe.
-- ============================================================================

SELECT 
    c.cust_id,
    c.name AS customer_name,
    c.email,
    c.phone
FROM 
    customers c
WHERE 
    EXISTS (
        SELECT 1 
        FROM accounts a 
        WHERE a.cust_id = c.cust_id 
          AND a.status = 'Active'
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM fixed_deposits fd 
        WHERE fd.cust_id = c.cust_id
    )
ORDER BY 
    c.cust_id ASC;

-- Expected Output:
-- +---------+---------------+-------------------+-----------------+
-- | cust_id | customer_name | email             | phone           |
-- +---------+---------------+-------------------+-----------------+
-- | CUST002 | Anita Shinde  | anita@example.com | +91 98765 43211 |
-- +---------+---------------+-------------------+-----------------+


-- ============================================================================
-- QUERY 5.6: Set Operations (UNION vs UNION ALL)
-- ============================================================================
-- Concepts Demonstrated:
--   - UNION: Combines result sets of two queries and ELIMINATES duplicate tuples.
--   - UNION ALL: Combines result sets and PRESERVES duplicates (faster execution).
-- Rules for Set Compatibility:
--   1. Both queries must select the SAME number of columns.
--   2. Corresponding columns must have compatible data types.
-- ============================================================================

SELECT 
    cust_id, 
    'Active Account Holder' AS engagement_role 
FROM 
    accounts 
WHERE 
    status = 'Active'

UNION

SELECT 
    cust_id, 
    'Active Loan Borrower' AS engagement_role 
FROM 
    loan_borrows;

-- Expected Output:
-- +---------+-----------------------+
-- | cust_id | engagement_role       |
-- +---------+-----------------------+
-- | CUST001 | Active Account Holder |
-- | CUST002 | Active Account Holder |
-- | CUST001 | Active Loan Borrower  |
-- | CUST002 | Active Loan Borrower  |
-- +---------+-----------------------+
