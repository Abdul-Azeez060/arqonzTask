const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
dotenv.config();

// Mongo models
const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, index: true },
    userId: String,
    content: String,
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);
const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

async function main() {
  const MONGO_URI =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern_chat";
  await mongoose.connect(MONGO_URI);

  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_ORIGIN || "*" },
  });

  // health
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // helper to build 1-1 conversation id
  const convId = (a, b) => [a, b].sort().join(":");

  // history
  app.get("/rooms/:roomId/messages", async (req, res) => {
    const { roomId } = req.params;
    const docs = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();
    res.json(docs);
  });

  // simple post (also emits)
  app.post("/rooms/:roomId/messages", async (req, res) => {
    const { roomId } = req.params;
    const { userId, content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });
    const msg = await Message.create({ roomId, userId, content });
    io.to(roomId).emit("message:new", msg);
    res.status(201).json(msg);
  });

  // 1-1: history
  app.get("/dm/:a/:b/messages", async (req, res) => {
    const id = convId(req.params.a, req.params.b);
    const docs = await Message.find({ roomId: id })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();
    res.json(docs);
  });

  // 1-1: send
  app.post("/dm/:a/:b/messages", async (req, res) => {
    const { a, b } = req.params;
    const { from, content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });
    const roomId = convId(a, b);
    const msg = await Message.create({ roomId, userId: from, content });
    io.to(roomId).emit("message:new", msg);
    res.status(201).json(msg);
  });

  io.on("connection", (socket) => {
    socket.on("room:join", (roomId) => {
      socket.join(roomId);
    });
    socket.on("message:send", async ({ roomId, userId, content }) => {
      if (!content) return;
      const msg = await Message.create({ roomId, userId, content });
      io.to(roomId).emit("message:new", msg);
    });

    // 1-1 sockets
    socket.on("dm:join", ({ a, b }) => {
      socket.join(convId(a, b));
    });
    socket.on("dm:send", async ({ from, to, content }) => {
      if (!content) return;
      const roomId = convId(from, to);
      const msg = await Message.create({ roomId, userId: from, content });
      io.to(roomId).emit("message:new", msg);
    });
  });

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

main().catch((err) => {
  console.error("Server failed to start", err);
  process.exit(1);
});
