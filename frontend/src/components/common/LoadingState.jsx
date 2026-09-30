import React from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

/**
 * ASR Bank - Standard Loading State Component
 *
 * @param {string} message - Primary loading prompt
 * @param {string} description - Optional secondary detail
 * @param {boolean} fullPage - Centers in a full page container
 */
const LoadingState = ({
  message = "Securely loading banking data...",
  description = "Communicating with ASR Bank servers",
  fullPage = false,
  className = "",
}) => {
  const containerClass = fullPage
    ? "min-h-[50vh] flex flex-col items-center justify-center p-8 text-center"
    : "py-12 px-4 flex flex-col items-center justify-center text-center";

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="relative mb-4">
        {/* Outer subtle glow */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
          <Loader2 className="w-7 h-7 text-[#003366] animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-800 tracking-tight">
        {message}
      </h4>
      {description && (
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
};

export default LoadingState;
