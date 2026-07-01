export type ClientState =
  | "idle"
  | "sending"
  | "receiving"
  | "received"
  | "excluded";

export interface BClient {
  id: string;
  name: string;
  /** Room membership (rooms mode). */
  room?: string;
  state: ClientState;
}

export interface BFrame {
  id: string;
  label: string;
  /** up = client → server, down = server → client. */
  dir: "up" | "down";
  /** For a down frame, the client it targets. */
  to?: string;
}

export type BroadcastMode = "broadcast" | "except-sender" | "rooms" | "private";

export interface BLog {
  id: number;
  kind: "in" | "out" | "info";
  text: string;
}

export interface BState {
  mode: BroadcastMode;
  clients: BClient[];
  frames: BFrame[];
  /** Short description of what the server is doing this step. */
  serverAction: string;
  serverActive: boolean;
  log: BLog[];
  explanation: string;
  note?: string;
}

export interface BScenario {
  id: string;
  name: string;
  mode: BroadcastMode;
  summary: string;
  steps: BState[];
}

/** Imperative builder for a multi-client server exchange. */
export class BSim {
  private clients: BClient[];
  private frames: BFrame[] = [];
  private serverAction = "listening";
  private serverActive = false;
  private log: BLog[] = [];
  private logId = 0;
  private mode: BroadcastMode;
  steps: BState[] = [];

  constructor(mode: BroadcastMode, clients: { id: string; name: string; room?: string }[]) {
    this.mode = mode;
    this.clients = clients.map((c) => ({ ...c, state: "idle" }));
  }

  set(id: string, state: ClientState) {
    const c = this.clients.find((x) => x.id === id);
    if (c) c.state = state;
    return this;
  }
  setMany(ids: string[], state: ClientState) {
    ids.forEach((id) => this.set(id, state));
    return this;
  }
  reset(state: ClientState = "idle") {
    this.clients.forEach((c) => (c.state = state));
    return this;
  }

  server(action: string, active = true) {
    this.serverAction = action;
    this.serverActive = active;
    return this;
  }

  frame(id: string, dir: "up" | "down", label: string, to?: string) {
    this.frames.push({ id, dir, label, to });
    return this;
  }
  clearFrames() {
    this.frames = [];
    return this;
  }

  logAt(kind: BLog["kind"], text: string) {
    this.log.push({ id: this.logId++, kind, text });
    return this;
  }

  snap(explanation: string, opts: { note?: string } = {}) {
    this.steps.push({
      mode: this.mode,
      clients: clone(this.clients),
      frames: clone(this.frames),
      serverAction: this.serverAction,
      serverActive: this.serverActive,
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
