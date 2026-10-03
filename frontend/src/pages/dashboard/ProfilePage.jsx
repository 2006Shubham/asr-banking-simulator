import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Building,
  Lock,
  Database,
  Fingerprint,
  BadgeCheck,
  EyeOff,
  Copy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import customerService from "../../services/customerService";
import { maskAadhaar } from "../../utils/maskers";
import { formatDate } from "../../utils/formatters";
import { SectionHeading, Badge, Card, LoadingState } from "../../components/common";

const ProfilePage = () => {
  const { customer: authCustomer } = useAuth();
  const [profile, setProfile] = useState(null);
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [custData, kycData] = await Promise.all([
          customerService.getCustomerProfile(authCustomer?.custId || "CUST001"),
          customerService.getKYCRecords(authCustomer?.custId || "CUST001"),
        ]);
        setProfile(custData);
        setKycRecords(kycData);
      } catch (err) {
        console.error("Failed to load profile details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authCustomer]);

  const handleCopy = (field, text) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading || !profile) {
    return <LoadingState message="Loading your customer profile & KYC records..." fullPage />;
  }

  const maskedAadhaarDisplay = maskAadhaar(profile.aadharNo);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Page Header */}
      <SectionHeading
        title="Customer Profile & KYC"
        subtitle="Manage your personal information, verify contact records, and view regulatory KYC compliance history."
        badge={
          <Badge variant="success" size="sm" dot>
            Full KYC Verified
          </Badge>
        }
      />

      {/* 2. Customer Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003366] to-[#001f3f] text-white flex items-center justify-center text-xl font-bold shadow-sm">
            {profile.name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "SW"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                {profile.name}
              </h2>
              <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                ID: {profile.custId}
              </span>
              <span>•</span>
              <span>NetBanking ID: <strong className="font-mono text-slate-800">{profile.userId}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                RBI Re-KYC Compliant
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 text-xs">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Customer Classification
            </span>
            <span className="font-bold text-slate-800">Individual Retail Resident</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Home Branch: Pune FC Road (ASRB0001001)
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: Personal Information */}
        <Card
          padding="none"
          className="border-slate-200 overflow-hidden shadow-xs"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#003366] flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Personal Information
                </h3>
                <p className="text-[11px] text-slate-500">
                  Master demographic records registered with ASR Bank
                </p>
              </div>
            </div>
            <Badge variant="info" size="sm">
              Primary Record
            </Badge>
          </div>

          <div className="p-6 divide-y divide-slate-100 text-xs">
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Customer ID</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {profile.custId}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Full Name</span>
              <span className="font-semibold text-slate-900">{profile.name}</span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Phone Number</span>
              <span className="font-mono font-semibold text-slate-900">
                {profile.phone}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Email Address</span>
              <span className="font-medium text-slate-900">{profile.email}</span>
            </div>

            <div className="py-3 flex justify-between items-start gap-4">
              <span className="text-slate-500 font-medium shrink-0">Permanent Address</span>
              <span className="font-medium text-slate-800 text-right">
                {profile.address}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                Aadhaar (Masked)
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                  {maskedAadhaarDisplay}
                </span>
                <button
                  onClick={() => handleCopy("aadhaar", maskedAadhaarDisplay)}
                  className="text-slate-400 hover:text-slate-600 transition"
                  title="Copy masked Aadhaar"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 2: Contact Information */}
        <Card
          padding="none"
          className="border-slate-200 overflow-hidden shadow-xs"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. Contact Information
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verified communications channels for 2FA, OTP & alerts
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm" dot>
              Active Channels
            </Badge>
          </div>

          <div className="p-6 divide-y divide-slate-100 text-xs">
            <div className="py-3 flex justify-between items-start gap-3">
              <div className="space-y-0.5">
                <span className="text-slate-700 font-semibold block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Primary Mobile Number
                </span>
                <span className="text-[11px] text-slate-400">
                  Registered for instant SMS alerts & NetBanking 2FA OTPs
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                {profile.phone}
              </span>
            </div>

            <div className="py-3 flex justify-between items-start gap-3">
              <div className="space-y-0.5">
                <span className="text-slate-700 font-semibold block flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Registered Email Address
                </span>
                <span className="text-[11px] text-slate-400">
                  Monthly account statements, txn receipts & security alerts
                </span>
              </div>
              <span className="font-medium text-slate-900 shrink-0">
                {profile.email}
              </span>
            </div>

            <div className="py-3 flex justify-between items-start gap-3">
              <div className="space-y-0.5">
                <span className="text-slate-700 font-semibold block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Residential Address
                </span>
                <span className="text-[11px] text-slate-400">
                  Mailing destination for checkbooks & debit cards
                </span>
              </div>
              <span className="font-medium text-slate-800 text-right max-w-[200px]">
                {profile.address}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Home Branch
              </span>
              <span className="font-semibold text-slate-900">
                Pune FC Road Main Branch (ASRB0001001)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 3: KYC Information */}
      <Card
        padding="none"
        className="border-slate-200 overflow-hidden shadow-xs"
      >
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. KYC Information & Regulatory Compliance
              </h3>
              <p className="text-[11px] text-slate-500">
                Verified government identity documents under Prevention of Money Laundering Act (PMLA)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm" dot>
              {kycRecords.length} Documents Verified
            </Badge>
          </div>
        </div>

        {/* KYC Verification Records Table */}
        <div className="p-6 space-y-4">
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">KYC ID</th>
                  <th className="py-3 px-4">KYC Type</th>
                  <th className="py-3 px-4">Verification Details (Masked)</th>
                  <th className="py-3 px-4">Verification Date</th>
                  <th className="py-3 px-4">Verified By</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {kycRecords.map((kyc) => (
                  <tr key={kyc.kycId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {kyc.kycId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{kyc.kycType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {kyc.docDetails}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {formatDate(kyc.verifiedOn)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {kyc.verifiedBy}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant="success" size="sm" dot>
                        {kyc.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Regulatory Compliance Status:</strong> Identity verified via UIDAI biometric authentication. Next periodic review due in 2028.
              </span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">
              PMLA Rule 9(14)
            </span>
          </div>
        </div>
      </Card>

      {/* 4. DBMS Relational Design Callout */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
        <Database className="w-5 h-5 text-[#003366] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#003366]">
            DBMS Relational Design: <code>CUSTOMER (1) ──── (N) KYC</code>
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            In our relational database model, <code>CUSTOMER</code> acts as the root master table with primary key <code>cust_id</code>. 
            The <code>KYC</code> entity holds regulatory verification records linked via foreign key <code>cust_id</code> with 
            <code>ON DELETE CASCADE</code>. Each record preserves <code>kyc_type</code>, <code>verified_on</code>, and <code>verified_by</code> for compliance audit logging.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
