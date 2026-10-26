package com.asr.asr_banking_simulator.dao;

import com.asr.asr_banking_simulator.dto.AccountTypeSummaryDto;
import com.asr.asr_banking_simulator.dto.CustomerAccountBranchDto;
import com.asr.asr_banking_simulator.dto.CustomerPortfolioSummaryDto;
import com.asr.asr_banking_simulator.model.Account;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * AccountDao — Manual SQL & Standard Java JDBC Implementation
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project):
 * This class directly executes manually written SQL queries using standard Java
 * JDBC (Java Database Connectivity) instead of relying on Spring Data JPA magic
 * or Hibernate query generators.
 *
 * Core Concepts Illustrated:
 * 1. Explicit SQL Statements:
 *    The SQL query is written as a clear, readable string directly in source code.
 *
 * 2. PreparedStatement & SQL Injection Prevention:
 *    We use parameter placeholders ('?') rather than string concatenation.
 *    The database driver pre-compiles the SQL command structure first, and then
 *    binds values separately. Even if an attacker passes input like "' OR '1'='1",
 *    MySQL treats it purely as literal string data, not executable SQL code.
 *
 * 3. Connection Pooling & Resource Management:
 *    We borrow a Connection from the HikariCP pool and use Java's try-with-resources.
 *    This guarantees that Connection, PreparedStatement, and ResultSet are always
 *    closed cleanly, even if an exception occurs.
 *
 * 4. Manual Row Mapping (ResultSet -> Java Object):
 *    We iterate over the ResultSet cursor using rs.next() and explicitly read
 *    each column, demonstrating how database records map to Java objects.
 * ============================================================================
 */
@Repository
public class AccountDao {

    private final DataSource dataSource;

    public AccountDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Retrieves all accounts belonging to a specific customer using explicit SQL.
     *
     * SQL Query:
     *   SELECT acc_no, cust_id, branch_id, acc_type, balance, open_date, status
     *   FROM accounts
     *   WHERE cust_id = ?
     *   ORDER BY acc_no ASC;
     *
     * @param custId The unique customer identifier (e.g., "CUST001")
     * @return List of matching Account objects
     */
    public List<Account> findAccountsByCustomerId(String custId) {
        // 1. Define the SQL query using INNER JOIN to fetch branch details
        String sql = "SELECT a.acc_no, a.cust_id, a.branch_id, a.acc_type, a.balance, a.open_date, a.status, "
                   + "       b.branch_name, b.ifsc_code "
                   + "FROM accounts a "
                   + "INNER JOIN branches b ON a.branch_id = b.branch_id "
                   + "WHERE a.cust_id = ? "
                   + "ORDER BY a.acc_no ASC";

        List<Account> accounts = new ArrayList<>();

        // 2. Try-with-resources guarantees closing of Connection and PreparedStatement
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            // 3. Bind the parameter safely (1-indexed in JDBC)
            ps.setString(1, custId);

            // 4. Execute the query and obtain the ResultSet cursor
            try (ResultSet rs = ps.executeQuery()) {
                // 5. Iterate through returned rows one-by-one
                while (rs.next()) {
                    Account account = mapRowToAccount(rs);
                    accounts.add(account);
                }
            }

        } catch (SQLException e) {
            // Log and wrap in an unchecked exception for clean service-layer handling
            throw new RuntimeException("Database error executing findAccountsByCustomerId: " + e.getMessage(), e);
        }

        return accounts;
    }

    /**
     * Retrieves a single account by its primary key (acc_no) using explicit SQL.
     *
     * SQL Query:
     *   SELECT acc_no, cust_id, branch_id, acc_type, balance, open_date, status
     *   FROM accounts
     *   WHERE acc_no = ?;
     *
     * @param accNo The unique account number (e.g., "ACC001")
     * @return Optional containing the Account if found, or empty if not
     */
    public Optional<Account> findAccountByNumber(String accNo) {
        String sql = "SELECT acc_no, cust_id, branch_id, acc_type, balance, open_date, status "
                   + "FROM accounts "
                   + "WHERE acc_no = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, accNo);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToAccount(rs));
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing findAccountByNumber: " + e.getMessage(), e);
        }

        return Optional.empty();
    }

    /**
     * READ ALL: Retrieves all accounts across all customers.
     */
    public List<Account> findAllAccounts() {
        String sql = "SELECT acc_no, cust_id, branch_id, acc_type, balance, open_date, status "
                   + "FROM accounts ORDER BY acc_no ASC";

        List<Account> accounts = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                accounts.add(mapRowToAccount(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Database error executing findAllAccounts: " + e.getMessage(), e);
        }
        return accounts;
    }

    /**
     * CREATE: Inserts a new account record into the database using explicit SQL.
     *
     * SQL Query:
     *   INSERT INTO accounts (acc_no, cust_id, branch_id, acc_type, balance, open_date, status)
     *   VALUES (?, ?, ?, ?, ?, ?, ?)
     *
     * JDBC Execution:
     *   Uses PreparedStatement.executeUpdate() which returns the affected row count (1 on success).
     */
    public Account insertAccount(Account account) {
        String sql = "INSERT INTO accounts (acc_no, cust_id, branch_id, acc_type, balance, open_date, status) "
                   + "VALUES (?, ?, ?, ?, ?, ?, ?)";

        // Ensure defaults if missing
        if (account.getAccNo() == null || account.getAccNo().isBlank()) {
            account.setAccNo("ACC" + (System.currentTimeMillis() % 100000));
        }
        if (account.getOpenDate() == null) {
            account.setOpenDate(java.time.LocalDate.now());
        }
        if (account.getStatus() == null) {
            account.setStatus("Active");
        }
        if (account.getBalance() == null) {
            account.setBalance(java.math.BigDecimal.ZERO);
        }

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, account.getAccNo());
            ps.setString(2, account.getCustId());
            ps.setString(3, account.getBranchId() != null ? account.getBranchId() : "BR001");
            ps.setString(4, account.getAccType());
            ps.setBigDecimal(5, account.getBalance());
            ps.setDate(6, java.sql.Date.valueOf(account.getOpenDate()));
            ps.setString(7, account.getStatus());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating account failed, no rows affected.");
            }

            return account;

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing insertAccount: " + e.getMessage(), e);
        }
    }

    /**
     * UPDATE: Modifies the status of an existing account.
     *
     * SQL Query:
     *   UPDATE accounts SET status = ? WHERE acc_no = ?
     *
     * @return true if an account was updated, false if the account was not found
     */
    public boolean updateAccountStatus(String accNo, String newStatus) {
        String sql = "UPDATE accounts SET status = ? WHERE acc_no = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newStatus);
            ps.setString(2, accNo);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing updateAccountStatus: " + e.getMessage(), e);
        }
    }

    /**
     * DELETE: Attempts to permanently delete an account.
     *
     * SQL Query:
     *   DELETE FROM accounts WHERE acc_no = ?
     *
     * Demonstrates DBMS Referential Integrity:
     * If the account has child rows in `transactions`, MySQL throws error 1451
     * (SQLIntegrityConstraintViolationException) due to ON DELETE RESTRICT.
     *
     * @return true if deleted, false if account not found
     */
    public boolean deleteAccount(String accNo) {
        String sql = "DELETE FROM accounts WHERE acc_no = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, accNo);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (java.sql.SQLIntegrityConstraintViolationException e) {
            throw new RuntimeException("Cannot delete account " + accNo + 
                    " because related financial records (transactions) exist. Foreign key constraint violated.", e);
        } catch (SQLException e) {
            throw new RuntimeException("Database error executing deleteAccount: " + e.getMessage(), e);
        }
    }

    /**
     * SOFT DELETE: Closes an account without destroying historical transaction records.
     * This is the standard banking practice to preserve auditability.
     */
    public boolean closeAccount(String accNo) {
        return updateAccountStatus(accNo, "Closed");
    }

    /**
     * Helper method to map a single row of the ResultSet into an Account model object.
     * Demonstrates data type mapping between MySQL and Java:
     *   - VARCHAR(30)   -> String
     *   - DECIMAL(15,2) -> java.math.BigDecimal
     *   - DATE          -> java.time.LocalDate
     */
    private Account mapRowToAccount(ResultSet rs) throws SQLException {
        Account account = new Account();
        account.setAccNo(rs.getString("acc_no"));
        account.setCustId(rs.getString("cust_id"));
        account.setBranchId(rs.getString("branch_id"));
        account.setAccType(rs.getString("acc_type"));
        account.setBalance(rs.getBigDecimal("balance"));

        java.sql.Date openDate = rs.getDate("open_date");
        if (openDate != null) {
            account.setOpenDate(openDate.toLocalDate());
        }

        account.setStatus(rs.getString("status"));

        try {
            account.setBranchName(rs.getString("branch_name"));
            account.setIfscCode(rs.getString("ifsc_code"));
        } catch (SQLException ignored) {
            // Optional: Columns might not be in queries that do not join with branches
        }

        return account;
    }

    /**
     * MULTI-TABLE JOIN: 3-Table SQL INNER JOIN across customers, accounts, and branches.
     *
     * SQL Query:
     *   SELECT 
     *       c.cust_id,
     *       c.name AS customer_name,
     *       c.email AS customer_email,
     *       c.phone AS customer_phone,
     *       a.acc_no,
     *       a.acc_type,
     *       a.balance,
     *       a.open_date,
     *       a.status AS account_status,
     *       b.branch_id,
     *       b.branch_name,
     *       b.ifsc_code,
     *       b.city AS branch_city
     *   FROM customers c
     *   INNER JOIN accounts a ON c.cust_id = a.cust_id
     *   INNER JOIN branches b ON a.branch_id = b.branch_id
     *   WHERE c.cust_id = ?
     *   ORDER BY a.acc_no ASC;
     *
     * Educational Concept:
     * Demonstrates joining 3 normalized tables:
     *   customers (1) ──── (N) accounts (N) ──── (1) branches
     */
    public List<CustomerAccountBranchDto> findCustomerAccountsWithBranch(String custId) {
        String sql = "SELECT "
                   + "    c.cust_id, "
                   + "    c.name AS customer_name, "
                   + "    c.email AS customer_email, "
                   + "    c.phone AS customer_phone, "
                   + "    a.acc_no, "
                   + "    a.acc_type, "
                   + "    a.balance, "
                   + "    a.open_date, "
                   + "    a.status AS account_status, "
                   + "    b.branch_id, "
                   + "    b.branch_name, "
                   + "    b.ifsc_code, "
                   + "    b.city AS branch_city "
                   + "FROM customers c "
                   + "INNER JOIN accounts a ON c.cust_id = a.cust_id "
                   + "INNER JOIN branches b ON a.branch_id = b.branch_id "
                   + "WHERE c.cust_id = ? "
                   + "ORDER BY a.acc_no ASC";

        List<CustomerAccountBranchDto> list = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, custId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    CustomerAccountBranchDto dto = new CustomerAccountBranchDto();
                    dto.setCustId(rs.getString("cust_id"));
                    dto.setCustomerName(rs.getString("customer_name"));
                    dto.setCustomerEmail(rs.getString("customer_email"));
                    dto.setCustomerPhone(rs.getString("customer_phone"));

                    dto.setAccNo(rs.getString("acc_no"));
                    dto.setAccType(rs.getString("acc_type"));
                    dto.setBalance(rs.getBigDecimal("balance"));
                    java.sql.Date openDate = rs.getDate("open_date");
                    if (openDate != null) {
                        dto.setOpenDate(openDate.toLocalDate());
                    }
                    dto.setAccountStatus(rs.getString("account_status"));

                    dto.setBranchId(rs.getString("branch_id"));
                    dto.setBranchName(rs.getString("branch_name"));
                    dto.setIfscCode(rs.getString("ifsc_code"));
                    dto.setBranchCity(rs.getString("branch_city"));

                    list.add(dto);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing findCustomerAccountsWithBranch: " + e.getMessage(), e);
        }

        return list;
    }

    /**
     * STAGE 4: AGGREGATE QUERY WITH GROUP BY
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Computes summary metrics grouped by account type (Savings vs Current):
     *   - COUNT(*) accounts
     *   - SUM(balance) total deposits
     *   - AVG(balance) average balance
     *   - MIN(balance) / MAX(balance)
     *
     * Relational Algebra:
     *   γ_{acc_type}, COUNT(*), SUM(balance), AVG(balance), MIN(balance), MAX(balance)(σ_{status='Active'}(accounts))
     * ============================================================================
     */
    public List<AccountTypeSummaryDto> getAccountTypeSummary() {
        String sql = "SELECT "
                   + "    acc_type, "
                   + "    COUNT(*) AS account_count, "
                   + "    SUM(balance) AS total_balance, "
                   + "    ROUND(AVG(balance), 2) AS avg_balance, "
                   + "    MIN(balance) AS min_balance, "
                   + "    MAX(balance) AS max_balance "
                   + "FROM accounts "
                   + "WHERE status = 'Active' "
                   + "GROUP BY acc_type "
                   + "ORDER BY total_balance DESC";

        List<AccountTypeSummaryDto> list = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                AccountTypeSummaryDto dto = new AccountTypeSummaryDto();
                dto.setAccType(rs.getString("acc_type"));
                dto.setAccountCount(rs.getLong("account_count"));
                dto.setTotalBalance(rs.getBigDecimal("total_balance"));
                dto.setAvgBalance(rs.getBigDecimal("avg_balance"));
                dto.setMinBalance(rs.getBigDecimal("min_balance"));
                dto.setMaxBalance(rs.getBigDecimal("max_balance"));
                list.add(dto);
            }

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing getAccountTypeSummary: " + e.getMessage(), e);
        }

        return list;
    }

    /**
     * STAGE 4: JOIN + GROUP BY + COALESCE
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Aggregates a specific customer's accounts to calculate portfolio totals:
     *   - Total count of active accounts
     *   - Cumulative balance
     *   - Average balance
     *
     * Notice:
     *   Uses COALESCE(SUM(a.balance), 0.00) so that if a customer has no active
     *   accounts, MySQL returns 0.00 rather than NULL.
     * ============================================================================
     */
    public Optional<CustomerPortfolioSummaryDto> getCustomerPortfolioSummary(String custId) {
        String sql = "SELECT "
                   + "    c.cust_id, "
                   + "    c.name AS customer_name, "
                   + "    COUNT(a.acc_no) AS total_accounts, "
                   + "    COALESCE(SUM(a.balance), 0.00) AS total_portfolio_balance, "
                   + "    ROUND(COALESCE(AVG(a.balance), 0.00), 2) AS avg_account_balance "
                   + "FROM customers c "
                   + "LEFT JOIN accounts a ON c.cust_id = a.cust_id AND a.status = 'Active' "
                   + "WHERE c.cust_id = ? "
                   + "GROUP BY c.cust_id, c.name";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, custId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    CustomerPortfolioSummaryDto dto = new CustomerPortfolioSummaryDto();
                    dto.setCustId(rs.getString("cust_id"));
                    dto.setCustomerName(rs.getString("customer_name"));
                    dto.setTotalAccounts(rs.getInt("total_accounts"));
                    dto.setTotalBalance(rs.getBigDecimal("total_portfolio_balance"));
                    dto.setAvgBalance(rs.getBigDecimal("avg_account_balance"));
                    return Optional.of(dto);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing getCustomerPortfolioSummary: " + e.getMessage(), e);
        }

        return Optional.empty();
    }
}
