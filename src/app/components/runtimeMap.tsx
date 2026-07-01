import { useState } from "react";
import { RUNTIME_CATEGORIES } from "js-simulator";
import type { RuntimeCategory } from "js-simulator";
import "./runtimeMap.css";

export interface MapItemDetail {
  what?: string;
  example?: string;
  gotcha?: string;
  related?: string;
}

export interface MapItem {
  category: RuntimeCategory;
  /** Override the default category label (e.g. "setTimeout" under Web APIs). */
  label?: string;
  sub?: string;
  detail?: MapItemDetail;
}

export interface MapGroup {
  title: string;
  items: MapItem[];
}

export interface RuntimeMapProps {
  eyebrow: string;
  title: string;
  lead: string;
  accent: RuntimeCategory;
  groups: MapGroup[];
}

interface Selected extends MapItem {
  gi: number;
  ii: number;
}

export function RuntimeMap({ eyebrow, title, lead, accent, groups }: RuntimeMapProps) {
  const first = { ...groups[0].items[0], gi: 0, ii: 0 };
  const [sel, setSel] = useState<Selected>(first);
  const meta = RUNTIME_CATEGORIES[sel.category];

  return (
    <div className="rmap ds-root" data-rt={accent}>
      <div>
        <header className="rmap__head" data-rt={accent}>
          <div className="rmap__eyebrow">{eyebrow}</div>
          <h1 className="rmap__title">{title}</h1>
          <p className="rmap__lead">{lead}</p>
        </header>

        {groups.map((group, gi) => (
          <section className="rmap__group" key={group.title}>
            <div className="rmap__group-label">{group.title}</div>
            <div className="rmap__cards">
              {group.items.map((item, ii) => {
                const m = RUNTIME_CATEGORIES[item.category];
                const active = sel.gi === gi && sel.ii === ii;
                return (
                  <button
                    key={`${item.category}-${item.label ?? ""}-${ii}`}
                    type="button"
                    className={`rmap__card${active ? " rmap__card--active" : ""}`}
                    data-rt={item.category}
                    onClick={() => setSel({ ...item, gi, ii })}
                  >
                    <span className="rmap__card-glyph">{m.glyph}</span>
                    <div className="rmap__card-label">{item.label ?? m.label}</div>
                    <div className="rmap__card-sub">{item.sub ?? m.provider}</div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="rmap__panel" data-rt={sel.category} aria-live="polite">
        <div className="rmap__panel-title">{sel.label ?? meta.label}</div>
        <div className="rmap__panel-provider">Provided by {meta.provider}</div>
        <dl>
          <dt>What it does</dt>
          <dd>{sel.detail?.what ?? meta.blurb}</dd>
          {sel.detail?.example && (
            <>
              <dt>Example</dt>
              <dd><code>{sel.detail.example}</code></dd>
            </>
          )}
          {sel.detail?.gotcha && (
            <>
              <dt>Watch out</dt>
              <dd>{sel.detail.gotcha}</dd>
            </>
          )}
          {sel.detail?.related && (
            <>
              <dt>Related</dt>
              <dd>{sel.detail.related}</dd>
            </>
          )}
        </dl>
        {!sel.detail && <p className="rmap__panel-hint">Select any block to inspect it.</p>}
      </aside>
    </div>
  );
}
