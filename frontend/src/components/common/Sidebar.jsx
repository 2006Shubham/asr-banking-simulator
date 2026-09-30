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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * ASR Bank - Customer Portal Sidebar
 * Responsive navigation supporting desktop sticky layout and mobile off-canvas drawer.
 */
const Sidebar = ({ isOpen = false, onClose }) => {
  const { logout, customer } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Accounts", path: "/dashboard/accounts", icon: Wallet },
    { name: "Transactions", path: "/dashboard/transactions", icon: ArrowLeftRight },
    { name: "Loans", path: "/dashboard/loans", icon: BadgePercent },
    { name: "Fixed Deposits", path: "/dashboard/fd", icon: PiggyBank },
    { name: "Cards", path: "/dashboard/cards", icon: CreditCard },
    { name: "Profile", path: "/dashboard/profile", icon: UserCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">
                ASR BANK
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold mt-1">
                NetBanking Portal
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
          <p className="text-sm font-semibold text-white truncate">
            {customer ? customer.name : "Suraj W"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200 font-mono">
              {customer ? customer.custId : "CUST001"}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">● Verified</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs border-l-4 border-amber-400 pl-2.5"
                      : "text-blue-100/80 hover:bg-blue-900/50 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Action */}
        <div className="p-4 border-t border-blue-900/40 bg-blue-950/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout Securely</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
