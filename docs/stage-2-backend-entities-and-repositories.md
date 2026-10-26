# Stage 2: Backend JPA Entities, Repositories & CORS Configuration

**Package Root:** `com.asr.asr_banking_simulator`  
**Framework:** Java 21 / Spring Boot / Spring Data JPA (Hibernate)  
**Git Commit:** `feat(backend): implement jpa entities, repositories and cors configuration`

---

## 1. Overview & Architecture

Stage 2 implemented the Java Object-Relational Mapping (ORM) and data access layers. Every MySQL table from Stage 1 was mapped to a strongly typed JPA entity and Spring Data repository.

```
backend/src/main/java/com/asr/asr_banking_simulator/
├── config/
│   └── CorsConfig.java               ──> Allows Vite (port 5173) to communicate with Spring Boot (port 8080)
├── model/                            ──> 14 JPA Entities + 1 Embeddable Composite Key
└── repository/                       ──> 14 Spring Data JPA Repositories
```

---

## 2. Model Layer (`model/`)

All models were implemented with explicit standard Java getters, setters, and constructors (zero external annotation-processor dependencies like Lombok, guaranteeing cross-platform compilation).

### Special JPA Mappings:
1. **Composite Key for M:N Loan Borrowers (`LoanBorrowerId.java` & `LoanBorrower.java`):**
   * `LoanBorrowerId` implements `Serializable` with `loanId` and `custId`, overriding `equals()` and `hashCode()`.
   * `LoanBorrower` uses `@EmbeddedId` to map the `loan_borrows` table without adding redundant columns to `Loan`.
2. **Column Naming Conventions:**
   * Used `@Column(name = "...")` to map SQL snake_case (e.g. `acc_no`, `loan_type`, `created_at`) to clean Java camelCase attributes (`accNo`, `loanType`, `createdAt`).
3. **Temporal Mapping:**
   * Used `java.time.LocalDate` for calendar dates (`dob`, `openDate`, `dueDate`, `maturityDate`).
   * Used `java.time.LocalDateTime` for timestamps (`txnDate`, `createdAt`).
4. **Monetary Precision:**
   * Used `java.math.BigDecimal` for all monetary attributes (`balance`, `amount`, `salary`, `assets`) to avoid floating-point rounding errors.

---

## 3. Repository Layer (`repository/`)

14 Spring Data `JpaRepository` interfaces providing automated SQL queries:

| Repository Interface | Key Custom Query Methods | Description |
| :--- | :--- | :--- |
| `UserRepository` | `findByUsername(String username)` | Retrieves identity during login. |
| `BranchRepository` | `findByIfscCode(String ifscCode)`, `findByCityIgnoreCase(String city)` | Branch lookup. |
| `EmployeeRepository` | `findByBranchId(String branchId)` | Staff per branch. |
| `CustomerRepository` | `findByUserId(String userId)`, `findByEmail(String email)` | Customer profile retrieval. |
| `AccountRepository` | `findByCustId(String custId)`, `findByStatus(String status)` | Customer accounts and balance queries. |
| `TransactionRepository` | `findByAccNoOrderByTxnDateDesc(String accNo)` | Chronological account statement ledger. |
| `LoanInterestRateRepository` | Standard CRUD (`findById`) | Rate lookup by loan type. |
| `LoanRepository` | `@Query("SELECT l FROM Loan l, LoanBorrower lb WHERE l.loanId = lb.id.loanId AND lb.id.custId = :custId")` | Custom JPQL query retrieving loans through `loan_borrows`. |
| `LoanBorrowerRepository` | `findByIdLoanId(String loanId)`, `findByIdCustId(String custId)` | Borrower junction lookups. |
| `LoanInstallmentRepository` | `findByLoanIdOrderByInstallmentNoAsc(String loanId)` | Amortization schedule. |
| `FixedDepositRepository` | `findByCustId(String custId)` | Customer term deposits. |
| `FdInterestRepository` | `findByFdIdOrderByCalcDateAsc(String fdId)` | Interest payout schedule. |
| `CardRepository` | `findByCustId(String custId)`, `findByAccNo(String accNo)` | Cards owned by customer. |
| `KycRepository` | `findByCustId(String custId)` | Regulatory compliance audit records. |

---

## 4. CORS Configuration (`config/CorsConfig.java`)

Enables cross-origin resource sharing from the React/Vite development server:
* **Allowed Origins:** `http://localhost:5173`, `http://127.0.0.1:5173`
* **Allowed Methods:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
* **Allowed Headers:** `*`
* **Credentials:** Supported (`allowCredentials(true)`)

---

## 5. Verification
* Verified using `./mvnw clean compile`:
  ```
  [INFO] Compiling 31 source files with javac [debug parameters release 21] to target/classes
  [INFO] BUILD SUCCESS
  [INFO] Total time: 2.537 s
  ```
