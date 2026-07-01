/**
 * Pre-computed execution traces for the Playground. Each snippet is stepped
 * by hand so the visualization is exact — no in-browser JS engine required.
 */

export interface TraceStep {
  /** 1-based line highlighted in the source. */
  line: number;
  /** Call stack, bottom → top. */
  stack: string[];
  /** Microtask queue (front → back). */
  micro: string[];
  /** Macrotask (task) queue (front → back). */
  macro: string[];
  /** Console output accumulated so far. */
  out: string[];
  /** What's happening this step. */
  note: string;
}

export interface Snippet {
  id: string;
  label: string;
  code: string;
  steps: TraceStep[];
}

export const SNIPPETS: Snippet[] = [
  {
    id: "micro-macro",
    label: "Micro vs macro",
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
    steps: [
      {
        line: 1,
        stack: ['console.log("A")'],
        micro: [],
        macro: [],
        out: ["A"],
        note: 'console.log("A") runs synchronously and prints A.',
      },
      {
        line: 2,
        stack: ["setTimeout(…)"],
        micro: [],
        macro: ["B — timer"],
        out: ["A"],
        note: "setTimeout hands its callback to a Web API timer. When it fires, the callback is queued as a macrotask.",
      },
      {
        line: 3,
        stack: ["Promise.then(…)"],
        micro: ["C — promise"],
        macro: ["B — timer"],
        out: ["A"],
        note: "Promise.resolve().then schedules its callback on the microtask queue.",
      },
      {
        line: 4,
        stack: ['console.log("D")'],
        micro: ["C — promise"],
        macro: ["B — timer"],
        out: ["A", "D"],
        note: 'console.log("D") prints D. Synchronous code is now finished and the call stack empties.',
      },
      {
        line: 3,
        stack: ['() => console.log("C")'],
        micro: [],
        macro: ["B — timer"],
        out: ["A", "D", "C"],
        note: "Stack empty → the event loop drains ALL microtasks before any macrotask. C prints.",
      },
      {
        line: 2,
        stack: ['() => console.log("B")'],
        micro: [],
        macro: [],
        out: ["A", "D", "C", "B"],
        note: "Now one macrotask runs — the timer callback. B prints. Final order: A, D, C, B.",
      },
    ],
  },
  {
    id: "async-await",
    label: "async / await",
    code: `async function run() {
  console.log(1);
  await null;
  console.log(2);
}
console.log(0);
run();
console.log(3);`,
    steps: [
      {
        line: 6,
        stack: ["console.log(0)"],
        micro: [],
        macro: [],
        out: ["0"],
        note: "Top-level code runs first: prints 0.",
      },
      {
        line: 2,
        stack: ["run()", "console.log(1)"],
        micro: [],
        macro: [],
        out: ["0", "1"],
        note: "run() is called and executes synchronously up to the first await. Prints 1.",
      },
      {
        line: 3,
        stack: ["run()"],
        micro: ["resume run()"],
        macro: [],
        out: ["0", "1"],
        note: "await null suspends run(); everything after the await is scheduled as a microtask. Control returns to the caller.",
      },
      {
        line: 8,
        stack: ["console.log(3)"],
        micro: ["resume run()"],
        macro: [],
        out: ["0", "1", "3"],
        note: "Back in top-level code: prints 3. Synchronous execution finishes and the stack empties.",
      },
      {
        line: 4,
        stack: ["run() ⟳", "console.log(2)"],
        micro: [],
        macro: [],
        out: ["0", "1", "3", "2"],
        note: "Stack empty → the microtask resumes run() after the await. Prints 2. Final order: 0, 1, 3, 2.",
      },
    ],
  },
  {
    id: "loop-order",
    label: "Loop + timers",
    code: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log("t" + i), 0);
}
queueMicrotask(() => console.log("micro"));
console.log("sync");`,
    steps: [
      {
        line: 2,
        stack: ["setTimeout(…) ×3"],
        micro: [],
        macro: ["t0", "t1", "t2"],
        out: [],
        note: "The loop runs synchronously, scheduling three timer callbacks. `let` gives each its own i, so they capture 0, 1, 2.",
      },
      {
        line: 4,
        stack: ["queueMicrotask(…)"],
        micro: ["micro"],
        macro: ["t0", "t1", "t2"],
        out: [],
        note: "queueMicrotask adds one microtask behind the timers already waiting.",
      },
      {
        line: 5,
        stack: ['console.log("sync")'],
        micro: ["micro"],
        macro: ["t0", "t1", "t2"],
        out: ["sync"],
        note: 'console.log("sync") prints. Synchronous code is done.',
      },
      {
        line: 4,
        stack: ['() => console.log("micro")'],
        micro: [],
        macro: ["t0", "t1", "t2"],
        out: ["sync", "micro"],
        note: "Microtasks drain first: micro prints before any timer.",
      },
      {
        line: 2,
        stack: ['() => console.log("t0")'],
        micro: [],
        macro: ["t1", "t2"],
        out: ["sync", "micro", "t0"],
        note: "Now the macrotasks run one at a time, in order: t0.",
      },
      {
        line: 2,
        stack: ['() => console.log("t1")'],
        micro: [],
        macro: ["t2"],
        out: ["sync", "micro", "t0", "t1"],
        note: "Next loop turn: t1.",
      },
      {
        line: 2,
        stack: ['() => console.log("t2")'],
        micro: [],
        macro: [],
        out: ["sync", "micro", "t0", "t1", "t2"],
        note: "Last timer: t2. Final order: sync, micro, t0, t1, t2.",
      },
    ],
  },
];
