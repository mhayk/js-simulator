import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Console,
  MediaControls,
  MessageToken,
  SegmentedControl,
  StatusBadge,
  Timeline,
} from "js-simulator";
import type { ConsoleEntry } from "js-simulator";
import { BROADCAST_SCENARIOS } from "../simulation/broadcastScenarios";
import type { BClient, BroadcastMode } from "../simulation/broadcastModel";
import { useStepPlayer } from "../simulation/useStepPlayer";
import { useSettings } from "../theme";
import "./BroadcastSimulator.css";

function ClientCard({ client, reduced }: { client: BClient; reduced: boolean }) {
  return (
    <div className={`bcast__client bcast__client--${client.state}`}>
      <div className="bcast__client-head">
        <span className="bcast__client-name">{client.name}</span>
        <span className="bcast__client-dot" aria-hidden />
      </div>
      {client.room && (
        <StatusBadge category="websocket" showMarker={false}>
          {client.room}
        </StatusBadge>
      )}
      <div className="bcast__client-slot">
        <AnimatePresence mode="wait">
          {client.state === "sending" && (
            <motion.div
              key="send"
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <MessageToken label="emitting…" kind="websocket" size="sm" state="active" />
            </motion.div>
          )}
          {(client.state === "receiving" || client.state === "received") && (
            <motion.div
              key="recv"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <MessageToken
                label="message"
                kind="websocket"
                size="sm"
                state={client.state === "receiving" ? "active" : "completed"}
              />
            </motion.div>
          )}
          {client.state === "excluded" && (
            <span key="excl" className="bcast__client-idle">
              not addressed
            </span>
          )}
          {client.state === "idle" && (
            <span key="idle" className="bcast__client-idle">
              connected · idle
            </span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function BroadcastSimulator() {
  const { motion: motionPref, detail } = useSettings();
  const reduced = motionPref === "reduced";
  const showDetail = detail !== "beginner";

  const [scenarioId, setScenarioId] = useState(BROADCAST_SCENARIOS[0].id);
  const scenario = useMemo(
    () => BROADCAST_SCENARIOS.find((s) => s.id === scenarioId) ?? BROADCAST_SCENARIOS[0],
    [scenarioId],
  );
  const player = useStepPlayer(scenario.steps.length, scenario.id);
  const step = scenario.steps[player.index];

  const connected = step.clients.length;
  const logEntries: ConsoleEntry[] = step.log.map((l) => ({
    id: l.id,
    level: l.kind === "out" ? "info" : "log",
    text: l.text,
  }));

  return (
    <div className="bcast ds-root">
      {/* Left */}
      <div className="bcast__left">
        <div className="bcast__head">
          <h1 className="bcast__title" data-rt="websocket">
            Multi-client Broadcast
          </h1>
          <StatusBadge category="websocket" />
        </div>

        <SegmentedControl<BroadcastMode>
          aria-label="Broadcast mode"
          value={scenario.mode}
          onChange={(mode) => {
            const found = BROADCAST_SCENARIOS.find((s) => s.mode === mode);
            if (found) setScenarioId(found.id);
          }}
          options={[
            { label: "Broadcast", value: "broadcast", rt: "websocket" },
            { label: "Except sender", value: "except-sender", rt: "websocket" },
            { label: "Rooms", value: "rooms", rt: "websocket" },
          ]}
        />
        <p className="page__lead" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
          {scenario.summary}
        </p>

        <div className="bcast__transport">
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

        <div className="bcast__explain">
          <div className="bcast__explain-label">
            Step {player.index + 1} — what&apos;s happening
          </div>
          <div className="bcast__explain-text">{step.explanation}</div>
          {showDetail && step.note && <div className="bcast__note">{step.note}</div>}
        </div>

        <Console className="bcast__log" title="Server log" entries={logEntries} />
      </div>

      {/* Right */}
      <div className="bcast__right">
        <div className="bcast__server" data-active={step.serverActive}>
          <span className="bcast__server-glyph" aria-hidden>
            ◆
          </span>
          <div className="bcast__server-text">
            <div className="bcast__server-title">Node.js WebSocket server</div>
            <div className="bcast__server-action">{step.serverAction}</div>
          </div>
          <StatusBadge state={step.serverActive ? "active" : "idle"}>
            {connected} clients
          </StatusBadge>
        </div>

        <div className="bcast__wire" aria-hidden>
          ↓ one socket per client ↓
        </div>

        <div className="bcast__clients">
          {step.clients.map((c) => (
            <ClientCard key={c.id} client={c} reduced={reduced} />
          ))}
        </div>
      </div>
    </div>
  );
}
