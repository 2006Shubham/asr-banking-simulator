import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Landmark, Lock, Menu, X } from "lucide-react";

/**
 * ASR Bank - Public Header & Navigation Bar
 * Features brand logo, desktop navigation with active state indicator,
 * mobile drawer toggle, and prominent NetBanking login button.
 */
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="bg-[#00284d] text-white border-b border-blue-900/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Bank Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-500 transition">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                ASR BANK
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-blue-200/80 font-medium">
                Aapka Secure Rasta
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors py-1 ${
                    isActive
                      ? "text-white border-b-2 border-amber-400 font-semibold"
                      : "text-blue-100/80 hover:text-white"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* NetBanking Login CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition"
            >
              <Lock className="w-4 h-4 text-slate-900" />
              <span>NetBanking</span>
            </Link>

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/50 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-900/40 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-800 text-white font-semibold"
                      : "text-blue-100 hover:bg-blue-900/40 hover:text-white"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
