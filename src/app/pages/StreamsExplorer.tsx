import { useMemo, useState } from "react";
import { LayoutGroup } from "framer-motion";
import { CodeViewer, Console, RuntimeNode, SegmentedControl, StatusBadge } from "js-simulator";
import type { ConsoleEntry } from "js-simulator";
import { LaneSim } from "../simulation/laneSim";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import { LaneTokens, Metric, Narration, SimHeader, SimLayout, StepControls } from "../components/sim";
import "../components/sim.css";

const HWM = 6;

const PIPE_CODE = `fs.createReadStream('big.csv')
  .pipe(transform)
  .pipe(fs.createWriteStream('out.csv'));`;

const BP_CODE = `const ok = writable.write(chunk);

if (!ok) {
  source.pause();
  writable.once('drain', () => source.resume());
}`;

function chunk(i: number) {
  return { id: `c${i}`, label: `chunk ${i}`, kind: "chunk" as const, meta: "64 KB" };
}

function buildPipe() {
  const s = new LaneSim(["source", "buffer", "sink"]);
  s.metric("buffered", 0).metric("hwm", HWM).metric("state", "flowing");
  for (let i = 1; i <= 4; i++) s.put("source", { ...chunk(i), state: "waiting" });
  s.snap("A Readable produces data in chunks — it never loads the whole file into memory.", {
    note: "Streams process data piece by piece, so a 5 GB file uses only a small, bounded buffer.",
  });

  for (let i = 1; i <= 4; i++) {
    s.move("source", "buffer", `c${i}`, { state: "active" }).metric("buffered", 1);
    s.snap(`pipe() pulls chunk ${i} into the transform's internal buffer.`);
    s.move("buffer", "sink", `c${i}`, { state: "completed" }).metric("buffered", 0).log_(`wrote chunk ${i}`);
    s.snap(`The Writable consumes chunk ${i} and the buffer drains.`);
  }
  s.snap("All chunks streamed through. pipe() handled the flow automatically.", {
    note: "pipe() manages backpressure for you — it pauses the source whenever the destination's buffer is full.",
  });
  return { steps: s.steps, code: PIPE_CODE };
}

function buildBackpressure() {
  const s = new LaneSim(["source", "buffer", "sink"]);
  s.metric("buffered", 0).metric("hwm", HWM).metric("state", "flowing");
  for (let i = 1; i <= 9; i++) s.put("source", { ...chunk(i), state: "waiting" });
  s.snap("A fast producer wants to write 9 chunks; the consumer is slow.", {
    note: "Every Writable has a highWaterMark — here 6 chunks — the point at which its buffer is 'full'.",
  });

  for (let i = 1; i <= HWM; i++) {
    s.move("source", "buffer", `c${i}`, { state: i === HWM ? "blocked" : "waiting" }).metric("buffered", i);
    if (i < HWM) s.snap(`write() returns true — chunk ${i} is buffered, keep going.`);
  }
  s.metric("state", "backpressure");
  s.log_("write() → false (buffer full)", "warn");
  s.snap("The buffer hits highWaterMark. `write()` returns false — the signal to STOP writing.", {
    note: "Ignore this and the buffer grows unbounded: memory climbs until the process crashes.",
  });

  s.metric("state", "paused");
  s.snap("Respecting backpressure, we `source.pause()`. No more chunks are pushed.");

  for (let i = 1; i <= 4; i++) {
    s.move("buffer", "sink", `c${i}`, { state: "completed" }).metric("buffered", HWM - i).log_(`consumed chunk ${i}`);
  }
  s.snap("The slow consumer works through the buffer, one chunk at a time.");

  s.metric("state", "drain");
  s.log_("drain", "info");
  s.snap("When the buffer falls back below the mark, the stream emits `drain`.");

  s.metric("state", "flowing");
  s.move("source", "buffer", "c7", { state: "waiting" }).metric("buffered", 3);
  s.snap("On `drain` we `source.resume()`. This write / pause / drain loop IS backpressure.", {
    note: "The same pattern protects WebSocket send buffers, file uploads and message queues from being overwhelmed.",
  });

  return { steps: s.steps, code: BP_CODE };
}

const SCENARIOS = { pipe: buildPipe(), backpressure: buildBackpressure() };

function BufferBar({ buffered, hwm }: { buffered: number; hwm: number }) {
  const pct = Math.min(100, (buffered / hwm) * 100);
  const over = buffered >= hwm;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-size-2xs)", color: "var(--color-text-muted)", marginBottom: 4 }}>
        <span>internal buffer</span>
        <span>{buffered} / {hwm} chunks</span>
      </div>
      <div style={{ height: 12, borderRadius: "var(--radius-full)", background: "var(--color-surface-3)", overflow: "hidden", border: "1px solid var(--color-border)" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: over ? "var(--rt-backpressure)" : "var(--rt-streams)",
            transition: "width var(--duration-base) var(--ease-standard), background var(--duration-base)",
          }}
        />
      </div>
    </div>
  );
}

export function StreamsExplorer({ initialMode = "pipe" }: { initialMode?: "pipe" | "backpressure" }) {
  const { detail } = useSettings();
  const showDetail = detail !== "beginner";
  const [mode, setMode] = useState<"pipe" | "backpressure">(initialMode);
  const scenario = SCENARIOS[mode];
  const player = useStepPlayer(scenario.steps.length, mode);
  const step = scenario.steps[player.index];

  const buffered = Number(step.metrics.buffered ?? 0);
  const hwm = Number(step.metrics.hwm ?? HWM);
  const state = String(step.metrics.state ?? "flowing");
  const stateBadge = state === "backpressure" ? "error" : state === "paused" ? "waiting" : state === "drain" ? "active" : "completed";

  const logEntries: ConsoleEntry[] = useMemo(
    () => step.log.map((l) => ({ id: l.id, text: l.text, level: l.level })),
    [step.log],
  );

  return (
    <SimLayout
      left={
        <>
          <SimHeader
            title="Streams & Backpressure"
            category="streams"
            right={
              <SegmentedControl
                aria-label="Scenario"
                value={mode}
                onChange={setMode}
                options={[
                  { label: "Pipe", value: "pipe", rt: "streams" },
                  { label: "Backpressure", value: "backpressure", rt: "backpressure" },
                ]}
              />
            }
          />
          <p className="sim__lead">
            Data flows in chunks through a bounded buffer. When the consumer can't keep up,
            backpressure holds the producer back.
          </p>
          <CodeViewer code={scenario.code} currentLine={step.line ?? undefined} filename="stream.js" />
          <StepControls player={player} total={scenario.steps.length} />
          <Narration index={player.index} explanation={step.explanation} note={step.note} showNote={showDetail} accent={mode === "pipe" ? "streams" : "backpressure"} />
          <Console title="Console" entries={logEntries} style={{ height: 130 }} />
        </>
      }
    >
      <div className="sim__metrics">
        <Metric value={buffered} label="Buffered chunks" rt="streams" />
        <Metric value={hwm} label="highWaterMark" rt="os" />
        <Metric value={<StatusBadge state={stateBadge}>{state}</StatusBadge>} label="Stream state" />
      </div>

      <div className="sim__panel">
        <BufferBar buffered={buffered} hwm={hwm} />
      </div>

      <LayoutGroup>
        <RuntimeNode category="streams" title="Producer (Readable)" provider="Node.js" count={step.lanes.source.length} state={state === "paused" ? "waiting" : "active"}>
          <LaneTokens tokens={step.lanes.source} />
        </RuntimeNode>
        <RuntimeNode category={buffered >= hwm ? "backpressure" : "streams"} title="Internal buffer" hideProvider count={buffered} state={buffered >= hwm ? "blocked" : "idle"}>
          <LaneTokens tokens={step.lanes.buffer} />
        </RuntimeNode>
        <RuntimeNode category="nodeapi" title="Consumer (Writable)" provider="Node.js" count={step.lanes.sink.length}>
          <LaneTokens tokens={step.lanes.sink} />
        </RuntimeNode>
      </LayoutGroup>
    </SimLayout>
  );
}
