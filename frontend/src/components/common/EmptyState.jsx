import React from "react";
import { FolderOpen } from "lucide-react";

/**
 * ASR Bank - Standard Empty State Component
 *
 * @param {string} title - Main header
 * @param {string} description - Explanation
 * @param {React.ReactNode} icon - Optional Lucide icon
 * @param {React.ReactNode} action - Optional CTA action
 */
const EmptyState = ({
  title = "No records found",
  description = "There is currently no information to display for this view.",
  icon: Icon = FolderOpen,
  action,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-dashed border-slate-300 py-12 px-6 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
