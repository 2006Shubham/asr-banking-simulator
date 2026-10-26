# Stage 3: REST Controllers & Business CRUD API

**Package Root:** `com.asr.asr_banking_simulator.controller` & `com.asr.asr_banking_simulator.dto`  
**Framework:** Spring Web MVC (`@RestController`)  
**Compilation Status:** Verified with Maven (`BUILD SUCCESS` — 44 source files compiled)

---

## 1. Overview & Architecture

Stage 3 implemented the HTTP API endpoints connecting frontend service calls directly to MySQL database transactions. 

```
backend/src/main/java/com/asr/asr_banking_simulator/
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── TransferRequest.java
│   └── StatusUpdateRequest.java
└── controller/
    ├── AuthController.java
    ├── CustomerController.java
    ├── AccountController.java
    ├── TransactionController.java
    ├── LoanController.java
    ├── FdController.java
    ├── CardController.java
    ├── BranchController.java
    └── KycController.java
```

---

## 2. API Endpoints Contract Matrix

| Controller | HTTP Method & Path | Request Body | Description & Business Rules |
| :--- | :--- | :--- | :--- |
| **`AuthController`** | `POST /api/auth/login` | `LoginRequest` | Verifies user credentials (`suraj_w` / `demo123`), queries `Customer`, returns `{ token, user, customer }`. |
| | `POST /api/auth/logout` | *None* | Invalidation response. |
| **`CustomerController`**| `GET /api/customers/{custId}` | *None* | Retrieves customer demographic profile. |
| | `GET /api/customers/{custId}/kyc` | *None* | Retrieves KYC compliance documents for customer. |
| | `PUT /api/customers/{custId}` | `Customer` | Updates phone, email, and address. |
| **`AccountController`** | `GET /api/accounts/customer/{custId}` | *None* | Returns all savings and current accounts for customer. |
| | `GET /api/accounts/{accNo}` | *None* | Returns account details + current balance. |
| | `POST /api/accounts` | `Account` | Opens a new bank account. |
| | `PATCH /api/accounts/{accNo}/status` | `StatusUpdateRequest` | Updates account status (`Active`, `Frozen`, `Closed`). |
| **`TransactionController`**| `GET /api/transactions` | *None* | Complete transaction journal ordered chronologically. |
| | `GET /api/transactions/account/{accNo}` | *None* | Account-specific statement ledger. |
| | `POST /api/transactions/transfer` | `TransferRequest` | **Atomic Fund Transfer:** Verifies sufficient balance, decrements source account balance, creates a `Debit` transaction, and optionally credits an internal beneficiary account. |
| **`LoanController`** | `GET /api/loans/customer/{custId}` | *None* | Retrieves customer loans via `loan_borrows` junction table. |
| | `GET /api/loans/{loanId}/installments` | *None* | Retrieves EMI amortization schedule for a loan. |
| | `POST /api/loans/{loanId}/installments/{id}/pay` | *None* | Marks installment status as `Paid` and sets `paidOn` to today's date. |
| **`FdController`** | `GET /api/fds/customer/{custId}` | *None* | Returns customer term deposits. |
| | `GET /api/fds/{fdId}/interests` | *None* | Returns quarterly interest accrual schedule. |
| | `POST /api/fds` | `FixedDeposit` | Creates a new fixed deposit and calculates maturity date. |
| **`CardController`** | `GET /api/cards/customer/{custId}` | *None* | Returns debit and credit cards for customer. |
| | `PATCH /api/cards/{cardNo}/status` | `StatusUpdateRequest` | **Lock/Unlock Toggle:** Changes card status between `Active` and `Blocked`. |
| **`BranchController`** | `GET /api/branches` | *None* | Lists flagship and regional branch centers. |
| **`KycController`** | `GET /api/kyc/customer/{custId}` | *None* | Regulatory compliance records by customer. |

---

## 3. Key Business Logic Implementations

### A. Atomic Balance Transfer (`TransactionController.java`)
```java
@PostMapping("/transfer")
@Transactional
public ResponseEntity<?> executeTransfer(@RequestBody TransferRequest request) {
    // 1. Verify source account exists
    // 2. Validate balance >= transfer amount
    // 3. Atomically subtract amount from source balance
    // 4. Save source account
    // 5. Insert new Debit transaction into transactions table
    // 6. If target account is internal, credit balance & insert Credit transaction
    // 7. Return updated balance and transaction receipt
}
```

### B. M:N Loan Fetching via `loan_borrows` (`LoanController.java`)
Unlike typical 1:N designs, customer loans are queried through the relational junction table:
```java
@GetMapping("/customer/{custId}")
public List<Loan> getLoansByCustomer(@PathVariable String custId) {
    return loanRepo.findLoansByCustomerId(custId);
}
```

### C. Interactive Card Lock / Unlock (`CardController.java`)
Allows immediate card status toggling (`Active` $\leftrightarrow$ `Blocked`):
```java
@PatchMapping("/{cardNo}/status")
public ResponseEntity<?> updateCardStatus(@PathVariable String cardNo, @RequestBody StatusUpdateRequest request) {
    return cardRepo.findById(cardNo).map(card -> {
        card.setStatus(request.getStatus());
        Card saved = cardRepo.save(card);
        return ResponseEntity.ok(saved);
    }).orElseGet(() -> ResponseEntity.notFound().build());
}
```

---

## 4. Verification Results
* Ran `./mvnw clean compile`:
  ```
  [INFO] Compiling 44 source files with javac [debug parameters release 21] to target/classes
  [INFO] BUILD SUCCESS
  [INFO] Total time: 1.869 s
  ```
All 9 controllers and 4 DTOs compiled cleanly without any warnings or errors.
