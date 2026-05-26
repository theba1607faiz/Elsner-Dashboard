import React from "react";

const ACTION_COLORS = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
};

function timeAgo(ts) {
  if (!ts) return "";
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LiveFeed({ data, loading }) {
  if (loading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex gap-3 items-start animate-pulse">
            <div className="w-14 h-5 bg-slate-100 rounded" />
            <div className="flex-1 h-5 bg-slate-100 rounded" />
          </li>
        ))}
      </ul>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm py-8">
        No activity yet
      </div>
    );
  }

  return (
    <ul className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
      {data.map(item => (
        <li key={item._id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
          <span
            className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
              ACTION_COLORS[item.action] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {item.action}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 truncate">
              <span className="font-medium">{item.module}</span>
            </p>
            <p className="text-xs text-slate-400">{timeAgo(item.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
