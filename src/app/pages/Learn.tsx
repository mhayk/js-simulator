import { Link } from "react-router-dom";
import { StatusBadge } from "js-simulator";
import type { RuntimeCategory } from "js-simulator";
import "./practice.css";

interface Lesson {
  to: string;
  label: string;
  blurb: string;
  rt: RuntimeCategory;
  done?: boolean;
}

interface Track {
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

const TRACKS: Track[] = [
  {
    title: "1 · Foundations",
    subtitle: "Start here — how a single thread runs everything.",
    lessons: [
      { to: "/event-loop", label: "The Event Loop", blurb: "Call stack, tasks, microtasks and the loop that ties them together.", rt: "eventloop", done: true },
      { to: "/browser", label: "The Browser Runtime", blurb: "V8, Web APIs, the queues and the rendering pipeline as one picture.", rt: "webapi", done: true },
      { to: "/node", label: "The Node.js Runtime", blurb: "The same JS engine, plus libuv and a standard library.", rt: "nodeapi" },
      { to: "/compare", label: "Browser vs Node", blurb: "Where the two runtimes agree, and where they diverge.", rt: "engine" },
    ],
  },
  {
    title: "2 · Async I/O",
    subtitle: "How work leaves the main thread and comes back.",
    lessons: [
      { to: "/libuv", label: "libuv & the Thread Pool", blurb: "Why fs, crypto and DNS use a pool of 4 threads.", rt: "threadpool" },
      { to: "/network", label: "Network I/O", blurb: "Why sockets are watched by the OS, not the thread pool.", rt: "network" },
      { to: "/streams", label: "Streams", blurb: "Processing data in chunks instead of all at once.", rt: "streams" },
      { to: "/backpressure", label: "Backpressure", blurb: "What happens when the consumer can't keep up.", rt: "backpressure" },
    ],
  },
  {
    title: "3 · Real-time",
    subtitle: "Pushing data both ways, at scale.",
    lessons: [
      { to: "/websocket", label: "WebSocket", blurb: "The upgrade handshake and full-duplex messaging.", rt: "websocket" },
      { to: "/broadcast", label: "Broadcast & Rooms", blurb: "Fan-out to many clients, and grouping with rooms.", rt: "websocket" },
      { to: "/realtime", label: "Realtime protocols", blurb: "Polling vs SSE vs WebSocket vs Socket.IO.", rt: "network" },
      { to: "/scaling", label: "Scaling WebSockets", blurb: "Why local memory breaks across instances, and how pub/sub fixes it.", rt: "websocket" },
    ],
  },
  {
    title: "4 · Beyond the main thread",
    subtitle: "Events, and true parallelism.",
    lessons: [
      { to: "/emitter", label: "EventEmitter", blurb: "Synchronous pub/sub — the pattern under most of Node.", rt: "emitter" },
      { to: "/workers", label: "Worker Threads", blurb: "Real OS threads for CPU-bound work.", rt: "worker" },
      { to: "/rendering", label: "Rendering & the UI thread", blurb: "How long tasks drop frames and freeze the page.", rt: "rendering" },
    ],
  },
];

const total = TRACKS.reduce((s, t) => s + t.lessons.length, 0);
const done = TRACKS.reduce((s, t) => s + t.lessons.filter((l) => l.done).length, 0);

export function Learn() {
  return (
    <div className="practice ds-root" data-rt="microtask">
      <div className="practice__head">
        <div>
          <div className="practice__eyebrow">Guided path</div>
          <h1 className="practice__title">Learn the runtime</h1>
          <p className="practice__lead">
            A structured path from the event loop to real-time systems at scale. Each lesson is
            an interactive simulator — work through them in order, or jump to what you need.
          </p>
        </div>
        <div className="practice__score">
          <span className="practice__score-num">{done}</span>
          <span className="practice__score-den">/ {total}</span>
          <span className="practice__score-label">lessons done</span>
        </div>
      </div>

      {TRACKS.map((track) => (
        <section className="practice__section" key={track.title}>
          <h2 className="practice__section-title">{track.title}</h2>
          <p className="track__subtitle">{track.subtitle}</p>
          <div className="lessons">
            {track.lessons.map((lesson, i) => (
              <Link key={lesson.to} to={lesson.to} className="lesson" data-rt={lesson.rt}>
                <span className="lesson__index">{i + 1}</span>
                <span className="lesson__body">
                  <span className="lesson__title">
                    {lesson.label}
                    {lesson.done && (
                      <StatusBadge state="completed" showMarker={false}>
                        Done
                      </StatusBadge>
                    )}
                  </span>
                  <span className="lesson__blurb">{lesson.blurb}</span>
                </span>
                <span className="lesson__arrow" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
