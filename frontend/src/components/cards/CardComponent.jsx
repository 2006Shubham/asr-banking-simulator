import React, { useState } from "react";
import {
  CreditCard,
  Wifi,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Copy,
  SlidersHorizontal,
  Globe,
  ShoppingCart,
  Banknote,
} from "lucide-react";
import { formatDate } from "../../utils/formatters";
import { maskCardNumber, maskAccountNumber, maskCVV } from "../../utils/maskers";
import { Card, Badge, Button } from "../common";

/**
 * ASR Bank - Reusable CardComponent
 * Displays a realistic banking card and associated management attributes:
 * - Card Type (Debit / Credit)
 * - Masked Card Number (XXXX XXXX XXXX 1234)
 * - Issue Date
 * - Expiry Date
 * - Status
 * - Masked CVV (***)
 *
 * Strictly adheres to security rules: Never reveals full card number or real CVV.
 */
const CardComponent = ({
  card,
  customerName = "SURAJ W",
  onStatusChange,
}) => {
  const [isFrozen, setIsFrozen] = useState(card?.status === "Blocked");
  const [onlineTxnEnabled, setOnlineTxnEnabled] = useState(true);
  const [intlTxnEnabled, setIntlTxnEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!card) return null;

  const isDebit = card.cardType?.toLowerCase() === "debit";
  const maskedNumber = maskCardNumber(card.cardNo);
  const currentStatus = isFrozen ? "Blocked" : card.status || "Active";

  // Format MM/YY for card face display
  const getExpiryShort = (dateStr) => {
    if (!dateStr) return "12/28";
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
  };

  const handleToggleFreeze = () => {
    const nextState = !isFrozen;
    setIsFrozen(nextState);
    if (onStatusChange) {
      onStatusChange(card.cardNo, nextState ? "Blocked" : "Active");
    }
  };

  const handleCopyMasked = () => {
    navigator.clipboard?.writeText?.(maskedNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      hoverable
      padding="none"
      className="border-slate-200 overflow-hidden shadow-xs transition-all duration-200"
    >
      <div className="p-6 space-y-6">
        {/* 1. Realistic Physical-Style Banking Card Surface */}
        <div
          className={`relative w-full rounded-2xl p-6 sm:p-7 text-white shadow-xl transition-all duration-300 overflow-hidden ${
            isDebit
              ? "bg-gradient-to-tr from-[#001f3f] via-[#003366] to-[#0c4a80] border border-blue-900/60"
              : "bg-gradient-to-tr from-slate-950 via-slate-900 to-[#2c1d11] border border-amber-900/40"
          } ${isFrozen ? "opacity-75 saturate-50" : ""}`}
        >
          {/* Subtle Background Pattern & Glow */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

          {/* Card Top: Bank Logo, Contactless Icon & Card Type */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-extrabold text-xs tracking-wider text-amber-300">
                ASR
              </div>
              <div>
                <span className="font-extrabold tracking-wider text-sm text-white">
                  ASR BANK
                </span>
                <span className="text-[9px] block text-slate-300 tracking-widest uppercase font-medium">
                  {isDebit ? "Retail Banking" : "Platinum Signature"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-white/80 rotate-90" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/20 text-white">
                {card.cardType}
              </span>
            </div>
          </div>

          {/* Card Middle: EMV Golden Chip & Status Indicator */}
          <div className="flex items-center justify-between my-6 relative z-10">
            {/* EMV Golden Chip */}
            <div className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 p-1 shadow-sm border border-amber-300/80 flex flex-col justify-between">
              <div className="flex justify-between items-center h-full border border-amber-600/30 rounded-xs px-1">
                <div className="w-2.5 h-3 border-r border-amber-600/40"></div>
                <div className="w-2.5 h-3 border-l border-amber-600/40"></div>
              </div>
            </div>

            {/* Frozen / Active Ribbon */}
            {isFrozen ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-200 border border-red-500/40 backdrop-blur-sm">
                <Lock className="w-3.5 h-3.5" />
                Temporarily Locked
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active & Enabled
              </span>
            )}
          </div>

          {/* Masked Card Number: Always XXXX XXXX XXXX 1234 */}
          <div className="my-4 relative z-10">
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold mb-1">
              Card Number (Masked)
            </p>
            <div className="flex items-center gap-3">
              <p className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-white drop-shadow-xs">
                {maskedNumber}
              </p>
              <button
                onClick={handleCopyMasked}
                title="Copy masked number"
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Bottom: Cardholder, Expiry, CVV & Network */}
          <div className="flex items-end justify-between pt-3 border-t border-white/15 relative z-10 text-xs">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">
                Cardholder
              </p>
              <p className="font-bold tracking-wider text-white uppercase text-sm mt-0.5">
                {customerName}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">
                Valid Thru
              </p>
              <p className="font-mono font-bold text-white text-xs mt-0.5">
                {getExpiryShort(card.expiryDate)}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium flex items-center gap-1">
                <EyeOff className="w-2.5 h-2.5" /> CVV
              </p>
              <p className="font-mono font-bold text-slate-200 text-xs mt-0.5 tracking-widest">
                {maskCVV()}
              </p>
            </div>

            <div className="text-right">
              <span className="font-black italic text-base tracking-tighter text-white/90 drop-shadow-xs">
                {isDebit ? "RuPay" : "VISA"}
              </span>
            </div>
          </div>
        </div>

        {copied && (
          <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium animate-fadeIn">
            ✓ Masked card number copied to clipboard
          </div>
        )}

        {/* 2. Structured Card Information Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Card Type
            </span>
            <p className="font-bold text-slate-900 mt-0.5">
              {card.cardType} Card
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Status
            </span>
            <div className="mt-0.5">
              <Badge
                variant={currentStatus === "Active" ? "success" : "danger"}
                size="sm"
                dot
              >
                {currentStatus}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Issue Date
            </span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {formatDate(card.issueDate)}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Expiry Date
            </span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {formatDate(card.expiryDate)}
            </p>
          </div>
        </div>

        {/* 3. Account Linkage & Domestic Controls Simulation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-slate-500 font-medium">Linked Account:</span>{" "}
              {card.accNo ? (
                <span className="font-mono font-semibold text-slate-900">
                  {maskAccountNumber(card.accNo)} (Primary Savings)
                </span>
              ) : (
                <span className="text-slate-600 font-medium">
                  Standalone Revolving Credit Facility
                </span>
              )}
            </div>

            <Button
              variant={isFrozen ? "outline" : "danger"}
              size="sm"
              onClick={handleToggleFreeze}
              icon={isFrozen ? Unlock : Lock}
              className="text-xs py-1"
            >
              {isFrozen ? "Unlock / Unfreeze Card" : "Temporary Lock Card"}
            </Button>
          </div>

          {/* Toggle Switches (Simulated local state) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">Online Purchases</span>
              </div>
              <button
                type="button"
                disabled={isFrozen}
                onClick={() => setOnlineTxnEnabled(!onlineTxnEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  onlineTxnEnabled && !isFrozen ? "bg-emerald-600" : "bg-slate-300"
                } ${isFrozen ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    onlineTxnEnabled && !isFrozen ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">International Usage</span>
              </div>
              <button
                type="button"
                disabled={isFrozen}
                onClick={() => setIntlTxnEnabled(!intlTxnEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  intlTxnEnabled && !isFrozen ? "bg-emerald-600" : "bg-slate-300"
                } ${isFrozen ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    intlTxnEnabled && !isFrozen ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CardComponent;
