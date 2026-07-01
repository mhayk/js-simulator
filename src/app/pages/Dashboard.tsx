import { Link } from "react-router-dom";
import { Button, Card, StatusBadge } from "js-simulator";
import { NAV_ITEMS } from "../nav";
import "./pages.css";

const FEATURED = NAV_ITEMS.filter(
  (i) => i.section === "Runtimes" || i.section === "Deep dives",
).slice(0, 8);

const DESCRIPTIONS: Record<string, string> = {
  "/event-loop": "Watch tasks, microtasks and callbacks move through the loop.",
  "/browser": "Web APIs, the DOM, rendering and the browser event loop.",
  "/node": "V8, libuv, the thread pool and the Event Loop phases.",
  "/compare": "The same code, side by side in browser and Node.js.",
  "/libuv": "How fs, crypto and DNS use the 4-thread pool.",
  "/network": "Why network I/O is watched by the OS, not the thread pool.",
  "/websocket": "The upgrade handshake and full-duplex messaging.",
  "/streams": "Chunked data and the internal buffer.",
};

export function Dashboard() {
  return (
    <div className="page ds-root">
      <section className="hero">
        <h1 className="hero__title">
          See how <span className="grad">JavaScript</span> actually runs.
        </h1>
        <p className="hero__lead">
          Write code, run the simulation and watch every callback, promise,
          timer, event and network operation move through the JavaScript
          runtime — step by step.
        </p>
        <div className="hero__cta">
          <Link to="/event-loop">
            <Button variant="primary" size="lg">
              Start simulating
            </Button>
          </Link>
          <Link to="/event-loop">
            <Button variant="secondary" size="lg">
              Explore the Event Loop
            </Button>
          </Link>
        </div>
      </section>

      <div className="page__head">
        <div className="page__eyebrow">Explore</div>
        <h2 className="page__title" style={{ fontSize: "var(--font-size-xl)" }}>
          Runtimes &amp; deep dives
        </h2>
      </div>

      <div className="card-grid">
        {FEATURED.map((item) => (
          <Link key={item.to} to={item.to} style={{ textDecoration: "none" }}>
            <Card interactive style={{ height: "100%" }}>
              <div className="nav-card" data-rt={item.rt}>
                <span className="nav-card__glyph" aria-hidden>
                  {item.glyph}
                </span>
                <span className="nav-card__title">
                  {item.label}{" "}
                  {item.soon && (
                    <StatusBadge state="idle" showMarker={false}>
                      Soon
                    </StatusBadge>
                  )}
                </span>
                <span className="nav-card__desc">
                  {DESCRIPTIONS[item.to] ?? "Interactive runtime visualization."}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
