import React from "react";

const COLORS = {
  blue:   "from-blue-500 to-blue-600",
  green:  "from-emerald-500 to-emerald-600",
  purple: "from-violet-500 to-violet-600",
  cyan:   "from-cyan-500 to-cyan-600",
  orange: "from-orange-400 to-orange-500",
  yellow: "from-amber-400 to-amber-500",
  red:    "from-red-500 to-red-600",
};

export default function KPICard({ title, value, subtitle, color = "blue", icon, loading }) {
  const gradient = COLORS[color] ?? COLORS.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} text-white text-base shadow`}
        >
          {icon}
        </span>
      </div>

      {loading ? (
        <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-bold text-slate-800 leading-none">
          {value ?? "—"}
        </p>
      )}

      {subtitle && (
        <p className="text-xs text-slate-400 leading-snug">{subtitle}</p>
      )}
    </div>
  );
}
