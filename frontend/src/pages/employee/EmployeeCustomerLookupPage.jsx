import React, { useState } from "react";
import { Search, User, Phone, Mail, Building, AlertCircle } from "lucide-react";
import inquiryService from "../../services/inquiryService";

export default function EmployeeCustomerLookupPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const data = await inquiryService.searchCustomers(query.trim());
      setResults(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (e) {
      setError(e.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Directory Lookup</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Locate customer records across the bank by customer ID, name, phone, or email
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name, phone, or ID (e.g. CUST001)..."
            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] bg-white shadow-xs"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#003366] text-white text-sm font-semibold rounded-xl hover:bg-[#002244] transition disabled:opacity-50 shadow-sm"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {searched && (
        results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No matching customers found</p>
            <p className="text-sm text-slate-400 mt-1">Please double-check the search keyword</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 text-xs font-semibold text-slate-500 bg-slate-50/50">
              Found {results.length} customer record{results.length !== 1 ? "s" : ""}
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
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">City</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((c) => (
                    <tr key={c.custId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 font-mono text-[#003366] font-bold">
                        {c.custId}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
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
                      <td className="px-4 py-3.5 text-slate-500">
                        {c.city || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}

