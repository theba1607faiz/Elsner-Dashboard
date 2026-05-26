import React, { useCallback, useState } from "react";
import KPICard       from "../components/KPICard";
import PipelineChart from "../components/PipelineChart";
import RevenueChart  from "../components/RevenueChart";
import LiveFeed      from "../components/LiveFeed";
import DataTable     from "../components/DataTable";
import { useApi }    from "../hooks/useApi";
import { useSSE }    from "../hooks/useSSE";

function fmt(n)    { return n?.toLocaleString("en-IN") ?? "0"; }
function fmtUsd(n) {
  if (!n) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

const DEAL_STAGE_COLOR = {
  "Closed Won":  "bg-emerald-100 text-emerald-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

const DEAL_COLS = [
  { key: "name",              label: "Deal",    render: v => <span className="font-medium truncate max-w-xs block">{v ?? "—"}</span> },
  { key: "stage",             label: "Stage",   render: v => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEAL_STAGE_COLOR[v] ?? "bg-slate-100 text-slate-600"}`}>{v ?? "—"}</span>
  )},
  { key: "grand_total_in_usd", label: "Value",  render: v => fmtUsd(Number(v)) },
  { key: "createdAt",          label: "Created", render: v => fmtDate(v) },
];

export default function Overview() {
  const [rev, setRev] = useState(0);

  const { data: stats,    loading: sl } = useApi("/api/stats",    [rev]);
  const { data: pipeline, loading: pl } = useApi("/api/pipeline", [rev]);
  const { data: revenue,  loading: rl } = useApi("/api/revenue",  [rev]);
  const { data: activity, loading: al } = useApi("/api/activity?limit=15", [rev]);
  const { data: dealsRes, loading: dl } = useApi("/api/deals?limit=8", [rev]);
  const { data: kpis,     loading: kl } = useApi("/api/kpis",     [rev]);

  useSSE(useCallback(() => setRev(r => r + 1), []));

  const d  = stats?.deals     ?? {};
  const co = stats?.companies ?? {};
  const ct = stats?.contacts  ?? {};
  const t  = stats?.tasks     ?? {};
  const iv = stats?.invoices  ?? {};

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Deals"
          value={fmt(d.total)}
          subtitle={`${fmt(d.open)} open · ${fmt(d.won)} won`}
          color="blue"
          icon="◈"
          loading={sl}
        />
        <KPICard
          title="Won Revenue"
          value={fmtUsd(d.wonRevenue)}
          subtitle={`Pipeline: ${fmtUsd(d.pipelineValue)}`}
          color="green"
          icon="$"
          loading={sl}
        />
        <KPICard
          title="Companies"
          value={fmt(co.total)}
          subtitle={`${fmt(co.customers)} customers · ${fmt(co.leads)} leads`}
          color="purple"
          icon="⬡"
          loading={sl}
        />
        <KPICard
          title="Contacts"
          value={fmt(ct.total)}
          color="cyan"
          icon="◎"
          loading={sl}
        />
        <KPICard
          title="Tasks"
          value={fmt(t.pending)}
          subtitle={`${fmt(t.overdue)} overdue · ${fmt(t.completed)} done`}
          color="orange"
          icon="✔"
          loading={sl}
        />
        <KPICard
          title="Invoices"
          value={fmt(iv.total)}
          subtitle={`${fmt(iv.paid)} paid · ${fmtUsd(iv.paidRevenue)}`}
          color="yellow"
          icon="◻"
          loading={sl}
        />
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Win Rate (30d)"
          value={kpis ? (kpis.winRate30d !== undefined ? `${kpis.winRate30d.toFixed(1)}%` : "—") : "—"}
          color="green"
          icon="✓"
          loading={kl}
        />
        <KPICard
          title="New Deals (30d)"
          value={kpis ? kpis.newDeals30d : "—"}
          color="blue"
          icon="✶"
          loading={kl}
        />
        <KPICard
          title="Avg Deal Size"
          value={kpis ? fmtUsd(kpis.avgDealSize) : "—"}
          color="purple"
          icon="$"
          loading={kl}
        />
        <KPICard
          title="Overdue Invoices"
          value={kpis ? kpis.overdueInvoices : "—"}
          color="red"
          icon="⚠"
          loading={kl}
        />
        <KPICard
          title="Active Customers (30d)"
          value={kpis ? kpis.activeCustomers30d : "—"}
          color="cyan"
          icon="◍"
          loading={kl}
        />
        <KPICard
          title="Outreach Response"
          value={kpis ? (kpis.outreachResponseRate !== undefined ? `${kpis.outreachResponseRate.toFixed(1)}%` : "—") : "—"}
          color="orange"
          icon="↺"
          loading={kl}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Deal Pipeline by Stage</h2>
          <div className="h-64">
            <PipelineChart data={pipeline} loading={pl} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Revenue (USD)</h2>
          <div className="h-64">
            <RevenueChart data={revenue} loading={rl} />
          </div>
        </div>
      </div>

      {/* Table + Feed row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent Deals</h2>
          <DataTable
            columns={DEAL_COLS}
            rows={dealsRes?.rows}
            loading={dl}
            emptyMsg="No deals synced yet"
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Live Activity
            <span className="ml-2 inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </h2>
          <LiveFeed data={activity} loading={al} />
        </div>
      </div>
    </div>
  );
}
