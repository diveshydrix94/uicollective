# Component API conventions (MUI / Ant Design parity)

Our components are **standalone** — they do not wrap MUI or Antd. But since this
library is the single source of truth, the public API must feel as polished as
theirs. Follow these conventions so any component is predictable to consumers.

## Shape
- **TypeScript, always.** Export a `XxxProps` interface and any enums
  (`XxxVariant`, `XxxSize`, …).
- **Extend the native element props** and omit what you override:
  ```ts
  interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> { … }
  ```
- **`forwardRef`** to the root DOM node, and set `displayName`. Consumers and
  libraries (forms, tooltips) depend on refs.
- **Spread `...rest`** onto the root element and **merge `className`** so consumers
  can extend styling and pass `data-*` / `aria-*`.

## Prop naming (align with MUI/Antd where they agree)
| Concept | Prop | Values |
|---|---|---|
| Visual style | `variant` | e.g. `default \| subtle \| outline \| transparent` |
| Semantic color | `status` (a.k.a. color) | `default \| success \| error \| warning \| information \| secondary` |
| Size | `size` | `default \| md \| lg` |
| Disabled | `disabled` | boolean |
| Loading | `loading` | boolean → sets `aria-busy` |
| Full width | `fullWidth` | boolean |
| Leading/trailing slot | `iconLeft` / `iconRight` (or `startAdornment`/`endAdornment`) | ReactNode |

Keep names consistent with existing atoms (see `Button`). Don't invent a new name
for a concept that already has one.

## Controlled & uncontrolled
For any stateful input (checkbox, switch, select, tabs, input):
- Support **controlled**: `value`/`checked`/`open` + `onChange`.
- Support **uncontrolled**: `defaultValue`/`defaultChecked`/`defaultOpen`.
- Never overwrite a controlled value internally.

## Styling
- **Token-based only.** Style through CSS variables (`--tck-*`). No literal color,
  spacing, radius, or font values inside components.
- Colocated CSS file per component, BEM-ish class names (`.tck-<name>`,
  `.tck-<name>--<variant>`, `.tck-<name>__<part>`), matching `Button.css`.
- Do not introduce a new styling system (no CSS-in-JS, no Tailwind) — match what
  exists.

## Defaults & ergonomics
- Sensible defaults for every optional prop; the **default value must match the
  Figma "default" variant**.
- No required props beyond the essential content/handler.
- Event handlers named `onX`; forward the native event object.
- Composition over configuration: prefer `children` / slot props over deep config
  objects.

## Polymorphism (when the design calls for it)
If a component legitimately renders different elements (e.g. Button as link), accept
an `as`/`component` prop and forward the ref — but only when the Figma design
implies it. Don't add it speculatively.

## Anti-patterns (reject these)
- Hardcoded colors / spacing.
- Swallowing `className`, `ref`, or `...rest`.
- Boolean explosion where an enum is clearer (`primary`, `secondary`, `danger`
  booleans → one `status` enum).
- Duplicating an atom's markup inside a molecule.
- Required props that block the common case.
