import { Sim } from "./model";
import type { Scenario } from "./model";

/* ------------------------------------------------------------------ *
 * Browser: sync vs microtask vs task — the classic A / D / C / B      *
 * ------------------------------------------------------------------ */
function buildMicroVsTask(): Scenario {
  const code = `console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

console.log('D');`;

  const s = new Sim();

  s.pushCall({ id: "script", label: "(script)", kind: "call" });
  s.snap(
    "The global execution context is created and pushed onto the Call Stack. Execution runs top to bottom.",
    { note: "Everything starts on the single main thread — one Call Stack." },
  );

  s.at(1).pushCall({ id: "logA", label: "console.log('A')", kind: "call" });
  s.snap("Line 1 runs: `console.log('A')` is pushed onto the Call Stack.");

  s.log("A").popCall("logA");
  s.snap("'A' is printed and the call returns, leaving the Call Stack.", {
    note: "Synchronous code executes immediately, in order.",
  });

  s.at(3).pushCall({ id: "st", label: "setTimeout(cb, 0)", kind: "call" });
  s.snap("Line 3 calls `setTimeout` — a Web API provided by the browser.");

  s.toApi({ id: "B", label: "() => log('B')", kind: "timer", meta: "0 ms" });
  s.popCall("st");
  s.snap(
    "`setTimeout` hands the callback + timer to the Web APIs and returns at once. The timer counts down OUTSIDE the engine.",
    {
      note: "Timers are provided by the browser, not by JavaScript. The stack is free to continue.",
    },
  );

  s.at(5).pushCall({ id: "then", label: "Promise…then(cb)", kind: "call" });
  s.snap("Line 5: the promise is already resolved, and `.then` registers a reaction.");

  s.toMicro({ id: "C", label: "() => log('C')", kind: "microtask" });
  s.removeApi("B");
  s.toMacro({ id: "B", label: "() => log('B')", kind: "callback", meta: "timer" });
  s.popCall("then");
  s.snap(
    "The `.then` callback goes to the Microtask Queue. Meanwhile the 0 ms timer has elapsed, so its callback moves from Web APIs into the Task Queue.",
    {
      note: "0 ms is a MINIMUM delay, not a guarantee — the callback still has to wait for the stack to clear.",
    },
  );

  s.at(7).pushCall({ id: "logD", label: "console.log('D')", kind: "call" });
  s.snap("Line 7 runs: `console.log('D')` is pushed.");

  s.log("D").popCall("logD");
  s.snap("'D' is printed. Notice B and C have NOT run yet — they are queued.");

  s.at(null).popCall("script");
  s.snap(
    "The script finishes and the Call Stack is empty. Now the Event Loop can process queued work.",
    { loopActive: true, note: "The Event Loop only acts when the Call Stack is empty." },
  );

  s.snap(
    "First priority: the Event Loop DRAINS the entire Microtask Queue before anything else.",
    {
      loopActive: true,
      note: "Microtasks (promise reactions) always run before the next task and before rendering.",
    },
  );

  s.shiftMicro();
  s.pushCall({ id: "C", label: "() => log('C')", kind: "microtask" });
  s.snap("Microtask C enters the Call Stack.");

  s.log("C").popCall("C");
  s.snap("'C' is printed. The Microtask Queue is now empty.");

  s.snap(
    "With microtasks drained, the Event Loop takes exactly ONE task from the Task Queue.",
    { loopActive: true, note: "One macrotask per loop turn — then microtasks drain again." },
  );

  s.shiftMacro();
  s.pushCall({ id: "B", label: "() => log('B')", kind: "callback" });
  s.snap("Task B (the timer callback) enters the Call Stack.");

  s.log("B").popCall("B");
  s.snap("'B' is printed. All queues are now empty.");

  s.at(null);
  s.snap("Done. Final output: A · D · C · B.", {
    note: "Sync first (A, D) → microtasks (C) → tasks (B). That ordering is the whole lesson.",
  });

  return {
    id: "micro-vs-task",
    name: "Microtasks vs Tasks",
    summary: "Why the output is A, D, C, B — sync, then microtasks, then tasks.",
    env: "browser",
    code,
    steps: s.steps,
  };
}

/* ------------------------------------------------------------------ *
 * Node.js: nextTick vs Promise vs Timer vs setImmediate               *
 * ------------------------------------------------------------------ */
function buildNodeOrdering(): Scenario {
  const code = `console.log('start');

setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));

console.log('end');`;

  const s = new Sim();
  s.pushCall({ id: "script", label: "main module", kind: "call" });
  s.snap("Node runs the main module synchronously on the Call Stack.", {
    note: "Node adds two extra queues on top of the standard microtask/task model.",
  });

  s.at(1).log("start").snap("Line 1 prints 'start' synchronously.");

  s.at(3).toApi({ id: "to", label: "() => 'timeout'", kind: "timer", meta: "Timers phase" });
  s.snap("`setTimeout` registers a timer with libuv — it will run in the Timers phase.");

  s.at(4).toApi({ id: "im", label: "() => 'immediate'", kind: "io", meta: "Check phase" });
  s.snap("`setImmediate` registers a callback for the Check phase of the Event Loop.");

  s.at(6).toMicro({
    id: "nt",
    label: "() => 'nextTick'",
    kind: "microtask",
    priority: "nextTick",
  });
  s.snap(
    "`process.nextTick` queues into the nextTick queue — the HIGHEST-priority queue.",
    {
      note: "process.nextTick() is not an Event Loop phase; its queue drains before Promise microtasks.",
    },
  );

  s.at(7).toMicro({ id: "pr", label: "() => 'promise'", kind: "microtask" });
  s.snap("The resolved promise queues its reaction into the Promise microtask queue.");

  s.at(8).log("end").snap("Line 8 prints 'end'. The synchronous phase is over.");

  s.at(null).popCall("script");
  s.snap("The Call Stack is empty. Node now drains its priority queues.", {
    loopActive: true,
    note: "Order between the queues: nextTick → promises → then the Event Loop phases.",
  });

  s.shiftMicro();
  s.pushCall({ id: "nt", label: "() => 'nextTick'", kind: "microtask" });
  s.log("nextTick").popCall("nt");
  s.snap("nextTick runs first — before promises and before any timer.", {
    note: "Recursive process.nextTick can starve the Event Loop entirely.",
  });

  s.shiftMicro();
  s.pushCall({ id: "pr", label: "() => 'promise'", kind: "microtask" });
  s.log("promise").popCall("pr");
  s.snap("Then the promise microtask runs. Both priority queues are now empty.");

  s.setPhase("Timers");
  s.removeApi("to");
  s.pushCall({ id: "to", label: "() => 'timeout'", kind: "callback" });
  s.log("timeout").popCall("to");
  s.snap("The Event Loop enters the Timers phase and runs the setTimeout callback.", {
    loopActive: true,
  });

  s.setPhase("Check");
  s.removeApi("im");
  s.pushCall({ id: "im", label: "() => 'immediate'", kind: "callback" });
  s.log("immediate").popCall("im");
  s.snap("Later, in the Check phase, the setImmediate callback runs.", {
    loopActive: true,
    note: "At the top level, timeout-vs-immediate order isn't guaranteed; inside an I/O callback, immediate always wins.",
  });

  s.setPhase(undefined).at(null);
  s.snap("Done. Output: start · end · nextTick · promise · timeout · immediate.");

  return {
    id: "node-ordering",
    name: "Node.js queue priority",
    summary: "nextTick → promises → timers → check. Why 'end' beats 'nextTick'.",
    env: "node",
    code,
    steps: s.steps,
  };
}

export const SCENARIOS: Scenario[] = [buildMicroVsTask(), buildNodeOrdering()];
