import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import { CodeViewer, RuntimeNode, SegmentedControl, StatusBadge } from "js-simulator";
import { LaneSim } from "../simulation/laneSim";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import { LaneTokens, Metric, Narration, SimHeader, SimLayout, StepControls } from "../components/sim";
import "../components/sim.css";

const BLOCK_CODE = `// one long synchronous task
for (const item of hugeList) {
  renderRow(item);           // ~120 ms total
}`;

const YIELD_CODE = `// yield to the browser between chunks
function work(i = 0) {
  const end = i + CHUNK;
  for (; i < end && i < hugeList.length; i++) renderRow(hugeList[i]);
  if (i < hugeList.length) requestAnimationFrame(() => work(i));
}
requestAnimationFrame(() => work());`;

function frame(i: number, dropped: boolean) {
  const state = dropped ? "blocked" : "completed";
  return { id: `f${i}`, label: `frame ${i}`, state: state as "blocked" | "completed" };
}

function buildBlocking() {
  const s = new LaneSim(["main", "frames"]);
  s.metric("fps", 60).metric("task", 0).metric("blocking", 0).metric("input", 0);
  s.at(2).put("main", { id: "task", label: "renderRow × 5000", kind: "call", state: "active", meta: "120 ms" });
  s.metric("task", 120).metric("blocking", 120).metric("fps", 8);
  s.snap("A single 120 ms task runs synchronously on the main thread.", {
    note: "The frame budget for 60fps is 16.7 ms. Anything over ~50 ms is a 'long task'.",
  });

  for (let i = 1; i <= 7; i++) s.put("frames", frame(i, true));
  s.snap("The browser wants to paint every 16.7 ms — but the thread is busy. 7 frames are dropped.", {
    note: "No paint, no layout, no input handling happens while the Call Stack is occupied.",
  });

  s.metric("input", 118);
  s.snap("A click during the task waits 118 ms before its handler can run — visible input lag.");

  s.remove("main", "task").put("frames", frame(8, false)).metric("blocking", 0).metric("fps", 58).metric("task", 0);
  s.snap("Only when the stack clears does the browser finally paint and handle the click.", {
    note: "Fix: keep tasks under ~50 ms — split the work up, or move heavy compute to a Web Worker.",
  });

  return { steps: s.steps, code: BLOCK_CODE };
}

function buildYielding() {
  const s = new LaneSim(["main", "frames"]);
  s.metric("fps", 60).metric("task", 0).metric("blocking", 0).metric("input", 8);
  s.at(8).put("main", { id: "c1", label: "chunk 1", kind: "call", state: "active", meta: "5 ms" });
  s.metric("task", 5).metric("blocking", 5);
  s.snap("The same work is split into ~5 ms chunks scheduled with requestAnimationFrame.", {
    note: "Each chunk fits inside a frame budget, so the browser can paint between them.",
  });

  for (let i = 1; i <= 4; i++) {
    s.remove("main", `c${i}`).put("frames", frame(i, false));
    if (i < 4) s.put("main", { id: `c${i + 1}`, label: `chunk ${i + 1}`, kind: "call", state: "active", meta: "5 ms" });
    s.snap(`After chunk ${i} the thread yields — the browser paints a smooth frame${i < 4 ? " and starts the next chunk" : ""}.`);
  }

  s.metric("input", 8);
  s.snap("A click is handled between chunks — the app stays responsive at ~60fps.", {
    note: "requestAnimationFrame, requestIdleCallback and scheduler.yield() all keep the main thread responsive.",
  });

  return { steps: s.steps, code: YIELD_CODE };
}

const SCENARIOS = { blocking: buildBlocking(), yielding: buildYielding() };

export function RenderingSimulator() {
  const { detail } = useSettings();
  const showDetail = detail !== "beginner";
  const [mode, setMode] = useState<"blocking" | "yielding">("blocking");
  const scenario = SCENARIOS[mode];
  const player = useStepPlayer(scenario.steps.length, mode);
  const step = scenario.steps[player.index];

  const fps = Number(step.metrics.fps ?? 60);
  const blocking = Number(step.metrics.blocking ?? 0);
  const input = Number(step.metrics.input ?? 0);
  const frames = step.lanes.frames;

  return (
    <SimLayout
      left={
        <>
          <SimHeader
            title="Rendering & Main Thread"
            category="rendering"
            right={
              <SegmentedControl
                aria-label="Scenario"
                value={mode}
                onChange={setMode}
                options={[
                  { label: "Long task", value: "blocking", rt: "backpressure" },
                  { label: "Chunked / rAF", value: "yielding", rt: "rendering" },
                ]}
              />
            }
          />
          <p className="sim__lead">
            The browser paints, runs JS and handles input on ONE thread. A long task blocks all
            three — dropped frames and laggy input.
          </p>
          <CodeViewer code={scenario.code} currentLine={step.line ?? undefined} filename="app.js" />
          <StepControls player={player} total={scenario.steps.length} />
          <Narration index={player.index} explanation={step.explanation} note={step.note} showNote={showDetail} accent="rendering" />
        </>
      }
    >
      <div className="sim__metrics">
        <Metric value={<StatusBadge state={fps >= 50 ? "completed" : "blocked"}>{fps} fps</StatusBadge>} label="Estimated FPS" />
        <Metric value={`${blocking} ms`} label="Blocking time" rt={blocking > 50 ? "backpressure" : "rendering"} />
        <Metric value={`${input} ms`} label="Input delay" rt={input > 50 ? "backpressure" : "rendering"} />
        <Metric value={frames.filter((f) => f.state === "blocked").length} label="Dropped frames" rt="backpressure" />
      </div>

      <div className="sim__panel">
        <div className="sim__section-label">Frame timeline (each cell = 16.7 ms)</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {frames.length === 0 && <span style={{ color: "var(--color-text-subtle)", fontSize: "var(--font-size-xs)", fontStyle: "italic" }}>no frames yet</span>}
          {frames.map((f) => (
            <div
              key={f.id}
              title={f.state === "blocked" ? "dropped" : "rendered"}
              style={{
                width: 26,
                height: 34,
                borderRadius: "var(--radius-sm)",
                background: f.state === "blocked" ? "var(--rt-backpressure-soft)" : "var(--rt-rendering-soft)",
                border: `1px solid ${f.state === "blocked" ? "var(--rt-backpressure)" : "var(--rt-rendering)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: f.state === "blocked" ? "var(--rt-backpressure)" : "var(--rt-rendering)",
              }}
            >
              {f.state === "blocked" ? "✕" : "▰"}
            </div>
          ))}
        </div>
      </div>

      <LayoutGroup>
        <RuntimeNode category="callstack" title="Main thread" provider="Engine" state={blocking > 50 ? "blocked" : "active"}>
          <LaneTokens tokens={step.lanes.main} />
        </RuntimeNode>
      </LayoutGroup>
    </SimLayout>
  );
}
