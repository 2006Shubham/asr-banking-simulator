import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Eye,
  EyeOff,
  Calendar,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Send,
  Building,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { maskAccountNumber } from "../../utils/maskers";
import { Card, Badge, Button } from "../common";

/**
 * ASR Bank - Reusable AccountCard Component
 * Displays Account Number (Masked), Type, Balance, Open Date, and Status.
 */
const AccountCard = ({ account, onTransferClick }) => {
  const [showFullAcc, setShowFullAcc] = useState(false);

  if (!account) return null;

  const isSavings = account.accType === "Savings";

  return (
    <Card
      hoverable
      padding="none"
      className="border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
    >
      {/* Top Banner with Type and Status Badge */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                isSavings
                  ? "bg-blue-50 text-[#003366]"
                  : "bg-indigo-50 text-indigo-800"
              }`}
            >
              {isSavings ? <Wallet className="w-5 h-5" /> : <Building className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {account.accType} Account
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-slate-500 font-semibold tracking-wider">
                  {showFullAcc ? account.accNo : maskAccountNumber(account.accNo)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullAcc(!showFullAcc)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 focus:outline-none"
                  title={showFullAcc ? "Mask Account Number" : "Show Full Number"}
                >
                  {showFullAcc ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Badge
            variant={account.status === "Active" ? "success" : "neutral"}
            size="sm"
            dot
          >
            {account.status}
          </Badge>
        </div>

        {/* Balance Display */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Available Balance
          </p>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {formatCurrency(account.balance)}
            </span>
            {isSavings && (
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>4.0% p.a.</span>
              </span>
            )}
          </div>
        </div>

        {/* Account Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Opened On</span>
            <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(account.openDate)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">IFSC Code</span>
            <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
              ASRB0000101
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          to={`/dashboard/transactions`}
          className="text-xs font-bold text-[#003366] hover:underline inline-flex items-center gap-1"
        >
          <span>View Statement</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onTransferClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTransferClick(account.accNo)}
            icon={Send}
          >
            Transfer
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AccountCard;
