package com.asr.asr_banking_simulator.dto;

import com.asr.asr_banking_simulator.model.Account;
import java.util.List;

/**
 * SqlInjectionDemoDto — Educational Comparison of Dynamic vs Parameterized SQL
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 13):
 * Demonstrates the mechanics of SQL Injection (SQLi) vulnerabilities and how
 * JDBC PreparedStatement parameter binding neutralizes attacks.
 * ============================================================================
 */
public class SqlInjectionDemoDto {

    private String queryType;
    private String executedSql;
    private String inputPayload;
    private int rowsExposed;
    private List<Account> accounts;
    private String vulnerabilityStatus;
    private String explanation;

    public SqlInjectionDemoDto() {
    }

    public SqlInjectionDemoDto(String queryType, String executedSql, String inputPayload,
                               int rowsExposed, List<Account> accounts, String vulnerabilityStatus, String explanation) {
        this.queryType = queryType;
        this.executedSql = executedSql;
        this.inputPayload = inputPayload;
        this.rowsExposed = rowsExposed;
        this.accounts = accounts;
        this.vulnerabilityStatus = vulnerabilityStatus;
        this.explanation = explanation;
    }

    public String getQueryType() {
        return queryType;
    }

    public void setQueryType(String queryType) {
        this.queryType = queryType;
    }

    public String getExecutedSql() {
        return executedSql;
    }

    public void setExecutedSql(String executedSql) {
        this.executedSql = executedSql;
    }

    public String getInputPayload() {
        return inputPayload;
    }

    public void setInputPayload(String inputPayload) {
        this.inputPayload = inputPayload;
    }

    public int getRowsExposed() {
        return rowsExposed;
    }

    public void setRowsExposed(int rowsExposed) {
        this.rowsExposed = rowsExposed;
    }

    public List<Account> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<Account> accounts) {
        this.accounts = accounts;
    }

    public String getVulnerabilityStatus() {
        return vulnerabilityStatus;
    }

    public void setVulnerabilityStatus(String vulnerabilityStatus) {
        this.vulnerabilityStatus = vulnerabilityStatus;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
