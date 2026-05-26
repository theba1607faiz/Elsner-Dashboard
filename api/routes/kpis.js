"use strict";
const { Router } = require("express");
const { safeQuery } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [revenueMTD, pipelineValue, newDeals30d, winRate30d, avgDealSize, overdueInvoices, activeCustomers30d, outreachRates, openTasks, monthlyRevenue] = await Promise.all([
      // Revenue MTD
      safeQuery(`SELECT COALESCE(SUM("grand_total"),0) AS revenue_mtd FROM invoices WHERE "payment_status" = 'Paid' AND DATE_TRUNC('month', COALESCE("date_paid", now())) = DATE_TRUNC('month', NOW())`),
      // Pipeline value (open deals)
      safeQuery(`SELECT COALESCE(SUM("grand_total_in_usd"),0) AS pipeline_value FROM deals WHERE (deleted = false OR deleted IS NULL) AND stage NOT IN ('Closed Won','Closed Lost')`),
      // New deals in last 30 days
      safeQuery(`SELECT COUNT(*) AS new_deals_30d FROM deals WHERE createdat >= now() - interval '30 days'`),
      // Win rate last 30 days
      safeQuery(`
        SELECT
          COALESCE( (SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END)::float / NULLIF(SUM(CASE WHEN stage IN ('Closed Won','Closed Lost') THEN 1 ELSE 0 END),0)) * 100, 0) AS win_rate_30d
        FROM deals
        WHERE (updatedat >= now() - interval '30 days')
      `),
      // Average deal size (won)
      safeQuery(`SELECT COALESCE(AVG("grand_total_in_usd"),0) AS avg_deal_size FROM deals WHERE stage = 'Closed Won'`),
      // Overdue invoices
      safeQuery(`SELECT COUNT(*) AS overdue_invoices FROM invoices WHERE ("payment_status" IS NULL OR "payment_status" != 'Paid') AND "due_date"::date < CURRENT_DATE`),
      // Active customers in last 30 days (by activity.company_id)
      safeQuery(`SELECT COUNT(DISTINCT "company_id") AS active_customers_30d FROM activity WHERE ts >= now() - interval '30 days'`),
      // Outreach response rate (responses / sent) in last 30 days
      safeQuery(`SELECT COALESCE(SUM("responses")::float / NULLIF(SUM("sent"),0) * 100, 0) AS outreach_response_rate FROM outreaches WHERE created_at >= now() - interval '30 days'`),
      // Open tasks
      safeQuery(`SELECT COUNT(*) AS open_tasks FROM createtasks WHERE (deleted = false OR deleted IS NULL) AND status != 'Completed'`),
      // Monthly paid revenue (last 12 months) - grouped by invoice paid/created month
      safeQuery(`
        SELECT TO_CHAR(DATE_TRUNC('month', COALESCE("date_paid", "createdAt")), 'YYYY-MM') AS month,
               COALESCE(SUM("grand_total"),0) AS total
        FROM invoices
        WHERE "payment_status" = 'Paid'
          AND DATE_TRUNC('month', COALESCE("date_paid", "createdAt")) >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
        GROUP BY 1
        ORDER BY 1
      `),
    ]);

    // Build last 12 months labels and fill totals from DB rows (ensure zeros when missing)
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = d.toISOString().slice(0,7).replace('-', '-'); // YYYY-MM
      months.push(mm);
    }

    const rowMap = new Map((monthlyRevenue.rows || []).map(r => [r.month, Number(r.total || 0)]));
    const monthlyFilled = months.map(m => ({ month: m, total: rowMap.get(m) || 0 }));

    res.json({
      revenueMTD: Number(revenueMTD.rows[0]?.revenue_mtd || 0),
      pipelineValue: Number(pipelineValue.rows[0]?.pipeline_value || 0),
      newDeals30d: Number(newDeals30d.rows[0]?.new_deals_30d || 0),
      winRate30d: Number(winRate30d.rows[0]?.win_rate_30d || 0),
      avgDealSize: Number(avgDealSize.rows[0]?.avg_deal_size || 0),
      overdueInvoices: Number(overdueInvoices.rows[0]?.overdue_invoices || 0),
      activeCustomers30d: Number(activeCustomers30d.rows[0]?.active_customers_30d || 0),
      outreachResponseRate: Number(outreachRates.rows[0]?.outreach_response_rate || 0),
      openTasks: Number(openTasks.rows[0]?.open_tasks || 0),
      monthlyRevenue: monthlyFilled,
    });
  } catch (e) {
    console.error("[kpis]", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
