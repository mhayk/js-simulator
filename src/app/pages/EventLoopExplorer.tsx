import { forwardRef, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  CodeViewer,
  Console,
  MediaControls,
  MessageToken,
  RuntimeNode,
  SegmentedControl,
  StatusBadge,
  Timeline,
} from "js-simulator";
import type { ConsoleEntry } from "js-simulator";
import { SCENARIOS } from "../simulation/scenarios";
import type { RuntimeEnv, TokenSpec } from "../simulation/model";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import "./EventLoopExplorer.css";

const MotionToken = forwardRef<
  HTMLDivElement,
  { token: TokenSpec; size: "sm" | "md"; reduced: boolean }
>(function MotionToken({ token, size, reduced }, ref) {
  return (
    <motion.div
      ref={ref}
      layout
      layoutId={token.id}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: reduced ? 0 : 0.4, ease: [0.2, 0, 0, 1] }}
    >
      <MessageToken
        label={token.label}
        kind={token.kind}
        state={token.state}
        meta={token.meta}
        priority={token.priority}
        size={size}
      />
    </motion.div>
  );
});

function TokenList({
  tokens,
  size = "md",
  reduced,
  reverse = false,
}: {
  tokens: TokenSpec[];
  size?: "sm" | "md";
  reduced: boolean;
  reverse?: boolean;
}) {
  return (
    <div
      className={["ele__node-body", reverse && "ele__node-body--stack"]
        .filter(Boolean)
        .join(" ")}
    >
      <AnimatePresence mode="popLayout">
        {tokens.map((t) => (
          <MotionToken key={t.id} token={t} size={size} reduced={reduced} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Metric({
  value,
  label,
  rt,
}: {
  value: number | string;
  label: string;
  rt?: string;
}) {
  return (
    <div className="metric" data-rt={rt}>
      <div className="metric__value">{value}</div>
      <div className="metric__label">{label}</div>
    </div>
  );
}

export function EventLoopExplorer() {
  const { motion: motionPref, detail } = useSettings();
  const reduced = motionPref === "reduced";
  const showDetail = detail !== "beginner";

  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );

  const player = useStepPlayer(scenario.steps.length, scenario.id);
  const step = scenario.steps[player.index];

  const apiCategory = scenario.env === "browser" ? "webapi" : "nodeapi";

  const consoleEntries: ConsoleEntry[] = step.consoleOut.map((c) => ({
    id: c.id,
    text: c.text,
  }));

  const timelineSteps = scenario.steps.map((st) => ({
    category: st.loopActive ? ("eventloop" as const) : undefined,
    phase: st.phase,
  }));

  const switchEnv = (env: RuntimeEnv) => {
    const found = SCENARIOS.find((s) => s.env === env);
    if (found) setScenarioId(found.id);
  };

  return (
    <div className="ele ds-root">
      {/* ---------------- Left: code + controls + narration ---------------- */}
      <div className="ele__left">
        <div className="ele__head">
          <h1 className="ele__title" data-rt="eventloop">
            Event Loop Explorer
          </h1>
          <StatusBadge category="eventloop" />
        </div>

        <div className="ele__scenario">
          <SegmentedControl<RuntimeEnv>
            aria-label="Runtime environment"
            value={scenario.env}
            onChange={switchEnv}
            options={[
              { label: "Browser", value: "browser", rt: "webapi" },
              { label: "Node.js", value: "node", rt: "nodeapi" },
            ]}
          />
        </div>

        <p className="page__lead" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
          {scenario.summary}
        </p>

        <CodeViewer
          className="ele__code"
          code={scenario.code}
          currentLine={step.line ?? undefined}
          filename={scenario.env === "browser" ? "browser.js" : "server.js"}
        />

        <div className="ele__transport">
          <MediaControls
            playing={player.playing}
            onPlayPause={player.toggle}
            onStepBack={player.prev}
            onStepForward={player.next}
            onReset={player.reset}
            speed={player.speed}
            onSpeedChange={player.setSpeed}
            canStepBack={!player.atStart}
            canStepForward={!player.atEnd}
          />
          <Timeline
            total={scenario.steps.length}
            current={player.index}
            onSeek={player.seek}
            steps={timelineSteps}
          />
        </div>

        <div className="ele__explain" data-rt={step.loopActive ? "eventloop" : undefined}>
          <div className="ele__explain-label">
            Step {player.index + 1} — what&apos;s happening
          </div>
          <div className="ele__explain-text">{step.explanation}</div>
          {showDetail && step.note && <div className="ele__note">{step.note}</div>}
        </div>
      </div>

      {/* ---------------- Right: the runtime diagram ---------------- */}
      <div className="ele__right">
        {showDetail && (
          <div className="ele__metrics">
            <Metric value={step.callStack.length} label="Call Stack depth" rt="callstack" />
            <Metric value={step.microtasks.length} label="Pending microtasks" rt="microtask" />
            <Metric value={step.macrotasks.length} label="Pending tasks" rt="taskqueue" />
            <Metric
              value={step.apis.length}
              label={scenario.env === "browser" ? "Active Web APIs" : "Pending I/O"}
              rt={apiCategory}
            />
          </div>
        )}

        <LayoutGroup>
          <div className="ele__diagram">
            <RuntimeNode category="callstack" count={step.callStack.length}>
              <TokenList tokens={step.callStack} reduced={reduced} reverse />
            </RuntimeNode>

            <RuntimeNode category={apiCategory} count={step.apis.length}>
              <TokenList tokens={step.apis} reduced={reduced} />
            </RuntimeNode>

            <RuntimeNode category="microtask" count={step.microtasks.length}>
              <TokenList tokens={step.microtasks} size="sm" reduced={reduced} />
            </RuntimeNode>

            <RuntimeNode category="taskqueue" count={step.macrotasks.length}>
              <TokenList tokens={step.macrotasks} size="sm" reduced={reduced} />
            </RuntimeNode>

            <div
              className={[
                "ele__loop",
                "span2",
                step.loopActive && "ele__loop--active",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="ele__loop-icon" aria-hidden>
                ↻
              </span>
              <div className="ele__loop-text">
                <div className="ele__loop-title">
                  Event Loop{step.phase ? ` · ${step.phase} phase` : ""}
                </div>
                <div className="ele__loop-sub">
                  {step.loopActive
                    ? "Moving eligible callbacks onto the empty Call Stack."
                    : "Idle — the Call Stack is busy running synchronous code."}
                </div>
              </div>
              <StatusBadge state={step.loopActive ? "active" : "idle"} />
            </div>

            <div className="span2">
              <Console className="ele__console" entries={consoleEntries} />
            </div>
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}
