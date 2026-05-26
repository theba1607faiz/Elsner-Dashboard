import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

function fmtMonth(m) {
  if (!m) return "";
  const [y, mo] = m.split("-");
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function fmtVal(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export default function RevenueChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-300 text-sm">Loading…</div>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        No revenue data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="month"
          tickFormatter={fmtMonth}
          tick={{ fontSize: 11, fill: "#64748b" }}
        />
        <YAxis tickFormatter={fmtVal} tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip
          formatter={v => fmtVal(Number(v))}
          labelFormatter={fmtMonth}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Area
          type="monotone"
          dataKey="revenueUsd"
          name="Revenue (USD)"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#revenueGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
