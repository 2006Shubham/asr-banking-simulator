import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, Landmark, TrendingUp } from "lucide-react";
import { Button } from "../common";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#00284d] to-[#001e3d] text-white py-16 sm:py-24">
      {/* Subtle geometric background accents */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-200 text-xs font-medium shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Aapka Secure Rasta • Verified NetBanking Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight">
              Banking Made <span className="text-amber-400">Simple</span>,{" "}
              <span className="text-white">Secure</span>, and{" "}
              <span className="text-blue-300">Smart</span>.
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Experience modern Indian banking built for financial clarity. Manage savings, track
              multi-channel transactions, schedule loan EMIs, and monitor high-yield fixed deposits
              with total institutional security.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/login">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Lock}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-none shadow-md"
                >
                  Login to NetBanking
                </Button>
              </Link>

              <Link to="/products">
                <Button
                  variant="outline"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="border-blue-400/80 text-blue-100 hover:bg-blue-800/40 hover:text-white"
                >
                  Explore Products
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-blue-900/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-blue-200/80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Minimum Balance Options</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>256-Bit TLS Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>24/7 UPI & NEFT Transfers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Institutional Trust Card Widget */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/20 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#003366] leading-none">ASR BANK</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Retail Banking</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● Core Banking Active
                </span>
              </div>

              {/* Sample Portfolio Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Savings Account Balance</span>
                  <span className="font-mono text-[11px] text-slate-400">A/C •••• 0001</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    ₹1,45,000.50
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +4.0% p.a.
                  </span>
                </div>
              </div>

              {/* Quick Feature Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Fixed Deposit</p>
                  <p className="text-sm font-bold text-[#003366] mt-0.5">7.20% p.a.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Guaranteed Yield</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Personal Loan</p>
                  <p className="text-sm font-bold text-amber-900 mt-0.5">10.5% p.a.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Instant Eligibility</p>
                </div>
              </div>

              {/* Action Banner inside card */}
              <Link
                to="/login"
                className="block text-center w-full py-2.5 px-4 rounded-lg bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold transition shadow-xs"
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
