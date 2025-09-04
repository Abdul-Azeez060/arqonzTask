import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../dashboard/Dashboard.css";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:4000";

export default function Login() {
  const [username, setUsername] = useState("remo");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.token) {
        throw new Error(data?.message || "Login failed");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      // Default chat partner is the other user
      const other = username === "remo" ? "juliet" : "remo";
      localStorage.setItem("chatWith", other);
      navigate("/chat");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function quickFill(name: "remo" | "juliet") {
    setUsername(name);
    setPassword("1234");
  }

  return (
    <div className="dash" style={{ alignItems: "center", justifyContent: "center" }}>
      <aside className="dash__sidebar">
        <div className="brand">
          <div className="brand__logo">
            <span className="logo-pill">U</span>
          </div>
          <span className="brand__name">DNX</span>
        </div>
        <nav className="nav">
          <Link to="/" className="nav__item">
            <span>← Back to Dashboard</span>
          </Link>
        </nav>
      </aside>

      <main className="dash__main" style={{ display: "grid", placeItems: "center" }}>
        <div className="card" style={{ maxWidth: 420, width: "100%" }}>
          <h2 style={{ marginBottom: 8 }}>Login</h2>
          <p className="muted small" style={{ marginBottom: 16 }}>
            Use username "remo" or "juliet" with password "1234"
          </p>
          <form onSubmit={onSubmit}>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <label className="muted small">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="remo or juliet"
              />
            </div>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <label className="muted small">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="1234"
              />
            </div>
            {error && (
              <div className="muted small" style={{ color: "#c62828", marginBottom: 8 }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => quickFill("remo")}
                disabled={loading}
              >
                Remo
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => quickFill("juliet")}
                disabled={loading}
              >
                Juliet
              </button>
            </div>
          </form>
        </div>
      </main>

      <aside className="dash__right" />
    </div>
  );
}
