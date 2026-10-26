package com.asr.asr_banking_simulator.controller;

import com.asr.asr_banking_simulator.dao.AccountDao;
import com.asr.asr_banking_simulator.dto.RolePrivilegeDto;
import com.asr.asr_banking_simulator.dto.SqlInjectionDemoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * SecurityController — Database Security, RBAC & SQL Injection Benchmarks
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 13):
 * Demonstrates:
 * 1. Side-by-side SQL Injection vulnerability vs PreparedStatement parameter binding defense.
 * 2. Role-Based Access Control (RBAC) grants in the database catalog.
 * ============================================================================
 */
@RestController
@RequestMapping("/api/security")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class SecurityController {

    private final AccountDao accountDao;

    public SecurityController(AccountDao accountDao) {
        this.accountDao = accountDao;
    }

    /**
     * STAGE 13: SQL INJECTION VULNERABILITY VS. DEFENSE BENCHMARK
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Compares an unescaped dynamic SQL query against a parameterized PreparedStatement
     * using the attacker's payload (e.g. `' OR '1'='1`).
     * ============================================================================
     */
    @GetMapping("/sql-injection-benchmark")
    public ResponseEntity<?> benchmarkSqlInjection(
            @RequestParam(defaultValue = "' OR '1'='1") String payload) {

        SqlInjectionDemoDto vulnerableResult = accountDao.simulateSqlInjectionVulnerability(payload);
        SqlInjectionDemoDto secureResult = accountDao.simulatePreparedStatementDefense(payload);

        return ResponseEntity.ok(Map.of(
                "attackerPayload", payload,
                "vulnerableDynamicSqlResult", vulnerableResult,
                "securePreparedStatementResult", secureResult,
                "academicConclusion", "PreparedStatement parameter binding precompiles the SQL syntax tree. "
                        + "The payload is sent separately via the binary protocol, preventing untrusted input from modifying the query grammar."
        ));
    }

    /**
     * STAGE 13: ROLE-BASED ACCESS CONTROL (RBAC) CATALOG AUDIT
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Exposes active table-level grants assigned to database roles from
     * information_schema.TABLE_PRIVILEGES, proving the Principle of Least Privilege.
     * ============================================================================
     */
    @GetMapping("/roles-catalog")
    public ResponseEntity<List<RolePrivilegeDto>> getActiveRolePrivileges() {
        return ResponseEntity.ok(accountDao.findActiveRolePrivileges());
    }
}
