import React from 'react';
import './Radio.css';

/** Radio size — maps to the Figma "Size" variant. */
export type RadioSize = 'lg' | 'md';

/** Semantic feedback colour — maps to the Figma "State" variant. */
export type RadioFeedback = 'default' | 'error';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Primary text beside the control (Figma: "Label"). */
  label?: React.ReactNode;
  /** Secondary text under the label (Figma: "Subtext" + "↘ Subtext"). */
  subLabel?: React.ReactNode;
  /** Renders the text block (Figma: "Content"). When false, pass `aria-label`. */
  showLabel?: boolean;
  /** Size (Figma: "Size"). */
  size?: RadioSize;
  /** Feedback colour (Figma: "State"). Also sets `aria-invalid`. */
  feedback?: RadioFeedback;
  /** Controlled selected state (Figma: "Type=selected"). */
  checked?: boolean;
  /** Uncontrolled initial state (Figma: "Type=selected"). */
  defaultChecked?: boolean;
  /** Disabled state (Figma: "Status=disabled"). */
  disabled?: boolean;
  /** Class applied to the outer `<label>` wrapper. */
  className?: string;
}

/**
 * Radio — TheCollectiveKit single-choice selection atom.
 *
 * Accessibility (WCAG 2.1 AA):
 * - Renders a real `<input type="radio">`, so the browser supplies the radio
 *   role, checked state, roving tab stop and arrow-key navigation for free.
 *   Grouping is a native behaviour of the shared `name` attribute — give every
 *   radio in one choice the same `name`, and wrap the group in a `<fieldset>`
 *   with a `<legend>` (or `role="radiogroup"` + `aria-labelledby`) so the group
 *   itself has an accessible name.
 * - The whole component is a `<label>`, so the label and sub-label are part of
 *   the hit target and are implicitly associated with the input. The `md`
 *   circle is only 20px, so the input overlay is inflated to 24×24 (SC 2.5.8).
 * - The sub-label is wired via `aria-describedby` so it is announced after the
 *   accessible name rather than becoming part of it.
 * - `feedback="error"` sets `aria-invalid`, so the error is not carried by
 *   colour alone (SC 1.4.1). Pair it with an explanatory `subLabel`.
 * - Focus is always visible via `:focus-visible` (see Radio.css), and the
 *   dot/fill transitions are disabled under `prefers-reduced-motion`.
 * - Hiding the text (`showLabel={false}`) requires an `aria-label`; a dev
 *   warning fires when one is missing.
 *
 * Both controlled (`checked` + `onChange`) and uncontrolled (`defaultChecked`)
 * usage work — every visual state is derived in CSS from the input, so the
 * component holds no state of its own.
 *
 * Connected to Figma via Radio.figma.ts (Code Connect).
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      subLabel,
      showLabel = true,
      size = 'lg',
      feedback = 'default',
      disabled = false,
      className,
      id,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? `${reactId}-radio`;
    const subLabelId = `${reactId}-sublabel`;
    const hasSubLabel = showLabel && subLabel != null && subLabel !== '';

    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv !== 'production' && !showLabel && !ariaLabel) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Radio] A radio without visible text needs an accessible name. Pass `aria-label`.',
      );
    }

    const describedBy =
      [ariaDescribedBy, hasSubLabel ? subLabelId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    const classes = [
      'tck-radio',
      `tck-radio--${size}`,
      `tck-radio--feedback-${feedback}`,
      disabled && 'tck-radio--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={classes} htmlFor={inputId}>
        <span className="tck-radio__control">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            className="tck-radio__input"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            aria-invalid={feedback === 'error' || undefined}
            {...rest}
          />
          <span className="tck-radio__circle" aria-hidden="true">
            <span className="tck-radio__dot" />
          </span>
        </span>
        {showLabel && (label != null || subLabel != null) && (
          <span className="tck-radio__text">
            {label != null && <span className="tck-radio__label">{label}</span>}
            {hasSubLabel && (
              <span className="tck-radio__sub-label" id={subLabelId}>
                {subLabel}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Radio.displayName = 'Radio';

export default Radio;
