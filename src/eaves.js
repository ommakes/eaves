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
    '.eaves-root{position:fixed;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:13px;line-height:1.4;}',
    '.eaves-root[data-position="bottom-right"]{bottom:16px;right:16px;}',
    '.eaves-root[data-position="bottom-left"]{bottom:16px;left:16px;}',
    '.eaves-root[data-position="top-right"]{top:16px;right:16px;}',
    '.eaves-root[data-position="top-left"]{top:16px;left:16px;}',
    '.eaves-root.eaves-hidden{display:none;}',
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
    '.eaves-footer{border-top:1px solid #27272a;margin-top:6px;padding-top:6px;font-size:11px;color:#71717a;padding-left:8px;}',
    '.eaves-tabs{display:flex;gap:4px;padding:0 0 8px;}',
    '.eaves-tab{flex:1;background:none;border:none;color:#a1a1aa;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;padding:6px 4px;border-radius:6px;cursor:pointer;font-family:inherit;transition:background .15s ease,color .15s ease;}',
    '.eaves-tab:hover{background:#27272a;color:#f4f4f5;}',
    '.eaves-tab:focus-visible{outline:2px solid #60a5fa;outline-offset:-2px;}',
    '.eaves-tab[data-active="true"]{background:#3f3f46;color:#f4f4f5;}',
    '.eaves-panel[data-tab="scenarios"] .eaves-comments-section{display:none;}',
    '.eaves-panel[data-tab="comments"] .eaves-list{display:none;}',
    '.eaves-add-comment{display:block;width:100%;text-align:left;background:#27272a;border:none;color:#f4f4f5;padding:7px 8px;border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;margin-bottom:6px;transition:background .15s ease;}',
    '.eaves-add-comment:hover{background:#3f3f46;}',
    '.eaves-add-comment:focus-visible{outline:2px solid #60a5fa;outline-offset:-2px;}',
    '.eaves-add-comment[data-active="true"]{background:#60a5fa;color:#18181b;}',
    '.eaves-comment-row{display:block;width:100%;text-align:left;background:none;border:none;color:#f4f4f5;padding:7px 8px;border-radius:6px;cursor:pointer;font-size:12.5px;font-family:inherit;transition:background .15s ease;}',
    '.eaves-comment-row:hover{background:#27272a;}',
    '.eaves-comment-row:focus-visible{outline:2px solid #60a5fa;outline-offset:-2px;}',
    '.eaves-comment-num{color:#60a5fa;font-weight:600;margin-right:4px;}',
    '.eaves-comment-empty{font-size:12px;color:#71717a;padding:6px 8px;}',
    '.eaves-pin-layer{position:absolute;top:0;left:0;z-index:2147483000;pointer-events:none;}',
    '.eaves-pin{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#60a5fa;border:2px solid #18181b;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer;pointer-events:auto;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .15s ease;}',
    '.eaves-pin:hover{transform:scale(1.15);}',
    '.eaves-pin:focus-visible{outline:2px solid #f4f4f5;outline-offset:2px;}',
    '.eaves-pin span{color:#18181b;font-size:10px;font-weight:700;}',
    '.eaves-pin.eaves-pin-flash{animation:eaves-pin-flash .6s ease;}',
    '@keyframes eaves-pin-flash{0%,100%{transform:scale(1);}30%{transform:scale(1.5);}}',
    '.eaves-composer{position:absolute;z-index:2147483000;background:#18181b;color:#f4f4f5;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.35);padding:8px;width:220px;box-sizing:border-box;pointer-events:auto;}',
    '.eaves-composer textarea{width:100%;min-height:60px;background:#27272a;color:#f4f4f5;border:1px solid #3f3f46;border-radius:6px;padding:6px 8px;font-size:12.5px;font-family:inherit;resize:vertical;box-sizing:border-box;}',
    '.eaves-composer textarea:focus-visible{outline:2px solid #60a5fa;outline-offset:1px;}',
    '.eaves-composer-actions{display:flex;gap:6px;margin-top:6px;justify-content:flex-end;}',
    '.eaves-composer-btn{background:none;border:none;color:#a1a1aa;font-size:12px;font-family:inherit;padding:4px 8px;border-radius:6px;cursor:pointer;transition:background .15s ease,color .15s ease;}',
    '.eaves-composer-btn:hover{background:#27272a;color:#f4f4f5;}',
    '.eaves-composer-btn:focus-visible{outline:2px solid #60a5fa;outline-offset:-2px;}',
    '.eaves-composer-btn[data-primary="true"]{background:#60a5fa;color:#18181b;}',
    '.eaves-composer-btn[data-primary="true"]:hover{background:#7db8fb;}',
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
    this.hideShortcut = parseShortcut(options.hideShortcut || 'mod+shift+h');
    this.activeId = options.activeId || this.scenarios[0].id;
    this.label = options.label || 'Scenarios';
    this.comments = options.comments === true;
    this.onComment = options.onComment || function () {};
    this.commentsData = this.comments ? loadComments() : [];

    injectStyles();
    this._build();
    this._onKeydown = function (e) {
      if (matchesShortcut(e, self.hideShortcut)) {
        e.preventDefault();
        if (self.isHidden()) { self.show(); } else { self.hide(); }
        return;
      }
      if (matchesShortcut(e, self.shortcut)) {
        e.preventDefault();
        if (self.isHidden()) { self.show(); }
        self.toggle();
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

    var trigger = document.createElement('button');
    trigger.className = 'eaves-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'Toggle ' + this.label + ' panel');
    trigger.innerHTML = ICON;
    trigger.addEventListener('click', function () { self.toggle(); });

    var panel = document.createElement('div');
    panel.className = 'eaves-panel';
    panel.setAttribute('data-tab', 'scenarios');

    var header = document.createElement('div');
    header.className = 'eaves-header';
    header.textContent = this.label;
    panel.appendChild(header);

    if (this.comments) {
      var tabs = document.createElement('div');
      tabs.className = 'eaves-tabs';

      var scenariosTab = document.createElement('button');
      scenariosTab.type = 'button';
      scenariosTab.className = 'eaves-tab';
      scenariosTab.textContent = 'Scenarios';
      scenariosTab.setAttribute('data-active', 'true');
      scenariosTab.addEventListener('click', function () { self._setTab('scenarios'); });

      var commentsTab = document.createElement('button');
      commentsTab.type = 'button';
      commentsTab.className = 'eaves-tab';
      commentsTab.textContent = 'Comments';
      commentsTab.setAttribute('data-active', 'false');
      commentsTab.addEventListener('click', function () { self._setTab('comments'); });

      tabs.appendChild(scenariosTab);
      tabs.appendChild(commentsTab);
      panel.appendChild(tabs);

      this.scenariosTab = scenariosTab;
      this.commentsTab = commentsTab;
    }

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

    if (this.comments) {
      var commentsSection = document.createElement('div');
      commentsSection.className = 'eaves-comments-section';

      var addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'eaves-add-comment';
      addBtn.textContent = '+ Add comment';
      addBtn.setAttribute('data-active', 'false');
      addBtn.addEventListener('click', function () { self._togglePlacing(); });

      var commentsList = document.createElement('div');
      commentsList.className = 'eaves-comments-list';

      commentsSection.appendChild(addBtn);
      commentsSection.appendChild(commentsList);
      panel.appendChild(commentsSection);

      this.addCommentBtn = addBtn;
      this.commentsList = commentsList;
    }

    var footer = document.createElement('div');
    footer.className = 'eaves-footer';
    footer.textContent = shortcutLabel(this.shortcut) + ' · ' + shortcutLabel(this.hideShortcut, 'hide') + ' · Esc to close';
    panel.appendChild(footer);

    root.appendChild(panel);
    root.appendChild(trigger);

    this.root = root;
    this.panel = panel;
    this.trigger = trigger;
    this.list = list;

    if (this.comments) {
      var pinLayer = document.createElement('div');
      pinLayer.className = 'eaves-pin-layer';
      this.pinLayer = pinLayer;
      this._renderPins();
      this._renderCommentsList();
    }
  };

  Eaves.prototype.mount = function () {
    document.body.appendChild(this.root);
    if (this.pinLayer) document.body.appendChild(this.pinLayer);
    return this;
  };

  Eaves.prototype.isOpen = function () {
    return this.root.classList.contains('eaves-open');
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
    if (this.comments) {
      this._renderPins();
      this._renderCommentsList();
    }
    this.onSelect(id, scenario);
  };

  Eaves.prototype._setTab = function (tab) {
    this.panel.setAttribute('data-tab', tab);
    this.scenariosTab.setAttribute('data-active', tab === 'scenarios' ? 'true' : 'false');
    this.commentsTab.setAttribute('data-active', tab === 'comments' ? 'true' : 'false');
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
      pin.setAttribute('aria-label', 'Comment ' + (index + 1) + ': ' + comment.text);
      pin.style.left = (comment.xPct / 100 * document.documentElement.scrollWidth) + 'px';
      pin.style.top = (comment.yPct / 100 * document.documentElement.scrollHeight) + 'px';

      var num = document.createElement('span');
      num.textContent = String(index + 1);
      pin.appendChild(num);

      pin.addEventListener('click', function () { self._flashPin(comment.id); });
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

  Eaves.prototype._renderCommentsList = function () {
    if (!this.commentsList) return;
    var self = this;
    this.commentsList.innerHTML = '';
    var scenarioComments = this.getComments(this.activeId);

    if (!scenarioComments.length) {
      var empty = document.createElement('div');
      empty.className = 'eaves-comment-empty';
      empty.textContent = 'No comments on this scenario yet.';
      this.commentsList.appendChild(empty);
      return;
    }

    scenarioComments.forEach(function (comment, index) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'eaves-comment-row';

      var num = document.createElement('span');
      num.className = 'eaves-comment-num';
      num.textContent = '#' + (index + 1);
      row.appendChild(num);
      row.appendChild(document.createTextNode(comment.text));

      row.addEventListener('click', function () { self._flashPin(comment.id); });
      self.commentsList.appendChild(row);
    });
  };

  Eaves.prototype._togglePlacing = function () {
    if (this._placing) { this._cancelPlacing(); } else { this._startPlacing(); }
  };

  Eaves.prototype._startPlacing = function () {
    var self = this;
    this._placing = true;
    this.addCommentBtn.setAttribute('data-active', 'true');
    this.addCommentBtn.textContent = 'Click the prototype…';
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
    this.addCommentBtn.setAttribute('data-active', 'false');
    this.addCommentBtn.textContent = '+ Add comment';
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
    this._saveComments();
    this._renderPins();
    this._renderCommentsList();
    this.onComment(comment);
    return comment;
  };

  Eaves.prototype.getComments = function (scenarioId) {
    if (!scenarioId) return this.commentsData.slice();
    return this.commentsData.filter(function (c) { return c.scenarioId === scenarioId; });
  };

  Eaves.prototype.clearComments = function () {
    this.commentsData = [];
    this._saveComments();
    this._renderPins();
    this._renderCommentsList();
  };

  Eaves.prototype._saveComments = function () {
    saveComments(this.commentsData);
  };

  Eaves.prototype.destroy = function () {
    document.removeEventListener('keydown', this._onKeydown);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this._onPlacingClick) document.removeEventListener('click', this._onPlacingClick, true);
    document.body.classList.remove('eaves-placing');
    if (this.pinLayer && this.pinLayer.parentNode) this.pinLayer.parentNode.removeChild(this.pinLayer);
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  Eaves.init = function (options) {
    return new Eaves(options);
  };

  return Eaves;
});
