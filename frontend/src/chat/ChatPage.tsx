import { useEffect, useRef, useState } from "react";
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
  const me = useRef<string>("user-1");
  const other = useRef<string>("user-2");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const a = me.current;
    const b = other.current;
    // history
    fetch(`${API_BASE}/dm/${a}/${b}/messages`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => setMessages([]));
    // socket
    const s = io(API_BASE, { transports: ["websocket"] });
    socketRef.current = s;
    s.emit("dm:join", { a, b });
    s.on("message:new", (msg: Message) =>
      setMessages((prev) => [...prev, msg])
    );
    return () => {
      s.close();
    };
  }, []);

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
          {["Overview", "Task", "Mentors", "Message", "Settings"].map((n) => (
            <a
              key={n}
              className={`nav__item ${n === "Message" ? "active" : ""}`}
              href="#/chat">
              {n}
            </a>
          ))}
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
              {messages.map((m, idx) => (
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
