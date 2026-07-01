import { RuntimeMap } from "../components/runtimeMap";
import type { MapGroup } from "../components/runtimeMap";

const GROUPS: MapGroup[] = [
  {
    title: "Your code runs here",
    items: [
      {
        category: "engine",
        label: "V8 Engine",
        sub: "parses & runs JS",
        detail: {
          what: "Parses your JavaScript, compiles it to bytecode, JIT-optimizes hot paths, executes it and garbage-collects. It is single-threaded for your code.",
          example: "Chrome & Edge embed V8; Firefox uses SpiderMonkey; Safari uses JavaScriptCore.",
          gotcha: "One thread means one long synchronous loop freezes the whole tab — including rendering.",
          related: "Feeds the Call Stack; allocates into the Memory Heap.",
        },
      },
      {
        category: "callstack",
        detail: {
          what: "A LIFO stack of the function calls currently executing. The engine pushes a frame on call and pops it on return.",
          example: "a() calls b() → stack is [a, b]; b returns → [a].",
          gotcha: "Unbounded recursion overflows it → 'Maximum call stack size exceeded'.",
          related: "The Event Loop only pushes a queued callback when this is empty.",
        },
      },
      {
        category: "heap",
        detail: {
          what: "The unstructured memory region where objects, arrays and closures live. Reachable values survive; the rest are garbage-collected.",
          gotcha: "Lingering references (globals, forgotten listeners, closures) cause memory leaks the GC can't reclaim.",
        },
      },
    ],
  },
  {
    title: "Capabilities the browser lends you",
    items: [
      { category: "webapi", label: "setTimeout / setInterval", sub: "timers", detail: {
        what: "The browser starts a timer off-thread; when it expires it queues your callback as a macrotask.",
        example: "setTimeout(fn, 0) still waits for the stack to clear and microtasks to drain.",
        gotcha: "The delay is a minimum, not a guarantee — a busy stack pushes it later.",
        related: "Callback lands in the Task Queue.",
      } },
      { category: "webapi", label: "fetch / XHR", sub: "network", detail: {
        what: "Hands the request to the browser's networking stack; resolves a Promise when the response arrives.",
        gotcha: "Its .then runs as a microtask, so it can jump ahead of an earlier setTimeout(0).",
        related: "Resolution schedules onto the Microtask Queue.",
      } },
      { category: "webapi", label: "DOM & Events", sub: "document", detail: {
        what: "The document tree plus addEventListener. User events (click, input) queue their handlers as tasks.",
        related: "Handler callbacks enter the Task Queue.",
      } },
      { category: "websocket", detail: {
        what: "A persistent full-duplex TCP connection. Incoming messages fire onmessage as tasks.",
        related: "See the WebSocket Explorer.",
      } },
      { category: "webapi", label: "requestAnimationFrame", sub: "pre-paint", detail: {
        what: "Schedules a callback to run right before the next repaint — the correct place for visual updates.",
        gotcha: "Not a task or microtask; it runs in the render steps, throttled to the display refresh (~60fps).",
        related: "Runs just before the Rendering Pipeline.",
      } },
      { category: "webapi", label: "Observers", sub: "IntersectionObserver…", detail: {
        what: "IntersectionObserver, MutationObserver, ResizeObserver batch notifications instead of firing per-event.",
      } },
    ],
  },
  {
    title: "The scheduler",
    items: [
      { category: "eventloop", detail: {
        what: "The loop that, whenever the Call Stack is empty, drains ALL microtasks, then takes ONE macrotask, then lets the browser render.",
        example: "stack empty → run every microtask → one task → maybe paint → repeat.",
        gotcha: "An endless stream of microtasks starves rendering and tasks — the tab hangs.",
      } },
      { category: "microtask", detail: {
        what: "Promise callbacks and queueMicrotask. Drained completely before the next macrotask or paint.",
        example: "Promise.resolve().then(...) always runs before a setTimeout(0) queued at the same time.",
      } },
      { category: "taskqueue", label: "Task Queue (macrotasks)", detail: {
        what: "Timers, I/O, DOM events. The loop takes exactly one per turn, then drains microtasks again.",
      } },
    ],
  },
  {
    title: "Putting pixels on screen",
    items: [
      { category: "rendering", label: "Style → Layout → Paint → Composite", detail: {
        what: "Between task turns the browser recalculates styles, computes geometry (layout), rasterizes (paint) and composites layers on the GPU.",
        gotcha: "Reading layout (offsetWidth) right after writing it forces a synchronous reflow — layout thrashing.",
        related: "Kicked off after tasks/microtasks, aligned with requestAnimationFrame.",
      } },
      { category: "os", label: "Operating System", detail: {
        what: "Underneath it all: the OS provides the network sockets, timers and GPU the browser drives.",
      } },
    ],
  },
];

export function BrowserRuntime() {
  return (
    <RuntimeMap
      eyebrow="Runtime overview"
      title="Browser Runtime"
      accent="webapi"
      lead="How a browser actually runs your JavaScript: V8 executes your code on a single thread, the browser lends async capabilities (Web APIs), the event loop schedules their callbacks through the microtask and task queues, and the rendering pipeline paints between turns. Click any block to inspect it."
      groups={GROUPS}
    />
  );
}
