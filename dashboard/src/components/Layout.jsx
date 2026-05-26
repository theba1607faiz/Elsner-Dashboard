import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";


const NAV = [
  { to: "/",           label: "Overview",   icon: "▦" },
  { to: "/deals",      label: "Deals",      icon: "◈" },
  { to: "/companies",  label: "Companies",  icon: "⬡" },
  { to: "/contacts",   label: "Contacts",   icon: "◎" },
  { to: "/tasks",      label: "Tasks",      icon: "✔" },
  { to: "/invoices",   label: "Invoices",   icon: "◻" },
  { to: "/outreaches", label: "Outreach",   icon: "◯" },
];

export default function Layout({ children, syncStatus }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pageLabel = NAV.find(n => n.to === location.pathname)?.label ?? "CRM Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-slate-900 text-slate-100 transition-all duration-200 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <span className="text-2xl">📊</span>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold leading-tight">Elsner CRM</p>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto text-slate-400 hover:text-white text-xs"
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="text-base shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sync status badge */}
        <div className="px-4 py-3 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                syncStatus === "live" ? "bg-green-400 animate-pulse" : "bg-yellow-400"
              }`}
            />
            {!collapsed && (
              <span className="text-xs text-slate-400">
                {syncStatus === "live" ? "Live sync" : "Connecting…"}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {pageLabel}
          </h1>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
