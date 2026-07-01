import type { ReactNode } from "react";
import type { RuntimeCategory } from "js-simulator";
import "./compare.css";

export function Chip({ children, rt }: { children: ReactNode; rt?: RuntimeCategory }) {
  return (
    <span className="cmp__chip" data-rt={rt}>
      {children}
    </span>
  );
}

export const Yes = () => <span className="cmp__yes">✓ yes</span>;
export const No = () => <span className="cmp__no">✕ no</span>;

export interface CompareColumn {
  key: string;
  label: string;
  rt?: RuntimeCategory;
}
export interface CompareRow {
  label: string;
  cells: Record<string, ReactNode>;
}

export function ComparePage({
  eyebrow,
  title,
  category,
  lead,
  columns,
  rows,
  children,
}: {
  eyebrow: string;
  title: string;
  category?: RuntimeCategory;
  lead: string;
  columns: CompareColumn[];
  rows: CompareRow[];
  children?: ReactNode;
}) {
  return (
    <div className="cmp ds-root" data-rt={category}>
      <div className="cmp__head">
        <div className="cmp__eyebrow">{eyebrow}</div>
        <h1 className="cmp__title">{title}</h1>
        <p className="cmp__lead">{lead}</p>
      </div>

      <table className="cmp__table">
        <thead>
          <tr>
            <th className="cmp__row-label" />
            {columns.map((c) => (
              <th key={c.key} data-rt={c.rt}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="cmp__row-label">{r.label}</td>
              {columns.map((c) => (
                <td key={c.key}>{r.cells[c.key] ?? <No />}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {children}
    </div>
  );
}
