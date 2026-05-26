import React from "react";

export default function DataTable({ columns, rows, loading, emptyMsg = "No data" }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map(c => (
                <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-slate-50">
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white py-12 text-center text-slate-400 text-sm">
        {emptyMsg}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            {columns.map(c => (
              <th
                key={c.key}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row._id ?? i}
              className="border-t border-slate-50 hover:bg-slate-50 transition-colors"
            >
              {columns.map(c => (
                <td key={c.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
