import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Landmark,
  Lock,
  User,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input, Modal } from "../../components/common";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modals for Forgot Password & New User registration
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Destination route after login
  const from = location.state?.from?.pathname || "/dashboard";

  // If already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both Customer ID / Username and Password.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || "Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("An unexpected connection error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to auto-fill demo credentials for quick evaluation
  const handleAutoFill = () => {
    setUsername("suraj_w");
    setPassword("demo123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Mini Top Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-[#002244] transition">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#003366]">
                ASR BANK
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                Aapka Secure Rasta
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="text-xs font-semibold text-slate-600 hover:text-[#003366] transition inline-flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Security & Advisories Card */}
          <div className="lg:col-span-5 bg-[#002244] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-blue-950">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-800 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security Advisory</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Safe & Secure NetBanking
                </h2>
                <p className="text-xs text-blue-200/80 mt-2 leading-relaxed">
                  Protecting your financial confidentiality through rigorous access controls.
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-blue-100/90">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Verify URL displays <strong>http://localhost:5173</strong> before logging in.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Never share your password, OTP, or CVV with anyone—including bank staff.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Always use the "Logout Securely" button when ending your session.</span>
                </div>
              </div>

              {/* Demo Credentials Helper Pill */}
              <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Demo Credentials
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="text-[11px] font-semibold text-blue-200 hover:text-white underline cursor-pointer"
                  >
                    Click to Auto-fill
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2 rounded border border-blue-900">
                    <p className="text-[10px] text-blue-300 font-sans">Username</p>
                    <p className="font-semibold text-white">suraj_w</p>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-blue-900">
                    <p className="text-[10px] text-blue-300 font-sans">Password</p>
                    <p className="font-semibold text-white">demo123</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-900/60 text-[11px] text-blue-300/70">
              Academic DBMS Project Simulation • Atharva • Shubham • Rutuja
            </div>
          </div>

          {/* Right Column: NetBanking Login Form */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Card
              padding="lg"
              className="border-slate-300 shadow-md bg-white rounded-2xl"
              footer={
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    256-Bit SSL Encrypted
                  </span>
                  <span>Mock Authentication Mode</span>
                </div>
              }
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  NetBanking Login
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Access your accounts, transactions, loans, and fixed deposits.
                </p>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Customer ID / Username"
                  name="username"
                  id="username"
                  required
                  placeholder="Enter username (e.g. suraj_w)"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  icon={User}
                  autoComplete="username"
                />

                <Input
                  label="NetBanking Password"
                  name="password"
                  id="password"
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (e.g. demo123)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  icon={Lock}
                  autoComplete="current-password"
                  rightAction={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-700 p-1 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-slate-500 hover:text-[#003366] font-medium transition cursor-pointer"
                  >
                    Forgot Password / User ID?
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(true)}
                    className="text-[#003366] font-semibold hover:underline cursor-pointer"
                  >
                    Register New User
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={submitting}
                  icon={Lock}
                  className="mt-3 bg-[#003366] hover:bg-[#002244] text-white py-2.5 text-sm font-bold shadow-sm"
                >
                  {submitting ? "Verifying Credentials..." : "Login to NetBanking"}
                </Button>
              </form>

              {/* Informative Security Disclaimer */}
              <div className="mt-6 p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Academic Project Notice:</strong> This is a client-side mock authentication
                  flow for DBMS demonstration. Production banking requires Spring Boot backend token
                  verification with bcrypt password hashing.
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Mini Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 ASR Bank Simulator. All rights reserved.
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Forgot Password / Customer ID"
        description="Self-service credential recovery"
        footer={
          <Button variant="primary" size="sm" onClick={() => setForgotModalOpen(false)}>
            Understood
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            In this academic mini-project simulation, credentials are predefined for evaluation:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono">
            <p><strong>Customer ID / Username:</strong> suraj_w</p>
            <p><strong>NetBanking Password:</strong> demo123</p>
          </div>
          <p>
            In production Spring Boot deployment, a password reset token would be dispatched
            to the registered email (<code>suraj@example.com</code>).
          </p>
        </div>
      </Modal>

      {/* New User Registration Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="New User Registration"
        description="Digital banking account registration"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Link to="/contact" onClick={() => setRegisterModalOpen(false)}>
              <Button variant="primary" size="sm">
                Contact Nearest Branch
              </Button>
            </Link>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            New customer onboarding requires a verified Customer ID and linked Savings or Current
            account in the ASR Bank core relational database.
          </p>
          <p>
            To test the full customer portal, please use the provided demo account:
            <span className="font-mono font-bold text-slate-800 ml-1">suraj_w</span>.
          </p>
          <p>
            Or visit our <strong>Branch Inquiry</strong> page to simulate new account registration.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
