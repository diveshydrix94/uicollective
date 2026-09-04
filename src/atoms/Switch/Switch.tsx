import React from 'react';
import './Switch.css';

/** Switch size — maps to the Figma "Size" variant. */
export type SwitchSize = 'lg' | 'md';

/** Semantic feedback colour — maps to the Figma "Feedback" variant. */
export type SwitchFeedback = 'default' | 'error';

export interface SwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'role'
  > {
  /** Primary text beside the control (Figma: "Label"). */
  label?: React.ReactNode;
  /** Secondary text under the label (Figma: "Sub-label" + "↘ Sub-label"). */
  subLabel?: React.ReactNode;
  /** Renders the text block (Figma: "Text"). When false, pass `aria-label`. */
  showLabel?: boolean;
  /** Size (Figma: "Size"). */
  size?: SwitchSize;
  /** Feedback colour (Figma: "Feedback"). */
  feedback?: SwitchFeedback;
  /** Controlled on/off state (Figma: "State"). */
  checked?: boolean;
  /** Uncontrolled initial state (Figma: "State"). */
  defaultChecked?: boolean;
  /** Disabled state (Figma: "Status=disabled"). */
  disabled?: boolean;
  /** Class applied to the outer `<label>` wrapper. */
  className?: string;
}

/**
 * Switch — TheCollectiveKit on/off control atom.
 *
 * Accessibility (WCAG 2.1 AA):
 * - Renders a real `<input type="checkbox" role="switch">`, so Space toggles it,
 *   focus order is native, and `checked` is exposed to assistive tech without
 *   any ARIA bookkeeping.
 * - The whole component is a `<label>`, so the label and sub-label are a hit
 *   target and are implicitly associated with the input.
 * - The sub-label is wired via `aria-describedby` so it is announced after the
 *   accessible name rather than becoming part of it.
 * - Focus is always visible via `:focus-visible` (see Switch.css), and the
 *   knob transition is disabled under `prefers-reduced-motion`.
 * - Hiding the text (`showLabel={false}`) requires an `aria-label`; a dev
 *   warning fires when one is missing.
 *
 * Both controlled (`checked` + `onChange`) and uncontrolled (`defaultChecked`)
 * usage work — every visual state is derived in CSS from the input, so the
 * component holds no state of its own.
 *
 * Connected to Figma via Switch.figma.tsx (Code Connect).
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
    const inputId = id ?? `${reactId}-switch`;
    const subLabelId = `${reactId}-sublabel`;
    const hasSubLabel = showLabel && subLabel != null && subLabel !== '';

    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv !== 'production' && !showLabel && !ariaLabel) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Switch] A switch without visible text needs an accessible name. Pass `aria-label`.',
      );
    }

    const describedBy =
      [ariaDescribedBy, hasSubLabel ? subLabelId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    const classes = [
      'tck-switch',
      `tck-switch--${size}`,
      `tck-switch--feedback-${feedback}`,
      disabled && 'tck-switch--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={classes} htmlFor={inputId}>
        <span className="tck-switch__control">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="tck-switch__input"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            {...rest}
          />
          <span className="tck-switch__track" aria-hidden="true">
            <span className="tck-switch__knob" />
          </span>
        </span>
        {showLabel && (label != null || subLabel != null) && (
          <span className="tck-switch__text">
            {label != null && (
              <span className="tck-switch__label">{label}</span>
            )}
            {hasSubLabel && (
              <span className="tck-switch__sub-label" id={subLabelId}>
                {subLabel}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;
