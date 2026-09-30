import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldAlert,
  Send,
  CheckCircle2,
  Building,
  HelpCircle,
} from "lucide-react";
import { Card, SectionHeading, Badge, Button, Input } from "../../components/common";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);

  const branches = [
    {
      city: "Pune",
      name: "Pune Main Branch & Headquarters",
      address: "Ground Floor, ASR Towers, FC Road, Shivajinagar, Pune, Maharashtra - 411005",
      phone: "+91 (020) 2550-ASR1",
      ifsc: "ASRB0000101",
      timings: "Mon - Sat: 9:30 AM to 4:30 PM",
    },
    {
      city: "Mumbai",
      name: "Mumbai BKC Commercial Center",
      address: "Tower B, G-Block, Bandra Kurla Complex (BKC), Mumbai, Maharashtra - 400051",
      phone: "+91 (022) 6620-ASR2",
      ifsc: "ASRB0000202",
      timings: "Mon - Sat: 9:30 AM to 4:30 PM",
    },
    {
      city: "Nagpur",
      name: "Nagpur Regional Hub",
      address: "Civil Lines, Near High Court, Nagpur, Maharashtra - 440001",
      phone: "+91 (0712) 2890-ASR3",
      ifsc: "ASRB0000303",
      timings: "Mon - Sat: 9:30 AM to 4:30 PM",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate network submission delay
    setTimeout(() => {
      const generatedRef = "INQ-" + Math.floor(100000 + Math.random() * 900000);
      setSubmittedRef(generatedRef);
      setSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "General Inquiry",
        message: "",
      });
    }, 600);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div>
          <SectionHeading
            title="Contact & Branch Locator"
            subtitle="Reach out to our customer care team or visit our flagship branches across Maharashtra."
            badge={<Badge variant="info">Customer Assistance</Badge>}
            action={
              <Link to="/login">
                <Button variant="outline" size="sm">
                  NetBanking Helpdesk
                </Button>
              </Link>
            }
          />
        </div>

        {/* Quick Contact Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card padding="md" className="border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Customer Helpline</h4>
            <p className="text-sm font-semibold text-[#003366] mt-1">1800-209-ASR (Toll-Free)</p>
            <p className="text-xs text-slate-500 mt-1">Available 24x7 for general queries & card block.</p>
          </Card>

          <Card padding="md" className="border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Official Email Care</h4>
            <p className="text-sm font-semibold text-emerald-800 mt-1">care@asrbank.local</p>
            <p className="text-xs text-slate-500 mt-1">Response guaranteed within 24 business hours.</p>
          </Card>

          <Card padding="md" className="border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Emergency Card Hotlisting</h4>
            <p className="text-sm font-semibold text-amber-900 mt-1">cyberfraud@asrbank.local</p>
            <p className="text-xs text-slate-500 mt-1">Instant unauthorized transaction reporting.</p>
          </Card>
        </div>

        {/* Main Section: Contact Form & Branch Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <Card
              title="Send an Official Inquiry"
              subtitle="Submit your query directly to our branch relationship desk."
              padding="lg"
              className="border-slate-200 shadow-xs"
            >
              {submittedRef ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">
                    Inquiry Submitted Successfully
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Your inquiry has been logged under reference{" "}
                    <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {submittedRef}
                    </strong>
                    . Our branch manager will contact you shortly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-100 mt-2"
                    onClick={() => setSubmittedRef(null)}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Full Name"
                      name="name"
                      required
                      placeholder="e.g. Suraj Wadekar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Contact Phone"
                      name="phone"
                      required
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      name="email"
                      required
                      type="email"
                      placeholder="e.g. suraj@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Inquiry Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-sm rounded-lg border border-slate-300 bg-white text-slate-900 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition"
                      >
                        <option value="General Inquiry">General Banking Inquiry</option>
                        <option value="Savings/Current Account">Savings / Current Account Opening</option>
                        <option value="Fixed Deposit">Fixed Deposit & Interest Rates</option>
                        <option value="Personal Loan">Personal Loan Assistance</option>
                        <option value="NetBanking Support">NetBanking & Digital Access</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Message / Query <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe how we can assist you with your banking requirements..."
                      className="w-full text-sm rounded-lg border border-slate-300 bg-white text-slate-900 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={submitting}
                    icon={Send}
                    fullWidth
                    className="mt-2"
                  >
                    Submit Banking Inquiry
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Branch Directory Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#003366]" />
              <span>Flagship Branch Locations</span>
            </h3>

            {branches.map((b, i) => (
              <Card key={i} padding="md" className="border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{b.name}</h4>
                  <Badge variant="info" size="sm">{b.city}</Badge>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mt-2">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{b.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.timings}</span>
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>IFSC Code: {b.ifsc}</span>
                    <span className="text-emerald-600 font-sans font-semibold">24x7 ATM Available</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
