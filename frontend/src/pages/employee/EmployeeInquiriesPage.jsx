import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Send, AlertTriangle, RefreshCw, CheckCircle2, FileSpreadsheet } from "lucide-react";
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

const UPDATABLE_STATUSES = ["IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED"];

const TABS = [
  { key: "assigned", label: "My Cases" },
  { key: "queue", label: "Branch Queue" },
  { key: "escalated", label: "Escalated" },
];

export default function EmployeeInquiriesPage() {
  const { employee, user } = useAuth();
  const [activeTab, setActiveTab] = useState("assigned");
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [messages, setMessages] = useState({});
  const [history, setHistory] = useState({});
  const [activeDrawerTab, setActiveDrawerTab] = useState({});
  const [replyText, setReplyText] = useState({});
  const [isInternal, setIsInternal] = useState({});
  const [msgLoading, setMsgLoading] = useState({});
  const [newStatus, setNewStatus] = useState({});
  const [statusRemarks, setStatusRemarks] = useState({});
  const [statusLoading, setStatusLoading] = useState({});
  const [claimLoading, setClaimLoading] = useState({});
  const [escalateLoading, setEscalateLoading] = useState({});
  const [escalateRemarks, setEscalateRemarks] = useState({});
  const [showEscalateInput, setShowEscalateInput] = useState({});

  const load = useCallback(async () => {
    if (!employee?.empId) return;
    setLoading(true);
    setError(null);
    setExpandedId(null);
    try {
      const data = await inquiryService.getEmployeeInquiries(
        employee.empId,
        employee.branchId,
        activeTab
      );
      setInquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load inquiries");
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

  const handleClaim = async (inquiryId) => {
    setClaimLoading((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      await inquiryService.claimInquiry(inquiryId, employee.empId, user.userId);
      await load();
    } catch (e) {
      alert("Claim failed: " + (e.response?.data?.message || "Already claimed by another staff member."));
    } finally {
      setClaimLoading((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const handleReply = async (inquiryId) => {
    const text = (replyText[inquiryId] || "").trim();
    if (!text) return;
    setMsgLoading((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      await inquiryService.addEmployeeMessage(
        inquiryId,
        text,
        user.userId,
        user.role,
        isInternal[inquiryId] || false
      );
      const msgs = await inquiryService.getEmployeeMessages(inquiryId);
      setMessages((prev) => ({ ...prev, [inquiryId]: Array.isArray(msgs) ? msgs : [] }));
      setReplyText((prev) => ({ ...prev, [inquiryId]: "" }));
      setIsInternal((prev) => ({ ...prev, [inquiryId]: false }));
    } catch (e) {
      alert("Reply failed: " + (e.response?.data?.message || e.message));
    } finally {
      setMsgLoading((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const handleStatusUpdate = async (inquiryId) => {
    const status = newStatus[inquiryId];
    if (!status) {
      alert("Please select a new status.");
      return;
    }
    setStatusLoading((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      await inquiryService.updateInquiryStatus(
        inquiryId,
        status,
        user.userId,
        employee.empId,
        statusRemarks[inquiryId] || ""
      );
      await load();
      setExpandedId(null);
    } catch (e) {
      alert("Status update failed: " + (e.response?.data?.message || e.message));
    } finally {
      setStatusLoading((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const handleEscalate = async (inquiryId) => {
    const remarks = (escalateRemarks[inquiryId] || "").trim();
    if (!remarks) {
      alert("Please specify why this inquiry requires manager escalation.");
      return;
    }
    setEscalateLoading((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      await inquiryService.escalateInquiry(inquiryId, user.userId, remarks);
      await load();
      setExpandedId(null);
    } catch (e) {
      alert("Escalation failed: " + (e.response?.data?.message || e.message));
    } finally {
      setEscalateLoading((prev) => ({ ...prev, [inquiryId]: false }));
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
      `ASR_Bank_Staff_${activeTabLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inquiry Workspace</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage customer inquiries, claims, and case histories</p>
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
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500">
          No inquiries in {TABS.find((t) => t.key === activeTab)?.label}
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.inquiryId}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Card Header Row */}
              <div className="px-5 py-4 flex items-center gap-3">
                <button
                  className="flex-1 text-left flex items-center gap-3"
                  onClick={() => toggleExpand(inq.inquiryId)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-slate-400 font-bold">#{inq.inquiryId}</span>
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold font-mono">
                        Cust: {inq.custId}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{inq.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{fmt(inq.createdAt)}</p>
                  </div>
                  {expandedId === inq.inquiryId ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {activeTab === "queue" && (
                  <button
                    onClick={() => handleClaim(inq.inquiryId)}
                    disabled={claimLoading[inq.inquiryId]}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition disabled:opacity-50 shrink-0 shadow-xs"
                  >
                    {claimLoading[inq.inquiryId] ? "Claiming..." : "Claim Case"}
                  </button>
                )}
              </div>

              {/* Expanded Action & Communication Workspace */}
              {expandedId === inq.inquiryId && (
                <div className="border-t border-slate-100 bg-slate-50/40">
                  <div className="flex border-b border-slate-200 bg-white">
                    {["messages", "history", "actions"].map((tab) => (
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
                    {/* Tab 1: Messages & Thread */}
                    {(activeDrawerTab[inq.inquiryId] || "messages") === "messages" && (
                      <div className="space-y-4">
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

                        {/* Reply Input */}
                        {!["RESOLVED", "CLOSED"].includes(inq.status) && (
                          <div className="space-y-2 pt-2 bg-white p-3 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`int-${inq.inquiryId}`}
                                checked={isInternal[inq.inquiryId] || false}
                                onChange={(e) =>
                                  setIsInternal((prev) => ({
                                    ...prev,
                                    [inq.inquiryId]: e.target.checked,
                                  }))
                                }
                                className="rounded text-[#003366] focus:ring-[#003366]"
                              />
                              <label
                                htmlFor={`int-${inq.inquiryId}`}
                                className="text-xs text-amber-800 font-semibold cursor-pointer"
                              >
                                Internal Note (hidden from customer, visible only to bank staff)
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={replyText[inq.inquiryId] || ""}
                                onChange={(e) =>
                                  setReplyText((prev) => ({
                                    ...prev,
                                    [inq.inquiryId]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleReply(inq.inquiryId);
                                }}
                                placeholder={
                                  isInternal[inq.inquiryId]
                                    ? "Write internal observation or assessment..."
                                    : "Send direct response to customer..."
                                }
                                className={`flex-1 text-xs px-3.5 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#003366]/20 bg-slate-50 ${
                                  isInternal[inq.inquiryId]
                                    ? "border-amber-300 bg-amber-50/30"
                                    : "border-slate-200"
                                }`}
                              />
                              <button
                                onClick={() => handleReply(inq.inquiryId)}
                                disabled={msgLoading[inq.inquiryId]}
                                className="px-4 py-2 bg-[#003366] text-white text-xs font-semibold rounded-lg hover:bg-[#002244] transition disabled:opacity-50 flex items-center gap-1"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Audit History */}
                    {activeDrawerTab[inq.inquiryId] === "history" && (
                      <div className="space-y-3">
                        {(history[inq.inquiryId] || []).length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">No audit events recorded</p>
                        ) : (
                          (history[inq.inquiryId] || []).map((h) => (
                            <div key={h.historyId} className="flex gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                              <div className="w-1.5 bg-[#003366] rounded-full shrink-0" />
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800">{h.action}</p>
                                {h.remarks && (
                                  <p className="text-slate-600 mt-0.5 bg-slate-50 p-1.5 rounded text-[11px]">
                                    {h.remarks}
                                  </p>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Action by <span className="font-mono text-slate-600">{h.changedByUserId}</span> · {fmt(h.changedAt)}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Tab 3: Case Management Actions */}
                    {activeDrawerTab[inq.inquiryId] === "actions" && (
                      <div className="space-y-5 bg-white p-4 rounded-xl border border-slate-200">
                        {!["RESOLVED", "CLOSED"].includes(inq.status) ? (
                          <>
                            {/* Update Status */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Change Status
                              </label>
                              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                <select
                                  value={newStatus[inq.inquiryId] || ""}
                                  onChange={(e) =>
                                    setNewStatus((prev) => ({
                                      ...prev,
                                      [inq.inquiryId]: e.target.value,
                                    }))
                                  }
                                  className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                                >
                                  <option value="">Select new status...</option>
                                  {UPDATABLE_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s.replace(/_/g, " ")}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={statusRemarks[inq.inquiryId] || ""}
                                  onChange={(e) =>
                                    setStatusRemarks((prev) => ({
                                      ...prev,
                                      [inq.inquiryId]: e.target.value,
                                    }))
                                  }
                                  placeholder="Resolution or status note..."
                                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                                />
                                <button
                                  onClick={() => handleStatusUpdate(inq.inquiryId)}
                                  disabled={statusLoading[inq.inquiryId]}
                                  className="px-4 py-2 bg-[#003366] text-white text-xs font-semibold rounded-lg hover:bg-[#002244] transition disabled:opacity-50 shrink-0"
                                >
                                  {statusLoading[inq.inquiryId] ? "Saving..." : "Update Status"}
                                </button>
                              </div>
                            </div>

                            {/* Escalate to Manager */}
                            <div className="border-t border-slate-100 pt-4">
                              <label className="text-xs font-semibold text-rose-700 mb-1.5 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Escalate Case to Branch Manager</span>
                              </label>
                              {!showEscalateInput[inq.inquiryId] ? (
                                <button
                                  onClick={() =>
                                    setShowEscalateInput((prev) => ({
                                      ...prev,
                                      [inq.inquiryId]: true,
                                    }))
                                  }
                                  className="mt-1 px-3.5 py-1.5 text-xs font-semibold text-rose-700 border border-rose-200 bg-rose-50/50 rounded-lg hover:bg-rose-100 transition"
                                >
                                  Initiate Escalation
                                </button>
                              ) : (
                                <div className="flex gap-2 mt-2">
                                  <input
                                    type="text"
                                    value={escalateRemarks[inq.inquiryId] || ""}
                                    onChange={(e) =>
                                      setEscalateRemarks((prev) => ({
                                        ...prev,
                                        [inq.inquiryId]: e.target.value,
                                      }))
                                    }
                                    placeholder="Explain why this requires Branch Manager intervention..."
                                    className="flex-1 text-xs px-3.5 py-2 rounded-lg border border-rose-300 bg-rose-50/50 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                  />
                                  <button
                                    onClick={() => handleEscalate(inq.inquiryId)}
                                    disabled={escalateLoading[inq.inquiryId]}
                                    className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition disabled:opacity-50 shrink-0"
                                  >
                                    {escalateLoading[inq.inquiryId] ? "Escalating..." : "Confirm Escalation"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-4">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>This inquiry is {inq.status?.toLowerCase()}. No further actions required.</span>
                          </div>
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
    </div>
  );
}

