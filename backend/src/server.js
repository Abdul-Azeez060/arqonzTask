const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json());

// Simple health
app.get("/health", (_req, res) => res.json({ ok: true }));

// In a typical Supabase chat, the frontend writes directly to Supabase using RLS policies.
// This backend offers: (1) a signed upload for avatars (future), (2) a webhook endpoint
// that Supabase can call on INSERT to fan-out to Server-Sent Events (SSE) consumers.

// SSE channel to push new messages (for non-Supabase clients/tests)
const clients = new Set();
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  const client = { res };
  clients.add(client);
  req.on("close", () => clients.delete(client));
});

// Supabase function/webhook can POST here with a message payload to bridge to SSE
app.post("/hooks/message", (req, res) => {
  const { id, room_id, user_id, content, created_at } = req.body || {};
  const payload = { id, room_id, user_id, content, created_at };
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const c of clients) c.res.write(data);
  res.status(200).json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
