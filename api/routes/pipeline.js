"use strict";
const { Router } = require("express");
const { safeQuery } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await safeQuery(`
      SELECT
        stage,
        COUNT(*) AS count,
        COALESCE(SUM("grand_total_in_usd"), 0) AS value
      FROM deals
      WHERE deleted = false OR deleted IS NULL
      GROUP BY stage
      ORDER BY count DESC
    `);

    const rows = result.rows.map(r => ({
      stage: r.stage || "Unknown",
      count: Number(r.count),
      value: Number(r.value),
    }));

    res.json(rows);
  } catch (e) {
    console.error("[pipeline]", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
