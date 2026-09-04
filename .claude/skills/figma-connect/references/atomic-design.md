# Atomic Design rules

The library is layered strictly. Each component belongs to exactly one layer, and
dependencies only ever point *downward*.

```
organisms  →  molecules  →  atoms  →  (native elements + design tokens)
```

An import that goes the other way (an atom importing a molecule) is a hard error.

## Atoms
The smallest useful, indivisible UI units. They wrap a **native element** and style
it with **design tokens**. Scratch code is allowed here — this is the only layer
where you author raw markup + CSS.

Examples: `Button`, `Input`, `Checkbox`, `Radio`, `Switch`, `Badge`, `Tag`,
`Avatar`, `Icon`, `Spinner`, `Label`, `Link`, `Divider`.

Rules:
- Exactly one core native element (`<button>`, `<input>`, `<span>`…).
- No dependency on any other library component.
- Styling only via CSS variables / tokens — **no literal color, spacing, or font
  values** in the component (tokens may define them).
- Fully accessible on its own.

## Molecules
A small functional group that does **one job**, assembled **only from atoms**.

> **The molecule rule:** a molecule may not contain scratch DOM primitives or raw
> styled elements that duplicate an atom. If you find yourself writing a `<button>`
> or a styled `<input>` inside a molecule, stop — use the atom, or create the atom
> first with `/figma-connect`.

Layout wrappers (`<div>`, `<label>`, `<fieldset>`) and molecule-specific glue CSS
(gap, grid, positioning) are allowed — that is composition, not a primitive.

Examples: `Field` (Label + Input + helper/error text), `SearchBox` (Input +
Button), `MenuItem` (Icon + text + Badge), `Checkbox` + label group, `Pagination`
control, `FormRow`.

Rules:
- Imports come from `../../atoms` (the atoms barrel) only.
- Owns layout/orchestration and wiring (e.g. `htmlFor`/`id` linkage, error state
  propagation), not visual primitives.
- If a required atom is missing → STOP and report it. Never inline it.

## Organisms
A distinct, self-contained section of an interface, assembled from molecules and
atoms.

Examples: `Header`, `Card` (with header/body/actions molecules), `DataTable`,
`Form`, `NavBar`, `Modal`, `Toolbar`.

Rules:
- Imports come from `../../molecules` and `../../atoms`.
- Owns composition, layout, and section-level behavior/state wiring.
- No scratch primitives that belong in an atom.

## Folder shape (every layer, every component)
```
<ComponentName>/
  <ComponentName>.tsx          # implementation
  <ComponentName>.css          # token-based styles
  <ComponentName>.figma.tsx    # Code Connect mapping
  index.ts                     # re-exports component + types
```
Append the component to the layer barrel `src/<layer>/index.ts`. The root
`src/index.ts` already spreads all three layers, so consumers do:
```ts
import { Button, Field, Card } from 'ui-collective-figma-code';
```

## Reuse gate (before generating anything)
1. Does this component already exist in its layer? → extend, don't duplicate.
2. For molecules/organisms: do all needed children already exist as
   atoms/molecules? → if not, connect those first.
3. Only generate net-new code when reuse genuinely fails.
