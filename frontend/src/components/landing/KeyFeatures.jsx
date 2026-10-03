import React from "react";
import { ShieldCheck, Clock, Zap, UserCheck } from "lucide-react";
import { Card, SectionHeading } from "../common";

const KeyFeatures = () => {
  const features = [
    {
      icon: ShieldCheck,
      iconColor: "text-blue-600 bg-blue-50",
      title: "Secure Banking",
      description:
        "Multi-layered protection with masked account and card information, encrypted session tokens, and strict authorization gates.",
    },
    {
      icon: Clock,
      iconColor: "text-emerald-600 bg-emerald-50",
      title: "24/7 NetBanking Access",
      description:
        "Access your complete portfolio, initiate transactions, check EMI statuses, and download statements anytime from any device.",
    },
    {
      icon: Zap,
      iconColor: "text-amber-600 bg-amber-50",
      title: "Fast Transactions",
      description:
        "Rapid fund processing across UPI, NEFT, and IMPS channels with automatic ledger balancing and instant reference tracking.",
    },
    {
      icon: UserCheck,
      iconColor: "text-indigo-600 bg-indigo-50",
      title: "Personalized Services",
      description:
        "Customized loan amortization schedules, flexible term deposit options, and customer KYC profile management.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionHeading
            level="h2"
            title="Engineered for Modern Financial Life"
            subtitle="Explore features designed to make retail and business banking effortless, dependable, and swift."
            className="text-center"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                hoverable
                padding="md"
                className="border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-xs ${feature.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
