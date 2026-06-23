import React from "react";
import { Patient } from "../lib/api";
import { StatusBadge } from "./StatusBadge";

interface QueueTableProps {
  patients: Patient[];
  showAll?: boolean;
}

export const QueueTable: React.FC<QueueTableProps> = ({ patients, showAll = false }) => {
  const displayed = showAll
    ? patients
    : patients.filter((p) => p.status !== "completed");

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium">No patients in queue</p>
        <p className="text-xs text-slate-600 mt-1">Add a patient to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            <th className="text-left text-xs font-semibold uppercase tracking-widest text-slate-400 px-4 py-3 w-20">
              Token
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-widest text-slate-400 px-4 py-3">
              Patient
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-widest text-slate-400 px-4 py-3 w-36">
              Status
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-widest text-slate-400 px-4 py-3 w-36 hidden sm:table-cell">
              Registered
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {displayed.map((patient, idx) => (
            <tr
              key={patient._id}
              className={`
                transition-colors duration-200
                ${patient.status === "in-progress"
                  ? "bg-emerald-500/10"
                  : idx % 2 === 0
                  ? "bg-transparent"
                  : "bg-white/[0.02]"
                }
                hover:bg-white/5
              `}
            >
              <td className="px-4 py-3">
                <span className="font-mono font-bold text-brand-300 text-sm">
                  #{String(patient.tokenNumber).padStart(2, "0")}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-slate-200">{patient.name}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={patient.status} />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-xs text-slate-500">
                  {new Date(patient.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
