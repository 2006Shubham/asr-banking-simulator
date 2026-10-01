import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Database,
  Calculator,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import fdService from "../../services/fdService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { FDCard } from "../../components/fd";
import { SectionHeading, Badge, Button, Modal, LoadingState } from "../../components/common";

const FDPage = () => {
  const { customer } = useAuth();
  const [fds, setFds] = useState([]);
  const [interestsMap, setInterestsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // FD Calculator Modal State (Information / Simulation)
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcPrincipal, setCalcPrincipal] = useState("100000");
  const [calcTenureYears, setCalcTenureYears] = useState("1");
  const [calcRate, setCalcRate] = useState("7.20");

  useEffect(() => {
    const fetchFDData = async () => {
      try {
        setLoading(true);
        const fdsData = await fdService.getFDsByCustomer(customer?.custId || "CUST001");
        setFds(fdsData);

        // Fetch interest schedules for all FDs
        const map = {};
        for (const fd of fdsData) {
          const interests = await fdService.getInterestsByFD(fd.fdId);
          map[fd.fdId] = interests;
        }
        setInterestsMap(map);
      } catch (err) {
        console.error("Failed to load FD details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFDData();
  }, [customer]);

  // Aggregate metrics
  const totalPrincipal = fds.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalInterestProjected = Object.values(interestsMap)
    .flat()
    .reduce((sum, item) => sum + (item.interestAmount || 0), 0);
  const totalMaturityValue = totalPrincipal + totalInterestProjected;

  // Find nearest upcoming maturity
  const sortedByMaturity = [...fds].sort(
    (a, b) => new Date(a.maturityDate) - new Date(b.maturityDate)
  );
  const nextMaturingFD = sortedByMaturity[0];

  // Quick Calculator logic
  const p = parseFloat(calcPrincipal) || 0;
  const t = parseFloat(calcTenureYears) || 0;
  const r = parseFloat(calcRate) || 0;
  const estimatedEstInterest = Math.round(p * (r / 100) * t);
  const estimatedMaturity = p + estimatedEstInterest;

  if (loading) {
    return <LoadingState message="Loading Fixed Deposit portfolios and interest tables..." fullPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeading
          title="Fixed Deposits (FD)"
          subtitle="Review guaranteed return term deposits, track calculation dates, and monitor interest payouts."
          badge={
            <Badge variant="success" size="sm">
              {fds.length} Active Deposit{fds.length !== 1 ? "s" : ""}
            </Badge>
          }
        />

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCalculatorOpen(true)}
            icon={Calculator}
            className="text-xs"
          >
            FD Calculator
          </Button>
        </div>
      </div>

      {/* 2. Aggregate Fixed Deposit Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Fixed Deposit Balance
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-0.5 tracking-tight">
            {formatCurrency(totalPrincipal)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Allocated across {fds.length} active term contracts
          </span>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Estimated Maturity Payout
          </span>
          <p className="text-xl font-bold text-emerald-700 font-mono mt-0.5">
            {formatCurrency(totalMaturityValue)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Includes <strong className="text-emerald-800 font-mono">+{formatCurrency(totalInterestProjected)}</strong> in interest
          </p>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Earliest Maturity
          </span>
          <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>{nextMaturingFD ? formatDate(nextMaturingFD.maturityDate) : "—"}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Deposit #{nextMaturingFD?.fdId || "N/A"} • Auto-credit on maturity
          </p>
        </div>
      </div>

      {/* 3. Fixed Deposit Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Your Term Deposits ({fds.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click "Interest Details" to view individual accrual and payout dates
          </span>
        </div>

        <div className="space-y-6">
          {fds.map((fd, idx) => (
            <FDCard
              key={fd.fdId}
              fd={fd}
              interests={interestsMap[fd.fdId] || []}
              defaultExpanded={idx === 0}
            />
          ))}
        </div>
      </div>

      {/* 4. DBMS Relational Concept Callout */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 flex items-start gap-3">
        <Database className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-emerald-950">
            DBMS Relational Design: <code>FIXED_DEPOSIT (1) ──── (N) FD_INTEREST</code>
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            In our database schema, each interest record maintains a referential integrity constraint pointing to 
            <code>fixed_deposit(fd_id)</code> with <code>ON DELETE CASCADE</code>. Each record captures the 
            <code>calc_date</code>, <code>payout_date</code>, and settlement status (<code>Pending</code> or <code>Credited</code>).
          </p>
        </div>
      </div>

      {/* 5. Fixed Deposit Simulator Calculator Modal */}
      <Modal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        title="Fixed Deposit Yield Calculator"
        description="Estimate returns on term deposits based on current ASR Bank interest slabs."
        footer={
          <Button variant="primary" size="sm" onClick={() => setCalculatorOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Amount (₹)
            </label>
            <input
              type="number"
              value={calcPrincipal}
              onChange={(e) => setCalcPrincipal(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#003366]"
              placeholder="e.g. 100000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tenure (Years)
              </label>
              <select
                value={calcTenureYears}
                onChange={(e) => setCalcTenureYears(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#003366]"
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Rate (%)
              </label>
              <input
                type="text"
                value={calcRate}
                onChange={(e) => setCalcRate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-slate-50"
                readOnly
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 mt-4">
            <div className="flex justify-between items-center text-slate-700">
              <span>Estimated Interest:</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                +{formatCurrency(estimatedEstInterest)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-900 border-t border-emerald-200/60 pt-2">
              <span className="font-semibold">Maturity Value:</span>
              <span className="font-mono font-extrabold text-base text-slate-900">
                {formatCurrency(estimatedMaturity)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Interest is calculated assuming annual compounding as per standard RBI guidelines for domestic term deposits.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default FDPage;
