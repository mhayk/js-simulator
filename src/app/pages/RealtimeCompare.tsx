import { Chip, ComparePage, Yes, No } from "../components/compare";
import type { CompareRow } from "../components/compare";

const COLUMNS = [
  { key: "poll", label: "Polling" },
  { key: "long", label: "Long polling" },
  { key: "sse", label: "SSE", rt: "network" as const },
  { key: "ws", label: "WebSocket", rt: "websocket" as const },
  { key: "io", label: "Socket.IO", rt: "websocket" as const },
];

const ROWS: CompareRow[] = [
  {
    label: "Direction",
    cells: {
      poll: "client → server (repeated)",
      long: "request / delayed response",
      sse: "server → client (1-way)",
      ws: "bidirectional",
      io: "bidirectional",
    },
  },
  {
    label: "Persistent",
    cells: { poll: <No />, long: "held open per request", sse: <Yes />, ws: <Yes />, io: <Yes /> },
  },
  {
    label: "Latency",
    cells: { poll: "high (interval)", long: "medium", sse: "low", ws: "lowest", io: "low" },
  },
  {
    label: "Reconnect",
    cells: { poll: "—", long: "manual", sse: <span><Yes /> built-in</span>, ws: "manual", io: <span><Yes /> automatic</span> },
  },
  {
    label: "Browser API",
    cells: {
      poll: <Chip>fetch</Chip>,
      long: <Chip>fetch</Chip>,
      sse: <Chip rt="network">EventSource</Chip>,
      ws: <Chip rt="websocket">WebSocket</Chip>,
      io: <Chip rt="websocket">socket.io-client</Chip>,
    },
  },
  {
    label: "Overhead",
    cells: { poll: "high (headers each poll)", long: "medium", sse: "low", ws: "low", io: "low + protocol" },
  },
  {
    label: "Extras",
    cells: { poll: "—", long: "—", sse: "auto-reconnect, event IDs", ws: "raw frames", io: "rooms, acks, fallback, adapters" },
  },
];

export function RealtimeCompare() {
  return (
    <ComparePage
      eyebrow="Real-time communication"
      title="WebSocket vs SSE vs Polling"
      category="websocket"
      lead="Four ways to push data to a browser, from simplest to most capable. Pick the least complex option that meets your latency and directionality needs."
      columns={COLUMNS}
      rows={ROWS}
    >
      <div className="cmp__cards">
        <div className="cmp__when" data-rt="taskqueue">
          <h3>Use polling when…</h3>
          <p>Updates are infrequent and staleness of a few seconds is fine — a dashboard that refreshes status, or a fallback for restricted networks.</p>
        </div>
        <div className="cmp__when" data-rt="network">
          <h3>Use SSE when…</h3>
          <p>You only need <strong>server → client</strong> streaming: live feeds, notifications, log tailing. It runs over plain HTTP and auto-reconnects for free.</p>
        </div>
        <div className="cmp__when" data-rt="websocket">
          <h3>Use WebSocket when…</h3>
          <p>You need low-latency <strong>bidirectional</strong> messaging: chat, multiplayer games, collaborative editing, live cursors.</p>
        </div>
        <div className="cmp__when" data-rt="websocket">
          <h3>Use Socket.IO when…</h3>
          <p>You want WebSocket <em>plus</em> reconnection, acknowledgements, rooms, namespaces and a polling fallback — and you can accept its non-standard protocol.</p>
        </div>
      </div>
    </ComparePage>
  );
}
