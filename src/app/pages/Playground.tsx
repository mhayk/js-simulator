import { useMemo, useState } from "react";
import { CodeViewer, Console, SegmentedControl } from "js-simulator";
import type { ConsoleEntry } from "js-simulator";
import { StepControls, Narration } from "../components/sim";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { SNIPPETS } from "../simulation/traces";
import "./practice.css";

function Lane({ label, items, rt }: { label: string; items: string[]; rt: string }) {
  return (
    <div className="pg-lane" data-rt={rt}>
      <div className="pg-lane__label">{label}</div>
      <div className="pg-lane__items">
        {items.length === 0 ? (
          <span className="pg-lane__empty">empty</span>
        ) : (
          items.map((it, i) => (
            <span className="pg-lane__chip" key={`${it}-${i}`}>
              {it}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export function Playground() {
  const [id, setId] = useState(SNIPPETS[0].id);
  const snippet = useMemo(() => SNIPPETS.find((s) => s.id === id)!, [id]);
  const total = snippet.steps.length;
  const player = useStepPlayer(total, id);
  const step = snippet.steps[Math.min(player.index, total - 1)];

  const entries: ConsoleEntry[] = step.out.map((text, i) => ({ id: i, text }));

  return (
    <div className="practice ds-root" data-rt="microtask">
      <div className="practice__head">
        <div>
          <div className="practice__eyebrow">Playground</div>
          <h1 className="practice__title">Trace the runtime</h1>
          <p className="practice__lead">
            Step through a snippet and watch the call stack, the microtask and task queues, and
            the console evolve — one tick at a time. Pick an example to load its exact trace.
          </p>
        </div>
        <SegmentedControl<string>
          aria-label="Example snippet"
          value={id}
          onChange={setId}
          options={SNIPPETS.map((s) => ({ label: s.label, value: s.id }))}
        />
      </div>

      <StepControls player={player} total={total} />

      <div className="pg">
        <div className="pg__code">
          <CodeViewer code={snippet.code} currentLine={step.line} filename="playground.js" />
          <Narration index={player.index} explanation={step.note} accent="microtask" />
        </div>

        <div className="pg__state">
          <Lane label="Call stack" items={step.stack} rt="callstack" />
          <Lane label="Microtask queue" items={step.micro} rt="microtask" />
          <Lane label="Task queue (macrotasks)" items={step.macro} rt="taskqueue" />
          <Console entries={entries} emptyLabel="No output yet — step forward." />
        </div>
      </div>
    </div>
  );
}
