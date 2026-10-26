-- ============================================================================
-- ASR Bank Simulator — DBMS Learning Series
-- Module 09: Database Indexes, B+ Trees & Query Execution Optimization (EXPLAIN)
-- Target Database: MySQL 8.0+ / InnoDB
-- Schema: asr_banking
-- ============================================================================

USE asr_banking;

-- ============================================================================
-- 1. THEORETICAL FOUNDATION: B+ TREE INDEX ARCHITECTURE
-- ============================================================================
-- In modern relational database engines (like MySQL InnoDB), indexes are implemented
-- using the B+ Tree (Balanced Multi-Way Search Tree) data structure:
--
-- Why B+ Tree over Binary Search Trees (BST / AVL / Red-Black)?
--   1. High Fanout (Branching Factor):
--      A single 16KB InnoDB disk page can store hundreds of index keys. A 3-level
--      B+ Tree can index millions of rows with only 3 disk I/O operations!
--   2. Doubly-Linked Leaf Nodes:
--      All data pointers reside strictly in the leaf nodes, which are connected
--      by bidirectional pointers. This allows O(log N) point lookups AND extremely
--      fast O(K) sequential range scans (e.g., date ranges, balance intervals).
--
-- ----------------------------------------------------------------------------
-- Clustered Index vs Secondary Index in InnoDB:
--
-- 1. Clustered Index (PRIMARY KEY):
--    - The table IS the index.
--    - The leaf nodes store the COMPLETE row data (all columns).
--    - There can be exactly ONE clustered index per table.
--
-- 2. Secondary (Non-Clustered) Index:
--    - Leaf nodes store ONLY the indexed column values + the Primary Key value (bookmark).
--    - To fetch columns not present in the secondary index, InnoDB performs a
--      "Secondary Index Traversal -> Primary Key Clustered B-Tree Lookup" (Row ID Lookup).
--
-- 3. Covering Index ("Using index"):
--    - If a query's SELECT and WHERE clauses reference ONLY columns contained in the
--      secondary index, InnoDB reads directly from the secondary index leaf pages
--      and SKIPS the clustered primary key lookup entirely!
-- ============================================================================


-- ============================================================================
-- 2. UNDERSTANDING MySQL'S EXPLAIN OUTPUT (ACCESS TYPE RANKING)
-- ============================================================================
-- The 'type' column indicates how MySQL joins/reads table rows (Fastest to Slowest):
--   1. const   : O(1) single row lookup on Primary Key or Unique Index with constant.
--   2. eq_ref  : 1 row read from this table for each row from previous table in a JOIN.
--   3. ref     : Non-unique index lookup; returns multiple matching rows.
--   4. range   : Index range scan (using BETWEEN, IN, >, <).
--   5. index   : Full Index Scan (scans entire index tree without table scan).
--   6. ALL     : Full Table Scan (slowest; reads every physical page from disk).
-- ============================================================================


-- ============================================================================
-- QUERY 9.1: Primary Key Point Lookup (type: const)
-- ============================================================================
-- Purpose:
--   Look up a specific account by its primary key.
-- Expected EXPLAIN:
--   type = 'const', key = 'PRIMARY', rows = 1.
-- ============================================================================

EXPLAIN FORMAT=TRADITIONAL
SELECT 
    acc_no, cust_id, branch_id, balance, status 
FROM 
    accounts 
WHERE 
    acc_no = 'ACC001';

-- Expected Output:
-- +----+-------------+----------+-------+---------------+---------+---------+-------+------+----------+-------+
-- | id | select_type | table    | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |
-- +----+-------------+----------+-------+---------------+---------+---------+-------+------+----------+-------+
-- |  1 | SIMPLE      | accounts | const | PRIMARY       | PRIMARY | 122     | const |    1 |   100.00 | NULL  |
-- +----+-------------+----------+-------+---------------+---------+---------+-------+------+----------+-------+


-- ============================================================================
-- QUERY 9.2: Covering Index Execution (type: ref, Extra: Using index)
-- ============================================================================
-- Index: idx_accounts_cust_balance (cust_id, balance)
-- Notice:
--   Both 'cust_id' and 'balance' are stored inside the index leaf nodes.
--   InnoDB satisfies this query without reading the base table row pages!
-- ============================================================================

EXPLAIN FORMAT=TRADITIONAL
SELECT 
    cust_id, balance 
FROM 
    accounts 
WHERE 
    cust_id = 'CUST001';

-- Expected Output:
-- +----+-------------+----------+------+---------------------------+---------------------------+---------+-------+------+----------+-------------+
-- | id | select_type | table    | type | possible_keys             | key                       | key_len | ref   | rows | filtered | Extra       |
-- +----+-------------+----------+------+---------------------------+---------------------------+---------+-------+------+----------+-------------+
-- |  1 | SIMPLE      | accounts | ref  | idx_accounts_cust_balance | idx_accounts_cust_balance | 82      | const |    2 |   100.00 | Using index |
-- +----+-------------+----------+------+---------------------------+---------------------------+---------+-------+------+----------+-------------+


-- ============================================================================
-- QUERY 9.3: Composite Range Scan & Index Condition Pushdown (ICP)
-- ============================================================================
-- Index: idx_transactions_acc_date (acc_no, txn_date DESC)
-- Purpose:
--   Generates account statement for ACC001 within a date range.
-- Expected EXPLAIN:
--   type = 'range', key = 'idx_transactions_acc_date', Extra: 'Using index condition'
-- ============================================================================

EXPLAIN FORMAT=TRADITIONAL
SELECT 
    txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description
FROM 
    transactions FORCE INDEX (idx_transactions_acc_date)
WHERE 
    acc_no = 'ACC001' 
    AND txn_date >= '2026-09-01 00:00:00'
ORDER BY 
    txn_date DESC;

-- Expected Output:
-- +----+-------------+--------------+-------+---------------------------+---------------------------+---------+------+------+----------+-----------------------+
-- | id | select_type | table        | type  | possible_keys             | key                       | key_len | ref  | rows | filtered | Extra                 |
-- +----+-------------+--------------+-------+---------------------------+---------------------------+---------+------+------+----------+-----------------------+
-- |  1 | SIMPLE      | transactions | range | idx_transactions_acc_date | idx_transactions_acc_date | 127     | NULL |    1 |   100.00 | Using index condition |
-- +----+-------------+--------------+-------+---------------------------+---------------------------+---------+------+------+----------+-----------------------+


-- ============================================================================
-- QUERY 9.4: The Leftmost Prefix Rule Demonstration
-- ============================================================================
-- Index: idx_transactions_acc_date (acc_no, txn_date DESC)
-- Academic Rule:
--   A composite B+ Tree index is sorted by the 1st column FIRST, then the 2nd column.
--   If a query filters ONLY on 'txn_date' (omitting the leftmost 'acc_no'),
--   the index CANNOT be used for range lookup! The optimizer falls back to ALL.
-- ============================================================================

EXPLAIN FORMAT=TRADITIONAL
SELECT 
    * 
FROM 
    transactions 
WHERE 
    txn_date >= '2026-09-01 00:00:00';

-- Notice:
--   possible_keys is NULL, key is NULL, type = 'ALL' (Full Table Scan!).


-- ============================================================================
-- QUERY 9.5: Multi-Table JOIN Optimization (ref & eq_ref)
-- ============================================================================
-- Purpose:
--   Evaluates how foreign key and primary key indexes optimize a multi-table JOIN.
-- ============================================================================

EXPLAIN FORMAT=TRADITIONAL
SELECT 
    c.name, a.acc_no, a.balance, b.branch_name
FROM 
    customers c
INNER JOIN 
    accounts a ON c.cust_id = a.cust_id
INNER JOIN 
    branches b ON a.branch_id = b.branch_id
WHERE 
    c.cust_id = 'CUST001';

-- Expected Output:
-- 1. customers: type = 'const' (PK lookup on CUST001)
-- 2. accounts : type = 'ref'   (using idx_accounts_cust_balance)
-- 3. branches : type = 'eq_ref'(PK lookup on b.branch_id)
