import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Briefcase,
  RefreshCw,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import inquiryService from "../../services/inquiryService";

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 leading-none mt-1">{value ?? "0"}</p>
    </div>
  </div>
);

export default function EmployeeDashboardPage() {
  const { employee, branch } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const STATUS_STYLES = {
    OPEN: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    ESCALATED: "bg-rose-100 text-rose-700",
    WAITING_FOR_CUSTOMER: "bg-purple-100 text-purple-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-slate-100 text-slate-600",
  };

  const load = useCallback(async () => {
    if (!employee?.empId) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, inquiriesData] = await Promise.all([
        inquiryService.getEmployeeDashboardStats(employee.empId, employee.branchId),
        inquiryService.getEmployeeInquiries(employee.empId, employee.branchId, "assigned"),
      ]);
      setStats(statsData);
      setRecentInquiries(Array.isArray(inquiriesData) ? inquiriesData.slice(0, 5) : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    load();
  }, [load]);

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {employee?.name || "Staff Member"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {employee?.designation || "Banking Staff"} · {branch?.branchName || "Branch"}, {branch?.city || ""}
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
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Assigned to Me"
              value={stats?.myAssigned}
              color="bg-amber-50 text-amber-600"
              icon={ClipboardList}
            />
            <StatCard
              label="In Progress"
              value={stats?.myInProgress}
              color="bg-orange-50 text-orange-600"
              icon={TrendingUp}
            />
            <StatCard
              label="Branch Unassigned Queue"
              value={stats?.branchQueue}
              color="bg-blue-50 text-blue-600"
              icon={Clock}
            />
            <StatCard
              label="Escalated Tickets"
              value={stats?.branchEscalated}
              color="bg-rose-50 text-rose-600"
              icon={AlertCircle}
            />
            <StatCard
              label="Resolved by Me"
              value={stats?.myResolved}
              color="bg-green-50 text-green-600"
              icon={CheckCircle}
            />
            <StatCard
              label="Total Branch Tickets"
              value={stats?.branchTotal}
              color="bg-slate-100 text-slate-600"
              icon={Briefcase}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/employee/inquiries")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-semibold rounded-lg hover:bg-[#002244] transition shadow-sm cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>View Assigned Inquiries</span>
            </button>
            <button
              onClick={() => navigate("/employee/customers")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Customer Directory</span>
            </button>
          </div>

          {/* Recent Assigned Cases */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Recent Assigned Inquiries</h2>
              <button
                onClick={() => navigate("/employee/inquiries")}
                className="text-xs text-[#003366] font-semibold hover:underline cursor-pointer"
              >
                View All Inquiries →
              </button>
            </div>
            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No inquiries are currently assigned to you. Check the Branch Queue to claim available cases.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">ID</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Subject</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Category</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentInquiries.map((inq) => (
                      <tr key={inq.inquiryId} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-2.5 font-mono text-slate-500 font-semibold">
                          #{inq.inquiryId}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-800 max-w-xs truncate">
                          {inq.subject}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{inq.category}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              STATUS_STYLES[inq.status] || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {inq.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">{fmt(inq.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

