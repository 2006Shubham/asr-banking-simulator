-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 04: SQL Aggregation Functions, GROUP BY, and HAVING Clause
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- 1. THEORETICAL FOUNDATION: AGGREGATE OPERATIONS IN RELATIONAL ALGEBRA
-- ============================================================================
-- In Relational Algebra, aggregation and grouping are represented by the
-- Aggregate Operator (often symbolized as 𝒢 or γ):
--
--        γ_{grouping_attributes}, {aggregate_functions}(Relation)
--
-- For example:
--        γ_{acc_type}, COUNT(acc_no), SUM(balance)(accounts)
--
-- How It Works:
-- 1. Partitioning (GROUP BY):
--    Tuples in the relation are partitioned into non-overlapping groups (equivalence classes)
--    such that all tuples in a group have the exact same values for the grouping attributes.
--
-- 2. Aggregate Computation:
--    Within each partitioned group, the aggregate function is evaluated across
--    all group members, collapsing multiple rows into a single scalar value.
--
-- 3. Non-Aggregate Projection Rule (ANSI SQL & MySQL ONLY_FULL_GROUP_BY):
--    Any column listed in the SELECT clause that is NOT inside an aggregate function
--    MUST be included in the GROUP BY clause. Otherwise, the database engine
--    cannot decide which arbitrary row value to display for that group.
--
-- 4. Filtering: WHERE vs HAVING:
--    - WHERE clause: Filters individual tuples BEFORE grouping and aggregation.
--    - HAVING clause: Filters the aggregated groups AFTER groups are formed.
--    NOTE: You CANNOT use aggregate functions in a WHERE clause (e.g., WHERE SUM(balance) > 1000).
--          Attempting this triggers SQL Error 1111: Invalid use of group function.
-- ============================================================================


-- ============================================================================
-- QUERY 4.1: Standard ANSI SQL Aggregate Suite (Bank-Wide Metrics)
-- ============================================================================
-- Concepts Demonstrated:
--   - COUNT(*): Counts total rows (including NULLs).
--   - COUNT(DISTINCT col): Counts unique non-null values.
--   - SUM(col): Sums numeric values (ignores NULLs).
--   - AVG(col): Computes arithmetic mean (SUM / COUNT of non-nulls).
--   - MIN(col) / MAX(col): Computes boundary extremes.
-- ============================================================================

SELECT 
    COUNT(*) AS total_active_accounts,
    COUNT(DISTINCT cust_id) AS distinct_customers,
    SUM(balance) AS total_liquidity_reserve,
    ROUND(AVG(balance), 2) AS avg_account_balance,
    MIN(balance) AS lowest_balance,
    MAX(balance) AS highest_balance
FROM 
    accounts
WHERE 
    status = 'Active';

-- Expected Output:
-- +-----------------------+--------------------+-------------------------+---------------------+----------------+-----------------+
-- | total_active_accounts | distinct_customers | total_liquidity_reserve | avg_account_balance | lowest_balance | highest_balance |
-- +-----------------------+--------------------+-------------------------+---------------------+----------------+-----------------+
-- |                     3 |                  2 |               233500.50 |            77833.50 |       44000.50 |       121000.00 |
-- +-----------------------+--------------------+-------------------------+---------------------+----------------+-----------------+


-- ============================================================================
-- QUERY 4.2: GROUP BY Single Column (Liquidity Distribution by Account Type)
-- ============================================================================
-- Purpose:
--   Shows how bank deposits are distributed across Savings vs Current accounts.
-- Grouping Attribute:
--   acc_type
-- ============================================================================

SELECT 
    acc_type,
    COUNT(*) AS account_count,
    SUM(balance) AS total_balance,
    ROUND(AVG(balance), 2) AS avg_balance,
    MIN(balance) AS min_balance,
    MAX(balance) AS max_balance
FROM 
    accounts
WHERE 
    status = 'Active'
GROUP BY 
    acc_type
ORDER BY 
    total_balance DESC;

-- Expected Output:
-- +----------+---------------+---------------+-------------+-------------+-------------+
-- | acc_type | account_count | total_balance | avg_balance | min_balance | max_balance |
-- +----------+---------------+---------------+-------------+-------------+-------------
-- | Current  |             1 |     121000.00 |   121000.00 |   121000.00 |   121000.00 |
-- | Savings  |             2 |     112500.50 |    56250.25 |    44000.50 |    68500.00 |
-- +----------+---------------+---------------+-------------+-------------+-------------+


-- ============================================================================
-- QUERY 4.3: Multi-Column GROUP BY (Transaction Volume by Account & Type)
-- ============================================================================
-- Purpose:
--   Aggregates total credits and debits per account to audit cash flow.
-- Grouping Attributes:
--   acc_no, txn_type
-- ============================================================================

SELECT 
    acc_no,
    txn_type,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_flow_amount,
    ROUND(AVG(amount), 2) AS avg_flow_amount
FROM 
    transactions
WHERE 
    status = 'Success'
GROUP BY 
    acc_no, 
    txn_type
ORDER BY 
    acc_no ASC, 
    txn_type ASC;

-- Expected Output:
-- +--------+----------+-------------------+-------------------+-----------------+
-- | acc_no | txn_type | transaction_count | total_flow_amount | avg_flow_amount |
-- +--------+----------+-------------------+-------------------+-----------------+
-- | ACC001 | Credit   |                 2 |          55000.00 |        27500.00 |
-- | ACC001 | Debit    |                 4 |          15000.00 |         3750.00 |
-- | ACC002 | Credit   |                 1 |          25000.00 |        25000.00 |
-- | ACC002 | Debit    |                 1 |          15000.00 |        15000.00 |
-- +--------+----------+-------------------+-------------------+-----------------+


-- ============================================================================
-- QUERY 4.4: Combining JOIN with GROUP BY (Customer Net Worth Portfolio)
-- ============================================================================
-- Purpose:
--   Joins customers with accounts to calculate each customer's cumulative balance
--   and count of managed accounts.
-- Uses COALESCE:
--   If a customer has no active accounts, COALESCE replaces NULL with 0.00.
-- ============================================================================

SELECT 
    c.cust_id,
    c.name AS customer_name,
    COUNT(a.acc_no) AS total_accounts,
    COALESCE(SUM(a.balance), 0.00) AS total_portfolio_balance,
    ROUND(COALESCE(AVG(a.balance), 0.00), 2) AS avg_account_balance
FROM 
    customers c
LEFT JOIN 
    accounts a ON c.cust_id = a.cust_id AND a.status = 'Active'
GROUP BY 
    c.cust_id, 
    c.name
ORDER BY 
    total_portfolio_balance DESC;

-- Expected Output:
-- +---------+---------------+----------------+-------------------------+---------------------+
-- | cust_id | customer_name | total_accounts | total_portfolio_balance | avg_account_balance |
-- +---------+---------------+----------------+-------------------------+---------------------+
-- | CUST001 | Suraj Walke   |              2 |               165000.50 |            82500.25 |
-- | CUST002 | Anita Shinde  |              1 |                68500.00 |            68500.00 |
-- +---------+---------------+----------------+-------------------------+---------------------+


-- ============================================================================
-- QUERY 4.5: Filtering Aggregates with the HAVING Clause
-- ============================================================================
-- DBMS Rule:
--   WHERE filters rows BEFORE grouping.
--   HAVING filters groups AFTER aggregation.
--
-- Business Scenario:
--   Identify branches holding a combined deposit liability of at least ₹100,000.
-- ============================================================================

SELECT 
    b.branch_id,
    b.branch_name,
    b.city,
    COUNT(a.acc_no) AS active_accounts,
    SUM(a.balance) AS total_branch_deposits
FROM 
    branches b
INNER JOIN 
    accounts a ON b.branch_id = a.branch_id
WHERE 
    a.status = 'Active'          -- 1. Row-level filter BEFORE grouping
GROUP BY 
    b.branch_id, 
    b.branch_name, 
    b.city
HAVING 
    SUM(a.balance) >= 100000.00  -- 2. Group-level filter AFTER aggregation
ORDER BY 
    total_branch_deposits DESC;

-- Expected Output:
-- +-----------+--------------------------+------+-----------------+-----------------------+
-- | branch_id | branch_name              | city | active_accounts | total_branch_deposits |
-- +-----------+--------------------------+------+-----------------+-----------------------+
-- | BR001     | Pune FC Road Main Branch | Pune |               3 |             233500.50 |
-- +-----------+--------------------------+------+-----------------+-----------------------+
