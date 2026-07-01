import type { ConsoleLevel, ExecutionState, TokenKind } from "js-simulator";

export interface LaneToken {
  id: string;
  label: string;
  kind?: TokenKind;
  state?: ExecutionState;
  meta?: string;
  priority?: string;
}

export interface LaneState {
  line: number | null;
  lanes: Record<string, LaneToken[]>;
  metrics: Record<string, string | number>;
  flags: Record<string, boolean>;
  log: { id: number; text: string; level?: ConsoleLevel }[];
  explanation: string;
  note?: string;
}

/**
 * Generic multi-lane step builder. A "lane" is a named region (a queue, a
 * worker, a layer). Mutate lanes/metrics/flags, then `snap()` to freeze a step.
 */
export class LaneSim {
  private line: number | null = null;
  private lanes: Record<string, LaneToken[]> = {};
  private metrics: Record<string, string | number> = {};
  private flags: Record<string, boolean> = {};
  private log: { id: number; text: string; level?: ConsoleLevel }[] = [];
  private logId = 0;
  steps: LaneState[] = [];

  constructor(laneKeys: string[]) {
    laneKeys.forEach((k) => (this.lanes[k] = []));
  }

  at(line: number | null) {
    this.line = line;
    return this;
  }
  put(lane: string, token: LaneToken) {
    (this.lanes[lane] ??= []).push({ ...token });
    return this;
  }
  remove(lane: string, id: string) {
    if (this.lanes[lane]) this.lanes[lane] = this.lanes[lane].filter((t) => t.id !== id);
    return this;
  }
  move(from: string, to: string, id: string, patch: Partial<LaneToken> = {}) {
    const t = this.lanes[from]?.find((x) => x.id === id);
    if (t) {
      this.remove(from, id);
      this.put(to, { ...t, ...patch });
    }
    return this;
  }
  setState(lane: string, id: string, state: ExecutionState) {
    const t = this.lanes[lane]?.find((x) => x.id === id);
    if (t) t.state = state;
    return this;
  }
  clearLane(lane: string) {
    this.lanes[lane] = [];
    return this;
  }
  metric(key: string, value: string | number) {
    this.metrics[key] = value;
    return this;
  }
  flag(key: string, value = true) {
    this.flags[key] = value;
    return this;
  }
  log_(text: string, level?: ConsoleLevel) {
    this.log.push({ id: this.logId++, text, level });
    return this;
  }
  snap(explanation: string, opts: { note?: string } = {}) {
    this.steps.push({
      line: this.line,
      lanes: clone(this.lanes),
      metrics: { ...this.metrics },
      flags: { ...this.flags },
      log: clone(this.log),
      explanation,
      note: opts.note,
    });
    return this;
  }
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
