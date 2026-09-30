import React from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  ShieldCheck,
  Database,
  Code2,
  Users,
  Award,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Card, SectionHeading, Badge, Button } from "../../components/common";

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Atharva Wadekar",
      role: "Backend & Database Architect",
      focus: "Relational Schemas, Referential Integrity & Data Modeling",
    },
    {
      name: "Shubham Deshmukh",
      role: "Full-Stack & Systems Engineer",
      focus: "Spring Boot Microservices, REST APIs & Enterprise Logic",
    },
    {
      name: "Rutuja",
      role: "Frontend & UI/UX Architect",
      focus: "React Architecture, Design System & NetBanking Client",
    },
  ];

  const architecturalPillars = [
    {
      title: "Relational Data Modeling",
      desc: "Normalized 3NF database schema spanning 10 core entities with strict foreign key constraints and triggers.",
    },
    {
      title: "ACID Financial Transactions",
      desc: "Ensures atomic account debits and credits with zero data inconsistency during concurrent transfers.",
    },
    {
      title: "Layered Enterprise Architecture",
      desc: "Clean 3-tier structure separating React presentation, Spring Boot services, and relational persistence.",
    },
    {
      title: "Banking Security Protocols",
      desc: "Masked customer data, hashed credentials, and role-based NetBanking session protection.",
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div>
          <SectionHeading
            title="About ASR Bank"
            subtitle="The intersection of reliable Indian banking principles and rigorous computer science engineering."
            badge={<Badge variant="info">DBMS Mini-Project</Badge>}
            action={
              <Link to="/products">
                <Button variant="outline" size="sm">
                  View Banking Products
                </Button>
              </Link>
            }
          />
        </div>

        {/* Origin & Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              An Academic Full-Stack Banking Simulation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>ASR Bank</strong> is a modern banking web application engineered to demonstrate
              practical Database Management System (DBMS) concepts. While inspired by the clean layout
              and customer reliability of premier Indian financial institutions, ASR Bank possesses
              its own distinct brand identity—<strong>Aapka Secure Rasta</strong>.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Rather than simulating surface-level mockups, ASR Bank models internal banking mechanics:
              relational account balances, multi-channel transactional ledgers (UPI, NEFT, IMPS),
              loan EMI amortization schedules, compounding fixed deposits, and KYC verification records.
            </p>
          </div>

          <div className="lg:col-span-5">
            <Card padding="lg" className="border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">ASR Bank Mission</h4>
                  <p className="text-xs text-slate-400">Institutional Values</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic mb-4">
                "To deliver simple, transparent, and secure banking experiences backed by robust
                relational data integrity and high-availability digital channels."
              </p>
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Strict Data Privacy & Masking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero Real Monetary Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Auditable Ledger Accounting</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Engineering Architecture Section */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900">
              Technical & DBMS Architecture
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Core database management concepts demonstrated throughout the system
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {architecturalPillars.map((pillar, i) => (
              <Card key={i} padding="md" className="border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-2">
                  {pillar.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Project Development Team */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900">
              Project Development Team
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Engineered by undergraduate computer engineering scholars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <Card key={idx} padding="md" className="border-slate-200">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003366] flex items-center justify-center font-bold mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  {member.name}
                </h4>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  {member.role}
                </p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {member.focus}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#003366] to-[#00284d] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold">Explore the Customer Experience</h4>
            <p className="text-xs text-blue-200">
              Log in to the NetBanking simulator to view live mock accounts, statements, and loans.
            </p>
          </div>
          <Link to="/login" className="shrink-0">
            <Button
              variant="primary"
              size="md"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-none"
            >
              Access NetBanking Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
