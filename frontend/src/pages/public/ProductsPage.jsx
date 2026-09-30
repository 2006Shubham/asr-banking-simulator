import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Briefcase,
  BadgePercent,
  PiggyBank,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { Card, SectionHeading, Badge, Button } from "../../components/common";

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Products" },
    { id: "accounts", label: "Accounts" },
    { id: "deposits", label: "Fixed Deposits" },
    { id: "loans", label: "Loans" },
    { id: "cards", label: "Cards" },
  ];

  const productsList = [
    {
      id: "savings",
      category: "accounts",
      icon: Wallet,
      title: "ASR Regular Savings Account",
      tagline: "Everyday banking with daily interest accrual and effortless liquidity.",
      rate: "4.00% p.a.",
      rateLabel: "Interest Rate",
      badge: "Retail",
      badgeVariant: "success",
      features: [
        "Zero initial balance option for salary account transfers",
        "Free NetBanking, UPI, and instant IMPS transfers",
        "Complimentary Platinum RuPay/Visa Debit card",
        "Real-time SMS alerts and electronic email statements",
        "Nomination and joint account opening facility",
      ],
      idealFor: "Salaried professionals, students, and family savings.",
    },
    {
      id: "current",
      category: "accounts",
      icon: Briefcase,
      title: "ASR Smart Business Current Account",
      tagline: "High-volume operational account engineered for trade and commerce.",
      rate: "Zero",
      rateLabel: "Transaction Limit",
      badge: "Business",
      badgeVariant: "info",
      features: [
        "Unlimited cash deposits and withdrawals at home branch",
        "Multi-user corporate NetBanking with maker-checker controls",
        "Integrated payment gateways and fast QR settlement",
        "Overdraft protection facility based on operational vintage",
        "Dedicated corporate banking relationship desk",
      ],
      idealFor: "Retailers, sole proprietorships, partnerships, and SMEs.",
    },
    {
      id: "personal-loan",
      category: "loans",
      icon: BadgePercent,
      title: "ASR Express Personal Loan",
      tagline: "Quick financial support with transparent, predictable amortization.",
      rate: "10.50% p.a.",
      rateLabel: "Starting Interest",
      badge: "Credit Facility",
      badgeVariant: "warning",
      features: [
        "Loan amounts from ₹50,000 up to ₹15,00,000",
        "Flexible repayment tenure from 12 to 60 months",
        "Transparent schedule of monthly EMI installments",
        "Zero prepayment penalties after 12 successful EMIs",
        "Automated auto-debit from your ASR Bank savings account",
      ],
      idealFor: "Medical contingencies, home renovations, higher education, travel.",
    },
    {
      id: "fixed-deposit",
      category: "deposits",
      icon: PiggyBank,
      title: "ASR High-Yield Fixed Deposit",
      tagline: "Guaranteed wealth creation with compounding interest calculations.",
      rate: "7.25% p.a.",
      rateLabel: "Peak Annual Yield",
      badge: "Investment",
      badgeVariant: "success",
      features: [
        "Tenure flexibility from 7 days up to 5 full years",
        "Quarterly compounding interest with auto-reinvestment",
        "Additional 0.50% interest rate benefit for Senior Citizens",
        "Premature withdrawal facility available anytime via NetBanking",
        "Instant loan or overdraft against FD up to 90% of deposit",
      ],
      idealFor: "Retirees, risk-averse investors, and milestone-based saving.",
    },
    {
      id: "cards",
      category: "cards",
      icon: CreditCard,
      title: "ASR Platinum Contactless Cards",
      tagline: "Global payment acceptance with biometric and tokenized card protection.",
      rate: "Lifetime",
      rateLabel: "Zero Annual Fee*",
      badge: "Cards",
      badgeVariant: "info",
      features: [
        "NFC Contactless Tap & Pay for everyday merchant purchases",
        "Instant card lock/unlock and online usage toggles via NetBanking",
        "Masked CVV and card numbers in customer dashboards for privacy",
        "Comprehensive fraud coverage simulation and zero lost-card liability",
        "Up to 45 days interest-free credit period on credit card variants",
      ],
      idealFor: "Online shoppers, travelers, and secure digital payment users.",
    },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? productsList
      : productsList.filter((p) => p.category === selectedCategory);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <SectionHeading
            title="Banking Products & Solutions"
            subtitle="Explore our comprehensive suite of savings accounts, term deposits, credit facilities, and digital cards."
            badge={<Badge variant="info">Institutional Catalog</Badge>}
            action={
              <Link to="/login">
                <Button variant="primary" size="sm" icon={Lock}>
                  Customer NetBanking
                </Button>
              </Link>
            }
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? "bg-[#003366] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredProducts.map((product) => {
            const Icon = product.icon;
            return (
              <Card
                key={product.id}
                padding="lg"
                hoverable
                className="border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {product.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Category: {product.badge}
                        </p>
                      </div>
                    </div>
                    <Badge variant={product.badgeVariant} size="sm">
                      {product.badge}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                    {product.tagline}
                  </p>

                  {/* Highlights Rate Banner */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between mb-5">
                    <span className="text-xs text-slate-500 font-medium">
                      {product.rateLabel}
                    </span>
                    <span className="text-lg font-extrabold text-[#003366] font-mono">
                      {product.rate}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 mb-6">
                    <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Key Highlights & Features:
                    </p>
                    {product.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 mb-6">
                    <strong className="text-slate-700">Recommended For: </strong>
                    {product.idealFor}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link to="/contact" className="w-full">
                    <Button variant="outline" size="sm" fullWidth>
                      Branch Inquiry
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full">
                    <Button variant="primary" size="sm" fullWidth icon={ArrowRight} iconPosition="right">
                      Open via Portal
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Informational Academic Note */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Institutional Banking Simulation
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                All financial interest calculations and loan amortization schedules strictly mirror
                real-world Reserve Bank of India standards.
              </p>
            </div>
          </div>
          <Link to="/about">
            <Button variant="secondary" size="sm">
              Read Project Architecture
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
