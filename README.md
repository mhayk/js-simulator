# js-simulator

A React + TypeScript design system, built with Vite in library mode.

## Getting started

```bash
npm install
npm run dev       # open the component playground
npm run build     # emit ESM + CJS bundles, CSS, and type declarations to dist/
npm run typecheck # type-check without emitting
```

## Using the library

```tsx
import { Button, Card, Input, Stack } from "js-simulator";
import "js-simulator/styles.css";

function Example() {
  return (
    <Card title="Sign in">
      <Stack gap="lg">
        <Input label="Email" placeholder="you@example.com" />
        <Button variant="primary">Continue</Button>
      </Stack>
    </Card>
  );
}
```

## Design tokens

Everything is styled from CSS custom properties defined in
[`src/tokens/tokens.css`](src/tokens/tokens.css) — colors, typography, spacing,
radius, elevation, and motion. Components never hard-code values; they reference
`var(--token)`, so re-theming means overriding tokens, not editing components.

## Structure

```
src/
  tokens/tokens.css        design tokens (source of truth)
  styles/global.css        baseline styles for .ds-root surfaces
  components/
    Button/  Input/  Card/  Stack/
  dev/                     local playground (not part of the published build)
  index.ts                 public entry point
```

## Components

| Component | Purpose |
|-----------|---------|
| `Button`  | Primary interactive control (`primary`/`secondary`/`ghost`/`danger`, three sizes). |
| `Input`   | Labelled text field with hint and error states. |
| `Card`    | Surface container with an optional header. |
| `Stack`   | Flexbox layout primitive spacing children by the token scale. |

## Syncing to Claude Design

This repo is shaped to work with `/design-sync` (package shape): a library-mode
`dist/` build, per-component source, and token-driven CSS. Add a Storybook later
to switch it to the storybook shape.
