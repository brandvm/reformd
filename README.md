# Reformd — Webflow custom code

Custom JavaScript and CSS for [Reformd staging](https://reformd.webflow.io/).
Webflow owns page markup, classes, and the shared waitlist form component.
This repository owns the behavior and custom styles formerly served by CodeSandbox.

## Where the supplied code lives

| Previous location | Repository source |
| --- | --- |
| Global head: viewport, theme color, reserved Finsweet/font entries | Head section of `loader.html` |
| Global head: developer visibility, Swiper, and Lenis CSS | `src/styles.css` |
| Global footer: Lenis 1.1.5 and GSAP integration | `src/modules/smooth-scroll.ts` |
| `reformd-main.js`: navigation shrinking at 5vh | `src/modules/nav-shrink.ts` |
| Module boot, isolated error handling, ready messages | `src/index.ts`, `src/utils.ts` |
| Home page modal code and styles | `src/modules/waitlist-modal.ts`, `src/styles.css` |
| Existing `reformd-main.css` design system and utilities | `src/styles.css` |

The existing build convention is retained: `src/index.ts` builds to `dist/index.js`,
and `src/styles.css` builds to `dist/styles.css`. Lenis is bundled at the same
version as the supplied snippet; it no longer needs a separate CDN script.
Supported Lenis option names replace the old aliases. GSAP/ScrollTrigger are
used when Webflow provides them; otherwise Lenis runs with `requestAnimationFrame`.

## Development

Node 22+ and pnpm 11 are required.

```sh
pnpm install
pnpm check
pnpm build
pnpm dev
```

`pnpm dev` serves on port 3000 with live reload. On the Webflow staging domain,
`?bv-dev=1` selects localhost and `?bv-dev=0` restores the staging bundle.
The local flag is ignored on custom domains. Local CSS is requested only
when dev mode is selected. The Designer uses staging CSS by default; see
`loader.html` for an explicit temporary localhost override while designing.

## Webflow installation

`loader.html` contains three separate snippets:

1. **Site settings → Head code:** viewport/theme metadata, preconnects, and
   a three-second scroll-lock safety timeout.
2. **G | Embed Code component:** CSS links and shared loader configuration.
   This replaces the existing CodeSandbox stylesheet link and keeps custom
   styles visible in the Designer canvas.
3. **Site settings → Footer code:** JavaScript loader. This replaces both
   the old inline Lenis initialization and the CodeSandbox script tag.

Clear the previous Home page modal head/footer custom code when installing the
bundle so the same feature is not maintained in two places. Keep the Webflow
modal elements and the shared **C | Notified Form Block** component.

## Hosting and releases

| Environment | Assets |
| --- | --- |
| Webflow staging | `https://brandvm.github.io/reformd/` |
| Custom domains | `https://cdn.jsdelivr.net/gh/brandvm/reformd@v1.0.0/dist/` |
| Local development | `http://localhost:3000/` |

GitHub Pages uses GitHub Actions. A push to `master` runs type checking and
builds/publishes the staging assets. Pull requests run the same checks without
publishing. Custom domains use the immutable tag set in both `VER` strings
in `loader.html`; staging updates do not change that pinned code.

For the next release, use a new version in place of `vX.Y.Z`:

```sh
pnpm check && pnpm build
git add -f dist/index.js dist/styles.css
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin HEAD
git push origin vX.Y.Z
git rm --cached dist/index.js dist/styles.css
git commit -m "chore: untrack release output"
git push origin HEAD
```

Include only those two build files in the release. Never move a published tag.
Verify both CDN files, then update both `VER` strings in the Webflow snippets
and publish staging before publishing the custom domains. Roll back by setting
both strings to the previous existing tag and republishing.

## Waitlist modal

The native `<dialog id="waitlist-modal">` contains an instance of the
existing shared form component. The hero trigger has `data-waitlist-open`; the close
button has `data-waitlist-close`. Component edits apply to the modal and any other instances, including a footer form if present.

The module prefixes modal field IDs, labels inputs, contains keyboard focus,
restores trigger focus after closing, and pauses/resumes the shared Lenis
controller. Escape, the close button, and backdrop clicks dismiss the dialog.

Verified against the staging page's markup at desktop and mobile sizes:
nav shrinking, modal opening/closing, focus/scroll restoration, and operation
without GSAP. No real form submission was made, so delivery is not covered.
