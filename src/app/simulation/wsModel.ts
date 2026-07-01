import type { TokenSpec } from "./model";

export type ConnState =
  | "connecting"
  | "open"
  | "closing"
  | "closed"
  | "reconnecting"
  | "error";

export type FrameKind =
  | "handshake"
  | "upgrade"
  | "text"
  | "binary"
  | "ping"
  | "pong"
  | "close";

/** An in-flight WebSocket frame travelling across the network channel. */
export interface WsFrame {
  id: string;
  label: string;
  /** up = client → server, down = server → client. */
  dir: "up" | "down";
  kind: FrameKind;
}

export interface WsLog {
  id: number;
  side: "client" | "server" | "net";
  text: string;
}

/** Immutable snapshot of the client/server/channel at one step. */
export interface WsState {
  clientLine: number | null;
  connState: ConnState;
  /** Event listeners registered on the client socket. */
  listeners: string[];
  /** Frames currently crossing the network. */
  channel: WsFrame[];
  /** Callbacks running on the client Call Stack. */
  clientStack: TokenSpec[];
  serverClients: number;
  log: WsLog[];
  explanation: string;
  note?: string;
}

export interface WsScenario {
  id: string;
  name: string;
  summary: string;
  clientCode: string;
  steps: WsState[];
}

const FRAME_LABEL: Partial<Record<FrameKind, string>> = {
  handshake: "GET · Upgrade: websocket",
  upgrade: "101 Switching Protocols",
  close: "close",
};

/** Imperative builder for a WebSocket exchange; `snap()` freezes a step. */
export class WsSim {
  private clientLine: number | null = null;
  private connState: ConnState = "connecting";
  private listeners: string[] = [];
  private channel: WsFrame[] = [];
  private clientStack: TokenSpec[] = [];
  private serverClients = 0;
  private log: WsLog[] = [];
  private logId = 0;
  steps: WsState[] = [];

  at(line: number | null) {
    this.clientLine = line;
    return this;
  }
  state(s: ConnState) {
    this.connState = s;
    return this;
  }
  listen(event: string) {
    if (!this.listeners.includes(event)) this.listeners.push(event);
    return this;
  }
  clients(n: number) {
    this.serverClients = n;
    return this;
  }

  /** Put a frame on the wire. */
  send(id: string, dir: "up" | "down", kind: FrameKind, label?: string) {
    this.channel.push({ id, dir, kind, label: label ?? FRAME_LABEL[kind] ?? id });
    return this;
  }
  /** Remove a delivered frame from the wire. */
  deliver(id: string) {
    this.channel = this.channel.filter((f) => f.id !== id);
    return this;
  }

  pushClientCall(t: TokenSpec) {
    this.clientStack.push({ ...t, state: "active" });
    return this;
  }
  popClientCall(id?: string) {
    if (id) this.clientStack = this.clientStack.filter((c) => c.id !== id);
    else this.clientStack.pop();
    return this;
  }

  logAt(side: WsLog["side"], text: string) {
    this.log.push({ id: this.logId++, side, text });
    return this;
  }

  snap(explanation: string, opts: { note?: string } = {}) {
    this.steps.push({
      clientLine: this.clientLine,
      connState: this.connState,
      listeners: [...this.listeners],
      channel: clone(this.channel),
      clientStack: clone(this.clientStack),
      serverClients: this.serverClients,
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
