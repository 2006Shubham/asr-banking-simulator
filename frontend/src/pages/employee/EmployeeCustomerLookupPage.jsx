import React, { useState, useEffect, useCallback } from "react";
import { Search, User, Phone, Mail, Building, AlertCircle, RefreshCw } from "lucide-react";
import inquiryService from "../../services/inquiryService";

export default function EmployeeCustomerLookupPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async (searchQuery = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await inquiryService.searchCustomers(searchQuery.trim());
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load customers from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers("");
  }, [fetchCustomers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(query);
  };

  const handleClear = () => {
    setQuery("");
    fetchCustomers("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Directory Lookup</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Locate and inspect verified customer records across the bank by customer ID, name, phone, or email
          </p>
        </div>
        <button
          onClick={() => fetchCustomers(query)}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition self-start sm:self-auto cursor-pointer"
          title="Refresh Directory"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name, phone, or ID (e.g. Rutuja, CUST010)..."
            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-white shadow-xs"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#003366] text-white text-sm font-semibold rounded-xl hover:bg-[#002244] transition disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2.5 border border-slate-200 bg-white text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && results.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No matching customers found</p>
          <p className="text-sm text-slate-400 mt-1">Please double-check the search keyword</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 text-xs font-semibold text-slate-500 bg-slate-50/50 flex justify-between items-center">
            <span>
              Showing {results.length} verified customer record{results.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px] text-slate-400">Core Relational Banking Entity</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Cust ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Full Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Home Branch</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">City / Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((c) => (
                  <tr key={c.custId} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-mono text-[#003366] font-bold">
                      {c.custId}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {c.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {c.email || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">
                      {c.branchId || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 truncate max-w-xs" title={c.address || c.city || ""}>
                      {c.address || c.city || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
