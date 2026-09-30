import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Copy,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { maskAccountNumber } from "../../utils/maskers";
import { Modal, Badge, Button } from "../common";

const TransactionDetailsModal = ({ transaction, isOpen, onClose }) => {
  if (!transaction) return null;

  const isCredit = transaction.txnType === "Credit";

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return <Badge variant="success" dot>Success</Badge>;
      case "Pending":
        return <Badge variant="warning" dot>Pending</Badge>;
      case "Failed":
        return <Badge variant="danger" dot>Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Receipt"
      description={`Transaction ID: ${transaction.txnId}`}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-[11px] text-slate-400">
            ASR Core Banking Ledger Verified
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Receipt
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Amount & Status Banner */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 justify-center mb-1">
            {getStatusBadge(transaction.status)}
          </div>
          <p
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              isCredit ? "text-emerald-600" : "text-slate-900"
            }`}
          >
            {isCredit ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            {transaction.description}
          </p>
        </div>

        {/* Detailed Metadata Breakdown */}
        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400">Transaction Type</span>
            <span className="font-semibold text-slate-900">{transaction.txnType}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400">Payment Channel</span>
            <span className="font-semibold text-[#003366] px-2 py-0.5 rounded bg-blue-50">
              {transaction.channel}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400">Linked Account</span>
            <span className="font-mono font-medium text-slate-800">
              {maskAccountNumber(transaction.accNo)}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400">Bank Reference No</span>
            <span className="font-mono font-semibold text-slate-900 select-all">
              {transaction.refNo}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400">Transaction Timestamp</span>
            <span className="font-medium text-slate-700">
              {new Date(transaction.txnDate).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        {/* Security watermark */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Simulated electronic statement record</span>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailsModal;
