# Stage 5: Complete Interactive Features & Live Database Transactions

**Branch:** `dev-rutuja`  
**Components Covered:** Frontend Service Layer $\leftrightarrow$ Spring Boot REST API $\leftrightarrow$ MySQL Relational Storage (`fixed_deposits`, `fd_interest`, `loan_installments`, `transactions`, `accounts`)

---

## 1. Overview & Objective

In **Stage 4**, we completed the baseline live integration, connecting MySQL credentials, CORS security, NetBanking authentication, and debit card security management.

In **Stage 5**, we eliminated all remaining simulated client-side timeouts and placeholders, ensuring 100% of interactive user actions persist directly to MySQL tables with atomic transaction guarantees and check constraint compliance.

---

## 2. Interactive Features Implemented

### A. Live Loan EMI Repayment
* **User Workflow:** Customer views active credit facilities in `/dashboard/loans`, expands the amortization schedule for a loan (e.g., `#LN001`), and clicks **"Pay EMI"** on a pending scheduled installment.
* **REST API Endpoint:**
  ```http
  POST /api/loans/{loanId}/installments/{installmentId}/pay
  ```
* **Database Ledger Updates:**
  - Updates `loan_installments.status = 'Paid'`
  - Sets `loan_installments.paid_on = CURDATE()`
  - Enforces constraint: `chk_installments_status CHECK (status IN ('Paid', 'Pending', 'Overdue'))`
* **Source Files Updated:**
  - `frontend/src/pages/dashboard/LoansPage.jsx`
  - `frontend/src/services/loanInstallmentService.js`
  - `backend/src/main/java/com/asr/asr_banking_simulator/controller/LoanController.java`

---

### B. Overview Page Quick Transfer (Atomic DB Commit)
* **User Workflow:** From the primary dashboard overview (`/dashboard`), the customer initiates an instant UPI/IMPS fund transfer.
* **REST API Endpoint:**
  ```http
  POST /api/transactions/transfer
  Content-Type: application/json

  {
    "fromAccNo": "ACC001",
    "toAccNo": "ACC002",
    "amount": 1000.00,
    "channel": "UPI",
    "description": "Fund Transfer to 9876543210@upi",
    "beneficiary": "9876543210@upi"
  }
  ```
* **Database Ledger Updates:**
  - `@Transactional` atomic execution in Spring Boot
  - Decrements sender balance in `accounts`
  - Increments recipient balance in `accounts`
  - Inserts debit and credit entries in `transactions`
  - Live state reload dynamically refreshes dashboard balance and recent transaction history without a full browser reload.
* **Source Files Updated:**
  - `frontend/src/pages/dashboard/OverviewPage.jsx`
  - `frontend/src/services/transactionService.js`

---

### C. Fixed Deposit (FD) Booking & Automatic Interest Accrual
* **User Workflow:** Customer navigates to `/dashboard/fd`, clicks **"Open New Deposit"**, inputs deposit amount (minimum ₹5,000) and tenure (6, 12, 24, or 36 months).
* **REST API Endpoint:**
  ```http
  POST /api/fds
  Content-Type: application/json

  {
    "custId": "CUST001",
    "branchId": "BR001",
    "amount": 25000.00,
    "interestRate": 7.20,
    "durationMonths": 12
  }
  ```
* **Database Relational Integrity:**
  - Auto-generates unique sequential contract ID: `FD00X` (e.g., `FD004`, `FD005`).
  - Sets `start_date = CURDATE()` and `maturity_date = start_date + durationMonths`.
  - Inserts term deposit row in `fixed_deposits`.
  - Automatically calculates projected yield:
    $$\text{Projected Interest} = \text{Amount} \times \left(\frac{\text{Rate}}{100}\right) \times \left(\frac{\text{Months}}{12}\right)$$
  - Inserts corresponding child record in `fd_interest` table (`FDI00X`) with status `'Pending'`, adhering strictly to constraint `chk_fd_interest_status CHECK (status IN ('Credited', 'Pending', 'Forfeited'))`.
* **Source Files Updated:**
  - `backend/src/main/java/com/asr/asr_banking_simulator/controller/FdController.java`
  - `frontend/src/services/fdService.js`
  - `frontend/src/pages/dashboard/FDPage.jsx`

---

## 3. Database Verification Results

### Direct MySQL CLI Verification (`asr_banking`):
```sql
SELECT fd_id, cust_id, amount, interest_rate, duration_months, status FROM fixed_deposits;
SELECT interest_id, fd_id, interest_amount, status FROM fd_interest;
SELECT installment_id, loan_id, installment_no, amount, paid_on, status FROM loan_installments WHERE loan_id='LN001';
```

**Output:**
```
+-------+---------+-----------+---------------+-----------------+--------+
| fd_id | cust_id | amount    | interest_rate | duration_months | status |
+-------+---------+-----------+---------------+-----------------+--------+
| FD001 | CUST001 | 100000.00 |          7.20 |              12 | Active |
| FD002 | CUST001 | 250000.00 |          7.50 |              36 | Active |
| FD003 | CUST001 |  50000.00 |          7.20 |              12 | Active |
| FD004 | CUST001 |  50000.00 |          7.20 |              12 | Active |
| FD005 | CUST001 |  25000.00 |          7.20 |              12 | Active |
+-------+---------+-----------+---------------+-----------------+--------+

+-------------+-------+-----------------+----------+
| interest_id | fd_id | interest_amount | status   |
+-------------+-------+-----------------+----------+
| FDI005      | FD004 |         3600.00 | Pending  |
| FDI006      | FD005 |         1800.00 | Pending  |
| INT001      | FD001 |         7200.00 | Pending  |
| INT101      | FD002 |         9375.00 | Credited |
| INT102      | FD002 |         9375.00 | Credited |
| INT103      | FD002 |         9375.00 | Pending  |
+-------------+-------+-----------------+----------+

+----------------+---------+----------------+---------+------------+--------+
| installment_id | loan_id | installment_no | amount  | paid_on    | status |
+----------------+---------+----------------+---------+------------+--------+
| INST001        | LN001   |              1 | 9500.00 | 2025-01-30 | Paid   |
| INST002        | LN001   |              2 | 9500.00 | 2025-02-28 | Paid   |
| INST003        | LN001   |              3 | 9500.00 | 2026-10-26 | Paid   |
| INST004        | LN001   |              4 | 9500.00 | 2026-10-26 | Paid   |
+----------------+---------+----------------+---------+------------+--------+
```

---

## 4. Key Academic & Viva Takeaways

1. **Transactional Integrity (`@Transactional`):**
   * Multi-table writes (debit sender, credit receiver, record transactions) are treated as an atomic unit of work (ACID properties). A database crash midway ensures total rollback rather than orphaned funds.
2. **Referential Integrity & Cascading:**
   * `fixed_deposits` (parent) and `fd_interest` (child) are linked by `fk_fd_interest_parent` with `ON DELETE RESTRICT` to prevent tampering with historical interest accruals.
3. **M:N Junction Table Querying (`loan_borrows`):**
   * As proved in Stage 1 & 2, customer loans are retrieved through the normalized junction table `loan_borrows` without redundancy, preventing data update anomalies.
