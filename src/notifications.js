/**
 * AU GPA Optimizer v2 — notifications.js
 * Toast notification system rendered inside Shadow DOM.
 * Exposed as window.AU_NOTIFICATIONS
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  let _container = null;

  const ICONS = {
    success: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  function init(shadowRoot) {
    if (_container) return;
    _container = document.createElement('div');
    _container.className = 'au-notif-container';
    shadowRoot.appendChild(_container);
  }

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} [type='info']
   * @param {number} [duration=3000]
   */
  function show(message, type, duration) {
    if (!_container) return;
    const t = type || 'info';
    const d = duration || 3000;

    const el = document.createElement('div');
    el.className = 'au-notif au-notif--' + t;
    el.innerHTML =
      '<span class="au-notif__icon">' + (ICONS[t] || ICONS.info) + '</span>' +
      '<span class="au-notif__msg">' + AU_H.escHtml(message) + '</span>' +
      '<button class="au-notif__close" aria-label="Dismiss">&times;</button>';

    el.querySelector('.au-notif__close').onclick = () => _dismiss(el);
    _container.appendChild(el);

    requestAnimationFrame(() => el.classList.add('au-notif--visible'));

    setTimeout(() => _dismiss(el), d);
  }

  function _dismiss(el) {
    el.classList.remove('au-notif--visible');
    setTimeout(() => {
      if (el.parentNode === _container) _container.removeChild(el);
    }, 350);
  }

  window.AU_NOTIFICATIONS = Object.freeze({ init, show });
})();
