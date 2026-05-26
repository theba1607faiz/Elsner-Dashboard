"use strict";
const { Router } = require("express");
const { addClient, removeClient } = require("../sse");

const router = Router();

router.get("/", (req, res) => {
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: "connected", ts: Date.now() })}\n\n`);

  addClient(res);

  req.on("close", () => {
    removeClient(res);
  });
});

module.exports = router;
