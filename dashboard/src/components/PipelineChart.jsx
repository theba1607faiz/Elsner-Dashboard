import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const STAGE_COLORS = {
  "Closed Won":  "#22c55e",
  "Closed Lost": "#ef4444",
};
const DEFAULT_COLORS = ["#6366f1","#8b5cf6","#06b6d4","#f59e0b","#ec4899","#14b8a6","#f97316"];

function shortStage(s) {
  if (!s) return "Unknown";
  if (s.length <= 15) return s;
  return s.split(/[-–\s]/)[0].slice(0, 14);
}

function fmt(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export default function PipelineChart({ data, loading }) {
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
        No deal data yet
      </div>
    );
  }

  let colorIdx = 0;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="stage"
          tickFormatter={shortStage}
          tick={{ fontSize: 10, fill: "#64748b" }}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip
          formatter={(v, name) => name === "value" ? fmt(v) : v}
          labelFormatter={l => l}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="count" name="Deals" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={entry.stage}
              fill={
                STAGE_COLORS[entry.stage] ??
                DEFAULT_COLORS[(colorIdx++) % DEFAULT_COLORS.length]
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
