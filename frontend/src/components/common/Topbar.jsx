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
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * ASR Bank - Role-Aware Dashboard Topbar Component
 */
const Topbar = ({ onToggleSidebar }) => {
  const { user, customer, employee, branch, logout, isCustomer, isEmployee, isManager } = useAuth();
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
    const path = location.pathname;
    // Customer routes
    if (path === "/dashboard") return "My Banking Overview";
    if (path === "/dashboard/accounts") return "My Accounts";
    if (path === "/dashboard/transactions") return "Transaction History";
    if (path === "/dashboard/loans") return "Loans & Installments";
    if (path === "/dashboard/fd") return "Fixed Deposits";
    if (path === "/dashboard/cards") return "Debit & Credit Cards";
    if (path === "/dashboard/profile") return "Customer Details & KYC";
    if (path === "/customer/inquiries") return "Customer Inquiries";

    // Employee routes
    if (path === "/employee/dashboard") return "Employee Operations Overview";
    if (path === "/employee/inquiries") return "Assigned Inquiries & Queue";
    if (path === "/employee/customers") return "Customer Directory";
    if (path === "/employee/profile") return "Staff Profile";

    // Manager routes
    if (path === "/manager/dashboard") return "Branch Operations Overview";
    if (path === "/manager/inquiries") return "Inquiry Oversight & Assignment";
    if (path === "/manager/employees") return "Staff Workload & Performance";
    if (path === "/manager/reports") return "Branch Reports & Analytics";
    if (path === "/manager/profile") return "Branch Manager Profile";

    return "ASR Bank Portal";
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate("/login");
  };

  const displayName = isCustomer()
    ? (customer?.name || user?.username || "Customer")
    : (employee?.name || user?.username || "Bank Staff");

  const displayId = isCustomer()
    ? (customer?.custId || "CUST")
    : (employee?.empId || "EMP");

  const portalBreadcrumb = isManager()
    ? "Branch Management"
    : isEmployee()
    ? "Staff Portal"
    : "NetBanking";

  const profileLink = isManager()
    ? "/manager/profile"
    : isEmployee()
    ? "/employee/profile"
    : "/dashboard/profile";

  // Notifications
  const notifications = [
    {
      id: 1,
      title: "Secure Connection Active",
      desc: "Logged in via authenticated encrypted session.",
      time: "Just now",
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Trigger, Brand, and Desktop Page Title */}
      <div className="flex items-center gap-3 lg:gap-6 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Bank Brand */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200 flex items-center justify-center shadow-xs">
            <img src="/asr-bank-logo.png" alt="ASR Bank" className="h-full w-auto object-contain" />
          </div>
          <span className="font-extrabold text-sm text-[#003366] tracking-tight">ASR BANK</span>
        </div>

        {/* Desktop Page Title & Breadcrumb */}
        <div className="hidden lg:block truncate">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>{portalBreadcrumb}</span>
            <span>/</span>
            <span className="text-slate-600 font-mono">{displayId}</span>
            {branch?.branchName && (
              <>
                <span>/</span>
                <span className="text-slate-500">{branch.branchName}</span>
              </>
            )}
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
            placeholder="Quick search or navigation..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right: Security, Role Badge, Notifications & User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Role Badge */}
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            isManager()
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : isEmployee()
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-blue-50 text-[#003366] border-blue-200"
          }`}
        >
          {user?.role?.toUpperCase() || "USER"}
        </span>

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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  System Alerts
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-[#003366]">
                  Active
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-slate-50 transition text-xs">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                  </div>
                ))}
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
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{displayId}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {customer?.email || employee?.email || user?.username}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified {user?.role} Session</span>
                </div>
              </div>

              <div className="py-1 text-xs text-slate-700">
                <Link
                  to={profileLink}
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>View Profile</span>
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
