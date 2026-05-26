"use strict";
const { Router } = require("express");
const { safeQuery } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await safeQuery(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', NULLIF("invoice_date", '')::timestamptz), 'YYYY-MM') AS month,
        COALESCE(SUM("grand_total"), 0)          AS revenue,
        COALESCE(SUM("grandtotal_in_usd"), 0)    AS revenue_usd,
        COUNT(*) AS invoice_count
      FROM invoices
      WHERE
        "invoice_date" IS NOT NULL
        AND "invoice_date" != ''
        AND (deleted = false OR deleted IS NULL)
      GROUP BY DATE_TRUNC('month', NULLIF("invoice_date", '')::timestamptz)
      ORDER BY DATE_TRUNC('month', NULLIF("invoice_date", '')::timestamptz) ASC
      LIMIT 12
    `);

    const rows = result.rows.map(r => ({
      month: r.month,
      revenue: Number(r.revenue),
      revenueUsd: Number(r.revenue_usd),
      invoiceCount: Number(r.invoice_count),
    }));

    res.json(rows);
  } catch (e) {
    console.error("[revenue]", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
