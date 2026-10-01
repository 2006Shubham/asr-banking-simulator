import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  Database,
} from "lucide-react";
import transactionService from "../../services/transactionService";
import { formatCurrency } from "../../utils/formatters";
import {
  TransactionTable,
  TransactionFilters,
  TransactionDetailsModal,
} from "../../components/transactions";
import { SectionHeading, Badge, Button, LoadingState } from "../../components/common";

const PAGE_SIZE = 6;

const TransactionsPage = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states (local state management)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterChannel, setFilterChannel] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterAccount, setFilterAccount] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal inspection state
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Fetch transactions using transactionService abstraction
  useEffect(() => {
    const fetchTxns = async () => {
      try {
        setLoading(true);
        const data = await transactionService.getTransactions();
        setAllTransactions(data);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTxns();
  }, []);

  // Filter transactions using local state
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((txn) => {
      // 1. Text Search Filter (Description, Ref No, Txn ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = txn.description?.toLowerCase().includes(query);
        const matchesRef = txn.refNo?.toLowerCase().includes(query);
        const matchesId = txn.txnId?.toLowerCase().includes(query);
        if (!matchesDesc && !matchesRef && !matchesId) return false;
      }

      // 2. Type Filter (Credit / Debit)
      if (filterType !== "ALL" && txn.txnType !== filterType) {
        return false;
      }

      // 3. Channel Filter (UPI / NEFT / IMPS)
      if (filterChannel !== "ALL" && txn.channel !== filterChannel) {
        return false;
      }

      // 4. Status Filter (Success / Pending / Failed)
      if (filterStatus !== "ALL" && txn.status !== filterStatus) {
        return false;
      }

      // 5. Account Filter (ACC001 / ACC002)
      if (filterAccount !== "ALL" && txn.accNo !== filterAccount) {
        return false;
      }

      return true;
    });
  }, [allTransactions, searchQuery, filterType, filterChannel, filterStatus, filterAccount]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterChannel, filterStatus, filterAccount]);

  // Calculate paginated slice
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, currentPage]);

  // Financial metrics for filtered set
  const totalCredits = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.txnType === "Credit" && t.status === "Success")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalDebits = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.txnType === "Debit" && t.status === "Success")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filterType !== "ALL" ||
    filterChannel !== "ALL" ||
    filterStatus !== "ALL" ||
    filterAccount !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterType("ALL");
    setFilterChannel("ALL");
    setFilterStatus("ALL");
    setFilterAccount("ALL");
  };

  const handleSelectTransaction = (txn) => {
    setSelectedTxn(txn);
    setDetailsModalOpen(true);
  };

  if (loading) {
    return <LoadingState message="Loading your transaction history..." fullPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <SectionHeading
        title="Transaction Statements"
        subtitle="Search, filter, and inspect debits, credits, and multi-channel payment ledger records."
        badge={
          <Badge variant="info" size="sm">
            {allTransactions.length} Total Records
          </Badge>
        }
        action={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => alert("Simulation: Statement CSV export downloaded.")}
          >
            Export Statement
          </Button>
        }
      />

      {/* Financial Turnover Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Matching Transactions
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {filteredTransactions.length}{" "}
            <span className="text-xs font-normal text-slate-400">
              of {allTransactions.length}
            </span>
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Filtered Credits
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            +{formatCurrency(totalCredits)}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Filtered Debits
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">
            -{formatCurrency(totalDebits)}
          </p>
        </div>
      </div>

      {/* Filter Control Box */}
      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterChannel={filterChannel}
        onChannelChange={setFilterChannel}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterAccount={filterAccount}
        onAccountChange={setFilterAccount}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Transaction Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Click on any transaction row to view the full receipt.</span>
          <span>Filtered Results: {filteredTransactions.length}</span>
        </div>

        <TransactionTable
          transactions={paginatedTransactions}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={filteredTransactions.length}
          onPageChange={setCurrentPage}
          onSelectTransaction={handleSelectTransaction}
        />
      </div>

      {/* Academic Relational Schema Indicator */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Database className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800">
            DBMS Concept: <code>ACCOUNT (1) ──── (N) TRANSACTION</code>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Every transaction row records a ledger entry tied to <code>acc_no</code> with audit metadata:
            amount, transaction type (Credit/Debit), payment channel (UPI, NEFT, IMPS), and a unique reference number constraint.
          </p>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionDetailsModal
        transaction={selectedTxn}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedTxn(null);
        }}
      />
    </div>
  );
};

export default TransactionsPage;
