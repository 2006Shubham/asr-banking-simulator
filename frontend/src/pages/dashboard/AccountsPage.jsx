import React, { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import accountService from "../../services/accountService";
import transactionService from "../../services/transactionService";
import { formatCurrency } from "../../utils/formatters";
import { maskAccountNumber } from "../../utils/maskers";
import { AccountCard } from "../../components/accounts";
import { SectionHeading, Badge, Button, Modal, Input, LoadingState } from "../../components/common";

const AccountsPage = () => {
  const { customer } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [portfolioSummary, setPortfolioSummary] = useState(null);

  // Transfer simulation modal state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedAccNo, setSelectedAccNo] = useState("");
  const [transferBeneficiary, setTransferBeneficiary] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferChannel, setTransferChannel] = useState("UPI");
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferReceipt, setTransferReceipt] = useState(null);
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const custId = customer?.custId || "CUST001";
        const [data, summary] = await Promise.all([
          accountService.getAccountsByCustomer(custId),
          accountService.getCustomerPortfolioSummary(custId).catch(() => null),
        ]);
        setAccounts(data);
        setPortfolioSummary(summary);
        if (data.length > 0) {
          setSelectedAccNo(data[0].accNo);
        }
      } catch (err) {
        console.error("Failed to load accounts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [customer]);

  const totalBalance = portfolioSummary?.totalBalance != null
    ? portfolioSummary.totalBalance
    : accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const handleOpenTransfer = (accNo) => {
    setSelectedAccNo(accNo || accounts[0]?.accNo || "");
    setTransferBeneficiary("");
    setTransferAmount("");
    setTransferChannel("UPI");
    setTransferSuccess(false);
    setTransferReceipt(null);
    setTransferError("");
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    setTransferError("");
    if (!transferBeneficiary || !transferAmount) return;

    const trimmed = transferBeneficiary.trim();
    const isAccNo = /^ACC\d+$/i.test(trimmed);
    const targetAcc = isAccNo ? trimmed.toUpperCase() : null;

    if (targetAcc && targetAcc === selectedAccNo) {
      setTransferError("Source and Destination accounts cannot be the same.");
      return;
    }

    try {
      const res = await transactionService.executeTransfer({
        fromAccNo: selectedAccNo,
        toAccNo: targetAcc,
        amount: transferAmount,
        channel: transferChannel,
        description: `Fund Transfer to ${trimmed}`,
        beneficiary: trimmed,
      });

      setTransferReceipt({
        ref: res.transaction?.refNo || res.ref || `TXN${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString("en-IN"),
      });
      setTransferSuccess(true);

      // Refresh accounts to reflect newly deducted balance from MySQL
      const updatedAccounts = await accountService.getAccountsByCustomer(customer?.custId || "CUST001");
      setAccounts(updatedAccounts);
    } catch (err) {
      console.error("Transfer failed", err);
      setTransferError(err.response?.data?.message || err.message || "Transfer failed. Please check balance and details.");
    }
  };

  if (loading) {
    return <LoadingState message="Loading your accounts and balances..." fullPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <SectionHeading
        title="Bank Accounts"
        subtitle="Manage your Savings and Current accounts, view liquidity, and monitor ledger balances."
        badge={
          <Badge variant="info" size="sm">
            {accounts.length} Active Accounts
          </Badge>
        }
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Send}
            onClick={() => handleOpenTransfer()}
          >
            Quick Transfer
          </Button>
        }
      />

      {/* Aggregate Balance Highlights Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Consolidated Balance
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-0.5 tracking-tight">
            {formatCurrency(totalBalance)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant transfer ready</span>
            </span>
            {portfolioSummary?.avgBalance != null && (
              <span className="text-[11px] text-slate-500 font-medium border-l border-slate-200 pl-2">
                Avg: <span className="font-mono text-slate-700">{formatCurrency(portfolioSummary.avgBalance)}</span>
              </span>
            )}
          </div>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Primary Savings Account
          </span>
          <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
            {maskAccountNumber(accounts[0]?.accNo || "ACC001")}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Balance: {formatCurrency(accounts[0]?.balance || 0)}
          </p>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Core Banking Branch
          </span>
          <p className="text-sm font-bold text-slate-800 mt-0.5">
            Pune Main Branch (ASRB0000101)
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            24x7 Digital NetBanking Active
          </p>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Your Linked Accounts ({accounts.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click eye icon to toggle account masking
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.accNo}
              account={account}
              onTransferClick={handleOpenTransfer}
            />
          ))}
        </div>
      </div>

      {/* Instant Fund Transfer Modal */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Instant Fund Transfer"
        description="Transfer funds securely across accounts or via UPI/IMPS with 24x7 instant settlement."
        footer={
          transferSuccess ? (
            <Button variant="primary" size="sm" onClick={() => setTransferModalOpen(false)}>
              Done
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setTransferModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecuteTransfer}>
                Confirm Transfer
              </Button>
            </div>
          )
        }
      >
        {transferSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Transfer Completed Successfully!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Fund transfer of <strong>{formatCurrency(Number(transferAmount))}</strong> to{" "}
              <strong>{transferBeneficiary}</strong> via {transferChannel} has been processed.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 text-left">
              <p>Reference: {transferReceipt?.ref || "TXN829104"}</p>
              <p>Debit Account: {selectedAccNo}</p>
              <p>Date: {transferReceipt?.date || "01/10/2026, 12:00:00 PM"}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            {transferError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {transferError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Source Account
              </label>
              <select
                value={selectedAccNo}
                onChange={(e) => setSelectedAccNo(e.target.value)}
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
              label="Beneficiary Account or UPI VPA"
              placeholder="e.g. 9876543210@upi or ACC002"
              required
              value={transferBeneficiary}
              onChange={(e) => setTransferBeneficiary(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount (₹)"
                type="number"
                placeholder="e.g. 2500"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Channel
                </label>
                <select
                  value={transferChannel}
                  onChange={(e) => setTransferChannel(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 py-2.5 px-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                >
                  <option value="UPI">UPI (Instant)</option>
                  <option value="IMPS">IMPS (24x7 Immediate)</option>
                  <option value="NEFT">NEFT (Batch Transfer)</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AccountsPage;
