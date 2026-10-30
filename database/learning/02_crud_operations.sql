-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 02: Full CRUD Operations (Create, Read, Update, Delete)
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- Table: accounts
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- 1. CREATE OPERATION (SQL INSERT)
-- ============================================================================
-- DBMS Concept:
--   - Adds a new tuple to the relation `accounts`.
--   - MySQL validates:
--       a. Primary Key uniqueness (`acc_no`)
--       b. Foreign Keys: `cust_id` exists in `customers`, `branch_id` exists in `branches`
--       c. Check Constraints:
--            - `chk_accounts_type`: acc_type IN ('Savings', 'Current', 'Salary')
--            - `chk_accounts_balance`: balance >= 0.00
--            - `chk_accounts_status`: status IN ('Active', 'Dormant', 'Frozen', 'Closed')
-- JDBC Execution:
--   - PreparedStatement.executeUpdate() -> Returns an int representing affected rows (1 on success).
-- ============================================================================

INSERT INTO accounts (
    acc_no, 
    cust_id, 
    branch_id, 
    acc_type, 
    balance, 
    open_date, 
    status
) VALUES (
    'ACC999', 
    'CUST001', 
    'BR001', 
    'Savings', 
    5000.00, 
    CURDATE(), 
    'Active'
);

-- Expected Output: Query OK, 1 row affected


-- ============================================================================
-- 2. READ OPERATION (SQL SELECT)
-- ============================================================================
-- DBMS Concept:
--   - Point lookup on the Primary Key clustered index (`acc_no = ?`).
--   - Returns 0 rows if account does not exist, 1 row if it exists.
-- JDBC Execution:
--   - PreparedStatement.executeQuery() -> Returns a ResultSet cursor.
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
    acc_no = 'ACC999';

-- Expected Output:
-- +--------+---------+-----------+----------+---------+------------+--------+
-- | acc_no | cust_id | branch_id | acc_type | balance | open_date  | status |
-- +--------+---------+-----------+----------+---------+------------+--------+
-- | ACC999 | CUST001 | BR001     | Savings  | 5000.00 | 2026-10-26 | Active |
-- +--------+---------+-----------+----------+---------+------------+--------+


-- ============================================================================
-- 3. UPDATE OPERATION (SQL UPDATE)
-- ============================================================================
-- DBMS Concept:
--   - Modifies existing attribute values in-place within the data page.
--   - InnoDB enforces ACID: writes old values to the Undo Log (for rollback/MVCC)
--     and writes changes to the Redo Log (WAL for crash recovery).
-- JDBC Execution:
--   - PreparedStatement.executeUpdate() -> Returns the count of modified rows.
--     If affected rows == 0, the account number did not exist.
-- ============================================================================

UPDATE accounts
SET 
    status = 'Dormant'
WHERE 
    acc_no = 'ACC999';

-- Expected Output: Query OK, 1 row affected


-- ============================================================================
-- 4. DELETE OPERATION (SQL DELETE & REFERENTIAL INTEGRITY)
-- ============================================================================
-- Scenario A: Hard Delete on an unreferenced account (Succeeds)
-- ============================================================================

DELETE FROM accounts 
WHERE acc_no = 'ACC999';

-- Expected Output: Query OK, 1 row affected


-- ============================================================================
-- Scenario B: Hard Delete on an account WITH TRANSACTIONS (Fails by design!)
-- ============================================================================
-- The foreign key `fk_transactions_account` is defined with ON DELETE RESTRICT.
-- MySQL rejects the deletion to prevent orphan financial records:
--
--   ERROR 1451 (23000): Cannot delete or update a parent row: 
--   a foreign key constraint fails (`asr_banking`.`transactions`, 
--   CONSTRAINT `fk_transactions_account` FOREIGN KEY (`acc_no`) 
--   REFERENCES `accounts` (`acc_no`) ON DELETE RESTRICT)
-- ============================================================================

-- DELETE FROM accounts WHERE acc_no = 'ACC001'; -- UNCOMMENT TO TEST ERROR 1451


-- ============================================================================
-- Scenario C: Soft Delete (Banking Industry Best Practice)
-- ============================================================================
-- Banking Regulations mandate that historical financial records must be preserved.
-- Instead of a hard DELETE, we perform a "Soft Delete" by updating the status to 'Closed'.
--
-- IMPORTANT DBMS INVARIANT GUARD (Trigger trg_accounts_before_update):
-- MySQL will actively REJECT closing an account if balance > 0.00:
--   ERROR 1644 (45000): Operation Denied: Cannot close account with positive balance.
--                       Withdraw or transfer funds first.
--
-- Step 1: Liquidate / Transfer remaining balance to 0.00:
--   UPDATE accounts SET balance = 0.00 WHERE acc_no = 'ACC999';
--
-- Step 2: Now safely perform Soft Delete:
-- ============================================================================

UPDATE accounts
SET 
    balance = 0.00,
    status = 'Closed'
WHERE 
    acc_no = 'ACC999';

-- Expected Output: Query OK, 1 row affected (Status successfully transitioned to Closed)
