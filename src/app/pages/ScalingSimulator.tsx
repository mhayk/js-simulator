import { useState } from "react";
import { SegmentedControl, StatusBadge } from "js-simulator";
import "./ScalingSimulator.css";

type Mode = "local" | "redis";

export function ScalingSimulator() {
  const [mode, setMode] = useState<Mode>("local");
  const redis = mode === "redis";

  // Client A is on instance 1 and broadcasts. Client B is on instance 2.
  // Local memory: B never sees it. Redis pub/sub: B receives it.
  return (
    <div className="scale ds-root" data-rt="websocket">
      <div className="scale__head">
        <div className="scale__head-main">
          <div className="scale__eyebrow">Real-time communication</div>
          <h1 className="scale__title">WebSocket Scaling</h1>
          <p className="scale__lead">
            One server holds every socket in local memory, so a broadcast reaches everyone. Add
            a second instance behind a load balancer and that breaks: each instance only knows
            its own sockets. A message bus fixes it.
          </p>
        </div>
        <SegmentedControl<Mode>
          aria-label="Architecture"
          value={mode}
          onChange={setMode}
          options={[
            { label: "Local memory", value: "local", rt: "backpressure" },
            { label: "Redis pub/sub", value: "redis", rt: "websocket" },
          ]}
        />
      </div>

      <div className="scale__diagram">
        <div className="scale__row scale__row--2">
          <div className="scale__box scale__box--active" data-rt="websocket">
            <div className="scale__box-title">Client A</div>
            <div className="scale__box-sub">connected to Instance 1 · emits “hello all”</div>
            <div style={{ marginTop: 8 }}>
              <StatusBadge state="active">broadcasting</StatusBadge>
            </div>
          </div>
          <div className={`scale__box ${redis ? "scale__box--recv" : "scale__box--miss"}`} data-rt="websocket">
            <div className="scale__box-title">Client B</div>
            <div className="scale__box-sub">
              connected to Instance 2 · {redis ? "receives the broadcast ✓" : "never sees it ✕"}
            </div>
            <div style={{ marginTop: 8 }}>
              <StatusBadge state={redis ? "completed" : "blocked"}>
                {redis ? "delivered" : "missed"}
              </StatusBadge>
            </div>
          </div>
        </div>

        <div className="scale__connector">↕ sticky sessions keep each client pinned to one instance ↕</div>

        <div className="scale__box" data-rt="os">
          <div className="scale__box-title">Load balancer</div>
          <div className="scale__box-sub">routes new connections; sticky sessions pin each socket to an instance</div>
        </div>

        <div className="scale__connector">↓</div>

        <div className="scale__row scale__row--2">
          <div className="scale__box scale__box--active" data-rt="nodeapi">
            <div className="scale__box-title">Node instance 1</div>
            <div className="scale__box-sub">
              holds socket A{redis ? " · publishes to Redis" : " · broadcasts to its local sockets only"}
            </div>
          </div>
          <div className={`scale__box ${redis ? "scale__box--active" : "scale__box--dim"}`} data-rt="nodeapi">
            <div className="scale__box-title">Node instance 2</div>
            <div className="scale__box-sub">
              holds socket B{redis ? " · gets the event from Redis, emits to B" : " · never hears about A’s message"}
            </div>
          </div>
        </div>

        <div className="scale__connector">{redis ? "↓ publish / subscribe ↓" : "✕ no shared channel ✕"}</div>

        <div className={`scale__box scale__redis ${redis ? "scale__box--active" : "scale__box--dim"}`} data-rt="backpressure">
          <div className="scale__box-title">Redis Pub/Sub {redis ? "" : "(not present)"}</div>
          <div className="scale__box-sub">
            {redis
              ? "instance 1 PUBLISHes the event; every instance SUBSCRIBEs and re-emits to its own clients"
              : "without a shared bus, instances can't see each other's broadcasts"}
          </div>
        </div>
      </div>

      <div className="scale__verdict" data-rt={redis ? "websocket" : "backpressure"}>
        {redis ? (
          <span>
            <strong>Works.</strong> Instance 1 publishes A’s message to Redis; both instances are
            subscribed, so instance 2 re-emits it to Client B. This is exactly what the Socket.IO
            Redis adapter (or a broker like NATS/Kafka) does. Watch for <strong>duplicate
            delivery</strong> and keep operations <strong>idempotent</strong>.
          </span>
        ) : (
          <span>
            <strong>Broken at scale.</strong> Local memory only knows the sockets on THIS instance,
            so Client B on instance 2 never receives A’s broadcast. Sticky sessions keep a
            connection stable but do <em>not</em> solve cross-instance fan-out — you need a
            pub/sub bus.
          </span>
        )}
      </div>
    </div>
  );
}
