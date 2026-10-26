-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 06: Database Transactions, ACID Guarantees, Isolation Levels & Rollback
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- 1. THEORETICAL FOUNDATION: THE ACID MODEL IN BANKING SYSTEMS
-- ============================================================================
-- A Database Transaction is a logical unit of work comprising one or more SQL
-- operations that must be executed with ACID guarantees:
--
-- A — ATOMICITY ("All-or-Nothing"):
--     Either every statement in the transaction executes and commits, or in the
--     event of ANY failure (network, software, hardware, constraint violation),
--     the database engine rolls back all intermediate changes completely.
--     In banking: You cannot deduct funds from Account A without crediting Account B.
--
-- C — CONSISTENCY (Integrity Preservation):
--     A transaction transforms the database from one valid, consistent state to
--     another valid consistent state, satisfying all constraints:
--     - Domain constraints (e.g. balance DECIMAL >= 0.00 via CHECK constraint)
--     - Referential integrity (foreign keys)
--     - Business invariants (e.g. Total Bank Liquidity = Sum of all account balances)
--
-- I — ISOLATION (Concurrency Control):
--     Concurrent transactions executing simultaneously cannot interfere with or
--     observe intermediate, uncommitted modifications made by other transactions.
--
-- D — DURABILITY (Persistence via Write-Ahead Logging):
--     Once a transaction commits (COMMIT), its updates become permanent and will
--     NEVER be lost, even in the event of an immediate server power failure.
--     InnoDB achieves this via the Write-Ahead Log (WAL / Redo Log - ib_logfile).
-- ============================================================================


-- ============================================================================
-- 2. ANSI SQL TRANSACTION ISOLATION LEVELS & CONCURRENCY ANOMALIES
-- ============================================================================
-- | Isolation Level   | Dirty Read | Non-Repeatable Read | Phantom Read |
-- |-------------------|:----------:|:-------------------:|:------------:|
-- | READ UNCOMMITTED  |    YES     |         YES         |     YES      |
-- | READ COMMITTED    |     NO     |         YES         |     YES      |
-- | REPEATABLE READ   |     NO     |          NO         |      NO*     |  <- MySQL InnoDB Default!
-- | SERIALIZABLE      |     NO     |          NO         |      NO      |
--
-- *In InnoDB, REPEATABLE READ uses Multi-Version Concurrency Control (MVCC) snapshot
--  reads for SELECT and Next-Key Locks for locking reads to prevent phantom reads.
-- ============================================================================

-- Check Current Session and Global Isolation Level in MySQL:
SELECT @@global.transaction_isolation AS global_isolation,
       @@session.transaction_isolation AS session_isolation;


-- ============================================================================
-- SCRIPT 6.1: Canonical Two-Legged Fund Transfer Transaction (ATOMIC COMMIT)
-- ============================================================================
-- Business Goal:
--   Transfer ₹5,000 from ACC001 (Suraj Savings) to ACC002 (Suraj Current).
-- Operations executed atomically:
--   1. Pessimistic lock on sender row: SELECT ... FOR UPDATE
--   2. Balance deduction from ACC001
--   3. Balance credit to ACC002
--   4. Insertion of Debit audit record into transactions table
--   5. Insertion of Credit audit record into transactions table
-- ============================================================================

START TRANSACTION;

-- Step 1: Pessimistic Row Lock (Acquires Exclusive X-Lock on index record)
SELECT acc_no, balance, status 
FROM accounts 
WHERE acc_no = 'ACC001' 
FOR UPDATE;

-- Step 2: Debit sender
UPDATE accounts 
SET balance = balance - 5000.00 
WHERE acc_no = 'ACC001';

-- Step 3: Credit receiver
UPDATE accounts 
SET balance = balance + 5000.00 
WHERE acc_no = 'ACC002';

-- Step 4: Insert Debit Audit Trail
INSERT INTO transactions (
    txn_id, acc_no, txn_type, amount, channel, status, ref_no, description
) VALUES (
    'TXN_DEMO_01', 
    'ACC001', 
    'Debit', 
    5000.00, 
    'IMPS', 
    'Success', 
    'IMPS/2026/DEMO01', 
    'Internal Transfer to ACC002'
);

-- Step 5: Insert Credit Audit Trail
INSERT INTO transactions (
    txn_id, acc_no, txn_type, amount, channel, status, ref_no, description
) VALUES (
    'TXN_DEMO_02', 
    'ACC002', 
    'Credit', 
    5000.00, 
    'IMPS', 
    'Success', 
    'IMPS/2026/DEMO02', 
    'Transfer Received from ACC001'
);

-- Commit all 4 database state changes as an atomic unit
COMMIT;

-- Verify updated balances
SELECT acc_no, balance, status 
FROM accounts 
WHERE acc_no IN ('ACC001', 'ACC002');

-- Clean up demo funds to keep test database state pristine
START TRANSACTION;
UPDATE accounts SET balance = balance + 5000.00 WHERE acc_no = 'ACC001';
UPDATE accounts SET balance = balance - 5000.00 WHERE acc_no = 'ACC002';
DELETE FROM transactions WHERE txn_id IN ('TXN_DEMO_01', 'TXN_DEMO_02');
COMMIT;


-- ============================================================================
-- SCRIPT 6.2: Transaction Rollback on Business Rule Violation (ROLLBACK)
-- ============================================================================
-- Business Scenario:
--   A user attempts to transfer ₹20,000 from ACC001. While the account has sufficient
--   balance, the transfer exceeds the NetBanking Daily Limit policy of ₹10,000.
--   When the application detects the policy breach, it issues a ROLLBACK.
--   MySQL discards all pending uncommitted changes, preserving database consistency.
-- ============================================================================

START TRANSACTION;

-- Step 1: Pessimistic Lock
SELECT acc_no, balance 
FROM accounts 
WHERE acc_no = 'ACC001' 
FOR UPDATE;

-- Step 2: Tentative deduction
UPDATE accounts 
SET balance = balance - 20000.00 
WHERE acc_no = 'ACC001';

-- Step 3: Application rule check detects daily limit violation!
-- INSTEAD OF COMMIT, ISSUE ROLLBACK:
ROLLBACK;

-- Verify that ACC001 balance was NOT deducted:
SELECT acc_no, balance 
FROM accounts 
WHERE acc_no = 'ACC001';


-- ============================================================================
-- SCRIPT 6.3: Partial Rollback Using SAVEPOINTS
-- ============================================================================
-- Academic Significance:
--   Savepoints allow nested checkpointing within a single long transaction.
--   The application can undo erroneous intermediate work without losing the
--   entire transaction's prior progress.
-- ============================================================================

START TRANSACTION;

-- Milestone 1: Deduct account maintenance charge ₹50
UPDATE accounts 
SET balance = balance - 50.00 
WHERE acc_no = 'ACC001';

-- Establish a Savepoint
SAVEPOINT maintenance_fee_applied;

-- Milestone 2: Attempt optional addon debit
UPDATE accounts 
SET balance = balance - 500.00 
WHERE acc_no = 'ACC001';

-- Cancel Milestone 2 only (undo addon, keep maintenance fee):
ROLLBACK TO SAVEPOINT maintenance_fee_applied;

-- Commit Milestone 1:
COMMIT;

-- Revert the ₹50 demo fee to restore original seed state:
UPDATE accounts SET balance = balance + 50.00 WHERE acc_no = 'ACC001';

SELECT acc_no, balance 
FROM accounts 
WHERE acc_no = 'ACC001';
