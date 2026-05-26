import React, { useState, useCallback } from "react";
import DataTable  from "../components/DataTable";
import { useApi } from "../hooks/useApi";
import { useSSE } from "../hooks/useSSE";

const STATUS_COLOR = {
  "Not Contacted": "bg-slate-100 text-slate-500",
  "Contacted":     "bg-blue-100 text-blue-700",
  "Interested":    "bg-violet-100 text-violet-700",
  "Converted":     "bg-emerald-100 text-emerald-700",
  "Not Interested":"bg-red-100 text-red-700",
};
const PRIORITY_COLOR = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-slate-100 text-slate-600",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

const COLS = [
  { key: "name",       label: "Name",     render: v => <span className="font-medium">{v ?? "—"}</span> },
  { key: "email",      label: "Email",    render: v => <span className="text-indigo-600 text-xs">{v ?? "—"}</span> },
  { key: "country",    label: "Country" },
  { key: "status",     label: "Status",   render: v => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[v] ?? "bg-slate-100 text-slate-600"}`}>{v ?? "—"}</span>
  )},
  { key: "priority",   label: "Priority", render: v => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[v] ?? "bg-slate-100 text-slate-600"}`}>{v ?? "—"}</span>
  )},
  { key: "createdAt",  label: "Added",    render: v => fmtDate(v) },
];

const PAGE = 20;

export default function Outreaches() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [rev,    setRev]    = useState(0);

  useSSE(useCallback(() => setRev(r => r + 1), []));

  const url =
    `/api/outreaches?limit=${PAGE}&offset=${offset}` +
    (status ? `&status=${encodeURIComponent(status)}` : "") +
    (search ? `&search=${encodeURIComponent(search)}` : "");

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
          <option>Not Contacted</option>
          <option>Contacted</option>
          <option>Interested</option>
          <option>Converted</option>
          <option>Not Interested</option>
        </select>
        <input
          placeholder="Search outreaches…"
          value={search}
          onChange={e => { setSearch(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <span className="ml-auto text-xs text-slate-400">{total.toLocaleString()} outreaches</span>
      </div>

      <DataTable columns={COLS} rows={data?.rows} loading={loading} emptyMsg="No outreaches found" />

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
