import React from 'react';
import './Checkbox.css';

/** Checkbox size — maps to the Figma "Size" variant. */
export type CheckboxSize = 'lg' | 'md';

/** Semantic feedback colour — maps to the Figma "Feedback" variant. */
export type CheckboxFeedback = 'default' | 'error';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Primary text beside the control (Figma: "Label"). */
  label?: React.ReactNode;
  /** Secondary text under the label (Figma: "Subtext" + "↘ Subtext"). */
  subLabel?: React.ReactNode;
  /** Renders the text block (Figma: "Content"). When false, pass `aria-label`. */
  showLabel?: boolean;
  /** Size (Figma: "Size"). */
  size?: CheckboxSize;
  /** Feedback colour (Figma: "Feedback"). Also sets `aria-invalid`. */
  feedback?: CheckboxFeedback;
  /** Mixed state (Figma: "Type=indeterminate"). Wins over `checked` visually. */
  indeterminate?: boolean;
  /** Controlled checked state (Figma: "Type=selected"). */
  checked?: boolean;
  /** Uncontrolled initial state (Figma: "Type=selected"). */
  defaultChecked?: boolean;
  /** Disabled state (Figma: "State=disabled"). */
  disabled?: boolean;
  /** Class applied to the outer `<label>` wrapper. */
  className?: string;
}

/** Assign one value to both a forwarded ref and our internal ref. */
function setRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

/**
 * Checkbox — TheCollectiveKit selection control atom.
 *
 * Accessibility (WCAG 2.1 AA):
 * - Renders a real `<input type="checkbox">`, so Space toggles it, focus order
 *   is native, and checked / mixed state is exposed to assistive tech without
 *   any ARIA bookkeeping. The mixed state uses the native `indeterminate` DOM
 *   property (announced as "mixed"), which CSS also reads via `:indeterminate`.
 * - The whole component is a `<label>`, so the label and sub-label are part of
 *   the hit target and are implicitly associated with the input. The `md` box
 *   is only 20px, so the input overlay is inflated to 24×24 (SC 2.5.8).
 * - The sub-label is wired via `aria-describedby` so it is announced after the
 *   accessible name rather than becoming part of it.
 * - `feedback="error"` sets `aria-invalid`, so the error is not carried by
 *   colour alone (SC 1.4.1). Pair it with an explanatory `subLabel`.
 * - Focus is always visible via `:focus-visible` (see Checkbox.css), and the
 *   glyph/fill transitions are disabled under `prefers-reduced-motion`.
 * - Hiding the text (`showLabel={false}`) requires an `aria-label`; a dev
 *   warning fires when one is missing.
 *
 * Both controlled (`checked` + `onChange`) and uncontrolled (`defaultChecked`)
 * usage work — every visual state is derived in CSS from the input, so the
 * component holds no state of its own.
 *
 * Connected to Figma via Checkbox.figma.ts (Code Connect).
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      subLabel,
      showLabel = true,
      size = 'lg',
      feedback = 'default',
      indeterminate = false,
      disabled = false,
      className,
      id,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const reactId = React.useId();
    const inputId = id ?? `${reactId}-checkbox`;
    const subLabelId = `${reactId}-sublabel`;
    const hasSubLabel = showLabel && subLabel != null && subLabel !== '';

    // `indeterminate` has no HTML attribute — it is a DOM property only, so it
    // must be re-applied whenever it or the checked state changes.
    React.useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate, rest.checked, rest.defaultChecked]);

    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv !== 'production' && !showLabel && !ariaLabel) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Checkbox] A checkbox without visible text needs an accessible name. Pass `aria-label`.',
      );
    }

    const describedBy =
      [ariaDescribedBy, hasSubLabel ? subLabelId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    const classes = [
      'tck-checkbox',
      `tck-checkbox--${size}`,
      `tck-checkbox--feedback-${feedback}`,
      disabled && 'tck-checkbox--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={classes} htmlFor={inputId}>
        <span className="tck-checkbox__control">
          <input
            ref={(node) => {
              inputRef.current = node;
              setRef(ref, node);
            }}
            id={inputId}
            type="checkbox"
            className="tck-checkbox__input"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            aria-invalid={feedback === 'error' || undefined}
            {...rest}
          />
          <span className="tck-checkbox__box" aria-hidden="true">
            <svg
              className="tck-checkbox__glyph tck-checkbox__glyph--check"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <path d="M8.795 15.875L5.325 12.405C4.935 12.015 4.305 12.015 3.915 12.405C3.525 12.795 3.525 13.425 3.915 13.815L8.095 17.995C8.485 18.385 9.115 18.385 9.505 17.995L20.085 7.415C20.475 7.025 20.475 6.395 20.085 6.005C19.695 5.615 19.065 5.615 18.675 6.005L8.795 15.875Z" />
            </svg>
            <svg
              className="tck-checkbox__glyph tck-checkbox__glyph--dash"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <path d="M18 13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z" />
            </svg>
          </span>
        </span>
        {showLabel && (label != null || subLabel != null) && (
          <span className="tck-checkbox__text">
            {label != null && (
              <span className="tck-checkbox__label">{label}</span>
            )}
            {hasSubLabel && (
              <span className="tck-checkbox__sub-label" id={subLabelId}>
                {subLabel}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
