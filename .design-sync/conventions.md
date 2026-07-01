# Building with js-simulator

A dark-first React design system for visualizing the JavaScript runtime. Import
components from `js-simulator`; style your own layout with the CSS custom
properties (design tokens) below.

## Required wrapper — nothing is styled without it

Wrap every screen in an element with `className="ds-root"`. It sets the base
font, text colour, surface background and `box-sizing` that all components
inherit. Without it, component text (Card titles, Input labels) falls back to
unstyled browser defaults.

```jsx
import { Card, Button, Stack } from 'js-simulator';

function Screen() {
  return (
    <div className="ds-root" style={{ minHeight: '100vh' }}>
      <Stack gap="lg" style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
        <Card title="New simulation">
          <Button variant="primary">Run</Button>
        </Card>
      </Stack>
    </div>
  );
}
```

**Dark is the default.** For light mode set `data-theme="light"` on a root
ancestor (e.g. `<html data-theme="light">`); tokens re-map automatically. For
reduced motion set `data-motion="reduced"`.

## Styling idiom: tokens + props, not utility classes

There is **no utility-class system**. Style components through their **props**,
and style your own layout glue with `var(--token)`. Real token names (all
defined in the bound `styles.css` closure):

| Family | Names |
|---|---|
| Surfaces | `--color-surface-0` (app bg) … `--color-surface-3`, `--color-border` |
| Text | `--color-text`, `--color-text-muted`, `--color-text-subtle` |
| Brand | `--color-brand-600` (primary), `--color-brand-400/500/700` |
| Spacing | `--space-xs` `sm` `md` `lg` `xl` `2xl` (4px scale) |
| Radius | `--radius-sm` `md` `lg` `full` |
| Motion | `--duration-fast/base`, `--ease-standard` |
| Runtime hues | `--rt-callstack` `--rt-microtask` `--rt-eventloop` `--rt-taskqueue` `--rt-libuv` `--rt-threadpool` `--rt-network` `--rt-websocket` `--rt-worker` … |

Runtime components take a **`category`** prop (one of `callstack`, `heap`,
`webapi`, `nodeapi`, `taskqueue`, `microtask`, `eventloop`, `libuv`,
`threadpool`, `os`, `rendering`, `network`, `websocket`, `emitter`, `streams`,
`backpressure`, `worker`, `engine`) that sets its colour, glyph and provider
label. To tint your own element with a category colour, put `data-rt="<category>"`
on it and use `var(--rt)` / `var(--rt-soft)`.

Key component props: `Button variant="primary|secondary|ghost|danger" size`;
`StatusBadge state="idle|active|waiting|blocked|completed|error"` or
`category`; `MessageToken kind state priority`; `RuntimeNode category count
state`; `Timeline total current onSeek`; `MediaControls playing speed …`.

## Where the truth lives

- **Styling:** read the bound `styles.css` and its `@import "./_ds_bundle.css"`
  — every token and component class is there.
- **Per component:** each `<Name>.prompt.md` (usage) and `<Name>.d.ts`
  (`<Name>Props` — the exact API). Read these before composing a component.
- Layout primitives: compose with `Stack` (`direction`, `gap`, `align`, `wrap`)
  rather than hand-writing flexbox.
