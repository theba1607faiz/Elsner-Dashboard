"use strict";
const { Router } = require("express");
const { safeQuery } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit)  || 20, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const stage  = req.query.stage || "";
    const search = req.query.search || "";

    const where = [
      "(deleted = false OR deleted IS NULL)",
      stage  ? `stage = $3`           : null,
      search ? `name ILIKE $${stage ? 4 : 3}` : null,
    ].filter(Boolean).join(" AND ");

    const params = [limit, offset];
    if (stage)  params.push(stage);
    if (search) params.push(`%${search}%`);

    const [rows, total] = await Promise.all([
      safeQuery(
        `SELECT _id, name, stage, "grand_total_in_usd", "grand_total", currency,
                "closeDate", "createdAt", owner, company, contact
         FROM deals WHERE ${where}
         ORDER BY "createdAt" DESC NULLS LAST
         LIMIT $1 OFFSET $2`,
        params
      ),
      safeQuery(
        `SELECT COUNT(*) AS total FROM deals WHERE ${where}`,
        params.slice(2)
      ),
    ]);

    res.json({
      rows: rows.rows,
      total: Number(total.rows[0]?.total || 0),
      limit,
      offset,
    });
  } catch (e) {
    console.error("[deals]", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
