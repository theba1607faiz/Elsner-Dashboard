import React, { useState, useCallback } from "react";
import DataTable  from "../components/DataTable";
import { useApi } from "../hooks/useApi";
import { useSSE } from "../hooks/useSSE";

const PRIORITY_COLOR = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-slate-100 text-slate-600",
};
const STATUS_COLOR = {
  Pending:   "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  const isOverdue = dt < new Date() && d;
  return (
    <span className={isOverdue ? "text-red-600 font-medium" : ""}>
      {dt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
    </span>
  );
}

const COLS = [
  { key: "Task",              label: "Task",     render: v => <span className="font-medium">{v ?? "—"}</span> },
  { key: "status",            label: "Status",   render: v => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[v] ?? "bg-slate-100 text-slate-600"}`}>{v ?? "—"}</span>
  )},
  { key: "priority",          label: "Priority", render: v => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[v] ?? "bg-slate-100 text-slate-600"}`}>{v ?? "—"}</span>
  )},
  { key: "due_date",          label: "Due",      render: v => fmtDate(v) },
  { key: "associated_module", label: "Module" },
  { key: "associated_item",   label: "Related" },
];

const PAGE = 20;

export default function Tasks() {
  const [status,   setStatus]   = useState("");
  const [priority, setPriority] = useState("");
  const [offset,   setOffset]   = useState(0);
  const [rev,      setRev]      = useState(0);

  useSSE(useCallback(() => setRev(r => r + 1), []));

  const url =
    `/api/tasks?limit=${PAGE}&offset=${offset}` +
    (status   ? `&status=${encodeURIComponent(status)}`     : "") +
    (priority ? `&priority=${encodeURIComponent(priority)}` : "");

  const { data, loading } = useApi(url, [rev]);
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / PAGE);
  const page  = Math.floor(offset / PAGE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <select value={status} onChange={e => { setStatus(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Statuses</option>
          <option>Pending</option>
          <option>Completed</option>
          <option>In Progress</option>
        </select>
        <select value={priority} onChange={e => { setPriority(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <span className="ml-auto text-xs text-slate-400">{total.toLocaleString()} tasks</span>
      </div>

      <DataTable columns={COLS} rows={data?.rows} loading={loading} emptyMsg="No tasks found" />

      {pages > 1 && (
        <div className="flex items-center gap-2 justify-center">
          <button onClick={() => setOffset(o => Math.max(0, o - PAGE))} disabled={page === 0}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
            ← Prev
          </button>
          <span className="text-xs text-slate-500">Page {page + 1} of {pages}</span>
          <button onClick={() => setOffset(o => o + PAGE)} disabled={page >= pages - 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
