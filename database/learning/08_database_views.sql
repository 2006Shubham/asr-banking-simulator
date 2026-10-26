-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 08: Database Views, Virtual Relations & Security Masking
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- 1. THEORETICAL FOUNDATION: VIEWS IN THE ANSI-SPARC 3-LEVEL ARCHITECTURE
-- ============================================================================
-- In DBMS theory, the ANSI-SPARC 3-Level Architecture separates:
--   1. Physical / Internal Level: Physical storage structures, B-Tree indexes, pages.
--   2. Conceptual / Logical Level: The base relational tables (customers, accounts).
--   3. External / View Level: Tailored virtual relations presented to specific users.
--
-- What is a View?
-- A View is a VIRTUAL RELATION defined by a stored SELECT query.
-- It does NOT occupy separate physical storage on disk (unlike a base table).
-- When a view is queried, MySQL's Query Optimizer merges the view definition
-- with the outer query using View Algorithm MERGE (or TEMPTABLE for complex aggregates).
--
-- Primary Advantages in Banking:
-- 1. Security & PII Protection:
--    Exposes customer profiles with masked sensitive identifiers (Aadhar, PAN)
--    without giving front-office tellers direct access to raw confidential tables.
--
-- 2. Logical Data Independence:
--    Shields frontend applications from changes in underlying physical schema.
--    If accounts and customers are restructured, the view definition can be adapted
--    so existing APIs continue functioning without code changes.
--
-- 3. Query Simplification:
--    Hides complex multi-table joins and aggregations behind clean virtual relations.
--
-- 4. Updatable Views & WITH CHECK OPTION:
--    A view is updatable if it maps 1-to-1 to a single underlying base table and
--    does not contain aggregates, GROUP BY, DISTINCT, or UNION.
--    WITH CHECK OPTION guarantees that any INSERT or UPDATE performed through the
--    view satisfies the view's WHERE clause filter.
-- ============================================================================


-- ============================================================================
-- VIEW 8.1: PII Data Masking Security View (view_customer_secure_profile)
-- ============================================================================
-- Purpose:
--   Regulatory compliance (RBI / GDPR / DPDP Act).
--   Masks sensitive PII attributes (Aadhar: XXXX-XXXX-1234, PAN: ABXXXXX4F)
--   for customer support staff.
-- ============================================================================

CREATE OR REPLACE VIEW view_customer_secure_profile AS
SELECT 
    c.cust_id,
    c.name,
    c.email,
    c.phone,
    c.gender,
    CONCAT('XXXX-XXXX-', RIGHT(c.aadhar_no, 4)) AS masked_aadhar,
    CONCAT(LEFT(c.pan_no, 2), 'XXXXX', RIGHT(c.pan_no, 2)) AS masked_pan,
    b.branch_name,
    b.city
FROM 
    customers c
INNER JOIN 
    branches b ON c.branch_id = b.branch_id;

-- Query the View:
SELECT * FROM view_customer_secure_profile;

-- Expected Output:
-- +---------+--------------+-------------------+-----------------+--------+----------------+------------+--------------------------+------+
-- | cust_id | name         | email             | phone           | gender | masked_aadhar  | masked_pan | branch_name              | city |
-- +---------+--------------+-------------------+-----------------+--------+----------------+------------+--------------------------+------+
-- | CUST001 | Suraj Walke  | suraj@example.com | +91 98765 43210 | Male   | XXXX-XXXX-9012 | ABXXXXX4F  | Pune FC Road Main Branch | Pune |
-- | CUST002 | Anita Shinde | anita@example.com | +91 91234 56789 | Female | XXXX-XXXX-4567 | XYXXXXX6L  | Pune FC Road Main Branch | Pune |
-- +---------+--------------+-------------------+-----------------+--------+----------------+------------+--------------------------+------+


-- ============================================================================
-- VIEW 8.2: Unified NetBanking Join View (view_active_account_details)
-- ============================================================================
-- Purpose:
--   Flattens active accounts, customer names, and branch IFSC codes into a
--   clean virtual table ready for NetBanking account overviews.
-- ============================================================================

CREATE OR REPLACE VIEW view_active_account_details AS
SELECT 
    a.acc_no,
    a.cust_id,
    c.name AS customer_name,
    a.acc_type,
    a.balance,
    a.open_date,
    a.status,
    b.branch_id,
    b.branch_name,
    b.ifsc_code
FROM 
    accounts a
INNER JOIN 
    customers c ON a.cust_id = c.cust_id
INNER JOIN 
    branches b ON a.branch_id = b.branch_id
WHERE 
    a.status = 'Active';

-- Query the View:
SELECT * FROM view_active_account_details WHERE cust_id = 'CUST001';

-- Expected Output:
-- +--------+---------+---------------+----------+-----------+------------+--------+-----------+--------------------------+-------------+
-- | acc_no | cust_id | customer_name | acc_type | balance   | open_date  | status | branch_id | branch_name              | ifsc_code   |
-- +--------+---------+---------------+----------+-----------+------------+--------+-----------+--------------------------+-------------+
-- | ACC001 | CUST001 | Suraj Walke   | Savings  |  43000.50 | 2024-01-15 | Active | BR001     | Pune FC Road Main Branch | ASRB0000101 |
-- | ACC002 | CUST001 | Suraj Walke   | Current  | 122000.00 | 2024-05-10 | Active | BR001     | Pune FC Road Main Branch | ASRB0000101 |
-- +--------+---------+---------------+----------+-----------+------------+--------+-----------+--------------------------+-------------+


-- ============================================================================
-- VIEW 8.3: Branch Aggregate Liquidity Analytics (view_branch_liquidity_summary)
-- ============================================================================
-- Purpose:
--   Computes live depository totals and average balances across all branches.
--   Uses LEFT JOIN so branches with zero deposits still appear with 0.00.
-- ============================================================================

CREATE OR REPLACE VIEW view_branch_liquidity_summary AS
SELECT 
    b.branch_id,
    b.branch_name,
    b.city,
    COUNT(a.acc_no) AS total_accounts,
    COALESCE(SUM(a.balance), 0.00) AS total_deposits,
    ROUND(COALESCE(AVG(a.balance), 0.00), 2) AS avg_account_balance
FROM 
    branches b
LEFT JOIN 
    accounts a ON b.branch_id = a.branch_id AND a.status = 'Active'
GROUP BY 
    b.branch_id, b.branch_name, b.city;

-- Query the View:
SELECT * FROM view_branch_liquidity_summary ORDER BY total_deposits DESC;

-- Expected Output:
-- +-----------+-----------------------------+--------+----------------+----------------+---------------------+
-- | branch_id | branch_name                 | city   | total_accounts | total_deposits | avg_account_balance |
-- +-----------+-----------------------------+--------+----------------+----------------+---------------------+
-- | BR001     | Pune FC Road Main Branch    | Pune   |              3 |      233500.50 |            77833.50 |
-- | BR002     | Mumbai Fort Flagship Branch | Mumbai |              0 |           0.00 |                0.00 |
-- +-----------+-----------------------------+--------+----------------+----------------+---------------------+


-- ============================================================================
-- VIEW 8.4: Updatable View with WITH CHECK OPTION (view_active_savings_accounts)
-- ============================================================================
-- Academic Significance:
--   1. Simple 1-table view with no aggregates = UPDATABLE.
--   2. WITH CHECK OPTION enforces that any UPDATE/INSERT must maintain
--      acc_type = 'Savings' AND status = 'Active'.
-- ============================================================================

CREATE OR REPLACE VIEW view_active_savings_accounts AS
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
    acc_type = 'Savings' AND status = 'Active'
WITH CHECK OPTION;

-- Test: An update violating the view condition is strictly rejected by MySQL:
-- UPDATE view_active_savings_accounts SET acc_type = 'Current' WHERE acc_no = 'ACC001';
-- Expected Output:
-- ERROR 1369 (HY000): CHECK OPTION failed 'asr_banking.view_active_savings_accounts'
