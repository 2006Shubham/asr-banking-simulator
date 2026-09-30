import React from "react";

/**
 * ASR Bank - Standard Card Component
 * Clean white surface, subtle slate border, institutional banking density.
 */
const Card = ({
  children,
  title,
  subtitle,
  action,
  footer,
  padding = "md",
  hoverable = false,
  className = "",
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverClass = hoverable
    ? "transition-all duration-200 hover:shadow-md hover:border-slate-300"
    : "";

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${hoverClass} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={paddingClasses[padding]}>{children}</div>

      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/75 border-t border-slate-100 text-xs text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
};

// Sub-components for flexible manual composition
Card.Header = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = "" }) => (
  <div className={`px-6 py-3.5 bg-slate-50/75 border-t border-slate-100 text-xs text-slate-600 ${className}`}>
    {children}
  </div>
);

export default Card;
