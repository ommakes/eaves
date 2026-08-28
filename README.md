# Eaves

A hideable control panel for coded usability-test prototypes — switch scenarios and variants live, without touching the UI you're testing.

Named for the roofline: it sits at the edge of the structure, not inside it. A small draggable bar anchored to a corner by default — drag it anywhere by its grip handle — and dismissible entirely with a keyboard shortcut so it never shows up in a screen recording unless you want it to.

## Why

When you build a working prototype for a moderated usability test — in Cursor, Claude Code, or by hand — you often need to jump between states mid-session: happy path, error state, empty state, variant B. Hardcoding that into the product UI means participants see controls that were never part of the design. Eaves keeps that switching logic in its own layer.

## Quick start

No build step, no dependencies. Drop the script in and initialize it.

```html
<script src="https://unpkg.com/eaves-panel/src/eaves.js"></script>
<script>
  Eaves.init({
    scenarios: [
      { id: 'happy', label: 'Happy path' },
      { id: 'error', label: 'Error state', description: 'Incomplete policy on file' },
      { id: 'empty', label: 'Empty state' }
    ],
    onSelect: function (id, scenario) {
      // your prototype reacts here — swap copy, toggle a class, reset state, etc.
    }
  });
</script>
```

Or via npm, if you're already bundling:

```bash
npm install eaves-panel
```

```js
import Eaves from 'eaves-panel';

Eaves.init({ scenarios: [...], onSelect: (id) => { ... } });
```

See `/demo/index.html` for a working example.

### No code? Ask your AI agent

If you're building the prototype in Cursor, Claude Code, or another AI coding agent, you don't have to write the `Eaves.init()` call by hand — describe the scenarios you want ("wire up Eaves with a happy path, an error state, and an empty state") and let the agent read the API below and wire it in for you.

## API

`Eaves.init(options)` returns an instance.

| Option | Type | Default | Description |
|---|---|---|---|
| `scenarios` | `{ id, label, description? }[]` | — | Required. What shows up in the panel. |
| `onSelect` | `(id, scenario) => void` | no-op | Fires when a scenario is picked. |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Corner to anchor to initially. Dragging the bar by its grip handle overrides this for the rest of the session. |
| `shortcut` | string | `'mod+shift+u'` | Keyboard combo to open/close the Scenarios menu. `mod` resolves to `Cmd` on macOS/iOS and `Ctrl` everywhere else. Pin a modifier explicitly with `meta`/`cmd`, `ctrl`, `shift`, or `alt` — e.g. `'ctrl+shift+k'`. |
| `hideShortcut` | string | `'mod+shift+y'` | Keyboard combo that fully hides the bar itself, not just its menus — for a clean screen recording. Pressing `shortcut` while hidden reveals it again, so there's always a way back even if you forget this combo. |
| `label` | string | `'Scenarios'` | Label on the Scenarios button in the bar. |
| `activeId` | string | first scenario | Which item starts selected. |
| `startOpen` | boolean | `false` | Whether the Scenarios menu starts open. |
| `mount` | boolean | `true` | Set `false` to build the instance without attaching it to the DOM yet — call `.mount()` when you're ready. |
| `comments` | boolean | `true` | On by default. Lets a facilitator pin private feedback for the designer directly on the prototype — see [Comments](#comments) below. Pass `false` to get the plain scenario switcher with no Comments button or menu. |
| `onComment` | `(comment) => void` | no-op | Fires as each comment is created — the recommended way to relay comments off the facilitator's own device (e.g. to a Slack webhook) when the prototype is on a shared or hosted link, not just a local build. |
| `pinsShortcut` | string | `'mod+shift+m'` | Ignored when `comments: false`. Toggles pin visibility on the prototype, independent of `hideShortcut` and of whether the panel itself is open — for when a participant is watching the screen but the panel needs to stay reachable. |

Instance methods:

| Method | Description |
|---|---|
| `.expand()` | Open the Scenarios menu. |
| `.collapse()` | Close whichever menu (Scenarios or Comments) is open. |
| `.toggle()` | Open the Scenarios menu if nothing's open, close it if it is. |
| `.isOpen()` | `true` while either menu is open. |
| `.isHidden()` | `true` while the bar itself is hidden (see `hideShortcut`). |
| `.hide()` | Close any open menu and hide the bar entirely. |
| `.show()` | Reverse of `.hide()`. |
| `.select(id)` | Activate a scenario and fire `onSelect`. Unknown ids are ignored. |
| `.mount()` | Attach to `document.body`. Only needed after `mount: false`. Returns the instance. |
| `.destroy()` | Remove the bar and its menus, and unbind the keyboard listener. |
| `.addComment(text, opts?)` | Adds a comment to the current scenario; `opts.xPct`/`opts.yPct` (0–100) place a pin. Returns the comment, or `null` if `text` is empty or `comments: false`. |
| `.getComments(scenarioId?)` | Reads back stored comments as plain objects, optionally filtered to one scenario. |
| `.deleteComment(id)` | Removes one comment by id. Returns `true` if a comment was removed, `false` if the id wasn't found. See [Comments](#comments) below for the click + Delete-key flow. |
| `.exportComments()` | Returns every comment across every scenario as one Markdown string — see [Comments](#comments) below. |
| `.clearComments()` | Wipes all stored comments for this instance. |
| `.hidePins()` / `.showPins()` / `.arePinsHidden()` | Toggle pin visibility on the prototype. Mirrors `.hide()`/`.show()`/`.isHidden()`, but independent of them — hiding pins leaves the bar itself untouched. A no-op when `comments: false`. |
| `.hasScreenshotFolder()` | `true` once a folder is connected for auto-saved snapshots — see [Screenshots](#screenshots) below. |

`Esc` also closes an open menu.

Both `shortcut` and `hideShortcut` default to letters, not punctuation like the old `mod+.` — checked against Chrome's and Cursor/VS Code's default keybindings so they don't fight your editor's muscle memory while you're building the prototype. `pinsShortcut` is the one exception: after checking every remaining letter, `M` is the least-bad option left (see the DevTools note below) — everything else was either destructive (`R` hard-reloads the page, `W` closes the browser window, `Q` signs a ChromeOS user out) or a heavily-used Cursor/VS&nbsp;Code command (`A` opens Cursor's own Agents panel, `S`/`F`/`Z`/`L` are constant-use editing shortcuts). All three are still just options — override any of them per project.

## Comments

On by default — a **Comments** button sits next to **Scenarios** in the bar out of the box. Open it and click **+ Add**, then click anywhere on the prototype to drop a numbered pin and write a note — the same click-to-annotate flow as leaving a comment in Figma. Pins are scoped to the scenario they were left on and stored in `localStorage`, keyed by position as a percentage of the page (`xPct`/`yPct`), so they stay lined up with the right spot even if the window is resized.

Revisit any comment two ways — click its number badge in the Comments menu, or click its pin directly on the page — either one scrolls to it, flashes it, and marks it **active** (a highlighted ring on the pin and its row). With a comment active, press **Delete** or **Backspace** to remove it — that only fires while a comment is actively selected and your focus isn't in a text field, so it can't accidentally eat a keystroke while you're typing somewhere else on the page. `.deleteComment(id)` does the same thing programmatically.

Don't need any of this? Pass `comments: false` and you get the plain scenario switcher, with no Comments button, menu, pin layer, or `localStorage` write — same as before this was the default.

This is a facilitator-private notes layer, not a shared one — nothing here is visible to a test participant unless you show it to them, and there's no live sync between browsers. Two ways a comment gets to you:

- **`onComment`** fires the instant a comment is saved, in the facilitator's own browser. If the prototype is on an internal hosted link rather than a build you're running locally, wire this to your own endpoint (a Slack webhook, an internal API) — this is the reliable path, since it doesn't depend on anyone remembering an extra step:
  ```js
  Eaves.init({
    scenarios: [ /* ... */ ],
    onComment: function (comment) {
      fetch('https://hooks.slack.com/services/…', {
        method: 'POST',
        body: JSON.stringify({ text: comment.text + ' (' + comment.scenarioId + ')' })
      });
    }
  });
  ```
- **Copy / Download**, in the Comments menu, both produce the same Markdown — every comment, grouped by scenario, in one file. The zero-setup fallback for a quick local session with no webhook configured:
  ```markdown
  ---
  source: "Certificate of insurance prototype"
  exported: 2026-08-25T03:42:10.000Z
  tool: eaves
  count: 2
  ---

  ## Error state

  ### #1 — 03:38:12
  - pin: 62%, 41%

  The retry button copy reads as "cancel" — reword.

  ### #2 — 03:39:04
  - pin: (none)

  Consider showing which policy is incomplete, not just "incomplete."
  ```
  `.exportComments()` returns this same string programmatically. A comment line starting with `#`, `-`, `>`, or `` ` `` is backslash-escaped in the export so free-text notes can't be mistaken for headings, lists, or code fences by anything parsing the file back.

Pins themselves can be hidden independently of the bar — press `mod+shift+m` (or call `.hidePins()`), and every pin on the page disappears until you press it again or call `.showPins()`. Useful when a participant is looking at the screen but you still want the bar's menus open to keep taking notes. Starting to place a new pin (via **+ Add**) always reveals pins first, so the click-to-place flow never lands invisibly.

> **Note:** Chrome DevTools uses the same `Cmd/Ctrl+Shift+M` combo to toggle its device toolbar, but only while DevTools has focus — with DevTools closed, or focus back on the page, the shortcut reaches Eaves as normal. Override `pinsShortcut` if that collision matters for your workflow.

## Screenshots

Click **Save screenshots to a folder…** in the Comments menu, pick a folder once, and from then on every new comment silently saves a snapshot of the page alongside it — no prompt per comment, no server, nothing to run. Only shows up when the browser supports it (Chrome, Edge, and other Chromium browsers — not Firefox or Safari), and it needs a secure context (`https://` or `localhost`).

Two things worth knowing about how this actually works, since it's not what "screenshot" usually implies:

- **It's a copy of the page's markup, not a photo of the screen.** There's no browser API that lets a page silently capture real pixels — that always requires an explicit "share your screen" prompt, no way around it. So instead, each snapshot is `document.documentElement.outerHTML` at the moment the pin gets placed, with a small static marker baked in at the same spot as the pin — a real, openable `.html` file, not an image.
- **That means a few things don't come through**: text someone just typed into a form field on the prototype (the browser doesn't reflect it back into the HTML the same way), anything drawn on a `<canvas>` or playing in a `<video>`, and images/stylesheets loaded from a local dev server rather than a stable URL — those 404 once the snapshot is opened somewhere else, later. Assets on a CDN or bundled inline keep working fine.

The folder connection itself doesn't persist across a page reload — that's deliberate, to avoid needing any storage beyond what's already used for comment text. `.hasScreenshotFolder()` tells you whether one's currently connected.

## Status

Early — v0.4. Built for a single, common shape (a flat list of named scenarios). Grouped/nested variants and a React wrapper are likely next, depending on what people actually need.

The default shortcut was exercised in headless Chromium under macOS and Windows user agents. One known limit: Eaves listens on `document`, so a host page that calls `stopPropagation()` on `keydown` first will swallow the shortcut — the bar's own click targets still work.

Comments work today: pin placement, the Comments menu, click-to-select + Delete-key removal, `localStorage` persistence, `onComment`, Markdown export, hiding pins independently of the rest of the bar, and auto-saved markup snapshots to a local folder (Chromium browsers only).

## License

MIT
