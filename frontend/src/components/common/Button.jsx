import React from "react";
import { Loader2 } from "lucide-react";

/**
 * ASR Bank - Standard Button Component
 *
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} isLoading - Shows spinner and disables button
 * @param {React.ReactNode} icon - Optional Lucide icon
 * @param {string} iconPosition - 'left' | 'right'
 * @param {boolean} fullWidth - Expands to 100% width
 */
const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  onClick,
  ...props
}) => {
  // Base styling for all banking buttons
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  // Variant styling
  const variantClasses = {
    primary:
      "bg-[#003366] hover:bg-[#00284d] text-white shadow-sm focus:ring-[#003366] active:bg-[#002244]",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-slate-400 active:bg-slate-100",
    outline:
      "border border-[#003366] text-[#003366] hover:bg-blue-50/70 focus:ring-[#003366] active:bg-blue-100",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-600 active:bg-emerald-800",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-600 active:bg-rose-800",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300 active:bg-slate-200",
  };

  // Size styling
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        sizeClasses[size] || sizeClasses.md
      } ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
