import { Link } from "react-router-dom";
import { StatusBadge } from "js-simulator";
import type { RuntimeCategory } from "js-simulator";
import "./practice.css";

interface Module {
  to: string;
  label: string;
  rt: RuntimeCategory;
  mastery: number; // 0..100
}

const MODULES: Module[] = [
  { to: "/event-loop", label: "Event Loop", rt: "eventloop", mastery: 100 },
  { to: "/browser", label: "Browser Runtime", rt: "webapi", mastery: 80 },
  { to: "/node", label: "Node.js Runtime", rt: "nodeapi", mastery: 70 },
  { to: "/libuv", label: "libuv Thread Pool", rt: "threadpool", mastery: 60 },
  { to: "/network", label: "Network I/O", rt: "network", mastery: 45 },
  { to: "/websocket", label: "WebSocket", rt: "websocket", mastery: 55 },
  { to: "/streams", label: "Streams & Backpressure", rt: "streams", mastery: 30 },
  { to: "/workers", label: "Worker Threads", rt: "worker", mastery: 20 },
];

interface Badge {
  glyph: string;
  label: string;
  hint: string;
  earned: boolean;
  rt: RuntimeCategory;
}

const BADGES: Badge[] = [
  { glyph: "↻", label: "Loop Whisperer", hint: "Finished the Event Loop Explorer", earned: true, rt: "eventloop" },
  { glyph: "•", label: "Microtask Master", hint: "Aced 5 microtask challenges", earned: true, rt: "microtask" },
  { glyph: "▦", label: "Pool Party", hint: "Explored the libuv thread pool", earned: true, rt: "threadpool" },
  { glyph: "⇄", label: "Full Duplex", hint: "Built a WebSocket mental model", earned: false, rt: "websocket" },
  { glyph: "⊗", label: "Under Pressure", hint: "Solved a backpressure scenario", earned: false, rt: "backpressure" },
  { glyph: "◑", label: "Threaded", hint: "Offloaded CPU work to a worker", earned: false, rt: "worker" },
];

const avg = Math.round(MODULES.reduce((s, m) => s + m.mastery, 0) / MODULES.length);
const completed = MODULES.filter((m) => m.mastery >= 100).length;
const earned = BADGES.filter((b) => b.earned).length;

export function Progress() {
  return (
    <div className="practice ds-root" data-rt="eventloop">
      <div className="practice__head">
        <div>
          <div className="practice__eyebrow">Practice</div>
          <h1 className="practice__title">Your progress</h1>
          <p className="practice__lead">
            Track how well you understand each part of the runtime. Mastery grows as you work
            through the explorers and challenges.
          </p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat" data-rt="eventloop">
          <div className="stat__num">{avg}%</div>
          <div className="stat__label">Overall mastery</div>
        </div>
        <div className="stat" data-rt="microtask">
          <div className="stat__num">{completed}<span className="stat__den">/{MODULES.length}</span></div>
          <div className="stat__label">Modules mastered</div>
        </div>
        <div className="stat" data-rt="websocket">
          <div className="stat__num">7<span className="stat__den"> days</span></div>
          <div className="stat__label">Current streak</div>
        </div>
        <div className="stat" data-rt="threadpool">
          <div className="stat__num">{earned}<span className="stat__den">/{BADGES.length}</span></div>
          <div className="stat__label">Badges earned</div>
        </div>
      </div>

      <section className="practice__section">
        <h2 className="practice__section-title">Mastery by module</h2>
        <div className="mastery">
          {MODULES.map((m) => (
            <Link key={m.to} to={m.to} className="mastery__row" data-rt={m.rt}>
              <span className="mastery__label">{m.label}</span>
              <span className="mastery__bar">
                <span className="mastery__fill" style={{ width: `${m.mastery}%` }} />
              </span>
              <span className="mastery__pct">{m.mastery}%</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="practice__section">
        <h2 className="practice__section-title">Badges</h2>
        <div className="badges">
          {BADGES.map((b) => (
            <div
              key={b.label}
              className={`badge${b.earned ? "" : " badge--locked"}`}
              data-rt={b.rt}
            >
              <span className="badge__glyph">{b.glyph}</span>
              <span className="badge__label">{b.label}</span>
              <span className="badge__hint">{b.hint}</span>
              <StatusBadge state={b.earned ? "completed" : "idle"} showMarker={false}>
                {b.earned ? "Earned" : "Locked"}
              </StatusBadge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
