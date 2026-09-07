import React from 'react';
import './Tabs.css';

/** Indicator style — maps to the Figma "Type" variant. */
export type TabsVariant = 'default' | 'filled';

/** Tabs size — maps to the Figma "Size" variant. */
export type TabsSize = 'default' | 'lg';

/** Horizontal roominess of each tab — maps to the Figma "Width" variant. */
export type TabsWidth = 'default' | 'wide';

/** Bar surface — maps to the Figma "Background" variant. */
export type TabsBackground = 'filled' | 'transparent';

/** A single tab in the bar (Figma: ".Tab Items"). */
export interface TabsItem {
  /** Value reported by `onChange` and compared against `value`/`defaultValue`. */
  value: string;
  /** Visible tab text (Figma: the ".Tab Items" label). */
  label: React.ReactNode;
  /** Disables this tab only; it is skipped by arrow-key navigation. */
  disabled?: boolean;
  /** Explicit id for the tab element. Defaults to a generated, stable id. */
  id?: string;
  /** id of the `role="tabpanel"` this tab controls, wired via `aria-controls`. */
  panelId?: string;
}

export interface TabsProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onChange' | 'defaultValue' | 'role'
  > {
  /** The tabs to render, in visual order. */
  items: TabsItem[];
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial selection. Defaults to the first enabled tab. */
  defaultValue?: string;
  /** Fired with the newly selected value and the originating event. */
  onChange?: (
    value: string,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  /** Indicator style (Figma: "Type"). */
  variant?: TabsVariant;
  /** Size (Figma: "Size"). */
  size?: TabsSize;
  /** Horizontal roominess (Figma: "Width"). */
  width?: TabsWidth;
  /** Bar surface (Figma: "Background"). */
  background?: TabsBackground;
}

/**
 * Tabs — TheCollectiveKit tab bar atom.
 *
 * Accessibility (WCAG 2.1 AA), following the WAI-ARIA "Tabs with automatic
 * activation" pattern:
 * - The bar is a `role="tablist"` of native `<button role="tab">` elements, so
 *   Enter/Space activation and the button role come from the platform.
 * - One tab stop for the whole bar (roving `tabIndex`): Left/Right move between
 *   tabs and select as they go, Home/End jump to the first/last enabled tab.
 * - `aria-selected` exposes the selection; `aria-controls` links each tab to its
 *   panel when `panelId` is supplied.
 * - Disabled tabs use the native `disabled` attribute and are skipped by the
 *   arrow keys.
 * - Focus is always visible via `:focus-visible`, inset so the ring is not
 *   clipped when the bar scrolls (see Tabs.css).
 * - The bar scrolls horizontally rather than truncating, so every tab stays
 *   reachable at 320px (1.4.10 Reflow).
 * - A tablist needs an accessible name; a dev warning fires when neither
 *   `aria-label` nor `aria-labelledby` is given.
 *
 * Both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`)
 * usage work; a controlled `value` is never overwritten internally.
 *
 * Connected to Figma via Tabs.figma.tsx (Code Connect).
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      value,
      defaultValue,
      onChange,
      variant = 'default',
      size = 'default',
      width = 'default',
      background = 'filled',
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const reactId = React.useId();
    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string | undefined>(
      () => defaultValue ?? items.find((item) => !item.disabled)?.value,
    );
    const selected = isControlled ? value : internalValue;

    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv !== 'production' && !ariaLabel && !ariaLabelledBy) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Tabs] A tablist needs an accessible name. Pass `aria-label` or `aria-labelledby`.',
      );
    }

    const select = (
      item: TabsItem,
      event:
        | React.MouseEvent<HTMLButtonElement>
        | React.KeyboardEvent<HTMLButtonElement>,
    ) => {
      if (item.disabled || item.value === selected) return;
      if (!isControlled) setInternalValue(item.value);
      onChange?.(item.value, event);
    };

    // Arrow keys move focus and select in one step, and wrap around; disabled
    // tabs are not focus targets, so they are filtered out first.
    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
      index: number,
    ) => {
      const enabled = items
        .map((item, i) => ({ item, i }))
        .filter((entry) => !entry.item.disabled);
      if (enabled.length === 0) return;

      const current = enabled.findIndex((entry) => entry.i === index);
      let next: number;
      switch (event.key) {
        case 'ArrowRight':
          next = (current + 1) % enabled.length;
          break;
        case 'ArrowLeft':
          next = (current - 1 + enabled.length) % enabled.length;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = enabled.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const target = enabled[next];
      tabRefs.current[target.i]?.focus();
      select(target.item, event);
    };

    const classes = [
      'tck-tabs',
      `tck-tabs--type-${variant}`,
      `tck-tabs--size-${size}`,
      `tck-tabs--width-${width}`,
      `tck-tabs--bg-${background}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // With nothing selected there is no natural tab stop, so the first enabled
    // tab takes it — the bar must never fall out of the tab order.
    const fallbackStop = items.findIndex((item) => !item.disabled);
    const hasSelection = items.some(
      (item) => !item.disabled && item.value === selected,
    );

    return (
      <div
        ref={ref}
        {...rest}
        className={classes}
        role="tablist"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {items.map((item, index) => {
          const isSelected = !item.disabled && item.value === selected;
          return (
            <button
              key={item.value}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={item.id ?? `${reactId}-tab-${item.value}`}
              type="button"
              role="tab"
              className="tck-tabs__tab"
              aria-selected={isSelected}
              aria-controls={item.panelId}
              disabled={item.disabled}
              tabIndex={
                isSelected || (!hasSelection && index === fallbackStop) ? 0 : -1
              }
              onClick={(event) => select(item, event)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="tck-tabs__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';

export default Tabs;
