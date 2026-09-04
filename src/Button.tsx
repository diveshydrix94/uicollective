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
  /** Icon rendered before the label (Figma: "Icon left" + "↘Icon left"). */
  iconLeft?: React.ReactNode;
  /** Icon rendered after the label (Figma: "Icon right" + "↘ Icon right"). */
  iconRight?: React.ReactNode;
  /** Native button type attribute. */
  htmlType?: 'button' | 'submit' | 'reset';
}

/**
 * Button — TheCollectiveKit primary action component.
 * Connected to Figma via Button.figma.tsx (Code Connect).
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  status = 'default',
  size = 'default',
  disabled = false,
  iconLeft,
  iconRight,
  htmlType = 'button',
  className,
  ...rest
}) => {
  const classes = [
    'tck-btn',
    `tck-btn--${variant}`,
    `tck-btn--status-${status}`,
    `tck-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={htmlType} className={classes} disabled={disabled} {...rest}>
      {iconLeft && <span className="tck-btn__icon tck-btn__icon--left">{iconLeft}</span>}
      {children && <span className="tck-btn__label">{children}</span>}
      {iconRight && <span className="tck-btn__icon tck-btn__icon--right">{iconRight}</span>}
    </button>
  );
};

export default Button;
