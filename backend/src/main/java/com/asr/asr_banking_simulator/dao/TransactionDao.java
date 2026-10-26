package com.asr.asr_banking_simulator.dao;

import com.asr.asr_banking_simulator.dto.ProcedureTransferResultDto;
import com.asr.asr_banking_simulator.dto.TransferRequest;
import com.asr.asr_banking_simulator.model.Transaction;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * TransactionDao — Manual SQL & Atomic JDBC Transaction Management
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 6):
 * This class demonstrates canonical ACID transaction management in pure Java JDBC
 * without relying on Spring's declarative @Transactional proxy magic.
 *
 * DBMS Concepts Illustrated:
 * 1. Atomicity & Explicit Control:
 *    We disable auto-commit via conn.setAutoCommit(false). Multiple updates
 *    (debit sender, credit receiver, insert audit logs) succeed or fail as a
 *    single atomic block.
 *
 * 2. Pessimistic Concurrency Control (SELECT ... FOR UPDATE):
 *    We acquire an exclusive row lock on the sender account to prevent race
 *    conditions (lost updates or double spending) during concurrent transactions.
 *
 * 3. Manual Rollback on Invariant Failure:
 *    If funds are insufficient or any SQL statement throws an exception,
 *    conn.rollback() is invoked to revert all partial database modifications.
 *
 * 4. Resource & State Safety:
 *    conn.setAutoCommit(true) is strictly restored in the finally block before
 *    the connection is returned to the HikariCP pool.
 * ============================================================================
 */
@Repository
public class TransactionDao {

    private final DataSource dataSource;

    public TransactionDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Executes a complete two-legged bank fund transfer under ACID guarantees.
     *
     * @param request Transfer parameters (fromAccNo, toAccNo, amount, channel, description)
     * @return The created Debit Transaction audit record
     * @throws SQLException If database access fails
     * @throws IllegalArgumentException If business validation invariants fail
     */
    public Transaction transferFundsWithAcid(TransferRequest request) throws SQLException {
        if (request.getFromAccNo() == null || request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid transfer parameters: non-positive or null amount.");
        }

        Connection conn = null;
        try {
            conn = dataSource.getConnection();

            // 1. DISABLE AUTOCOMMIT — Begin Transaction Block
            conn.setAutoCommit(false);
            conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);

            // 2. STEP 1: PESSIMISTIC LOCK on sender account (SELECT ... FOR UPDATE)
            String lockSql = "SELECT balance, status FROM accounts WHERE acc_no = ? FOR UPDATE";
            BigDecimal currentBalance;
            String accountStatus;

            try (PreparedStatement psLock = conn.prepareStatement(lockSql)) {
                psLock.setString(1, request.getFromAccNo());
                try (ResultSet rs = psLock.executeQuery()) {
                    if (!rs.next()) {
                        throw new IllegalArgumentException("Source account " + request.getFromAccNo() + " not found.");
                    }
                    currentBalance = rs.getBigDecimal("balance");
                    accountStatus = rs.getString("status");
                }
            }

            // 3. INVARIANT CHECKS: Active account & Sufficient Liquidity
            if (!"Active".equalsIgnoreCase(accountStatus)) {
                throw new IllegalStateException("Source account " + request.getFromAccNo() + " is " + accountStatus + " (transfers disallowed).");
            }

            if (currentBalance.compareTo(request.getAmount()) < 0) {
                throw new IllegalArgumentException("Insufficient funds: Current balance ₹" + currentBalance + " is less than transfer amount ₹" + request.getAmount() + ".");
            }

            // 4. STEP 2: DEBIT SENDER ACCOUNT
            String debitSql = "UPDATE accounts SET balance = balance - ? WHERE acc_no = ?";
            try (PreparedStatement psDebit = conn.prepareStatement(debitSql)) {
                psDebit.setBigDecimal(1, request.getAmount());
                psDebit.setString(2, request.getFromAccNo());
                psDebit.executeUpdate();
            }

            // 5. STEP 3: CREDIT RECEIVER ACCOUNT (If destination account exists)
            boolean internalCredit = false;
            if (request.getToAccNo() != null && !request.getToAccNo().isBlank()) {
                String creditSql = "UPDATE accounts SET balance = balance + ? WHERE acc_no = ?";
                try (PreparedStatement psCredit = conn.prepareStatement(creditSql)) {
                    psCredit.setBigDecimal(1, request.getAmount());
                    psCredit.setString(2, request.getToAccNo());
                    int rows = psCredit.executeUpdate();
                    if (rows > 0) {
                        internalCredit = true;
                    }
                }
            }

            // 6. STEP 4: INSERT DEBIT TRANSACTION AUDIT TRAIL
            String txnId = "TXN" + System.currentTimeMillis();
            String refNo = (request.getChannel() != null ? request.getChannel() : "UPI") + "/"
                         + LocalDateTime.now().getYear() + "/"
                         + String.format("%04d", (int)(Math.random() * 10000));

            String desc = (request.getDescription() != null && !request.getDescription().isBlank())
                        ? request.getDescription()
                        : "Transfer to " + (request.getBeneficiary() != null ? request.getBeneficiary() : request.getToAccNo());

            LocalDateTime now = LocalDateTime.now();

            String insertTxnSql = "INSERT INTO transactions (txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description) "
                                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            try (PreparedStatement psTxn = conn.prepareStatement(insertTxnSql)) {
                psTxn.setString(1, txnId);
                psTxn.setString(2, request.getFromAccNo());
                psTxn.setString(3, "Debit");
                psTxn.setBigDecimal(4, request.getAmount());
                psTxn.setTimestamp(5, Timestamp.valueOf(now));
                psTxn.setString(6, request.getChannel() != null ? request.getChannel() : "UPI");
                psTxn.setString(7, "Success");
                psTxn.setString(8, refNo);
                psTxn.setString(9, desc);
                psTxn.executeUpdate();
            }

            // 7. STEP 5: INSERT CREDIT TRANSACTION AUDIT TRAIL (For internal destination)
            if (internalCredit) {
                try (PreparedStatement psCrTxn = conn.prepareStatement(insertTxnSql)) {
                    psCrTxn.setString(1, "TXN" + (System.currentTimeMillis() + 1));
                    psCrTxn.setString(2, request.getToAccNo());
                    psCrTxn.setString(3, "Credit");
                    psCrTxn.setBigDecimal(4, request.getAmount());
                    psCrTxn.setTimestamp(5, Timestamp.valueOf(now));
                    psCrTxn.setString(6, request.getChannel() != null ? request.getChannel() : "UPI");
                    psCrTxn.setString(7, "Success");
                    psCrTxn.setString(8, refNo + "-CR");
                    psCrTxn.setString(9, "Transfer received from " + request.getFromAccNo());
                    psCrTxn.executeUpdate();
                }
            }

            // 8. ATOMIC COMMIT — All database changes become permanent simultaneously!
            conn.commit();

            return new Transaction(txnId, request.getFromAccNo(), "Debit", request.getAmount(), now,
                                   request.getChannel() != null ? request.getChannel() : "UPI",
                                   "Success", refNo, desc);

        } catch (Exception e) {
            // 9. ROLLBACK ON FAILURE — Restores previous consistent state
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            if (e instanceof IllegalArgumentException) {
                throw (IllegalArgumentException) e;
            } else if (e instanceof IllegalStateException) {
                throw (IllegalStateException) e;
            } else if (e instanceof SQLException) {
                throw (SQLException) e;
            } else {
                throw new RuntimeException("Unexpected transaction error: " + e.getMessage(), e);
            }
        } finally {
            // 10. RESTORE AUTOCOMMIT & RETURN CONNECTION TO POOL
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * Retrieves all transactions for an account using manual SQL.
     */
    public List<Transaction> findTransactionsByAccount(String accNo) {
        String sql = "SELECT txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description "
                   + "FROM transactions "
                   + "WHERE acc_no = ? "
                   + "ORDER BY txn_date DESC";

        List<Transaction> list = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, accNo);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Transaction txn = new Transaction();
                    txn.setTxnId(rs.getString("txn_id"));
                    txn.setAccNo(rs.getString("acc_no"));
                    txn.setTxnType(rs.getString("txn_type"));
                    txn.setAmount(rs.getBigDecimal("amount"));
                    Timestamp ts = rs.getTimestamp("txn_date");
                    if (ts != null) {
                        txn.setTxnDate(ts.toLocalDateTime());
                    }
                    txn.setChannel(rs.getString("channel"));
                    txn.setStatus(rs.getString("status"));
                    txn.setRefNo(rs.getString("ref_no"));
                    txn.setDescription(rs.getString("description"));
                    list.add(txn);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing findTransactionsByAccount: " + e.getMessage(), e);
        }

        return list;
    }

    /**
     * STAGE 9: INDEX-OPTIMIZED RANGE QUERY (Composite B+ Tree Index)
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * Retrieves transactions for an account within a date interval.
     * Uses the composite B+ Tree index `idx_transactions_acc_date (acc_no, txn_date DESC)`
     * to perform an index range scan (type: range) with Index Condition Pushdown (ICP).
     * ============================================================================
     */
    public List<Transaction> findStatementByDateRange(String accNo, LocalDateTime start, LocalDateTime end) {
        String sql = "SELECT txn_id, acc_no, txn_type, amount, txn_date, channel, status, ref_no, description "
                   + "FROM transactions "
                   + "WHERE acc_no = ? AND txn_date BETWEEN ? AND ? "
                   + "ORDER BY txn_date DESC";

        List<Transaction> list = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, accNo);
            ps.setTimestamp(2, Timestamp.valueOf(start));
            ps.setTimestamp(3, Timestamp.valueOf(end));

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Transaction txn = new Transaction();
                    txn.setTxnId(rs.getString("txn_id"));
                    txn.setAccNo(rs.getString("acc_no"));
                    txn.setTxnType(rs.getString("txn_type"));
                    txn.setAmount(rs.getBigDecimal("amount"));
                    Timestamp ts = rs.getTimestamp("txn_date");
                    if (ts != null) {
                        txn.setTxnDate(ts.toLocalDateTime());
                    }
                    txn.setChannel(rs.getString("channel"));
                    txn.setStatus(rs.getString("status"));
                    txn.setRefNo(rs.getString("ref_no"));
                    txn.setDescription(rs.getString("description"));
                    list.add(txn);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing findStatementByDateRange: " + e.getMessage(), e);
        }

        return list;
    }

    /**
     * STAGE 10: STORED PROCEDURE EXECUTION VIA JDBC CallableStatement
     * ============================================================================
     * Educational Purpose (DBMS Mini-Project):
     * This method invokes the MySQL stored procedure `sp_execute_interbank_transfer`
     * using standard JDBC java.sql.CallableStatement.
     *
     * Core Concepts Illustrated:
     * 1. CallableStatement vs PreparedStatement:
     *    CallableStatement is an extension of PreparedStatement specifically designed
     *    for calling database stored procedures using SQL92 escape syntax:
     *    `{CALL procedure_name(?, ?, ...)}`.
     *
     * 2. IN vs OUT Parameters:
     *    - Parameters 1-4 are IN parameters (sender, receiver, amount, channel) set via cs.setXXX().
     *    - Parameters 5-7 are OUT parameters (statusCode, statusMessage, txnRef) registered
     *      via cs.registerOutParameter(index, java.sql.Types.VARCHAR).
     *
     * 3. Autonomous In-Engine ACID Management:
     *    Unlike Stage 6 (where the Java app orchestrated setAutoCommit(false), row locks,
     *    debit/credit updates, and rollback over multiple TCP network round-trips),
     *    here the database engine itself manages transaction boundaries, locks,
     *    and the SQLEXCEPTION rollback handler in a single network round-trip.
     * ============================================================================
     */
    public ProcedureTransferResultDto executeTransferViaStoredProcedure(TransferRequest request) {
        String callSql = "{CALL sp_execute_interbank_transfer(?, ?, ?, ?, ?, ?, ?)}";

        try (Connection conn = dataSource.getConnection();
             CallableStatement cs = conn.prepareCall(callSql)) {

            // Bind IN parameters (1 to 4)
            cs.setString(1, request.getFromAccNo());
            cs.setString(2, request.getToAccNo());
            cs.setBigDecimal(3, request.getAmount());
            cs.setString(4, request.getChannel() != null ? request.getChannel() : "NETBANKING");

            // Register OUT parameters (5 to 7)
            cs.registerOutParameter(5, Types.VARCHAR);
            cs.registerOutParameter(6, Types.VARCHAR);
            cs.registerOutParameter(7, Types.VARCHAR);

            // Execute the stored procedure
            cs.execute();

            // Read OUT parameters
            String statusCode = cs.getString(5);
            String statusMessage = cs.getString(6);
            String txnRef = cs.getString(7);

            return new ProcedureTransferResultDto(statusCode, statusMessage, txnRef);

        } catch (SQLException e) {
            throw new RuntimeException("Database error executing stored procedure sp_execute_interbank_transfer: " + e.getMessage(), e);
        }
    }
}

