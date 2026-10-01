import React, { useState } from "react";
import {
  PiggyBank,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Card, Badge, Button } from "../common";

/**
 * ASR Bank - Reusable FDCard Component
 * Displays FD ID, Amount, Interest Rate, Start Date, Maturity Date, and Status.
 * Features an expandable section showing:
 *  - Interest Amount
 *  - Calculation Date
 *  - Payout Date
 *  - Status
 */
const FDCard = ({ fd, interests = [], defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!fd) return null;

  const totalInterest = interests.reduce((sum, item) => sum + (item.interestAmount || 0), 0);
  const creditedInterest = interests
    .filter((i) => i.status === "Credited")
    .reduce((sum, item) => sum + (item.interestAmount || 0), 0);
  const maturityValue = (fd.amount || 0) + totalInterest;

  const getFDStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="success" size="sm" dot>
            Active
          </Badge>
        );
      case "Matured":
        return (
          <Badge variant="neutral" size="sm">
            Matured
          </Badge>
        );
      case "Closed":
        return (
          <Badge variant="danger" size="sm">
            Closed
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getInterestStatusBadge = (status) => {
    switch (status) {
      case "Credited":
        return (
          <Badge variant="success" size="sm" dot>
            Credited
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="warning" size="sm" dot>
            Pending
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
      {/* 1. Header with FD ID, Account Type & Status */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Fixed Deposit Account
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  #{fd.fdId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Guaranteed high-yield term investment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {getFDStatusBadge(fd.status)}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? ChevronUp : ChevronDown}
              iconPosition="right"
              className="text-xs"
            >
              {isExpanded ? "Hide Interest" : `Interest Details (${interests.length})`}
            </Button>
          </div>
        </div>

        {/* 2. Key Attributes Grid: Amount, Interest Rate, Start Date, Maturity Date */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Principal Amount
            </span>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
              {formatCurrency(fd.amount)}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Interest Rate
            </span>
            <p className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5 flex items-center gap-1">
              <span>{fd.interestRate}%</span>
              <span className="text-xs font-normal text-slate-400">p.a.</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Start Date
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDate(fd.startDate)}</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Maturity Date
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{formatDate(fd.maturityDate)}</span>
            </p>
          </div>
        </div>

        {/* 3. Interest & Yield Summary Banner */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-600 font-medium">Estimated Maturity Value:</span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">
              {formatCurrency(maturityValue)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              Total Accrued / Projected:{" "}
              <strong className="text-emerald-700 font-mono font-semibold">
                +{formatCurrency(totalInterest)}
              </strong>
            </span>
            {creditedInterest > 0 && (
              <span className="hidden md:inline">
                (Credited: <strong className="text-slate-700 font-mono">{formatCurrency(creditedInterest)}</strong>)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Expandable Section Showing Interest Schedules */}
      {isExpanded && (
        <div className="bg-slate-50/70 border-t border-slate-200 p-4 sm:p-6 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Interest Accrual & Payout Schedule
            </h4>
            <span className="text-[11px] text-slate-400">
              Credited directly to linked primary savings account
            </span>
          </div>

          {interests.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No interest payout records scheduled for this deposit.
            </p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Interest ID</th>
                      <th className="py-2.5 px-4">Interest Amount</th>
                      <th className="py-2.5 px-4">Calculation Date</th>
                      <th className="py-2.5 px-4">Payout Date</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {interests.map((item) => (
                      <tr
                        key={item.interestId}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          {item.interestId}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          +{formatCurrency(item.interestAmount)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {formatDate(item.calcDate)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {formatDate(item.payoutDate)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {getInterestStatusBadge(item.status)}
                        </td>
                      </tr>
                    ))}
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

export default FDCard;
