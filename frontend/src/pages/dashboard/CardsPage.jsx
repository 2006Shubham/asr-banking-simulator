import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Database,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import cardService from "../../services/cardService";
import { CardComponent } from "../../components/cards";
import { SectionHeading, Badge, Button, Modal, LoadingState } from "../../components/common";

const CardsPage = () => {
  const { customer } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'debit' | 'credit'

  // PIN Simulation Modal State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const data = await cardService.getCardsByCustomer(customer?.custId || "CUST001");
        setCards(data);
      } catch (err) {
        console.error("Failed to load cards", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [customer]);

  const handleCardStatusChange = (cardNo, newStatus) => {
    setCards((prev) =>
      prev.map((c) => (c.cardNo === cardNo ? { ...c, status: newStatus } : c))
    );
  };

  const filteredCards = cards.filter((c) => {
    if (activeFilter === "debit") return c.cardType?.toLowerCase() === "debit";
    if (activeFilter === "credit") return c.cardType?.toLowerCase() === "credit";
    return true;
  });

  const activeCount = cards.filter((c) => c.status === "Active").length;
  const customerName = customer?.name || "Suraj Walke";

  if (loading) {
    return <LoadingState message="Loading your debit and credit cards..." fullPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeading
          title="Cards Management"
          subtitle="Manage your physical and virtual cards, control domestic usage limits, and toggle temporary locks."
          badge={
            <Badge variant="info" size="sm">
              {cards.length} Issued Card{cards.length !== 1 ? "s" : ""}
            </Badge>
          }
        />

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPinSuccess(false);
              setPinModalOpen(true);
            }}
            icon={KeyRound}
            className="text-xs"
          >
            Generate Green PIN
          </Button>
        </div>
      </div>

      {/* 2. Security Advisory Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-blue-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#003366] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[#003366]">
              RBI Card Data Security & Masking Standard
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Full primary account numbers (PAN) and CVV codes are never displayed or stored in plaintext. All cards are tokenized and masked as <code>XXXX XXXX XXXX 1234</code>.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white font-semibold text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {activeCount} Active / Operational
          </span>
        </div>
      </div>

      {/* 3. Filter Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === "all"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Cards ({cards.length})
          </button>
          <button
            onClick={() => setActiveFilter("debit")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === "debit"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Debit Cards ({cards.filter((c) => c.cardType === "Debit").length})
          </button>
          <button
            onClick={() => setActiveFilter("credit")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === "credit"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Credit Cards ({cards.filter((c) => c.cardType === "Credit").length})
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* 4. Multi-Card Grid using reusable CardComponent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCards.map((card) => (
          <CardComponent
            key={card.cardNo}
            card={card}
            customerName={customerName}
            onStatusChange={handleCardStatusChange}
          />
        ))}
      </div>

      {/* 5. DBMS Relational Design Callout */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 flex items-start gap-3">
        <Database className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            DBMS Relational Design: <code>CUSTOMER (1) ──── (N) CARD</code> & <code>ACCOUNT (1) ───?─ (N) CARD</code>
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            In our relational database schema, the <code>card</code> table features primary key <code>card_no</code>. 
            For Debit Cards, foreign key <code>acc_no</code> links to <code>account(acc_no)</code> with <code>ON DELETE CASCADE</code>. 
            For Credit Cards, <code>acc_no</code> is nullable (<code>NULL</code>), representing standalone revolving credit limits.
          </p>
        </div>
      </div>

      {/* 6. Green PIN Simulation Modal */}
      <Modal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        title="Simulate Green PIN Generation"
        description="Generate or reset your 4-digit ATM card PIN securely via NetBanking OTP verification."
        footer={
          pinSuccess ? (
            <Button variant="primary" size="sm" onClick={() => setPinModalOpen(false)}>
              Done
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPinModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPinSuccess(true)}
              >
                Simulate PIN Setup
              </Button>
            </div>
          )
        }
      >
        {pinSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              New PIN Successfully Set!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your 4-digit ATM PIN has been simulated and updated in the card ledger. You can now use your card at all domestic ATMs and POS terminals.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Card
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#003366] focus:outline-hidden">
                {cards.map((c) => (
                  <option key={c.cardNo} value={c.cardNo}>
                    {c.cardType} Card — XXXX XXXX XXXX {c.cardNo.slice(-4)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  defaultValue="4829"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-center tracking-widest focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  defaultValue="4829"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-center tracking-widest focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              * Simulation only. No real banking operations or network calls are made.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CardsPage;
