# Stage 1: Relational Database Schema & Seed Data

**File Implemented:** `database/Initialize.sql`  
**Target RDBMS:** MySQL 8.0+  
**Git Commit:** `feat(db): define banking schema and seed data`

---

## 1. Overview & Architectural Decisions

Stage 1 established the authoritative relational database foundation for ASR Bank. Based on the team's handwritten ER diagram and schema audit, 14 normalized tables were defined in strict foreign-key dependency order.

### Core Design Rules Applied:
1. **Authoritative Loan-to-Borrower Relationship:**
   * The `loans` table **does not** contain a redundant `cust_id` column.
   * All borrower linkages are managed authoritatively via the `loan_borrows` junction table with a composite primary key `(loan_id, cust_id)`.
   * This cleanly supports single borrowers as well as joint facilities (co-borrowers) without duplicating loan records.
2. **Circular Dependency Resolution (`branches` $\leftrightarrow$ `employees`):**
   * `branches` has an optional `manager_id` foreign key referencing `employees(emp_id)`.
   * `employees` has a mandatory `branch_id` foreign key referencing `branches(branch_id)`.
   * **Resolution:** `branches` is created with a nullable `manager_id`; `employees` is created referencing `branches`; then an `ALTER TABLE branches ADD CONSTRAINT fk_branches_manager` is applied with `ON DELETE SET NULL`.
3. **Preservation of Banking History (`ON DELETE RESTRICT`):**
   * Accounts, transactions, loans, installments, and KYC records use `ON DELETE RESTRICT` to ensure financial ledger integrity. Financial history cannot be wiped out by deleting parent records.
   * `cards.acc_no` uses `ON DELETE SET NULL` so closing a bank account unlinks the card without destroying the card issuance record.
4. **Derived Attributes & Data Security:**
   * **Age:** Derived dynamically from `dob` in `customers`.
   * **Passwords:** Fictional salted BCrypt hashes (e.g. for demo password `demo123`).
   * **Aadhaar & CVV:** Masked (`XXXX-XXXX-9012` and tokenized `***`).

---

## 2. Table Specifications (14 Tables)

| # | Table Name | Primary Key | Foreign Key References | Deletion Policy | Description |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `users` | `user_id` | *None* | `RESTRICT` | User login credentials, roles (`Customer`, `Employee`, `Manager`, `Admin`), status. |
| 2 | `branches` | `branch_id` | `manager_id` $\rightarrow$ `employees(emp_id)` | `SET NULL` | Flagship & regional banking branches, IFSC codes, total assets. |
| 3 | `employees` | `emp_id` | `branch_id` $\rightarrow$ `branches(branch_id)` | `RESTRICT` | Bank staff, designations, branch allocation, salaries. |
| 4 | `customers` | `cust_id` | `user_id` $\rightarrow$ `users(user_id)`<br>`branch_id` $\rightarrow$ `branches(branch_id)` | `RESTRICT`<br>`RESTRICT` | Master customer demographics, DOB, phone, address, masked Aadhaar and PAN. |
| 5 | `accounts` | `acc_no` | `cust_id` $\rightarrow$ `customers(cust_id)`<br>`branch_id` $\rightarrow$ `branches(branch_id)` | `RESTRICT`<br>`RESTRICT` | Savings and Current accounts, ledger balances, opening date, status. |
| 6 | `transactions`| `txn_id` | `acc_no` $\rightarrow$ `accounts(acc_no)` | `RESTRICT` | Financial journal (Credit/Debit), channels (UPI, NEFT, IMPS), timestamps, unique ref numbers. |
| 7 | `loan_interest_rates` | `loan_type` | *None* | `RESTRICT` | Benchmark interest rates catalog by loan category (Personal, Vehicle, Home, Education). |
| 8 | `loans` | `loan_id` | `branch_id` $\rightarrow$ `branches(branch_id)`<br>`loan_type` $\rightarrow$ `loan_interest_rates(loan_type)` | `RESTRICT`<br>`RESTRICT` | Sanctioned loans, amounts, tenure, sanctioned rate, issue dates. *(No `cust_id`)* |
| 9 | `loan_borrows`| `(loan_id, cust_id)` | `loan_id` $\rightarrow$ `loans(loan_id)`<br>`cust_id` $\rightarrow$ `customers(cust_id)` | `RESTRICT`<br>`RESTRICT` | M:N junction table connecting loans to primary and co-borrowers. |
| 10 | `loan_installments` | `installment_id` | `loan_id` $\rightarrow$ `loans(loan_id)` | `RESTRICT` | Amortization schedule (EMIs), due dates, paid dates, status (`Paid`, `Pending`). |
| 11 | `fixed_deposits` | `fd_id` | `cust_id` $\rightarrow$ `customers(cust_id)`<br>`branch_id` $\rightarrow$ `branches(branch_id)` | `RESTRICT`<br>`RESTRICT` | Term deposits, principal amount, duration, interest rate, maturity date. |
| 12 | `fd_interest` | `interest_id` | `fd_id` $\rightarrow$ `fixed_deposits(fd_id)` | `RESTRICT` | Quarterly interest accrual schedule and payout statuses. |
| 13 | `cards` | `card_no` | `cust_id` $\rightarrow$ `customers(cust_id)`<br>`acc_no` $\rightarrow$ `accounts(acc_no)` *(nullable)* | `RESTRICT`<br>`SET NULL` | Debit and Credit cards, expiry dates, tokenized CVV mask, status (`Active`, `Blocked`). |
| 14 | `kyc` | `kyc_id` | `cust_id` $\rightarrow$ `customers(cust_id)` | `RESTRICT` | PMLA regulatory verification documents (Aadhaar, PAN), verifier, verification date. |

---

## 3. Seed Data Summary

* **2 Branches:** Pune FC Road (`BR001`), Mumbai Fort (`BR002`).
* **4 Employees:** 2 Branch Managers (`EMP001`, `EMP003`), Accountant (`EMP002`), Compliance Officer (`EMP004`).
* **4 Users:** Demo user `suraj_w` (`USR001`), `anita_s` (`USR002`), plus managerial identities.
* **2 Customers:** `CUST001` (Suraj Walke), `CUST002` (Anita Shinde).
* **3 Accounts:** `ACC001` (Savings, ₹45,000.50), `ACC002` (Current, ₹1,20,000.00), `ACC003` (Savings, ₹68,500.00).
* **10 Transactions:** Real-world payment entries across UPI, NEFT, and IMPS.
* **2 Loans & 3 Borrowers:** `LN001` (Personal, single borrower), `LN002` (Vehicle, joint facility with `CUST001` as Primary and `CUST002` as Co-Borrower).
* **7 Loan Installments:** Scheduled EMIs with paid and pending records.
* **2 Fixed Deposits & 4 Interest Records:** Term deposit accruals.
* **3 Cards & 3 KYC Records:** Multi-card portfolio and compliance audit trails.
