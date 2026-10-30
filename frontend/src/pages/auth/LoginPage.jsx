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
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input, Modal } from "../../components/common";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const { login, isAuthenticated, getRoleHome } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from && from !== "/login" ? from : getRoleHome(), { replace: true });
    }
  }, [isAuthenticated, navigate, from, getRoleHome]);

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
        const destination = from && from !== "/login" ? from : getRoleHome(res.role);
        navigate(destination, { replace: true });
      } else {
        setError(res.error || "Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("An unexpected connection error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillCustomer = () => {
    setUsername("rutuja_p");
    setPassword("demo123");
    setError("");
  };

  const handleFillEmployee = () => {
    setUsername("shubham_emp");
    setPassword("demo123");
    setError("");
  };

  const handleFillManager = () => {
    setUsername("atharva_mgr");
    setPassword("demo123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Header */}
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
          {/* Left Column: Security & Role Fillers */}
          <div className="lg:col-span-5 bg-[#002244] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-blue-950">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-800 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure Portal Access</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Multi-Role Banking
                </h2>
                <p className="text-xs text-blue-200/80 mt-2 leading-relaxed">
                  Log in to access your role-specific workspace (Customer, Employee, or Branch Manager).
                </p>
              </div>

              {/* Demo Credentials Quick-Select */}
              <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-800/80 space-y-2.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Quick Demo Login (Password: demo123)
                </span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={handleFillCustomer}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/80 hover:bg-slate-900 border border-blue-900 text-left transition"
                  >
                    <div>
                      <span className="font-semibold text-white">rutuja_p</span>
                      <span className="text-[10px] text-blue-300 ml-2">Rutuja Peherkar</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-blue-200 font-bold">
                      CUSTOMER
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFillEmployee}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/80 hover:bg-slate-900 border border-blue-900 text-left transition"
                  >
                    <div>
                      <span className="font-semibold text-white">shubham_emp</span>
                      <span className="text-[10px] text-blue-300 ml-2">Shubham Deshmukh</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 font-bold">
                      EMPLOYEE
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFillManager}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/80 hover:bg-slate-900 border border-blue-900 text-left transition"
                  >
                    <div>
                      <span className="font-semibold text-white">atharva_mgr</span>
                      <span className="text-[10px] text-blue-300 ml-2">Atharva Wadekar</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900 text-amber-200 font-bold">
                      MANAGER
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-blue-100/80">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>256-Bit SSL Encrypted Endpoints</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automatic role-based dashboard redirection</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-900/60 text-[11px] text-blue-300/70">
              ASR Bank Simulator • Live MySQL Database
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
                  <span>Official Banking Portal</span>
                </div>
              }
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Account Sign In
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your Username and Password to access your banking dashboard.
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
                  label="Username"
                  name="username"
                  id="username"
                  required
                  placeholder="e.g. rutuja_p, shubham_emp, or atharva_mgr"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  icon={User}
                  autoComplete="username"
                />

                <Input
                  label="Password"
                  name="password"
                  id="password"
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password (e.g. demo123)"
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
                    Forgot Password?
                  </button>
                  <Link
                    to="/register"
                    className="text-[#003366] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register New Account</span>
                  </Link>
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
                  {submitting ? "Signing in..." : "Sign In to Portal"}
                </Button>
              </form>

              {/* Registration Banner */}
              <div className="mt-6 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#003366]">Have an ASR Bank Account?</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Register for NetBanking with your Account Number</p>
                </div>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-[#003366] text-white text-xs font-semibold rounded-lg hover:bg-[#002244] transition shrink-0"
                >
                  Register Now
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 ASR Bank Ltd. All rights reserved.
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Account Recovery"
        description="Demo Password Reference"
        footer={
          <Button variant="primary" size="sm" onClick={() => setForgotModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>All seeded user accounts currently share the standard demo password:</p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono">
            <p><strong>Demo Password:</strong> demo123</p>
          </div>
          <p>For newly registered users, use the password created during registration.</p>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
