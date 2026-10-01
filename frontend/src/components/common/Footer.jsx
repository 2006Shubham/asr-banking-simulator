import React from "react";
import { Link } from "react-router-dom";
import { Landmark, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">ASR BANK</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simplified Banking Simulator & DBMS Mini-Project. Built with React, Spring Boot, and SQL.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Banking Products</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About ASR Bank</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Branches & Contact</Link></li>
            </ul>
          </div>

          {/* Banking Products */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Products
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Savings Account</li>
              <li>Current Account</li>
              <li>Personal Loans</li>
              <li>Fixed Deposits</li>
              <li>Debit & Credit Cards</li>
            </ul>
          </div>

          {/* Academic & Security Note */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Academic Notice</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This application is an educational simulation for DBMS academic evaluation. No real monetary transactions or personal data processing occur.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ASR Bank Simulator. All rights reserved.</p>
          <p className="mt-2 sm:mt-0"> Project Team: Atharva • Shubham • Suraj •Rutuja </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
