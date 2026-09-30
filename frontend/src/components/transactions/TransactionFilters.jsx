import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "../common";

const TransactionFilters = ({
  searchQuery,
  onSearchChange,
  filterType,
  onTypeChange,
  filterChannel,
  onChannelChange,
  filterStatus,
  onStatusChange,
  filterAccount,
  onAccountChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by description, reference number, or transaction ID..."
          className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition"
        />
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 items-center">
        {/* Type Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Txn Type
          </label>
          <select
            value={filterType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
          >
            <option value="ALL">All Types</option>
            <option value="Credit">Credits Only (+)</option>
            <option value="Debit">Debits Only (-)</option>
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Channel
          </label>
          <select
            value={filterChannel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
          >
            <option value="ALL">All Channels</option>
            <option value="UPI">UPI</option>
            <option value="NEFT">NEFT</option>
            <option value="IMPS">IMPS</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Account Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Account
          </label>
          <select
            value={filterAccount}
            onChange={(e) => onAccountChange(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 px-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
          >
            <option value="ALL">All Accounts</option>
            <option value="ACC001">Savings (•••• 0001)</option>
            <option value="ACC002">Current (•••• 0002)</option>
          </select>
        </div>

        {/* Reset Action */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 pt-4 sm:pt-0 flex items-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={onResetFilters}
              fullWidth
              className="text-slate-500 hover:text-slate-900 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
