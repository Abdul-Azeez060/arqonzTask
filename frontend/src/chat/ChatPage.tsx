import { useEffect, useMemo, useRef, useState } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import "../dashboard/Dashboard.css";

type Message = {
  id: number;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function ChatPage() {
  const supabase = useMemo(
    () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY),
    []
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const roomIdRef = useRef<string>("00000000-0000-0000-0000-000000000001");

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    async function init() {
      const room_id = roomIdRef.current;
      // load history
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", room_id)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) || []);
      // realtime
      channel = supabase
        .channel("room-" + room_id)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `room_id=eq.${room_id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();
    }
    init();
    return () => {
      channel && supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function send() {
    const room_id = roomIdRef.current;
    const uid =
      (await supabase.auth.getUser()).data.user?.id ||
      "00000000-0000-0000-0000-000000000000";
    if (!input.trim()) return;
    await supabase
      .from("messages")
      .insert({ room_id, user_id: uid, content: input.trim() });
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
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bubble ${
                    m.user_id.endsWith("0000") ? "me" : ""
                  }`}>
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
