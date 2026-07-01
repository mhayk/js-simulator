import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MediaControls, MessageToken, StatusBadge, Timeline } from "js-simulator";
import type { RuntimeCategory, TimelineStepMeta } from "js-simulator";
import type { LaneToken } from "../simulation/laneSim";
import { useSettings } from "../theme";
import type { useStepPlayer } from "../simulation/useStepPlayer";

type Player = ReturnType<typeof useStepPlayer>;

/** Two-column simulator layout: sticky left control panel + right diagram. */
export function SimLayout({ left, children }: { left: ReactNode; children: ReactNode }) {
  return (
    <div className="sim ds-root">
      <div className="sim__left">{left}</div>
      <div className="sim__right">{children}</div>
    </div>
  );
}

/** Screen title + category badge, with optional right-aligned control. */
export function SimHeader({
  title,
  category,
  right,
}: {
  title: string;
  category: RuntimeCategory;
  right?: ReactNode;
}) {
  return (
    <div className="sim__head">
      <h1 className="sim__title" data-rt={category}>
        {title}
      </h1>
      {right}
      <StatusBadge category={category} />
    </div>
  );
}

/** Media transport + timeline wired to a step player. */
export function StepControls({
  player,
  total,
  steps,
}: {
  player: Player;
  total: number;
  steps?: TimelineStepMeta[];
}) {
  return (
    <div className="sim__transport">
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
      <Timeline total={total} current={player.index} onSeek={player.seek} steps={steps} />
    </div>
  );
}

/** The "what's happening" narration panel with an optional insight note. */
export function Narration({
  index,
  explanation,
  note,
  showNote = true,
  accent,
}: {
  index: number;
  explanation: string;
  note?: string;
  showNote?: boolean;
  accent?: RuntimeCategory;
}) {
  return (
    <div className="sim__explain" data-rt={accent}>
      <div className="sim__explain-label">Step {index + 1} — what&apos;s happening</div>
      <div className="sim__explain-text">{explanation}</div>
      {showNote && note && <div className="sim__note">{note}</div>}
    </div>
  );
}

/** Animated vertical list of tokens in a lane (shared-layout movement). */
export function LaneTokens({
  tokens,
  size = "sm",
  reverse = false,
}: {
  tokens: LaneToken[];
  size?: "sm" | "md";
  reverse?: boolean;
}) {
  const reduced = useSettings().motion === "reduced";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: reverse ? "column-reverse" : "column",
        gap: "var(--space-xs)",
      }}
    >
      <AnimatePresence mode="popLayout">
        {tokens.map((t) => (
          <motion.div
            key={t.id}
            layout
            layoutId={t.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: [0.2, 0, 0, 1] }}
          >
            <MessageToken
              label={t.label}
              kind={t.kind}
              state={t.state}
              meta={t.meta}
              priority={t.priority}
              size={size}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** A small labelled metric tile. */
export function Metric({
  value,
  label,
  rt,
}: {
  value: ReactNode;
  label: string;
  rt?: RuntimeCategory;
}) {
  return (
    <div className="sim__metric" data-rt={rt}>
      <div className="sim__metric-value">{value}</div>
      <div className="sim__metric-label">{label}</div>
    </div>
  );
}
