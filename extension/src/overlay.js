/**
 * overlay.js
 * Manages Shadow DOM host, panel, and toggle button.
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  let _host = null;
  let _shadow = null;
  let _panel = null;
  let _fab = null;
  let _isOpen = false;

  function init() {
    if (document.getElementById('au-gpa-root')) return;

    _host = document.createElement('div');
    _host.id = 'au-gpa-root';
    document.body.appendChild(_host);

    _shadow = _host.attachShadow({ mode: 'open' });

    // Load styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('src/styles.css');
    _shadow.appendChild(link);

    _buildPanel();
    _buildToggleBtn();

    AU_NOTIFICATIONS.init(_shadow);
    AU_UI.init(_shadow);
  }

  function _buildPanel() {
    _panel = document.createElement('div');
    _panel.className = 'au-panel-wrapper';
    _panel.setAttribute('role', 'dialog');
    _panel.setAttribute('aria-label', 'GradePilot');
        _panel.innerHTML =
      '<div class="au-header" style="padding: 32px 32px 24px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-primary);">' +
        '<div class="au-header__brand" style="display: flex; align-items: center; gap: 16px;">' +
          '<div class="au-header__logo-container" style="width: 48px; height: 48px; flex-shrink: 0;">' +
            '<img src="' + chrome.runtime.getURL('icons/icon48.png') + '" alt="Logo" onerror="this.parentElement.style.display=\'none\'" style="width:100%; height:100%; border-radius: var(--radius-md); object-fit: contain;">' +
          '</div>' +
          '<div class="au-header__text">' +
            '<div class="au-header__title" style="font-family: var(\'--font-serif\'); font-size: 22px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.5px; line-height: 1.2;">GradePilot</div>' +
            '<div class="au-header__sub" style="font-family: var(\'--font-sans\'); font-size: 13px; color: var(--accent-gold); font-weight: 500; margin-top: 4px;">By Ahmad Kaleem Bhatti</div>' +
          '</div>' +
        '</div>' +
        '<button class="au-header__close" id="au-close-btn" aria-label="Close panel" title="Close (Esc)">&times;</button>' +
      '</div>' +
      '<div class="au-body" id="au-content"></div>' +
      '<div class="au-footer">' +
        '<a href="https://www.linkedin.com/in/ahmadkaleembhatti/" target="_blank" rel="noopener">Ahmad Kaleem Bhatti</a>' +
        '&nbsp;&bull;&nbsp;Air University' +
      '</div>';

    _panel.querySelector('#au-close-btn').addEventListener('click', close);
    _shadow.appendChild(_panel);
  }

    let _isDragging = false;
  let _hasDragged = false;
  let _dragStartX = 0;
  let _dragStartY = 0;
  let _fabStartX = 0;
  let _fabStartY = 0;

  function _buildToggleBtn() {
    _fab = document.createElement('button');
    _fab.className = 'au-fab';
    _fab.setAttribute('aria-label', 'Open GradePilot');
    _fab.title = 'GradePilot (Ctrl+Shift+G)';
    _fab.innerHTML = '<span style="color: #d4af37; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">GPA</span>';
    
    chrome.storage.local.get(['auFabPosition'], (res) => {
      if (res.auFabPosition) {
        _fab.style.left = res.auFabPosition.x + 'px';
        _fab.style.top = res.auFabPosition.y + 'px';
        _fab.style.bottom = 'auto';
        _fab.style.right = 'auto';
      }
    });

    _fab.addEventListener('mousedown', _onDragStart);
    _fab.addEventListener('touchstart', _onDragStart, { passive: false });

    _fab.addEventListener('click', (e) => {
      if (_hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        toggle();
      }
    });

    _shadow.appendChild(_fab);

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && _isOpen) {
        e.preventDefault();
        close();
      }
    });
  }

  function _onDragStart(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    _isDragging = true;
    _hasDragged = false;
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    _dragStartX = clientX;
    _dragStartY = clientY;
    
    const rect = _fab.getBoundingClientRect();
    _fabStartX = rect.left;
    _fabStartY = rect.top;

    document.addEventListener('mousemove', _onDragMove, { passive: false });
    document.addEventListener('touchmove', _onDragMove, { passive: false });
    document.addEventListener('mouseup', _onDragEnd);
    document.addEventListener('touchend', _onDragEnd);
  }

  function _onDragMove(e) {
    if (!_isDragging) return;
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - _dragStartX;
    const dy = clientY - _dragStartY;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      _hasDragged = true;
    }

    if (_hasDragged) {
      e.preventDefault();
      
      let newX = _fabStartX + dx;
      let newY = _fabStartY + dy;
      
      const maxX = window.innerWidth - _fab.offsetWidth;
      const maxY = window.innerHeight - _fab.offsetHeight;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      _fab.style.left = newX + 'px';
      _fab.style.top = newY + 'px';
      _fab.style.bottom = 'auto';
      _fab.style.right = 'auto';
    }
  }

  function _onDragEnd() {
    _isDragging = false;
    document.removeEventListener('mousemove', _onDragMove);
    document.removeEventListener('touchmove', _onDragMove);
    document.removeEventListener('mouseup', _onDragEnd);
    document.removeEventListener('touchend', _onDragEnd);

    if (_hasDragged) {
      chrome.storage.local.set({
        auFabPosition: {
          x: parseInt(_fab.style.left, 10),
          y: parseInt(_fab.style.top, 10)
        }
      });
    }
  }

  /**
   * Update the FAB to show the current CGPA when data is loaded.
   * @param {number|null} cgpa
   */
  function updateFAB(cgpa) {
    if (cgpa !== null) {
      _fab.innerHTML = '<span style="color: #d4af37; font-size: 10px; font-weight: 600; letter-spacing: 1px; margin-right: 8px; text-transform: uppercase;">CGPA</span>' + 
                       '<span style="font-size: 16px; font-weight: 600;">' + cgpa + '</span>';
    } else {
      _fab.innerHTML = '<span style="color: #d4af37; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">GPA</span>';
    }
  }

  function open() {
    _isOpen = true;
    if (window.AU_ANALYTICS) AU_ANALYTICS.trackEvent('extension_opened');
    _panel.classList.add('au-panel-wrapper--open');
  }

  function close() {
    _isOpen = false;
    _panel.classList.remove('au-panel-wrapper--open');
  }

  function toggle() {
    _isOpen ? close() : open();
  }

  window.AU_OVERLAY = Object.freeze({ init, open, close, toggle, updateFAB });
})();
