import React from "react";
import { Patient } from "../lib/api";

interface StatusBadgeProps {
  status: Patient["status"];
}

const statusConfig = {
  waiting: {
    label: "Waiting",
    className: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    dot: "bg-amber-400",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    dot: "bg-emerald-400 animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    dot: "bg-slate-500",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
