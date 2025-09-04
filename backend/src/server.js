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

  // ===== Dashboard Schemas =====
  const mentorSchema = new mongoose.Schema(
    {
      name: String,
      role: String,
      avatar: String,
      tasks: Number,
      rating: Number,
      followed: { type: Boolean, default: false },
    },
    { timestamps: true }
  );
  const Mentor =
    mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);

  const taskSchema = new mongoose.Schema(
    {
      title: String,
      role: String,
      progress: Number,
      dueDate: Date,
      image: String,
      participants: [String],
      duration: String, // e.g., "1 Hour"
      detailItems: [String], // today task checklist
      type: { type: String, index: true }, // "upcoming" | "today"
    },
    { timestamps: true }
  );
  const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

  const summarySchema = new mongoose.Schema(
    {
      runningScore: Number,
      runningTotal: Number,
      meterPercent: Number,
    },
    { timestamps: true }
  );
  const Summary =
    mongoose.models.Summary || mongoose.model("Summary", summarySchema);

  const activitySchema = new mongoose.Schema(
    {
      points: [Number], // values for the line chart
      range: { type: String, default: "This Week" },
    },
    { timestamps: true }
  );
  const Activity =
    mongoose.models.Activity || mongoose.model("Activity", activitySchema);

  const calendarSchema = new mongoose.Schema(
    {
      monthLabel: String,
      days: [Number],
      activeDay: Number,
    },
    { timestamps: true }
  );
  const Calendar =
    mongoose.models.Calendar || mongoose.model("Calendar", calendarSchema);

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

  // Seed dashboard data if empty
  async function seedDashboard() {
    if (!useDb) return; // only seed when db is active
    const [mentorCount, taskCount, summaryCount, activityCount, calendarCount] =
      await Promise.all([
        Mentor.countDocuments(),
        Task.countDocuments(),
        Summary.countDocuments(),
        Activity.countDocuments(),
        Calendar.countDocuments(),
      ]);

    if (mentorCount === 0) {
      await Mentor.insertMany([
        {
          name: "Curious George",
          role: "UI/UX Design",
          avatar: "https://i.pravatar.cc/64?img=12",
          tasks: 40,
          rating: 4.7,
          followed: false,
        },
        {
          name: "Abraham Lincoln",
          role: "3D Design",
          avatar: "https://i.pravatar.cc/64?img=31",
          tasks: 32,
          rating: 4.9,
          followed: true,
        },
      ]);
    }

    if (taskCount === 0) {
      await Task.insertMany([
        {
          title: "Creating Mobile App Design",
          role: "UI/UX Design",
          progress: 75,
          dueDate: new Date(Date.now() + 3 * 86400000),
          image:
            "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=600&auto=format&fit=crop",
          participants: [
            "https://i.pravatar.cc/28?img=21",
            "https://i.pravatar.cc/28?img=22",
            "https://i.pravatar.cc/28?img=23",
            "https://i.pravatar.cc/28?img=24",
          ],
          type: "upcoming",
        },
        {
          title: "Creating Perfect Website",
          role: "Web Developer",
          progress: 85,
          dueDate: new Date(Date.now() + 4 * 86400000),
          image:
            "https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=600&auto=format&fit=crop",
          participants: [
            "https://i.pravatar.cc/28?img=21",
            "https://i.pravatar.cc/28?img=22",
            "https://i.pravatar.cc/28?img=23",
            "https://i.pravatar.cc/28?img=24",
          ],
          type: "upcoming",
        },
        {
          title: "Creating Awesome Mobile Apps",
          role: "UI / UX Designer",
          progress: 90,
          duration: "1 Hour",
          image:
            "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=800&auto=format&fit=crop",
          participants: [
            "https://i.pravatar.cc/28?img=11",
            "https://i.pravatar.cc/28?img=12",
            "https://i.pravatar.cc/28?img=13",
            "https://i.pravatar.cc/28?img=14",
            "https://i.pravatar.cc/28?img=15",
          ],
          detailItems: [
            "Understanding the tools in Figma",
            "Understand the basics of making designs",
            "Design a mobile application with figma",
          ],
          type: "today",
        },
      ]);
    }

    // Top up extra seed if needed for better homepage population
    const upcomingCount = await Task.countDocuments({ type: "upcoming" });
    if (upcomingCount < 6) {
      const extraUpcoming = [
        {
          title: "Redesign Dashboard UX",
          role: "Product Design",
          progress: 35,
          dueDate: new Date(Date.now() + 6 * 86400000),
          image:
            "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=800&auto=format&fit=crop",
          participants: [
            "https://i.pravatar.cc/28?img=25",
            "https://i.pravatar.cc/28?img=26",
            "https://i.pravatar.cc/28?img=27",
          ],
          type: "upcoming",
        },
        {
          title: "Implement Realtime Chat",
          role: "Full-stack",
          progress: 60,
          dueDate: new Date(Date.now() + 2 * 86400000),
          image:
            "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
          participants: [
            "https://i.pravatar.cc/28?img=28",
            "https://i.pravatar.cc/28?img=29",
          ],
          type: "upcoming",
        },
        {
          title: "Marketing Landing Page",
          role: "Frontend Dev",
          progress: 50,
          dueDate: new Date(Date.now() + 5 * 86400000),
          image:
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
          participants: [
            "https://i.pravatar.cc/28?img=30",
            "https://i.pravatar.cc/28?img=31",
          ],
          type: "upcoming",
        },
        {
          title: "QA Test Suite Update",
          role: "QA Engineer",
          progress: 20,
          dueDate: new Date(Date.now() + 7 * 86400000),
          image:
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
          participants: [
            "https://i.pravatar.cc/28?img=32",
            "https://i.pravatar.cc/28?img=33",
          ],
          type: "upcoming",
        },
      ];
      const need = Math.max(0, 6 - upcomingCount);
      if (need > 0) await Task.insertMany(extraUpcoming.slice(0, need));
    }

    if (mentorCount < 6) {
      const extraMentors = [
        {
          name: "Ada Lovelace",
          role: "Backend Engineer",
          avatar: "https://i.pravatar.cc/64?img=45",
          tasks: 28,
          rating: 4.8,
          followed: false,
        },
        {
          name: "Grace Hopper",
          role: "Computer Scientist",
          avatar: "https://i.pravatar.cc/64?img=7",
          tasks: 50,
          rating: 5.0,
          followed: true,
        },
        {
          name: "Alan Turing",
          role: "ML Researcher",
          avatar: "https://i.pravatar.cc/64?img=15",
          tasks: 22,
          rating: 4.6,
          followed: false,
        },
        {
          name: "Katherine Johnson",
          role: "Data Scientist",
          avatar: "https://i.pravatar.cc/64?img=22",
          tasks: 41,
          rating: 4.9,
          followed: false,
        },
      ];
      const need = Math.max(0, 6 - mentorCount);
      if (need > 0) await Mentor.insertMany(extraMentors.slice(0, need));
    }

    if (summaryCount === 0) {
      await Summary.create({
        runningScore: 65,
        runningTotal: 100,
        meterPercent: 45,
      });
    }

    if (activityCount === 0) {
      await Activity.create({
        points: [60, 70, 40, 65, 30, 55, 45, 50],
        range: "This Week",
      });
    }

    if (calendarCount === 0) {
      await Calendar.create({
        monthLabel: "July 2022",
        days: [10, 11, 12, 13, 14, 15, 16],
        activeDay: 14,
      });
    }
  }
  await seedDashboard();

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

  // ===== Dashboard routes (secured) =====
  app.get("/dashboard", requireAuth, async (_req, res) => {
    try {
      const [summary, activity, mentors, upcomingTasks, todayTask, calendar] =
        await Promise.all([
          Summary.findOne().lean(),
          Activity.findOne().lean(),
          Mentor.find().lean(),
          Task.find({ type: "upcoming" }).lean(),
          Task.findOne({ type: "today" }).lean(),
          Calendar.findOne().lean(),
        ]);
      res.json({
        summary,
        activity,
        mentors,
        upcomingTasks,
        todayTask,
        calendar,
      });
    } catch (e) {
      res.status(500).json({ error: "failed to load dashboard" });
    }
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
