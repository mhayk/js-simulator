/**
 * The runtime vocabulary — the set of internal components the simulator
 * visualizes, each with a stable colour category, a short glyph (a second,
 * non-colour signal), and who provides it. Consumed by RuntimeNode,
 * MessageToken, StatusBadge, and the diagram layers.
 */

export type RuntimeCategory =
  | "callstack"
  | "heap"
  | "webapi"
  | "nodeapi"
  | "taskqueue"
  | "microtask"
  | "eventloop"
  | "libuv"
  | "threadpool"
  | "os"
  | "rendering"
  | "network"
  | "websocket"
  | "emitter"
  | "streams"
  | "backpressure"
  | "worker"
  | "engine";

/** Who provides a given capability — a first-class educational answer. */
export type Provider =
  | "JavaScript"
  | "Engine"
  | "Browser"
  | "Node.js"
  | "libuv"
  | "OS";

export interface RuntimeCategoryMeta {
  label: string;
  /** Short text glyph — a non-colour identifier shown alongside the label. */
  glyph: string;
  provider: Provider;
  blurb: string;
}

export const RUNTIME_CATEGORIES: Record<RuntimeCategory, RuntimeCategoryMeta> = {
  callstack: {
    label: "Call Stack",
    glyph: "≡",
    provider: "Engine",
    blurb: "LIFO stack of function execution contexts currently running.",
  },
  heap: {
    label: "Memory Heap",
    glyph: "▤",
    provider: "Engine",
    blurb: "Unstructured region where objects and closures are allocated.",
  },
  webapi: {
    label: "Web APIs",
    glyph: "◈",
    provider: "Browser",
    blurb: "Browser-provided async capabilities: timers, fetch, DOM, observers.",
  },
  nodeapi: {
    label: "Node.js APIs",
    glyph: "◆",
    provider: "Node.js",
    blurb: "Node bindings: fs, net, crypto, timers, streams, events.",
  },
  taskqueue: {
    label: "Task Queue",
    glyph: "▷",
    provider: "Engine",
    blurb: "Macrotask queue — timers, I/O callbacks, drained one per loop turn.",
  },
  microtask: {
    label: "Microtask Queue",
    glyph: "•",
    provider: "Engine",
    blurb: "Promise reactions & queueMicrotask — drained fully before the next task.",
  },
  eventloop: {
    label: "Event Loop",
    glyph: "↻",
    provider: "Engine",
    blurb: "Moves callbacks to the Call Stack when it is empty.",
  },
  libuv: {
    label: "libuv",
    glyph: "⌘",
    provider: "libuv",
    blurb: "Node's async I/O layer: event loop phases + thread pool.",
  },
  threadpool: {
    label: "Thread Pool",
    glyph: "▦",
    provider: "libuv",
    blurb: "Worker threads for fs, crypto, DNS, compression (default 4).",
  },
  os: {
    label: "Operating System",
    glyph: "▢",
    provider: "OS",
    blurb: "Kernel services: sockets, files, timers, epoll/kqueue/IOCP.",
  },
  rendering: {
    label: "Rendering Pipeline",
    glyph: "▧",
    provider: "Browser",
    blurb: "Style → Layout → Paint → Composite, between task turns.",
  },
  network: {
    label: "Network I/O",
    glyph: "≋",
    provider: "OS",
    blurb: "Socket readiness watched by the OS, surfaced to libuv — not the pool.",
  },
  websocket: {
    label: "WebSocket",
    glyph: "⇄",
    provider: "Browser",
    blurb: "Persistent full-duplex connection over a single TCP socket.",
  },
  emitter: {
    label: "EventEmitter",
    glyph: "⊹",
    provider: "Node.js",
    blurb: "Synchronous publish/subscribe — listeners called in order on emit.",
  },
  streams: {
    label: "Streams",
    glyph: "≈",
    provider: "Node.js",
    blurb: "Chunked data processing without loading everything into memory.",
  },
  backpressure: {
    label: "Backpressure",
    glyph: "⊗",
    provider: "Node.js",
    blurb: "Producer slows when the consumer's buffer fills; resumes on drain.",
  },
  worker: {
    label: "Worker Threads",
    glyph: "◑",
    provider: "Node.js",
    blurb: "Real OS threads for CPU-bound work, isolated V8 + message passing.",
  },
  engine: {
    label: "JavaScript Engine",
    glyph: "⚙",
    provider: "Engine",
    blurb: "V8/SpiderMonkey: parse, interpret, JIT-compile, run, GC.",
  },
};

export const RUNTIME_CATEGORY_KEYS = Object.keys(
  RUNTIME_CATEGORIES,
) as RuntimeCategory[];
