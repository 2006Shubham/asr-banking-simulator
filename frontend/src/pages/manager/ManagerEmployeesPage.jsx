import React, { useState, useEffect, useCallback } from "react";
import { Users, RefreshCw, FileSpreadsheet } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import inquiryService from "../../services/inquiryService";
import { exportToCsv } from "../../utils/exporter";

export default function ManagerEmployeesPage() {
  const { employee, branch } = useAuth();
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!employee?.branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await inquiryService.getEmployeeWorkload(employee.branchId);
      setWorkload(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load staff performance data");
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    load();
  }, [load]);

  const maxActive = Math.max(...workload.map((e) => e.activeCases ?? 0), 1);

  const handleExportWorkload = () => {
    if (!workload.length) {
      alert("No staff data available to export.");
      return;
    }
    const headers = [
      "Employee ID",
      "Employee Name",
      "Designation",
      "Status",
      "Active Cases",
      "Resolved Cases",
      "Branch ID",
    ];
    const rows = workload.map((emp) => [
      emp.empId,
      emp.name,
      emp.designation,
      emp.status || "Active",
      emp.activeCases ?? 0,
      emp.resolvedCases ?? 0,
      employee?.branchId,
    ]);
    exportToCsv(
      `ASR_Bank_Staff_Workload_${branch?.branchId || "BR001"}_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branch Staff & Workload Distribution</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of ticket assignment and resolution efficiency for {branch?.branchName || "this branch"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportWorkload}
            disabled={!workload.length || loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Staff Workload (CSV/Excel)</span>
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
      ) : workload.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No staff records found for this branch</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Employee</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600">Designation</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Active Cases</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Resolved Cases</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 min-w-[150px]">
                    Relative Load
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workload.map((emp) => {
                  const active = emp.activeCases ?? 0;
                  const pct = Math.min((active / maxActive) * 100, 100);
                  const isHighLoad = active > maxActive * 0.7 && active > 0;

                  return (
                    <tr key={emp.empId} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{emp.name}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{emp.empId}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">{emp.designation}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            emp.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {emp.status || "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-orange-600 text-sm">{active}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-green-600 text-sm">{emp.resolvedCases ?? 0}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isHighLoad ? "bg-orange-500" : "bg-[#003366]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {active} assigned ({Math.round(pct)}% of peak)
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

