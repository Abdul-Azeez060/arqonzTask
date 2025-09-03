import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import "../dashboard/Dashboard.css";

type Message = {
  _id?: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt?: string;
};

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:4000";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const me = useRef<string>("user-1");
  const other = useRef<string>("user-2");
  const socketRef = useRef<Socket | null>(null);
  const { pathname } = useLocation();
  const isActive = (label: string) => {
    if (label === "Overview") return pathname === "/";
    if (label === "Message") return pathname === "/chat";
    return false;
  };

  // 1) Login to get JWT token (root user: remo / 1234)
  useEffect(() => {
    async function login() {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "remo", password: "1234" }),
        });
        const data = await res.json();
        if (res.ok && data?.token) {
          setToken(data.token);
        } else {
          console.warn("Login failed", data);
          setToken(null);
        }
      } catch (e) {
        console.warn("Login error", e);
        setToken(null);
      }
    }
    login();
  }, []);

  // 2) After token, load history and connect socket with auth
  useEffect(() => {
    if (!token) return;
    const a = me.current;
    const b = other.current;
    let closed = false;

    async function loadHistory() {
      try {
        const res = await fetch(`${API_BASE}/dm/${a}/${b}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    }
    loadHistory();

    const s = io(API_BASE, { transports: ["websocket"], auth: { token } });
    socketRef.current = s;
    s.emit("dm:join", { a, b });
    s.on("message:new", (msg: Message) => {
      if (!closed) setMessages((prev) => [...prev, msg]);
    });

    return () => {
      closed = true;
      s.close();
    };
  }, [token]);

  function send() {
    const from = me.current;
    const to = other.current;
    const content = input.trim();
    if (!content) return;
    socketRef.current?.emit("dm:send", { from, to, content });
    setInput("");
  }

  return (
    <div className="dash">
      <aside className="dash__sidebar">
        <div className="brand">
          <div className="brand__logo">
            <span className="logo-pill">U</span>
          </div>
          <span className="brand__name">DNX</span>
        </div>
        <nav className="nav">
          <Link
            to="/"
            className={`nav__item ${isActive("Overview") ? "active" : ""}`}>
            <OverviewIcon className="nav__svg" />
            <span>Overview</span>
          </Link>
          <a className="nav__item" href="#">
            <BookIcon className="nav__svg" />
            <span>Task</span>
          </a>
          <a className="nav__item" href="#">
            <MentorIcon className="nav__svg" />
            <span>Mentors</span>
          </a>
          <Link
            to="/chat"
            className={`nav__item ${isActive("Message") ? "active" : ""}`}>
            <ChatIcon className="nav__svg" />
            <span>Message</span>
          </Link>
          <a className="nav__item" href="#">
            <GearIcon className="nav__svg" />
            <span>Settings</span>
          </a>
        </nav>
        <div className="help">
          <div className="help__badge">?</div>
          <h4>Help Center</h4>
          <p>
            Having Trouble in Learning. Please contact us for more questions.
          </p>
          <button className="btn btn-primary">Go To Help Center</button>
        </div>
      </aside>

      <main className="dash__main" style={{ gap: 0 }}>
        <header
          className="topbar"
          style={{
            borderBottom: "1px solid var(--border)",
            paddingBottom: 8,
            marginBottom: 8,
          }}>
          <h2>Message</h2>
          <div className="topbar__right">
            <button className="icon-btn" aria-label="alerts">
              🔔
            </button>
            <img
              className="avatar"
              src="https://i.pravatar.cc/48?img=5"
              alt="user"
            />
          </div>
        </header>

        <div className="chat">
          <div className="chat__list">
            <div className="search">
              <input placeholder="Search Name" />
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="chat__person card flat">
                <img
                  className="mentor__avatar"
                  src={`https://i.pravatar.cc/48?img=${i + 10}`}
                />
                <div>
                  <div className="mentor__name">Angelle Crison</div>
                  <div className="muted small">
                    Thank you very much. I'm glad ...
                  </div>
                </div>
                <span className="muted small" style={{ marginLeft: "auto" }}>
                  1 m Ago
                </span>
              </div>
            ))}
          </div>

          <div className="chat__panel card">
            <div className="chat__header">
              <div className="person">
                <img
                  className="mentor__avatar"
                  src={`https://i.pravatar.cc/48?img=20`}
                />
                <div>
                  <div className="mentor__name">Angelle Crison</div>
                  <div className="muted small">● Online</div>
                </div>
              </div>
              <div className="row__nav">
                <button className="icon-btn">📞</button>
                <button className="icon-btn">🎥</button>
              </div>
            </div>

            <div className="chat__body">
              <div className="badge muted">Today</div>
              <div className="bubble me">
                Morning Angelle, I have question about My Task
              </div>
              <div className="bubble">
                Yes sure, Any problem with your assignment?
              </div>
              <div className="image-bubble">
                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop" />
                <div className="muted small">
                  How to make a responsive display from the dashboard?
                </div>
              </div>
              {(Array.isArray(messages) ? messages : []).map((m, idx) => (
                <div
                  key={m._id || idx}
                  className={`bubble ${m.userId === me.current ? "me" : ""}`}>
                  {m.content}
                </div>
              ))}
            </div>

            <div className="chat__input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Send your message..."
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button className="btn btn-primary" onClick={send}>
                ➤
              </button>
            </div>
          </div>
        </div>
      </main>

      <aside className="dash__right" />
    </div>
  );
}

// Sidebar icons (same set as Dashboard)
function OverviewIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1"></rect>
    </svg>
  );
}
function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M4 4v15.5"></path>
      <path d="M20 22V6a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 6.5"></path>
    </svg>
  );
}
function MentorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="7" r="4"></circle>
      <path d="M5.5 22a6.5 6.5 0 0 1 13 0"></path>
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
    </svg>
  );
}
function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.33 15a1.65 1.65 0 0 0-1.51-1H1a2 2 0 1 1 0-4h.82A1.65 1.65 0 0 0 3.33 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.33 1.65 1.65 0 0 0 9 1.82V1a2 2 0 1 1 4 0v.82a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.67 8a1.65 1.65 0 0 0 1.51 1H23a2 2 0 1 1 0 4h-.82a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
