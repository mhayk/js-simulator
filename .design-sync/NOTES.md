# design-sync notes — js-simulator

## Build
- Package shape, no Storybook. Entry: `dist/js-simulator.js` (Vite library mode). `npm run build` emits ESM+CJS+CSS+types.
- The app (`src/app/`) is NOT part of the library build — `tsconfig.build.json` and vite-dts exclude `src/dev` and `src/app`. The library entry is `src/index.ts` only. A `js-simulator` self-alias in `vite.config.ts` + `tsconfig.json` paths lets the app import the DS by name; harmless for the library build.

## Rendering / previews
- **Dark-mode-default DS.** Tokens live in `:root`; light theme is `:root[data-theme="light"]`. Previews wrap content in `<div className="ds-root">` — that class provides the base font, text colour, surface background and `box-sizing`. Without `.ds-root`, Card titles and Input labels inherit browser defaults (serif, wrong colour). Every authored preview uses the Frame wrapper for this reason.
- All 13 components tripped `[GRID_OVERFLOW]` except Button/Stack — the preview Frames are wider than a grid cell. Fixed with `cfg.overrides.<Name>.cardMode = "column"` (one story per row, full width). Suits this DS since these components render stacked in the real app. If you add components, expect the same and add the override.
- No provider needed — components are self-styled from CSS custom properties; no React context required to render.

## Fonts
- No webfonts shipped by design. Base font = system sans (`ui-sans-serif, system-ui, …`); mono = `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. An earlier `"JetBrains Mono"` fallback was removed to avoid `[FONT_MISSING]` — it was never shipped and never primary.

## Known render warns
- None outstanding. (`[GRID_OVERFLOW]` is resolved via the cardMode overrides above, not a standing warn.)

## Re-sync risks (watch-list)
- The 4 original previews (Button/Card/Input/Stack) were authored under the old light-ish tokens, then re-verified under dark tokens — they render correctly now, but if the palette changes again, re-grade them.
- `.ds-root` is a hard requirement for styled output. If a future refactor moves base styles off `.ds-root`, every preview Frame and the conventions header must change together.
- The DS is growing rapidly (simulator screens). New components will need previews + a `cardMode: "column"` override; floor cards are acceptable for a fast sync.
- `globalName` is `JsSimulator`; the package name `js-simulator@0.0.0` is unpublished — the bundle is built from the local `dist/`, not npm.
