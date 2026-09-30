import React from "react";

/**
 * ASR Bank - Section Heading Component
 * Standardizes page headers and section titles across all views.
 */
const SectionHeading = ({
  title,
  subtitle,
  badge,
  action,
  level = "h1",
  className = "",
}) => {
  const HeadingTag = level;

  const headingSizes = {
    h1: "text-xl sm:text-2xl font-bold tracking-tight text-slate-900",
    h2: "text-lg sm:text-xl font-bold text-slate-900",
    h3: "text-base font-semibold text-slate-900",
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <HeadingTag className={headingSizes[level] || headingSizes.h1}>
            {title}
          </HeadingTag>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
    </div>
  );
};

export default SectionHeading;
