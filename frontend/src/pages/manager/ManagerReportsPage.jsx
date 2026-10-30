import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, RefreshCw, Database, FileSpreadsheet, Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import inquiryService from "../../services/inquiryService";
import { exportMultipleSectionsToCsv, exportToCsv } from "../../utils/exporter";

const KPICard = ({ label, value, color }) => (
  <div className={`rounded-xl p-4 border bg-white ${color}`}>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="text-2xl font-bold mt-1 text-slate-900">{value ?? "0"}</p>
  </div>
);

const BreakdownTable = ({ title, data, labelTitle = "Classification", filenamePrefix = "Report" }) => {
  // Normalize data whether it's an Object/Map { "Accounts": 2 } or an Array [ { category: "Accounts", count: 2 } ]
  let rows = [];
  if (Array.isArray(data)) {
    rows = data.map((item) => ({
      label: item.category || item.status || item.priority || item.label || item.name || "—",
      count: item.count ?? item.value ?? 0,
    }));
  } else if (data && typeof data === "object") {
    rows = Object.entries(data).map(([key, val]) => ({
      label: key,
      count: typeof val === "number" ? val : (val?.count ?? 0),
    }));
  }

  const handleExportSingle = () => {
    const headers = [labelTitle, "Total Count"];
    const csvRows = rows.map((r) => [r.label, r.count]);
    exportToCsv(`ASR_Bank_${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`, headers, csvRows);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <span className="text-[11px] font-mono text-slate-400">
            {rows.length} {rows.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <button
          onClick={handleExportSingle}
          title={`Download ${title} as Excel/CSV`}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#003366] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#003366]" />
          <span>Export</span>
        </button>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-100">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-600">{labelTitle}</th>
            <th className="px-4 py-2.5 text-right font-semibold text-slate-600">Total Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-4 py-4 text-center text-slate-400">
                No recorded cases
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition">
                <td className="px-4 py-2.5 font-medium text-slate-700">{row.label}</td>
                <td className="px-4 py-2.5 text-right font-bold text-[#003366] font-mono">
                  {row.count}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function ManagerReportsPage() {
  const { employee, branch } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!employee?.branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await inquiryService.getBranchReport(employee.branchId);
      setReport(data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load branch report data");
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExportFullReport = () => {
    if (!report) return;

    const sections = [
      {
        title: `ASR Bank - Branch Performance KPI Summary (${branch?.branchName || "Branch"} - ${branch?.ifscCode || ""})`,
        headers: ["Metric Name", "Value"],
        rows: [
          ["Total Inquiries", report.totalInquiries ?? 0],
          ["Open Inquiries", report.openInquiries ?? 0],
          ["Assigned Inquiries", report.assignedInquiries ?? 0],
          ["In Progress Inquiries", report.inProgressInquiries ?? report.assignedInquiries ?? 0],
          ["Escalated Inquiries", report.escalatedInquiries ?? 0],
          ["Resolved Inquiries", report.resolvedInquiries ?? 0],
          ["Average Turnaround Time (Hours)", report.avgResolutionHours != null ? Number(report.avgResolutionHours).toFixed(2) : "0.00"],
          ["Generated At", new Date().toLocaleString("en-IN")],
        ],
      },
      {
        title: "Distribution by Inquiry Category",
        headers: ["Category", "Case Count"],
        rows: Object.entries(report.categoryBreakdown || {}).map(([k, v]) => [k, v]),
      },
      {
        title: "Distribution by Status",
        headers: ["Status", "Case Count"],
        rows: Object.entries(report.statusBreakdown || {}).map(([k, v]) => [k, v]),
      },
      {
        title: "Distribution by Priority",
        headers: ["Priority", "Case Count"],
        rows: Object.entries(report.priorityBreakdown || {}).map(([k, v]) => [k, v]),
      },
    ];

    exportMultipleSectionsToCsv(
      `ASR_Bank_Branch_Report_${branch?.branchId || "BR001"}_${new Date().toISOString().slice(0, 10)}.csv`,
      sections
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branch Inquiry Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            SQL Aggregated Reports for {branch?.branchName || "Branch"} ({branch?.ifscCode || ""})
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
            title="Refresh Reports"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportFullReport}
            disabled={!report || loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Full Report (Excel)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
          {error}
        </div>
      ) : report ? (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard label="Total Inquiries" value={report.totalInquiries} color="border-slate-200" />
            <KPICard label="Open Cases" value={report.openInquiries} color="border-blue-200" />
            <KPICard label="Resolved Cases" value={report.resolvedInquiries} color="border-emerald-200" />
            <KPICard label="Escalated Cases" value={report.escalatedInquiries} color="border-rose-200" />
            <KPICard
              label="In Progress"
              value={report.inProgressInquiries ?? report.assignedInquiries}
              color="border-orange-200"
            />
            <KPICard
              label="Avg Resolution"
              value={
                report.avgResolutionHours != null
                  ? `${Number(report.avgResolutionHours).toFixed(1)} hrs`
                  : "—"
              }
              color="border-purple-200"
            />
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BreakdownTable
              title="Distribution by Inquiry Category"
              data={report.categoryBreakdown}
              labelTitle="Inquiry Category"
              filenamePrefix="Category_Report"
            />
            <BreakdownTable
              title="Distribution by Inquiry Status"
              data={report.statusBreakdown}
              labelTitle="Current Status"
              filenamePrefix="Status_Report"
            />
          </div>

          {report.priorityBreakdown && (
            <BreakdownTable
              title="Distribution by Priority"
              data={report.priorityBreakdown}
              labelTitle="Ticket Priority"
              filenamePrefix="Priority_Report"
            />
          )}

          {/* Database Provenance Card */}
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003366] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Dynamic JDBC SQL Aggregation</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All metrics are calculated dynamically using SQL statements (COUNT, AVG, GROUP BY, CASE WHEN) against the MySQL `inquiries` and `inquiry_history` tables.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
