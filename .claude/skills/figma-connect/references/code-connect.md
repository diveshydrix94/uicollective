# Figma Code Connect — mapping & publishing (CLI v2)

Goal: make Figma Dev Mode show **this repo's real component code** for a node,
rendered inline (`hasTemplate: true`) so there is no "Source code not found".

## Format: author `.figma.tsx`, publish `.figma.ts`

Code Connect **CLI v2** removed framework-specific parsers. It publishes **template
files** (`Component.figma.ts`) — self-contained strings, not executed React. The old
parser-based `Component.figma.tsx` (`figma.connect(Component, url, { props, example })`)
**can no longer be parsed or published directly**; `cc:parse`/`cc:publish` reject it.

We keep the ergonomics without hand-writing templates:
1. **Author** the declarative `Component.figma.tsx` (easy to produce from Figma
   metadata — same format as before).
2. The step 6–7 gate runs **`npm run cc:migrate`** (`figma connect migrate --delete`)
   — the ONE v2 command that still uses the framework parser — to convert it into the
   canonical `Component.figma.ts` template and **delete** the `.figma.tsx`.
3. The gate then `cc:parse` + `cc:publish` the `.figma.ts`.

`migrate` is Figma's official codegen for the template, so the fiddly parts
(`figma.code` tagged template, `renderProp`/`renderChildren` helpers, instance-swap
`?.executeTemplate().example`, `metadata.nestable`) are produced deterministically —
**do not hand-write the `.figma.ts`.** (If `migrate` is ever unavailable, the shape is
documented in `templates/component.figma.ts.template` as a fallback.)

### figma.config.json (v2)
```json
{ "codeConnect": { "include": ["src/**/*.figma.ts"] } }
```
Only template files are included, and there is **no `parser` key** and **no
`importPaths`** (both are v1 parser concepts). v2 auto-detects the React helpers from
the `react` dependency. If `include` still matched `*.figma.tsx`, every v2 command
would abort with *"Framework-specific parsers are no longer supported…"*.

## Authoring anatomy (`.figma.tsx` — the input you write)
```tsx
import React from 'react';
import figma from '@figma/code-connect';
import { Component } from './Component';

figma.connect(Component, '<FIGMA_NODE_URL>', {
  props: {
    label: figma.string('Label'),                                   // TEXT → string
    variant: figma.enum('Type', { default: 'default', subtle: 'subtle' }), // VARIANT → enum
    iconLeft: figma.boolean('Icon left', {                          // BOOLEAN (+swap)
      true: figma.instance('↘ Icon left'),
      false: undefined,
    }),
  },
  example: (props) => <Component variant={props.variant}>{props.label}</Component>,
});
```

## Template anatomy (`.figma.ts` — what migrate produces & publishes)
```ts
// url=<node>  source=<github .../Component.tsx>  component=Component
import figma from "figma"                                   // virtual module, NOT a dep
const variant = figma.selectedInstance.getEnum("Type", { default: "default" })
const iconLeft = figma.selectedInstance.getBoolean("Icon left", {
  true: figma.selectedInstance.getInstanceSwap("↘ Icon left")?.executeTemplate().example,
  false: undefined,
})
export default {
  id: "Component",
  imports: ["import { Component } from './Component';"],       // literal published import
  example: figma.code`<Component${figma.helpers.react.renderProp("variant", variant)}>
      ${figma.helpers.react.renderChildren(label)}
    </Component>`,
  metadata: { nestable: true },
}
```

### Matching rules that bite
- **Property & layer names are literal**, including emoji/arrow prefixes and spacing:
  `'↘Icon left'` ≠ `'↘ Icon right'`. Copy them from `get_metadata` /
  `get_design_context`, don't retype from memory. (migrate carries them through
  verbatim, so a wrong name in the `.figma.tsx` becomes a wrong name in the template.)
- Map a component **set** by its set URL; the published map then covers every
  variant/instance node under it (the set node itself is not a map key — its children
  are).
- Enum defaults should mirror the Figma "default" variant so the snippet matches.

## Commands
```bash
npm run cc:migrate     # v1→v2: parse authored *.figma.tsx → *.figma.ts, delete source. Token from env.
npm run cc:parse       # offline-ish: validate template files. Prints JSON with source links.
npm run cc:publish     # writes the mapping to Figma. Needs FIGMA_ACCESS_TOKEN.
npm run cc:unpublish   # removes CLI-published mappings (NOT UI-created ones).
```
All read `FIGMA_ACCESS_TOKEN` from the environment (never as a CLI arg).

**Two migrate gotchas the gate handles (both learned the hard way):**
- `cc:migrate` uses **`--dir src`**, not the config include. The config `include` now
  only matches `*.figma.ts`, so a config-driven migrate would scan the already-migrated
  templates and never find the authored `*.figma.tsx`. `--dir src` scans the tree with
  defaults and finds the `.figma.tsx` (it still auto-detects the `react` parser).
- migrate **refuses to overwrite an existing `*.figma.ts`** — it prints
  *"Skipping … file already exists"*, migrates 0, exits **non-zero**, and (because
  `--delete` only fires on success) leaves the `.figma.tsx` behind. So the gate
  **deletes the stale sibling `*.figma.ts` before migrating** (`rm -f "${f%.tsx}.ts"`),
  guaranteeing a clean regenerate + source delete. `--dir src` output is byte-identical
  to the old config-driven migrate (verified).

### Automated migrate + validate + publish gate
The skill/command run **one gate** that migrates the authored `.figma.tsx`, validates,
then publishes only on a fully green run — emitting a specific
`FIGMA-CONNECT ERROR [stage]` otherwise (stages: `typecheck`, `token`, `migrate`,
`parse`, `resolve`, `source`, `publish`) and a manual `HALT [force-required]` when a
UI-created mapping exists. The script lives in [SKILL.md](../SKILL.md) step 6–7 (and
the slash command) — **keep the three copies in sync**.

Two things it guards that bite:
- `cc:parse` **exits 0 even when something is off** (an unresolved import, or an empty
  `source`) — so the gate greps for `could not be resolved` AND `"source": ""`, never
  trusting the exit code.
- A clean run shows every entry with a real `"source": "https://…/<Component>.tsx"`
  and `"isParserless": true`.

The token is loaded from `.env` before migrate/publish, without printing it
(`set -a; [ -f .env ] && . ./.env; set +a`) and never passed as a CLI argument.

### `--force`
If publish stops with *"…already have UI-created Code Connect mappings … Re-run with
--force"*, a mapping was created in the Figma UI / MCP earlier. `cc:unpublish` cannot
remove those. **Ask the user first**, then:
```bash
npm run cc:publish -- --force
```
`--force` overwrites the existing mapping with ours.

## Verify (always do this)
Call `get_code_connect_map` for the node/fileKey and confirm:
- `hasTemplate: true` on the node(s),
- the `snippet` is the generated `<Component … />`,
- the `source` points at `…/src/<layer>/<Component>/<Component>.tsx`.
For a component **set**, the map is keyed by the child node ids (e.g. `14:939`), not
the set id — expect many entries, all `componentName: <Component>`. Report the node
count + a sample snippet to the user.

## History: the v1 empty-`source` trap (no longer applicable)
Under the v1 parser, `figma.config.json` `include` had to match **both** the
`.figma.tsx` and the component `.tsx` so the parser could resolve
`import { Component } from './Component'`; a narrow `*.figma.tsx`-only glob published an
empty `source`. v2 template files embed the `source` (a GitHub URL derived from the git
remote) directly, so this trap is gone — but the gate still greps `"source": ""`
defensively in case the git remote is missing.
