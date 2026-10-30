import React from "react";
import { User, Mail, Phone, Briefcase, Calendar, MapPin, Building2, DollarSign, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-slate-500" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

export default function ManagerProfilePage() {
  const { employee, branch, user } = useAuth();

  const fmtCurrency = (v) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Branch Manager Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
          {employee?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2) || "BM"}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{employee?.name || user?.username}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{employee?.designation || "Branch Manager"}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
              BRANCH MANAGER
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold">
              {employee?.empId}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
              {employee?.status || "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Personal & Employment Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Employment Details</h3>
        <InfoRow icon={User} label="Employee ID" value={employee?.empId} />
        <InfoRow icon={Mail} label="Official Email" value={employee?.email} />
        <InfoRow icon={Phone} label="Direct Phone" value={employee?.phone} />
        <InfoRow icon={Briefcase} label="Official Designation" value={employee?.designation} />
        <InfoRow
          icon={Calendar}
          label="Date of Joining"
          value={
            employee?.hireDate
              ? new Date(employee.hireDate).toLocaleDateString("en-IN", { dateStyle: "long" })
              : "—"
          }
        />
        <InfoRow icon={ShieldCheck} label="System User Account" value={user?.userId} />
      </div>

      {/* Branch Jurisdiction */}
      {branch && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Assigned Branch Details</h3>
          <InfoRow icon={Building2} label="Branch Name" value={branch?.branchName} />
          <InfoRow icon={MapPin} label="Branch City" value={branch?.city} />
          <InfoRow icon={Building2} label="IFSC Code" value={branch?.ifscCode} />
          <InfoRow icon={MapPin} label="Branch Street Address" value={branch?.address} />
          {branch?.totalAssets != null && (
            <InfoRow icon={DollarSign} label="Total Managed Assets" value={fmtCurrency(branch.totalAssets)} />
          )}
        </div>
      )}
    </div>
  );
}

