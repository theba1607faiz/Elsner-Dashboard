"use strict";
const { Router } = require("express");
const { safeQuery } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [deals, companies, contacts, tasks, invoices, outreaches, users] = await Promise.all([
      safeQuery(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE stage = 'Closed Won') AS won,
          COUNT(*) FILTER (WHERE stage = 'Closed Lost') AS lost,
          COALESCE(SUM("grand_total_in_usd") FILTER (WHERE stage = 'Closed Won'), 0) AS won_revenue,
          COALESCE(SUM("grand_total_in_usd") FILTER (WHERE stage NOT IN ('Closed Won','Closed Lost')), 0) AS pipeline_value
        FROM deals
        WHERE deleted = false OR deleted IS NULL
      `),
      safeQuery(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE "lifecycleStage" = 'Customer') AS customers,
          COUNT(*) FILTER (WHERE "lifecycleStage" = 'Lead') AS leads,
          COUNT(*) FILTER (WHERE "lifecycleStage" = 'Inactive Customer') AS inactive
        FROM companies
        WHERE deleted = false OR deleted IS NULL
      `),
      safeQuery(`
        SELECT COUNT(*) AS total
        FROM contacts
        WHERE deleted = false OR deleted IS NULL
      `),
      safeQuery(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
          COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
          COUNT(*) FILTER (WHERE
            status != 'Completed'
            AND "due_date" IS NOT NULL
            AND "due_date" != ''
            AND "due_date"::timestamptz < NOW()
          ) AS overdue
        FROM createtasks
        WHERE deleted = false OR deleted IS NULL
      `),
      safeQuery(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE "payment_status" = 'Paid') AS paid,
          COUNT(*) FILTER (WHERE "payment_status" NOT IN ('Paid')) AS unpaid,
          COALESCE(SUM("grand_total"), 0) AS total_revenue,
          COALESCE(SUM("grand_total") FILTER (WHERE "payment_status" = 'Paid'), 0) AS paid_revenue
        FROM invoices
        WHERE deleted = false OR deleted IS NULL
      `),
      safeQuery(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'Not Contacted') AS not_contacted,
          COUNT(*) FILTER (WHERE status != 'Not Contacted') AS contacted
        FROM outreaches
        WHERE "isDeleted" = false OR "isDeleted" IS NULL
      `),
      safeQuery(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE "isActive" = true) AS active FROM users`),
    ]);

    const d = deals.rows[0] || {};
    const co = companies.rows[0] || {};
    const ct = contacts.rows[0] || {};
    const t = tasks.rows[0] || {};
    const inv = invoices.rows[0] || {};
    const out = outreaches.rows[0] || {};
    const u = users.rows[0] || {};

    res.json({
      deals: {
        total: Number(d.total || 0),
        won: Number(d.won || 0),
        lost: Number(d.lost || 0),
        open: Number(d.total || 0) - Number(d.won || 0) - Number(d.lost || 0),
        wonRevenue: Number(d.won_revenue || 0),
        pipelineValue: Number(d.pipeline_value || 0),
      },
      companies: {
        total: Number(co.total || 0),
        customers: Number(co.customers || 0),
        leads: Number(co.leads || 0),
        inactive: Number(co.inactive || 0),
      },
      contacts: { total: Number(ct.total || 0) },
      tasks: {
        total: Number(t.total || 0),
        pending: Number(t.pending || 0),
        completed: Number(t.completed || 0),
        overdue: Number(t.overdue || 0),
      },
      invoices: {
        total: Number(inv.total || 0),
        paid: Number(inv.paid || 0),
        unpaid: Number(inv.unpaid || 0),
        totalRevenue: Number(inv.total_revenue || 0),
        paidRevenue: Number(inv.paid_revenue || 0),
      },
      outreaches: {
        total: Number(out.total || 0),
        contacted: Number(out.contacted || 0),
        notContacted: Number(out.not_contacted || 0),
      },
      users: {
        total: Number(u.total || 0),
        active: Number(u.active || 0),
      },
    });
  } catch (e) {
    console.error("[stats]", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
