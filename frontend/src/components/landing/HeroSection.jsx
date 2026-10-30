import React from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Landmark,
} from "lucide-react";
import { Button } from "../common";

/**
 * ASR Bank - Hero Section
 * Clean, modern, high-contrast Indian retail banking hero banner.
 */
const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#00284d] via-[#002244] to-[#001a33] text-white py-16 sm:py-24">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Clear Messaging & Direct CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-200 text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Aapka Secure Rasta • Verified NetBanking Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-tight">
              Banking Made{" "}
              <span className="text-amber-400">Simple, Secure,</span>
              <br />
              and <span className="text-white">Smart.</span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Experience modern Indian banking built for financial clarity. Manage savings,
              track multi-channel transactions, schedule loan EMIs, and monitor high-yield
              fixed deposits with total institutional security.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/login">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Lock}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold border-none shadow-lg transform active:scale-95"
                >
                  Login to NetBanking
                </Button>
              </Link>

              <Link to="/products">
                <Button
                  variant="ghost"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="text-blue-100 hover:text-white hover:bg-white/10 border border-blue-400/40"
                >
                  View Banking Products
                </Button>
              </Link>
            </div>

            {/* Trust Markers */}
            <div className="pt-6 border-t border-blue-900/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-blue-200/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Minimum Balance Options</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-Bit TLS Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 UPI & NEFT Transfers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Institutional Banking Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shadow-xs">
                    <img src="/asr-bank-logo.png" alt="ASR Bank" className="h-full w-auto object-contain" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">ASR BANK</h3>
                    <p className="text-[10px] text-amber-600 uppercase tracking-wider font-semibold mt-0.5">Your Trust, Our Priority</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Core Banking Active</span>
                </div>
              </div>

              {/* Balance Showcase */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">Savings Account Balance</span>
                  <span className="font-mono text-slate-400">A/C •••• 0001</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <p className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                    ₹1,45,000.50
                  </p>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +4.0% p.a.
                  </span>
                </div>
              </div>

              {/* Rate Badges Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Fixed Deposit</span>
                  <p className="text-base font-bold text-[#003366]">7.20% p.a.</p>
                  <p className="text-[10px] text-slate-400">Guaranteed Yield</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-900">Personal Loan</span>
                  <p className="text-base font-bold text-amber-900">10.5% p.a.</p>
                  <p className="text-[10px] text-amber-700">Instant Eligibility</p>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/login"
                className="block w-full text-center py-3 px-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold transition shadow-sm cursor-pointer"
              >
                Access Customer NetBanking →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
