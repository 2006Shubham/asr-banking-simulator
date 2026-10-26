-- ============================================================================
-- ASR BANKING SIMULATOR — STAGE 14: PERFORMANCE BENCHMARKS, QUERY TUNING & PROFILING
-- ============================================================================
-- Academic Level: 2nd Year Computer Science / IT — Relational Database Management Systems
-- Topic: Cost-Based Optimizer (CBO), Physical Access Paths, EXPLAIN ANALYZE Tree Inspection,
--        InnoDB Buffer Pool Architecture, Hit Ratio Calculation, and ANALYZE/OPTIMIZE TABLE.
-- Engine: MySQL 9.x / InnoDB
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: THEORETICAL FOUNDATIONS & VIVA MASTER CONCEPTS
-- ----------------------------------------------------------------------------
-- 1. THE COST-BASED OPTIMIZER (CBO) PIPELINE
--    When an application submits an SQL query, MySQL executes a 5-stage pipeline:
--    a) Parser: Syntactic analysis verifying grammatical correctness (generates AST).
--    b) Preprocessor: Semantic validation verifying tables and columns exist in catalog.
--    c) Logical Optimizer: Applies relational algebra transformations (e.g., predicate
--       pushdown, join reordering, eliminating redundant subqueries).
--    d) Cost-Based Physical Optimizer: Estimates execution cost for different access paths
--       (Full Table Scan, Index Lookup, Index Range Scan) using catalog statistics.
--       Cost Formula: Cost = (Disk Pages Read * I/O Cost) + (Row Comparisons * CPU Cost).
--       The plan with the lowest total cost is selected for execution.
--    e) Execution Engine: Executes the chosen iterator tree against storage buffers.
--
-- 2. EXPLAIN VS. EXPLAIN ANALYZE
--    +--------------------+------------------------------------+----------------------------------+
--    | Feature            | Traditional EXPLAIN                | Modern EXPLAIN ANALYZE (MySQL 8+) |
--    +--------------------+------------------------------------+----------------------------------+
--    | Execution Status   | Does NOT execute the query         | Actually EXECUTES the query      |
--    | Row Counts         | Estimates rows (from statistics)   | Measures EXACT actual rows       |
--    | Timing             | No timing information              | Measures actual CPU time (ms)    |
--    | Output Format      | Tabular or JSON                    | Hierarchical Volcano Iterator    |
--    |                    |                                    | Execution Tree                   |
--    +--------------------+------------------------------------+----------------------------------+
--
-- 3. INNODB BUFFER POOL & MEMORY ARCHITECTURE
--    The **Buffer Pool** is InnoDB's dedicated shared memory region where cached data
--    pages (16KB) and secondary index pages reside.
--    - When a query needs a page, InnoDB checks the Buffer Pool first (Logical Read - RAM).
--    - If missing, it reads the page from NVMe/SSD into the Buffer Pool (Physical Read - Disk).
--    - **Buffer Pool Hit Ratio Formula:**
--      Hit Ratio (%) = [ Read_Requests / (Read_Requests + Disk_Reads) ] * 100
--      *Target in Production Institutional Banking:* >= 99.00%.
--
-- 4. STATISTICAL MAINTENANCE (ANALYZE TABLE)
--    The optimizer relies on index cardinality numbers stored in `mysql.innodb_index_stats`.
--    If heavy batch insertions/deletions alter data distribution without updating catalog
--    metadata, the optimizer may choose a catastrophic Table Scan instead of an Index Scan.
--    `ANALYZE TABLE table_name;` samples 16KB index pages to refresh cardinality statistics.
-- ----------------------------------------------------------------------------

USE asr_banking;

-- ============================================================================
-- SECTION 2: EXPLAIN ANALYZE QUERY PROFILING BENCHMARKS
-- ============================================================================

-- Benchmark 2.1: Join Query with Composite Index Filtering
-- Analyzes three-table relational join (transactions -> accounts -> customers)
-- Measures exact actual time (start_ms..end_ms), row counts, and nested loops.
EXPLAIN ANALYZE
SELECT 
    t.txn_id,
    t.acc_no,
    t.amount,
    t.txn_type,
    t.txn_date,
    a.acc_type,
    a.balance,
    c.name AS customer_name
FROM transactions t
JOIN accounts a ON t.acc_no = a.acc_no
JOIN customers c ON a.cust_id = c.cust_id
WHERE t.acc_no = 'ACC001' AND t.txn_date >= '2026-01-01 00:00:00'
ORDER BY t.txn_date DESC;

-- Benchmark 2.2: Covering Index Query (Using Index — Pure RAM Scan)
-- Demonstrates zero table-heap lookups because all requested columns (acc_no, balance)
-- reside inside the secondary composite index `idx_accounts_cust_balance`.
EXPLAIN FORMAT=JSON
SELECT cust_id, balance
FROM accounts
WHERE cust_id = 'CUST001' AND balance >= 10000.00;

-- Benchmark 2.3: Leftmost Prefix Rule Violation Comparison
-- Demonstrates cost penalty when the leading column of a composite index is omitted.
EXPLAIN ANALYZE
SELECT txn_id, acc_no, amount, txn_date
FROM transactions
WHERE txn_date BETWEEN '2026-01-01' AND '2026-12-31';


-- ============================================================================
-- SECTION 3: INNODB BUFFER POOL METRICS & HEALTH INSPECTION
-- ============================================================================

-- Query 3.1: Raw Buffer Pool Read Requests (RAM) vs Physical Disk Reads
SELECT 
    VARIABLE_NAME, 
    VARIABLE_VALUE
FROM performance_schema.global_status
WHERE VARIABLE_NAME IN (
    'Innodb_buffer_pool_read_requests',
    'Innodb_buffer_pool_reads',
    'Innodb_buffer_pool_pages_total',
    'Innodb_buffer_pool_pages_data',
    'Innodb_buffer_pool_pages_free',
    'Innodb_buffer_pool_pages_dirty',
    'Innodb_buffer_pool_pages_flushed'
);

-- Query 3.2: Computed Real-Time Buffer Pool Hit Ratio
SELECT 
    req.VARIABLE_VALUE AS logical_read_requests,
    disk.VARIABLE_VALUE AS physical_disk_reads,
    ROUND(
        (CAST(req.VARIABLE_VALUE AS DECIMAL(20,2)) / 
        (CAST(req.VARIABLE_VALUE AS DECIMAL(20,2)) + CAST(disk.VARIABLE_VALUE AS DECIMAL(20,2)))) * 100, 
        2
    ) AS buffer_pool_hit_ratio_percent,
    CASE 
        WHEN (CAST(req.VARIABLE_VALUE AS DECIMAL(20,2)) / (CAST(req.VARIABLE_VALUE AS DECIMAL(20,2)) + CAST(disk.VARIABLE_VALUE AS DECIMAL(20,2)))) >= 0.99 
        THEN 'OPTIMAL (Production Grade >= 99%)'
        ELSE 'SUB_OPTIMAL (Requires Buffer Pool Memory Increase)'
    END AS cache_health_assessment
FROM performance_schema.global_status req
JOIN performance_schema.global_status disk 
    ON disk.VARIABLE_NAME = 'Innodb_buffer_pool_reads'
WHERE req.VARIABLE_NAME = 'Innodb_buffer_pool_read_requests';

-- Query 3.3: Storage Engine Page Size & Free Memory
SELECT 
    @@innodb_page_size AS page_size_bytes,
    ROUND(@@innodb_buffer_pool_size / (1024 * 1024), 2) AS buffer_pool_size_mb,
    @@innodb_buffer_pool_instances AS buffer_pool_instances;


-- ============================================================================
-- SECTION 4: TABLE STATISTICS REFRESH & DEFRAGMENTATION
-- ============================================================================

-- Query 4.1: Refresh Optimizer Statistics (Samples B+ Tree Pages)
ANALYZE TABLE accounts, transactions, customers, fixed_deposits;

-- Query 4.2: Inspect Recorded Index Cardinality Statistics
SELECT 
    table_name,
    index_name,
    stat_name,
    stat_value,
    sample_size,
    stat_description
FROM mysql.innodb_index_stats
WHERE database_name = 'asr_banking' AND stat_name = 'n_diff_pfx01'
ORDER BY table_name, index_name;


-- ============================================================================
-- SECTION 5: VIVA VOCE QUESTIONS & MODEL ANSWERS (COLLEGE EVALUATION)
-- ============================================================================
-- Q1: What is EXPLAIN ANALYZE and how does it differ from traditional EXPLAIN?
-- A1: Traditional EXPLAIN only predicts an estimated query execution plan based on catalog
--     statistics without running the query. EXPLAIN ANALYZE executes the query, instrumenting
--     each node of the iterator execution tree with exact CPU timings, actual row counts,
--     loop counts, and filter percentages, revealing real performance bottlenecks.
--
-- Q2: What is the InnoDB Buffer Pool and why is its Hit Ratio critical in banking?
-- A2: The Buffer Pool is an in-memory caching subsystem where InnoDB caches 16KB data and index
--     pages. A high Hit Ratio (> 99%) ensures that 99 out of 100 queries are served from RAM
--     in microseconds rather than suffering millisecond NVMe/SSD physical I/O latency.
--
-- Q3: What is the difference between CPU Cost and I/O Cost in MySQL's Cost-Based Optimizer?
-- A3: - I/O Cost: The computational cost of loading 16KB disk pages into memory (default ~1.0 per page).
--     - CPU Cost: The cost of processing in-memory rows, evaluating WHERE predicates, and sorting (default ~0.1-0.2 per row).
--     The optimizer sums both costs to evaluate candidate execution plans.
--
-- Q4: What does "Using index" mean in an EXPLAIN execution plan?
-- A4: "Using index" signifies a **Covering Index**. The database engine satisfies the entire query
--     (both WHERE filters and SELECT projections) using only the secondary B+ tree index pages,
--     completely avoiding secondary-to-primary key lookups (bookmark lookups) into the clustered index.
--
-- Q5: What is Index Condition Pushdown (ICP) and what EXPLAIN note indicates it?
-- A5: Indicated by "Using index condition". ICP pushes WHERE clause evaluation down into the
--     storage engine level rather than filtering rows in the MySQL server layer, drastically
--     reducing the number of table rows read by the server.
--
-- Q6: What does "Using filesort" mean and why is it dangerous in high-volume tables?
-- A6: "Using filesort" means MySQL could not use an index order to satisfy an `ORDER BY` clause
--     and had to perform an in-memory or disk-based sorting pass (using merge sorts). On large
--     ledger tables, filesort creates heavy CPU and disk I/O spikes.
--
-- Q7: What is the purpose of `ANALYZE TABLE`?
-- A7: `ANALYZE TABLE` recalculates and refreshes index cardinality statistics in `mysql.innodb_index_stats`.
--     Without accurate statistics, the optimizer might incorrectly estimate row counts and choose a
--     full table scan when an index range scan would have been 1000x faster.
--
-- Q8: How does InnoDB maintain clustered index clustering?
-- A8: In InnoDB, table rows are physically organized in leaf nodes of the Primary Key B+ Tree.
--     Queries filtering on the Primary Key retrieve the full row in a single tree traversal ($O(\log N)$).
--
-- Q9: What happens when dirty pages accumulate in the Buffer Pool?
-- A9: A dirty page is a page modified in memory but not yet flushed to disk. InnoDB background threads
--     periodically flush dirty pages to the doublewrite buffer and tablespace files using checkpointing
--     to ensure rapid crash recovery while minimizing disk write write-amplification.
--
-- Q10: Why is index selectivity important for query optimization?
-- A10: Selectivity is the ratio of unique values to total rows ($\frac{\text{Cardinality}}{\text{Total Rows}}$).
--      High-selectivity columns (like `acc_no` or `email`) make excellent indexes because they narrow down
--      the search space to a tiny fraction of rows; low-selectivity columns (like `gender`) are usually
--      ignored by the optimizer in favor of a table scan.
-- ============================================================================
