# Stage 4: End-to-End Live Integration & Verification Guide

**Branch:** `dev-rutuja`  
**Components Wired:** MySQL 8.0+ $\leftrightarrow$ Spring Boot Backend (Port 8080) $\leftrightarrow$ Vite React Frontend (Port 5173)

---

## 1. Prerequisites Checklist

Before running the full-stack system in live mode, ensure:
1. **MySQL Server is Running:**
   * **macOS GUI:** Open **System Settings** $\rightarrow$ Scroll down to **MySQL** $\rightarrow$ Click **"Start MySQL Server"**.
   * **Terminal:** `sudo /usr/local/mysql/support-files/mysql.server start`
2. **Database Initialized:**
   * Run `database/Initialize.sql` in MySQL:
     ```bash
     /usr/local/mysql/bin/mysql -u root -p123456 < database/Initialize.sql
     ```
   * Confirm the 14 tables and seed records are present:
     ```bash
     /usr/local/mysql/bin/mysql -u root -p123456 -e "USE asr_banking; SHOW TABLES;"
     ```

---

## 2. Launching the 3-Tier System

### Step A: Start the Spring Boot Backend (Terminal 1)
From the repository root:
```bash
cd backend
./mvnw spring-boot:run
```
* **Listening Port:** `http://localhost:8080`
* **Health Check:** In your browser or curl:
  ```bash
  curl http://localhost:8080/api/branches
  ```
  Should return the JSON array of seeded branches (`BR001`, `BR002`).

---

### Step B: Switch Frontend to Live API Mode
Open `frontend/.env` and update:
```env
# Change from true to false:
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080
```

---

### Step C: Start the React Frontend (Terminal 2)
From the repository root:
```bash
npm run dev
```
* **Frontend Portal:** `http://localhost:5173`

---

## 3. End-to-End Verification Scenarios

### Test 1: NetBanking Authentication
1. Navigate to `http://localhost:5173/login`.
2. Enter demo credentials:
   * **Username:** `suraj_w`
   * **Password:** `demo123`
3. Click **"Sign In to NetBanking"**.
4. **Backend verification:** `AuthController` validates credentials against MySQL `users` and returns customer profile `CUST001`.
5. **Expected result:** Successfully redirects to `/dashboard` with customer greeting *"Suraj Walke"*.

---

### Test 2: Accounts & Atomic Balance Transfer
1. Navigate to `/dashboard/accounts`.
2. Confirm the 2 live accounts from MySQL appear:
   * Savings (`ACC001`): ₹45,000.50
   * Current (`ACC002`): ₹1,20,000.00
3. Click **"Quick Transfer"**.
4. Transfer ₹5,000 from `ACC001` to beneficiary `Anita Shinde`.
5. **Expected result:**
   * Source account balance decreases to ₹40,000.50.
   * A new `Debit` transaction appears immediately in `/dashboard/transactions`.
   * **MySQL persistence check:** Run `SELECT * FROM transactions WHERE acc_no = 'ACC001' ORDER BY txn_date DESC LIMIT 1;` — the new transaction is written to the database!

---

### Test 3: Debit & Credit Card Management (Lock/Unlock)
1. Navigate to `/dashboard/cards`.
2. Locate the active debit card (`4532XXXXXXXX1234`).
3. Click **"Lock Card"**.
4. **Backend verification:** `CardController` receives `PATCH /api/cards/4532XXXXXXXX1234/status` with `status: "Blocked"`.
5. **Expected result:** The card status badge changes to `Blocked` in real time.
6. Refresh the page: the card remains `Blocked` because the state was persisted in MySQL.
7. Click **"Unlock Card"** to restore to `Active`.

---

### Test 4: Loans & EMI Amortization Schedule
1. Navigate to `/dashboard/loans`.
2. Live loans are loaded via the `loan_borrows` junction table:
   * Personal Loan (`LN001`): ₹2,00,000 @ 10.5%
   * Vehicle Loan (`LN002`): ₹4,50,000 @ 8.75%
3. Expand `LN001` to view the EMI schedule.
4. Click **"Pay Now"** on a pending installment.
5. **Expected result:** Installment status flips from `Pending` to `Paid`, recording the payment date in MySQL.

---

### Test 5: Term Deposits & Regulatory KYC
1. Navigate to `/dashboard/fd` $\rightarrow$ verify FDs (`FD001`, `FD002`) and quarterly interest accruals.
2. Navigate to `/dashboard/profile` $\rightarrow$ verify customer demographics and regulatory KYC documents (Aadhaar & PAN verification records).

---

## 4. Troubleshooting & Fallback

* **CORS Errors:** Pre-configured in `backend/config/CorsConfig.java` for `localhost:5173`.
* **Database Connection Issues:** Verify username/password in `backend/src/main/resources/application.properties`.
* **Offline Mock Fallback:** If MySQL is not running, set `VITE_USE_MOCK=true` in `frontend/.env` to continue using mock data without changing any component code.
