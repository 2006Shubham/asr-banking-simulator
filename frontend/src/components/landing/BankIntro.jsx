import React from "react";
import { Landmark, Shield, Users, Award } from "lucide-react";
import { Card } from "../common";

const BankIntro = () => {
  const pillars = [
    {
      icon: Shield,
      title: "Institutional Security",
      description:
        "Every transaction is safeguarded by strict relational integrity, 256-bit encryption, and masked credentials.",
    },
    {
      icon: Users,
      title: "Customer-Centric Focus",
      description:
        "Personalized banking accounts, competitive interest rates, and seamless online self-service workflows.",
    },
    {
      icon: Award,
      title: "Transparent Governance",
      description:
        "Clear financial accounting with zero hidden surcharges, detailed ledger records, and auditable statements.",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#003366] text-xs font-semibold uppercase tracking-wider mb-3">
            <Landmark className="w-3.5 h-3.5" />
            <span>About ASR Bank</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Building Financial Trust for Everyday India
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            ASR Bank delivers institutional financial services through clean digital interfaces and
            rigorous relational database engineering. We unite robust banking fundamentals with
            frictionless customer experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card key={idx} hoverable padding="lg" className="border-slate-200 text-center sm:text-left">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center mb-4 mx-auto sm:mx-0 shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BankIntro;
