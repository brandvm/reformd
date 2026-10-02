# Reformd — Webflow custom code

Agent instructions for this repository. Codex, Cursor and similar tools read
this file directly; Claude Code reads it through `CLAUDE.md`. It is the single
source of agent rules — edit this file, never a copy of it.

## Project facts

- Client / site: Reformd
- GitHub: `brandvm/reformd`, default branch `master`
- Webflow site ID: unknown — fill in
- Staging site: `https://reformd.webflow.io`
- Staging bundles: `https://brandvm.github.io/reformd/`
- Production bundles: `https://cdn.jsdelivr.net/gh/brandvm/reformd@<VER>/dist/`
- Production domain: unknown — fill in ("custom domains" in the README)
- Production release: `v1.0.0` (snippet URLs use `@v1.0.0`)
- Webflow MCP: configured in `.mcp.json` (`https://mcp.webflow.com/mcp`)
- Origin: CodeSandbox `reformd-main.js` / `reformd-main.css`, the global
  head/footer code and the Home page modal code, moved into this repo
  2026-09-08 (PR #1).

## Who owns what

Webflow owns markup, layout, classes, components, CMS content, interactions
**and styling by default**. This repo owns JavaScript behaviour and only the
CSS the Designer cannot express.

That split is deliberate. Repo CSS loads from an Embed after `webflow.css`,
so it wins every specificity tie against the Designer. Any rule written here
that the Designer could have expressed becomes a hidden override: the next
person changes that style in the Designer, nothing happens, and the only fix
is edit `src/` → push → wait for staging → reload the Designer. Every project
built from `wf-template` has lost time to that loop.

## CSS policy — Designer first

Before writing any CSS, decide where it belongs.

1. **Can the Designer do it?** A class or combo class style, a variable, a
   breakpoint style, a state (hover/focus/current), an interaction. If yes:
   - With the Webflow MCP connected, apply it in Webflow (styles and
     variables tools), then tell the user what was changed.
   - Without the MCP, give the user exact Designer steps: class, breakpoint,
     property, value.
   - Do **not** add it to `src/styles.css`.
2. **Repo CSS needs a reason.** Every rule — or the section header comment
   covering a group of rules — carries one tag from this list:

   ```css
   /* repo-css: <tag> — <short why> */
   ```

   | Tag | Use for |
   | --- | --- |
   | `js-state` | Classes/attributes a module toggles (`.is-open`, `.is-loading`, `[data-state]`) |
   | `designer-cant` | Name the feature: `:has()`, complex combinators, `@keyframes`, `@supports`, container queries, `::marker`, `color-mix()`, masks |
   | `third-party` | Swiper, Lenis, Finsweet or other library markup |
   | `canvas-preview` | `.w-editor`, `.wf-design-mode`, `html:not([data-wf-domain])` helpers |
   | `approved-base` | A site-wide base the user explicitly asked to keep in code |
   | `override-webflow` | Overriding a `.w-*` default or a Designer style |

3. **`override-webflow` needs the user's explicit approval** and a
   `GOTCHAS.md` entry explaining why. Ask before writing it.
4. **Never, without that approval:** set `font-size` on `:root`/`html`,
   neutralize `.w-*` defaults, or reference Webflow variable names
   (`--_layout---…`, `--_typography---…`). A renamed variable in Webflow
   silently breaks every rule that reads it — Webflow rewrites its own
   references, never this bundle's.
5. **Ambiguous request?** Say which parts go in the Designer and which go in
   code before editing anything. "Make the heading bigger on mobile" is a
   Designer breakpoint style, not a media query here.

Existing rules predate this policy and are untagged; add a `repo-css` tag to
any rule you touch, and question rules the Designer could own. In particular
`src/styles.css` §01 sets a fluid `:root` font-size and redefines Webflow
`--_colors---*` variables, and the `#waitlist-modal` block hard-codes type
sizes for the shared form component (see `GOTCHAS.md`).

## Read before changing integration

- `README.md` — where each piece of the old global/page code now lives,
  development, Webflow installation, hosting and release, waitlist modal.
- `loader.html` — three snippets pasted into three places:
  1. **Site settings → Head code:** viewport/theme-color meta, jsDelivr
     preconnects, and the pre-paint `html.is-loading` scroll lock with a
     3-second safety timeout. Not rendered on the canvas (intended).
  2. **HTML Embed in the `G | Embed Code` component** (on every page): the
     `bv-css` stylesheet link plus the config script that sets `window.BV`
     and points `bv-css` at staging (`*.webflow.io`) or the pinned tag
     (custom domains). Visible on the canvas.
  3. **Site settings → Footer code:** the JS loader (dev → staging → prod
     fallbacks; warns and loads prod JS only if `window.BV` is missing).
  Resist adding site logic to any snippet; they are bootstrap only.
- `src/index.ts` boots modules through `runModule(name, init)` from
  `src/utils.ts` (each isolated in try/catch) and always releases
  `is-loading` in `finally`. Features live in `src/modules/`, one file each,
  exporting an init that no-ops when its markup is absent:
  `smooth-scroll.ts` (Lenis 1.1.5, bundled; uses Webflow's GSAP/ScrollTrigger
  when present, otherwise `requestAnimationFrame`; skipped in the editor),
  `nav-shrink.ts` (`.is-shrunk` at 5vh on `.g-nav-w, .s-g-nav, .sw-g-nav`),
  `waitlist-modal.ts` (native `<dialog id="waitlist-modal">` around the
  shared **C | Notified Form Block** component; `data-waitlist-open` /
  `data-waitlist-close`).
- `src/styles.css` opens with cascade notes and numbered sections (01 tokens,
  02 base, 03 Webflow neutralizers — currently empty, 04 document state,
  05 components & motion, 06 utilities). Add rules to the section they belong
  to, never to the end of the file.
- Third-party libraries are bundled with `pnpm add`, not added as CDN tags.
  The footer loader appends the bundle dynamically, so a sibling
  `<script defer>` has no ordering guarantee.

## Webflow canvas facts

- **The Designer canvas never runs scripts.** Anything shown only after JS
  runs (the modal, nav shrink, Lenis) is invisible there; use a
  `canvas-preview` rule if the Designer needs to see it.
- **The canvas shows staging CSS only.** `bv-css` points at
  `https://brandvm.github.io/reformd/styles.css?v=1`; since e9f81ab there is
  no static localhost link, so `pnpm dev` changes do not reach the canvas.
  To preview local CSS in the Designer, temporarily point `bv-css` at
  `http://localhost:3000/styles.css` while `pnpm dev` runs, then restore the
  staging URL before publishing.
- A CSS change (including a deletion) reaches the canvas after a push, the
  staging deploy and a Designer reload. Bump `?v=` in the staging href when a
  cached stylesheet persists.
- No live reload on the canvas. Reload the Designer tab.
- Debug "is my CSS loading?" with `background`, not `outline` — outlines on
  `body` paint outside the canvas iframe and get clipped.

## Snippets are not versioned

A push updates the JS/CSS bundles only. Any change to `loader.html` must be
re-pasted into Webflow and published to take effect — say so in the commit
or PR description, and keep `loader.html` identical to what is installed.

## Commands, dev mode and release

```bash
pnpm dev      # watch + server on :3000 with live reload
pnpm build    # minified -> dist/
pnpm check    # tsc --noEmit
```

No test suite. Node 22+ and the pinned pnpm 11 in `package.json`. Run
`pnpm check` and `pnpm build` before pushing. CI: `check.yml` runs check +
build on pull requests; `staging.yml` runs check + build on every push to
`master` and deploys `dist/` to GitHub Pages.

Dev mode on the staging domain: `?bv-dev=1` loads localhost JS and CSS
(persists in localStorage), `?bv-dev=0` restores staging. Ignored on custom
domains. Localhost only — a LAN IP is blocked as mixed content; push and use
staging to test on another device.

Release exactly as the README describes: `dist/` is gitignored, force-added
for the release commit and tag, then un-tracked again:

```bash
pnpm check && pnpm build
git add -f dist/index.js dist/styles.css
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin HEAD && git push origin vX.Y.Z
git rm --cached dist/index.js dist/styles.css
git commit -m "chore: untrack release output"
git push origin HEAD
```

Verify both CDN files, then update **both** `VER` strings (Embed piece 2 and
footer piece 3), publish staging, then the custom domains. Roll back by
setting both strings to the previous existing tag. Never move a pushed tag;
cut the next patch. Never use `@latest` or a branch URL in production.

## Webflow MCP limits

Worked around, not fixed — do not rediscover these.

- `custom_value` is rejected for Color and Size variables (`color-mix()`,
  `oklch()`, `calc()`). Create those through the variables JSON import with
  `valueType: "custom"`.
- No variable rename or reorder within a collection. Rename in the Designer
  (preserves ids and aliases; recreating does not).
- The WHTML importer drops `class` attributes. Create the style, then apply
  it.
- `get_all_elements` does not descend into component definitions — pass the
  component scope. An element "missing" from a page is usually inside one.
- Concurrent Designer edits change element ids. Re-query on "Element not
  found" instead of assuming deletion.
- Responsive styles are only returned when breakpoints are requested
  explicitly (`include_breakpoints`).

## Session protocol

1. **Start:** read `GOTCHAS.md`. Do not repeat a mistake already logged.
2. **During:** when something surprising costs time — a Webflow quirk, a
   template default that gets in the way, an MCP limitation, a fix that had
   to be reverted — add an entry to `GOTCHAS.md` in the same commit as the
   fix, using the format at the top of that file.
3. **Scope:** tag an entry `template-candidate` when it would recur on any
   project built from `wf-template`; those entries are collected later to
   improve the template. Otherwise tag it `project`.
4. Never delete entries. Update `Status` when something is fixed or
   upstreamed.
