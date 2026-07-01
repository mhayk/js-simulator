import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import "./Input.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the input. */
  label?: string;
  /** Helper text shown below the input. */
  hint?: string;
  /** Error message; also flags the input as invalid. */
  error?: string;
}

/** Labelled text input with hint and error states. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const invalid = Boolean(error);
  const describedById = error || hint ? `${inputId}-hint` : undefined;

  const inputClasses = ["ds-input", invalid && "ds-input--invalid", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ds-field">
      {label && (
        <label className="ds-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={inputClasses}
        aria-invalid={invalid || undefined}
        aria-describedby={describedById}
        {...rest}
      />
      {(error || hint) && (
        <span
          id={describedById}
          className={["ds-field__hint", error && "ds-field__hint--error"]
            .filter(Boolean)
            .join(" ")}
        >
          {error ?? hint}
        </span>
      )}
    </div>
  );
});
