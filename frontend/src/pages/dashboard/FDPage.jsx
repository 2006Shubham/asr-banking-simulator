import React, { useState } from "react";
import { mockFDs, mockFDInterests } from "../../data/mockData";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { ChevronDown, ChevronUp, PiggyBank } from "lucide-react";

const FDPage = () => {
  const [expandedFdId, setExpandedFdId] = useState(mockFDs[0]?.fdId || null);

  const toggleExpand = (fdId) => {
    setExpandedFdId(expandedFdId === fdId ? null : fdId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Fixed Deposits (FD)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Term deposits and accrued interest payout tracking. (Placeholder Page)
        </p>
      </div>

      <div className="space-y-4">
        {mockFDs.map((fd) => {
          const isExpanded = expandedFdId === fd.fdId;
          const interests = mockFDInterests.filter((i) => i.fdId === fd.fdId);

          return (
            <div key={fd.fdId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm">Fixed Deposit Account</h3>
                      <span className="text-[11px] font-mono text-slate-400">#{fd.fdId}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Rate: {fd.interestRate}% p.a. • Started: {formatDate(fd.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[11px] text-slate-400">Maturity Date</p>
                    <p className="text-xs font-semibold text-slate-800">{formatDate(fd.maturityDate)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Principal Deposit</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(fd.amount)}</p>
                  </div>

                  <button
                    onClick={() => toggleExpand(fd.fdId)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>Interest Info</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Interest Schedule */}
              {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-200 p-6">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Interest Accrual & Payout Schedule
                  </h4>
                  <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Interest ID</th>
                          <th className="py-2.5 px-4">Calculation Date</th>
                          <th className="py-2.5 px-4">Interest Amount</th>
                          <th className="py-2.5 px-4">Payout Date</th>
                          <th className="py-2.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {interests.map((item) => (
                          <tr key={item.interestId}>
                            <td className="py-2.5 px-4 font-mono font-medium text-slate-800">
                              {item.interestId}
                            </td>
                            <td className="py-2.5 px-4">{formatDate(item.calcDate)}</td>
                            <td className="py-2.5 px-4 font-semibold text-emerald-700">
                              +{formatCurrency(item.interestAmount)}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500">{formatDate(item.payoutDate)}</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                {item.status}
                              </span>
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
        })}
      </div>
    </div>
  );
};

export default FDPage;
