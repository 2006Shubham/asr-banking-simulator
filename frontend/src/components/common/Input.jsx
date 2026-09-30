import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * ASR Bank - Standard Input Component
 *
 * @param {string} label - Input label
 * @param {string} error - Error message string
 * @param {string} helperText - Descriptive helper text
 * @param {React.ReactNode} icon - Optional Lucide leading icon
 * @param {React.ReactNode} rightAction - Optional trailing element/button
 * @param {boolean} required - Adds required indicator
 */
const Input = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  rightAction,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full text-sm rounded-lg border transition-colors duration-150 py-2.5 ${
            Icon ? "pl-9" : "pl-3.5"
          } ${rightAction ? "pr-10" : "pr-3.5"} ${
            error
              ? "border-rose-400 bg-rose-50/30 text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
          } ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : ""}`}
          {...props}
        />

        {rightAction && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightAction}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
