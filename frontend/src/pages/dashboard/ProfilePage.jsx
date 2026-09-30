import React from "react";
import { mockCustomer, mockKYC } from "../../data/mockData";
import { maskAadhaar } from "../../utils/maskers";
import { formatDate } from "../../utils/formatters";
import { User, ShieldCheck, CheckCircle2 } from "lucide-react";

const ProfilePage = () => {
  const kyc = mockKYC[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Customer Profile & KYC</h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered profile details and regulatory identity verification records. (Placeholder Page)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-400">Master Record: {mockCustomer.custId}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Full Name</span>
              <span className="font-semibold text-slate-800">{mockCustomer.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Phone Number</span>
              <span className="font-semibold text-slate-800">{mockCustomer.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Registered Email</span>
              <span className="font-semibold text-slate-800">{mockCustomer.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Residential Address</span>
              <span className="font-semibold text-slate-800 text-right max-w-[240px]">
                {mockCustomer.address}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Aadhaar (Masked)</span>
              <span className="font-mono font-semibold text-slate-800">
                {maskAadhaar(mockCustomer.aadharNo)}
              </span>
            </div>
          </div>
        </div>

        {/* KYC Verification Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">KYC Status</h2>
                <p className="text-xs text-slate-400">ID: {kyc ? kyc.kycId : "KYC001"}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{kyc?.status || "Verified"}</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Document Type</span>
              <span className="font-semibold text-slate-800">{kyc?.kycType || "Aadhar"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Document Details</span>
              <span className="font-semibold text-slate-800">{kyc?.docDetails || "Aadhaar Card"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Verification Date</span>
              <span className="font-semibold text-slate-800">
                {kyc?.verifiedOn ? formatDate(kyc.verifiedOn) : "-"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Verified By</span>
              <span className="font-semibold text-slate-800">{kyc?.verifiedBy || "Bank Admin"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
