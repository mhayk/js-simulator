import { Chip, ComparePage, No, Yes } from "../components/compare";
import type { CompareRow } from "../components/compare";

const COLUMNS = [
  { key: "browser", label: "Browser", rt: "webapi" as const },
  { key: "node", label: "Node.js", rt: "nodeapi" as const },
];

const ROWS: CompareRow[] = [
  {
    label: "JS engine",
    cells: {
      browser: (
        <span>
          <strong>V8</strong> (Chrome), SpiderMonkey (Firefox), JavaScriptCore (Safari)
          <span className="cmp__cell-sub">runs your JS; provides Call Stack + Heap</span>
        </span>
      ),
      node: (
        <span>
          <strong>V8</strong>
          <span className="cmp__cell-sub">same engine as Chrome</span>
        </span>
      ),
    },
  },
  {
    label: "Async APIs",
    cells: {
      browser: (
        <>
          <Chip rt="webapi">setTimeout</Chip>
          <Chip rt="webapi">fetch</Chip>
          <Chip rt="webapi">DOM events</Chip>
          <Chip rt="webapi">WebSocket</Chip>
        </>
      ),
      node: (
        <>
          <Chip rt="nodeapi">fs</Chip>
          <Chip rt="nodeapi">net</Chip>
          <Chip rt="nodeapi">timers</Chip>
          <Chip rt="nodeapi">crypto</Chip>
        </>
      ),
    },
  },
  {
    label: "Event loop",
    cells: {
      browser: (
        <span>
          <strong>HTML spec loop</strong>
          <span className="cmp__cell-sub">one task → drain microtasks → render</span>
        </span>
      ),
      node: (
        <span>
          <strong>libuv phases</strong>
          <span className="cmp__cell-sub">timers → poll → check → close</span>
        </span>
      ),
    },
  },
  {
    label: "Microtasks",
    cells: {
      browser: (
        <>
          <Chip rt="microtask">Promises</Chip>
          <Chip rt="microtask">queueMicrotask</Chip>
          <Chip rt="microtask">MutationObserver</Chip>
        </>
      ),
      node: (
        <>
          <Chip rt="microtask">Promises</Chip>
          <Chip rt="microtask">queueMicrotask</Chip>
          <Chip rt="microtask">process.nextTick</Chip>
        </>
      ),
    },
  },
  {
    label: "I/O layer",
    cells: {
      browser: <span>Browser networking layer <span className="cmp__cell-sub">sandboxed by the OS</span></span>,
      node: (
        <>
          <Chip rt="libuv">libuv</Chip>
          <Chip rt="threadpool">thread pool</Chip>
          <Chip rt="os">OS notifier</Chip>
        </>
      ),
    },
  },
  {
    label: "Rendering",
    cells: {
      browser: <span><Yes /> <span className="cmp__cell-sub">style → layout → paint → composite</span></span>,
      node: <No />,
    },
  },
  {
    label: "Extra scheduling",
    cells: {
      browser: <Chip rt="rendering">requestAnimationFrame</Chip>,
      node: <Chip rt="taskqueue">setImmediate</Chip>,
    },
  },
  {
    label: "Parallelism",
    cells: {
      browser: <Chip rt="worker">Web Workers</Chip>,
      node: (
        <>
          <Chip rt="worker">Worker Threads</Chip>
          <Chip rt="nodeapi">child_process</Chip>
          <Chip rt="nodeapi">cluster</Chip>
        </>
      ),
    },
  },
  {
    label: "File system",
    cells: { browser: <span><No /> <span className="cmp__cell-sub">sandboxed</span></span>, node: <Yes /> },
  },
];

export function CompareBrowserNode() {
  return (
    <ComparePage
      eyebrow="Runtimes"
      title="Browser vs Node.js"
      category="engine"
      lead="Both run JavaScript on V8-class engines with a single main thread and the same task/microtask model. What differs is everything AROUND the engine: which async APIs exist, how the event loop is structured, how I/O is done, and whether there's a screen to paint."
      columns={COLUMNS}
      rows={ROWS}
    >
      <div className="cmp__cards">
        <div className="cmp__when" data-rt="engine">
          <h3>Same in both</h3>
          <p>The language, V8, the Call Stack + Heap, single-threaded execution, and the microtasks-before-tasks ordering. `console.log('A'); Promise.then(...); setTimeout(...)` prints in the same order everywhere.</p>
        </div>
        <div className="cmp__when" data-rt="webapi">
          <h3>Only in the browser</h3>
          <p>The DOM, rendering pipeline, requestAnimationFrame, and Web APIs like fetch and MutationObserver. The event loop must also fit painting between tasks.</p>
        </div>
        <div className="cmp__when" data-rt="nodeapi">
          <h3>Only in Node.js</h3>
          <p>libuv with its phased event loop, the thread pool, file system, raw sockets, Streams, EventEmitter, process.nextTick and setImmediate.</p>
        </div>
      </div>
    </ComparePage>
  );
}
