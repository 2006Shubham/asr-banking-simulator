/**
 * ASR Bank - Centralized Mock Data Store
 * ============================================================================
 * This file serves as the single source of truth for all mock data in the frontend.
 * It strictly mirrors the 10 Database Entities of the ASR Bank relational schema:
 *
 *   1.  USER             (usr_id, user_name, role, contact_no)
 *   2.  CUSTOMER         (cust_id, user_id, name, phone, email, address, aadhar_no)
 *   3.  ACCOUNT          (acc_no, cust_id, acc_type, balance, open_date, status)
 *   4.  TRANSACTION      (txn_id, acc_no, txn_type, txn_date, amount, channel, status, ref_no, description)
 *   5.  LOAN             (loan_id, cust_id, loan_type, amount, interest_rate, start_date, tenure, status)
 *   6.  LOAN_INSTALLMENT (installment_id, loan_id, installment_no, due_date, amount, paid_on, status)
 *   7.  FIXED_DEPOSIT    (fd_id, cust_id, amount, interest_rate, start_date, maturity_date, status)
 *   8.  FD_INTEREST      (interest_id, fd_id, interest_amount, calc_date, payout_date, status)
 *   9.  CARD             (card_no, cust_id, acc_no, card_type, issue_date, expiry_date, cvv, status)
 *   10. KYC              (kyc_id, cust_id, kyc_type, doc_details, verified_on, verified_by, status)
 *
 * Relational Integrity Constraints Verified:
 *   - CUSTOMER.userId        -> USER.userId           (USR001)
 *   - ACCOUNT.custId         -> CUSTOMER.custId       (CUST001)
 *   - TRANSACTION.accNo      -> ACCOUNT.accNo         (ACC001, ACC002)
 *   - LOAN.custId            -> CUSTOMER.custId       (CUST001)
 *   - LOAN_INSTALLMENT.loanId-> LOAN.loanId           (LN001, LN002)
 *   - FIXED_DEPOSIT.custId   -> CUSTOMER.custId       (CUST001)
 *   - FD_INTEREST.fdId       -> FIXED_DEPOSIT.fdId    (FD001, FD002)
 *   - CARD.custId            -> CUSTOMER.custId       (CUST001)
 *   - CARD.accNo             -> ACCOUNT.accNo (or null)(ACC001, ACC002)
 *   - KYC.custId             -> CUSTOMER.custId       (CUST001)
 * ============================================================================
 */

// ============================================================================
// 1. USER ENTITY (Authentication & Role Credentials)
// ============================================================================
export const mockUser = {
  userId: "USR001",
  userName: "suraj_w",
  role: "Customer",
  contactNo: "+91 98765 43210",
};

// ============================================================================
// 2. CUSTOMER ENTITY (Personal Demographics & Master Records)
// ============================================================================
export const mockCustomer = {
  custId: "CUST001",
  userId: "USR001",
  name: "Suraj Walke",
  phone: "+91 98765 43210",
  email: "suraj@example.com",
  address: "Flat 402, Shivajinagar, Pune, Maharashtra - 411005",
  aadharNo: "1234-5678-9012",
};

// ============================================================================
// 3. ACCOUNT ENTITY (Deposit Accounts)
// ============================================================================
export const mockAccounts = [
  {
    accNo: "ACC001",
    custId: "CUST001",
    accType: "Savings",
    balance: 45000.5,
    openDate: "2024-01-15",
    status: "Active",
  },
  {
    accNo: "ACC002",
    custId: "CUST001",
    accType: "Current",
    balance: 120000.0,
    openDate: "2024-05-10",
    status: "Active",
  },
];

// ============================================================================
// 4. TRANSACTION ENTITY (Account Audit Ledger & Payment Journals)
// ============================================================================
export const mockTransactions = [
  {
    txnId: "TXN001",
    accNo: "ACC001",
    txnType: "Debit",
    txnDate: "2026-09-28T10:30:00",
    amount: 1200.0,
    channel: "UPI",
    status: "Success",
    refNo: "UPI/2026/0928/8912",
    description: "UPI Payment - Grocery Supermarket",
  },
  {
    txnId: "TXN002",
    accNo: "ACC001",
    txnType: "Credit",
    txnDate: "2026-09-27T09:15:00",
    amount: 50000.0,
    channel: "NEFT",
    status: "Success",
    refNo: "NEFT/2026/0927/4431",
    description: "Monthly Salary Credit - Tech Corp",
  },
  {
    txnId: "TXN003",
    accNo: "ACC001",
    txnType: "Debit",
    txnDate: "2026-09-20T14:45:00",
    amount: 9500.0,
    channel: "IMPS",
    status: "Success",
    refNo: "IMPS/2026/0920/1129",
    description: "Personal Loan EMI Debit LN001",
  },
  {
    txnId: "TXN004",
    accNo: "ACC001",
    txnType: "Debit",
    txnDate: "2026-09-18T18:20:00",
    amount: 3450.0,
    channel: "UPI",
    status: "Success",
    refNo: "UPI/2026/0918/7723",
    description: "Electricity Utility Bill Payment",
  },
  {
    txnId: "TXN005",
    accNo: "ACC002",
    txnType: "Credit",
    txnDate: "2026-09-15T11:00:00",
    amount: 25000.0,
    channel: "NEFT",
    status: "Success",
    refNo: "NEFT/2026/0915/9981",
    description: "Client Project Milestone Invoice",
  },
  {
    txnId: "TXN006",
    accNo: "ACC001",
    txnType: "Debit",
    txnDate: "2026-09-12T16:10:00",
    amount: 850.0,
    channel: "UPI",
    status: "Success",
    refNo: "UPI/2026/0912/3342",
    description: "Pharmacy Medicine Purchase",
  },
  {
    txnId: "TXN007",
    accNo: "ACC001",
    txnType: "Credit",
    txnDate: "2026-09-10T13:40:00",
    amount: 5000.0,
    channel: "IMPS",
    status: "Success",
    refNo: "IMPS/2026/0910/6654",
    description: "Cashback & Dividend Credit",
  },
  {
    txnId: "TXN008",
    accNo: "ACC001",
    txnType: "Debit",
    txnDate: "2026-09-08T20:05:00",
    amount: 2200.0,
    channel: "UPI",
    status: "Pending",
    refNo: "UPI/2026/0908/9011",
    description: "Online Food Delivery Order",
  },
  {
    txnId: "TXN009",
    accNo: "ACC002",
    txnType: "Debit",
    txnDate: "2026-09-05T15:30:00",
    amount: 15000.0,
    channel: "NEFT",
    status: "Success",
    refNo: "NEFT/2026/0905/2241",
    description: "Vendor Supplier Settlement",
  },
  {
    txnId: "TXN010",
    accNo: "ACC001",
    txnType: "Debit",
    txnDate: "2026-09-01T12:00:00",
    amount: 1800.0,
    channel: "IMPS",
    status: "Failed",
    refNo: "IMPS/2026/0901/5512",
    description: "Failed Merchant Gateway Transfer",
  },
];

// ============================================================================
// 5. LOAN ENTITY (Sanctioned Retail Facilities)
// ============================================================================
export const mockLoans = [
  {
    loanId: "LN001",
    custId: "CUST001",
    loanType: "Personal",
    amount: 200000.0,
    interestRate: 10.5,
    startDate: "2025-01-01",
    tenure: 24, // months
    status: "Active",
  },
  {
    loanId: "LN002",
    custId: "CUST001",
    loanType: "Vehicle",
    amount: 450000.0,
    interestRate: 8.75,
    startDate: "2024-08-15",
    tenure: 36, // months
    status: "Active",
  },
];

// ============================================================================
// 6. LOAN_INSTALLMENT ENTITY (Amortization Schedule EMIs)
// ============================================================================
export const mockInstallments = [
  // LN001 Installments
  {
    installmentId: "INST001",
    loanId: "LN001",
    installmentNo: 1,
    dueDate: "2025-02-01",
    amount: 9500.0,
    paidOn: "2025-01-30",
    status: "Paid",
  },
  {
    installmentId: "INST002",
    loanId: "LN001",
    installmentNo: 2,
    dueDate: "2025-03-01",
    amount: 9500.0,
    paidOn: "2025-02-28",
    status: "Paid",
  },
  {
    installmentId: "INST003",
    loanId: "LN001",
    installmentNo: 3,
    dueDate: "2025-04-01",
    amount: 9500.0,
    paidOn: null,
    status: "Pending",
  },
  {
    installmentId: "INST004",
    loanId: "LN001",
    installmentNo: 4,
    dueDate: "2025-05-01",
    amount: 9500.0,
    paidOn: null,
    status: "Pending",
  },
  // LN002 Installments
  {
    installmentId: "INST101",
    loanId: "LN002",
    installmentNo: 1,
    dueDate: "2024-09-15",
    amount: 14250.0,
    paidOn: "2024-09-12",
    status: "Paid",
  },
  {
    installmentId: "INST102",
    loanId: "LN002",
    installmentNo: 2,
    dueDate: "2024-10-15",
    amount: 14250.0,
    paidOn: "2024-10-14",
    status: "Paid",
  },
  {
    installmentId: "INST103",
    loanId: "LN002",
    installmentNo: 3,
    dueDate: "2024-11-15",
    amount: 14250.0,
    paidOn: null,
    status: "Pending",
  },
];

// ============================================================================
// 7. FIXED_DEPOSIT ENTITY (Term Deposit Contracts)
// ============================================================================
export const mockFDs = [
  {
    fdId: "FD001",
    custId: "CUST001",
    amount: 100000.0,
    interestRate: 7.2,
    startDate: "2025-03-01",
    maturityDate: "2026-03-01",
    status: "Active",
  },
  {
    fdId: "FD002",
    custId: "CUST001",
    amount: 250000.0,
    interestRate: 7.5,
    startDate: "2024-06-15",
    maturityDate: "2027-06-15",
    status: "Active",
  },
];

// ============================================================================
// 8. FD_INTEREST ENTITY (Yield Accruals & Payout Ledger)
// ============================================================================
export const mockFDInterests = [
  // FD001 Interests
  {
    interestId: "INT001",
    fdId: "FD001",
    interestAmount: 7200.0,
    calcDate: "2026-03-01",
    payoutDate: "2026-03-01",
    status: "Pending",
  },
  // FD002 Interests
  {
    interestId: "INT101",
    fdId: "FD002",
    interestAmount: 9375.0,
    calcDate: "2024-12-15",
    payoutDate: "2024-12-15",
    status: "Credited",
  },
  {
    interestId: "INT102",
    fdId: "FD002",
    interestAmount: 9375.0,
    calcDate: "2025-06-15",
    payoutDate: "2025-06-15",
    status: "Credited",
  },
  {
    interestId: "INT103",
    fdId: "FD002",
    interestAmount: 9375.0,
    calcDate: "2025-12-15",
    payoutDate: "2025-12-15",
    status: "Pending",
  },
];

// ============================================================================
// 9. CARD ENTITY (Debit & Credit Cards)
// ============================================================================
export const mockCards = [
  {
    cardNo: "4532XXXXXXXX1234",
    custId: "CUST001",
    accNo: "ACC001",
    cardType: "Debit",
    issueDate: "2024-01-15",
    expiryDate: "2027-01-15",
    cvv: "***",
    status: "Active",
  },
  {
    cardNo: "5241XXXXXXXX5678",
    custId: "CUST001",
    accNo: null, // Standalone revolving credit facility
    cardType: "Credit",
    issueDate: "2024-05-10",
    expiryDate: "2028-05-10",
    cvv: "***",
    status: "Active",
  },
  {
    cardNo: "6071XXXXXXXX9012",
    custId: "CUST001",
    accNo: "ACC002",
    cardType: "Debit",
    issueDate: "2023-11-20",
    expiryDate: "2026-11-20",
    cvv: "***",
    status: "Blocked",
  },
];

// ============================================================================
// 10. KYC ENTITY (Regulatory Compliance & Verification Audit Records)
// ============================================================================
export const mockKYC = [
  {
    kycId: "KYC001",
    custId: "CUST001",
    kycType: "Aadhaar Card",
    docDetails: "UIDAI Biometric Verified (XXXX XXXX 9012)",
    verifiedOn: "2024-01-20",
    verifiedBy: "Operations Admin",
    status: "Verified",
  },
  {
    kycId: "KYC002",
    custId: "CUST001",
    kycType: "PAN Card",
    docDetails: "NSDL Verified (ABCDE••••F)",
    verifiedOn: "2024-01-22",
    verifiedBy: "Compliance Officer",
    status: "Verified",
  },
];

// ============================================================================
// DEFAULT EXPORT (All 10 Relational Data Collections)
// ============================================================================
export default {
  mockUser,
  mockCustomer,
  mockAccounts,
  mockTransactions,
  mockLoans,
  mockInstallments,
  mockFDs,
  mockFDInterests,
  mockCards,
  mockKYC,
};
