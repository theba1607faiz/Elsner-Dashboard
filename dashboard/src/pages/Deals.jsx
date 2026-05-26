import React, { useState, useCallback } from "react";
import DataTable  from "../components/DataTable";
import { useApi } from "../hooks/useApi";
import { useSSE } from "../hooks/useSSE";

const STAGES = [
  "", "Closed Won", "Closed Lost",
  "Analysis - To be Quoted", "Proposal Sent", "New",
];

const STAGE_COLOR = {
  "Closed Won":  "bg-emerald-100 text-emerald-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

function fmtUsd(v) {
  const n = Number(v);
  if (!n) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

const COLS = [
  { key: "name",               label: "Deal Name",  render: v => <span className="font-medium">{v ?? "—"}</span> },
  { key: "stage",              label: "Stage",       render: v => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLOR[v] ?? "bg-slate-100 text-slate-600"}`}>{v ?? "—"}</span>
  )},
  { key: "grand_total_in_usd", label: "Value (USD)", render: v => fmtUsd(v) },
  { key: "currency",           label: "Currency" },
  { key: "closeDate",          label: "Close Date",  render: v => fmtDate(v) },
  { key: "createdAt",          label: "Created",     render: v => fmtDate(v) },
];

const PAGE = 20;

export default function Deals() {
  const [stage,  setStage]  = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [rev,    setRev]    = useState(0);

  useSSE(useCallback(() => setRev(r => r + 1), []));

  const url =
    `/api/deals?limit=${PAGE}&offset=${offset}` +
    (stage  ? `&stage=${encodeURIComponent(stage)}`   : "") +
    (search ? `&search=${encodeURIComponent(search)}` : "");

  const { data, loading } = useApi(url, [rev]);

  const total = data?.total ?? 0;
  const pages = Math.ceil(total / PAGE);
  const page  = Math.floor(offset / PAGE);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <select
          value={stage}
          onChange={e => { setStage(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Stages</option>
          {STAGES.filter(Boolean).map(s => <option key={s}>{s}</option>)}
        </select>
        <input
          placeholder="Search deals…"
          value={search}
          onChange={e => { setSearch(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <span className="ml-auto text-xs text-slate-400">{total.toLocaleString()} deals</span>
      </div>

      <DataTable columns={COLS} rows={data?.rows} loading={loading} emptyMsg="No deals found" />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => setOffset(o => Math.max(0, o - PAGE))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            ← Prev
          </button>
          <span className="text-xs text-slate-500">Page {page + 1} of {pages}</span>
          <button
            onClick={() => setOffset(o => o + PAGE)}
            disabled={page >= pages - 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
