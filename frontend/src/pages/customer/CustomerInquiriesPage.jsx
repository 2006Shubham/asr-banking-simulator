import React, { useState, useEffect, useCallback } from "react";
import { Plus, MessageSquare, ChevronDown, ChevronUp, Send, RefreshCw, AlertCircle, FileSpreadsheet } from "lucide-react";
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

const PRIORITY_STYLES = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-rose-100 text-rose-700",
};

const CATEGORIES = ["Accounts", "Transactions", "Cards", "Loans", "NetBanking", "General"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function CustomerInquiriesPage() {
  const { user, customer } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [messages, setMessages] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    category: "General",
    subject: "",
    description: "",
    priority: "MEDIUM",
    accountNo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    if (!customer?.custId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await inquiryService.getCustomerInquiries(customer.custId);
      setInquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!messages[id]) {
      try {
        const msgs = await inquiryService.getCustomerMessages(id);
        setMessages((prev) => ({ ...prev, [id]: Array.isArray(msgs) ? msgs : [] }));
      } catch {
        setMessages((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  const handleReply = async (inquiryId) => {
    const text = (replyText[inquiryId] || "").trim();
    if (!text) return;
    setReplyLoading((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      await inquiryService.customerReply(inquiryId, text, user.userId);
      const msgs = await inquiryService.getCustomerMessages(inquiryId);
      setMessages((prev) => ({ ...prev, [inquiryId]: Array.isArray(msgs) ? msgs : [] }));
      setReplyText((prev) => ({ ...prev, [inquiryId]: "" }));
    } catch (e) {
      alert("Reply failed: " + (e.response?.data?.message || e.message));
    } finally {
      setReplyLoading((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const handleNewSubmit = async (e) => {
    e.preventDefault();
    if (!newForm.subject.trim() || !newForm.description.trim()) {
      setFormError("Subject and description are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await inquiryService.createInquiry(
        {
          custId: customer.custId,
          branchId: customer.branchId,
          category: newForm.category,
          subject: newForm.subject.trim(),
          description: newForm.description.trim(),
          priority: newForm.priority,
          accountNo: newForm.accountNo.trim() || null,
        },
        user.userId
      );
      setShowNewModal(false);
      setNewForm({ category: "General", subject: "", description: "", priority: "MEDIUM", accountNo: "" });
      await load();
    } catch (e) {
      setFormError(e.response?.data?.message || "Failed to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      : "—";

  const handleExportInquiries = () => {
    if (!inquiries.length) {
      alert("No inquiries available to export.");
      return;
    }
    const headers = [
      "Inquiry ID",
      "Account No",
      "Category",
      "Priority",
      "Status",
      "Subject",
      "Description",
      "Created Date",
    ];
    const rows = inquiries.map((inq) => [
      inq.inquiryId,
      inq.accountNo || "—",
      inq.category,
      inq.priority,
      inq.status,
      inq.subject,
      inq.description,
      inq.createdAt ? new Date(inq.createdAt).toLocaleString("en-IN") : "—",
    ]);

    exportToCsv(
      `ASR_Bank_My_Inquiries_${customer?.custId || "CUST"}_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support & Inquiries</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Raise and track your banking service requests and queries
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportInquiries}
            disabled={!inquiries.length || loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Inquiries (Excel)</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white text-xs font-semibold rounded-lg hover:bg-[#002244] transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Inquiry
          </button>
        </div>
      </div>

      {/* List */}
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
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No inquiries found</p>
          <p className="text-sm text-slate-400 mt-1">Click "New Inquiry" to raise a support ticket</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.inquiryId}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Row */}
              <button
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition"
                onClick={() => toggleExpand(inq.inquiryId)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-slate-400">#{inq.inquiryId}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[inq.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {inq.status?.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        PRIORITY_STYLES[inq.priority] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {inq.priority}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {inq.category}
                    </span>
                    {inq.accountNo && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                        A/C: {inq.accountNo}
                      </span>
                    )}
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

              {/* Expanded Messages */}
              {expandedId === inq.inquiryId && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Original Description:</p>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {inq.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {(messages[inq.inquiryId] || []).map((msg) => (
                      <div
                        key={msg.messageId}
                        className={`flex ${
                          msg.senderRole === "Customer" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md px-3.5 py-2.5 rounded-xl text-xs ${
                            msg.senderRole === "Customer"
                              ? "bg-[#003366] text-white"
                              : "bg-white border border-slate-200 text-slate-800"
                          }`}
                        >
                          <p>{msg.messageText}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              msg.senderRole === "Customer" ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            {msg.senderRole} · {fmt(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(messages[inq.inquiryId] || []).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">
                        No responses yet. A bank representative will review your request shortly.
                      </p>
                    )}
                  </div>

                  {/* Reply form */}
                  {!["RESOLVED", "CLOSED"].includes(inq.status) ? (
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={replyText[inq.inquiryId] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [inq.inquiryId]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(inq.inquiryId);
                          }
                        }}
                        placeholder="Type your response here..."
                        className="flex-1 text-xs px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-white"
                      />
                      <button
                        onClick={() => handleReply(inq.inquiryId)}
                        disabled={replyLoading[inq.inquiryId]}
                        className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 bg-slate-100 rounded-lg p-2.5 text-center">
                      This inquiry is marked as {inq.status?.toLowerCase()}. Responses are closed.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Inquiry Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">New Banking Inquiry</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Our support team will inspect and respond to your request
              </p>
            </div>
            <form onSubmit={handleNewSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newForm.category}
                  onChange={(e) => setNewForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-slate-50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={newForm.priority}
                  onChange={(e) => setNewForm((p) => ({ ...p, priority: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-slate-50"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={newForm.subject}
                  onChange={(e) => setNewForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Summary of your question or issue"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Provide specific details about your query..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-slate-50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Related Account No. (optional)
                </label>
                <input
                  type="text"
                  value={newForm.accountNo}
                  onChange={(e) => setNewForm((p) => ({ ...p, accountNo: e.target.value }))}
                  placeholder="e.g. ACC001"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-slate-50 font-mono"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewModal(false);
                    setFormError("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#003366] rounded-lg hover:bg-[#002244] transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

