-- ============================================================================
-- ASR BANKING SIMULATOR — STAGE 11: DATABASE TRIGGERS & AUTOMATED AUDIT TRAILS
-- ============================================================================
-- Academic Level: 2nd Year Computer Science / IT — Relational Database Management Systems
-- Topic: Active Databases, Event-Condition-Action (ECA) Model, BEFORE vs AFTER Triggers,
--        Transition Variables (OLD & NEW), SIGNAL SQLSTATE Exception Control,
--        and Immutable Regulatory Audit Trails.
-- Engine: MySQL 9.x / InnoDB
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: THEORETICAL FOUNDATIONS & VIVA MASTER CONCEPTS
-- ----------------------------------------------------------------------------
-- 1. WHAT IS A DATABASE TRIGGER?
--    A Trigger is an Event-Condition-Action (ECA) program stored in the database
--    catalog that automatically and implicitly executes in response to a specific
--    Data Manipulation Language (DML) event (`INSERT`, `UPDATE`, `DELETE`) on
--    a specified table.
--    - Invocation: Implicit. Triggers CANNOT be invoked manually via `CALL` or `SELECT`.
--    - Non-Bypassable Security: Even if an attacker or rogue script bypasses the
--      application layer (via direct MySQL CLI, SQL injection, or phpMyAdmin),
--      triggers execute unconditionally inside the database engine.
--
-- 2. TRIGGER TIMING (BEFORE vs AFTER)
--    +--------------------+------------------------------------+----------------------------------+
--    | Trigger Timing     | Execution Phase                    | Canonical Banking Use Cases      |
--    +--------------------+------------------------------------+----------------------------------+
--    | BEFORE             | Fires BEFORE row data is validated | Data validation, invariant       |
--    |                    | and written to the InnoDB engine   | enforcement, preventing edits to |
--    |                    | storage.                           | Closed accounts, negative balance|
--    |                    |                                    | rejection via SIGNAL SQLSTATE.   |
--    +--------------------+------------------------------------+----------------------------------+
--    | AFTER              | Fires AFTER row data is committed  | Immutable audit logging, Change  |
--    |                    | into the table storage buffer.     | Data Capture (CDC), cross-table  |
--    |                    |                                    | ledger synchronization.          |
--    +--------------------+------------------------------------+----------------------------------+
--
-- 3. TRANSITION VARIABLES: OLD vs NEW
--    Row-level triggers (`FOR EACH ROW`) provide pseudo-records representing data states:
--    +-------------+-----------------------------+-----------------------------+-------------------+
--    | DML Event   | OLD.column Available?       | NEW.column Available?       | Can Mutate NEW?   |
--    +-------------+-----------------------------+-----------------------------+-------------------+
--    | INSERT      | NO (Row didn't exist yet)   | YES (Value to be inserted)  | YES (BEFORE only) |
--    | UPDATE      | YES (Value before change)   | YES (Value after change)    | YES (BEFORE only) |
--    | DELETE      | YES (Value about to vanish) | NO (Row will no longer exist)| NO               |
--    +-------------+-----------------------------+-----------------------------+-------------------+
--
-- 4. ATOMICITY & TRANSACTION INTEGRATION
--    A trigger executes within the SAME transaction boundary as the triggering DML statement.
--    If a trigger raises an unhandled error using `SIGNAL SQLSTATE '45000'`, the entire
--    triggering statement AND its parent transaction are immediately aborted and rolled back.
--    Triggers CANNOT execute explicit transaction commands (`COMMIT` or `ROLLBACK`).
--
-- 5. WHY ARE TRIGGERS CRITICAL FOR BANKING REGULATION (SOX, RBI, BASEL III)?
--    a) Immutable Tamper-Evident Audit Trails:
--       Bank regulations require a non-repudiable log of every single balance mutation,
--       capturing old balance, new balance, delta, timestamp, and database user.
--    b) Application-Agnostic Invariant Enforcement:
--       Application bugs cannot accidentally corrupt ledger data; the database engine
--       rejects negative balances or modifications to closed accounts at the storage level.
-- ----------------------------------------------------------------------------

USE asr_banking;

-- ============================================================================
-- SECTION 2: AUDIT LEDGER TABLES DDL
-- ============================================================================

-- Audit Table 1: Immutable Account Balance & Status Change Audit Trail
CREATE TABLE IF NOT EXISTS account_balance_audit_log (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    acc_no VARCHAR(30) NOT NULL,
    old_balance DECIMAL(15,2) NOT NULL,
    new_balance DECIMAL(15,2) NOT NULL,
    delta_amount DECIMAL(15,2) NOT NULL,
    change_type VARCHAR(20) NOT NULL, -- 'CREDIT', 'DEBIT', 'STATUS_CHANGE'
    old_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    db_user VARCHAR(100) DEFAULT (CURRENT_USER()),
    trigger_event VARCHAR(20) DEFAULT 'AFTER_UPDATE',
    INDEX idx_audit_acc_date (acc_no, changed_at DESC)
) ENGINE=InnoDB;

-- Audit Table 2: Customer Contact & Security Modification Audit Trail
CREATE TABLE IF NOT EXISTS customer_security_audit_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cust_id VARCHAR(20) NOT NULL,
    field_name VARCHAR(50) NOT NULL, -- 'PHONE', 'EMAIL', 'ADDRESS'
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    db_user VARCHAR(100) DEFAULT (CURRENT_USER()),
    INDEX idx_cust_audit (cust_id, changed_at DESC)
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 3: DATABASE TRIGGER DEFINITIONS
-- ============================================================================

DELIMITER //

-- ----------------------------------------------------------------------------
-- TRIGGER 1: trg_accounts_before_update
-- Timing: BEFORE UPDATE ON accounts FOR EACH ROW
-- Purpose: Invariant Protection & Fraud Guard
-- Invariants Enforced:
-- 1. Frozen Closed Accounts: Closed accounts cannot accept balance or status mutations.
-- 2. Non-Negative Balance: Account balance cannot become negative under any circumstance.
-- 3. Liquidation Rule: An account cannot be closed if it holds an outstanding positive balance.
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_accounts_before_update//
CREATE TRIGGER trg_accounts_before_update
BEFORE UPDATE ON accounts
FOR EACH ROW
BEGIN
    -- Invariant 1: Closed accounts are frozen
    IF OLD.status = 'Closed' AND NEW.status = 'Closed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Operation Denied: Account is Closed and frozen against modifications.';
    END IF;

    -- Invariant 2: Non-negative balance constraint defense
    IF NEW.balance < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Operation Denied: Invariant violation. Account balance cannot be negative.';
    END IF;

    -- Invariant 3: Closing account with remaining funds is prohibited
    IF OLD.status <> 'Closed' AND NEW.status = 'Closed' AND OLD.balance > 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Operation Denied: Cannot close account with positive balance. Withdraw or transfer funds first.';
    END IF;
END//

-- ----------------------------------------------------------------------------
-- TRIGGER 2: trg_accounts_after_update
-- Timing: AFTER UPDATE ON accounts FOR EACH ROW
-- Purpose: Automated Immutable Balance & Status Change Audit Trail
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_accounts_after_update//
CREATE TRIGGER trg_accounts_after_update
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    DECLARE v_change_type VARCHAR(20);
    DECLARE v_delta DECIMAL(15,2);

    SET v_delta = NEW.balance - OLD.balance;

    -- Only write audit log if balance or status actually changed
    IF OLD.balance <> NEW.balance OR OLD.status <> NEW.status THEN
        IF v_delta > 0 THEN
            SET v_change_type = 'CREDIT';
        ELSEIF v_delta < 0 THEN
            SET v_change_type = 'DEBIT';
        ELSE
            SET v_change_type = 'STATUS_CHANGE';
        END IF;

        INSERT INTO account_balance_audit_log (
            acc_no, old_balance, new_balance, delta_amount,
            change_type, old_status, new_status, changed_at, db_user, trigger_event
        ) VALUES (
            NEW.acc_no, OLD.balance, NEW.balance, v_delta,
            v_change_type, OLD.status, NEW.status, NOW(), CURRENT_USER(), 'AFTER_UPDATE'
        );
    END IF;
END//

-- ----------------------------------------------------------------------------
-- TRIGGER 3: trg_customers_after_update
-- Timing: AFTER UPDATE ON customers FOR EACH ROW
-- Purpose: Security Audit on Sensitive PII Mutations (SIM Swap / Account Takeover Detection)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_customers_after_update//
CREATE TRIGGER trg_customers_after_update
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    -- Audit Phone Number changes
    IF OLD.phone <> NEW.phone THEN
        INSERT INTO customer_security_audit_log (cust_id, field_name, old_value, new_value, changed_at, db_user)
        VALUES (NEW.cust_id, 'PHONE', OLD.phone, NEW.phone, NOW(), CURRENT_USER());
    END IF;

    -- Audit Email changes
    IF OLD.email <> NEW.email THEN
        INSERT INTO customer_security_audit_log (cust_id, field_name, old_value, new_value, changed_at, db_user)
        VALUES (NEW.cust_id, 'EMAIL', OLD.email, NEW.email, NOW(), CURRENT_USER());
    END IF;

    -- Audit Physical Address changes
    IF OLD.address <> NEW.address THEN
        INSERT INTO customer_security_audit_log (cust_id, field_name, old_value, new_value, changed_at, db_user)
        VALUES (NEW.cust_id, 'ADDRESS', OLD.address, NEW.address, NOW(), CURRENT_USER());
    END IF;
END//

-- ----------------------------------------------------------------------------
-- TRIGGER 4: trg_accounts_before_delete
-- Timing: BEFORE DELETE ON accounts FOR EACH ROW
-- Purpose: Regulatory Compliance — Defense Against Hard Deletion of Funded Accounts
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_accounts_before_delete//
CREATE TRIGGER trg_accounts_before_delete
BEFORE DELETE ON accounts
FOR EACH ROW
BEGIN
    IF OLD.balance > 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Operation Denied: Cannot delete account with non-zero balance. Regulatory audit policy.';
    END IF;
END//

DELIMITER ;


-- ============================================================================
-- SECTION 4: DEMONSTRATION & VERIFICATION QUERIES
-- ============================================================================

-- Query 4.1: View All Registered Triggers in the Database Catalog
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING,
    ACTION_ORIENTATION
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'asr_banking'
ORDER BY EVENT_OBJECT_TABLE, ACTION_TIMING;

-- Query 4.2: Inspecting the Balance Audit Trail
SELECT 
    audit_id,
    acc_no,
    old_balance,
    new_balance,
    delta_amount,
    change_type,
    old_status,
    new_status,
    changed_at,
    db_user
FROM account_balance_audit_log
ORDER BY changed_at DESC
LIMIT 10;

-- Query 4.3: Inspecting Customer Security Profile Changes
SELECT 
    log_id,
    cust_id,
    field_name,
    old_value,
    new_value,
    changed_at,
    db_user
FROM customer_security_audit_log
ORDER BY changed_at DESC
LIMIT 10;


-- ============================================================================
-- SECTION 5: VIVA VOCE QUESTIONS & MODEL ANSWERS (COLLEGE EVALUATION)
-- ============================================================================
-- Q1: What is the Event-Condition-Action (ECA) model of a database trigger?
-- A1: - Event: The database operation that triggers execution (INSERT, UPDATE, or DELETE).
--     - Condition: An optional logical test (e.g. `IF OLD.balance <> NEW.balance`) evaluated
--       to decide whether action should proceed.
--     - Action: The procedural SQL statement block executed when the event occurs and condition holds.
--
-- Q2: What is the operational difference between BEFORE and AFTER triggers?
-- A2: A BEFORE trigger fires before the DML modification is validated or written to the table storage.
--     It can modify `NEW.column` values or abort the transaction via `SIGNAL SQLSTATE`. An AFTER trigger
--     fires after the row change has been successfully written to the storage engine, making it ideal
--     for non-intrusive audit logging.
--
-- Q3: Can a Trigger execute COMMIT or ROLLBACK?
-- A3: NO. Triggers run inside the transaction context of the triggering SQL statement. Executing
--     COMMIT or ROLLBACK within a trigger is strictly prohibited by MySQL / ANSI SQL because it
--     would disrupt the transactional boundaries established by the caller.
--
-- Q4: What are the transition variables OLD and NEW, and when are they available?
-- A4: - OLD represents row values prior to modification (available in UPDATE and DELETE).
--     - NEW represents row values after modification (available in INSERT and UPDATE).
--     - In an INSERT, OLD is undefined. In a DELETE, NEW is undefined.
--
-- Q5: What is SIGNAL SQLSTATE '45000' and how does it work in banking triggers?
-- A5: `SIGNAL SQLSTATE '45000'` is the standard ANSI SQL mechanism for raising user-defined
--     exceptions. When a trigger executes `SIGNAL`, MySQL immediately aborts the triggering DML
--     statement and causes the entire active transaction to rollback, returning the custom
--     `MESSAGE_TEXT` to the client application.
--
-- Q6: Why should audit logging be implemented via Database Triggers rather than Application Code?
-- A6: If audit logging is in application code, a developer might forget to write an audit entry,
--     or a DBA updating data via SQL CLI / phpMyAdmin would bypass the audit completely. Database
--     triggers guarantee 100% tamper-evident, non-bypassable auditing at the engine storage level.
--
-- Q7: What is the "Mutating Table Problem" in database triggers?
-- A7: A mutating table error occurs when a row-level trigger attempts to query or modify the same table
--     that is currently undergoing the DML event. While Oracle strictly forbids this, MySQL allows
--     reading in some contexts but prohibits DML updates to the triggering table inside row triggers.
--
-- Q8: How does trg_accounts_before_update prevent fraud on Closed bank accounts?
-- A8: It checks `IF OLD.status = 'Closed' AND NEW.status = 'Closed'`. If an account is already
--     closed, any attempt to inject funds, debit funds, or modify attributes triggers
--     `SIGNAL SQLSTATE '45000'`, freezing the account permanently at the database engine level.
--
-- Q9: Can triggers be temporarily disabled in MySQL?
-- A9: In MySQL, there is no direct `ALTER TABLE ... DISABLE TRIGGER` statement. Triggers can only
--     be removed via `DROP TRIGGER` or conditionally bypassed using session variables.
--
-- Q10: How do triggers assist in achieving SOX and RBI regulatory compliance?
-- A10: Sarbanes-Oxley (SOX) Section 404 and Reserve Bank of India (RBI) IT governance require
--      non-repudiable logs of all financial balance mutations. The `trg_accounts_after_update`
--      trigger satisfies this by capturing immutable delta audits including the exact database
--      user (`CURRENT_USER()`) and timestamp (`NOW()`).
-- ============================================================================
