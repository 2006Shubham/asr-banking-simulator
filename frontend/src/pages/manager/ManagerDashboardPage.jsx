import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  RefreshCw,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import inquiryService from "../../services/inquiryService";

const KPICard = ({ label, value, color, icon: Icon, sub }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value ?? "0"}</p>
    {sub && <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>}
  </div>
);

export default function ManagerDashboardPage() {
  const { employee, branch } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!employee?.branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await inquiryService.getManagerDashboardStats(employee.branchId);
      setReport(data.report || data || null);
      setWorkload(Array.isArray(data.workload) ? data.workload : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load manager dashboard");
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branch Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {branch?.branchName || "Main Branch"}, {branch?.city || "Pune"} · Real-time Inquiry Oversight
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
          title="Refresh Dashboard"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
          {error}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard
              label="Total Inquiries"
              value={report?.totalInquiries}
              color="bg-slate-100 text-slate-700"
              icon={ClipboardList}
              sub="Consolidated"
            />
            <KPICard
              label="Open / Unassigned"
              value={report?.openInquiries}
              color="bg-blue-50 text-blue-700"
              icon={Clock}
              sub="Needs pickup"
            />
            <KPICard
              label="In Progress"
              value={report?.inProgressInquiries ?? report?.assignedInquiries}
              color="bg-orange-50 text-orange-700"
              icon={TrendingUp}
              sub="Under investigation"
            />
            <KPICard
              label="Escalated to Manager"
              value={report?.escalatedInquiries}
              color="bg-rose-50 text-rose-700"
              icon={AlertCircle}
              sub="Requires action"
            />
            <KPICard
              label="Resolved Inquiries"
              value={report?.resolvedInquiries}
              color="bg-green-50 text-green-700"
              icon={CheckCircle}
              sub="Case resolved"
            />
            <KPICard
              label="Avg Resolution"
              value={
                report?.avgResolutionHours != null
                  ? `${Number(report.avgResolutionHours).toFixed(1)}h`
                  : "—"
              }
              color="bg-purple-50 text-purple-700"
              icon={BarChart3}
              sub="Turnaround time"
            />
          </div>

          {/* Quick Action Navigation */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/manager/inquiries?filter=escalated")}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition shadow-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Review Escalated Cases ({report?.escalatedInquiries ?? 0})</span>
            </button>
            <button
              onClick={() => navigate("/manager/inquiries")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-semibold rounded-lg hover:bg-[#002244] transition shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              <span>All Branch Inquiries</span>
            </button>
            <button
              onClick={() => navigate("/manager/employees")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              <Users className="w-4 h-4" />
              <span>Staff Workload</span>
            </button>
            <button
              onClick={() => navigate("/manager/reports")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Branch SQL Reports</span>
            </button>
          </div>

          {/* Staff Workload Summary */}
          {workload.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Branch Staff Performance & Ticket Distribution</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aggregated live directly from inquiry and employee tables
                  </p>
                </div>
                <button
                  onClick={() => navigate("/manager/employees")}
                  className="text-xs text-[#003366] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Detailed Workload View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold text-slate-600">Employee</th>
                      <th className="px-5 py-3 text-left font-semibold text-slate-600">Designation</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-600">Status</th>
                      <th className="px-5 py-3 text-right font-semibold text-slate-600">Active Cases</th>
                      <th className="px-5 py-3 text-right font-semibold text-slate-600">Resolved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workload.map((emp) => (
                      <tr key={emp.empId} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{emp.empId}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{emp.designation}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              emp.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {emp.status || "Active"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-orange-600">
                          {emp.activeCases ?? 0}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-green-600">
                          {emp.resolvedCases ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

