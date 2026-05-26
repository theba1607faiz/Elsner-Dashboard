"use strict";
const { Router } = require("express");
const { safeQuery } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const result = await safeQuery(
      `SELECT _id, action, module, "recordId", "userId", details, "createdAt"
       FROM activitylogs
       ORDER BY "createdAt" DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (e) {
    console.error("[activity]", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
