import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  BadgePercent,
  PiggyBank,
  CreditCard,
  UserCheck,
  LogOut,
  Landmark,
  X,
  MessageSquare,
  Users,
  BarChart3,
  ClipboardList,
  Search,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * ASR Bank — Role-Aware Sidebar Navigation
 * Renders different nav items based on the authenticated user's role:
 * - Customer: personal banking portal
 * - Employee: inquiry queue and customer service tools
 * - Manager: branch oversight, reporting, and staff management
 */
const Sidebar = ({ isOpen = false, onClose }) => {
  const { logout, user, customer, employee, branch, isCustomer, isEmployee, isManager } = useAuth();
  const navigate = useNavigate();

  // Customer navigation items
  const customerNavItems = [
    { name: "Overview",           path: "/dashboard",              icon: LayoutDashboard },
    { name: "My Accounts",        path: "/dashboard/accounts",     icon: Wallet },
    { name: "Transaction History", path: "/dashboard/transactions", icon: ArrowLeftRight },
    { name: "Loans & EMIs",       path: "/dashboard/loans",        icon: BadgePercent },
    { name: "Fixed Deposits",     path: "/dashboard/fd",           icon: PiggyBank },
    { name: "Cards",              path: "/dashboard/cards",        icon: CreditCard },
    { name: "Customer Inquiries", path: "/customer/inquiries",     icon: MessageSquare },
    { name: "Customer Details",   path: "/dashboard/profile",      icon: UserCheck },
  ];

  // Employee navigation items
  const employeeNavItems = [
    { name: "Dashboard",          path: "/employee/dashboard",   icon: LayoutDashboard },
    { name: "Assigned Inquiries", path: "/employee/inquiries",   icon: ClipboardList },
    { name: "Customer Directory", path: "/employee/customers",   icon: Search },
    { name: "Staff Profile",      path: "/employee/profile",     icon: UserCheck },
  ];

  // Manager navigation items
  const managerNavItems = [
    { name: "Dashboard",          path: "/manager/dashboard",    icon: LayoutDashboard },
    { name: "Inquiry Oversight",  path: "/manager/inquiries",    icon: ClipboardList },
    { name: "Staff Workload",     path: "/manager/employees",    icon: Users },
    { name: "Branch Reports",     path: "/manager/reports",      icon: BarChart3 },
    { name: "Manager Profile",    path: "/manager/profile",      icon: UserCheck },
  ];

  const navItems = isManager()
    ? managerNavItems
    : isEmployee()
    ? employeeNavItems
    : customerNavItems;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  // Sidebar header labels per role
  const portalLabel = isManager()
    ? "Branch Management"
    : isEmployee()
    ? "Staff Portal"
    : "NetBanking Portal";

  const roleBadgeColor = isManager()
    ? "bg-amber-500 text-amber-950"
    : isEmployee()
    ? "bg-emerald-600 text-white"
    : "bg-blue-600 text-white";

  const displayName = isCustomer()
    ? (customer?.name || user?.username || "Customer")
    : (employee?.name || user?.username || "Staff");

  const displayId = isCustomer()
    ? (customer?.custId || "")
    : (employee?.empId || "");

  const branchLabel = branch?.branchName || "";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#002244] text-white flex flex-col border-r border-blue-950 shadow-xl lg:shadow-none lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
              <img src="/asr-bank-logo.png" alt="ASR Bank" className="h-full w-auto object-contain" />
            </div>
            <div className="truncate">
              <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
                ASR BANK
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mt-1">
                {portalLabel}
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/50 transition focus:outline-none"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Info */}
        <div className="px-5 py-3.5 bg-blue-950/60 border-b border-blue-900/30">
          <p className="text-[11px] text-blue-300/80">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {displayId && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200 font-mono">
                {displayId}
              </span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${roleBadgeColor}`}>
              {user?.role?.toUpperCase() || "USER"}
            </span>
          </div>
          {branchLabel && (
            <p className="text-[10px] text-blue-400 mt-1 truncate">{branchLabel}</p>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard" || item.path.endsWith("/dashboard")}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-blue-100/80 hover:bg-blue-900/50 hover:text-white"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-blue-900/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:text-white hover:bg-rose-900/40 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
