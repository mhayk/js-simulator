import { forwardRef, useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import "./Select.css";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  options: SelectOption[];
}

/** Native styled select with an optional label. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <div className="ds-select-field">
      {label && (
        <label className="ds-select-field__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className={["ds-select", className].filter(Boolean).join(" ")}>
        <select ref={ref} id={selectId} className="ds-select__el" {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="ds-select__chevron" aria-hidden>
          ▾
        </span>
      </div>
    </div>
  );
});

export interface SegmentedOption<T extends string = string> {
  label: ReactNode;
  value: T;
  /** Optional runtime category for an active-state colour tint. */
  rt?: string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label"?: string;
}

/** Toggle group for a small mutually-exclusive set (detail level, runtime). */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div className="ds-segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-rt={active ? o.rt : undefined}
            className={[
              "ds-segmented__item",
              active && "ds-segmented__item--active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
