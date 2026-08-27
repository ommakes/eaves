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
  var COMMENTS_KEY = 'eaves-comments';
  var instanceCount = 0;

  var CSS = [
    '.eaves-root{position:fixed;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:12px;line-height:1.4;}',
    '.eaves-root[data-position="bottom-right"]{bottom:16px;right:16px;}',
    '.eaves-root[data-position="bottom-left"]{bottom:16px;left:16px;}',
    '.eaves-root[data-position="top-right"]{top:16px;right:16px;}',
    '.eaves-root[data-position="top-left"]{top:16px;left:16px;}',
    '.eaves-root.eaves-hidden{display:none;}',
    '.eaves-bar{display:flex;align-items:stretch;height:40px;background:#2c2c2c;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.25);}',
    '.eaves-grip{width:20px;flex:none;display:flex;align-items:center;justify-content:center;color:#b1b1b1;cursor:grab;touch-action:none;}',
    '.eaves-grip:active{cursor:grabbing;}',
    '.eaves-grip svg{width:16px;height:16px;}',
    '.eaves-bar-mid{display:flex;align-items:center;padding:0 4px;}',
    '.eaves-bar-btn{display:flex;align-items:center;gap:2px;background:none;border:none;color:#fff;font-size:12px;font-weight:500;font-family:inherit;padding:6px 8px;border-radius:6px;cursor:pointer;white-space:nowrap;transition:background .15s ease;}',
    '.eaves-bar-btn:hover,.eaves-bar-btn[data-active="true"]{background:rgba(255,255,255,.06);}',
    '.eaves-bar-btn:focus-visible{outline:2px solid #ffde69;outline-offset:-2px;}',
    '.eaves-bar-btn svg{width:14px;height:14px;color:#7e7e7e;flex:none;}',
    '.eaves-bar-divider{width:1px;align-self:center;height:24px;background:#505050;margin:0 4px;flex:none;}',
    '.eaves-bar-close{width:24px;flex:none;display:flex;align-items:center;justify-content:center;color:#b1b1b1;cursor:pointer;transition:color .15s ease;}',
    '.eaves-bar-close:hover{color:#fff;}',
    '.eaves-bar-close:focus-visible{outline:2px solid #ffde69;outline-offset:-2px;}',
    '.eaves-bar-close svg{width:16px;height:16px;}',
    '.eaves-grip,.eaves-bar-close{border:none;padding:0;}',
    '.eaves-popover{position:absolute;z-index:2147483000;background:#2c2c2c;border-radius:8px;padding:4px;box-shadow:0 8px 30px rgba(0,0,0,.35);min-width:172px;max-width:260px;box-sizing:border-box;display:none;}',
    '.eaves-popover.eaves-popover-open{display:block;}',
    '.eaves-popover-list{display:flex;flex-direction:column;}',
    '.eaves-popover-row{display:flex;align-items:center;gap:4px;width:100%;min-height:23px;padding:4px;background:none;border:none;color:#fff;font-size:12px;font-family:inherit;text-align:left;cursor:pointer;border-radius:6px;transition:background .15s ease;}',
    '.eaves-popover-row:hover{background:rgba(255,255,255,.06);}',
    '.eaves-popover-row:focus-visible{outline:2px solid #ffde69;outline-offset:-2px;}',
    '.eaves-popover-row[data-active-comment="true"]{background:rgba(255,255,255,.12);}',
    '.eaves-popover-check{width:14px;height:14px;flex:none;color:#95c7ff;display:flex;align-items:center;justify-content:center;}',
    '.eaves-popover-num{width:14px;flex:none;color:#95c7ff;font-weight:600;text-align:center;}',
    '.eaves-popover-row-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.eaves-popover-empty{font-size:12px;color:#8a8a8a;padding:6px 8px;}',
    '.eaves-popover-add{display:flex;align-items:center;justify-content:center;gap:4px;width:100%;height:28px;background:rgba(255,255,255,.04);border:none;color:#f0f0f0;font-size:12px;font-weight:600;font-family:inherit;border-radius:6px;cursor:pointer;margin-top:4px;transition:background .15s ease;}',
    '.eaves-popover-add:hover{background:rgba(255,255,255,.08);}',
    '.eaves-popover-add:focus-visible{outline:2px solid #ffde69;outline-offset:-2px;}',
    '.eaves-popover-add svg{width:14px;height:14px;}',
    '.eaves-popover-export{display:flex;gap:4px;margin-top:4px;}',
    '.eaves-popover-export .eaves-popover-add{margin-top:0;flex:1;font-size:11px;text-transform:uppercase;letter-spacing:.03em;}',
    '.eaves-pin-layer{position:absolute;top:0;left:0;z-index:2147483000;pointer-events:none;}',
    '.eaves-pin-layer.eaves-pins-hidden{display:none;}',
    '.eaves-pin{position:absolute;width:32px;height:32px;margin:-16px 0 0 -16px;padding:2px;box-sizing:border-box;background:#fff;border:none;border-radius:16px 16px 16px 0;cursor:pointer;pointer-events:auto;box-shadow:0 2px 6px rgba(0,0,0,.35);transition:transform .15s ease;}',
    '.eaves-pin:hover{transform:scale(1.08);}',
    '.eaves-pin:focus-visible{outline:2px solid #95c7ff;outline-offset:2px;}',
    '.eaves-pin-inner{width:100%;height:100%;border-radius:50%;background:#ffde69;display:flex;align-items:center;justify-content:center;}',
    '.eaves-pin-inner span{color:#0f0f0f;font-size:12px;font-weight:600;}',
    '.eaves-pin[data-active="true"] .eaves-pin-inner{outline:2px solid #95c7ff;outline-offset:1px;}',
    '.eaves-pin.eaves-pin-flash{animation:eaves-pin-flash .6s ease;}',
    '@keyframes eaves-pin-flash{0%,100%{transform:scale(1);}30%{transform:scale(1.35);}}',
    '.eaves-composer{position:absolute;z-index:2147483000;background:#2c2c2c;border-radius:8px;padding:4px 4px 8px;width:220px;box-sizing:border-box;pointer-events:auto;box-shadow:0 8px 30px rgba(0,0,0,.35);}',
    '.eaves-composer textarea{width:100%;min-height:60px;background:rgba(255,255,255,.04);color:#fff;border:none;border-radius:6px;padding:8px;font-size:12px;font-family:inherit;resize:vertical;box-sizing:border-box;}',
    '.eaves-composer textarea:focus-visible{outline:2px solid #ffde69;outline-offset:1px;}',
    '.eaves-composer-actions{display:flex;gap:8px;margin-top:8px;padding:0 4px;justify-content:flex-end;}',
    '.eaves-composer-btn{background:rgba(255,255,255,.04);border:none;color:#f0f0f0;font-size:12px;font-weight:600;font-family:inherit;padding:0 8px;height:28px;border-radius:6px;cursor:pointer;transition:background .15s ease;}',
    '.eaves-composer-btn:hover{background:rgba(255,255,255,.08);}',
    '.eaves-composer-btn:focus-visible{outline:2px solid #ffde69;outline-offset:-2px;}',
    '.eaves-composer-btn[data-primary="true"]{background:#ffde69;color:#0f0f0f;min-width:64px;}',
    '.eaves-composer-btn[data-primary="true"]:hover{background:#ffe58f;}',
    'body.eaves-placing,body.eaves-placing *{cursor:crosshair !important;}'
  ].join('');

  function loadComments() {
    try {
      var raw = window.localStorage.getItem(COMMENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveComments(data) {
    try {
      window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage unavailable (private mode, quota, disabled) — comments
      // stay in-memory for this session instead of failing the whole widget.
    }
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatTime(iso) {
    var d = new Date(iso);
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function yamlString(value) {
    return '"' + String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }

  // A comment starting a line with #, -, >, or ` could otherwise be
  // misread as a heading, list item, blockquote, or code fence by a
  // Markdown parser walking the export — escape those so free-text
  // comments can't corrupt the template's structure.
  function escapeMarkdownLines(text) {
    return String(text).split('\n').map(function (line) {
      return line.replace(/^(\s*)([#\-`>])/, '$1\\$2');
    }).join('\n');
  }

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

  function shortcutLabel(combo, verb) {
    var parts = [];
    if (combo.meta) parts.push(isApplePlatform() ? '⌘' : 'Win');
    if (combo.ctrl) parts.push('Ctrl');
    if (combo.shift) parts.push('Shift');
    if (combo.alt) parts.push('Alt');
    parts.push(combo.key === '.' ? '.' : combo.key.toUpperCase());
    return parts.join(' + ') + ' to ' + (verb || 'toggle');
  }

  // A click/keydown landing in a real text field must never be hijacked by a
  // single-key shortcut (Delete/Backspace to remove the active comment, most of all).
  function isEditableTarget(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable === true;
  }

  // Lucide-style icon set — stroke-based so currentColor drives every color.
  var GRIP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>' +
    '<circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>';
  var CHEVRON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  var CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  var CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var PLUS_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';

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
    this.hideShortcut = parseShortcut(options.hideShortcut || 'mod+shift+h');
    this.activeId = options.activeId || this.scenarios[0].id;
    this.label = options.label || 'Scenarios';
    this.comments = options.comments !== false;
    this.onComment = options.onComment || function () {};
    this.commentsData = this.comments ? loadComments() : [];
    this.pinsShortcut = this.comments ? parseShortcut(options.pinsShortcut || 'mod+shift+m') : null;
    this.openMenu = null;
    this.activeCommentId = null;

    injectStyles();
    this._build();
    this._onKeydown = function (e) {
      if (matchesShortcut(e, self.hideShortcut)) {
        e.preventDefault();
        if (self.isHidden()) { self.show(); } else { self.hide(); }
        return;
      }
      if (self.pinsShortcut && matchesShortcut(e, self.pinsShortcut)) {
        e.preventDefault();
        if (self.arePinsHidden()) { self.showPins(); } else { self.hidePins(); }
        return;
      }
      if (matchesShortcut(e, self.shortcut)) {
        e.preventDefault();
        if (self.isHidden()) { self.show(); }
        self.toggle();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && self.activeCommentId && !isEditableTarget(e.target)) {
        e.preventDefault();
        self.deleteComment(self.activeCommentId);
        return;
      }
      if (e.key === 'Escape' && self.isOpen()) {
        self.collapse();
      }
    };
    document.addEventListener('keydown', this._onKeydown);

    if (this.comments) {
      var resizeTimer;
      this._onResize = function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { self._renderPins(); }, 100);
      };
      window.addEventListener('resize', this._onResize);
    }

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

    var bar = document.createElement('div');
    bar.className = 'eaves-bar';

    var grip = document.createElement('div');
    grip.className = 'eaves-grip';
    grip.setAttribute('aria-hidden', 'true');
    grip.innerHTML = GRIP_ICON;

    var mid = document.createElement('div');
    mid.className = 'eaves-bar-mid';

    var scenesBtn = document.createElement('button');
    scenesBtn.type = 'button';
    scenesBtn.className = 'eaves-bar-btn';
    scenesBtn.setAttribute('data-active', 'false');
    scenesBtn.setAttribute('aria-label', this.label + ' menu');
    scenesBtn.innerHTML = '<span>' + this.label + '</span>' + CHEVRON_ICON;
    scenesBtn.addEventListener('click', function () {
      if (self.openMenu === 'scenes') { self._closeMenus(); } else { self._openMenu('scenes'); }
    });
    mid.appendChild(scenesBtn);

    var commentsBtn = null;
    if (this.comments) {
      var divider = document.createElement('div');
      divider.className = 'eaves-bar-divider';
      mid.appendChild(divider);

      commentsBtn = document.createElement('button');
      commentsBtn.type = 'button';
      commentsBtn.className = 'eaves-bar-btn';
      commentsBtn.setAttribute('data-active', 'false');
      commentsBtn.setAttribute('aria-label', 'Comments menu');
      commentsBtn.innerHTML = '<span>Comments</span>' + CHEVRON_ICON;
      commentsBtn.addEventListener('click', function () {
        if (self.openMenu === 'comments') { self._closeMenus(); } else { self._openMenu('comments'); }
      });
      mid.appendChild(commentsBtn);
    }

    var closeBtn = document.createElement('div');
    closeBtn.className = 'eaves-bar-close';
    closeBtn.setAttribute('role', 'button');
    closeBtn.setAttribute('tabindex', '0');
    closeBtn.setAttribute('aria-label', 'Hide (' + shortcutLabel(this.hideShortcut, 'hide') + ')');
    closeBtn.innerHTML = CLOSE_ICON;
    closeBtn.addEventListener('click', function () { self.hide(); });
    closeBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.hide(); }
    });

    bar.appendChild(grip);
    bar.appendChild(mid);
    bar.appendChild(closeBtn);
    root.appendChild(bar);

    var scenesPopover = document.createElement('div');
    scenesPopover.className = 'eaves-popover';

    var scenesList = document.createElement('div');
    scenesList.className = 'eaves-popover-list';
    scenesPopover.appendChild(scenesList);

    var commentsPopover = null, commentsList = null, addBtn = null;
    if (this.comments) {
      commentsPopover = document.createElement('div');
      commentsPopover.className = 'eaves-popover';

      commentsList = document.createElement('div');
      commentsList.className = 'eaves-popover-list';
      commentsPopover.appendChild(commentsList);

      addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'eaves-popover-add';
      addBtn.innerHTML = PLUS_ICON + '<span>Add</span>';
      addBtn.addEventListener('click', function () {
        self._closeMenus();
        self._startPlacing();
      });
      commentsPopover.appendChild(addBtn);

      var exportRow = document.createElement('div');
      exportRow.className = 'eaves-popover-export';

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'eaves-popover-add';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', function () { self._copyComments(copyBtn); });

      var downloadBtn = document.createElement('button');
      downloadBtn.type = 'button';
      downloadBtn.className = 'eaves-popover-add';
      downloadBtn.textContent = 'Download';
      downloadBtn.addEventListener('click', function () { self._downloadComments(); });

      exportRow.appendChild(copyBtn);
      exportRow.appendChild(downloadBtn);
      commentsPopover.appendChild(exportRow);
    }

    this.root = root;
    this.bar = bar;
    this.grip = grip;
    this.scenesBtn = scenesBtn;
    this.commentsBtn = commentsBtn;
    this.closeBtn = closeBtn;
    this.scenesPopover = scenesPopover;
    this.scenesList = scenesList;
    this.commentsPopover = commentsPopover;
    this.commentsList = commentsList;
    this.addCommentBtn = addBtn;

    this._renderScenesMenu();
    this._initDrag();

    if (this.comments) {
      var pinLayer = document.createElement('div');
      pinLayer.className = 'eaves-pin-layer';
      this.pinLayer = pinLayer;
      this._renderPins();
      this._renderCommentsMenu();
    }
  };

  Eaves.prototype.mount = function () {
    document.body.appendChild(this.root);
    document.body.appendChild(this.scenesPopover);
    if (this.commentsPopover) document.body.appendChild(this.commentsPopover);
    if (this.pinLayer) document.body.appendChild(this.pinLayer);
    return this;
  };

  Eaves.prototype.isOpen = function () {
    return this.openMenu !== null;
  };

  Eaves.prototype.isHidden = function () {
    return this.root.classList.contains('eaves-hidden');
  };

  Eaves.prototype.hide = function () {
    this.collapse();
    this.root.classList.add('eaves-hidden');
  };

  Eaves.prototype.show = function () {
    this.root.classList.remove('eaves-hidden');
  };

  Eaves.prototype.expand = function () {
    this._openMenu('scenes');
  };

  Eaves.prototype.collapse = function () {
    this._closeMenus();
  };

  Eaves.prototype.toggle = function () {
    if (this.isOpen()) { this.collapse(); } else { this.expand(); }
  };

  Eaves.prototype._openMenu = function (which) {
    var popover = which === 'scenes' ? this.scenesPopover : this.commentsPopover;
    var trigger = which === 'scenes' ? this.scenesBtn : this.commentsBtn;
    if (!popover || !trigger) return;
    this._closeMenus();

    popover.classList.add('eaves-popover-open');
    this._positionPopover(popover, trigger);
    this.openMenu = which;
    this.scenesBtn.setAttribute('data-active', which === 'scenes' ? 'true' : 'false');
    if (this.commentsBtn) this.commentsBtn.setAttribute('data-active', which === 'comments' ? 'true' : 'false');

    var self = this;
    this._onOutsideMenuClick = function (e) {
      if (popover.contains(e.target) || trigger.contains(e.target)) return;
      self._closeMenus();
    };
    // Deferred so the very click that opened this menu (still bubbling to
    // document when this listener would otherwise be added) doesn't also close it.
    setTimeout(function () {
      if (self._onOutsideMenuClick) document.addEventListener('click', self._onOutsideMenuClick, true);
    }, 0);
  };

  Eaves.prototype._closeMenus = function () {
    if (this.scenesPopover) this.scenesPopover.classList.remove('eaves-popover-open');
    if (this.commentsPopover) this.commentsPopover.classList.remove('eaves-popover-open');
    if (this.scenesBtn) this.scenesBtn.setAttribute('data-active', 'false');
    if (this.commentsBtn) this.commentsBtn.setAttribute('data-active', 'false');
    this.openMenu = null;
    if (this._onOutsideMenuClick) {
      document.removeEventListener('click', this._onOutsideMenuClick, true);
      this._onOutsideMenuClick = null;
    }
  };

  Eaves.prototype._positionPopover = function (popover, trigger) {
    var triggerRect = trigger.getBoundingClientRect();
    var barRect = this.root.getBoundingClientRect();
    var popoverHeight = popover.offsetHeight;
    var top = barRect.bottom + window.pageYOffset + 6;
    if (barRect.bottom + popoverHeight + 6 > window.innerHeight) {
      top = barRect.top + window.pageYOffset - popoverHeight - 6;
    }
    var left = triggerRect.left + window.pageXOffset;
    var maxLeft = window.pageXOffset + document.documentElement.clientWidth - popover.offsetWidth - 8;
    if (left > maxLeft) left = Math.max(window.pageXOffset + 8, maxLeft);
    popover.style.top = top + 'px';
    popover.style.left = left + 'px';
  };

  Eaves.prototype._initDrag = function () {
    var self = this;
    this.grip.addEventListener('pointerdown', function (e) {
      if (typeof e.button === 'number' && e.button !== 0) return;
      e.preventDefault();
      self._closeMenus();

      var rect = self.root.getBoundingClientRect();
      var offsetX = e.clientX - rect.left;
      var offsetY = e.clientY - rect.top;
      var maxX = window.innerWidth - rect.width;
      var maxY = window.innerHeight - rect.height;

      try { self.grip.setPointerCapture(e.pointerId); } catch (err) { /* unsupported — drag still works via document fallback below */ }

      var onMove = function (ev) {
        var x = Math.max(0, Math.min(maxX, ev.clientX - offsetX));
        var y = Math.max(0, Math.min(maxY, ev.clientY - offsetY));
        self.root.style.left = x + 'px';
        self.root.style.top = y + 'px';
        self.root.style.right = 'auto';
        self.root.style.bottom = 'auto';
      };
      var onUp = function (ev) {
        self.grip.removeEventListener('pointermove', onMove);
        self.grip.removeEventListener('pointerup', onUp);
        self.grip.removeEventListener('pointercancel', onUp);
        try { self.grip.releasePointerCapture(ev.pointerId); } catch (err) { /* no-op */ }
      };
      self.grip.addEventListener('pointermove', onMove);
      self.grip.addEventListener('pointerup', onUp);
      self.grip.addEventListener('pointercancel', onUp);
    });
  };

  Eaves.prototype.select = function (id) {
    var scenario = this.scenarios.filter(function (s) { return s.id === id; })[0];
    if (!scenario) return;
    this.activeId = id;
    this._renderScenesMenu();
    if (this.comments) {
      this.activeCommentId = null;
      this._renderPins();
      this._renderCommentsMenu();
    }
    this.onSelect(id, scenario);
  };

  Eaves.prototype._renderScenesMenu = function () {
    if (!this.scenesList) return;
    var self = this;
    this.scenesList.innerHTML = '';
    this.scenarios.forEach(function (scenario) {
      var isActive = scenario.id === self.activeId;
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'eaves-popover-row';
      row.setAttribute('data-scenario-id', scenario.id);
      if (scenario.description) row.title = scenario.description;

      var check = document.createElement('span');
      check.className = 'eaves-popover-check';
      if (isActive) check.innerHTML = CHECK_ICON;
      row.appendChild(check);

      var text = document.createElement('span');
      text.className = 'eaves-popover-row-text';
      text.textContent = scenario.label;
      row.appendChild(text);

      row.addEventListener('click', function () {
        self.select(scenario.id);
        self._closeMenus();
      });
      self.scenesList.appendChild(row);
    });
  };

  Eaves.prototype._renderPins = function () {
    if (!this.pinLayer) return;
    var self = this;
    this.pinLayer.innerHTML = '';
    this.getComments(this.activeId).forEach(function (comment, index) {
      if (typeof comment.xPct !== 'number' || typeof comment.yPct !== 'number') return;
      var pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'eaves-pin';
      pin.setAttribute('data-comment-id', comment.id);
      pin.setAttribute('data-active', comment.id === self.activeCommentId ? 'true' : 'false');
      pin.setAttribute('aria-label', 'Comment ' + (index + 1) + ': ' + comment.text);
      pin.style.left = (comment.xPct / 100 * document.documentElement.scrollWidth) + 'px';
      pin.style.top = (comment.yPct / 100 * document.documentElement.scrollHeight) + 'px';

      var inner = document.createElement('span');
      inner.className = 'eaves-pin-inner';
      var num = document.createElement('span');
      num.textContent = String(index + 1);
      inner.appendChild(num);
      pin.appendChild(inner);

      pin.addEventListener('click', function () {
        self._setActiveComment(comment.id);
        self._flashPin(comment.id);
      });
      self.pinLayer.appendChild(pin);
    });
  };

  Eaves.prototype._flashPin = function (commentId) {
    if (!this.pinLayer) return;
    var pin = this.pinLayer.querySelector('[data-comment-id="' + commentId + '"]');
    if (!pin) return;
    pin.scrollIntoView({ block: 'center', behavior: 'smooth' });
    pin.classList.add('eaves-pin-flash');
    setTimeout(function () { pin.classList.remove('eaves-pin-flash'); }, 600);
  };

  Eaves.prototype._setActiveComment = function (id) {
    this.activeCommentId = id;
    this._renderPins();
    this._renderCommentsMenu();
  };

  Eaves.prototype._renderCommentsMenu = function () {
    if (!this.commentsList) return;
    var self = this;
    this.commentsList.innerHTML = '';
    var scenarioComments = this.getComments(this.activeId);

    if (!scenarioComments.length) {
      var empty = document.createElement('div');
      empty.className = 'eaves-popover-empty';
      empty.textContent = 'No comments on this scenario yet.';
      this.commentsList.appendChild(empty);
      return;
    }

    scenarioComments.forEach(function (comment, index) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'eaves-popover-row';
      row.setAttribute('data-comment-id', comment.id);
      row.setAttribute('data-active-comment', comment.id === self.activeCommentId ? 'true' : 'false');

      var num = document.createElement('span');
      num.className = 'eaves-popover-num';
      num.textContent = String(index + 1);
      row.appendChild(num);

      var text = document.createElement('span');
      text.className = 'eaves-popover-row-text';
      text.textContent = comment.text;
      row.appendChild(text);

      row.addEventListener('click', function () {
        self._setActiveComment(comment.id);
        self._flashPin(comment.id);
      });
      self.commentsList.appendChild(row);
    });
  };

  Eaves.prototype._startPlacing = function () {
    var self = this;
    this._placing = true;
    this.showPins(); // the pin + composer about to be placed live in this layer — can't stay hidden mid-flow
    document.body.classList.add('eaves-placing');

    this._onPlacingClick = function (e) {
      if (self.root.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      self._cancelPlacing();
      self._openComposer(e.pageX, e.pageY);
    };
    document.addEventListener('click', this._onPlacingClick, true);
  };

  Eaves.prototype._cancelPlacing = function () {
    this._placing = false;
    document.body.classList.remove('eaves-placing');
    if (this._onPlacingClick) {
      document.removeEventListener('click', this._onPlacingClick, true);
      this._onPlacingClick = null;
    }
  };

  Eaves.prototype._openComposer = function (pageX, pageY) {
    var self = this;
    this._closeComposer();

    var xPct = Math.max(0, Math.min(100, pageX / document.documentElement.scrollWidth * 100));
    var yPct = Math.max(0, Math.min(100, pageY / document.documentElement.scrollHeight * 100));

    var composer = document.createElement('div');
    composer.className = 'eaves-composer';
    composer.style.left = pageX + 'px';
    composer.style.top = pageY + 'px';

    var textarea = document.createElement('textarea');
    textarea.placeholder = 'What should the designer know?';
    composer.appendChild(textarea);

    var actions = document.createElement('div');
    actions.className = 'eaves-composer-actions';

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'eaves-composer-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', function () { self._closeComposer(); });

    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'eaves-composer-btn';
    saveBtn.setAttribute('data-primary', 'true');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', function () {
      self.addComment(textarea.value, { xPct: xPct, yPct: yPct });
      self._closeComposer();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    composer.appendChild(actions);

    composer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); self._closeComposer(); }
    });

    this.pinLayer.appendChild(composer);
    this.composer = composer;
    textarea.focus();
  };

  Eaves.prototype._closeComposer = function () {
    if (this.composer && this.composer.parentNode) {
      this.composer.parentNode.removeChild(this.composer);
    }
    this.composer = null;
  };

  Eaves.prototype.addComment = function (text, opts) {
    if (!this.comments) return null;
    opts = opts || {};
    text = (text || '').trim();
    if (!text) return null;

    var comment = {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      scenarioId: this.activeId,
      text: text,
      xPct: typeof opts.xPct === 'number' ? opts.xPct : null,
      yPct: typeof opts.yPct === 'number' ? opts.yPct : null,
      createdAt: new Date().toISOString()
    };

    this.commentsData.push(comment);
    this.activeCommentId = comment.id;
    this._saveComments();
    this._renderPins();
    this._renderCommentsMenu();
    this.onComment(comment);
    return comment;
  };

  Eaves.prototype.getComments = function (scenarioId) {
    if (!scenarioId) return this.commentsData.slice();
    return this.commentsData.filter(function (c) { return c.scenarioId === scenarioId; });
  };

  Eaves.prototype.deleteComment = function (id) {
    var before = this.commentsData.length;
    this.commentsData = this.commentsData.filter(function (c) { return c.id !== id; });
    if (this.commentsData.length === before) return false;
    if (this.activeCommentId === id) this.activeCommentId = null;
    this._saveComments();
    this._renderPins();
    this._renderCommentsMenu();
    return true;
  };

  Eaves.prototype.clearComments = function () {
    this.commentsData = [];
    this.activeCommentId = null;
    this._saveComments();
    this._renderPins();
    this._renderCommentsMenu();
  };

  Eaves.prototype.arePinsHidden = function () {
    return !!this.pinLayer && this.pinLayer.classList.contains('eaves-pins-hidden');
  };

  Eaves.prototype.hidePins = function () {
    if (this.pinLayer) this.pinLayer.classList.add('eaves-pins-hidden');
  };

  Eaves.prototype.showPins = function () {
    if (this.pinLayer) this.pinLayer.classList.remove('eaves-pins-hidden');
  };

  Eaves.prototype._copyComments = function (button) {
    var text = this.exportComments();
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    navigator.clipboard.writeText(text).then(function () {
      button.textContent = 'Copied!';
      setTimeout(function () { button.textContent = 'Copy'; }, 1200);
    }, function () {
      // Clipboard write can be denied (insecure origin, no permission) —
      // the Download button stays as a fallback, so fail quietly here.
    });
  };

  Eaves.prototype._downloadComments = function () {
    var blob = new Blob([this.exportComments()], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'eaves-comments-' + new Date().toISOString().slice(0, 10) + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  Eaves.prototype.exportComments = function () {
    var self = this;
    var lines = [];

    lines.push('---');
    lines.push('source: ' + yamlString((typeof document !== 'undefined' && document.title) || 'Eaves prototype'));
    lines.push('exported: ' + new Date().toISOString());
    lines.push('tool: eaves');
    lines.push('count: ' + this.commentsData.length);
    lines.push('---');

    this.scenarios.forEach(function (scenario) {
      var scenarioComments = self.getComments(scenario.id);
      if (!scenarioComments.length) return;

      lines.push('');
      lines.push('## ' + scenario.label);

      scenarioComments.forEach(function (comment, index) {
        var pin = (typeof comment.xPct === 'number' && typeof comment.yPct === 'number')
          ? Math.round(comment.xPct) + '%, ' + Math.round(comment.yPct) + '%'
          : '(none)';

        lines.push('');
        lines.push('### #' + (index + 1) + ' — ' + formatTime(comment.createdAt));
        lines.push('- pin: ' + pin);
        lines.push('');
        lines.push(escapeMarkdownLines(comment.text));
      });
    });

    return lines.join('\n');
  };

  Eaves.prototype._saveComments = function () {
    saveComments(this.commentsData);
  };

  Eaves.prototype.destroy = function () {
    document.removeEventListener('keydown', this._onKeydown);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this._onPlacingClick) document.removeEventListener('click', this._onPlacingClick, true);
    if (this._onOutsideMenuClick) document.removeEventListener('click', this._onOutsideMenuClick, true);
    document.body.classList.remove('eaves-placing');
    this._closeComposer();
    if (this.pinLayer && this.pinLayer.parentNode) this.pinLayer.parentNode.removeChild(this.pinLayer);
    if (this.scenesPopover && this.scenesPopover.parentNode) this.scenesPopover.parentNode.removeChild(this.scenesPopover);
    if (this.commentsPopover && this.commentsPopover.parentNode) this.commentsPopover.parentNode.removeChild(this.commentsPopover);
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  Eaves.init = function (options) {
    return new Eaves(options);
  };

  return Eaves;
});
