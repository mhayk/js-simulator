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
  { to: "/learn", label: "Learn", glyph: "◵", section: "Main", soon: true },
  { to: "/playground", label: "Playground", glyph: "❯", section: "Main", soon: true },

  { to: "/event-loop", label: "Event Loop", glyph: "↻", rt: "eventloop", section: "Runtimes" },
  { to: "/browser", label: "Browser Runtime", glyph: "◈", rt: "webapi", section: "Runtimes", soon: true },
  { to: "/node", label: "Node.js Runtime", glyph: "◆", rt: "nodeapi", section: "Runtimes", soon: true },
  { to: "/compare", label: "Browser vs Node", glyph: "⇋", rt: "engine", section: "Runtimes", soon: true },

  { to: "/libuv", label: "libuv Thread Pool", glyph: "▦", rt: "threadpool", section: "Deep dives" },
  { to: "/network", label: "Network I/O", glyph: "≋", rt: "network", section: "Deep dives" },
  { to: "/websocket", label: "WebSocket", glyph: "⇄", rt: "websocket", section: "Deep dives" },
  { to: "/broadcast", label: "Broadcast & Rooms", glyph: "⋔", rt: "websocket", section: "Deep dives" },
  { to: "/streams", label: "Streams", glyph: "≈", rt: "streams", section: "Deep dives" },
  { to: "/backpressure", label: "Backpressure", glyph: "⊗", rt: "backpressure", section: "Deep dives" },
  { to: "/emitter", label: "EventEmitter", glyph: "⊹", rt: "emitter", section: "Deep dives" },
  { to: "/workers", label: "Worker Threads", glyph: "◑", rt: "worker", section: "Deep dives", soon: true },

  { to: "/challenges", label: "Challenges", glyph: "⚑", section: "Practice", soon: true },
  { to: "/progress", label: "Progress", glyph: "◔", section: "Practice", soon: true },
  { to: "/settings", label: "Settings", glyph: "⚙", section: "Practice" },
];

export const NAV_SECTIONS: NavItem["section"][] = [
  "Main",
  "Runtimes",
  "Deep dives",
  "Practice",
];
