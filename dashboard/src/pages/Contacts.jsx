import React, { useState, useCallback } from "react";
import DataTable  from "../components/DataTable";
import { useApi } from "../hooks/useApi";
import { useSSE } from "../hooks/useSSE";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

const COLS = [
  { key: "firstName",      label: "First Name", render: v => <span className="font-medium">{v ?? "—"}</span> },
  { key: "lastName",       label: "Last Name" },
  { key: "email",          label: "Email",      render: v => <span className="text-indigo-600">{v ?? "—"}</span> },
  { key: "jobTitle",       label: "Job Title" },
  { key: "lifecycleStage", label: "Lifecycle" },
  { key: "leadStatus",     label: "Lead Status" },
  { key: "createdAt",      label: "Created",    render: v => fmtDate(v) },
];

const PAGE = 20;

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [rev,    setRev]    = useState(0);

  useSSE(useCallback(() => setRev(r => r + 1), []));

  const url = `/api/contacts?limit=${PAGE}&offset=${offset}` +
    (search ? `&search=${encodeURIComponent(search)}` : "");

  const { data, loading } = useApi(url, [rev]);
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / PAGE);
  const page  = Math.floor(offset / PAGE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <span className="ml-auto text-xs text-slate-400">{total.toLocaleString()} contacts</span>
      </div>

      <DataTable columns={COLS} rows={data?.rows} loading={loading} emptyMsg="No contacts found" />

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
