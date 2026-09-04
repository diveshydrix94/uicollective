# Accessibility gate (WCAG 2.1 AA)

Every generated component must satisfy this before it can be published. Treat it as
a checklist, not advice. When a row does not apply to the component, note why.

## Universal checklist
- [ ] **Semantic element first.** Use the correct native element (`<button>`,
      `<a>`, `<input>`, `<nav>`, `<ul>`…). Reach for ARIA only when no native
      element fits. *"No ARIA is better than bad ARIA."*
- [ ] **Keyboard operable (2.1.1).** Every action reachable and operable with the
      keyboard. Native elements give this free; custom widgets must implement the
      [expected key interactions](#keyboard-interaction-patterns).
- [ ] **Visible focus (2.4.7).** `:focus-visible` outline with ≥2px, offset, using
      a token (`--tck-focus-ring`). Never `outline: none` without a replacement.
- [ ] **Focus order & no traps (2.4.3 / 2.1.2).** Logical tab order; overlays trap
      and restore focus correctly.
- [ ] **Accessible name (4.1.2).** Every control exposes a name — visible text, or
      `aria-label` / `aria-labelledby` for icon-only controls. Warn in dev when an
      icon-only control has no name (see Button).
- [ ] **State exposed to AT.** Reflect state with the right attribute:
      `aria-disabled`, `aria-pressed`, `aria-expanded`, `aria-selected`,
      `aria-checked`, `aria-busy`, `aria-invalid`, `aria-current`.
- [ ] **Color contrast (1.4.3).** Text ≥ 4.5:1 (≥3:1 for large text); UI/graphics
      boundaries ≥ 3:1 (1.4.11). Contrast is a token responsibility — do not ship a
      variant that fails.
- [ ] **Don't rely on color alone (1.4.1).** Error/success also carry an icon or
      text, not just a hue.
- [ ] **Target size.** Interactive targets ≥ 24×24 CSS px (2.5.8).
- [ ] **Reduced motion (2.3.3).** Gate animations behind
      `@media (prefers-reduced-motion: reduce)`.
- [ ] **Respect passthrough.** Spread `...rest` and merge `className`/`aria-*` so
      consumers can add attributes.

## Keyboard interaction patterns (custom widgets)
Follow the WAI-ARIA Authoring Practices for the widget's `role`:

| Widget | Keys |
|---|---|
| Button | Enter / Space activate |
| Checkbox / Switch | Space toggles |
| Radio group | Arrow keys move & select; one tab stop |
| Tabs | Arrow keys switch; Home/End; one tab stop |
| Menu / Listbox | Up/Down move, Enter select, Esc close, typeahead |
| Dialog/Modal | Esc closes; focus trapped; restore focus on close |
| Combobox/Select | Down opens, arrows navigate, Enter select, Esc close |
| Tooltip | Shows on focus + hover; Esc dismisses |
| Accordion | Enter/Space toggles; arrows optional |

## Forms
- Associate every input with a `<label htmlFor>` (or `aria-labelledby`).
- Link helper/error text via `aria-describedby`; set `aria-invalid` on error.
- Required fields: `required` + a visible indicator (not color alone).
- Group related controls in `<fieldset>` + `<legend>` (e.g. radio groups).

## Icons & images
- Decorative icons: `aria-hidden="true"`, empty/absent alt.
- Meaningful icons: provide a text alternative or the control's `aria-label`.

## How to verify
- Reason through the checklist against the generated code.
- If the repo has axe / jest-axe / Storybook a11y available, run it. If not, do the
  static review and note that automated testing is not wired up.
- Manual sanity: Tab through it, activate with keyboard, check focus is visible.
