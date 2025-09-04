const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
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

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, index: true },
    passwordHash: String,
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  const MONGO_URI =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern_chat";
  let useDb = true;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    useDb = false;
    console.warn(
      "MongoDB connection failed. Falling back to in-memory store for development.",
      err?.message || err
    );
  }

  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // health
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // helper to build 1-1 conversation id
  const convId = (a, b) => [a, b].sort().join(":");

  // In-memory fallback store
  const memory = new Map(); // roomId -> [{ _id, roomId, userId, content, createdAt }]
  const memoryUsers = new Map(); // username -> {username, passwordHash}
  const nowIso = () => new Date().toISOString();
  const uuid = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  async function getMessages(roomId) {
    if (useDb) {
      return await Message.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(200)
        .lean();
    }
    const arr = memory.get(roomId) || [];
    // Return a shallow copy sorted by createdAt just in case
    return [...arr]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-200);
  }
  async function createMessage({ roomId, userId, content }) {
    if (useDb) {
      return await Message.create({ roomId, userId, content });
    }
    const msg = { _id: uuid(), roomId, userId, content, createdAt: nowIso() };
    const arr = memory.get(roomId) || [];
    arr.push(msg);
    memory.set(roomId, arr);
    return msg;
  }

  // Auth helpers
  const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
  async function upsertUsers(usernames = []) {
    for (const username of usernames) {
      const password = "1234";
      const passwordHash = await bcrypt.hash(password, 10);
      if (useDb) {
        const existing = await User.findOne({ username }).lean();
        if (!existing) await User.create({ username, passwordHash });
      } else {
        if (!memoryUsers.has(username))
          memoryUsers.set(username, { username, passwordHash });
      }
      console.log("User ready:", username);
    }
  }
  await upsertUsers(["remo", "juliet"]);

  async function findUser(username) {
    if (useDb) return await User.findOne({ username }).lean();
    return memoryUsers.get(username) || null;
  }
  async function validateUser(username, password) {
    const u = await findUser(username);
    if (!u) return null;
    const ok = await bcrypt.compare(password, u.passwordHash);
    return ok ? { username: u.username } : null;
  }
  function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  }
  function requireAuth(req, res, next) {
    const hdr = req.headers.authorization || "";
    const [, token] = hdr.split(" ");
    if (!token) return res.status(401).json({ error: "unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ error: "invalid token" });
    }
  }

  // Auth routes
  app.post("/auth/login", async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });
    const user = await validateUser(username, password);
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    const token = signToken({ username: user.username });
    res.json({ token, user });
  });

  // history
  app.get("/rooms/:roomId/messages", requireAuth, async (req, res) => {
    const { roomId } = req.params;
    const docs = await getMessages(roomId);
    res.json(docs);
  });

  // simple post (also emits)
  app.post("/rooms/:roomId/messages", requireAuth, async (req, res) => {
    const { roomId } = req.params;
    const { userId, content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });
    const msg = await createMessage({ roomId, userId, content });
    io.to(roomId).emit("message:new", msg);
    res.status(201).json(msg);
  });

  // 1-1: history
  app.get("/dm/:a/:b/messages", requireAuth, async (req, res) => {
    const id = convId(req.params.a, req.params.b);
    const docs = await getMessages(id);
    res.json(docs);
  });

  // 1-1: send
  app.post("/dm/:a/:b/messages", requireAuth, async (req, res) => {
    const { a, b } = req.params;
    const { from, content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });
    const roomId = convId(a, b);
    const msg = await createMessage({ roomId, userId: from, content });
    io.to(roomId).emit("message:new", msg);
    res.status(201).json(msg);
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("unauthorized"));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // { username }
      next();
    } catch (e) {
      next(new Error("invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("room:join", (roomId) => {
      socket.join(roomId);
    });
    socket.on("message:send", async ({ roomId, userId, content }) => {
      if (!content) return;
      const msg = await createMessage({ roomId, userId, content });
      io.to(roomId).emit("message:new", msg);
    });

    // 1-1 sockets
    socket.on("dm:join", ({ a, b }) => {
      socket.join(convId(a, b));
    });
    socket.on("dm:send", async ({ from, to, content }) => {
      if (!content) return;
      try {
        const roomId = convId(from, to);
        const msg = await createMessage({ roomId, userId: from, content });
        io.to(roomId).emit("message:new", msg);
      } catch (e) {
        console.error("dm:send failed", e?.message || e);
      }
    });
  });

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

main().catch((err) => {
  console.error("Server failed to start", err);
  process.exit(1);
});
