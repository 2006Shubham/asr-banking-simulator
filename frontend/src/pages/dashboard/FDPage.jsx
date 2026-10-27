import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Calculator,
  PlusCircle,
  CheckCircle2,
  PiggyBank,
  ShieldCheck,
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

  // Book New FD Modal State (Live Transaction)
  const [openModalOpen, setOpenModalOpen] = useState(false);
  const [newFdAmount, setNewFdAmount] = useState("50000");
  const [newFdDuration, setNewFdDuration] = useState("12");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createdFd, setCreatedFd] = useState(null);

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

  // Live Booking Logic
  const durationMonthsInt = parseInt(newFdDuration, 10);
  const bookingRate = durationMonthsInt === 6 ? 6.50 : durationMonthsInt === 12 ? 7.20 : durationMonthsInt === 24 ? 7.50 : 7.80;
  const bookAmountNum = parseFloat(newFdAmount) || 0;
  const bookEstInterest = Math.round(bookAmountNum * (bookingRate / 100) * (durationMonthsInt / 12));
  const bookEstMaturity = bookAmountNum + bookEstInterest;

  const handleCreateFD = async (e) => {
    e.preventDefault();
    if (!bookAmountNum || bookAmountNum < 5000) {
      alert("Minimum Fixed Deposit amount is ₹5,000.");
      return;
    }

    try {
      setCreating(true);
      const newFd = await fdService.createFD({
        custId: customer?.custId || "CUST001",
        branchId: "BR001",
        amount: bookAmountNum,
        interestRate: bookingRate,
        durationMonths: durationMonthsInt,
      });

      // Fetch the newly generated interest record
      let newInterests = [];
      try {
        newInterests = await fdService.getInterestsByFD(newFd.fdId);
      } catch (err) {
        console.warn("Could not fetch new FD interests", err);
      }

      setFds((prev) => [newFd, ...prev]);
      setInterestsMap((prev) => ({
        ...prev,
        [newFd.fdId]: newInterests,
      }));

      setCreatedFd(newFd);
      setCreateSuccess(true);
    } catch (err) {
      console.error("Failed to book Fixed Deposit", err);
      alert(err.response?.data?.message || "Failed to book Fixed Deposit. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCloseCreateModal = () => {
    setOpenModalOpen(false);
    setCreateSuccess(false);
    setCreatedFd(null);
  };

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
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setCreateSuccess(false);
              setCreatedFd(null);
              setOpenModalOpen(true);
            }}
            icon={PlusCircle}
            className="text-xs bg-[#003366] hover:bg-[#002244]"
          >
            Open New Deposit
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

      {/* 4. Fixed Deposit Yield Calculator Modal */}
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

      {/* Book New Fixed Deposit Modal (Live Transaction) */}
      <Modal
        isOpen={openModalOpen}
        onClose={handleCloseCreateModal}
        title="Open New Fixed Deposit"
        description="Book a term deposit with guaranteed returns credited directly to your account"
        footer={
          createSuccess ? (
            <Button variant="primary" size="sm" onClick={handleCloseCreateModal}>
              Done
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleCloseCreateModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateFD}
                isLoading={creating}
                className="bg-[#003366] hover:bg-[#002244]"
              >
                Confirm & Book Deposit
              </Button>
            </div>
          )
        }
      >
        {createSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Fixed Deposit Booked Successfully!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your new Fixed Deposit contract <strong>#{createdFd?.fdId}</strong> for{" "}
              <strong>{formatCurrency(createdFd?.amount || 0)}</strong> has been booked and confirmed.
            </p>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Deposit Contract ID:</span>
                <span className="font-bold">{createdFd?.fdId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Principal Amount:</span>
                <span className="font-bold">{formatCurrency(createdFd?.amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Interest Rate:</span>
                <span className="text-emerald-700 font-bold">{createdFd?.interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Duration:</span>
                <span>{createdFd?.durationMonths} Months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Maturity Date:</span>
                <span>{formatDate(createdFd?.maturityDate)}</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateFD} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deposit Amount (₹)
              </label>
              <input
                type="number"
                min="5000"
                step="1000"
                value={newFdAmount}
                onChange={(e) => setNewFdAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#003366]"
                placeholder="Minimum ₹5,000"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Minimum investment: ₹5,000 (Multiples of ₹1,000)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenure Duration
                </label>
                <select
                  value={newFdDuration}
                  onChange={(e) => setNewFdDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#003366]"
                >
                  <option value="6">6 Months (6.50% p.a.)</option>
                  <option value="12">12 Months (7.20% p.a.)</option>
                  <option value="24">24 Months (7.50% p.a.)</option>
                  <option value="36">36 Months (7.80% p.a.)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applicable Rate
                </label>
                <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-700 bg-slate-50">
                  {bookingRate.toFixed(2)}% p.a.
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span>Estimated Interest:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  +{formatCurrency(bookEstInterest)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-900 border-t border-emerald-200/60 pt-2">
                <span className="font-semibold">Maturity Value:</span>
                <span className="font-mono font-extrabold text-base text-slate-900">
                  {formatCurrency(bookEstMaturity)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
              <span>
                Funds will be auto-debited from your primary Savings Account and held under RBI DICGC insurance coverage.
              </span>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default FDPage;
