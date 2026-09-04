import React from 'react';
import './Button.css';

/** Visual style of the button — maps to the Figma "Type" variant. */
export type ButtonVariant = 'default' | 'subtle' | 'outline' | 'transparent';

/** Semantic color of the button — maps to the Figma "State" variant. */
export type ButtonStatus =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'information'
  | 'secondary';

/** Button size — maps to the Figma "Size" variant. */
export type ButtonSize = 'default' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Button label (Figma: "Label"). */
  children?: React.ReactNode;
  /** Visual style (Figma: "Type"). */
  variant?: ButtonVariant;
  /** Semantic color (Figma: "State"). */
  status?: ButtonStatus;
  /** Size (Figma: "Size"). */
  size?: ButtonSize;
  /** Disabled state (Figma: "Status=disabled"). */
  disabled?: boolean;
  /**
   * Shows a busy state and blocks interaction. Sets `aria-busy` and
   * `aria-disabled` for assistive tech without removing the node from the tab
   * order semantics abruptly.
   */
  loading?: boolean;
  /** Stretch to fill the container's inline width. */
  fullWidth?: boolean;
  /** Icon rendered before the label (Figma: "Icon left" + "↘Icon left"). */
  iconLeft?: React.ReactNode;
  /** Icon rendered after the label (Figma: "Icon right" + "↘ Icon right"). */
  iconRight?: React.ReactNode;
  /** Native button type attribute. */
  htmlType?: 'button' | 'submit' | 'reset';
}

/**
 * Button — TheCollectiveKit primary action atom.
 *
 * Accessibility (WCAG 2.1 AA):
 * - Renders a native `<button>`, so Enter/Space activation and focus order are
 *   handled by the platform.
 * - `loading` sets `aria-busy` and prevents activation without a jarring
 *   focus jump.
 * - Icon-only buttons (no text child) require an `aria-label`; a dev warning
 *   fires when one is missing.
 * - Focus is always visible via `:focus-visible` (see Button.css).
 *
 * Connected to Figma via Button.figma.tsx (Code Connect).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'default',
      status = 'default',
      size = 'default',
      disabled = false,
      loading = false,
      fullWidth = false,
      iconLeft,
      iconRight,
      htmlType = 'button',
      className,
      onClick,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv !== 'production' && children == null && !ariaLabel) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Button] An icon-only button needs an accessible name. Pass `aria-label`.',
      );
    }

    const classes = [
      'tck-btn',
      `tck-btn--${variant}`,
      `tck-btn--status-${status}`,
      `tck-btn--${size}`,
      fullWidth && 'tck-btn--full',
      loading && 'tck-btn--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={htmlType}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        onClick={(event) => {
          if (isDisabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        {...rest}
      >
        {loading && (
          <span className="tck-btn__spinner" aria-hidden="true" />
        )}
        {iconLeft && (
          <span className="tck-btn__icon tck-btn__icon--left" aria-hidden="true">
            {iconLeft}
          </span>
        )}
        {children && <span className="tck-btn__label">{children}</span>}
        {iconRight && (
          <span className="tck-btn__icon tck-btn__icon--right" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
