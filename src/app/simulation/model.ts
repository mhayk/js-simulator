import type { ExecutionState, TokenKind } from "js-simulator";

/** One execution unit shown as a MessageToken somewhere in the runtime. */
export interface TokenSpec {
  id: string;
  label: string;
  kind: TokenKind;
  meta?: string;
  priority?: string;
  state?: ExecutionState;
}

/** Which runtime environment a scenario models. */
export type RuntimeEnv = "browser" | "node";

/** A full, immutable snapshot of the runtime at one step. */
export interface WorldState {
  /** 1-based line currently executing, or null. */
  line: number | null;
  callStack: TokenSpec[];
  /** Browser: Web APIs. Node: Node APIs / libuv-pending. */
  apis: TokenSpec[];
  microtasks: TokenSpec[];
  macrotasks: TokenSpec[];
  consoleOut: { id: number; text: string }[];
  /** True on the step where the Event Loop moves a callback. */
  loopActive: boolean;
  /** Plain-language narration of THIS step. */
  explanation: string;
  /** The "why" — the educational question this step answers. */
  note?: string;
  /** Optional phase label (Event Loop phase, etc.). */
  phase?: string;
}

export interface Scenario {
  id: string;
  name: string;
  summary: string;
  env: RuntimeEnv;
  code: string;
  steps: WorldState[];
}

/**
 * Imperative builder: mutate the working state, then `snap()` to freeze a
 * labelled snapshot. Scenarios read top-to-bottom like the code they model.
 */
export class Sim {
  private line: number | null = null;
  private callStack: TokenSpec[] = [];
  private apis: TokenSpec[] = [];
  private microtasks: TokenSpec[] = [];
  private macrotasks: TokenSpec[] = [];
  private consoleOut: { id: number; text: string }[] = [];
  private logId = 0;
  private phase?: string;
  steps: WorldState[] = [];

  at(line: number | null) {
    this.line = line;
    return this;
  }
  setPhase(phase?: string) {
    this.phase = phase;
    return this;
  }

  pushCall(t: TokenSpec) {
    this.callStack.push({ ...t, state: "active" });
    // demote the one below to idle-ish
    if (this.callStack.length > 1) {
      this.callStack[this.callStack.length - 2].state = "waiting";
    }
    return this;
  }
  popCall(id?: string) {
    if (id) this.callStack = this.callStack.filter((c) => c.id !== id);
    else this.callStack.pop();
    const top = this.callStack[this.callStack.length - 1];
    if (top) top.state = "active";
    return this;
  }

  toApi(t: TokenSpec) {
    this.apis.push({ ...t, state: "waiting" });
    return this;
  }
  removeApi(id: string) {
    this.apis = this.apis.filter((a) => a.id !== id);
    return this;
  }

  toMicro(t: TokenSpec) {
    this.microtasks.push({ ...t, state: "waiting" });
    return this;
  }
  shiftMicro() {
    return this.microtasks.shift();
  }

  toMacro(t: TokenSpec) {
    this.macrotasks.push({ ...t, state: "waiting" });
    return this;
  }
  shiftMacro() {
    return this.macrotasks.shift();
  }

  log(text: string) {
    this.consoleOut.push({ id: this.logId++, text });
    return this;
  }

  /** Freeze the current working state as a step. */
  snap(explanation: string, opts: { note?: string; loopActive?: boolean } = {}) {
    this.steps.push({
      line: this.line,
      callStack: clone(this.callStack),
      apis: clone(this.apis),
      microtasks: clone(this.microtasks),
      macrotasks: clone(this.macrotasks),
      consoleOut: clone(this.consoleOut),
      loopActive: opts.loopActive ?? false,
      explanation,
      note: opts.note,
      phase: this.phase,
    });
    return this;
  }
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
