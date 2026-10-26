-- ============================================================================
-- ASR BANKING SIMULATOR — STAGE 10: STORED PROCEDURES & USER-DEFINED FUNCTIONS
-- ============================================================================
-- Academic Level: 2nd Year Computer Science / IT — Relational Database Management Systems
-- Topic: Procedural SQL (PL/SQL / MySQL Stored Programs), User-Defined Functions (UDFs),
--        CallableStatement in Java JDBC, Determinism, Exception Handlers & Transaction Encapsulation.
-- Engine: MySQL 9.x / InnoDB
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: THEORETICAL FOUNDATIONS & VIVA MASTER CONCEPTS
-- ----------------------------------------------------------------------------
-- 1. WHAT IS A STORED PROCEDURE?
--    A Stored Procedure is a precompiled collection of procedural SQL statements
--    and control-flow logic (IF-ELSE, LOOPS, HANDLERS, TRANSACTIONS) stored
--    directly inside the database catalog.
--    - Invocation: Executed explicitly via the `CALL procedure_name(args...)` command.
--    - Parameters: Supports `IN` (input), `OUT` (output), and `INOUT` (bidirectional).
--    - Return Values: Cannot be called directly inside an expression (e.g. `SELECT procedure()`
--      is invalid SQL syntax). Returns values via `OUT` parameters or open result sets.
--    - Transactional Scope: Can manage full transaction boundaries (`START TRANSACTION`,
--      `COMMIT`, `ROLLBACK`).
--
-- 2. WHAT IS A STORED FUNCTION (USER-DEFINED FUNCTION / UDF)?
--    A Stored Function is a database subroutine designed to compute and return
--    a single scalar value.
--    - Invocation: Called directly within standard SQL queries (`SELECT`, `WHERE`, `HAVING`,
--      `ORDER BY`) as an expression, just like built-in functions (`ROUND()`, `UPPER()`).
--    - Parameters: Only accepts `IN` parameters (no `OUT` or `INOUT`).
--    - Return Values: MUST specify `RETURNS <datatype>` and execute `RETURN <value>`.
--    - Transactional Scope: CANNOT commit or rollback transactions (`COMMIT`/`ROLLBACK` is
--      strictly prohibited inside functions to preserve query-level statement atomicity).
--
-- 3. ARCHITECTURAL COMPARISON: PROCEDURES VS. FUNCTIONS
--    +-------------------------+---------------------------------+--------------------------------+
--    | Characteristic          | Stored Procedure                | Stored Function (UDF)          |
--    +-------------------------+---------------------------------+--------------------------------+
--    | Invocation Syntax       | CALL procedure_name()           | SELECT function_name()         |
--    | Usable in SELECT/WHERE  | NO                              | YES (First-class expression)   |
--    | Return Capability       | 0, 1, or N values (OUT params)  | Exactly ONE scalar value       |
--    | Parameter Types         | IN, OUT, INOUT                  | IN only                        |
--    | Transaction Control     | START TRANSACTION, COMMIT,      | FORBIDDEN (Cannot commit or    |
--    |                         | ROLLBACK fully allowed          | rollback within a query)       |
--    | Purpose                 | Business workflows, batch jobs, | Computational formulas, string |
--    |                         | complex multi-table updates     | formatting, value enrichment   |
--    +-------------------------+---------------------------------+--------------------------------+
--
-- 4. DETERMINISM & BINARY LOGGING (log_bin_trust_function_creators)
--    When binary logging is enabled for replication, MySQL requires functions to be declared with:
--    - `DETERMINISTIC`: Given identical input parameters, always returns the exact same result
--      (e.g., compound interest calculation, string masking). Safe for statement-based replication.
--    - `READS SQL DATA`: Reads table data (via SELECT) but does not modify state.
--    - `NO SQL`: Contains no SQL statements (pure algorithmic computation).
--
-- 5. WHY USE STORED PROCEDURES IN INSTITUTIONAL BANKING?
--    a) Reduced Network Round-Trips (Latency Reduction):
--       A client-side transfer requires 5 round-trips over TCP (lock sender, lock receiver,
--       debit, credit, insert audit). A Stored Procedure executes all 5 steps in-memory
--       inside the database server in a single network round-trip.
--    b) Reduced Row Lock Hold Time:
--       Pessimistic row locks (`SELECT ... FOR UPDATE`) are held only for microseconds
--       within the server memory, drastically decreasing contention and deadlocks.
--    c) Security & Principle of Least Privilege:
--       Application service accounts can be granted `GRANT EXECUTE ON PROCEDURE sp_transfer`
--       without granting direct `UPDATE` or `DELETE` access to ledger tables (`accounts`).
-- ----------------------------------------------------------------------------

USE asr_banking;

-- ============================================================================
-- SECTION 2: USER-DEFINED FUNCTIONS (UDFs)
-- ============================================================================

-- FUNCTION 1: Compound Interest & FD Maturity Calculator
-- Formula: Standard Indian Banking Quarterly Compounding
-- A = P * (1 + r / (4 * 100))^(4 * t / 12) = P * (1 + r / 400)^(t / 3)
-- Characteristics: DETERMINISTIC (pure mathematical calculation)
DELIMITER //

DROP FUNCTION IF EXISTS fn_calculate_fd_maturity//
CREATE FUNCTION fn_calculate_fd_maturity(
    p_principal DECIMAL(15,2),
    p_annual_rate DECIMAL(5,2),
    p_months INT
)
RETURNS DECIMAL(15,2)
DETERMINISTIC
CONTAINS SQL
BEGIN
    DECLARE v_maturity DECIMAL(15,2);

    IF p_principal IS NULL OR p_principal <= 0 OR p_annual_rate IS NULL OR p_months IS NULL OR p_months <= 0 THEN
        RETURN 0.00;
    END IF;

    SET v_maturity = ROUND(p_principal * POW(1 + (p_annual_rate / 400.0), (p_months / 3.0)), 2);
    RETURN v_maturity;
END//

-- FUNCTION 2: Account Number Data Masking (PII Privacy Protection)
-- Masks all but the last 4 characters of an account number: 'ACC000123' -> '•••••0123'
-- Characteristics: DETERMINISTIC, NO SQL
DROP FUNCTION IF EXISTS fn_mask_account_number//
CREATE FUNCTION fn_mask_account_number(
    p_acc_no VARCHAR(30)
)
RETURNS VARCHAR(30)
DETERMINISTIC
NO SQL
BEGIN
    IF p_acc_no IS NULL THEN
        RETURN NULL;
    END IF;

    IF LENGTH(p_acc_no) <= 4 THEN
        RETURN p_acc_no;
    ELSE
        RETURN CONCAT(REPEAT('•', LENGTH(p_acc_no) - 4), RIGHT(p_acc_no, 4));
    END IF;
END//

-- FUNCTION 3: Customer Relationship Risk & Wealth Tier
-- Evaluates total relationship balance across active savings/current accounts and fixed deposits.
-- Characteristics: READS SQL DATA (executes SELECT queries against core tables)
DROP FUNCTION IF EXISTS fn_customer_tier//
CREATE FUNCTION fn_customer_tier(
    p_cust_id VARCHAR(20)
)
RETURNS VARCHAR(20)
READS SQL DATA
BEGIN
    DECLARE v_total_balance DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_tier VARCHAR(20);

    -- Sum active accounts balance + active fixed deposit amounts
    SELECT COALESCE(
        (SELECT SUM(balance) FROM accounts WHERE cust_id = p_cust_id AND status = 'Active'), 0
    ) + COALESCE(
        (SELECT SUM(amount) FROM fixed_deposits WHERE cust_id = p_cust_id AND status = 'Active'), 0
    ) INTO v_total_balance;

    IF v_total_balance >= 500000.00 THEN
        SET v_tier = 'PLATINUM';
    ELSEIF v_total_balance >= 100000.00 THEN
        SET v_tier = 'GOLD';
    ELSEIF v_total_balance >= 25000.00 THEN
        SET v_tier = 'SILVER';
    ELSE
        SET v_tier = 'STANDARD';
    END IF;

    RETURN v_tier;
END//

DELIMITER ;


-- ============================================================================
-- SECTION 3: STORED PROCEDURES (ATOMIC CORE BANKING ROUTINES)
-- ============================================================================

DELIMITER //

-- PROCEDURE 1: Interbank / P2P Fund Transfer with Autonomous ACID Protection
-- Encapsulates validation, pessimistic row-locking, double-entry bookkeeping,
-- audit transaction creation, and automated rollback via SQLEXCEPTION handler.
DROP PROCEDURE IF EXISTS sp_execute_interbank_transfer//
CREATE PROCEDURE sp_execute_interbank_transfer(
    IN p_sender_acc VARCHAR(30),
    IN p_receiver_acc VARCHAR(30),
    IN p_amount DECIMAL(15,2),
    IN p_channel VARCHAR(20),
    OUT p_status_code VARCHAR(30),
    OUT p_status_message VARCHAR(255),
    OUT p_sender_txn_ref VARCHAR(50)
)
proc_label: BEGIN
    DECLARE v_sender_balance DECIMAL(15,2);
    DECLARE v_sender_status VARCHAR(20);
    DECLARE v_receiver_status VARCHAR(20);
    DECLARE v_ref_sender VARCHAR(50);
    DECLARE v_ref_receiver VARCHAR(50);
    DECLARE v_txn_id_debit VARCHAR(30);
    DECLARE v_txn_id_credit VARCHAR(30);

    -- Exception Handler: Automatically rollback on any SQL error or constraint violation
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'ERR_SQL_EXCEPTION';
        SET p_status_message = 'Database error or integrity constraint violation. Transaction rolled back.';
        SET p_sender_txn_ref = NULL;
    END;

    -- Step 1: Input Validation — Amount strictly positive
    IF p_amount IS NULL OR p_amount <= 0.00 THEN
        SET p_status_code = 'ERR_INVALID_AMOUNT';
        SET p_status_message = 'Transfer amount must be strictly greater than zero.';
        SET p_sender_txn_ref = NULL;
        LEAVE proc_label;
    END IF;

    -- Step 2: Input Validation — Cannot transfer to self
    IF p_sender_acc = p_receiver_acc THEN
        SET p_status_code = 'ERR_SAME_ACCOUNT';
        SET p_status_message = 'Sender and receiver accounts cannot be identical.';
        SET p_sender_txn_ref = NULL;
        LEAVE proc_label;
    END IF;

    -- Step 3: Begin Atomic Transaction
    START TRANSACTION;

    -- Lock Sender Account (Pessimistic Concurrency Control)
    SELECT balance, status INTO v_sender_balance, v_sender_status
    FROM accounts
    WHERE acc_no = p_sender_acc
    FOR UPDATE;

    IF v_sender_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'ERR_SENDER_NOT_FOUND';
        SET p_status_message = CONCAT('Sender account ', p_sender_acc, ' does not exist.');
        SET p_sender_txn_ref = NULL;
        LEAVE proc_label;
    END IF;

    IF v_sender_status != 'Active' THEN
        ROLLBACK;
        SET p_status_code = 'ERR_SENDER_INACTIVE';
        SET p_status_message = CONCAT('Sender account ', p_sender_acc, ' is not Active (status: ', v_sender_status, ').');
        SET p_sender_txn_ref = NULL;
        LEAVE proc_label;
    END IF;

    IF v_sender_balance < p_amount THEN
        ROLLBACK;
        SET p_status_code = 'ERR_INSUFFICIENT_FUNDS';
        SET p_status_message = CONCAT('Insufficient funds. Available: ₹', v_sender_balance, ', Requested: ₹', p_amount);
        SET p_sender_txn_ref = NULL;
        LEAVE proc_label;
    END IF;

    -- Lock Receiver Account (Pessimistic Concurrency Control)
    SELECT status INTO v_receiver_status
    FROM accounts
    WHERE acc_no = p_receiver_acc
    FOR UPDATE;

    IF v_receiver_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'ERR_RECEIVER_NOT_FOUND';
        SET p_status_message = CONCAT('Beneficiary account ', p_receiver_acc, ' does not exist.');
        SET p_sender_txn_ref = NULL;
        LEAVE proc_label;
    END IF;

    IF v_receiver_status != 'Active' THEN
        ROLLBACK;
        SET p_status_code = 'ERR_RECEIVER_INACTIVE';
        SET p_status_message = CONCAT('Beneficiary account ', p_receiver_acc, ' is not Active.');
        SET p_sender_txn_ref = NULL;
        LEAVE proc_label;
    END IF;

    -- Step 4: Ledger Balance Updates
    UPDATE accounts
    SET balance = balance - p_amount
    WHERE acc_no = p_sender_acc;

    UPDATE accounts
    SET balance = balance + p_amount
    WHERE acc_no = p_receiver_acc;

    -- Step 5: Audit Log Creation
    SET v_ref_sender = CONCAT('SP-DEB-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', LPAD(FLOOR(RAND() * 9000 + 1000), 4, '0'));
    SET v_ref_receiver = CONCAT('SP-CRD-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', LPAD(FLOOR(RAND() * 9000 + 1000), 4, '0'));
    SET v_txn_id_debit = CONCAT('TXN', LPAD(FLOOR(RAND() * 900000000 + 100000000), 9, '0'));
    SET v_txn_id_credit = CONCAT('TXN', LPAD(FLOOR(RAND() * 900000000 + 100000000), 9, '0'));

    INSERT INTO transactions (txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description)
    VALUES (v_txn_id_debit, p_sender_acc, 'Debit', p_amount, NOW(), p_channel, 'Success', v_ref_sender, CONCAT('Transfer to ', p_receiver_acc, ' via Stored Procedure'));

    INSERT INTO transactions (txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description)
    VALUES (v_txn_id_credit, p_receiver_acc, 'Credit', p_amount, NOW(), p_channel, 'Success', v_ref_receiver, CONCAT('Received from ', p_sender_acc, ' via Stored Procedure'));

    -- Step 6: Commit Transaction
    COMMIT;

    SET p_status_code = 'SUCCESS';
    SET p_status_message = 'Fund transfer completed successfully within database engine.';
    SET p_sender_txn_ref = v_ref_sender;

END proc_label//


-- PROCEDURE 2: Fixed Deposit Booking with Tiered Interest & Age-Based Bonus
DROP PROCEDURE IF EXISTS sp_open_fixed_deposit//
CREATE PROCEDURE sp_open_fixed_deposit(
    IN p_cust_id VARCHAR(20),
    IN p_debit_acc_no VARCHAR(30),
    IN p_branch_id VARCHAR(20),
    IN p_deposit_amount DECIMAL(15,2),
    IN p_duration_months INT,
    OUT p_fd_id VARCHAR(20),
    OUT p_maturity_amount DECIMAL(15,2),
    OUT p_status_code VARCHAR(30),
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_acc_balance DECIMAL(15,2);
    DECLARE v_acc_cust_id VARCHAR(20);
    DECLARE v_acc_status VARCHAR(20);
    DECLARE v_dob DATE;
    DECLARE v_age INT;
    DECLARE v_interest_rate DECIMAL(5,2);
    DECLARE v_maturity_date DATE;
    DECLARE v_generated_fd_id VARCHAR(20);
    DECLARE v_ref_no VARCHAR(50);
    DECLARE v_txn_id VARCHAR(30);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'ERR_SQL_EXCEPTION';
        SET p_status_message = 'Database exception occurred while opening Fixed Deposit.';
        SET p_fd_id = NULL;
        SET p_maturity_amount = 0.00;
    END;

    -- Validation 1: Minimum Deposit Amount
    IF p_deposit_amount IS NULL OR p_deposit_amount < 5000.00 THEN
        SET p_status_code = 'ERR_MIN_DEPOSIT';
        SET p_status_message = 'Minimum fixed deposit principal requirement is ₹5,000.00.';
        SET p_fd_id = NULL;
        SET p_maturity_amount = 0.00;
        LEAVE proc_label;
    END IF;

    -- Validation 2: Minimum Tenure
    IF p_duration_months IS NULL OR p_duration_months < 3 THEN
        SET p_status_code = 'ERR_MIN_TENURE';
        SET p_status_message = 'Minimum deposit duration is 3 months.';
        SET p_fd_id = NULL;
        SET p_maturity_amount = 0.00;
        LEAVE proc_label;
    END IF;

    -- Retrieve Customer Birthday for Senior Citizen Rate Determination
    SELECT dob INTO v_dob FROM customers WHERE cust_id = p_cust_id;
    IF v_dob IS NULL THEN
        SET p_status_code = 'ERR_CUSTOMER_NOT_FOUND';
        SET p_status_message = CONCAT('Customer ', p_cust_id, ' not found.');
        SET p_fd_id = NULL;
        SET p_maturity_amount = 0.00;
        LEAVE proc_label;
    END IF;

    SET v_age = TIMESTAMPDIFF(YEAR, v_dob, CURDATE());

    -- Determine Base Rate by Duration Tier
    IF p_duration_months < 6 THEN
        SET v_interest_rate = 5.50;
    ELSEIF p_duration_months <= 12 THEN
        SET v_interest_rate = 6.50;
    ELSEIF p_duration_months <= 24 THEN
        SET v_interest_rate = 7.10;
    ELSE
        SET v_interest_rate = 7.75;
    END IF;

    -- Senior Citizen Bonus (+0.50% if age >= 60)
    IF v_age >= 60 THEN
        SET v_interest_rate = v_interest_rate + 0.50;
    END IF;

    -- Atomic Lock & Creation
    START TRANSACTION;

    SELECT balance, cust_id, status INTO v_acc_balance, v_acc_cust_id, v_acc_status
    FROM accounts
    WHERE acc_no = p_debit_acc_no
    FOR UPDATE;

    IF v_acc_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'ERR_ACCOUNT_NOT_FOUND';
        SET p_status_message = CONCAT('Debit account ', p_debit_acc_no, ' not found.');
        SET p_fd_id = NULL;
        SET p_maturity_amount = 0.00;
        LEAVE proc_label;
    END IF;

    IF v_acc_cust_id != p_cust_id THEN
        ROLLBACK;
        SET p_status_code = 'ERR_ACCOUNT_MISMATCH';
        SET p_status_message = 'Debit account does not belong to the requesting customer.';
        SET p_fd_id = NULL;
        SET p_maturity_amount = 0.00;
        LEAVE proc_label;
    END IF;

    IF v_acc_status != 'Active' THEN
        ROLLBACK;
        SET p_status_code = 'ERR_ACCOUNT_INACTIVE';
        SET p_status_message = 'Debit account is not in Active status.';
        SET p_fd_id = NULL;
        SET p_maturity_amount = 0.00;
        LEAVE proc_label;
    END IF;

    IF v_acc_balance < p_deposit_amount THEN
        ROLLBACK;
        SET p_status_code = 'ERR_INSUFFICIENT_FUNDS';
        SET p_status_message = CONCAT('Insufficient account balance (₹', v_acc_balance, ') to fund FD of ₹', p_deposit_amount);
        SET p_fd_id = NULL;
        SET p_maturity_amount = 0.00;
        LEAVE proc_label;
    END IF;

    -- Calculate maturity date and amount using UDF
    SET v_maturity_date = DATE_ADD(CURDATE(), INTERVAL p_duration_months MONTH);
    SET p_maturity_amount = fn_calculate_fd_maturity(p_deposit_amount, v_interest_rate, p_duration_months);

    -- Generate unique FD ID
    SET v_generated_fd_id = CONCAT('FD', LPAD(FLOOR(RAND() * 90000 + 10000), 5, '0'));

    -- Deduct funds from source account
    UPDATE accounts
    SET balance = balance - p_deposit_amount
    WHERE acc_no = p_debit_acc_no;

    -- Insert FD record
    INSERT INTO fixed_deposits (fd_id, cust_id, branch_id, amount, interest_rate, duration_months, start_date, maturity_date, status)
    VALUES (v_generated_fd_id, p_cust_id, p_branch_id, p_deposit_amount, v_interest_rate, p_duration_months, CURDATE(), v_maturity_date, 'Active');

    -- Create ledger audit trail
    SET v_ref_no = CONCAT('FD-CREAT-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));
    SET v_txn_id = CONCAT('TXN', LPAD(FLOOR(RAND() * 900000000 + 100000000), 9, '0'));

    INSERT INTO transactions (txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description)
    VALUES (v_txn_id, p_debit_acc_no, 'Debit', p_deposit_amount, NOW(), 'BRANCH', 'Success', v_ref_no, CONCAT('Fixed Deposit booked: ', v_generated_fd_id));

    COMMIT;

    SET p_fd_id = v_generated_fd_id;
    SET p_status_code = 'SUCCESS';
    SET p_status_message = CONCAT('Fixed Deposit ', v_generated_fd_id, ' opened successfully at ', v_interest_rate, '% p.a.');

END proc_label//

DELIMITER ;


-- ============================================================================
-- SECTION 4: DEMONSTRATION & VERIFICATION QUERIES
-- ============================================================================

-- Query 4.1: Compute FD Maturity for Multiple Investment Tiers
SELECT 
    100000.00 AS principal,
    '7.50%' AS annual_rate,
    fn_calculate_fd_maturity(100000.00, 7.50, 12) AS maturity_12_months,
    fn_calculate_fd_maturity(100000.00, 7.50, 24) AS maturity_24_months,
    fn_calculate_fd_maturity(100000.00, 7.50, 36) AS maturity_36_months;

-- Query 4.2: Calling Stored Function in Multi-Table Query with Data Masking
SELECT 
    c.cust_id,
    c.name,
    fn_mask_account_number(a.acc_no) AS masked_account_number,
    a.balance,
    fn_customer_tier(c.cust_id) AS relationship_tier
FROM customers c
JOIN accounts a ON c.cust_id = a.cust_id
WHERE a.status = 'Active'
ORDER BY a.balance DESC;

-- Query 4.3: Testing Stored Procedure sp_execute_interbank_transfer (Success Case)
CALL sp_execute_interbank_transfer('ACC001', 'ACC002', 100.00, 'NETBANKING', @out_code, @out_msg, @out_ref);
SELECT @out_code AS status_code, @out_msg AS status_message, @out_ref AS transaction_ref;

-- Query 4.4: Testing Stored Procedure Validation (Insufficient Funds Case)
CALL sp_execute_interbank_transfer('ACC001', 'ACC002', 99999999.00, 'NETBANKING', @out_code, @out_msg, @out_ref);
SELECT @out_code AS status_code, @out_msg AS status_message, @out_ref AS transaction_ref;

-- Query 4.5: Testing Stored Procedure Validation (Self Transfer Rejection)
CALL sp_execute_interbank_transfer('ACC001', 'ACC001', 500.00, 'UPI', @out_code, @out_msg, @out_ref);
SELECT @out_code AS status_code, @out_msg AS status_message, @out_ref AS transaction_ref;


-- ============================================================================
-- SECTION 5: VIVA VOCE QUESTIONS & MODEL ANSWERS (COLLEGE EVALUATION)
-- ============================================================================
-- Q1: What is the fundamental difference between a Stored Procedure and a Stored Function?
-- A1: A Function must return a single scalar value via RETURNS/RETURN and can be called
--     directly inside a SELECT statement or WHERE clause. A Procedure is invoked via CALL,
--     can return multiple values via OUT parameters or result sets, and can manage transactions
--     (COMMIT/ROLLBACK), which is strictly forbidden inside functions.
--
-- Q2: Why cannot we execute COMMIT or ROLLBACK inside a Stored Function?
-- A2: Functions are evaluated within the context of an SQL statement (like a SELECT or UPDATE).
--     Allowing COMMIT or ROLLBACK inside a function would break statement-level atomicity
--     guaranteed by ANSI SQL and the ACID properties of the outer query.
--
-- Q3: What is the purpose of CallableStatement in Java JDBC?
-- A3: CallableStatement (an interface extending PreparedStatement) provides standard SQL92
--     syntax `{CALL procedure_name(?, ?, ...)}` to execute database stored procedures.
--     It allows registering OUT parameters via `registerOutParameter(index, java.sql.Types)`
--     and retrieving output values after execution.
--
-- Q4: What does the DETERMINISTIC characteristic signify in a MySQL function?
-- A4: A function is DETERMINISTIC if it produces the exact same output for the same input
--     arguments every time without reading table data that could change. MySQL requires this
--     for binary logging replication to ensure master and replica databases remain in sync.
--
-- Q5: What is an EXIT HANDLER in MySQL stored programs?
-- A5: `DECLARE EXIT HANDLER FOR SQLEXCEPTION` intercepts any runtime database error (e.g.,
--     foreign key violation, check constraint violation, deadlock). The HANDLER block executes
--     a clean `ROLLBACK;` and sets human-readable error response variables before exiting cleanly.
--
-- Q6: How do Stored Procedures reduce network latency in multi-tier banking applications?
-- A6: Without a procedure, the application server sends multiple round-trips over TCP (lock sender,
--     lock receiver, debit sender, credit receiver, record audit). With a stored procedure,
--     a single CALL executes all steps in-memory inside the database server engine.
--
-- Q7: What are IN, OUT, and INOUT parameter modes in Stored Procedures?
-- A7: - IN: Pass-by-value; the parameter is input to the procedure and cannot be modified outside.
--     - OUT: Pass-by-reference; the procedure assigns a value to it, which is returned to the caller.
--     - INOUT: Initialized by caller, modified by the procedure, and passed back.
--
-- Q8: Can a Stored Procedure call another Stored Procedure or Function?
-- A8: Yes. Routines can be nested. In fact, our `sp_open_fixed_deposit` procedure calls
--     `fn_calculate_fd_maturity` to compute compound interest maturity values.
--
-- Q9: Why is pessimistic locking (SELECT ... FOR UPDATE) critical inside sp_execute_interbank_transfer?
-- A9: To prevent lost updates and double spending. When two concurrent requests attempt to debit
--     the same account simultaneously, FOR UPDATE forces the second transaction to wait until
--     the first transaction commits, guaranteeing serializability.
--
-- Q10: How do Stored Procedures improve database security (ANSI-SPARC External Schema)?
-- A10: DBAs can grant users EXECUTE privileges on the procedure while denying them direct
--      SELECT, INSERT, UPDATE, or DELETE access to sensitive base tables (`accounts`, `customers`).
--      This enforces the principle of least privilege.
-- ============================================================================
