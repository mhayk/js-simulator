import { RuntimeMap } from "../components/runtimeMap";
import type { MapGroup } from "../components/runtimeMap";

const GROUPS: MapGroup[] = [
  {
    title: "Your code runs here",
    items: [
      {
        category: "engine",
        label: "V8 Engine",
        sub: "same engine as Chrome",
        detail: {
          what: "Node embeds Google's V8 to parse, compile and run your JavaScript on a single main thread.",
          gotcha: "A CPU-bound loop on this thread blocks every connection — offload it to Worker Threads or the thread pool.",
          related: "Feeds the Call Stack; Node's C++ bindings expose extra APIs to it.",
        },
      },
      { category: "callstack", detail: {
        what: "LIFO stack of executing function frames, exactly as in the browser.",
        gotcha: "Deep recursion overflows it; async work must yield to the loop instead of blocking here.",
      } },
      { category: "heap", detail: {
        what: "V8's managed memory for objects and buffers. Node adds off-heap Buffers for binary I/O.",
        gotcha: "Default heap is ~1.5–4GB; --max-old-space-size raises it. Buffers live outside the V8 heap.",
      } },
    ],
  },
  {
    title: "What Node adds on top of V8",
    items: [
      { category: "nodeapi", label: "fs", sub: "file system", detail: {
        what: "File operations. Async fs calls are handed to libuv's thread pool because the OS has no async file API on most platforms.",
        gotcha: "fs.readFileSync blocks the whole event loop — avoid it in servers.",
        related: "Runs on the Thread Pool.",
      } },
      { category: "network", label: "net / http", sub: "sockets", detail: {
        what: "TCP/HTTP servers and clients. Socket readiness is watched by the OS (epoll/kqueue/IOCP), NOT the thread pool.",
        related: "Surfaced to libuv via the OS polling mechanism.",
      } },
      { category: "nodeapi", label: "crypto", sub: "hashing/ciphers", detail: {
        what: "Hashing, encryption, key derivation. The expensive async ones (pbkdf2, randomBytes) run on the thread pool.",
        gotcha: "Heavy crypto can saturate the 4-thread pool and stall unrelated fs/dns work.",
        related: "Runs on the Thread Pool.",
      } },
      { category: "emitter", detail: {
        what: "The pub/sub base class most Node objects extend. emit() calls listeners synchronously, in registration order.",
        related: "See the EventEmitter Explorer.",
      } },
      { category: "streams", detail: {
        what: "Readable/Writable/Transform streams process data in chunks with built-in backpressure.",
        related: "See the Streams & Backpressure screen.",
      } },
      { category: "worker", label: "Worker Threads", detail: {
        what: "Real OS threads with isolated V8 instances for CPU-bound work, communicating by message passing.",
        related: "See the Worker Threads Explorer.",
      } },
    ],
  },
  {
    title: "libuv — the async engine",
    items: [
      { category: "libuv", label: "Event Loop phases", detail: {
        what: "libuv's loop runs ordered phases each turn: timers → pending → poll (I/O) → check (setImmediate) → close.",
        example: "setImmediate fires in 'check'; setTimeout(0) in 'timers' — order depends on the phase you're in.",
        gotcha: "process.nextTick and Promise microtasks run BETWEEN every phase, before the loop moves on.",
      } },
      { category: "microtask", label: "nextTick & microtasks", detail: {
        what: "process.nextTick queue drains first, then the Promise microtask queue — both between each libuv phase.",
        gotcha: "Recursive process.nextTick starves the event loop entirely.",
      } },
      { category: "threadpool", detail: {
        what: "A pool of worker threads (default 4, UV_THREADPOOL_SIZE up to 1024) for work with no async OS primitive: fs, dns.lookup, crypto, zlib.",
        gotcha: "Network sockets do NOT use it — that's a common misconception. Only fs/dns/crypto/zlib do.",
        related: "Feeds results back to the poll phase.",
      } },
      { category: "network", label: "OS polling", sub: "epoll/kqueue/IOCP", detail: {
        what: "For sockets, libuv asks the OS kernel to watch many file descriptors at once and tell it which are ready — scalable I/O without a thread each.",
        related: "Drives the poll phase of the event loop.",
      } },
    ],
  },
  {
    title: "The machine underneath",
    items: [
      { category: "os", label: "Operating System / Kernel", detail: {
        what: "Provides sockets, the file system, timers and the readiness-notification syscalls (epoll on Linux, kqueue on macOS/BSD, IOCP on Windows) that make libuv efficient.",
      } },
    ],
  },
];

export function NodeRuntime() {
  return (
    <RuntimeMap
      eyebrow="Runtime overview"
      title="Node.js Runtime"
      accent="nodeapi"
      lead="Node.js is V8 plus libuv plus a standard library. Your JS runs single-threaded on V8; Node's APIs delegate async work to libuv, which uses OS polling for sockets and a small thread pool for fs, dns, crypto and zlib. Click any block to inspect it."
      groups={GROUPS}
    />
  );
}
