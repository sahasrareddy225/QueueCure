import React from "react";

interface TokenBadgeProps {
  token: number;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "current" | "yours";
}

const sizeClasses = {
  sm: "w-10 h-10 text-base",
  md: "w-16 h-16 text-2xl",
  lg: "w-24 h-24 text-4xl",
  xl: "w-32 h-32 text-5xl",
};

const variantClasses = {
  primary: "bg-brand-600/20 border-brand-500/40 text-brand-300",
  current: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.3)]",
  yours: "bg-brand-700/30 border-brand-400/50 text-brand-200 shadow-[0_0_30px_rgba(99,102,241,0.3)]",
};

export const TokenBadge: React.FC<TokenBadgeProps> = ({
  token,
  label,
  size = "md",
  variant = "primary",
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      )}
      <div
        className={`
          flex items-center justify-center rounded-2xl border-2 font-bold font-mono
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          transition-all duration-300
        `}
      >
        {token.toString().padStart(2, "0")}
      </div>
    </div>
  );
};
