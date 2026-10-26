# Stage 7: Database Normalization Proofs & Schema Integrity Constraints

**Project:** ASR Bank Simulator — Institutional Core Banking Relational Database  
**Database Engine:** MySQL 8.0+ / InnoDB  
**Academic Module:** Stage 7 (Normalization Proofs 1NF to BCNF, Relational Invariants & Constraint Catalog)  
**Authors:** Rutuja, Suraj, Atharva, Shubham  

---

## 1. Executive Summary & Schema Statistics

The ASR Bank Simulator database is designed in strict compliance with **Boyce-Codd Normal Form (BCNF)** and the **Third Normal Form (3NF)**. The design completely eliminates data redundancy, update anomalies, insertion anomalies, and deletion anomalies while guaranteeing **Lossless-Join Decomposition** and **Dependency Preservation**.

### Relational Constraints Summary
| Constraint Type | Quantity | Purpose in Banking Architecture |
| :--- | :---: | :--- |
| **CHECK Constraints** | **33** | Domain and enterprise integrity (e.g. non-negative balance, allowed status codes, tenure bounds). |
| **FOREIGN KEY Constraints** | **18** | Referential integrity enforcing business entity relationships. |
| **PRIMARY KEY Constraints** | **14** | Entity integrity guaranteeing unique row identification across all 14 tables. |
| **UNIQUE Constraints** | **9** | Candidate key enforcement (email, PAN, Aadhar, IFSC, ref_no, username). |
| **Total Enforced Constraints** | **74** | **Hardware- and engine-level protection against corrupt or rogue states.** |

---

## 2. Theoretical Normalization Foundations

### Armstrong’s Axioms (Inference Rules for Functional Dependencies)
Given a set of functional dependencies $F$ over a relational schema $R$:
1. **Reflexivity Rule:** If $Y \subseteq X$, then $X \to Y$.
2. **Augmentation Rule:** If $X \to Y$, then $XZ \to YZ$.
3. **Transitivity Rule:** If $X \to Y$ and $Y \to Z$, then $X \to Z$.

*Derived Rules:*
- **Union:** If $X \to Y$ and $X \to Z$, then $X \to YZ$.
- **Decomposition:** If $X \to YZ$, then $X \to Y$ and $X \to Z$.
- **Pseudotransitivity:** If $X \to Y$ and $WY \to Z$, then $WX \to Z$.

---

## 3. Formal Proofs for Core Relations

### Proof 1: Table `accounts`
$$\text{accounts}(\underline{\text{acc\_no}}, \text{cust\_id}, \text{branch\_id}, \text{acc\_type}, \text{balance}, \text{open\_date}, \text{status}, \text{created\_at})$$

- **Candidate Key:** $\{\text{acc\_no}\}$
- **Prime Attributes:** $\{\text{acc\_no}\}$
- **Non-Prime Attributes:** $\{\text{cust\_id}, \text{branch\_id}, \text{acc\_type}, \text{balance}, \text{open\_date}, \text{status}, \text{created\_at}\}$
- **Functional Dependencies ($F$):**
  $$FD_1: \text{acc\_no} \to \text{cust\_id}, \text{branch\_id}, \text{acc\_type}, \text{balance}, \text{open\_date}, \text{status}, \text{created\_at}$$

1. **Proof of 1NF:**  
   Every column holds atomic values (e.g., `balance` is `DECIMAL(15,2)`, `acc_type` is a single string). No repeating groups, arrays, or JSON blobs exist. $\therefore \text{accounts} \in \text{1NF}$.
2. **Proof of 2NF:**  
   The candidate key $\{\text{acc\_no}\}$ contains only **1 attribute**. A proper subset of a single attribute does not exist ($\emptyset$). Therefore, a partial functional dependency is mathematically impossible. $\therefore \text{accounts} \in \text{2NF}$.
3. **Proof of 3NF:**  
   A transitive dependency requires $X \to Y$ and $Y \to Z$ where $Z$ is non-prime and $Y$ is not a superkey.  
   *Counter-Design Check:* If `accounts` had stored `branch_name` and `ifsc_code`, we would have:
   $$\text{acc\_no} \to \text{branch\_id} \to \text{branch\_name}, \text{ifsc\_code}$$
   This would violate 3NF! Because `branch_name` and `ifsc_code` were factored into the `branches` relation ($\text{branch\_id} \to \text{branch\_name}$), no transitive dependency exists in `accounts`. $\therefore \text{accounts} \in \text{3NF}$.
4. **Proof of BCNF:**  
   In $FD_1$, the determinant $\{\text{acc\_no}\}$ is a Superkey. There are no other functional dependencies. $\therefore \text{accounts} \in \text{BCNF}$. **(Q.E.D.)**

---

### Proof 2: Table `loan_borrows` (Many-to-Many Bridge Table)
$$\text{loan\_borrows}(\underline{\text{loan\_id}}, \underline{\text{cust\_id}}, \text{borrower\_type}, \text{added\_on})$$

- **Candidate Key:** Composite key $\{\text{loan\_id}, \text{cust\_id}\}$
- **Prime Attributes:** $\{\text{loan\_id}, \text{cust\_id}\}$
- **Non-Prime Attributes:** $\{\text{borrower\_type}, \text{added\_on}\}$
- **Functional Dependencies ($F$):**
  $$FD_1: \{\text{loan\_id}, \text{cust\_id}\} \to \text{borrower\_type}, \text{added\_on}$$

1. **Proof of 2NF (Testing Partial Dependencies):**
   - Does $\text{loan\_id} \to \text{borrower\_type}$ hold? **No.** A loan can have multiple co-borrowers (e.g., Husband is 'Primary', Wife is 'Co-Borrower').
   - Does $\text{cust\_id} \to \text{borrower\_type}$ hold? **No.** A customer can be 'Primary' on a personal loan, and a 'Guarantor' on a corporate loan.
   - Only the combined pair $\{\text{loan\_id}, \text{cust\_id}\}$ uniquely determines the role and timestamp.  
   Since no non-prime attribute depends on a proper subset of the candidate key, no partial dependency exists. $\therefore \text{loan\_borrows} \in \text{2NF}$.
2. **Proof of 3NF & BCNF:**
   The determinant $\{\text{loan\_id}, \text{cust\_id}\}$ is the primary superkey. No non-superkey determinants exist. $\therefore \text{loan\_borrows} \in \text{3NF}$ and $\text{loan\_borrows} \in \text{BCNF}$. **(Q.E.D.)**

---

### Proof 3: Table `branches`
$$\text{branches}(\underline{\text{branch\_id}}, \text{branch\_name}, \text{ifsc\_code}, \text{city}, \text{address}, \text{assets}, \text{manager\_id}, \text{created\_at})$$

- **Candidate Keys:** $K_1 = \{\text{branch\_id}\}$, $K_2 = \{\text{ifsc\_code}\}$
- **Functional Dependencies ($F$):**
  $$FD_1: \text{branch\_id} \to \text{branch\_name}, \text{ifsc\_code}, \text{city}, \text{address}, \text{assets}, \text{manager\_id}$$
  $$FD_2: \text{ifsc\_code} \to \text{branch\_id}, \text{branch\_name}, \text{city}, \text{address}, \text{assets}, \text{manager\_id}$$
- **Proof:**
  Both determinants $\{\text{branch\_id}\}$ and $\{\text{ifsc\_code}\}$ are valid Superkeys. Every non-prime attribute is fully dependent on each candidate key. $\therefore \text{branches} \in \text{BCNF}$. **(Q.E.D.)**

---

## 4. Referential Integrity Actions Matrix

| Child Table | Foreign Key Column | Referenced Parent Table | Delete Action | Academic / Business Justification |
| :--- | :--- | :--- | :---: | :--- |
| `accounts` | `cust_id` | `customers(cust_id)` | **RESTRICT** | Financial accounts cannot exist without an authorized legal customer entity. |
| `accounts` | `branch_id` | `branches(branch_id)` | **RESTRICT** | Accounts must be serviced by a valid operating bank branch. |
| `transactions` | `acc_no` | `accounts(acc_no)` | **RESTRICT** | Financial audit trails are strictly immutable; accounts with historical ledger entries can never be deleted. |
| `branches` | `manager_id` | `employees(emp_id)` | **SET NULL** | If an employee resigns or is terminated, the physical branch continues operating with a vacant manager slot. |
| `cards` | `acc_no` | `accounts(acc_no)` | **SET NULL** | Allows revolving credit cards to remain active as standalone borrowing facilities even if a linked deposit account is closed. |
| `loans` | `loan_type` | `loan_interest_rates(loan_type)` | **RESTRICT** | Active credit contracts must strictly reference a valid institutional interest rate catalog. |

---

## 5. College Viva Questions & Model Answers

**Q1: What is the formal difference between 3NF and BCNF?**
> *Answer:* In 3NF, for every non-trivial functional dependency $X \to Y$, either $X$ must be a superkey **OR** $Y$ must be a prime attribute (a member of some candidate key). BCNF eliminates this second condition: in BCNF, $X$ **must** be a superkey in every non-trivial functional dependency without exception.

**Q2: What is a Lossless-Join Decomposition?**
> *Answer:* A decomposition of relation $R$ into $R_1$ and $R_2$ is lossless with respect to a functional dependency set $F$ if and only if natural joining $R_1$ and $R_2$ produces exactly the original relation $R$ without generating any spurious tuples:
> $$R_1 \bowtie R_2 = R \iff (R_1 \cap R_2 \to R_1) \text{ or } (R_1 \cap R_2 \to R_2)$$
> In our project, joining `accounts` and `branches` on `branch_id` is lossless because $\text{branch\_id} \to \text{branches}$.

**Q3: Why don't we store a customer's `age` in the `customers` table?**
> *Answer:* Storing `age` introduces an update anomaly because age changes dynamically every year, causing stored values to become stale. Instead, we store the immutable attribute `dob` (Date of Birth) and derive age on-the-fly using `TIMESTAMPDIFF(YEAR, dob, CURDATE())`.

**Q4: Can a table with a single-attribute primary key have partial functional dependencies?**
> *Answer:* No. A partial dependency occurs when a non-prime attribute depends on a proper subset of a candidate key. Since a single-attribute key has no non-empty proper subsets, partial dependencies are mathematically impossible. Any relation in 1NF with single-attribute candidate keys is guaranteed to be in 2NF.
