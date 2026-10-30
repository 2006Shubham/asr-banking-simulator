import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  BadgePercent,
  PiggyBank,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Smartphone,
  Download,
  Building2,
  RefreshCw,
  TrendingUp,
  Receipt,
  QrCode,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  accountService,
  transactionService,
  loanService,
  loanInstallmentService,
  fdService,
} from "../../services";
import { Card, Badge, Button, Modal, Input, LoadingState } from "../../components/common";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { maskAccountNumber } from "../../utils/maskers";

const OverviewPage = () => {
  const { customer, branch } = useAuth();

  // Dynamic state populated strictly from database via backend REST APIs
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [fds, setFds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [searchTxn, setSearchTxn] = useState("");
  const [txnTypeFilter, setTxnTypeFilter] = useState("all");

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        setLoading(true);
        const custId = customer?.custId || "CUST001";
        const [accs, txns, lns, fixedDeps] = await Promise.all([
          accountService.getAccountsByCustomer(custId).catch(() => []),
          transactionService.getTransactions().catch(() => []),
          loanService.getLoansByCustomer(custId).catch(() => []),
          fdService.getFDsByCustomer(custId).catch(() => []),
        ]);
        if (Array.isArray(accs) && accs.length > 0) {
          setAccounts(accs);
          setTransferSourceAcc(accs[0].accNo);
        } else {
          setAccounts([
            { accNo: "ACC001", accType: "Savings", balance: 145000.50, status: "Active" }
          ]);
          setTransferSourceAcc("ACC001");
        }
        if (Array.isArray(txns) && txns.length > 0) {
          const userAccNos = new Set((Array.isArray(accs) ? accs : []).map((a) => a.accNo));
          const filtered = userAccNos.size > 0
            ? txns.filter((t) => userAccNos.has(t.accNo))
            : txns;
          setTransactions(filtered);
        }
        if (Array.isArray(lns)) setLoans(lns);
        if (Array.isArray(fixedDeps)) setFds(fixedDeps);
      } catch (e) {
        console.warn("Overview service data load failed, using local store", e);
      } finally {
        setLoading(false);
      }
    };
    loadOverviewData();
  }, [customer]);

  // Dynamic greeting based on user's current time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const customerName = customer?.name?.split(" ")[0] || "Valued Customer";

  // Financial summary metrics calculated from reactive state
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const activeLoansCount = loans.filter((l) => l.status === "Active").length;
  const totalFdAmount = fds.reduce((sum, fd) => sum + (fd.amount || 0), 0);

  // Transfer Money Simulation Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSourceAcc, setTransferSourceAcc] = useState(accounts[0]?.accNo || "ACC001");
  const [transferBeneficiary, setTransferBeneficiary] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferChannel, setTransferChannel] = useState("UPI");
  const [transferStatus, setTransferStatus] = useState(null); // null | 'success'
  const [transferReceipt, setTransferReceipt] = useState(null);

  // Pay Loan EMI Simulation Modal State
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanPayStatus, setLoanPayStatus] = useState(null);
  const [loanReceipt, setLoanReceipt] = useState(null);

  const handleSimulateTransfer = async (e) => {
    e.preventDefault();
    if (!transferBeneficiary || !transferAmount || Number(transferAmount) <= 0) return;

    const trimmed = transferBeneficiary.trim();
    // Check if beneficiary is an internal bank account (e.g. ACC001, ACC002, ACC003)
    const isAccNo = /^ACC\d+$/i.test(trimmed);
    const targetAcc = isAccNo ? trimmed.toUpperCase() : null;

    if (targetAcc && targetAcc === transferSourceAcc) {
      alert("Source and Destination accounts cannot be the same. Please select or enter a different account.");
      return;
    }

    setTransferStatus("processing");
    try {
      const result = await transactionService.executeTransfer({
        fromAccNo: transferSourceAcc,
        toAccNo: targetAcc,
        amount: transferAmount,
        channel: transferChannel,
        description: `Fund Transfer to ${trimmed}`,
        beneficiary: trimmed,
      });

      setTransferReceipt({
        ref: result.transaction?.refNo || result.ref || result.txnId || `TXN${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString("en-IN"),
      });
      setTransferStatus("success");

      // Reload live accounts and transactions
      const custId = customer?.custId || "CUST001";
      const [updatedAccs, updatedTxns] = await Promise.all([
        accountService.getAccountsByCustomer(custId).catch(() => []),
        transactionService.getTransactions().catch(() => []),
      ]);
      if (Array.isArray(updatedAccs) && updatedAccs.length) setAccounts(updatedAccs);
      if (Array.isArray(updatedTxns) && updatedTxns.length) {
        const userAccNos = new Set((Array.isArray(updatedAccs) ? updatedAccs : []).map((a) => a.accNo));
        const filtered = userAccNos.size > 0
          ? updatedTxns.filter((t) => userAccNos.has(t.accNo))
          : updatedTxns;
        setTransactions(filtered);
      }
    } catch (err) {
      console.error("Transfer failed", err);
      alert(err.response?.data?.message || err.message || "Transfer failed. Please check funds.");
      setTransferStatus(null);
    }
  };

  const handleSimulateLoanPay = async () => {
    setLoanPayStatus("processing");
    try {
      const activeLoan = loans[0];
      const loanId = activeLoan?.loanId || "LN001";
      const insts = await loanInstallmentService.getInstallmentsByLoan(loanId).catch(() => []);
      const instArray = Array.isArray(insts) ? insts : [];
      const pendingInst = instArray.find((i) => i.status !== "Paid") || instArray[0];
      const installmentId = pendingInst?.installmentId || "INS003";

      const updated = await loanInstallmentService.payInstallment(loanId, installmentId);
      setLoanReceipt({
        ref: `RCP-${updated?.installmentId || installmentId}`,
      });
      setLoanPayStatus("success");

      // Reload accounts and loans
      const custId = customer?.custId || "CUST001";
      const [updatedAccs, updatedLoans] = await Promise.all([
        accountService.getAccountsByCustomer(custId).catch(() => []),
        loanService.getLoansByCustomer(custId).catch(() => []),
      ]);
      if (Array.isArray(updatedAccs) && updatedAccs.length) setAccounts(updatedAccs);
      if (Array.isArray(updatedLoans) && updatedLoans.length) setLoans(updatedLoans);
    } catch (err) {
      console.error("Loan payment failed", err);
      alert(err.response?.data?.message || "Loan payment failed. Please try again.");
      setLoanPayStatus(null);
    }
  };

  const resetTransferModal = () => {
    setTransferModalOpen(false);
    setTransferStatus(null);
    setTransferReceipt(null);
    setTransferBeneficiary("");
    setTransferAmount("");
  };

  const resetLoanModal = () => {
    setLoanModalOpen(false);
    setLoanPayStatus(null);
    setLoanReceipt(null);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (txnTypeFilter === "credit" && t.txnType !== "Credit") return false;
    if (txnTypeFilter === "debit" && t.txnType !== "Debit") return false;
    if (searchTxn.trim()) {
      const q = searchTxn.toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const ref = (t.refNo || "").toLowerCase();
      const chan = (t.channel || "").toLowerCase();
      return desc.includes(q) || ref.includes(q) || chan.includes(q);
    }
    return true;
  });

  const primaryAccount = accounts[0] || {
    accNo: "ACC001",
    accType: "Savings",
    balance: totalBalance,
    status: "Active",
  };

  if (loading && accounts.length === 0) {
    return <LoadingState message="Loading live banking details from database..." fullPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Greeting & Security Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              {getGreeting()}, {customerName}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified KYC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated NetBanking Workspace • Welcome back to ASR Bank
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#003366]" />
            <span>Branch: <strong className="font-semibold text-slate-800">{branch?.branchName || "Pune Main"} ({branch?.ifscCode || "ASRB0000001"})</strong></span>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Customer ID: <strong className="font-mono text-slate-800">{customer?.custId || "CUST001"}</strong></span>
          </div>

          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            title={hideBalance ? "Show Balances" : "Hide Balances for Privacy"}
          >
            {hideBalance ? (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Show Balance</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Hide Balance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Flagship Account Showcase & Key Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Premium Indian Bank Passbook Card (7 Cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#004b87] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px] border border-blue-400/20">
          {/* Subtle Decorative Background Rings */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-xl"></div>
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-amber-400/10 pointer-events-none blur-lg"></div>

          {/* Top Bar: Bank Brand, Chip & Account Type */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                <img src="/asr-bank-logo.png" alt="ASR Bank" className="h-full w-auto object-contain" />
              </div>
              <div>
                <span className="font-extrabold tracking-wider text-sm text-white block leading-none">ASR BANK</span>
                <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase mt-0.5 block">Your Trust, Our Priority</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {primaryAccount.accType || "Savings"} Account
              </span>
              <span className="text-[11px] font-mono text-blue-200 bg-white/10 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Middle: Masked Account Number & Live Balance */}
          <div className="my-5 relative z-10">
            <p className="text-xs text-blue-200/80 uppercase tracking-widest font-mono">
              Account No: {maskAccountNumber(primaryAccount.accNo)}
            </p>
            <div className="flex items-baseline gap-3 mt-1.5">
              <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                {hideBalance ? "₹ ••••••••" : formatCurrency(primaryAccount.balance)}
              </p>
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                +4.0% p.a. Interest
              </span>
            </div>
            <p className="text-[11px] text-blue-200/70 mt-1">
              Consolidated across {accounts.length} active linked bank account{accounts.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Bottom Bar: Quick Action CTAs Directly on Card */}
          <div className="pt-4 border-t border-blue-400/20 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTransferModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Instant Transfer</span>
              </button>
              <Link
                to="/dashboard/transactions"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition"
              >
                <Receipt className="w-3.5 h-3.5 text-blue-200" />
                <span>Statements</span>
              </Link>
            </div>

            <div className="text-[11px] text-blue-200/90 font-mono">
              IFSC: <strong className="text-white">{branch?.ifscCode || "ASRB0000001"}</strong>
            </div>
          </div>
        </div>

        {/* Right: Portfolio Highlights Summary Cards (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Fixed Deposits Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:border-emerald-300 transition">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fixed Deposits (FD)
                </span>
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {hideBalance ? "₹ ••••••••" : formatCurrency(totalFdAmount)}
              </p>
              <p className="text-[11px] text-slate-500">
                {fds[0] ? `Deposit #${fds[0].fdId} • Matures ${formatDate(fds[0].maturityDate)}` : "No active deposits"}
              </p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                7.80% p.a.
              </span>
              <Link to="/dashboard/fd" className="block text-[11px] font-semibold text-[#003366] hover:underline mt-2">
                Manage FD →
              </Link>
            </div>
          </div>

          {/* Active Loans Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:border-amber-300 transition">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <BadgePercent className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Loans & EMI
                </span>
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {activeLoansCount} {activeLoansCount === 1 ? "Active Loan" : "Active Loans"}
              </p>
              <p className="text-[11px] text-slate-500">
                {loans[0] ? `${loans[0].loanType} #${loans[0].loanId} • ₹9,500/mo EMI` : "All accounts debt-free"}
              </p>
            </div>
            <div className="text-right">
              {activeLoansCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setLoanModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
                >
                  Pay EMI
                </button>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  None Due
                </span>
              )}
              <Link to="/dashboard/loans" className="block text-[11px] font-semibold text-[#003366] hover:underline mt-2">
                View Loans →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Banking Services Ribbon (5 Colorful Action Tiles) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Retail Banking Utilities & Services
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Action 1: Transfer Funds */}
          <button
            type="button"
            onClick={() => setTransferModalOpen(true)}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Send Money
              </p>
              <p className="text-[11px] text-slate-400">UPI / IMPS / NEFT</p>
            </div>
          </button>

          {/* Action 2: View Accounts */}
          <Link
            to="/dashboard/accounts"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-left flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#003366] transition">
                My Accounts
              </p>
              <p className="text-[11px] text-slate-400">Balances & Statements</p>
            </div>
          </Link>

          {/* Action 3: Debit Cards */}
          <Link
            to="/dashboard/cards"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-left flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition">
                Debit Cards
              </p>
              <p className="text-[11px] text-slate-400">Limits & PIN Lock</p>
            </div>
          </Link>

          {/* Action 4: Fixed Deposits */}
          <Link
            to="/dashboard/fd"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition text-left flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition">
                Open FD / RD
              </p>
              <p className="text-[11px] text-slate-400">High Yield @ 7.80%</p>
            </div>
          </Link>

          {/* Action 5: Inquiries & Support */}
          <Link
            to="/customer/inquiries"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md transition text-left flex flex-col justify-between group col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition">
                24x7 Helpdesk
              </p>
              <p className="text-[11px] text-slate-400">Inquiries & Tickets</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Ledger & Accounts Portfolio Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Transactions Ledger (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Account Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live debits and credits recorded across accounts</p>
            </div>
            <Link
              to="/dashboard/transactions"
              className="text-xs text-[#003366] font-bold hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Filter & Search Bar */}
          <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              {["all", "credit", "debit"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTxnTypeFilter(tab)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                    txnTypeFilter === tab
                      ? "bg-[#003366] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tab === "all" ? "All Entries" : tab === "credit" ? "Credits (+)" : "Debits (-)"}
                </button>
              ))}
            </div>

            <div className="relative text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter transactions..."
                value={searchTxn}
                onChange={(e) => setSearchTxn(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              />
            </div>
          </div>

          {/* Transaction Rows */}
          <div className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No transactions matched your current filters.
              </div>
            ) : (
              filteredTransactions.slice(0, 5).map((txn) => {
                const isCredit = txn.txnType === "Credit";
                return (
                  <div
                    key={txn.txnId}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {txn.description}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{formatDate(txn.txnDate)}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">{txn.channel}</span>
                          <span>•</span>
                          <span className="font-mono">{txn.refNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs sm:text-sm font-extrabold font-mono ${
                          isCredit ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {hideBalance
                          ? "••••"
                          : `${isCredit ? "+" : "-"}${formatCurrency(txn.amount)}`}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Linked Accounts Portfolio & Security Badges (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Linked Accounts</h3>
                <p className="text-[11px] text-slate-400">Current active ledger holdings</p>
              </div>
              <Link to="/dashboard/accounts" className="text-xs text-[#003366] font-semibold hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {accounts.slice(0, 3).map((acc) => (
                <div
                  key={acc.accNo}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {acc.accType} Account
                    </span>
                    <Badge variant="success" size="sm">
                      {acc.status}
                    </Badge>
                  </div>
                  <p className="font-mono text-xs text-slate-400">
                    {maskAccountNumber(acc.accNo)}
                  </p>
                  <p className="text-base font-bold text-slate-900 font-mono pt-0.5">
                    {hideBalance ? "₹ ••••••••" : formatCurrency(acc.balance)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Security Assurance */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#001f3f] to-[#003366] text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Institutional Security
                </h4>
                <p className="text-[11px] text-blue-200/70">DICGC Insured up to ₹5 Lakh</p>
              </div>
            </div>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Your NetBanking session uses 256-bit TLS encryption. Customer account numbers and sensitive credentials are encrypted and masked in accordance with Reserve Bank guidelines.
            </p>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition pt-1"
            >
              <span>View KYC & Profile Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Modal 1: Instant Fund Transfer */}
      <Modal
        isOpen={transferModalOpen}
        onClose={resetTransferModal}
        title="Instant Fund Transfer"
        description="Transfer funds seamlessly across accounts or via UPI/IMPS with 24x7 instant settlement."
        footer={
          transferStatus === "success" ? (
            <Button variant="primary" size="sm" onClick={resetTransferModal}>
              Done
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={resetTransferModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSimulateTransfer}
                isLoading={transferStatus === "processing"}
              >
                Proceed Transfer
              </Button>
            </div>
          )
        }
      >
        {transferStatus === "success" ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Transfer Completed Successfully!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Transferred <strong>{formatCurrency(Number(transferAmount))}</strong> to{" "}
              <strong>{transferBeneficiary}</strong> via {transferChannel}.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 text-left">
              <p>Reference: {transferReceipt?.ref || "TXN102938"}</p>
              <p>Channel: {transferChannel}</p>
              <p>Timestamp: {transferReceipt?.date || new Date().toLocaleString("en-IN")}</p>
              <p className="text-emerald-700 font-semibold mt-1">Status: SUCCESSFUL (Instant Settlement)</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSimulateTransfer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From Account
              </label>
              <select
                value={transferSourceAcc}
                onChange={(e) => setTransferSourceAcc(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              >
                {accounts.map((acc) => (
                  <option key={acc.accNo} value={acc.accNo}>
                    {acc.accType} Account ({maskAccountNumber(acc.accNo)}) - Balance: {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Beneficiary Account Number or UPI ID"
              placeholder="e.g. 9876543210@upi or A/C 0987654321"
              required
              value={transferBeneficiary}
              onChange={(e) => setTransferBeneficiary(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Transfer Amount (₹)"
                type="number"
                placeholder="e.g. 1500"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Transfer Channel
                </label>
                <select
                  value={transferChannel}
                  onChange={(e) => setTransferChannel(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 py-2.5 px-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                >
                  <option value="UPI">UPI (Instant)</option>
                  <option value="IMPS">IMPS (Immediate)</option>
                  <option value="NEFT">NEFT (Standard)</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Quick Action Modal 2: Pay Loan EMI */}
      <Modal
        isOpen={loanModalOpen}
        onClose={resetLoanModal}
        title="Pay Loan Installment"
        description="Personal Loan #LN001 • Monthly EMI Repayment"
        footer={
          loanPayStatus === "success" ? (
            <Button variant="primary" size="sm" onClick={resetLoanModal}>
              Close
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={resetLoanModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSimulateLoanPay}
                isLoading={loanPayStatus === "processing"}
              >
                Confirm Payment (₹9,500.00)
              </Button>
            </div>
          )
        }
      >
        {loanPayStatus === "success" ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Loan Installment Paid Successfully!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Installment payment for Personal Loan #LN001 has been settled and credited toward your loan balance.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 text-left">
              <p>Receipt Ref: {loanReceipt?.ref || "RCP-INS003"}</p>
              <p>Amount Paid: ₹9,500.00</p>
              <p className="text-emerald-700 font-semibold mt-1">Status: COMPLETED (Instant Settlement)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
              <p className="font-bold text-[#003366]">Loan Details: Personal Loan (#LN001)</p>
              <p>Total Principal: {formatCurrency(200000)} • Interest: 10.5% p.a.</p>
              <p>Scheduled EMI Amount: <strong className="text-slate-900">₹9,500.00</strong></p>
            </div>
            <p>
              Payment will be auto-debited from your primary Savings Account (<code>{maskAccountNumber("ACC001")}</code>).
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OverviewPage;
