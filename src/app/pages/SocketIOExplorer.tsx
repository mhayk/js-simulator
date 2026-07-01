import { Chip, ComparePage, No, Yes } from "../components/compare";
import type { CompareRow } from "../components/compare";

const COLUMNS = [
  { key: "ws", label: "Raw WebSocket", rt: "websocket" as const },
  { key: "io", label: "Socket.IO", rt: "websocket" as const },
];

const ROWS: CompareRow[] = [
  { label: "Transport", cells: { ws: "WebSocket only", io: "WebSocket, with HTTP long-poll fallback" } },
  { label: "Protocol", cells: { ws: "RFC 6455 (standard)", io: <span>custom framing on top <span className="cmp__cell-sub">not interoperable with a raw ws server</span></span> } },
  { label: "Reconnection", cells: { ws: <span><No /> manual</span>, io: <span><Yes /> automatic with backoff</span> } },
  { label: "Acknowledgements", cells: { ws: <No />, io: <span><Yes /> callback per emit</span> } },
  { label: "Rooms", cells: { ws: <span><No /> DIY</span>, io: <Chip rt="websocket">socket.join('room')</Chip> } },
  { label: "Namespaces", cells: { ws: <No />, io: <Chip rt="websocket">io.of('/admin')</Chip> } },
  { label: "Broadcast", cells: { ws: "loop over sockets", io: <Chip rt="websocket">io.to(room).emit()</Chip> } },
  { label: "Multi-instance", cells: { ws: "build your own", io: <Chip rt="backpressure">Redis / other adapters</Chip> } },
  { label: "Message types", cells: { ws: "text / binary frames", io: "named events + JSON + binary" } },
];

export function SocketIOExplorer() {
  return (
    <ComparePage
      eyebrow="Real-time communication"
      title="Socket.IO"
      category="websocket"
      lead="Socket.IO is a library built ON TOP of WebSocket — not the same thing. It adds reconnection, acknowledgements, rooms, namespaces and transport fallback, at the cost of a non-standard protocol you must use on both ends."
      columns={COLUMNS}
      rows={ROWS}
    >
      <div className="cmp__cards">
        <div className="cmp__when" data-rt="backpressure">
          <h3>Not a drop-in WebSocket</h3>
          <p>A Socket.IO client can't talk to a bare `ws` server, and vice-versa — the framing differs. Choose one for both ends.</p>
        </div>
        <div className="cmp__when" data-rt="websocket">
          <h3>What you get for free</h3>
          <ul>
            <li>Automatic reconnection with backoff</li>
            <li>Per-message acknowledgements (callbacks)</li>
            <li>Rooms &amp; namespaces for grouping</li>
            <li>Broadcast helpers (`io.to(room).emit`)</li>
            <li>HTTP long-polling fallback</li>
          </ul>
        </div>
        <div className="cmp__when" data-rt="threadpool">
          <h3>Scaling it</h3>
          <p>Across multiple Node instances, an adapter (commonly Redis pub/sub) synchronizes rooms and broadcasts so a message reaches clients on every instance. See the WebSocket Scaling screen.</p>
        </div>
      </div>
    </ComparePage>
  );
}
