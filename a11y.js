(function () {
  'use strict';

  var STORAGE_KEY = 'xpensy_a11y';
  var STR = {
    he: {
      toggle: 'תפריט נגישות', title: 'נגישות',
      inc: 'הגדלת טקסט', dec: 'הקטנת טקסט',
      contrast: 'ניגודיות גבוהה', motion: 'עצירת אנימציות',
      reset: 'איפוס', statement: 'הצהרת נגישות', close: 'סגירה',
      skip: 'דלגו לתוכן הראשי'
    },
    en: {
      toggle: 'Accessibility menu', title: 'Accessibility',
      inc: 'Increase text', dec: 'Decrease text',
      contrast: 'High contrast', motion: 'Stop animations',
      reset: 'Reset', statement: 'Accessibility statement', close: 'Close',
      skip: 'Skip to main content'
    }
  };

  function lang() {
    return (document.documentElement.lang || 'he').slice(0, 2) === 'en' ? 'en' : 'he';
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { zoom: 0, contrast: false, noMotion: false };
  }
  function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = loadState();

  function applyState() {
    var html = document.documentElement;
    html.classList.remove('a11y-zoom-1', 'a11y-zoom-2', 'a11y-zoom-3');
    if (state.zoom > 0) html.classList.add('a11y-zoom-' + state.zoom);
    html.classList.toggle('a11y-contrast', !!state.contrast);
    html.classList.toggle('a11y-no-motion', !!state.noMotion);
  }

  function injectStyle() {
    var style = document.createElement('style');
    style.textContent = [
      'html.a11y-zoom-1 { zoom: 1.15; }',
      'html.a11y-zoom-2 { zoom: 1.3; }',
      'html.a11y-zoom-3 { zoom: 1.45; }',
      'html.a11y-contrast body, html.a11y-contrast body :not(.a11y-widget):not(.a11y-widget *) {',
      '  background-color: #000 !important; background-image: none !important;',
      '  color: #fff !important; border-color: #6b6b6b !important;',
      '  box-shadow: none !important; text-shadow: none !important;',
      '  -webkit-text-fill-color: #fff !important; background-clip: initial !important; -webkit-background-clip: initial !important;',
      '}',
      'html.a11y-contrast a:not(.a11y-widget *), html.a11y-contrast a:not(.a11y-widget *) * { color: #ffe066 !important; -webkit-text-fill-color: #ffe066 !important; text-decoration: underline !important; }',
      'html.a11y-contrast img:not(.a11y-widget img) { filter: grayscale(20%) contrast(1.1); }',
      'html.a11y-no-motion *, html.a11y-no-motion *::before, html.a11y-no-motion *::after {',
      '  animation-duration: 0.001ms !important; animation-iteration-count: 1 !important;',
      '  transition-duration: 0.001ms !important; scroll-behavior: auto !important;',
      '}',
      ':focus-visible { outline: 3px solid #ffbf47 !important; outline-offset: 2px !important; }',
      '.a11y-skip-link {',
      '  position: fixed; top: -60px; inset-inline-start: 10px; z-index: 100000;',
      '  background: #fff; color: #1a1a2e; padding: 12px 20px; border-radius: 8px;',
      '  font: 700 14px system-ui, sans-serif; text-decoration: none; transition: top 0.2s;',
      '}',
      '.a11y-skip-link:focus { top: 10px; }',
      '.a11y-widget { position: fixed; bottom: 18px; inset-inline-end: 18px; z-index: 99999; font-family: system-ui, sans-serif; }',
      '.a11y-widget-btn {',
      '  width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer;',
      '  background: #6c5ce7; color: #fff; font-size: 24px; line-height: 1;',
      '  box-shadow: 0 8px 24px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;',
      '}',
      '.a11y-widget-btn:hover { background: #7d6ff0; }',
      '.a11y-panel {',
      '  position: absolute; bottom: 62px; inset-inline-end: 0; width: 240px;',
      '  background: #17141f; color: #f1f0f5; border: 1px solid rgba(255,255,255,0.12);',
      '  border-radius: 14px; padding: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);',
      '  display: none;',
      '}',
      '.a11y-panel.open { display: block; }',
      '.a11y-panel h2 { font-size: 14px; font-weight: 700; margin: 0 0 10px; }',
      '.a11y-row { display: flex; gap: 8px; margin-bottom: 8px; }',
      '.a11y-row button, .a11y-panel-btn {',
      '  flex: 1; background: rgba(255,255,255,0.06); color: #f1f0f5; border: 1px solid rgba(255,255,255,0.12);',
      '  border-radius: 8px; padding: 9px 8px; font-size: 13px; cursor: pointer; text-align: center;',
      '}',
      '.a11y-row button:hover, .a11y-panel-btn:hover { background: rgba(255,255,255,0.14); }',
      '.a11y-row button[aria-pressed="true"], .a11y-panel-btn[aria-pressed="true"] { background: #6c5ce7; border-color: #6c5ce7; }',
      '.a11y-panel a.a11y-panel-link {',
      '  display: block; text-align: center; margin-top: 6px; font-size: 12.5px; color: #a78bfa; text-decoration: none;',
      '}',
      '.a11y-panel a.a11y-panel-link:hover { text-decoration: underline; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function skipTarget() {
    return document.getElementById('main-content')
      || document.querySelector('main')
      || document.querySelector('.content')
      || document.body.firstElementChild;
  }

  function buildSkipLink(t) {
    var a = document.createElement('a');
    a.className = 'a11y-skip-link';
    a.href = '#';
    a.textContent = t.skip;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var target = skipTarget();
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus();
    });
    document.body.insertBefore(a, document.body.firstChild);
  }

  function buildWidget() {
    var t = STR[lang()];
    var wrap = document.createElement('div');
    wrap.className = 'a11y-widget';

    var btn = document.createElement('button');
    btn.className = 'a11y-widget-btn';
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '♿';

    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');

    function render() {
      t = STR[lang()];
      btn.setAttribute('aria-label', t.toggle);
      panel.innerHTML = '';

      var h2 = document.createElement('h2');
      h2.textContent = t.title;
      panel.appendChild(h2);

      var row1 = document.createElement('div');
      row1.className = 'a11y-row';
      var decBtn = document.createElement('button');
      decBtn.type = 'button'; decBtn.textContent = 'A-'; decBtn.setAttribute('aria-label', t.dec);
      decBtn.addEventListener('click', function () { state.zoom = Math.max(0, state.zoom - 1); saveState(state); applyState(); });
      var incBtn = document.createElement('button');
      incBtn.type = 'button'; incBtn.textContent = 'A+'; incBtn.setAttribute('aria-label', t.inc);
      incBtn.addEventListener('click', function () { state.zoom = Math.min(3, state.zoom + 1); saveState(state); applyState(); });
      row1.appendChild(decBtn); row1.appendChild(incBtn);
      panel.appendChild(row1);

      var contrastBtn = document.createElement('button');
      contrastBtn.type = 'button'; contrastBtn.className = 'a11y-panel-btn';
      contrastBtn.textContent = t.contrast;
      contrastBtn.setAttribute('aria-pressed', String(!!state.contrast));
      contrastBtn.style.display = 'block'; contrastBtn.style.width = '100%'; contrastBtn.style.marginBottom = '8px';
      contrastBtn.addEventListener('click', function () {
        state.contrast = !state.contrast; saveState(state); applyState();
        contrastBtn.setAttribute('aria-pressed', String(!!state.contrast));
      });
      panel.appendChild(contrastBtn);

      var motionBtn = document.createElement('button');
      motionBtn.type = 'button'; motionBtn.className = 'a11y-panel-btn';
      motionBtn.textContent = t.motion;
      motionBtn.setAttribute('aria-pressed', String(!!state.noMotion));
      motionBtn.style.display = 'block'; motionBtn.style.width = '100%'; motionBtn.style.marginBottom = '8px';
      motionBtn.addEventListener('click', function () {
        state.noMotion = !state.noMotion; saveState(state); applyState();
        motionBtn.setAttribute('aria-pressed', String(!!state.noMotion));
      });
      panel.appendChild(motionBtn);

      var resetBtn = document.createElement('button');
      resetBtn.type = 'button'; resetBtn.className = 'a11y-panel-btn';
      resetBtn.textContent = t.reset;
      resetBtn.style.display = 'block'; resetBtn.style.width = '100%';
      resetBtn.addEventListener('click', function () {
        state = { zoom: 0, contrast: false, noMotion: false };
        saveState(state); applyState(); render();
      });
      panel.appendChild(resetBtn);

      var link = document.createElement('a');
      link.className = 'a11y-panel-link';
      link.href = '/accessibility.html';
      link.textContent = t.statement;
      panel.appendChild(link);
    }
    render();

    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) { panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });

    wrap.appendChild(panel);
    wrap.appendChild(btn);
    document.body.appendChild(wrap);

    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  function init() {
    injectStyle();
    applyState();
    buildSkipLink(STR[lang()]);
    buildWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
