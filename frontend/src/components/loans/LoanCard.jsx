import React, { useState } from "react";
import {
  BadgePercent,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Car,
  Home,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Card, Badge, Button } from "../common";

/**
 * ASR Bank - Reusable LoanCard Component
 * Displays Loan ID, Type, Amount, Interest Rate, Start Date, Tenure, and Status.
 * Features an expandable/collapsible section for Loan Installments.
 */
const LoanCard = ({ loan, installments = [], onPayEmi }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!loan) return null;

  const paidCount = installments.filter((i) => i.status === "Paid").length;
  const pendingCount = installments.filter((i) => i.status === "Pending").length;
  const totalRepaidAmount = installments
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const getLoanIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "vehicle":
        return <Car className="w-5 h-5" />;
      case "home":
        return <Home className="w-5 h-5" />;
      default:
        return <BadgePercent className="w-5 h-5" />;
    }
  };

  const getInstallmentStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <Badge variant="success" size="sm" dot>
            Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="warning" size="sm" dot>
            Pending
          </Badge>
        );
      case "Overdue":
        return (
          <Badge variant="danger" size="sm" dot>
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card
      hoverable
      padding="none"
      className="border-slate-200 overflow-hidden shadow-xs transition-all duration-200"
    >
      {/* 1. Main Loan Summary Header */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold shadow-xs">
              {getLoanIcon(loan.loanType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {loan.loanType} Loan
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  #{loan.loanId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Amortized retail borrowing contract
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Badge
              variant={loan.status === "Active" ? "success" : "neutral"}
              size="sm"
              dot
            >
              {loan.status}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? ChevronUp : ChevronDown}
              iconPosition="right"
              className="text-xs"
            >
              {isExpanded ? "Hide EMIs" : `View EMIs (${installments.length})`}
            </Button>
          </div>
        </div>

        {/* 2. Loan Attributes Grid (Amount, Rate, Start Date, Tenure) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sanctioned Amount
            </span>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
              {formatCurrency(loan.amount)}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Interest Rate
            </span>
            <p className="text-xl font-extrabold text-amber-800 font-mono mt-0.5 flex items-center gap-1">
              <span>{loan.interestRate}%</span>
              <span className="text-xs font-normal text-slate-400">p.a.</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Start Date
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(loan.startDate)}</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Tenure Period
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{loan.tenure} Months</span>
            </p>
          </div>
        </div>

        {/* 3. Repayment Progress Tracker */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">Repayment Track:</span>
            <span className="font-semibold text-slate-800">
              {paidCount} Paid • {pendingCount} Pending
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>
              Total Principal Repaid: <strong className="text-emerald-700 font-mono">{formatCurrency(totalRepaidAmount)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Expandable Installments Section */}
      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Amortization Schedule & Installments
            </h4>
            <span className="text-[11px] text-slate-400">
              Auto-debited from primary savings account
            </span>
          </div>

          {installments.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No installment records found for this loan.
            </p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Installment</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4">EMI Amount</th>
                      <th className="py-2.5 px-4">Paid On</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {installments.map((inst) => {
                      const isPaid = inst.status === "Paid";
                      return (
                        <tr key={inst.installmentId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            EMI #{inst.installmentNo}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                            {formatDate(inst.dueDate)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatCurrency(inst.amount)}
                          </td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {inst.paidOn ? formatDate(inst.paidOn) : "—"}
                          </td>
                          <td className="py-3 px-4">
                            {getInstallmentStatusBadge(inst.status)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isPaid && onPayEmi ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onPayEmi(loan, inst)}
                                className="text-[11px] py-1 px-2.5 bg-amber-600 hover:bg-amber-700"
                              >
                                Pay Now
                              </Button>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Paid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default LoanCard;
