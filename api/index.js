"use strict";
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const { broadcast } = require("./sse");
const { safeQuery }  = require("./db");

const app  = express();
const PORT = process.env.API_PORT || 3002;

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/stats",      require("./routes/stats"));
app.use("/api/pipeline",   require("./routes/pipeline"));
app.use("/api/revenue",    require("./routes/revenue"));
app.use("/api/deals",      require("./routes/deals"));
app.use("/api/companies",  require("./routes/companies"));
app.use("/api/contacts",   require("./routes/contacts"));
app.use("/api/tasks",      require("./routes/tasks"));
app.use("/api/invoices",   require("./routes/invoices"));
app.use("/api/outreaches", require("./routes/outreaches"));
app.use("/api/activity",   require("./routes/activity"));
app.use("/api/kpis",       require("./routes/kpis"));
app.use("/api/stream",     require("./routes/stream"));

// Serve built React dashboard in production
const dashboardDist = path.join(__dirname, "..", "dashboard", "dist");
app.use(express.static(dashboardDist));
app.get("*", (req, res) => {
  const index = path.join(dashboardDist, "index.html");
  res.sendFile(index, err => {
    if (err) res.status(200).json({ status: "CRM API running", port: PORT });
  });
});

// ── SSE broadcast loop ────────────────────────────────────────────────────────
// Every 30 seconds, push fresh stats to all connected SSE clients.
// The React dashboard refetches all data on each refresh event.
let lastStatsHash = "";

async function broadcastRefresh() {
  try {
    const result = await safeQuery(
      `SELECT COUNT(*) AS deals FROM deals WHERE deleted = false OR deleted IS NULL`
    );
    const hash = JSON.stringify(result.rows[0]);
    if (hash !== lastStatsHash) {
      lastStatsHash = hash;
      broadcast({ type: "refresh", ts: Date.now() });
    }
  } catch (_) {
    // Tables not ready yet — broadcast anyway so UI stays alive
    broadcast({ type: "heartbeat", ts: Date.now() });
  }
}

setInterval(broadcastRefresh, 30_000);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[api] CRM API running on http://localhost:${PORT}`);
  console.log(`[api] Endpoints: /api/stats /api/pipeline /api/revenue /api/deals ...`);
});

process.on("uncaughtException",  e => console.error("[api] uncaught:", e.message));
process.on("unhandledRejection", e => console.error("[api] rejection:", String(e)));
