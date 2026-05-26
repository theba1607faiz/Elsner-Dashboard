"use strict";
const { Router } = require("express");
const { safeQuery } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit    = Math.min(Number(req.query.limit)  || 20, 100);
    const offset   = Math.max(Number(req.query.offset) || 0, 0);
    const status   = req.query.status   || "";
    const priority = req.query.priority || "";

    const conditions = [
      `(deleted = false OR deleted IS NULL)`,
      status   ? `status = $3`    : null,
      priority ? `priority = $${status ? 4 : 3}` : null,
    ].filter(Boolean);

    const where = conditions.join(" AND ");
    const params = [limit, offset];
    if (status)   params.push(status);
    if (priority) params.push(priority);

    const [rows, total] = await Promise.all([
      safeQuery(
        `SELECT _id, "Task", category, status, priority,
                "due_date", "associated_module", "associated_item",
                "createdBy", "createdAt"
         FROM createtasks WHERE ${where}
         ORDER BY
           CASE WHEN status = 'Pending' THEN 0 ELSE 1 END,
           "due_date" ASC NULLS LAST,
           "createdAt" DESC NULLS LAST
         LIMIT $1 OFFSET $2`,
        params
      ),
      safeQuery(
        `SELECT COUNT(*) AS total FROM createtasks WHERE ${where}`,
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
    console.error("[tasks]", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
