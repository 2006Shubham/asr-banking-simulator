import React from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowRight, PhoneCall } from "lucide-react";
import { Button } from "../common";

const CtaSection = () => {
  return (
    <section className="py-16 bg-[#00284d] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#003366] to-[#002244] rounded-2xl p-8 sm:p-12 border border-blue-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Join ASR Bank Today
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Experience Seamless Digital Banking?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Log in with your Customer credentials to review your balances, download statement
              ledgers, track loans, or explore our flexible deposit schemes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link to="/login">
              <Button
                variant="primary"
                size="md"
                icon={Lock}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-none shadow-md w-full sm:w-auto"
              >
                Login to NetBanking
              </Button>
            </Link>

            <Link to="/contact">
              <Button
                variant="outline"
                size="md"
                icon={PhoneCall}
                className="border-blue-400/80 text-blue-100 hover:bg-blue-800/40 hover:text-white w-full sm:w-auto"
              >
                Contact Branches
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
