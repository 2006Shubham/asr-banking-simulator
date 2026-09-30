import React from "react";
import { mockCards } from "../../data/mockData";
import { formatDate } from "../../utils/formatters";
import { maskCardNumber, maskCVV } from "../../utils/maskers";
import { CreditCard, ShieldCheck } from "lucide-react";

const CardsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Cards Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Active debit and credit cards with masked security credentials. (Placeholder Page)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockCards.map((card) => (
          <div
            key={card.cardNo}
            className="rounded-2xl p-6 text-white bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 shadow-md border border-slate-700 space-y-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                ASR Bank • {card.cardType} Card
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {card.status}
              </span>
            </div>

            {/* Chip & Icon */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-7 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                <div className="w-6 h-4 border border-amber-600/50 rounded-sm"></div>
              </div>
              <CreditCard className="w-7 h-7 text-slate-400" />
            </div>

            {/* Masked Card Number */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Card Number</p>
              <p className="font-mono text-lg sm:text-xl tracking-wider font-semibold text-slate-100">
                {maskCardNumber(card.cardNo)}
              </p>
            </div>

            {/* Metadata Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Expires</p>
                <p className="font-semibold text-slate-200">{formatDate(card.expiryDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">CVV</p>
                <p className="font-mono font-semibold text-slate-200">{maskCVV()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Issued</p>
                <p className="text-slate-300">{formatDate(card.issueDate)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardsPage;
