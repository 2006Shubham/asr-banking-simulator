-- ============================================================================
-- ASR BANKING SIMULATOR — STAGE 12: DATABASE CURSORS & BATCH PROCESSING
-- ============================================================================
-- Academic Level: 2nd Year Computer Science / IT — Relational Database Management Systems
-- Topic: Procedural Iteration, Set-vs-Row Impedance Mismatch, Cursor Lifecycle
--        (DECLARE, OPEN, FETCH, CLOSE), NOT FOUND Handler (SQLSTATE '02000'),
--        and Institutional Batch End-of-Month (EoM) Interest Capitalization.
-- Engine: MySQL 9.x / InnoDB
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: THEORETICAL FOUNDATIONS & VIVA MASTER CONCEPTS
-- ----------------------------------------------------------------------------
-- 1. THE IMPEDANCE MISMATCH: SET-AT-A-TIME VS. ROW-AT-A-TIME
--    Relational database theory (Codd's Relational Algebra) is fundamentally
--    set-oriented. A standard SQL statement (`SELECT`, `UPDATE`) operates on
--    entire mathematical sets (relations) simultaneously.
--    However, institutional banking workflows (e.g. End-of-Month interest accrual,
--    tax deductions, regulatory reporting) often require procedural, sequential,
--    row-by-row iteration with complex per-account business calculations and audits.
--    A **Cursor** bridges this impedance mismatch by providing a mechanism to traverse
--    and process a query result set tuple by tuple.
--
-- 2. THE 4-PHASE CURSOR LIFECYCLE
--    Every cursor in standard SQL adheres to an immutable 4-stage lifecycle:
--    +---------+-----------------------------------------+-----------------------------------+
--    | Phase   | SQL Command                             | Database Engine Action            |
--    +---------+-----------------------------------------+-----------------------------------+
--    | 1. Plan | DECLARE cursor_name CURSOR FOR SELECT.. | Prepares query plan in catalog.   |
--    | 2. Open | OPEN cursor_name;                       | Executes query, allocates buffer, |
--    |         |                                         | positions pointer before row 1.   |
--    | 3. Read | FETCH cursor_name INTO var1, var2..;    | Advances pointer to next row and  |
--    |         |                                         | populates local host variables.   |
--    | 4. Free | CLOSE cursor_name;                      | Deallocates memory buffer and     |
--    |         |                                         | releases engine lock resources.   |
--    +---------+-----------------------------------------+-----------------------------------+
--
-- 3. STRICT DECLARATION ORDERING IN MYSQL
--    Inside a MySQL `BEGIN ... END` compound block, statements MUST appear in
--    this exact, strict lexical sequence:
--    1. Variable & Condition Declarations (`DECLARE v_var INT;`)
--    2. Cursor Declarations (`DECLARE cur CURSOR FOR ...;`)
--    3. Handler Declarations (`DECLARE CONTINUE HANDLER FOR NOT FOUND ...;`)
--    *Violating this order triggers MySQL compilation error 1337 or 1338!*
--
-- 4. LOOP TERMINATION & THE NOT FOUND CONDITION (SQLSTATE '02000')
--    When `FETCH` advances past the last row of the active set, the engine raises
--    condition `NOT FOUND` (SQLSTATE '02000').
--    A declared `CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;` intercepts this
--    condition, allowing the procedural loop (`LEAVE process_loop;`) to cleanly exit.
--
-- 5. MYSQL CURSOR CHARACTERISTICS
--    - Asensitive: Reads from storage buffers; does not create a completely isolated table copy.
--    - Read-Only: Cannot perform `UPDATE ... WHERE CURRENT OF cursor_name` directly in MySQL.
--      Updates are executed using primary keys (`UPDATE ... WHERE acc_no = v_acc_no`).
--    - Non-Scrollable: Can only traverse sequentially forward from row 1 to row N.
-- ----------------------------------------------------------------------------

USE asr_banking;

-- ============================================================================
-- SECTION 2: BATCH CURSOR STORED PROCEDURE DDL
-- ============================================================================

DELIMITER //

-- ----------------------------------------------------------------------------
-- PROCEDURE: sp_batch_accrue_monthly_interest
-- Parameters:
--   IN  p_annual_interest_rate      DECIMAL(5,2)  (e.g., 4.00% p.a.)
--   OUT p_accounts_processed        INT           (count of credited accounts)
--   OUT p_total_interest_disbursed  DECIMAL(15,2) (sum of credited rupees)
--   OUT p_status_code               VARCHAR(30)   ('SUCCESS', 'ERR_INVALID_RATE', etc.)
--   OUT p_status_message            VARCHAR(255)
--
-- Mechanics:
-- 1. Cursor opens over all Active Savings accounts meeting the minimum qualifying balance.
-- 2. Row-by-row iteration computes exact monthly interest: Balance * (annual_rate / 100) / 12.
-- 3. Updates account balance and inserts an institutional credit transaction.
-- 4. Database Trigger `trg_accounts_after_update` (Stage 11) automatically intercepts each
--    update and records an immutable entry in `account_balance_audit_log`!
-- 5. Entire batch executes within a single atomic ACID transaction.
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_batch_accrue_monthly_interest//
CREATE PROCEDURE sp_batch_accrue_monthly_interest(
    IN p_annual_interest_rate DECIMAL(5,2),
    OUT p_accounts_processed INT,
    OUT p_total_interest_disbursed DECIMAL(15,2),
    OUT p_status_code VARCHAR(30),
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    -- 1. VARIABLE DECLARATIONS
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_acc_no VARCHAR(30);
    DECLARE v_current_balance DECIMAL(15,2);
    DECLARE v_interest_amount DECIMAL(15,2);
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_total_disbursed DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_ref_no VARCHAR(50);
    DECLARE v_txn_id VARCHAR(30);

    -- 2. CURSOR DECLARATION (Must precede handlers)
    DECLARE cur_savings_accounts CURSOR FOR
        SELECT acc_no, balance
        FROM accounts
        WHERE acc_type = 'Savings' AND status = 'Active' AND balance >= 1000.00
        ORDER BY acc_no ASC;

    -- 3. HANDLER DECLARATIONS (Must follow cursors)
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_accounts_processed = 0;
        SET p_total_interest_disbursed = 0.00;
        SET p_status_code = 'ERR_BATCH_EXCEPTION';
        SET p_status_message = 'Database error occurred during batch interest capitalization. Batch rolled back.';
    END;

    -- Input Validation: Rate must be positive
    IF p_annual_interest_rate IS NULL OR p_annual_interest_rate <= 0.00 THEN
        SET p_accounts_processed = 0;
        SET p_total_interest_disbursed = 0.00;
        SET p_status_code = 'ERR_INVALID_RATE';
        SET p_status_message = 'Annual interest rate must be strictly greater than 0.00%.';
        LEAVE proc_label;
    END IF;

    -- Begin Batch Transaction
    START TRANSACTION;

    -- OPEN Cursor: Evaluates query and populates active result buffer
    OPEN cur_savings_accounts;

    -- CURSOR FETCH LOOP
    process_loop: LOOP
        FETCH cur_savings_accounts INTO v_acc_no, v_current_balance;

        -- Check if cursor reached end of active result set
        IF v_done THEN
            LEAVE process_loop;
        END IF;

        -- Calculate Monthly Interest: Balance * (annual_rate / 100) / 12
        SET v_interest_amount = ROUND(v_current_balance * (p_annual_interest_rate / 100.0) / 12.0, 2);

        IF v_interest_amount > 0.00 THEN
            -- Credit account balance (triggers trg_accounts_after_update automatically)
            UPDATE accounts
            SET balance = balance + v_interest_amount
            WHERE acc_no = v_acc_no;

            -- Generate audit reference & transaction ID
            SET v_ref_no = CONCAT('INT-BATCH-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', v_acc_no);
            SET v_txn_id = CONCAT('TXN', LPAD(FLOOR(RAND() * 900000000 + 100000000), 9, '0'));

            -- Insert credit transaction (channel compliant with chk_transactions_channel)
            INSERT INTO transactions (txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description)
            VALUES (v_txn_id, v_acc_no, 'Credit', v_interest_amount, NOW(), 'NetBanking', 'Success', v_ref_no,
                    CONCAT('Monthly Interest Capitalization @ ', p_annual_interest_rate, '% p.a.'));

            -- Accumulate batch statistics
            SET v_count = v_count + 1;
            SET v_total_disbursed = v_total_disbursed + v_interest_amount;
        END IF;

    END LOOP process_loop;

    -- CLOSE Cursor: Release server buffer resources
    CLOSE cur_savings_accounts;

    -- Commit atomic batch transaction
    COMMIT;

    -- Set OUT parameters
    SET p_accounts_processed = v_count;
    SET p_total_interest_disbursed = v_total_disbursed;
    SET p_status_code = 'SUCCESS';
    SET p_status_message = CONCAT('Batch interest capitalization completed successfully for ', v_count, ' accounts.');

END proc_label//

DELIMITER ;


-- ============================================================================
-- SECTION 3: DEMONSTRATION & VERIFICATION QUERIES
-- ============================================================================

-- Query 3.1: Preview Qualifying Savings Accounts Prior to Batch Execution
SELECT 
    acc_no,
    cust_id,
    acc_type,
    balance,
    status,
    ROUND(balance * (4.00 / 100.0) / 12.0, 2) AS estimated_monthly_interest
FROM accounts
WHERE acc_type = 'Savings' AND status = 'Active' AND balance >= 1000.00
ORDER BY acc_no ASC;

-- Query 3.2: Execute Batch Monthly Interest Capitalization
CALL sp_batch_accrue_monthly_interest(4.00, @out_processed, @out_disbursed, @out_code, @out_msg);
SELECT 
    @out_processed AS accounts_processed,
    @out_disbursed AS total_interest_disbursed,
    @out_code AS status_code,
    @out_msg AS status_message;

-- Query 3.3: Inspect Recent Interest Capitalization Ledger Records
SELECT 
    txn_id,
    acc_no,
    txn_type,
    amount,
    channel,
    ref_no,
    description,
    txn_date
FROM transactions
WHERE ref_no LIKE 'INT-BATCH-%'
ORDER BY txn_date DESC
LIMIT 5;

-- Query 3.4: Revert Demonstration Balance Changes to Maintain Clean Baseline
-- (Uncomment below to restore database state after running manual SQL tests)
-- UPDATE accounts SET balance = balance - 143.34 WHERE acc_no = 'ACC001';
-- UPDATE accounts SET balance = balance - 228.33 WHERE acc_no = 'ACC003';
-- DELETE FROM transactions WHERE ref_no LIKE 'INT-BATCH-%';


-- ============================================================================
-- SECTION 4: VIVA VOCE QUESTIONS & MODEL ANSWERS (COLLEGE EVALUATION)
-- ============================================================================
-- Q1: What is a Database Cursor and why is it needed?
-- A1: A Cursor is an engine-level pointer that iterates over the rows of a query result set
--     tuple-by-tuple. While SQL is inherently set-oriented, cursors are needed for procedural
--     algorithms where each row requires distinct conditional branching, external calls, or
--     individual transaction logging that cannot be expressed in a single set-based UPDATE.
--
-- Q2: What are the four phases of a cursor's lifecycle?
-- A2: 1. DECLARE: Defines the query and creates the cursor specification in the catalog.
--     2. OPEN: Executes the query, allocates internal memory buffers, and positions the pointer.
--     3. FETCH: Advances the pointer and copies column values into local variables.
--     4. CLOSE: Deallocates memory and releases temporary locks held by the result set.
--
-- Q3: What is the strict lexical declaration order required in MySQL stored routines?
-- A3: 1. Variable and Condition declarations (DECLARE var / DECLARE condition)
--     2. Cursor declarations (DECLARE cursor)
--     3. Handler declarations (DECLARE handler)
--     Violating this order triggers MySQL compilation error 1337 or 1338.
--
-- Q4: How does a cursor detect when all rows have been processed?
-- A4: When FETCH reaches the end of the active set, MySQL raises the completion condition
--     NOT FOUND (SQLSTATE '02000'). A declared `CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;`
--     intercepts this event, allowing an `IF done THEN LEAVE loop_label; END IF;` to exit the loop.
--
-- Q5: What is the difference between an Asensitive and Sensitive cursor?
-- A5: A sensitive cursor reflects live changes made to table data by concurrent transactions after
--     the cursor was opened. An asensitive cursor may or may not reflect these changes depending on
--     engine optimization. In MySQL, cursors are asensitive and read-only.
--
-- Q6: Why is it critical to explicitly CLOSE a cursor?
-- A6: Failing to close a cursor leaves allocated query buffers in server memory, leading to connection
--     memory leaks and holding potential shared read locks that degrade database concurrency.
--
-- Q7: What are the performance trade-offs between Cursors and Set-Based SQL queries?
-- A7: Cursors process tuples sequentially in procedural interpreted code, which has higher CPU and
--     memory overhead than set-based queries (`UPDATE accounts SET balance = ...`). In production,
--     set-based updates are preferred for simple mutations; cursors are reserved for complex
--     workflows requiring fine-grained control and individualized audit records.
--
-- Q8: How did the Cursor in sp_batch_accrue_monthly_interest interact with the Stage 11 Triggers?
-- A8: When the cursor loop executed `UPDATE accounts SET balance = balance + v_interest`, MySQL's
--     InnoDB engine automatically triggered `trg_accounts_after_update` for each row, writing
--     audit entries to `account_balance_audit_log` with change_type = 'CREDIT'.
--
-- Q9: Can you update a table directly using `WHERE CURRENT OF cursor_name` in MySQL?
-- A9: No. Unlike Oracle or PostgreSQL, MySQL cursors are strictly READ ONLY. Updates within a cursor
--     loop must use standard parameterized `WHERE` clauses matching the row's primary key.
--
-- Q10: How does sp_batch_accrue_monthly_interest guarantee Atomicity for the entire batch?
-- A10: The entire cursor loop runs inside `START TRANSACTION;` and commits with `COMMIT;`. If any
--      system fault, disk full error, or constraint violation occurs midway, the
--      `DECLARE EXIT HANDLER FOR SQLEXCEPTION` catches the error and executes `ROLLBACK;`,
--      ensuring either all accounts receive interest or none do.
-- ============================================================================
