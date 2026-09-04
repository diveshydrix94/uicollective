---
description: Generate an accessible, atomic-design component from a Figma node and publish its Code Connect mapping.
argument-hint: <figma-node-url> <atom|molecule|organism> [ComponentName]
---

Invoke the **figma-connect** skill and run its full pipeline for this request.

Arguments: `$ARGUMENTS`
- `$1` = Figma node URL (must contain `node-id`)
- `$2` = level: `atom` | `molecule` | `organism` (if missing, classify and confirm)
- `$3` = ComponentName in PascalCase (if missing, derive from the Figma component)

Follow the skill exactly, in order, and do not skip the gates:

1. **Read the design** with the Figma MCP tools (`get_code_connect_map`,
   `get_design_context`/`get_metadata`, `get_screenshot`). Capture the exact Figma
   property and layer names.
2. **Classify** the component and, if `$2` was not given, confirm the level with me
   before generating.
3. **Reuse check.** Search the target layer. For molecules/organisms, verify every
   child atom/molecule already exists — if one is missing, STOP and tell me which
   to connect first. Never inline a missing primitive.
4. **Generate** the component from the templates into
   `src/<layer>/<ComponentName>/` (`.tsx`, `.css`, `.figma.tsx`, `index.ts`),
   mapping every Figma variant to a typed prop, applying the API conventions and
   the full accessibility checklist. Author the declarative `.figma.tsx` mapping —
   step 6–7 migrates it to the committed `.figma.ts` v2 template.
5. **Wire exports** into `src/<layer>/index.ts`.
6–7. **Migrate, validate, then auto-publish.** Run this single gate. Code Connect
   CLI is **v2**, which publishes **template files** (`*.figma.ts`), not the
   parser-based `*.figma.tsx` from step 4 — so the gate first runs
   `figma connect migrate --delete` to convert the authored `.figma.tsx` into the
   canonical `.figma.ts` (never hand-write that file), then parses & publishes. It
   publishes only when every check passes and prints a **specific
   `FIGMA-CONNECT ERROR [stage]`** and stops otherwise. `--force` (overwriting a
   UI-created mapping) is the ONLY manual stop — it halts with `[force-required]`
   for me to confirm. Never echo the token or pass it as a CLI arg.
   ```bash
   fail() { echo "FIGMA-CONNECT ERROR [$1]: $2"; exit 1; }

   # 1. Typecheck the component source (offline, fast, no token).
   npm run typecheck > /tmp/fc-tsc.out 2>&1 || { cat /tmp/fc-tsc.out; fail typecheck "TypeScript failed — fix type errors before publish."; }

   # 2. Load the Figma token from .env (migrate + publish need it). Never print it.
   set -a; [ -f .env ] && . ./.env; set +a
   [ -n "$FIGMA_ACCESS_TOKEN" ] || fail token "FIGMA_ACCESS_TOKEN not set in .env (needs Code Connect write scope)."

   # 3. Migrate authored parser files (*.figma.tsx) → v2 templates (*.figma.ts), deleting the source.
   #    migrate REFUSES to overwrite an existing *.figma.ts, so delete the stale sibling first.
   tsx=$(find src -name '*.figma.tsx' 2>/dev/null)
   if [ -n "$tsx" ]; then
     for f in $tsx; do rm -f "${f%.tsx}.ts"; done
     npm run cc:migrate > /tmp/fc-migrate.out 2>&1 || { cat /tmp/fc-migrate.out; fail migrate "figma connect migrate failed — see output (needs a valid write-scoped token)."; }
     cat /tmp/fc-migrate.out
   fi

   # 4. Parse the template files (cc:parse exits 0 even on unresolved import / empty source, so grep too).
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
   On `[force-required]`, show me the message and ask before running
   `npm run cc:publish -- --force`.
8. **Verify** with `get_code_connect_map` that the node now has `hasTemplate: true`
   with the generated snippet, then report the result and tell me to reopen the
   node in Figma Dev Mode.

Enforce the non-negotiable rules: strict Atomic Design (molecules compose atoms
only — no scratch primitives), accessibility as a hard gate, MUI/Antd-grade API,
token-based styling, and reuse-first. The migrated `src/atoms/Button/` is the
reference implementation.
