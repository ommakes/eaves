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

`Esc` also closes the panel while it's open.

## Status

Early — v0.1. Built for a single, common shape (a flat list of named scenarios). Grouped/nested variants and a React wrapper are likely next, depending on what people actually need.

The default shortcut was exercised in headless Chromium under macOS and Windows user agents. One known limit: Eaves listens on `document`, so a host page that calls `stopPropagation()` on `keydown` first will swallow the shortcut — the trigger button still works.

## License

MIT
