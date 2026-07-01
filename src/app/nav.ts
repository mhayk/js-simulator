import type { RuntimeCategory } from "js-simulator";

export interface NavItem {
  to: string;
  label: string;
  glyph: string;
  /** Optional runtime category for the icon tint. */
  rt?: RuntimeCategory;
  /** Grouping section in the sidebar. */
  section: "Main" | "Runtimes" | "Deep dives" | "Practice";
  /** Not yet built — shown as a "coming soon" placeholder page. */
  soon?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", glyph: "◧", section: "Main" },
  { to: "/learn", label: "Learn", glyph: "◵", section: "Main" },
  { to: "/playground", label: "Playground", glyph: "❯", section: "Main" },

  { to: "/event-loop", label: "Event Loop", glyph: "↻", rt: "eventloop", section: "Runtimes" },
  { to: "/browser", label: "Browser Runtime", glyph: "◈", rt: "webapi", section: "Runtimes" },
  { to: "/node", label: "Node.js Runtime", glyph: "◆", rt: "nodeapi", section: "Runtimes" },
  { to: "/compare", label: "Browser vs Node", glyph: "⇋", rt: "engine", section: "Runtimes" },
  { to: "/rendering", label: "Rendering & UI", glyph: "▧", rt: "rendering", section: "Runtimes" },

  { to: "/libuv", label: "libuv Thread Pool", glyph: "▦", rt: "threadpool", section: "Deep dives" },
  { to: "/network", label: "Network I/O", glyph: "≋", rt: "network", section: "Deep dives" },
  { to: "/websocket", label: "WebSocket", glyph: "⇄", rt: "websocket", section: "Deep dives" },
  { to: "/broadcast", label: "Broadcast & Rooms", glyph: "⋔", rt: "websocket", section: "Deep dives" },
  { to: "/streams", label: "Streams", glyph: "≈", rt: "streams", section: "Deep dives" },
  { to: "/backpressure", label: "Backpressure", glyph: "⊗", rt: "backpressure", section: "Deep dives" },
  { to: "/emitter", label: "EventEmitter", glyph: "⊹", rt: "emitter", section: "Deep dives" },
  { to: "/workers", label: "Worker Threads", glyph: "◑", rt: "worker", section: "Deep dives" },
  { to: "/realtime", label: "Realtime protocols", glyph: "⇌", rt: "network", section: "Deep dives" },
  { to: "/socketio", label: "Socket.IO", glyph: "◎", rt: "websocket", section: "Deep dives" },
  { to: "/scaling", label: "WebSocket Scaling", glyph: "⤨", rt: "websocket", section: "Deep dives" },

  { to: "/challenges", label: "Challenges", glyph: "⚑", section: "Practice" },
  { to: "/progress", label: "Progress", glyph: "◔", section: "Practice" },
  { to: "/settings", label: "Settings", glyph: "⚙", section: "Practice" },
];

export const NAV_SECTIONS: NavItem["section"][] = [
  "Main",
  "Runtimes",
  "Deep dives",
  "Practice",
];
