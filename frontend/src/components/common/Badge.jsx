import React from "react";

/**
 * ASR Bank - Standard Badge Component
 * Used for transaction statuses, account types, verification flags, etc.
 *
 * @param {string} variant - 'success' | 'danger' | 'warning' | 'info' | 'neutral'
 * @param {string} size - 'sm' | 'md'
 * @param {boolean} dot - Shows status indicator dot
 * @param {React.ReactNode} icon - Optional Lucide icon
 */
const Badge = ({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  icon: Icon,
  className = "",
}) => {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80",
    error: "bg-rose-50 text-rose-700 border-rose-200/80",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80",
    info: "bg-blue-50 text-blue-700 border-blue-200/80",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const dotColors = {
    success: "bg-emerald-500",
    danger: "bg-rose-500",
    error: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    neutral: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-semibold",
    md: "text-xs px-2.5 py-0.5 gap-1.5 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${
        variantStyles[variant] || variantStyles.neutral
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
