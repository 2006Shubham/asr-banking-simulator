import React from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Briefcase,
  BadgePercent,
  PiggyBank,
  CreditCard,
  ArrowRight,
  Check,
} from "lucide-react";
import { Card, SectionHeading, Badge, Button } from "../common";

const ProductsPreview = () => {
  const products = [
    {
      id: "savings",
      icon: Wallet,
      badge: "4.0% p.a.",
      badgeVariant: "success",
      title: "Savings Account",
      description: "Designed for day-to-day liquidity with interest calculated on daily balances.",
      perks: ["Zero minimum balance option", "Free NetBanking & Mobile access", "Instant UPI integration"],
    },
    {
      id: "current",
      icon: Briefcase,
      badge: "Business",
      badgeVariant: "info",
      title: "Current Account",
      description: "Built for entrepreneurs, trading firms, and organizations requiring high transaction volumes.",
      perks: ["Unlimited monthly deposits", "Dedicated relationship manager", "Bulk NEFT / RTGS support"],
    },
    {
      id: "loans",
      icon: BadgePercent,
      badge: "From 10.5%",
      badgeVariant: "warning",
      title: "Personal Loan",
      description: "Transparent collateral-free loans with predictable monthly EMIs and flexible tenures.",
      perks: ["Tenure from 12 to 60 months", "Zero hidden pre-closure fees", "Rapid paperless processing"],
    },
    {
      id: "fd",
      icon: PiggyBank,
      badge: "Up to 7.25%",
      badgeVariant: "success",
      title: "Fixed Deposit",
      description: "Lock in guaranteed returns with compounding interest and flexible payout intervals.",
      perks: ["Tenures from 7 days to 5 years", "Premature withdrawal options", "Senior citizen bonus +0.5%"],
    },
    {
      id: "cards",
      icon: CreditCard,
      badge: "Debit & Credit",
      badgeVariant: "info",
      title: "Debit & Credit Cards",
      description: "Global contactless cards with instant online security controls and merchant rewards.",
      perks: ["NFC tap-and-pay enabled", "Instant lock/unlock via portal", "Zero annual fee for active users"],
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <SectionHeading
              level="h2"
              title="Comprehensive Banking Products"
              subtitle="Explore accounts, loans, and investment vehicles tailored to your personal and business milestones."
            />
          </div>
          <Link to="/products" className="shrink-0">
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              View All Products
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <Card
                key={p.id}
                hoverable
                padding="lg"
                className="border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={p.badgeVariant} size="sm">
                      {p.badge}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                    {p.description}
                  </p>

                  <ul className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                    {p.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/products">
                  <Button variant="secondary" size="sm" fullWidth icon={ArrowRight} iconPosition="right">
                    Learn Details
                  </Button>
                </Link>
              </Card>
            );
          })}

          {/* Callout Card filling the 6th slot of the 3x2 grid */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-blue-100/50 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#003366] text-white text-[10px] font-semibold tracking-wider uppercase mb-3">
                Digital Account Opening
              </div>
              <h3 className="text-lg font-bold text-[#003366] mb-2">
                Already Have an Account?
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                Access your portfolio directly through the ASR Bank NetBanking portal using your Customer ID.
              </p>
            </div>
            <Link to="/login">
              <Button variant="primary" size="md" fullWidth>
                Access NetBanking Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsPreview;
