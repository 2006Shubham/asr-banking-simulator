import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Landmark, Lock, Menu, X } from "lucide-react";

/**
 * ASR Bank - Public Header & Navigation Bar
 * Clean, modern banking header with direct links and NetBanking CTA.
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
    <header className="sticky top-0 z-50 bg-[#00284d] text-white shadow-md border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Bank Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
              <img src="/asr-bank-logo.png" alt="ASR Bank" className="h-full w-auto object-contain" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-sans leading-none block">
                ASR BANK
              </span>
              <span className="text-[9px] uppercase tracking-widest text-amber-300 font-semibold mt-0.5 block">
                Your Trust, Our Priority
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
                      ? "text-amber-400 border-b-2 border-amber-400 font-semibold"
                      : "text-blue-100 hover:text-white"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action: NetBanking CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>NetBanking</span>
            </Link>

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/50 transition focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-900/60 bg-[#002244] animate-fadeIn">
            <nav className="flex flex-col gap-2 px-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-800 text-amber-400 font-semibold"
                        : "text-blue-100 hover:bg-blue-900/50 hover:text-white"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-blue-900/60">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 bg-amber-400 text-slate-950 font-bold rounded-lg text-sm"
                >
                  Login to NetBanking
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
