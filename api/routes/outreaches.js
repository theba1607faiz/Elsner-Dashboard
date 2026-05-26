"use strict";
const { Router } = require("express");
const { safeQuery } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit)  || 20, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const status = req.query.status || "";
    const search = req.query.search || "";

    const conditions = [
      `("isDeleted" = false OR "isDeleted" IS NULL)`,
      status ? `status = $3` : null,
      search ? `name ILIKE $${status ? 4 : 3}` : null,
    ].filter(Boolean);

    const where = conditions.join(" AND ");
    const params = [limit, offset];
    if (status) params.push(status);
    if (search) params.push(`%${search}%`);

    const [rows, total] = await Promise.all([
      safeQuery(
        `SELECT _id, name, email, country, status, "leadStatus",
                priority, "assignedTo", "createdAt", "lastAddedNote"
         FROM outreaches WHERE ${where}
         ORDER BY "createdAt" DESC NULLS LAST
         LIMIT $1 OFFSET $2`,
        params
      ),
      safeQuery(
        `SELECT COUNT(*) AS total FROM outreaches WHERE ${where}`,
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
    console.error("[outreaches]", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
