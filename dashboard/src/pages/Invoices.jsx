import React, { useState, useCallback } from "react";
import DataTable  from "../components/DataTable";
import { useApi } from "../hooks/useApi";
import { useSSE } from "../hooks/useSSE";

const STATUS_COLOR = {
  Paid:     "bg-emerald-100 text-emerald-700",
  Unpaid:   "bg-red-100 text-red-700",
  Pending:  "bg-amber-100 text-amber-700",
  Approved: "bg-blue-100 text-blue-700",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}
function fmtCcy(v, row) {
  const n = Number(v);
  if (!n) return "—";
  if (n >= 1_000_000) return `${row?.currency ?? "$"}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${row?.currency ?? "$"}${(n / 1_000).toFixed(1)}K`;
  return `${row?.currency ?? "$"}${n.toFixed(2)}`;
}

const COLS = [
  { key: "invoice_number", label: "Invoice #", render: v => <span className="font-mono font-medium">{v ?? "—"}</span> },
  { key: "companyName",    label: "Company" },
  { key: "grand_total",    label: "Amount",      render: (v, row) => fmtCcy(v, row) },
  { key: "grandtotal_in_usd", label: "USD",      render: v => v ? `$${Number(v).toLocaleString()}` : "—" },
  { key: "payment_status", label: "Status",      render: v => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[v] ?? "bg-slate-100 text-slate-600"}`}>{v ?? "—"}</span>
  )},
  { key: "invoice_date",   label: "Invoice Date", render: v => fmtDate(v) },
  { key: "due_date",       label: "Due Date",     render: v => fmtDate(v) },
];

const PAGE = 20;

export default function Invoices() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [rev,    setRev]    = useState(0);

  useSSE(useCallback(() => setRev(r => r + 1), []));

  const url =
    `/api/invoices?limit=${PAGE}&offset=${offset}` +
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
          <option>Paid</option>
          <option>Unpaid</option>
          <option>Pending</option>
        </select>
        <input
          placeholder="Search company…"
          value={search}
          onChange={e => { setSearch(e.target.value); setOffset(0); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <span className="ml-auto text-xs text-slate-400">{total.toLocaleString()} invoices</span>
      </div>

      <DataTable columns={COLS} rows={data?.rows} loading={loading} emptyMsg="No invoices found" />

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
