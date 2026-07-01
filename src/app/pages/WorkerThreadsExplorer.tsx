import { useMemo, useState } from "react";
import { LayoutGroup } from "framer-motion";
import { CodeViewer, Console, RuntimeNode, SegmentedControl, StatusBadge } from "js-simulator";
import type { ConsoleEntry } from "js-simulator";
import { LaneSim } from "../simulation/laneSim";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import { LaneTokens, Metric, Narration, SimHeader, SimLayout, StepControls } from "../components/sim";
import "../components/sim.css";

const BLOCK_CODE = `// CPU-bound, on the main thread
const result = fibonacci(45);
console.log(result);

// incoming requests wait for this to finish`;

const WORKER_CODE = `const worker = new Worker('./fib.js', {
  workerData: 45,
});
worker.on('message', (result) => {
  console.log(result);
});`;

const reqs = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `q${i + 1}`, label: `request #${i + 1}`, kind: "callback" as const, state: "waiting" as const }));

function buildBlocking() {
  const s = new LaneSim(["main", "worker", "queue"]);
  s.metric("thread", "blocked").metric("waiting", 3);
  reqs(3).forEach((r) => s.put("queue", r));
  s.at(2).put("main", { id: "fib", label: "fibonacci(45)", kind: "call", state: "active", meta: "~5 s" });
  s.snap("`fibonacci(45)` is CPU-bound — it occupies the Call Stack for seconds.", {
    note: "JavaScript is single-threaded: while this runs, nothing else on the main thread can.",
  });

  s.snap("While it runs, the Event Loop can't touch the queue. Every pending request is frozen.", {
    note: "One CPU-bound function blocks the WHOLE server — timers, I/O callbacks and requests all wait.",
  });

  s.remove("main", "fib").metric("thread", "free").at(3).log_("1134903170");
  s.snap("Only when it finally returns does the result log — and the backlog starts to clear.");

  for (let i = 1; i <= 3; i++) s.move("queue", "main", `q${i}`, { state: "completed" }).metric("waiting", 3 - i);
  s.snap("The three waiting requests finally run — seconds late. Users saw a frozen app.", {
    note: "Fix: move CPU-bound work off the main thread with a Worker Thread.",
  });

  return { steps: s.steps, code: BLOCK_CODE, hasWorker: false };
}

function buildWorker() {
  const s = new LaneSim(["main", "worker", "queue"]);
  s.metric("thread", "free").metric("waiting", 3);
  reqs(3).forEach((r) => s.put("queue", r));
  s.at(1).put("main", { id: "spawn", label: "new Worker(fib.js)", kind: "call", state: "active" });
  s.snap("`new Worker(...)` spawns a real OS thread with its own V8 instance and event loop.", {
    note: "Unlike the libuv thread pool (fs/crypto), Worker Threads run YOUR JavaScript in parallel.",
  });

  s.remove("main", "spawn").put("worker", { id: "fib", label: "fibonacci(45)", kind: "worker", state: "active", meta: "computing" });
  s.snap("The workerData (45) is copied to the worker by structured clone — separate memory, no shared state.");

  for (let i = 1; i <= 3; i++) s.move("queue", "main", `q${i}`, { state: "completed" }).metric("waiting", 3 - i);
  s.snap("Meanwhile the main thread stays free — it keeps serving requests while the worker computes.", {
    note: "This is the whole point: the CPU work happens on another core; the main Event Loop never blocks.",
  });

  s.setState("worker", "fib", "completed");
  s.put("main", { id: "msg", label: "message handler", kind: "event", state: "active" }).log_("1134903170");
  s.snap("The worker posts the result back; a `message` event runs the callback on the main thread.");

  s.remove("main", "msg").remove("worker", "fib");
  s.snap("Done — result computed in parallel, main thread never froze.", {
    note: "Overhead: spawning + copying messages isn't free. For many small jobs, reuse a pool of workers.",
  });

  return { steps: s.steps, code: WORKER_CODE, hasWorker: true };
}

const SCENARIOS = { blocking: buildBlocking(), worker: buildWorker() };

export function WorkerThreadsExplorer() {
  const { detail } = useSettings();
  const showDetail = detail !== "beginner";
  const [mode, setMode] = useState<"blocking" | "worker">("blocking");
  const scenario = SCENARIOS[mode];
  const player = useStepPlayer(scenario.steps.length, mode);
  const step = scenario.steps[player.index];

  const thread = String(step.metrics.thread ?? "free");
  const logEntries: ConsoleEntry[] = useMemo(
    () => step.log.map((l) => ({ id: l.id, text: l.text, level: l.level })),
    [step.log],
  );

  return (
    <SimLayout
      left={
        <>
          <SimHeader
            title="Worker Threads"
            category="worker"
            right={
              <SegmentedControl
                aria-label="Scenario"
                value={mode}
                onChange={setMode}
                options={[
                  { label: "Blocking", value: "blocking", rt: "backpressure" },
                  { label: "Worker", value: "worker", rt: "worker" },
                ]}
              />
            }
          />
          <p className="sim__lead">
            CPU-bound work blocks the single main thread. Worker Threads run it on another
            core, keeping the Event Loop free.
          </p>
          <CodeViewer code={scenario.code} currentLine={step.line ?? undefined} filename="index.js" />
          <StepControls player={player} total={scenario.steps.length} />
          <Narration index={player.index} explanation={step.explanation} note={step.note} showNote={showDetail} accent="worker" />
          <Console title="Console" entries={logEntries} style={{ height: 130 }} />
        </>
      }
    >
      <div className="sim__metrics">
        <Metric value={<StatusBadge state={thread === "blocked" ? "blocked" : "completed"}>{thread}</StatusBadge>} label="Main thread" />
        <Metric value={step.metrics.waiting} label="Requests waiting" rt="taskqueue" />
        <Metric value={scenario.hasWorker ? 1 : 0} label="Worker threads" rt="worker" />
      </div>

      <LayoutGroup>
        <div style={{ display: "grid", gridTemplateColumns: scenario.hasWorker ? "1fr 1fr" : "1fr", gap: "var(--space-md)" }}>
          <RuntimeNode category="callstack" title="Main thread · Call Stack" provider="Engine" count={step.lanes.main.length} state={thread === "blocked" ? "blocked" : "idle"}>
            <LaneTokens tokens={step.lanes.main} reverse />
          </RuntimeNode>
          {scenario.hasWorker && (
            <RuntimeNode category="worker" title="Worker thread" provider="Node.js" count={step.lanes.worker.length} state={step.lanes.worker.some((t) => t.state === "active") ? "active" : "idle"}>
              <LaneTokens tokens={step.lanes.worker} />
            </RuntimeNode>
          )}
        </div>

        <RuntimeNode category="taskqueue" title="Pending requests" provider="Event Loop" count={step.lanes.queue.length}>
          <LaneTokens tokens={step.lanes.queue} />
        </RuntimeNode>
      </LayoutGroup>
    </SimLayout>
  );
}
