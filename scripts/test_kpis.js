const { safeQuery } = require('../api/db');

(async () => {
  const q = `SELECT TO_CHAR(m, 'YYYY-MM') AS month, COALESCE(SUM(i."grand_total"),0) AS total
    FROM GENERATE_SERIES(DATE_TRUNC('month', NOW()) - INTERVAL '11 months', DATE_TRUNC('month', NOW()), INTERVAL '1 month') m
    LEFT JOIN invoices i ON DATE_TRUNC('month', COALESCE(i."date_paid", i."createdAt")) = m AND i."payment_status" = 'Paid'
    GROUP BY m
    ORDER BY m`;
  try {
    const r = await safeQuery(q);
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.error(e.message);
  }
})();
