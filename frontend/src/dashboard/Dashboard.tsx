import "./Dashboard.css";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:4000";

type Mentor = {
  _id: string;
  name: string;
  role: string;
  avatar: string;
  tasks: number;
  rating: number;
  followed?: boolean;
};
type TaskDoc = {
  _id: string;
  title: string;
  role: string;
  progress: number;
  dueDate?: string;
  image: string;
  participants?: string[];
  duration?: string;
  detailItems?: string[];
  type: string;
};
type Summary = {
  runningScore: number;
  runningTotal: number;
  meterPercent: number;
};
type Activity = { points: number[]; range: string };
type CalendarDoc = { monthLabel: string; days: number[]; activeDay: number };

export default function Dashboard() {
  const { pathname } = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskDoc[]>([]);
  const [todayTask, setTodayTask] = useState<TaskDoc | null>(null);
  const [calendar, setCalendar] = useState<CalendarDoc | null>(null);
  const [mentorPage, setMentorPage] = useState(0);
  const [taskPage, setTaskPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isActive = (label: string) => {
    if (label === "Overview") return pathname === "/";
    if (label === "Message") return pathname === "/chat";
    return false;
  };

  // Load token or auto-login dev user if missing
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      return;
    }
    // Dev fallback: auto-login as remo
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "remo", password: "1234" }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.user?.username || "remo");
          setToken(data.token);
        }
      } catch {}
    })();
  }, []);

  // detect mobile width for sidebar behavior
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setSummary(data.summary || null);
        setActivity(data.activity || null);
        setMentors(Array.isArray(data.mentors) ? data.mentors : []);
        setUpcomingTasks(
          Array.isArray(data.upcomingTasks) ? data.upcomingTasks : []
        );
        setTodayTask(data.todayTask || null);
        setCalendar(data.calendar || null);
      } catch {}
    })();
  }, [token]);

  // Pagination: 2 items per page
  const mentorFallback: Mentor[] = [
    {
      _id: "1",
      name: "Curious George",
      role: "UI/UX Design",
      avatar: "https://i.pravatar.cc/64?img=12",
      tasks: 40,
      rating: 4.7,
      followed: false,
    },
    {
      _id: "2",
      name: "Abraham Lincoln",
      role: "3D Design",
      avatar: "https://i.pravatar.cc/64?img=31",
      tasks: 32,
      rating: 4.9,
      followed: true,
    },
    {
      _id: "3",
      name: "Ada Lovelace",
      role: "Backend Engineer",
      avatar: "https://i.pravatar.cc/64?img=45",
      tasks: 28,
      rating: 4.8,
      followed: false,
    },
    {
      _id: "4",
      name: "Grace Hopper",
      role: "Computer Scientist",
      avatar: "https://i.pravatar.cc/64?img=7",
      tasks: 50,
      rating: 5.0,
      followed: true,
    },
  ];
  const mentorList = mentors.length ? mentors : mentorFallback;
  const mentorPages = Math.max(1, Math.ceil(mentorList.length / 2));
  const mentorStart = (mentorPage % mentorPages) * 2;
  const mentorSlice = mentorList.slice(mentorStart, mentorStart + 2);
  useEffect(() => {
    setMentorPage(0);
  }, [mentorList.length]);

  const taskFallback: TaskDoc[] = [
    {
      _id: "t1",
      title: "Creating Mobile App Design",
      role: "UI/UX Design",
      progress: 75,
      image:
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=600&auto=format&fit=crop",
      type: "upcoming",
    },
    {
      _id: "t2",
      title: "Creating Perfect Website",
      role: "Web Developer",
      progress: 85,
      image:
        "https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=600&auto=format&fit=crop",
      type: "upcoming",
    },
    {
      _id: "t3",
      title: "Redesign Dashboard UX",
      role: "Product Design",
      progress: 35,
      image:
        "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=800&auto=format&fit=crop",
      type: "upcoming",
    },
    {
      _id: "t4",
      title: "Implement Realtime Chat",
      role: "Full-stack",
      progress: 60,
      image:
        "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
      type: "upcoming",
    },
  ];
  const tasksList = upcomingTasks.length ? upcomingTasks : taskFallback;
  const taskPages = Math.max(1, Math.ceil(tasksList.length / 2));
  const taskStart = (taskPage % taskPages) * 2;
  const taskSlice = tasksList.slice(taskStart, taskStart + 2);
  useEffect(() => {
    setTaskPage(0);
  }, [tasksList.length]);
  return (
    <div className="dash">
      <aside
        className={`dash__sidebar ${
          isMobile ? (sidebarOpen ? "open" : "closed") : ""
        }`}>
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

      {isMobile && sidebarOpen && (
        <div className="backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="dash__main">
        <header className="topbar">
          <div>
            <div className="tiny-row" style={{ gap: 8 }}>
              <button
                className="icon-btn hamburger"
                aria-label="menu"
                onClick={() => setSidebarOpen((v) => !v)}>
                ☰
              </button>
              <h2 style={{ margin: 0 }}>Hi, Dennis Nzioki</h2>
            </div>
            <p className="muted">Let's finish your task today!</p>
          </div>
          <div className="topbar__right">
            <button className="icon-btn" aria-label="alerts">
              <BellIcon />
            </button>
            <img
              className="avatar"
              src="https://i.pravatar.cc/48?img=5"
              alt="user"
            />
          </div>
        </header>

        <section className="grid">
          <div className="card running">
            <div className="running__title">Running Task</div>
            <div className="running__content">
              <div className="running__score">
                {summary?.runningScore ?? 65}
              </div>
              <div className="running__meter">
                <div className="meter__ring">
                  <span>{summary?.meterPercent ?? 45}%</span>
                </div>
                <div className="running__total">
                  {summary?.runningTotal ?? 100}
                  <br />
                  Task
                </div>
              </div>
            </div>
          </div>

          <div className="card activity">
            <div className="activity__header">
              <span>Activity</span>
              <span className="muted">{activity?.range ?? "This Week"}</span>
            </div>
            <MiniChart
              points={activity?.points || [60, 70, 40, 65, 30, 55, 45, 50]}
            />
          </div>
        </section>

        <section className="row">
          <h3>Monthly Mentors</h3>
          <div className="row__nav">
            <button
              className="icon-btn"
              aria-label="previous mentors"
              onClick={() =>
                setMentorPage((p) => (p - 1 + mentorPages) % mentorPages)
              }>
              <ChevronLeft />
            </button>
            <button
              className="icon-btn"
              aria-label="next mentors"
              onClick={() => setMentorPage((p) => (p + 1) % mentorPages)}>
              <ChevronRight />
            </button>
          </div>
        </section>

        <div className="cards two">
          {mentorSlice.map((m) => (
            <MentorCard
              key={m._id}
              name={m.name}
              role={m.role}
              tasks={m.tasks}
              rating={`${m.rating.toFixed(1)} (reviews)`}
              img={m.avatar}
              action={m.followed ? "Followed" : "+ Follow"}
            />
          ))}
        </div>

        <section className="row">
          <h3>Upcoming Task</h3>
          <div className="row__nav">
            <button
              className="icon-btn"
              aria-label="previous tasks"
              onClick={() =>
                setTaskPage((p) => (p - 1 + taskPages) % taskPages)
              }>
              <ChevronLeft />
            </button>
            <button
              className="icon-btn"
              aria-label="next tasks"
              onClick={() => setTaskPage((p) => (p + 1) % taskPages)}>
              <ChevronRight />
            </button>
          </div>
        </section>

        <div className="cards two">
          {taskSlice.map((t) => (
            <TaskCard
              key={t._id}
              title={t.title}
              role={t.role}
              progress={t.progress}
              daysLeft={
                t.dueDate
                  ? `${Math.max(
                      1,
                      Math.ceil(
                        (new Date(t.dueDate).getTime() - Date.now()) / 86400000
                      )
                    )} Days Left`
                  : ""
              }
              img={t.image}
            />
          ))}
        </div>
      </main>

      <aside className="dash__right">
        <div className="card calendar">
          <div className="calendar__header">
            <button className="icon-btn">
              <ChevronLeft />
            </button>
            <div>
              <div className="muted">{calendar?.monthLabel ?? "July 2022"}</div>
            </div>
            <button className="icon-btn">
              <ChevronRight />
            </button>
          </div>

          <div className="calendar__grid">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <span key={d} className="muted center">
                {d}
              </span>
            ))}
            {(calendar?.days ?? [10, 11, 12, 13, 14, 15, 16]).map((n) => (
              <button
                key={n}
                className={`date ${
                  n === (calendar?.activeDay ?? 14) ? "active" : ""
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="card today">
          <div className="today__head">
            <span className="muted">Task Today</span>
            <button className="icon-btn" aria-label="more">
              ⋯
            </button>
          </div>
          <img
            className="thumb"
            src={
              todayTask?.image ||
              "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=800&auto=format&fit=crop"
            }
            alt="task"
          />
          <h4>{todayTask?.title ?? "Creating Awesome Mobile Apps"}</h4>
          <div className="muted">{todayTask?.role ?? "UI / UX Designer"}</div>

          <div className="progress__row">
            <span>Progress</span>
            <span className="muted">{todayTask?.progress ?? 90}%</span>
          </div>
          <div className="progress --thick">
            <div className="progress__bar">
              <span style={{ width: `${todayTask?.progress ?? 90}%` }} />
            </div>
          </div>

          <div className="tiny-row space-between">
            <span className="tiny-row">
              <ClockIcon /> {todayTask?.duration ?? "1 Hour"}
            </span>
            <div className="avatars">
              {(
                todayTask?.participants ??
                [11, 12, 13, 14, 15].map(
                  (i) => `https://i.pravatar.cc/28?img=${i}`
                )
              ).map((src, idx) => (
                <img key={idx} src={src} alt="av" />
              ))}
            </div>
          </div>

          <div className="divider" />

          <div className="detail">
            <div className="detail__head">
              <span>Detail Task</span>
              <span className="muted">UI / UX Designer</span>
            </div>
            <ol className="num-list">
              {(
                todayTask?.detailItems ?? [
                  "Understanding the tools in Figma",
                  "Understand the basics of making designs",
                  "Design a mobile application with figma",
                ]
              ).map((li, idx) => (
                <li key={idx}>{li}</li>
              ))}
            </ol>
          </div>
          <button className="btn btn-primary full big">Go To Detail</button>
        </div>
      </aside>
    </div>
  );
}

function MentorCard({
  name,
  role,
  tasks,
  rating,
  img,
  action,
}: {
  name: string;
  role: string;
  tasks: number;
  rating: string;
  img: string;
  action: string;
}) {
  return (
    <div className="mentor card flat">
      <img className="mentor__avatar circle" src={img} alt={name} />
      <div className="mentor__info">
        <div className="mentor__name">{name}</div>
        <div className="muted small">{role}</div>
      </div>
      {action === "+ Follow" ? (
        <a className="follow-link" href="#">
          + Follow
        </a>
      ) : (
        <span className="muted">Followed</span>
      )}
      <div className="mentor__meta ">
        <span className="muted small meta">
          <TaskBadgeIcon /> {tasks} Task
        </span>
        <span className="muted small meta">
          <StarIcon /> {rating}
        </span>
      </div>
    </div>
  );
}

function TaskCard({
  title,
  role,
  progress,
  daysLeft,
  img,
}: {
  title: string;
  role: string;
  progress: number;
  daysLeft: string;
  img: string;
}) {
  return (
    <div className="task card flat">
      <img className="task__img" src={img} alt="task" />
      <div className="task__body">
        <div className="task__title">{title}</div>
        <div className="muted small">{role}</div>
        <div className="progress">
          <div className="progress__bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="muted">{progress}%</span>
        </div>
        <div className="tiny-row">
          <ClockIcon />
          <span className="muted">{daysLeft}</span>
          <div className="avatars">
            {[21, 22, 23, 24].map((i) => (
              <img key={i} src={`https://i.pravatar.cc/28?img=${i}`} alt="av" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ points }: { points: number[] }) {
  // map values to a 0..300 width, 0..100 height polyline
  const step = 300 / (points.length - 1);
  const max = Math.max(...points, 100);
  const min = Math.min(...points, 0);
  const norm = points.map((v, i) => {
    const x = i * step;
    // invert y so larger values go up; pad 10px
    const y = 90 - ((v - min) / (max - min || 1)) * 70;
    return `${x},${y}`;
  });
  return (
    <svg className="chart" viewBox="0 0 300 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        points={norm.join(" ")}
      />
      <g className="axis">
        {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
          <line key={i} x1={x} y1={90} x2={x} y2={90} stroke="#e5e7eb" />
        ))}
      </g>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405C18.79 14.79 18 13.42 18 12V8a6 6 0 10-12 0v4c0 1.42-.79 2.79-1.595 3.595L3 17h5" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

// Sidebar icons
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
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="#fbbf24"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
function TaskBadgeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 12h8M8 8h8M8 16h5" />
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
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4v15.5A2.5 2.5 0 0 0 6.5 22H20V6a2 2 0 0 0-2-2H6" />
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
      <polygon points="12 2 19 7 19 17 12 22 5 17 5 7 12 2" />
      <circle cx="12" cy="10" r="2" />
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
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
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
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09c.64 0 1.23-.38 1.49-.97a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.52.42 1.22.52 1.82.26.59-.26.97-.85.97-1.49V4a2 2 0 1 1 4 0v.09c0 .64.38 1.23.97 1.49.6.26 1.3.16 1.82-.26l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.42.52-.52 1.22-.26 1.82.26.59.85.97 1.49.97H22a2 2 0 1 1 0 4h-.09c-.64 0-1.23.38-1.49.97z" />
    </svg>
  );
}
