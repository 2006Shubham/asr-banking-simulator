import React, { useState } from "react";
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
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  mockAccounts,
  mockTransactions,
  mockLoans,
  mockFDs,
} from "../../data/mockData";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { maskAccountNumber } from "../../utils/maskers";
import { Card, SectionHeading, Badge, Button, Modal, Input } from "../../components/common";

const OverviewPage = () => {
  const { customer } = useAuth();

  // Dynamic greeting based on user's current time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const customerName = customer?.name?.split(" ")[0] || "Suraj";

  // Financial summary metrics calculated from mock data
  const totalBalance = mockAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const activeLoansCount = mockLoans.filter((l) => l.status === "Active").length;
  const totalFdAmount = mockFDs.reduce((sum, fd) => sum + (fd.amount || 0), 0);

  // Transfer Money Simulation Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSourceAcc, setTransferSourceAcc] = useState(mockAccounts[0]?.accNo || "");
  const [transferBeneficiary, setTransferBeneficiary] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferChannel, setTransferChannel] = useState("UPI");
  const [transferStatus, setTransferStatus] = useState(null); // null | 'success'

  // Pay Loan EMI Simulation Modal State
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanPayStatus, setLoanPayStatus] = useState(null);

  const handleSimulateTransfer = (e) => {
    e.preventDefault();
    if (!transferBeneficiary || !transferAmount || Number(transferAmount) <= 0) return;

    setTransferStatus("processing");
    setTimeout(() => {
      setTransferStatus("success");
    }, 500);
  };

  const handleSimulateLoanPay = () => {
    setLoanPayStatus("processing");
    setTimeout(() => {
      setLoanPayStatus("success");
    }, 500);
  };

  const resetTransferModal = () => {
    setTransferModalOpen(false);
    setTransferStatus(null);
    setTransferBeneficiary("");
    setTransferAmount("");
  };

  const resetLoanModal = () => {
    setLoanModalOpen(false);
    setLoanPayStatus(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {customerName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome to your ASR Bank NetBanking overview. Here is your consolidated financial summary.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Customer ID: <strong className="font-mono text-slate-800">{customer?.custId || "CUST001"}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Primary Financial Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Balance Card */}
        <Card hoverable padding="md" className="border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Available Balance
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#003366] flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Consolidated across {mockAccounts.length} active bank accounts
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Status</span>
            <Badge variant="success" size="sm" dot>
              Active
            </Badge>
          </div>
        </Card>

        {/* Active Loans Card */}
        <Card hoverable padding="md" className="border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Loans
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                <BadgePercent className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {activeLoansCount} {activeLoansCount === 1 ? "Loan" : "Loans"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Personal Loan #{mockLoans[0]?.loanId} • {formatCurrency(mockLoans[0]?.amount)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Next EMI</span>
            <Badge variant="warning" size="sm">
              ₹9,500 Due 01 Apr
            </Badge>
          </div>
        </Card>

        {/* Fixed Deposits Card */}
        <Card hoverable padding="md" className="border-slate-200 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fixed Deposits
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                <PiggyBank className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalFdAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Deposit #{mockFDs[0]?.fdId} • 7.20% Annual Interest
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Matures</span>
            <span className="font-semibold text-slate-700">
              {formatDate(mockFDs[0]?.maturityDate)}
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Quick Actions Ribbon */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Quick Banking Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Action 1: View Accounts */}
          <Link
            to="/dashboard/accounts"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition text-center flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#003366] flex items-center justify-center group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-[#003366] transition">
              View Accounts
            </span>
          </Link>

          {/* Action 2: Transfer Money (Simulation Modal Trigger) */}
          <button
            type="button"
            onClick={() => setTransferModalOpen(true)}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
              Transfer Money
            </span>
          </button>

          {/* Action 3: Pay Loan (Simulation Modal Trigger) */}
          <button
            type="button"
            onClick={() => setLoanModalOpen(true)}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <BadgePercent className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition">
              Pay Loan EMI
            </span>
          </button>

          {/* Action 4: View FD */}
          <Link
            to="/dashboard/fd"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition text-center flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition">
              View FD
            </span>
          </Link>

          {/* Action 5: View Cards */}
          <Link
            to="/dashboard/cards"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-xs transition text-center flex flex-col items-center justify-center gap-2 group col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition">
              View Cards
            </span>
          </Link>
        </div>
      </div>

      {/* 4. Recent Transactions & Account Snapshot Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Transactions Table / Ledger List */}
        <div className="lg:col-span-8">
          <Card
            title="Recent Account Transactions"
            subtitle="Latest financial debits and credits recorded across your accounts"
            action={
              <Link
                to="/dashboard/transactions"
                className="text-xs text-[#003366] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Full Statement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="divide-y divide-slate-100">
              {mockTransactions.slice(0, 4).map((txn) => {
                const isCredit = txn.txnType === "Credit";
                return (
                  <div
                    key={txn.txnId}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
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
                        {isCredit ? "+" : "-"}
                        {formatCurrency(txn.amount)}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Account Portfolio Breakdown Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            title="Linked Accounts"
            subtitle="Current ledger holdings"
            action={
              <Link
                to="/dashboard/accounts"
                className="text-xs text-[#003366] font-semibold hover:underline"
              >
                Details
              </Link>
            }
          >
            <div className="space-y-3">
              {mockAccounts.map((acc) => (
                <div
                  key={acc.accNo}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
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
                  <p className="text-lg font-bold text-slate-900 font-mono pt-1">
                    {formatCurrency(acc.balance)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Security & KYC Quick Status Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900 to-[#00284d] text-white space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Security Assurance
              </h4>
            </div>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Your NetBanking session is encrypted. Account numbers and CVV numbers are masked in accordance with Indian banking safety guidelines.
            </p>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition pt-1"
            >
              <span>View KYC Verification Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Modal 1: Transfer Money Simulation */}
      <Modal
        isOpen={transferModalOpen}
        onClose={resetTransferModal}
        title="Simulated Fund Transfer"
        description="Transfer funds across accounts or via UPI/IMPS channels (Academic Simulator)"
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
              Transfer Simulated Successfully!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Simulated payment of <strong>{formatCurrency(Number(transferAmount))}</strong> to{" "}
              <strong>{transferBeneficiary}</strong> via {transferChannel}.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 text-left">
              <p>Reference: TXN{Math.floor(100000 + Math.random() * 900000)}</p>
              <p>Channel: {transferChannel}</p>
              <p>Timestamp: {new Date().toLocaleString("en-IN")}</p>
            </div>
            <p className="text-[11px] text-amber-700 italic">
              Notice: This is an academic demo simulation. No actual funds were debited.
            </p>
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
                {mockAccounts.map((acc) => (
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

      {/* Quick Action Modal 2: Pay Loan EMI Simulation */}
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
              Loan Installment Paid!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Installment #3 for Personal Loan #LN001 has been marked as <strong>Paid</strong> in the simulator ledger.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 text-left">
              <p>Receipt Ref: EMI-LN001-{Date.now().toString().slice(-6)}</p>
              <p>Amount Paid: ₹9,500.00</p>
              <p>Status: Success (Simulation)</p>
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
