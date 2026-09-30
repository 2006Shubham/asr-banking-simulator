import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";

/**
 * ASR Bank - Standard Error State Component
 *
 * @param {string} title - Error title
 * @param {string} message - User-friendly error message
 * @param {Function} onRetry - Optional retry callback
 */
const ErrorState = ({
  title = "Something went wrong",
  message = "We encountered an issue while communicating with the banking server. Please try again.",
  onRetry,
  action,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-rose-200/80 p-8 flex flex-col items-center justify-center text-center shadow-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-bold text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Try Again
        </Button>
      ) : (
        action
      )}
    </div>
  );
};

export default ErrorState;
