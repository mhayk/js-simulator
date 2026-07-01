import { forwardRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CodeViewer,
  Console,
  MediaControls,
  MessageToken,
  RuntimeNode,
  StatusBadge,
  Timeline,
} from "js-simulator";
import type { ConsoleEntry, ExecutionState } from "js-simulator";
import { WS_SCENARIOS } from "../simulation/wsScenarios";
import type { ConnState, WsFrame } from "../simulation/wsModel";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import "./WebSocketExplorer.css";

const CONN_ORDER: ConnState[] = ["connecting", "open", "closing", "closed"];

const CONN_BADGE: Record<ConnState, { state: ExecutionState; label: string }> = {
  connecting: { state: "waiting", label: "Connecting · 0" },
  open: { state: "completed", label: "Open · 1" },
  closing: { state: "waiting", label: "Closing · 2" },
  closed: { state: "idle", label: "Closed · 3" },
  reconnecting: { state: "waiting", label: "Reconnecting" },
  error: { state: "error", label: "Error" },
};

const Frame = forwardRef<HTMLDivElement, { frame: WsFrame; reduced: boolean }>(
  function Frame({ frame, reduced }, ref) {
  const arrow = frame.dir === "up" ? "→" : "←";
  return (
    <motion.div
      ref={ref}
      layout
      layoutId={frame.id}
      className={`wse__frame wse__frame--${frame.dir}`}
      initial={{ opacity: 0, x: frame.dir === "up" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: frame.dir === "up" ? 24 : -24 }}
      transition={{ duration: reduced ? 0 : 0.35, ease: [0.2, 0, 0, 1] }}
    >
      <span className="wse__frame-arrow" aria-hidden>
        {arrow}
      </span>
      <MessageToken
        label={frame.label}
        kind="websocket"
        size="sm"
        meta={frame.kind}
        state="active"
        style={{ flex: 1 }}
      />
    </motion.div>
  );
});

export function WebSocketExplorer() {
  const { motion: motionPref, detail } = useSettings();
  const reduced = motionPref === "reduced";
  const showDetail = detail !== "beginner";

  const scenario = useMemo(() => WS_SCENARIOS[0], []);
  const player = useStepPlayer(scenario.steps.length);
  const step = scenario.steps[player.index];

  const badge = CONN_BADGE[step.connState];
  const connIndex = CONN_ORDER.indexOf(step.connState);

  const logEntries: ConsoleEntry[] = step.log.map((l) => ({
    id: l.id,
    level: l.side === "server" ? "info" : "log",
    text: `[${l.side}] ${l.text}`,
  }));

  return (
    <div className="wse ds-root">
      {/* Left: code + transport + narration */}
      <div className="wse__left">
        <div className="wse__head">
          <h1 className="wse__title" data-rt="websocket">
            WebSocket Explorer
          </h1>
          <StatusBadge category="websocket" />
        </div>
        <p className="page__lead" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
          {scenario.summary}
        </p>

        <CodeViewer
          code={scenario.clientCode}
          currentLine={step.clientLine ?? undefined}
          filename="client.js"
          style={{ maxHeight: 320 }}
        />

        <div className="wse__transport">
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
          <Timeline total={scenario.steps.length} current={player.index} onSeek={player.seek} />
        </div>

        <div className="wse__explain">
          <div className="wse__explain-label">
            Step {player.index + 1} — what&apos;s happening
          </div>
          <div className="wse__explain-text">{step.explanation}</div>
          {showDetail && step.note && <div className="wse__note">{step.note}</div>}
        </div>
      </div>

      {/* Right: connection state + diagram + log */}
      <div className="wse__right">
        <div className="wse__conn">
          <StatusBadge state={badge.state}>{badge.label}</StatusBadge>
          <div className="wse__conn-track" aria-hidden>
            {CONN_ORDER.map((c, i) => (
              <div
                key={c}
                className={[
                  "wse__conn-step",
                  i <= connIndex && connIndex >= 0 && "wse__conn-step--on",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            {step.connState === "open" ? "full-duplex · persistent" : "single TCP socket"}
          </span>
        </div>

        <div className="wse__diagram">
          {/* Client */}
          <RuntimeNode
            category="websocket"
            title="Browser client"
            provider="Browser"
            state={step.clientStack.length ? "active" : "idle"}
          >
            <div className="wse__endpoint-body">
              <div className="wse__section-label">Event listeners</div>
              <div className="wse__listeners">
                {step.listeners.length ? (
                  step.listeners.map((ev) => (
                    <StatusBadge key={ev} category="websocket" showMarker={false}>
                      {ev}
                    </StatusBadge>
                  ))
                ) : (
                  <span className="wse__frame-empty">none registered</span>
                )}
              </div>
              {step.clientStack.length > 0 && (
                <>
                  <div className="wse__section-label">Call Stack</div>
                  {step.clientStack.map((c) => (
                    <MessageToken key={c.id} label={c.label} kind="event" state="active" size="sm" />
                  ))}
                </>
              )}
            </div>
          </RuntimeNode>

          {/* Network channel */}
          <div className="wse__channel">
            <span className="wse__channel-label">Network</span>
            <AnimatePresence mode="popLayout">
              {step.channel.length ? (
                step.channel.map((f) => <Frame key={f.id} frame={f} reduced={reduced} />)
              ) : (
                <motion.span
                  key="idle"
                  className="wse__frame-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {step.connState === "open" ? "link idle" : "—"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Server */}
          <RuntimeNode
            category="nodeapi"
            title="Node.js server"
            provider="Node.js"
            count={step.serverClients}
            state={step.serverClients > 0 ? "active" : "idle"}
          >
            <div className="wse__endpoint-body">
              <div className="wse__section-label">Connected clients</div>
              {step.serverClients > 0 ? (
                Array.from({ length: step.serverClients }, (_, i) => (
                  <MessageToken
                    key={i}
                    label={`client #${i + 1}`}
                    kind="websocket"
                    size="sm"
                    state="active"
                  />
                ))
              ) : (
                <span className="wse__frame-empty">no clients connected</span>
              )}
            </div>
          </RuntimeNode>
        </div>

        <Console className="wse__log" title="Event log" entries={logEntries} />
      </div>
    </div>
  );
}
