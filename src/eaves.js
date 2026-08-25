/*!
 * Eaves — a hideable control panel for coded usability-test prototypes.
 * No dependencies. Drop it in with a <script> tag or `npm install eaves-panel`.
 * https://github.com/ommakes/eaves
 * MIT License
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Eaves = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STYLE_ID = 'eaves-styles';
  var instanceCount = 0;

  var CSS = [
    '.eaves-root{position:fixed;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:13px;line-height:1.4;}',
    '.eaves-root[data-position="bottom-right"]{bottom:16px;right:16px;}',
    '.eaves-root[data-position="bottom-left"]{bottom:16px;left:16px;}',
    '.eaves-root[data-position="top-right"]{top:16px;right:16px;}',
    '.eaves-root[data-position="top-left"]{top:16px;left:16px;}',
    '.eaves-trigger{width:40px;height:40px;border-radius:50%;background:#18181b;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.25);transition:transform .15s ease;padding:0;}',
    '.eaves-trigger:hover{transform:scale(1.05);}',
    '.eaves-trigger:active{transform:scale(.96);}',
    '.eaves-trigger:focus-visible{outline:2px solid #60a5fa;outline-offset:2px;}',
    '.eaves-trigger svg{width:18px;height:18px;}',
    '.eaves-panel{position:absolute;bottom:48px;right:0;min-width:230px;max-width:300px;max-height:360px;overflow-y:auto;background:#18181b;color:#f4f4f5;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.35);padding:8px;opacity:0;visibility:hidden;transform:scale(.96);transform-origin:var(--eaves-ox,right) var(--eaves-oy,bottom);transition:opacity .15s ease,transform .15s ease,visibility 0s linear .15s;}',
    '.eaves-root[data-position="top-right"] .eaves-panel,.eaves-root[data-position="top-left"] .eaves-panel{bottom:auto;top:48px;--eaves-oy:top;}',
    '.eaves-root[data-position="bottom-left"] .eaves-panel,.eaves-root[data-position="top-left"] .eaves-panel{right:auto;left:0;--eaves-ox:left;}',
    '.eaves-root.eaves-open .eaves-panel{opacity:1;visibility:visible;transform:scale(1);transition:opacity .15s ease,transform .15s ease,visibility 0s linear 0s;}',
    '.eaves-header{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#a1a1aa;padding:6px 8px 4px;}',
    '.eaves-item{display:block;width:100%;text-align:left;background:none;border:none;color:#f4f4f5;padding:7px 8px;border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;transition:background .15s ease;}',
    '.eaves-item:hover{background:#27272a;}',
    '.eaves-item:focus-visible{outline:2px solid #60a5fa;outline-offset:-2px;}',
    '.eaves-item[data-active="true"]{background:#3f3f46;font-weight:600;}',
    '.eaves-item-desc{display:block;font-size:11px;color:#a1a1aa;font-weight:400;margin-top:1px;}',
    '.eaves-footer{border-top:1px solid #27272a;margin-top:6px;padding-top:6px;font-size:11px;color:#71717a;padding-left:8px;}'
  ].join('');

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Cmd and Ctrl are not interchangeable across platforms: `metaKey` is Cmd on
  // Apple hardware but the Windows/Super key elsewhere, where the OS claims most
  // combos (Win+. opens the emoji picker on Windows 10/11). So `mod` resolves per
  // platform instead of hardcoding either one.
  function isApplePlatform() {
    if (typeof navigator === 'undefined') return false;
    var uaData = navigator.userAgentData;
    if (uaData && typeof uaData.platform === 'string' && uaData.platform) {
      return /mac/i.test(uaData.platform);
    }
    return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || '');
  }

  function parseShortcut(shortcut) {
    var parts = shortcut.toLowerCase().split('+').map(function (p) { return p.trim(); });
    var meta = parts.indexOf('meta') > -1 || parts.indexOf('cmd') > -1;
    var ctrl = parts.indexOf('ctrl') > -1;

    if (parts.indexOf('mod') > -1) {
      if (isApplePlatform()) { meta = true; } else { ctrl = true; }
    }

    return {
      key: parts[parts.length - 1],
      meta: meta,
      ctrl: ctrl,
      shift: parts.indexOf('shift') > -1,
      alt: parts.indexOf('alt') > -1
    };
  }

  function matchesShortcut(e, combo) {
    if (!e.key) return false;
    return e.key.toLowerCase() === combo.key &&
      e.metaKey === combo.meta &&
      e.ctrlKey === combo.ctrl &&
      e.shiftKey === combo.shift &&
      e.altKey === combo.alt;
  }

  function shortcutLabel(combo) {
    var parts = [];
    if (combo.meta) parts.push(isApplePlatform() ? '⌘' : 'Win');
    if (combo.ctrl) parts.push('Ctrl');
    if (combo.shift) parts.push('Shift');
    if (combo.alt) parts.push('Alt');
    parts.push(combo.key === '.' ? '.' : combo.key.toUpperCase());
    return parts.join(' + ') + ' to toggle';
  }

  // Roofline glyph — keeps the eaves metaphor in the trigger itself.
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/>' +
    '<path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>';

  function Eaves(options) {
    options = options || {};
    if (!options.scenarios || !options.scenarios.length) {
      throw new Error('Eaves: options.scenarios is required and must be a non-empty array of { id, label }');
    }

    var self = this;
    this.scenarios = options.scenarios;
    this.onSelect = options.onSelect || function () {};
    this.position = options.position || 'bottom-right';
    this.shortcut = parseShortcut(options.shortcut || 'mod+.');
    this.activeId = options.activeId || this.scenarios[0].id;
    this.label = options.label || 'Scenarios';

    injectStyles();
    this._build();
    this._onKeydown = function (e) {
      if (matchesShortcut(e, self.shortcut)) {
        e.preventDefault();
        self.toggle();
        return;
      }
      if (e.key === 'Escape' && self.isOpen()) {
        self.collapse();
      }
    };
    document.addEventListener('keydown', this._onKeydown);

    if (options.mount !== false) {
      this.mount();
    }

    if (options.startOpen) this.expand();
  }

  Eaves.prototype._build = function () {
    var self = this;
    instanceCount++;

    var root = document.createElement('div');
    root.className = 'eaves-root';
    root.setAttribute('data-position', this.position);
    root.setAttribute('data-eaves-instance', instanceCount);

    var trigger = document.createElement('button');
    trigger.className = 'eaves-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'Toggle ' + this.label + ' panel');
    trigger.innerHTML = ICON;
    trigger.addEventListener('click', function () { self.toggle(); });

    var panel = document.createElement('div');
    panel.className = 'eaves-panel';

    var header = document.createElement('div');
    header.className = 'eaves-header';
    header.textContent = this.label;
    panel.appendChild(header);

    var list = document.createElement('div');
    list.className = 'eaves-list';

    this.scenarios.forEach(function (scenario) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'eaves-item';
      item.setAttribute('data-active', scenario.id === self.activeId ? 'true' : 'false');
      item.setAttribute('data-scenario-id', scenario.id);

      var labelEl = document.createElement('span');
      labelEl.textContent = scenario.label;
      item.appendChild(labelEl);

      if (scenario.description) {
        var descEl = document.createElement('span');
        descEl.className = 'eaves-item-desc';
        descEl.textContent = scenario.description;
        item.appendChild(descEl);
      }

      item.addEventListener('click', function () { self.select(scenario.id); });
      list.appendChild(item);
    });

    panel.appendChild(list);

    var footer = document.createElement('div');
    footer.className = 'eaves-footer';
    footer.textContent = shortcutLabel(this.shortcut) + ' · Esc to close';
    panel.appendChild(footer);

    root.appendChild(panel);
    root.appendChild(trigger);

    this.root = root;
    this.panel = panel;
    this.trigger = trigger;
    this.list = list;
  };

  Eaves.prototype.mount = function () {
    document.body.appendChild(this.root);
    return this;
  };

  Eaves.prototype.isOpen = function () {
    return this.root.classList.contains('eaves-open');
  };

  Eaves.prototype.expand = function () {
    this.root.classList.add('eaves-open');
  };

  Eaves.prototype.collapse = function () {
    this.root.classList.remove('eaves-open');
  };

  Eaves.prototype.toggle = function () {
    if (this.isOpen()) { this.collapse(); } else { this.expand(); }
  };

  Eaves.prototype.select = function (id) {
    var scenario = this.scenarios.filter(function (s) { return s.id === id; })[0];
    if (!scenario) return;
    this.activeId = id;
    var items = this.list.querySelectorAll('.eaves-item');
    for (var i = 0; i < items.length; i++) {
      var isActive = items[i].getAttribute('data-scenario-id') === id;
      items[i].setAttribute('data-active', isActive ? 'true' : 'false');
    }
    this.onSelect(id, scenario);
  };

  Eaves.prototype.destroy = function () {
    document.removeEventListener('keydown', this._onKeydown);
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  Eaves.init = function (options) {
    return new Eaves(options);
  };

  return Eaves;
});
