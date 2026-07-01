import { useMemo, useState } from "react";
import { LayoutGroup } from "framer-motion";
import { CodeViewer, Console, RuntimeNode, SegmentedControl, StatusBadge } from "js-simulator";
import type { ConsoleEntry } from "js-simulator";
import { LaneSim } from "../simulation/laneSim";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import { LaneTokens, Metric, Narration, SimHeader, SimLayout, StepControls } from "../components/sim";
import "../components/sim.css";

const BASIC_CODE = `import { EventEmitter } from 'node:events';
const emitter = new EventEmitter();

emitter.on('order.created', (order) => {
  console.log('email:', order.id);
});

emitter.on('order.created', (order) => {
  console.log('invoice:', order.id);
});

emitter.emit('order.created', { id: 123 });
console.log('after emit');`;

const LEAK_CODE = `// re-subscribing on every reconnect — a leak
socket.on('reconnect', () => {
  emitter.on('data', handleData);
});`;

function buildBasic() {
  const s = new LaneSim(["registered", "stack"]);
  s.at(4).put("registered", { id: "h1", label: "email listener", kind: "event" }).metric("listeners", 1);
  s.snap("A listener is registered for the `order.created` event.", {
    note: "EventEmitter is Node's synchronous pub/sub. Listeners are stored in an array, in registration order.",
  });

  s.at(8).put("registered", { id: "h2", label: "invoice listener", kind: "event" }).metric("listeners", 2);
  s.snap("A second listener is registered for the same event. Order matters — they run in this order.");

  s.at(12).put("stack", { id: "emit", label: "emit('order.created')", kind: "call", state: "active" });
  s.snap("`emit(...)` is called. This runs the listeners RIGHT NOW, synchronously, on the Call Stack.", {
    note: "Unlike a Promise or setTimeout, emit does NOT defer to a queue — the listeners execute before emit returns.",
  });

  s.setState("stack", "emit", "waiting");
  s.put("stack", { id: "r1", label: "email listener", kind: "event", state: "active" });
  s.log_("email: 123");
  s.snap("The first listener runs to completion and logs.");

  s.remove("stack", "r1");
  s.put("stack", { id: "r2", label: "invoice listener", kind: "event", state: "active" });
  s.log_("invoice: 123");
  s.snap("Then the second listener runs — in registration order.");

  s.remove("stack", "r2").remove("stack", "emit").at(13).log_("after emit");
  s.snap("Only after every listener finishes does `emit` return and the next line run.", {
    note: "Because emit is synchronous, a slow listener blocks the whole program — and an unhandled 'error' event throws.",
  });

  return { steps: s.steps, code: BASIC_CODE, showStack: true };
}

function buildLeak() {
  const s = new LaneSim(["registered", "stack"]);
  for (let i = 1; i <= 10; i++) s.put("registered", { id: `l${i}`, label: `data listener #${i}`, kind: "event" });
  s.metric("listeners", 10);
  s.snap("Ten listeners are attached to `data`. This is exactly the default limit — still fine.", {
    note: "The default maxListeners is 10 per event — a safety net, not a hard cap.",
  });

  s.put("registered", { id: "l11", label: "data listener #11", kind: "event", state: "blocked" }).metric("listeners", 11);
  s.log_("MaxListenersExceededWarning: 11 data listeners added to [EventEmitter]", "warn");
  s.snap("The 11th listener triggers a MaxListenersExceededWarning.", {
    note: "This almost always means a leak: listeners added in a loop, or re-registered on every reconnect.",
  });

  s.put("registered", { id: "l12", label: "data listener #12", kind: "event", state: "blocked" }).metric("listeners", 12);
  s.snap("Each `emit('data')` now calls all 12 synchronously — and the forgotten ones are never GC'd.", {
    note: "Fix: register once outside the loop, or call emitter.off('data', handler) when done. setMaxListeners only hides the symptom.",
  });

  return { steps: s.steps, code: LEAK_CODE, showStack: false };
}

const SCENARIOS = { basic: buildBasic(), leak: buildLeak() };

export function EventEmitterExplorer() {
  const { detail } = useSettings();
  const showDetail = detail !== "beginner";
  const [mode, setMode] = useState<"basic" | "leak">("basic");
  const scenario = SCENARIOS[mode];
  const player = useStepPlayer(scenario.steps.length, mode);
  const step = scenario.steps[player.index];

  const listeners = Number(step.metrics.listeners ?? 0);
  const logEntries: ConsoleEntry[] = useMemo(
    () => step.log.map((l) => ({ id: l.id, text: l.text, level: l.level })),
    [step.log],
  );

  return (
    <SimLayout
      left={
        <>
          <SimHeader
            title="EventEmitter"
            category="emitter"
            right={
              <SegmentedControl
                aria-label="Scenario"
                value={mode}
                onChange={setMode}
                options={[
                  { label: "Basic emit", value: "basic", rt: "emitter" },
                  { label: "Leak warning", value: "leak", rt: "emitter" },
                ]}
              />
            }
          />
          <p className="sim__lead">
            Node's event-driven core: `emit()` invokes every listener synchronously, in
            registration order.
          </p>
          <CodeViewer code={scenario.code} currentLine={step.line ?? undefined} filename="events.js" />
          <StepControls player={player} total={scenario.steps.length} />
          <Narration index={player.index} explanation={step.explanation} note={step.note} showNote={showDetail} accent="emitter" />
          <Console title="Console" entries={logEntries} style={{ height: 130 }} />
        </>
      }
    >
      <div className="sim__metrics">
        <Metric value={listeners} label="Registered listeners" rt="emitter" />
        <Metric value={10} label="Default max" rt="os" />
        <Metric value={listeners > 10 ? "⚠ leak?" : "healthy"} label="Status" rt={listeners > 10 ? "backpressure" : "eventloop"} />
      </div>

      <LayoutGroup>
        <RuntimeNode
          category="emitter"
          title="Listeners on 'order.created'"
          provider="Node.js"
          count={listeners}
          state={listeners > 10 ? "blocked" : "idle"}
        >
          <LaneTokens tokens={step.lanes.registered} />
          {listeners > 10 && (
            <div style={{ marginTop: "var(--space-sm)" }}>
              <StatusBadge state="error">MaxListenersExceededWarning</StatusBadge>
            </div>
          )}
        </RuntimeNode>

        {scenario.showStack && (
          <RuntimeNode category="callstack" title="Call Stack" provider="Engine" count={step.lanes.stack.length}>
            <LaneTokens tokens={step.lanes.stack} reverse />
          </RuntimeNode>
        )}
      </LayoutGroup>
    </SimLayout>
  );
}
