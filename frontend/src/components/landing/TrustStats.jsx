import React from "react";
import { ShieldCheck, Database } from "lucide-react";

const TrustStats = () => {
  const stats = [
    {
      value: "₹500 Cr+",
      label: "Simulated Assets Under Management",
      desc: "Robust capital reserve modeling",
    },
    {
      value: "100%",
      label: "ACID Transaction Integrity",
      desc: "Zero ledger discrepancies",
    },
    {
      value: "99.99%",
      label: "Core Digital Availability",
      desc: "Reliable 24/7 NetBanking access",
    },
    {
      value: "10+",
      label: "Normalized Relational Entities",
      desc: "Strict foreign key referential integrity",
    },
  ];

  return (
    <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trust & Performance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Engineered with Institutional Precision
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every deposit, transaction, loan amortization, and interest payout in ASR Bank is
              backed by relational database guarantees and rigorous mathematical consistency.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight font-mono">
                  {stat.value}
                </p>
                <h4 className="text-sm font-semibold text-slate-100 mt-2">
                  {stat.label}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustStats;
