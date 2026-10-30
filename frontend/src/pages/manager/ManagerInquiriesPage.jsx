import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, UserCheck, RefreshCw, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import inquiryService from "../../services/inquiryService";
import { exportToCsv } from "../../utils/exporter";

const STATUS_STYLES = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  ESCALATED: "bg-rose-100 text-rose-700",
  WAITING_FOR_CUSTOMER: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

const TABS = [
  { key: "all_branch", label: "All Branch Inquiries" },
  { key: "escalated", label: "Escalated Inquiries" },
  { key: "queue", label: "Unassigned Queue" },
];

export default function ManagerInquiriesPage() {
  const { employee, user } = useAuth();
  const location = useLocation();
  const qp = new URLSearchParams(location.search);
  const initialFilter = qp.get("filter") || "all_branch";

  const [activeTab, setActiveTab] = useState(initialFilter);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [messages, setMessages] = useState({});
  const [history, setHistory] = useState({});
  const [activeDrawerTab, setActiveDrawerTab] = useState({});
  const [employees, setEmployees] = useState([]);
  const [assignModal, setAssignModal] = useState(null);
  const [assignEmpId, setAssignEmpId] = useState("");
  const [assignRemarks, setAssignRemarks] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const load = useCallback(async () => {
    if (!employee?.branchId) return;
    setLoading(true);
    setError(null);
    setExpandedId(null);
    try {
      const [inqs, emps] = await Promise.all([
        inquiryService.getManagerInquiries(employee.branchId, activeTab),
        inquiryService.getEmployeeWorkload(employee.branchId),
      ]);
      setInquiries(Array.isArray(inqs) ? inqs : []);
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load branch inquiries");
    } finally {
      setLoading(false);
    }
  }, [employee, activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setActiveDrawerTab((prev) => ({ ...prev, [id]: "messages" }));
    if (!messages[id]) {
      try {
        const [msgs, hist] = await Promise.all([
          inquiryService.getEmployeeMessages(id),
          inquiryService.getInquiryHistory(id),
        ]);
        setMessages((prev) => ({ ...prev, [id]: Array.isArray(msgs) ? msgs : [] }));
        setHistory((prev) => ({ ...prev, [id]: Array.isArray(hist) ? hist : [] }));
      } catch {
        setMessages((prev) => ({ ...prev, [id]: [] }));
        setHistory((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  const handleAssign = async () => {
    if (!assignEmpId) {
      alert("Please select a target employee.");
      return;
    }
    setAssignLoading(true);
    try {
      await inquiryService.assignInquiry(
        assignModal,
        assignEmpId,
        user.userId,
        assignRemarks || "Manager assigned"
      );
      setAssignModal(null);
      setAssignEmpId("");
      setAssignRemarks("");
      await load();
    } catch (e) {
      alert("Assignment failed: " + (e.response?.data?.message || e.message));
    } finally {
      setAssignLoading(false);
    }
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const handleExportExcel = () => {
    if (!inquiries.length) {
      alert("No inquiries available to export in this tab.");
      return;
    }
    const headers = [
      "Inquiry ID",
      "Customer ID",
      "Account No",
      "Category",
      "Priority",
      "Status",
      "Subject",
      "Description",
      "Assigned Staff",
      "Branch ID",
      "Created Date",
    ];
    const rows = inquiries.map((inq) => [
      inq.inquiryId,
      inq.custId,
      inq.accountNo || "—",
      inq.category,
      inq.priority,
      inq.status,
      inq.subject,
      inq.description,
      inq.assignedEmpId || "Unassigned",
      inq.branchId || employee?.branchId,
      inq.createdAt ? new Date(inq.createdAt).toLocaleString("en-IN") : "—",
    ]);

    const activeTabLabel = TABS.find((t) => t.key === activeTab)?.label || "Cases";
    exportToCsv(
      `ASR_Bank_Manager_${activeTabLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branch Inquiry Oversight</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor, assign, and manage all support requests submitted to this branch
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!inquiries.length || loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export {TABS.find((t) => t.key === activeTab)?.label} (Excel)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === tab.key
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
          {error}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-600 font-medium">
            {activeTab === "queue"
              ? "No unassigned inquiries"
              : activeTab === "escalated"
              ? "No escalated inquiries"
              : "No inquiries recorded"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === "queue"
              ? "All customer inquiries for this branch have been assigned to active staff members."
              : activeTab === "escalated"
              ? "No inquiry tickets are currently marked as escalated."
              : "No customer inquiries are currently listed under this category."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.inquiryId}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center gap-3">
                <button
                  className="flex-1 text-left flex items-center gap-3"
                  onClick={() => toggleExpand(inq.inquiryId)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-slate-400 font-bold">
                        #{inq.inquiryId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          STATUS_STYLES[inq.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {inq.status?.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {inq.category}
                      </span>
                      {inq.assignedEmpId ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-semibold">
                          Assigned: {inq.assignedEmpId}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-medium">
                          Unassigned
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{inq.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customer: <span className="font-mono text-slate-600">{inq.custId}</span> ·{" "}
                      {fmt(inq.createdAt)}
                    </p>
                  </div>
                  {expandedId === inq.inquiryId ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Manager Assign/Reassign Button */}
                <button
                  onClick={() => {
                    setAssignModal(inq.inquiryId);
                    setAssignEmpId(inq.assignedEmpId || "");
                    setAssignRemarks("");
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#003366] bg-[#003366]/5 border border-[#003366]/20 rounded-lg hover:bg-[#003366]/10 transition shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{inq.assignedEmpId ? "Reassign" : "Assign"}</span>
                </button>
              </div>

              {/* Expanded details */}
              {expandedId === inq.inquiryId && (
                <div className="border-t border-slate-100 bg-slate-50/40">
                  <div className="flex border-b border-slate-200 bg-white">
                    {["messages", "history"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() =>
                          setActiveDrawerTab((prev) => ({ ...prev, [inq.inquiryId]: tab }))
                        }
                        className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition ${
                          (activeDrawerTab[inq.inquiryId] || "messages") === tab
                            ? "border-[#003366] text-[#003366]"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="px-5 py-4">
                    {/* Messages */}
                    {(activeDrawerTab[inq.inquiryId] || "messages") === "messages" && (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Inquiry Description
                          </p>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {inq.description}
                          </p>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {(messages[inq.inquiryId] || []).map((msg) => (
                            <div
                              key={msg.messageId}
                              className={`flex ${
                                msg.senderRole === "Customer" ? "justify-start" : "justify-end"
                              }`}
                            >
                              <div
                                className={`max-w-xs sm:max-w-md px-3.5 py-2.5 rounded-xl text-xs ${
                                  msg.senderRole === "Customer"
                                    ? "bg-white border border-slate-200 text-slate-800"
                                    : msg.isInternal
                                    ? "bg-amber-50 text-amber-900 border border-amber-200"
                                    : "bg-[#003366] text-white"
                                }`}
                              >
                                {msg.isInternal && (
                                  <span className="text-[10px] font-bold text-amber-700 block mb-1">
                                    🔒 Internal Staff Note
                                  </span>
                                )}
                                <p>{msg.messageText}</p>
                                <p
                                  className={`text-[10px] mt-1 ${
                                    msg.senderRole === "Customer"
                                      ? "text-slate-400"
                                      : msg.isInternal
                                      ? "text-amber-700/80"
                                      : "text-blue-200"
                                  }`}
                                >
                                  {msg.senderRole} · {fmt(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* History */}
                    {activeDrawerTab[inq.inquiryId] === "history" && (
                      <div className="space-y-2.5">
                        {(history[inq.inquiryId] || []).length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">
                            No history records
                          </p>
                        ) : (
                          (history[inq.inquiryId] || []).map((h) => (
                            <div
                              key={h.historyId}
                              className="bg-white p-3 rounded-lg border border-slate-200 flex gap-3 text-xs"
                            >
                              <div className="w-1.5 bg-[#003366] rounded-full shrink-0" />
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800">{h.action}</p>
                                {h.remarks && (
                                  <p className="text-slate-600 mt-0.5 bg-slate-50 p-1.5 rounded text-[11px]">
                                    {h.remarks}
                                  </p>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Performed by <span className="font-mono text-slate-600">{h.changedByUserId}</span> · {fmt(h.changedAt)}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Assign Inquiry #{assignModal}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Designate a branch team member responsible for this case
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignee
                </label>
                <select
                  value={assignEmpId}
                  onChange={(e) => setAssignEmpId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                >
                  <option value="">Select branch staff...</option>
                  {employees.map((emp) => (
                    <option key={emp.empId} value={emp.empId}>
                      {emp.name} ({emp.empId}) — {emp.activeCases ?? 0} active cases
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Instructions / Remarks (optional)
                </label>
                <input
                  type="text"
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="e.g. Please expedite customer verification..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setAssignModal(null);
                    setAssignEmpId("");
                    setAssignRemarks("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assignLoading}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#003366] rounded-lg hover:bg-[#002244] transition disabled:opacity-50"
                >
                  {assignLoading ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

