import "./Dashboard.css";

export default function Dashboard() {
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
          {["Overview", "Task", "Mentors", "Message", "Settings"].map(
            (item, i) => (
              <a
                key={item}
                className={`nav__item ${i === 0 ? "active" : ""}`}
                href="#">
                <span className="nav__icon" />
                <span>{item}</span>
              </a>
            )
          )}
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
          <img
            className="thumb"
            src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=800&auto=format&fit=crop"
            alt="task"
          />
          <h4>Creating Awesome Mobile Apps</h4>
          <div className="muted">UI/UX Designer</div>
          <div className="progress">
            <div className="progress__bar">
              <span style={{ width: "90%" }} />
            </div>
            <span className="muted">90%</span>
          </div>
          <div className="tiny-row">
            <ClockIcon />
            <span className="muted">1 Hour</span>
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
          <div className="detail">
            <div className="detail__head">
              <span>Detail Task</span>
              <span className="muted">UI/UX Designer</span>
            </div>
            <ol>
              <li>Understanding the tools in Figma</li>
              <li>Understand the basics of making designs</li>
              <li>Design a mobile application with figma</li>
            </ol>
          </div>
          <button className="btn btn-primary full">Go To Detail</button>
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
      <img className="mentor__avatar" src={img} alt={name} />
      <div className="mentor__info">
        <div className="mentor__name">{name}</div>
        <div className="muted small">{role}</div>
        <div className="mentor__meta">
          <span className="muted small">{tasks} Task</span>
          <span className="muted small">⭐ {rating}</span>
        </div>
      </div>
      <button
        className={`btn ${
          action.includes("Follow") ? "btn-ghost" : "btn-muted"
        }`}>
        {action}
      </button>
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
