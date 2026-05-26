import React, { useState, useCallback } from "react";
import DataTable  from "../components/DataTable";
import { useApi } from "../hooks/useApi";
import { useSSE } from "../hooks/useSSE";

const LIFECYCLES = ["", "Lead", "Customer", "Inactive Customer", "Opportunity"];

const LC_COLOR = {
  "Customer":          "bg-emerald-100 text-emerald-700",
  "Lead":              "bg-blue-100 text-blue-700",
  "Inactive Customer": "bg-slate-100 text-slate-500",
  "Opportunity":       "bg-violet-100 text-violet-700",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

const COLS = [
  { key: "companyName",    label: "Company",   render: v => <span className="font-medium">{v ?? "—"}</span> },
  { key: "lifecycleStage", label: "Lifecycle", render: v => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LC_COLOR[v] ?? "bg-slate-100 text-slate-600"}`}>{v || "—"}</span>
  )},
  { key: "industry",    label: "Industry" },
  { key: "country",     label: "Country" },
  { key: "leadStatus",  label: "Lead Status" },
  { key: "createdAt",   label: "Created",   render: v => fmtDate(v) },
];

const PAGE = 20;

export default function Companies() {
  const [lifecycle, setLifecycle] = useState("");
  const [search,    setSearch]    = useState("");
  const [offset,    setOffset]    = useState(0);
  const [rev,       setRev]       = useState(0);

  useSSE(useCallback(() => setRev(r => r + 1), []));

  const url =
    `/api/companies?limit=${PAGE}&offset=${offset}` +
    (lifecycle ? `&lifecycle=${encodeURIComponent(lifecycle)}` : "") +
    (search    ? `&search=${encodeURIComponent(search)}`       : "");

  const { data, loading } = useApi(url, [rev]);
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / PAGE);
  const page  = Math.floor(offset / PAGE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <select
          value={lifecycle}
          onChange={e => { setLifecycle(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Lifecycle Stages</option>
          {LIFECYCLES.filter(Boolean).map(l => <option key={l}>{l}</option>)}
        </select>
        <input
          placeholder="Search companies…"
          value={search}
          onChange={e => { setSearch(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <span className="ml-auto text-xs text-slate-400">{total.toLocaleString()} companies</span>
      </div>

      <DataTable columns={COLS} rows={data?.rows} loading={loading} emptyMsg="No companies found" />

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
