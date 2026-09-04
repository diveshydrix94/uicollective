---
name: figma-connect
description: >-
  Generate a production-grade, accessible UI component from a Figma node and wire
  it to Figma Code Connect. Enforces Atomic Design (atoms/molecules/organisms),
  WCAG 2.1 AA accessibility, and an MUI/Ant-Design-grade component API, then
  publishes the Code Connect mapping so Figma Dev Mode shows the real code. Use
  whenever the user runs /figma-connect, shares a Figma component URL to "connect"
  or "implement", or asks to add a component to this library.
---

# figma-connect

Turn a **Figma node** into a **governed library component** and connect it back to
Figma. This library is the **single source of truth**: components are standalone
(they do NOT wrap MUI/Antd) but must match the quality bar those libraries set —
accessible, typed, composable, themeable.

## Invocation

```
/figma-connect <figma-node-url> <atom|molecule|organism> [ComponentName]
```

- `<figma-node-url>` — a Figma URL containing `?node-id=` (or `node-id` in the path).
- `<level>` — `atom`, `molecule`, or `organism`. If omitted, infer it (see
  **Classification**) and **confirm with the user before generating**.
- `[ComponentName]` — PascalCase. If omitted, derive from the Figma component name.

The user keeps a Figma token in `.env` as `FIGMA_ACCESS_TOKEN` (Code Connect *write*
scope). Everything else is automated by this skill.

## Non-negotiable rules (drift prevention)

These mirror the platform's AI Operating Model. Do not violate them, ever:

1. **Strict Atomic Design.** A component lives in exactly one layer.
   - **Atoms** are built from native elements + design tokens. Scratch code allowed.
   - **Molecules** are composed **only** from existing atoms. **No scratch DOM
     primitives, no raw styled elements that duplicate an atom.** If a needed atom
     does not exist, STOP and tell the user to `/figma-connect` the atom first.
   - **Organisms** are composed from molecules and atoms only.
   - Dependency direction is one-way: `atoms ← molecules ← organisms`. Never import
     "upward".
2. **Accessibility is a gate, not a nicety.** A component is not done until it
   passes the [accessibility checklist](references/accessibility.md). No merge, no
   publish otherwise.
3. **API parity.** Follow [api-conventions.md](references/api-conventions.md)
   (forwardRef, controlled/uncontrolled, native prop passthrough, token-based
   styling). No hardcoded colors — use CSS variables / tokens.
4. **Reuse first.** Before generating, search `src/atoms`, `src/molecules`,
   `src/organisms`. If it already exists, extend it — do not duplicate.
5. **No new dependencies, state managers, or styling systems.** Plain React +
   colocated CSS + tokens, matching the existing `Button` atom.
6. **Deterministic file layout.** One folder per component (see **Layout**). Update
   the barrel; never scatter files.

## Pipeline (run in order)

### 1. Read the design
Use the Figma MCP tools against the node URL:
- `get_code_connect_map` — is this node already connected? If yes, tell the user;
  only re-generate if they confirm (publishing will need `--force`).
- `get_design_context` / `get_metadata` — component name, variant properties
  (VARIANT / BOOLEAN / TEXT / INSTANCE_SWAP), nested layer names.
- `get_screenshot` — visual reference for states.
Record the **exact** Figma property names (including emoji/arrow prefixes like
`↘Icon left`) — Code Connect matches them literally.

### 2. Classify the component
Determine `atom | molecule | organism` from the design (see **Classification**).
State your reasoning in one line. If the level was not given, confirm before
continuing.

### 3. Check reuse & dependencies
- Grep the target layer for an existing component of the same name.
- For molecules/organisms, list the atoms/molecules it will compose and verify each
  **already exists** in the library. If one is missing, STOP and report which atom
  to connect first. Do NOT inline a missing primitive.

### 4. Generate the component
From the templates in `templates/`, create the folder (see **Layout**):
- `Component.tsx` — the implementation. Atoms: native element + tokens. Molecules/
  organisms: compose imported atoms only.
- `Component.css` — token-based styles (CSS variables, no literal colors).
- `Component.figma.tsx` — the Code Connect mapping you author (declarative
  `figma.connect`). The step 6–7 gate migrates it to the committed
  `Component.figma.ts` v2 template and deletes this `.figma.tsx`.
- `index.ts` — barrel for the folder.
Map every Figma variant property to a typed prop. Apply
[api-conventions.md](references/api-conventions.md) and bake in every applicable
item from [accessibility.md](references/accessibility.md).

### 5. Wire exports
Append the component to its layer barrel (`src/<layer>/index.ts`). The root
`src/index.ts` already re-exports each layer.

### 6–7. Migrate, validate, then auto-publish (one gate)
This step is **fully automated**: it publishes only when every check passes, and
otherwise stops with a **specific `FIGMA-CONNECT ERROR [stage]`** so the failing
stage is unambiguous. The single manual stop is `--force` (overwriting a
UI-created mapping), which halts with `[force-required]` for the user to confirm.

**Code Connect CLI is v2**: it publishes **template files** (`*.figma.ts`), not the
parser-based `*.figma.tsx` you author in step 4. The gate's `migrate` stage runs
`figma connect migrate --delete` to convert your authored `.figma.tsx` into the
canonical `.figma.ts` template (Figma's official codegen — do **not** hand-write
the `.figma.ts`), deletes the `.figma.tsx`, and then parses & publishes the
template. Migrate is idempotent: it only runs when a `.figma.tsx` is present, so
re-running the gate on an already-migrated component skips straight to publish.

Run it verbatim from the repo root:
```bash
fail() { echo "FIGMA-CONNECT ERROR [$1]: $2"; exit 1; }

# 1. Typecheck the component source (offline, fast, no token).
npm run typecheck > /tmp/fc-tsc.out 2>&1 || { cat /tmp/fc-tsc.out; fail typecheck "TypeScript failed — fix type errors before publish."; }

# 2. Load the Figma token from .env (migrate + publish need it). Never print it, never pass it as a CLI arg.
set -a; [ -f .env ] && . ./.env; set +a
[ -n "$FIGMA_ACCESS_TOKEN" ] || fail token "FIGMA_ACCESS_TOKEN not set in .env (needs Code Connect write scope)."

# 3. Migrate authored parser files (*.figma.tsx) → v2 templates (*.figma.ts), deleting the source.
#    migrate REFUSES to overwrite an existing *.figma.ts (skips → non-zero), so delete the
#    stale sibling first; cc:migrate scans via --dir src (config include only matches *.figma.ts).
tsx=$(find src -name '*.figma.tsx' 2>/dev/null)
if [ -n "$tsx" ]; then
  for f in $tsx; do rm -f "${f%.tsx}.ts"; done
  npm run cc:migrate > /tmp/fc-migrate.out 2>&1 || { cat /tmp/fc-migrate.out; fail migrate "figma connect migrate failed — see output (needs a valid write-scoped token)."; }
  cat /tmp/fc-migrate.out
fi

# 4. Parse the template files. cc:parse EXITS 0 even on an unresolved import / empty source, so grep too.
npm run cc:parse > /tmp/fc-parse.out 2>&1 || { cat /tmp/fc-parse.out; fail parse "cc:parse errored — see output."; }
cat /tmp/fc-parse.out
grep -q "could not be resolved" /tmp/fc-parse.out && fail resolve "an import could not be resolved."
grep -q '"source": ""' /tmp/fc-parse.out && fail source "a mapping has an empty \"source\" link (check the git remote)."

# 5. Publish only on a fully green run.
npm run cc:publish > /tmp/fc-publish.out 2>&1; pub=$?
cat /tmp/fc-publish.out
if [ $pub -ne 0 ]; then
  grep -qi "force" /tmp/fc-publish.out \
    && { echo "FIGMA-CONNECT HALT [force-required]: node already has UI-created mappings; re-running needs --force (overwrite). Confirm with the user, then: npm run cc:publish -- --force"; exit 2; }
  fail publish "cc:publish failed — see output above."
fi
echo "FIGMA-CONNECT OK: Code Connect published."
```
Error stages: `typecheck` (tsc), `token` (missing/unscoped `FIGMA_ACCESS_TOKEN`),
`migrate` (v1→v2 template conversion failed — bad token or a malformed authored
`.figma.tsx`), `parse`/`resolve`/`source` (cc:parse — note it **exits 0 even on an
unresolved import**, so the grep gate is what catches it), `publish` (any other CLI
failure). On `[force-required]`, surface the message and ask before
`npm run cc:publish -- --force`. Never print the token or pass it as a CLI
argument. Also self-check against the **Definition of done** below before running.

### 8. Verify the connection
Call `get_code_connect_map` for the node again and confirm the mapping now has
`hasTemplate: true` with the generated `<Component … />` snippet. Report the node
count and a sample snippet back to the user, and tell them to reopen the node in
Figma Dev Mode → Code panel.

## Classification

| Signal | Level |
|---|---|
| Single indivisible control; one native element at its core (button, input, badge, icon, checkbox, avatar, tag) | **atom** |
| A small functional group of atoms with one job (input + label + helper text = Field; icon + text = MenuItem; search box; form row) | **molecule** |
| A distinct section assembled from molecules/atoms (header bar, card with actions, data table, form, nav) | **organism** |

When in doubt between molecule and organism, prefer the smaller layer and confirm.

## Layout

```
src/
  atoms/
    <ComponentName>/
      <ComponentName>.tsx
      <ComponentName>.css
      <ComponentName>.figma.ts      # v2 template — committed artifact (migrated from
                                    # the authored .figma.tsx, which the gate deletes)
      index.ts
    index.ts            # barrel — append the new atom
  molecules/ ...        # same shape; compose atoms only
  organisms/ ...        # same shape; compose molecules + atoms
```

In the authored `.figma.tsx`, import the component relatively (`./{{Name}}`). After
migrate, the `.figma.ts` template carries the published snippet's import as a literal
string in its `imports: [...]` array (v2 has no `importPaths` rewrite). If the team
wants consumers to see the package import, edit that literal to
`import { {{Name}} } from 'ui-collective-figma-code';` in the migrated `.figma.ts`
before publish — the current mappings keep the relative import for parity.

## Definition of done

A component is complete only when ALL hold:
- [ ] Implementation exists in the correct layer with the standard 4 files.
- [ ] Molecules/organisms compose existing components only — zero scratch primitives.
- [ ] Every Figma variant property maps to a typed prop; defaults match the Figma
      "default" variant.
- [ ] Accessibility checklist passes (keyboard, ARIA, focus, contrast, reduced
      motion) — see [accessibility.md](references/accessibility.md).
- [ ] API follows [api-conventions.md](references/api-conventions.md) (forwardRef,
      native prop passthrough, token styling, controlled/uncontrolled where
      relevant).
- [ ] `npm run typecheck` and `npm run cc:parse` pass.
- [ ] Code Connect published and verified (`hasTemplate: true`).
- [ ] Barrel updated.

## References (load as needed — don't inline them all)
- [references/atomic-design.md](references/atomic-design.md) — layer rules, examples.
- [references/accessibility.md](references/accessibility.md) — WCAG gate + ARIA patterns.
- [references/api-conventions.md](references/api-conventions.md) — MUI/Antd parity.
- [references/code-connect.md](references/code-connect.md) — mapping + publish details.

## Templates
- [templates/atom.tsx.template](templates/atom.tsx.template)
- [templates/molecule.tsx.template](templates/molecule.tsx.template)
- [templates/component.css.template](templates/component.css.template)
- [templates/component.figma.tsx.template](templates/component.figma.tsx.template)
- [templates/index.ts.template](templates/index.ts.template)

The migrated **Button** (`src/atoms/Button/`) is the reference implementation of
every rule above — read it when unsure.
