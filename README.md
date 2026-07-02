# JavaScript Runtime Simulator

An interactive, visual playground for understanding **how JavaScript actually runs** — in
the browser and in Node.js. Watch the call stack, the event loop, the microtask and task
queues, Web APIs, libuv's thread pool, network I/O, streams, WebSockets and worker threads
move step by step, so the runtime stops being a black box.

It's two things in one repository:

- **The Simulator** — a React app (`npm run dev`) with 20+ interactive screens that animate
  the internals of the JS engine and Node.js.
- **The Design System** — the component library those screens are built from, published in
  library mode (ESM + CJS + CSS + types) and re-themable entirely through design tokens.

> Everything is a simulation of the runtime's behaviour, hand-stepped for accuracy — no
> in-browser JS engine is embedded. The goal is a *correct mental model*, not a sandbox.

## Quick start

```bash
npm install
npm run dev        # launch the Simulator app at http://localhost:5173
npm run build      # build the design-system library → dist/ (ESM + CJS + CSS + .d.ts)
npm run typecheck  # type-check without emitting
npm run preview    # preview the production build
```

## What you can explore

The app is organised the way you'd learn it — from the single thread outward to real-time
systems at scale.

### Foundations & runtimes
| Screen | What it shows |
|--------|---------------|
| **Event Loop Explorer** | Call stack, Web APIs, microtask & macrotask queues cycling through the loop, in both browser and Node ordering. |
| **Browser Runtime** | An architecture map — V8 → Web APIs/DOM → event loop → queues → rendering pipeline — with a click-to-inspect panel on every block. |
| **Node.js Runtime** | The Node stack — V8 → Node APIs → libuv (phases, thread pool, OS polling) → kernel. |
| **Browser vs Node** | The same code, side by side, highlighting where the two runtimes diverge. |
| **Rendering & UI** | How long tasks block the main thread and drop frames (Style → Layout → Paint → Composite). |

### Deep dives
| Screen | What it shows |
|--------|---------------|
| **libuv Thread Pool** | Why `fs`, `crypto` and DNS share a pool of 4 threads. |
| **Network I/O** | Why sockets are watched by the OS (epoll/kqueue/IOCP), *not* the thread pool. |
| **WebSocket Explorer** | The HTTP upgrade handshake and full-duplex messaging. |
| **Broadcast & Rooms** | Fan-out to many clients, `except-sender`, and room grouping. |
| **Streams / Backpressure** | Chunked processing and what happens when the consumer can't keep up. |
| **EventEmitter** | Synchronous publish/subscribe — the pattern under most of Node. |
| **Worker Threads** | Real OS threads for CPU-bound work with message passing. |
| **Realtime protocols** | Polling vs long-polling vs SSE vs WebSocket vs Socket.IO. |
| **Socket.IO** | What it adds on top of raw WebSocket — and where it isn't a drop-in. |
| **WebSocket Scaling** | Why local memory breaks across instances, and how a pub/sub bus fixes it. |

### Learn & practice
| Screen | What it does |
|--------|--------------|
| **Learn** | A guided 4-track curriculum that threads every explorer into a path. |
| **Playground** | Step through curated snippets tick-by-tick — call stack, queues and console evolve in sync with the highlighted line. |
| **Challenges** | Predict-the-output quizzes across Beginner → Expert, with explanations and a running score. |
| **Progress** | Mastery bars per module, streak, and earned/locked badges. |

## How it works

### The simulation engine
Simulations are **step-based and deterministic**. An imperative builder produces an
immutable array of snapshots (`LaneSim` in `src/app/simulation/`), so playback is just array
indexing — scrubbing the timeline, stepping back and forward, and adjusting speed all come
for free. Because nothing runs live, every ordering shown is exact and reproducible.

Shared building blocks (`src/app/components/`):
- **`sim.tsx`** — the simulator kit: layout, transport controls, narration, and
  Framer Motion shared-layout token movement between lanes.
- **`runtimeMap.tsx`** — the architecture-diagram + inspect-panel used by the runtime overviews.
- **`compare.tsx`** — the side-by-side comparison tables.

### Detail levels & accessibility
The UI supports progressive disclosure (**Beginner / Standard / Advanced / Runtime Internals**),
a **dark-by-default** theme with a light variant, and a **reduced-motion** mode — all driven by
`data-*` attributes and persisted to `localStorage`. Colour is never the only signal: every
runtime category also carries a glyph, targeting WCAG AA.

## The design system

Every screen is composed from a small, token-driven component library. The runtime vocabulary
(18 semantic categories — `callstack`, `microtask`, `eventloop`, `libuv`, `threadpool`,
`websocket`, `streams`, `worker`, …) is a first-class part of the design system, each with a
stable colour, glyph and provider.

### Using the library

```tsx
import { Button, Card, CodeViewer, Console, RuntimeNode } from "js-simulator";
import "js-simulator/styles.css";

function Example() {
  return (
    <Card title="Runtime">
      <RuntimeNode category="eventloop" />
      <CodeViewer code={`console.log(1)`} currentLine={1} />
      <Console entries={[{ id: 1, text: "1" }]} />
    </Card>
  );
}
```

| Component | Purpose |
|-----------|---------|
| `Button`, `Input`, `Select`, `SegmentedControl` | Core interactive controls. |
| `Card`, `Stack` | Surface container and layout primitive. |
| `StatusBadge`, `MessageToken`, `RuntimeNode` | Runtime-vocabulary primitives (states, queued tokens, nodes). |
| `CodeViewer`, `Console` | Syntax-highlighted source with a current-line marker, and console output. |
| `Timeline`, `MediaControls` | Scrubbable timeline and play/step/speed transport. |

### Design tokens
Everything is styled from CSS custom properties in
[`src/tokens/tokens.css`](src/tokens/tokens.css) — colours, the runtime palette, typography,
spacing, radius, elevation and motion. Components never hard-code values; they reference
`var(--token)`, so re-theming means overriding tokens, not editing components.

## Project structure

```
src/
  tokens/                design tokens + the runtime vocabulary (source of truth)
  styles/global.css      baseline styles for .ds-root surfaces + data-rt mapping
  components/            the design-system library (Button, CodeViewer, Timeline, …)
  index.ts               public library entry point
  app/                   the Simulator application
    main.tsx             app entry (loaded by index.html in dev)
    App.tsx              router
    layout/              app shell, top bar, sidebar
    nav.ts               navigation model
    theme.tsx            theme / motion / detail-level context
    simulation/          step-based simulation models & scenarios
    components/          shared simulator kit (sim, runtimeMap, compare)
    pages/               one file per screen
  dev/                   standalone component playground (not part of the build)
```

## Tech stack

- **React 18** + **TypeScript**
- **Vite** (library mode for the design system; app mode via a `js-simulator` → `src` alias)
- **react-router-dom** v7 for navigation
- **framer-motion** v12 for shared-layout animation
- CSS custom properties for all theming — no CSS-in-JS, no runtime style cost

## Syncing to Claude Design

This repo is shaped to work with `/design-sync` (package shape): a library-mode `dist/` build,
per-component source, and token-driven CSS — so the design agent builds with these real
components.
