import React from 'react';
import './Link.css';

/** Link style — maps to the Figma "Type" variant. */
export type LinkVariant = 'standard' | 'inline';

/** Semantic color of the link — maps to the Figma "State" variant. */
export type LinkStatus =
  | 'default'
  | 'information'
  | 'error'
  | 'warning'
  | 'success';

/** Link size — maps to the Figma "Size" variant. */
export type LinkSize = 'default' | 'md' | 'lg';

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Link label (Figma: "Label"). */
  children?: React.ReactNode;
  /** Visual style (Figma: "Type"). `inline` sits within body text and is always underlined. */
  variant?: LinkVariant;
  /** Semantic color (Figma: "State"). */
  status?: LinkStatus;
  /** Size (Figma: "Size"). */
  size?: LinkSize;
  /**
   * Disabled state (Figma: "Status=disabled"). Native `<a>` has no `disabled`
   * attribute, so this sets `aria-disabled`, removes the element from the tab
   * order, drops `href` (nothing to navigate to), and blocks activation.
   */
  disabled?: boolean;
  /** Icon rendered before the label (Figma: "Icon left" + "↘ Icon left"). */
  iconLeft?: React.ReactNode;
  /** Icon rendered after the label (Figma: "Icon right" + "↘ Icon right"). */
  iconRight?: React.ReactNode;
}

/**
 * Link — TheCollectiveKit navigation atom.
 *
 * Accessibility (WCAG 2.1 AA):
 * - Renders a native `<a>`, so Enter activation, focus order, and the `link`
 *   role come from the platform.
 * - Focus is always visible via `:focus-visible` (see Link.css).
 * - `disabled` is expressed with `aria-disabled` (native anchors cannot be
 *   disabled); the link is removed from tab order and activation is blocked.
 * - Icons are decorative (`aria-hidden`); the label carries the accessible name.
 *   A text-free link must be given an `aria-label` — a dev warning fires when
 *   one is missing.
 * - `target="_blank"` automatically gains `rel="noopener noreferrer"` unless a
 *   `rel` is supplied, closing the reverse-tabnabbing hole.
 *
 * Connected to Figma via Link.figma.tsx (Code Connect).
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      children,
      variant = 'standard',
      status = 'default',
      size = 'default',
      disabled = false,
      iconLeft,
      iconRight,
      className,
      href,
      target,
      rel,
      onClick,
      tabIndex,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv !== 'production' && children == null && !ariaLabel) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Link] A link with no visible text needs an accessible name. Pass `aria-label`.',
      );
    }

    const classes = [
      'tck-link',
      `tck-link--${variant}`,
      `tck-link--status-${status}`,
      `tck-link--${size}`,
      disabled && 'tck-link--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Open-in-new links must not leak the opener window (reverse tabnabbing).
    const safeRel =
      rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);

    return (
      <a
        ref={ref}
        {...rest}
        className={classes}
        href={disabled ? undefined : href}
        target={target}
        rel={safeRel}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : tabIndex}
        aria-label={ariaLabel}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {iconLeft && (
          <span className="tck-link__icon tck-link__icon--left" aria-hidden="true">
            {iconLeft}
          </span>
        )}
        {children && <span className="tck-link__label">{children}</span>}
        {iconRight && (
          <span className="tck-link__icon tck-link__icon--right" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </a>
    );
  },
);

Link.displayName = 'Link';

export default Link;
