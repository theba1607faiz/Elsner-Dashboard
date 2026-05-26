"use strict";
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load env from automation/.env (sibling folder)
const envPath = path.join(__dirname, "..", "automation", ".env");
fs.readFileSync(envPath, "utf8")
  .split("\n")
  .filter(l => l.trim() && !l.startsWith("#"))
  .forEach(l => {
    const idx = l.indexOf("=");
    if (idx > 0) {
      const key = l.slice(0, idx).trim();
      const val = l.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });

const pool = new Pool({
  host:     process.env.POSTGRES_HOST || "localhost",
  port:     Number(process.env.POSTGRES_PORT) || 5432,
  user:     process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || "mongos_sync",
  max: 10,
});

pool.on("error", (err) => {
  console.error("[db] pool error:", err.message);
});

// Wraps a query — returns fallback if the table doesn't exist (42P01)
async function safeQuery(sql, params = [], fallback = { rows: [], rowCount: 0 }) {
  try {
    return await pool.query(sql, params);
  } catch (e) {
    if (e.code === "42P01" || e.code === "42703") return fallback;
    throw e;
  }
}

module.exports = { pool, safeQuery };
