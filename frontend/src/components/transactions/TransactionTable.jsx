import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Badge, EmptyState } from "../common";

const TransactionTable = ({
  transactions,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onSelectTransaction,
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions match your filters"
        description="Try adjusting your search criteria, selecting another channel, or resetting the filter options."
        icon={Receipt}
      />
    );
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return <Badge variant="success" size="sm" dot>Success</Badge>;
      case "Pending":
        return <Badge variant="warning" size="sm" dot>Pending</Badge>;
      case "Failed":
        return <Badge variant="danger" size="sm" dot>Failed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Reference No</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {transactions.map((txn) => {
              const isCredit = txn.txnType === "Credit";
              return (
                <tr
                  key={txn.txnId}
                  onClick={() => onSelectTransaction(txn)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  {/* Transaction ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {txn.txnId}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {formatDate(txn.txnDate)}
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 font-medium text-slate-900 max-w-[200px] truncate">
                    {txn.description}
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        isCredit ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{txn.txnType}</span>
                    </span>
                  </td>

                  {/* Channel */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[10px]">
                      {txn.channel}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                    <span
                      className={isCredit ? "text-emerald-700" : "text-slate-900"}
                    >
                      {isCredit ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(txn.status)}
                  </td>

                  {/* Reference Number */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {txn.refNo}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(txn);
                      }}
                      className="p-1.5 text-slate-400 group-hover:text-[#003366] hover:bg-blue-100/60 rounded-lg transition"
                      title="View Receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-slate-50/75 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-slate-800">
              {Math.min(currentPage * pageSize, totalItems)}
            </strong>{" "}
            of <strong className="text-slate-800">{totalItems}</strong> transactions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-300 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-semibold text-slate-800 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-300 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
