-- ============================================================================
-- ASR BANKING SIMULATOR — STAGE 13: DATABASE SECURITY, ROLES & SQL INJECTION DEFENSE
-- ============================================================================
-- Academic Level: 2nd Year Computer Science / IT — Relational Database Management Systems
-- Topic: Role-Based Access Control (RBAC), Principle of Least Privilege (PoLP),
--        GRANT/REVOKE Semantics, SQL Injection Attack Vectors (Tautology, Union, Piggybacking),
--        and Parameterized Query / PreparedStatement Binary Protocol Defenses.
-- Engine: MySQL 9.x / InnoDB
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: THEORETICAL FOUNDATIONS & VIVA MASTER CONCEPTS
-- ----------------------------------------------------------------------------
-- 1. THE PRINCIPLE OF LEAST PRIVILEGE (PoLP)
--    In commercial banking systems (such as Reserve Bank of India / Basel III frameworks),
--    no single user, application service, or employee may possess unrestricted database
--    access. Every identity must operate with the minimum set of privileges necessary
--    to complete its designated organizational tasks.
--
-- 2. ROLE-BASED ACCESS CONTROL (RBAC) IN MYSQL 8.x / 9.x
--    A **Role** is a named collection of database privileges. Instead of granting
--    individual privileges to dozens of distinct database users (which causes privilege
--    drift and security audit failure), privileges are granted to Roles, and Roles
--    are assigned to Users.
--    Lifecycle:
--    a) `CREATE ROLE role_name;`
--    b) `GRANT privilege_list ON object TO role_name;`
--    c) `GRANT role_name TO user_name@host;`
--    d) `SET DEFAULT ROLE role_name TO user_name@host;` (Enables role automatically on login)
--
-- 3. SQL INJECTION (SQLi) ATTACK TAXONOMY
--    SQL Injection is an injection flaw (OWASP Top 10 #1 / #3) where untrusted client
--    input containing SQL control characters is concatenated directly into a query string,
--    causing the database query parser to alter the query's abstract syntax tree (AST).
--    Major Attack Classes:
--    a) Tautology / Boolean Bypass:
--       Input: `' OR '1'='1`
--       Alters the WHERE clause condition into a tautology that always evaluates to TRUE,
--       exposing all records or bypassing password authentication.
--    b) Union-Based Exfiltration:
--       Input: `' UNION SELECT 1, cust_id, aadhar_no, pan_no, 5 FROM customers --`
--       Appends an auxiliary query to exfiltrate sensitive data from unrelated tables.
--    c) Piggybacked Queries (Stacked Queries):
--       Input: `ACC001'; DROP TABLE transactions; --`
--       Terminates the primary command and executes an unauthorized second command.
--
-- 4. WHY PARAMETERIZED QUERIES (PreparedStatement) NEUTRALIZE SQLi
--    In a standard `Statement`, query compilation and value evaluation happen together.
--    In a `PreparedStatement`:
--    1. Compilation Phase: The SQL structure (`SELECT ... WHERE acc_no = ?`) is sent
--       to MySQL first. The parser creates and caches the query execution plan with
--       fixed parameter slot placeholders.
--    2. Execution Phase: Parameter values are sent separately over the MySQL binary protocol.
--       The database treats the input strictly as literal scalar data. Even if the input
--       contains `' OR '1'='1` or `; DROP TABLE`, it is treated purely as a literal string
--       value for comparison against `acc_no`, rendering SQL injection mathematically impossible.
-- ----------------------------------------------------------------------------

USE asr_banking;

-- ============================================================================
-- SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC) ARCHITECTURE
-- ============================================================================

-- Step 2.1: Create Institutional Banking Roles
DROP ROLE IF EXISTS bank_teller_role, bank_auditor_role, bank_app_service_role;
CREATE ROLE bank_teller_role, bank_auditor_role, bank_app_service_role;

-- Step 2.2: Grant Granular Permissions to Auditor Role
-- Auditors require read-only access to transaction history, audit trails, and views.
-- They CANNOT execute INSERT, UPDATE, or DELETE on any table.
GRANT SELECT ON asr_banking.account_balance_audit_log TO bank_auditor_role;
GRANT SELECT ON asr_banking.customer_security_audit_log TO bank_auditor_role;
GRANT SELECT ON asr_banking.transactions TO bank_auditor_role;
GRANT SELECT ON asr_banking.view_branch_liquidity_summary TO bank_auditor_role;
GRANT SELECT ON asr_banking.view_customer_secure_profile TO bank_auditor_role;
GRANT SELECT ON asr_banking.view_active_account_details TO bank_auditor_role;

-- Step 2.3: Grant Permissions to Teller Role
-- Tellers view customer and account details and execute authorized stored procedures.
-- They CANNOT directly UPDATE or DELETE core balance tables or audit tables.
GRANT SELECT ON asr_banking.accounts TO bank_teller_role;
GRANT SELECT ON asr_banking.customers TO bank_teller_role;
GRANT SELECT ON asr_banking.view_active_account_details TO bank_teller_role;
GRANT EXECUTE ON PROCEDURE asr_banking.sp_execute_interbank_transfer TO bank_teller_role;
GRANT EXECUTE ON PROCEDURE asr_banking.sp_open_fixed_deposit TO bank_teller_role;

-- Step 2.4: Grant Permissions to Application Service Account Role
-- Backend microservices require operational DML and routine execution privileges.
GRANT SELECT, INSERT, UPDATE ON asr_banking.accounts TO bank_app_service_role;
GRANT SELECT, INSERT, UPDATE ON asr_banking.transactions TO bank_app_service_role;
GRANT SELECT, INSERT, UPDATE ON asr_banking.customers TO bank_app_service_role;
GRANT SELECT, INSERT, UPDATE ON asr_banking.fixed_deposits TO bank_app_service_role;
GRANT SELECT ON asr_banking.account_balance_audit_log TO bank_app_service_role;
GRANT SELECT ON asr_banking.customer_security_audit_log TO bank_app_service_role;
GRANT EXECUTE ON asr_banking.* TO bank_app_service_role;

-- Step 2.5: Provision Demonstration Users & Bind Roles
DROP USER IF EXISTS 'teller_alice'@'localhost', 'auditor_bob'@'localhost';
CREATE USER 'teller_alice'@'localhost' IDENTIFIED BY 'Teller@123';
CREATE USER 'auditor_bob'@'localhost' IDENTIFIED BY 'Auditor@123';

-- Assign Roles to Users
GRANT bank_teller_role TO 'teller_alice'@'localhost';
GRANT bank_auditor_role TO 'auditor_bob'@'localhost';

-- Enable Roles as Default on Login
SET DEFAULT ROLE bank_teller_role TO 'teller_alice'@'localhost';
SET DEFAULT ROLE bank_auditor_role TO 'auditor_bob'@'localhost';

FLUSH PRIVILEGES;


-- ============================================================================
-- SECTION 3: PRIVILEGE INSPECTION & AUDIT QUERIES
-- ============================================================================

-- Query 3.1: Inspect All Active Roles Defined in the Catalog
SELECT 
    FROM_HOST,
    FROM_USER,
    TO_HOST,
    TO_USER,
    WITH_ADMIN_OPTION
FROM mysql.role_edges
ORDER BY TO_USER;

-- Query 3.2: Inspect Table Privileges Granted to Roles
SELECT 
    GRANTEE,
    TABLE_SCHEMA,
    TABLE_NAME,
    PRIVILEGE_TYPE
FROM information_schema.TABLE_PRIVILEGES
WHERE TABLE_SCHEMA = 'asr_banking'
ORDER BY GRANTEE, TABLE_NAME;

-- Query 3.3: Inspect Routine Privileges Granted to Roles
SELECT 
    User AS grantee,
    Db AS routine_schema,
    Routine_name,
    Routine_type,
    Proc_priv AS privilege_type
FROM mysql.procs_priv
WHERE Db = 'asr_banking'
ORDER BY Routine_name;


-- ============================================================================
-- SECTION 4: SQL INJECTION VULNERABILITY VS DEFENSE BENCHMARKS
-- ============================================================================

-- Benchmark 4.1: The Tautology Attack on Dynamic SQL (Unsafe Simulation)
-- Suppose an application concatenates: "SELECT * FROM accounts WHERE acc_no = '" + input + "'"
-- When input is: "' OR '1'='1"
-- The evaluated statement becomes:
-- SELECT * FROM accounts WHERE acc_no = '' OR '1'='1';
-- -> Returns ALL rows in the table, destroying tenant data privacy!

-- Benchmark 4.2: Parameterized Defense (Safe JDBC PreparedStatement)
-- Query: SELECT acc_no, cust_id, balance FROM accounts WHERE acc_no = ?;
-- Bound Parameter 1: "' OR '1'='1"
-- The MySQL parser treats the payload as an exact literal string comparison:
-- acc_no = '\' OR \'1\'=\'1'
-- -> Returns 0 rows safely.


-- ============================================================================
-- SECTION 5: VIVA VOCE QUESTIONS & MODEL ANSWERS (COLLEGE EVALUATION)
-- ============================================================================
-- Q1: What is the Principle of Least Privilege (PoLP) and why is it vital in banking DBMS?
-- A1: PoLP dictates that every user, role, and application service must be granted only the
--     minimum database permissions strictly required to perform its function. In banking,
--     giving full DBA/root access to application services increases the blast radius of
--     vulnerabilities; restricting permissions ensures a compromised service cannot drop tables
--     or view confidential employee records.
--
-- Q2: What is the advantage of using Roles (CREATE ROLE) over direct user grants?
-- A2: Roles provide centralized privilege management. Granting permissions to roles and assigning
--     roles to users prevents privilege creep, simplifies onboarding/offboarding, and ensures
--     compliance with security audits by guaranteeing identical permission sets for identical job roles.
--
-- Q3: Explain how a Tautology SQL Injection attack works.
-- A3: A tautology attack injects a condition that is always mathematically true (such as `' OR '1'='1`).
--     When concatenated into a query, the logical OR overrides previous WHERE conditions, forcing
--     the database engine to return every row in the relation.
--
-- Q4: Why does a PreparedStatement prevent SQL injection while dynamic SQL fails?
-- A4: A PreparedStatement uses a two-phase protocol:
--     1. The SQL query structure is sent and parsed into an Abstract Syntax Tree (AST) with placeholders (`?`).
--     2. Parameters are transmitted separately over the MySQL binary protocol.
--     Because the query structure is already compiled, parameter values are treated strictly as
--     literal scalar data and can never alter the query's syntactic grammar.
--
-- Q5: What is the purpose of `SET DEFAULT ROLE` in MySQL?
-- A5: When a role is granted to a user, it remains inactive until explicitly enabled via `SET ROLE`.
--     `SET DEFAULT ROLE role_name TO user;` configures MySQL to automatically activate the role
--     upon user authentication, ensuring privileges are immediately operational.
--
-- Q6: What is a Piggybacked Query attack?
-- A6: A piggybacked (or stacked) query attack terminates the intended SQL statement with a semicolon
--     and injects an entirely new command (e.g. `ACC001'; DROP TABLE transactions; --`). In drivers
--     allowing multi-query execution, this executes malicious administrative actions.
--
-- Q7: What is Union-Based SQL Injection?
-- A7: The attacker injects the `UNION` operator to combine the results of the original query with
--     an unauthorized query against sensitive tables (e.g., `customers` or `users`), returning
--     stolen data in the application's response payload.
--
-- Q8: Can SQL Injection occur when calling Stored Procedures?
-- A8: Only if the stored procedure itself uses dynamic SQL (`PREPARE stmt FROM CONCAT(...)`).
--     If the stored procedure uses static SQL with procedural parameters (as in our
--     `sp_execute_interbank_transfer`), SQL injection is impossible because parameters are typed.
--
-- Q9: What is the difference between Object-level and Column-level privileges?
-- A9: Object-level privileges apply to an entire table or view (`GRANT SELECT ON asr_banking.accounts`).
--     Column-level privileges restrict access to specific columns (e.g., `GRANT UPDATE (phone, email) ON customers`).
--
-- Q10: How does ANSI-SPARC View Isolation enforce database security?
-- A10: By defining Views (`view_customer_secure_profile`) that project only non-sensitive columns
--      and exclude sensitive hashes (Aadhaar, PAN), and granting access only to the View, users
--      can perform their jobs without ever accessing the underlying base tables.
-- ============================================================================
