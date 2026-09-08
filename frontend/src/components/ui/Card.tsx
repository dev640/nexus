import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "nebula" | "ember" | "moss" | "none";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  hover = false,
  glow = "none",
  padding = "md",
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  const glowClasses = {
    nebula: "hover:shadow-[0_0_20px_rgba(76,110,245,0.3)]",
    ember: "hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    moss: "hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    none: "",
  };

  return (
    <div
      className={`rounded-xl border border-slate-700/40 bg-cosmic-900/60 backdrop-blur-sm transition-all duration-300 ${paddingClasses[padding]} ${hover ? "glass-hover hover:scale-[1.01]" : "hover:border-slate-600/60"} ${glowClasses[glow]} ${className}`}
    >
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
        <input
          className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 rounded-lg text-sm bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nebula-500/40 focus:border-nebula-500/50 transition-all duration-200 ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-ember-400">{error}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 rounded-lg text-sm bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-nebula-500/40 focus:border-nebula-500/50 transition-all duration-200 appearance-none ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          paddingRight: "28px",
        }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface BadgeProps {
  variant?: "nebula" | "ember" | "moss" | "slate" | "cyan";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "slate", children, className = "" }: BadgeProps) {
  const variants: Record<string, string> = {
    nebula: "bg-nebula-500/15 text-nebula-300 border border-nebula-500/25",
    ember: "bg-ember-500/15 text-ember-300 border border-ember-500/25",
    moss: "bg-moss-500/15 text-moss-300 border border-moss-500/25",
    slate: "bg-slate-700/50 text-slate-300 border border-slate-600/40",
    cyan: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  color?: "nebula" | "ember" | "moss" | "slate";
  className?: string;
}

export function Tag({ children, onRemove, color = "slate", className = "" }: TagProps) {
  const colors: Record<string, { border: string; text: string; bg: string }> = {
    nebula: { border: "border-nebula-500/25", text: "text-nebula-300", bg: "bg-nebula-500/10" },
    ember: { border: "border-ember-500/25", text: "text-ember-300", bg: "bg-ember-500/10" },
    moss: { border: "border-moss-500/25", text: "text-moss-300", bg: "bg-moss-500/10" },
    slate: { border: "border-slate-600/40", text: "text-slate-300", bg: "bg-slate-700/40" },
  };

  const c = colors[color];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.border} ${c.text} ${c.bg} ${className}`}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Remove tag"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1={18} y1={6} x2={6} y2={18} />
            <line x1={6} y1={6} x2={18} y2={18} />
          </svg>
        </button>
      )}
    </span>
  );
}
