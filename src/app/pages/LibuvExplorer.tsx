import { useMemo, useState } from "react";
import { LayoutGroup } from "framer-motion";
import { CodeViewer, Console, RuntimeNode, SegmentedControl } from "js-simulator";
import type { ConsoleEntry } from "js-simulator";
import { LaneSim } from "../simulation/laneSim";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import {
  LaneTokens,
  Metric,
  Narration,
  SimHeader,
  SimLayout,
  StepControls,
} from "../components/sim";
import "../components/sim.css";

const CODE = `const crypto = require('node:crypto');

for (let i = 1; i <= 6; i++) {
  crypto.pbkdf2('secret', 'salt', 100000, 64, 'sha512',
    () => console.log(\`hash \${i} done\`));
}`;

const WORKERS = ["w1", "w2", "w3", "w4"] as const;

function buildLibuv(poolSize: number) {
  const workers = WORKERS.slice(0, poolSize);
  const s = new LaneSim(["queue", ...WORKERS, "done"]);
  const inWorker: Record<string, number> = {};
  const queue: number[] = [1, 2, 3, 4, 5, 6];
  let done = 0;

  const sync = () =>
    s
      .metric("pool", poolSize)
      .metric("queued", queue.length)
      .metric("active", Object.keys(inWorker).length)
      .metric("done", done);

  s.at(4);
  for (let i = 1; i <= 6; i++)
    s.put("queue", { id: `j${i}`, label: `pbkdf2 #${i}`, kind: "io", state: "waiting", meta: "CPU" });
  sync();
  s.snap("The loop submits 6 pbkdf2 hashes — CPU-bound work libuv runs on its thread pool.", {
    note: "fs, crypto, dns.lookup and zlib use the pool. Network sockets do NOT — they use the OS event notifier.",
  });

  s.at(null);
  for (const w of workers) {
    if (queue.length) {
      const j = queue.shift()!;
      inWorker[w] = j;
      s.move("queue", w, `j${j}`, { state: "active", meta: "hashing" });
    }
  }
  sync();
  s.snap(
    `libuv hands one job to each of the ${poolSize} worker thread${poolSize > 1 ? "s" : ""}. The other ${queue.length} wait in the queue.`,
    {
      note:
        poolSize < 4
          ? `Only ${poolSize} threads means at most ${poolSize} hashes run at once — throughput is capped and the queue grows.`
          : "The default pool size is 4 (UV_THREADPOOL_SIZE, max 1024).",
    },
  );

  while (Object.keys(inWorker).length) {
    const [w, j] = Object.entries(inWorker).sort((a, b) => a[1] - b[1])[0];
    delete inWorker[w];
    s.move(w, "done", `j${j}`, { state: "completed", meta: "ready" });
    done++;
    s.log_(`hash ${j} done`);
    let picked = false;
    if (queue.length) {
      const nj = queue.shift()!;
      inWorker[w] = nj;
      s.move("queue", w, `j${nj}`, { state: "active", meta: "hashing" });
      picked = true;
    }
    sync();
    s.snap(
      `Worker frees up — hash ${j}'s callback is queued for the Event Loop.${picked ? " A waiting job moves into the free worker." : ""}`,
    );
  }

  s.snap("All 6 hashes are done. Each callback runs back on the main thread via the Event Loop.", {
    note:
      poolSize < 4
        ? "Raising UV_THREADPOOL_SIZE would run more in parallel — but only up to the number of physical CPU cores helps."
        : "More threads than CPU cores rarely speeds up CPU-bound work — they just compete for the same cores.",
  });

  return { poolSize, steps: s.steps };
}

const SCENARIOS = {
  "4": buildLibuv(4),
  "2": buildLibuv(2),
};

export function LibuvExplorer() {
  const { detail } = useSettings();
  const showDetail = detail !== "beginner";
  const [size, setSize] = useState<"4" | "2">("4");
  const scenario = SCENARIOS[size];
  const player = useStepPlayer(scenario.steps.length, `pool-${size}`);
  const step = scenario.steps[player.index];

  const workers = WORKERS.slice(0, scenario.poolSize);
  const logEntries: ConsoleEntry[] = useMemo(
    () => step.log.map((l) => ({ id: l.id, text: l.text, level: l.level })),
    [step.log],
  );

  return (
    <SimLayout
      left={
        <>
          <SimHeader
            title="libuv Thread Pool"
            category="threadpool"
            right={
              <SegmentedControl
                aria-label="Pool size"
                value={size}
                onChange={setSize}
                options={[
                  { label: "4 workers", value: "4", rt: "threadpool" },
                  { label: "2 workers", value: "2", rt: "threadpool" },
                ]}
              />
            }
          />
          <p className="sim__lead">
            Six CPU-bound hashes share {scenario.poolSize} worker threads. Watch jobs queue,
            run, and free up.
          </p>
          <CodeViewer code={CODE} currentLine={step.line ?? undefined} filename="pool.js" />
          <StepControls player={player} total={scenario.steps.length} />
          <Narration
            index={player.index}
            explanation={step.explanation}
            note={step.note}
            showNote={showDetail}
            accent="threadpool"
          />
          <Console title="Console" entries={logEntries} style={{ height: 150 }} />
        </>
      }
    >
      <div className="sim__metrics">
        <Metric value={step.metrics.pool} label="Pool size" rt="threadpool" />
        <Metric value={step.metrics.active} label="Active workers" rt="threadpool" />
        <Metric value={step.metrics.queued} label="Queued" rt="taskqueue" />
        <Metric value={step.metrics.done} label="Completed" rt="eventloop" />
      </div>

      <LayoutGroup>
        <RuntimeNode category="taskqueue" title="Work Queue" provider="libuv" count={step.lanes.queue.length}>
          <LaneTokens tokens={step.lanes.queue} />
        </RuntimeNode>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${workers.length}, 1fr)`,
            gap: "var(--space-md)",
          }}
        >
          {workers.map((w, i) => (
            <RuntimeNode
              key={w}
              category="threadpool"
              title={`Worker ${i + 1}`}
              hideProvider
              state={step.lanes[w].length ? "active" : "idle"}
              emptyLabel="idle"
            >
              <LaneTokens tokens={step.lanes[w]} />
            </RuntimeNode>
          ))}
        </div>

        <RuntimeNode category="eventloop" title="Callbacks ready" provider="Event Loop" count={step.lanes.done.length}>
          <LaneTokens tokens={step.lanes.done} />
        </RuntimeNode>
      </LayoutGroup>
    </SimLayout>
  );
}
