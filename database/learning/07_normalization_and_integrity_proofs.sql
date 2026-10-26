-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 07: Database Normalization Proofs (1NF to BCNF) & Schema Integrity
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- 1. THEORETICAL FOUNDATION: NORMALIZATION MATHEMATICS
-- ============================================================================
-- Normalization is the formal mathematical process of decomposing relations to
-- eliminate data redundancy, insertion anomalies, update anomalies, and
-- deletion anomalies, while ensuring LOSSLESS-JOIN and DEPENDENCY PRESERVATION.
--
-- Armstrong's Axioms (Inference Rules for Functional Dependencies F):
--   1. Reflexivity: If Y ⊆ X, then X → Y
--   2. Augmentation: If X → Y, then XZ → YZ
--   3. Transitivity: If X → Y and Y → Z, then X → Z
-- Secondary Rules derived from Axioms:
--   - Union: If X → Y and X → Z, then X → YZ
--   - Decomposition: If X → YZ, then X → Y and X → Z
--   - Pseudo-transitivity: If X → Y and WY → Z, then WX → Z
--
-- ----------------------------------------------------------------------------
-- The Normal Form Hierarchy:
--   Unnormalized (UNF) ⊃ 1NF ⊃ 2NF ⊃ 3NF ⊃ BCNF ⊃ 4NF ⊃ 5NF
--
-- 1. FIRST NORMAL FORM (1NF):
--    A relation R is in 1NF if and only if the domain of each attribute contains
--    only atomic (indivisible) values, and there are no repeating groups or arrays.
--
-- 2. SECOND NORMAL FORM (2NF):
--    A relation R is in 2NF if and only if it is in 1NF AND every non-prime
--    attribute is FULLY functionally dependent on every candidate key.
--    (No Partial Dependencies: X → A where X ⊂ Candidate Key and A is non-prime).
--    *Theorem: Any relation whose candidate keys are all single attributes is
--     automatically in 2NF!
--
-- 3. THIRD NORMAL FORM (3NF):
--    A relation R is in 3NF if and only if it is in 2NF AND for every non-trivial
--    functional dependency X → Y, either:
--      a) X is a Superkey, OR
--      b) Y is a Prime Attribute (member of some candidate key).
--    (No Transitive Dependencies: X → Y → Z where Z is non-prime).
--
-- 4. BOYCE-CODD NORMAL FORM (BCNF):
--    A relation R is in BCNF if and only if for EVERY non-trivial functional
--    dependency X → Y, X is a SUPERKEY.
--    (Stricter than 3NF: eliminates condition 3b).
-- ============================================================================


-- ============================================================================
-- 2. FORMAL NORMALIZATION PROOFS FOR ASR BANK RELATIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROOF 7.1: Table `accounts`
-- Attributes: (acc_no, cust_id, branch_id, acc_type, balance, open_date, status, created_at)
-- ----------------------------------------------------------------------------
-- Candidate Key: {acc_no} (Single attribute)
-- Functional Dependencies (F):
--   FD1: acc_no → cust_id, branch_id, acc_type, balance, open_date, status, created_at
--
-- Proof of 1NF:
--   All attributes (balance DECIMAL, acc_type VARCHAR) contain atomic values.
--   No multi-valued attributes exist. Hence, accounts ∈ 1NF.
--
-- Proof of 2NF:
--   Candidate key {acc_no} consists of a single attribute.
--   A proper subset of a single attribute key does not exist (∅).
--   Therefore, partial dependency is mathematically impossible. Hence, accounts ∈ 2NF.
--
-- Proof of 3NF:
--   In FD1, determinant {acc_no} is a Superkey.
--   Notice: If accounts had stored branch_name or ifsc_code, we would have:
--     acc_no → branch_id → branch_name (Transitive Dependency!).
--   Because branch_name and ifsc_code were decomposed into the `branches` relation,
--   no transitive dependency exists in accounts. Hence, accounts ∈ 3NF.
--
-- Proof of BCNF:
--   For the only non-trivial FD (acc_no → all other attributes), {acc_no} is a Superkey.
--   Therefore, accounts ∈ BCNF. Q.E.D.


-- ----------------------------------------------------------------------------
-- PROOF 7.2: Table `loan_borrows` (Junction Relation with Composite Key)
-- Attributes: (loan_id, cust_id, borrower_type, added_on)
-- ----------------------------------------------------------------------------
-- Candidate Key: {loan_id, cust_id} (Composite 2-attribute key)
-- Prime Attributes: {loan_id, cust_id}
-- Non-Prime Attributes: {borrower_type, added_on}
-- Functional Dependencies (F):
--   FD1: {loan_id, cust_id} → borrower_type, added_on
--
-- Proof of 2NF on Composite Key:
--   Does loan_id → borrower_type hold? NO! A loan can have multiple borrowers with different roles (Primary vs Co-Borrower).
--   Does cust_id → borrower_type hold? NO! A customer can be Primary on LN001 and Co-Borrower on LN002.
--   Only the COMBINATION {loan_id, cust_id} determines the borrower_type and added_on timestamp.
--   Because no non-prime attribute depends on a proper subset of the candidate key,
--   there are NO partial dependencies. Hence, loan_borrows ∈ 2NF.
--
-- Proof of 3NF & BCNF:
--   For FD1, the determinant {loan_id, cust_id} is the Primary Superkey.
--   There are no other non-trivial functional dependencies.
--   Hence, loan_borrows ∈ 3NF and loan_borrows ∈ BCNF. Q.E.D.


-- ============================================================================
-- 3. SCHEMA CONSTRAINT AUDIT VIA INFORMATION_SCHEMA
-- ============================================================================

-- Query 7.1: Summary Count of Relational Constraints
SELECT 
    CONSTRAINT_TYPE, 
    COUNT(*) AS total_constraints
FROM 
    information_schema.TABLE_CONSTRAINTS
WHERE 
    TABLE_SCHEMA = 'asr_banking'
GROUP BY 
    CONSTRAINT_TYPE
ORDER BY 
    total_constraints DESC;

-- Expected Output:
-- +-----------------+-------------------+
-- | CONSTRAINT_TYPE | total_constraints |
-- +-----------------+-------------------+
-- | CHECK           |                33 |
-- | FOREIGN KEY     |                18 |
-- | PRIMARY KEY     |                14 |
-- | UNIQUE          |                 9 |
-- +-----------------+-------------------+


-- Query 7.2: Foreign Key Referential Integrity Rules (RESTRICT vs SET NULL)
SELECT 
    rc.CONSTRAINT_NAME,
    rc.TABLE_NAME AS child_table,
    kcu.COLUMN_NAME AS fk_column,
    rc.REFERENCED_TABLE_NAME AS parent_table,
    kcu.REFERENCED_COLUMN_NAME AS pk_column,
    rc.DELETE_RULE
FROM 
    information_schema.REFERENTIAL_CONSTRAINTS rc
JOIN 
    information_schema.KEY_COLUMN_USAGE kcu 
    ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME 
    AND rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
WHERE 
    rc.CONSTRAINT_SCHEMA = 'asr_banking'
ORDER BY 
    rc.TABLE_NAME, rc.CONSTRAINT_NAME;


-- Query 7.3: Enterprise CHECK Constraints Catalog
SELECT 
    tc.TABLE_NAME,
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM 
    information_schema.CHECK_CONSTRAINTS cc
JOIN 
    information_schema.TABLE_CONSTRAINTS tc 
    ON cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME 
    AND cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
WHERE 
    tc.TABLE_SCHEMA = 'asr_banking'
ORDER BY 
    tc.TABLE_NAME, cc.CONSTRAINT_NAME;


-- ============================================================================
-- 4. PRACTICAL NEGATIVE TESTING: PROVING INTEGRITY ENFORCEMENT
-- ============================================================================

-- Test 7.1: Entity Integrity (Reject NULL or Duplicate Primary Key)
-- Expected: Error 1062 (23000): Duplicate entry 'ACC001' for key 'accounts.PRIMARY'
-- INSERT INTO accounts (acc_no, cust_id, branch_id, acc_type, balance, open_date)
-- VALUES ('ACC001', 'CUST001', 'BR001', 'Savings', 1000.00, '2026-01-01');

-- Test 7.2: Domain & Enterprise Check Constraint (Reject Negative Balance)
-- Expected: Error 3819 (HY000): Check constraint 'chk_accounts_balance' is violated.
-- UPDATE accounts SET balance = -100.00 WHERE acc_no = 'ACC001';

-- Test 7.3: Referential Integrity RESTRICT (Reject Deleting Referenced Customer)
-- Expected: Error 1451 (23000): Cannot delete parent row: foreign key constraint fails
-- DELETE FROM customers WHERE cust_id = 'CUST001';
