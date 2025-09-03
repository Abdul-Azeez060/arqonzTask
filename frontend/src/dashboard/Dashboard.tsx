import "./Dashboard.css";
import { Link, useLocation } from "react-router-dom";

export default function Dashboard() {
  const { pathname } = useLocation();
  const isActive = (label: string) => {
    if (label === "Overview") return pathname === "/";
    if (label === "Message") return pathname === "/chat";
    return false;
  };
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

      <main className="dash__main">
        <header className="topbar">
          <div>
            <h2>Hi, Dennis Nzioki</h2>
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
              <div className="running__score">65</div>
              <div className="running__meter">
                <div className="meter__ring">
                  <span>45%</span>
                </div>
                <div className="running__total">
                  100
                  <br />
                  Task
                </div>
              </div>
            </div>
          </div>

          <div className="card activity">
            <div className="activity__header">
              <span>Activity</span>
              <span className="muted">This Week</span>
            </div>
            <MiniChart />
          </div>
        </section>

        <section className="row">
          <h3>Monthly Mentors</h3>
          <div className="row__nav">
            <button className="icon-btn">
              <ChevronLeft />
            </button>
            <button className="icon-btn">
              <ChevronRight />
            </button>
          </div>
        </section>

        <div className="cards two">
          <MentorCard
            name="Curious George"
            role="UI/UX Design"
            tasks={40}
            rating="4.7 (750 Reviews)"
            img="https://i.pravatar.cc/64?img=12"
            action="+ Follow"
          />
          <MentorCard
            name="Abraham Lincoln"
            role="3D Design"
            tasks={32}
            rating="4.9 (510 Reviews)"
            img="https://i.pravatar.cc/64?img=31"
            action="Followed"
          />
        </div>

        <section className="row">
          <h3>Upcoming Task</h3>
          <div className="row__nav">
            <button className="icon-btn">
              <ChevronLeft />
            </button>
            <button className="icon-btn">
              <ChevronRight />
            </button>
          </div>
        </section>

        <div className="cards two">
          <TaskCard
            title="Creating Mobile App Design"
            role="UI/UX Design"
            progress={75}
            daysLeft="3 Days Left"
            img="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=600&auto=format&fit=crop"
          />
          <TaskCard
            title="Creating Perfect Website"
            role="Web Developer"
            progress={85}
            daysLeft="4 Days Left"
            img="https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=600&auto=format&fit=crop"
          />
        </div>
      </main>

      <aside className="dash__right">
        <div className="card calendar">
          <div className="calendar__header">
            <button className="icon-btn">
              <ChevronLeft />
            </button>
            <div>
              <div className="muted">July 2022</div>
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
            {[10, 11, 12, 13, 14, 15, 16].map((n) => (
              <button key={n} className={`date ${n === 14 ? "active" : ""}`}>
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
            src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=800&auto=format&fit=crop"
            alt="task"
          />
          <h4>Creating Awesome Mobile Apps</h4>
          <div className="muted">UI / UX Designer</div>

          <div className="progress__row">
            <span>Progress</span>
            <span className="muted">90%</span>
          </div>
          <div className="progress --thick">
            <div className="progress__bar">
              <span style={{ width: "90%" }} />
            </div>
          </div>

          <div className="tiny-row space-between">
            <span className="tiny-row">
              <ClockIcon /> 1 Hour
            </span>
            <div className="avatars">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/28?img=${i + 10}`}
                  alt="av"
                />
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
              <li>Understanding the tools in Figma</li>
              <li>Understand the basics of making designs</li>
              <li>Design a mobile application with figma</li>
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
        <div className="mentor__meta">
          <span className="muted small meta">
            <TaskBadgeIcon /> {tasks} Task
          </span>
          <span className="muted small meta">
            <StarIcon /> {rating}
          </span>
        </div>
      </div>
      {action.includes("Follow") ? (
        <a className="follow-link" href="#">
          + Follow
        </a>
      ) : (
        <span className="muted">Followed</span>
      )}
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

function MiniChart() {
  return (
    <svg className="chart" viewBox="0 0 300 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        points="0,60 40,70 80,40 120,65 160,30 200,55 240,45 280,50"
      />
      <circle cx="80" cy="40" r="6" fill="var(--primary)" />
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
