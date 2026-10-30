import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Landmark,
  Lock,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  CreditCard,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input } from "../../components/common";

const RegisterPage = () => {
  const [accountNo, setAccountNo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!accountNo.trim()) {
      setError("Please enter your existing Bank Account Number.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError("Please provide your registered Email or Phone number for verification.");
      return;
    }
    if (!username.trim()) {
      setError("Please choose a NetBanking Username.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await register({
        accountNo: accountNo.trim(),
        email: email.trim(),
        phone: phone.trim(),
        username: username.trim(),
        password,
      });

      if (res.success) {
        setSuccessData(res.data);
      } else {
        setError(res.error || "Registration failed. Please check your account details.");
      }
    } catch (err) {
      setError("An unexpected connection error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemoUnregistered = () => {
    setAccountNo("ACC004");
    setEmail("ramesh.patil@example.com");
    setPhone("+91 98223 34455");
    setUsername("ramesh_p");
    setPassword("demo123");
    setConfirmPassword("demo123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shadow-xs">
              <img src="/asr-bank-logo.png" alt="ASR Bank" className="h-full w-auto object-contain" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#003366] leading-none block">
                ASR BANK
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5 block">
                Your Trust, Our Priority
              </span>
            </div>
          </Link>

          <Link
            to="/login"
            className="text-xs font-semibold text-slate-600 hover:text-[#003366] transition inline-flex items-center gap-1"
          >
            Already registered? Sign In →
          </Link>
        </div>
      </header>

      {/* Main Registration Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Guidelines & Demo Autofill */}
          <div className="lg:col-span-5 bg-[#002244] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-blue-950">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-800 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Account-Backed Enrollment</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Register for NetBanking
                </h2>
                <p className="text-xs text-blue-200/80 mt-2 leading-relaxed">
                  Enroll your existing ASR Bank Savings or Current account to activate 24/7 digital banking.
                </p>
              </div>

              {/* Demo Helper Box */}
              <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test Unregistered Account</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFillDemoUnregistered}
                    className="text-[11px] font-semibold text-blue-200 hover:text-white underline cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>
                <p className="text-[11px] text-blue-200/80 leading-relaxed">
                  Customer <strong>Ramesh Patil</strong> holds active account <code>ACC004</code> and has not yet enrolled in NetBanking.
                </p>
              </div>

              <div className="space-y-3 text-xs text-blue-100/90">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Must hold an existing, active ASR Bank account.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Registered email/phone must match account records.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Directly links to your customer profile in MySQL.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-900/60 text-[11px] text-blue-300/70">
              ASR Bank Simulator • Dynamic Account Validation
            </div>
          </div>

          {/* Right Column: Registration Form or Success Screen */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Card
              padding="lg"
              className="border-slate-300 shadow-md bg-white rounded-2xl"
              footer={
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Bank-Grade Security
                  </span>
                  <span>Instant Verification</span>
                </div>
              }
            >
              {successData ? (
                /* Success Screen */
                <div className="text-center py-6 space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Registration Successful!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Welcome to ASR NetBanking, <strong>{successData.customerName || "Customer"}</strong>. Your account has been linked successfully.
                  </p>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1 font-mono max-w-xs mx-auto">
                    <p><span className="text-slate-400 font-sans">Username:</span> <strong>{successData.username}</strong></p>
                    <p><span className="text-slate-400 font-sans">User ID:</span> <strong>{successData.userId}</strong></p>
                    <p><span className="text-slate-400 font-sans">Customer ID:</span> <strong>{successData.custId}</strong></p>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => navigate("/login")}
                      className="bg-[#003366] hover:bg-[#002244] text-white py-2.5 font-bold"
                    >
                      Proceed to Sign In →
                    </Button>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <>
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-slate-900">
                      Create NetBanking Account
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Provide your bank account details to set up online access.
                    </p>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{error}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <Input
                      label="Existing Bank Account Number *"
                      name="accountNo"
                      id="accountNo"
                      required
                      placeholder="e.g. ACC004"
                      value={accountNo}
                      onChange={(e) => {
                        setAccountNo(e.target.value);
                        if (error) setError("");
                      }}
                      icon={CreditCard}
                      className="font-mono"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Registered Email *"
                        name="email"
                        id="email"
                        type="email"
                        placeholder="e.g. ramesh.patil@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        icon={Mail}
                      />
                      <Input
                        label="Registered Phone"
                        name="phone"
                        id="phone"
                        placeholder="e.g. +91 98223 34455"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (error) setError("");
                        }}
                        icon={Phone}
                      />
                    </div>

                    <Input
                      label="Choose NetBanking Username *"
                      name="username"
                      id="username"
                      required
                      placeholder="e.g. ramesh_p"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError("");
                      }}
                      icon={User}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Password (min 6 chars) *"
                        name="password"
                        id="password"
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }}
                        icon={Lock}
                        rightAction={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-700 p-1 focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />

                      <Input
                        label="Confirm Password *"
                        name="confirmPassword"
                        id="confirmPassword"
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError("");
                        }}
                        icon={Lock}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      fullWidth
                      isLoading={submitting}
                      className="mt-2 bg-[#003366] hover:bg-[#002244] text-white py-2.5 text-sm font-bold shadow-sm"
                    >
                      {submitting ? "Validating with Core Banking..." : "Complete NetBanking Registration"}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 ASR Bank Ltd. All rights reserved.
      </footer>
    </div>
  );
};

export default RegisterPage;

