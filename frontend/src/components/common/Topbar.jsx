import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Menu,
  Landmark,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * ASR Bank - Enhanced Dashboard Topbar Component
 * Features:
 * - Dynamic Page Title
 * - Global Search Placeholder
 * - Notification Bell with alert dropdown
 * - Customer Avatar/Name with Profile Menu
 * - Mobile Menu trigger
 */
const Topbar = ({ onToggleSidebar }) => {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map route to readable page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/dashboard/accounts":
        return "Bank Accounts & Balances";
      case "/dashboard/transactions":
        return "Transaction Statements";
      case "/dashboard/loans":
        return "Loans & Installments";
      case "/dashboard/fd":
        return "Fixed Deposits & Yield";
      case "/dashboard/cards":
        return "Cards Management";
      case "/dashboard/profile":
        return "Customer Profile & KYC";
      default:
        return "NetBanking Portal";
    }
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate("/login");
  };

  // Mock banking notifications
  const notifications = [
    {
      id: 1,
      title: "Salary Credit Received",
      desc: "+₹50,000.00 credited to Savings A/C •••• 0001 via NEFT.",
      time: "2 hours ago",
      type: "credit",
    },
    {
      id: 2,
      title: "Upcoming Loan EMI",
      desc: "Installment #3 for Personal Loan #LN001 due on 01 Apr 2025.",
      time: "1 day ago",
      type: "due",
    },
    {
      id: 3,
      title: "FD Interest Accrued",
      desc: "₹7,200.00 annual interest calculated for Deposit #FD001.",
      time: "3 days ago",
      type: "fd",
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Trigger, Brand, and Desktop Page Title */}
      <div className="flex items-center gap-3 lg:gap-6 min-w-0">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Bank Brand */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <div className="w-7 h-7 rounded-md bg-[#003366] flex items-center justify-center text-white shadow-xs">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-[#003366] tracking-tight">ASR BANK</span>
        </div>

        {/* Desktop Page Title & Breadcrumb */}
        <div className="hidden lg:block truncate">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>NetBanking</span>
            <span>/</span>
            <span className="text-slate-600">{customer ? customer.custId : "CUST001"}</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Center: Search Placeholder Input (Desktop & Tablet) */}
      <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, transactions, or services..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right: Security, Notifications & User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* SSL Badge (Tablet & Desktop) */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL</span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative focus:outline-none"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown Card */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Banking Alerts
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-[#003366]">
                  3 New
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-slate-50 transition text-xs">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <Link
                  to="/dashboard/transactions"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-[#003366] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>View All In Statement</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition focus:outline-none shadow-xs"
            aria-expanded={profileMenuOpen}
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {customer?.name
                ? customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "SW"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">
                {customer?.name || "Suraj W"}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {customer ? customer.custId : "CUST001"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{customer?.name || "Suraj W"}</p>
                <p className="text-[11px] text-slate-500 truncate">{customer?.email || "suraj@example.com"}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>KYC Verified Customer</span>
                </div>
              </div>

              <div className="py-1 text-xs text-slate-700">
                <Link
                  to="/dashboard/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>View Profile & KYC</span>
                </Link>

                <Link
                  to="/dashboard/accounts"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition"
                >
                  <Landmark className="w-4 h-4 text-slate-400" />
                  <span>Manage Accounts</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout Securely</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
