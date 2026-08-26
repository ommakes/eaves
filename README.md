# Eaves

A hideable control panel for coded usability-test prototypes — switch scenarios and variants live, without touching the UI you're testing.

Named for the roofline: it sits at the edge of the structure, not inside it. Anchored to a corner, collapsed by default, and dismissible entirely with a keyboard shortcut so it never shows up in a screen recording unless you want it to.

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

## API

`Eaves.init(options)` returns an instance.

| Option | Type | Default | Description |
|---|---|---|---|
| `scenarios` | `{ id, label, description? }[]` | — | Required. What shows up in the panel. |
| `onSelect` | `(id, scenario) => void` | no-op | Fires when a scenario is picked. |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Corner to anchor to. |
| `shortcut` | string | `'mod+.'` | Keyboard combo to toggle the panel open/closed. `mod` resolves to `Cmd` on macOS/iOS and `Ctrl` everywhere else. Pin a modifier explicitly with `meta`/`cmd`, `ctrl`, `shift`, or `alt` — e.g. `'ctrl+shift+k'`. |
| `hideShortcut` | string | `'mod+shift+h'` | Keyboard combo that fully hides the trigger bubble itself, not just the panel — for a clean screen recording. Pressing `shortcut` while hidden reveals it again and opens the panel, so there's always a way back even if you forget this combo. |
| `label` | string | `'Scenarios'` | Panel header text. |
| `activeId` | string | first scenario | Which item starts selected. |
| `startOpen` | boolean | `false` | Whether the panel starts expanded. |
| `mount` | boolean | `true` | Set `false` to build the instance without attaching it to the DOM yet — call `.mount()` when you're ready. |
| `comments` | boolean | `false` | Opt-in. Lets a facilitator pin private feedback for the designer directly on the prototype — see [Comments](#comments) below. |
| `onComment` | `(comment) => void` | no-op | Fires as each comment is created — the recommended way to relay comments off the facilitator's own device (e.g. to a Slack webhook) when the prototype is on a shared or hosted link, not just a local build. |
| `pinsShortcut` | string | `'mod+shift+m'` | Only active when `comments: true`. Toggles pin visibility on the prototype, independent of `hideShortcut` and of whether the panel itself is open — for when a participant is watching the screen but the panel needs to stay reachable. |

Instance methods:

| Method | Description |
|---|---|
| `.expand()` | Open the panel. |
| `.collapse()` | Close the panel. |
| `.toggle()` | Open if closed, close if open. |
| `.isOpen()` | `true` while the panel is expanded. |
| `.isHidden()` | `true` while the trigger bubble itself is hidden (see `hideShortcut`). |
| `.hide()` | Collapse the panel and hide the trigger bubble entirely. |
| `.show()` | Reverse of `.hide()`. Panel stays collapsed until opened. |
| `.select(id)` | Activate a scenario and fire `onSelect`. Unknown ids are ignored. |
| `.mount()` | Attach to `document.body`. Only needed after `mount: false`. Returns the instance. |
| `.destroy()` | Remove the panel and unbind the keyboard listener. |
| `.addComment(text, opts?)` | Requires `comments: true`. Adds a comment to the current scenario; `opts.xPct`/`opts.yPct` (0–100) place a pin. Returns the comment, or `null` if `text` is empty. |
| `.getComments(scenarioId?)` | Reads back stored comments as plain objects, optionally filtered to one scenario. |
| `.exportComments()` | Returns every comment across every scenario as one Markdown string — see [Comments](#comments) below. |
| `.clearComments()` | Wipes all stored comments for this instance. |
| `.hidePins()` / `.showPins()` / `.arePinsHidden()` | Toggle pin visibility on the prototype. Mirrors `.hide()`/`.show()`/`.isHidden()`, but independent of them — hiding pins leaves the panel itself untouched. Requires `comments: true`; a no-op otherwise. |

`Esc` also closes the panel while it's open.

## Comments

Set `comments: true` and a "Comments" tab appears alongside Scenarios. Click **+ Add comment**, then click anywhere on the prototype to drop a numbered pin and write a note — the same click-to-annotate flow as leaving a comment in Figma. Pins are scoped to the scenario they were left on and stored in `localStorage`, keyed by position as a percentage of the page (`xPct`/`yPct`), so they stay lined up with the right spot even if the window is resized.

This is a facilitator-private notes layer, not a shared one — nothing here is visible to a test participant unless you show it to them, and there's no live sync between browsers. Two ways a comment gets to you:

- **`onComment`** fires the instant a comment is saved, in the facilitator's own browser. If the prototype is on an internal hosted link rather than a build you're running locally, wire this to your own endpoint (a Slack webhook, an internal API) — this is the reliable path, since it doesn't depend on anyone remembering an extra step:
  ```js
  Eaves.init({
    scenarios: [ /* ... */ ],
    comments: true,
    onComment: function (comment) {
      fetch('https://hooks.slack.com/services/…', {
        method: 'POST',
        body: JSON.stringify({ text: comment.text + ' (' + comment.scenarioId + ')' })
      });
    }
  });
  ```
- **Copy / Download**, in the Comments tab, both produce the same Markdown — every comment, grouped by scenario, in one file. The zero-setup fallback for a quick local session with no webhook configured:
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

Pins themselves can be hidden independently of the panel — press `mod+shift+m` (or call `.hidePins()`), and every pin on the page disappears until you press it again or call `.showPins()`. Useful when a participant is looking at the screen but you still want the panel open to keep taking notes. Starting to place a new pin (via **+ Add comment**) always reveals pins first, so the click-to-place flow never lands invisibly.

> **Note:** Chrome DevTools uses the same `Cmd/Ctrl+Shift+M` combo to toggle its device toolbar, but only while DevTools has focus — with DevTools closed, or focus back on the page, the shortcut reaches Eaves as normal. Override `pinsShortcut` if that collision matters for your workflow.

## Status

Early — v0.1. Built for a single, common shape (a flat list of named scenarios). Grouped/nested variants and a React wrapper are likely next, depending on what people actually need.

The default shortcut was exercised in headless Chromium under macOS and Windows user agents. One known limit: Eaves listens on `document`, so a host page that calls `stopPropagation()` on `keydown` first will swallow the shortcut — the trigger button still works.

Comments are newer still: pin placement, the Comments tab, `localStorage` persistence, `onComment`, Markdown export, and hiding pins independently of the rest of the panel all work today.

## License

MIT
