package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dao.AccountDao;
import com.asr.asr_banking_simulator.dto.BufferPoolMetricsDto;
import com.asr.asr_banking_simulator.dto.QueryExplainPlanDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * PerformanceController — Database Query Tuning, EXPLAIN ANALYZE & Buffer Pool Profiling
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 14):
 * Exposes live database engine health metrics:
 * 1. InnoDB Buffer Pool Cache Hit Ratio and Memory Utilization.
 * 2. Modern MySQL 8+ EXPLAIN ANALYZE execution tree for relational join queries.
 * ============================================================================
 */
@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class PerformanceController {

    private final AccountDao accountDao;

    public PerformanceController(AccountDao accountDao) {
        this.accountDao = accountDao;
    }

    /**
     * STAGE 14: INNODB BUFFER POOL HEALTH & CACHE HIT RATIO
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Retrieves memory page statistics from performance_schema / global status
     * to compute the live Buffer Pool Hit Ratio proving RAM caching efficiency.
     * ============================================================================
     */
    @GetMapping("/buffer-pool-metrics")
    public ResponseEntity<BufferPoolMetricsDto> getBufferPoolMetrics() {
        return ResponseEntity.ok(accountDao.getBufferPoolMetrics());
    }

    /**
     * STAGE 14: EXPLAIN ANALYZE PROFILING REPORT
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Instruments and executes a 3-table join query, returning actual execution
     * time (ms), row counts, and iterator trees from MySQL's Cost-Based Optimizer.
     * ============================================================================
     */
    @GetMapping("/explain-analyze")
    public ResponseEntity<QueryExplainPlanDto> getExplainAnalyzeReport(
            @RequestParam(defaultValue = "ACC001") String accNo) {
        return ResponseEntity.ok(accountDao.explainTransactionStatementQuery(accNo));
    }
}
