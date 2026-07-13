/**
 * AU GPA Optimizer — content.js
 * Bootstrap: wires MutationObserver, parser, engine, and overlay together.
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  let _parsed = false;
  let _parseDebounced = null;

  function _parse() {
    if (!AU_PARSER.isGradePageLoaded()) return;
    const raw = AU_PARSER.parseDOM();
    if (!raw) return;

    const settings = AU_STORAGE.getSettings();
    const overrides = AU_STORAGE.getOverrides();
    const record = AU_ENGINE.calculate(raw, overrides, settings.gpaDecimals || 2);

    AU_STORAGE.setRecord(record);
    AU_BUS.emit(AU_C.EVENTS.PARSER_COMPLETE, AU_STORAGE.getState());
    AU_OVERLAY.updateFAB(record.cgpa);

    if (!_parsed) {
      _parsed = true;
      if (settings.notifications !== false) {
        AU_NOTIFICATIONS.show('Grade data loaded. CGPA: ' + AU_H.formatGPA(record.cgpa), 'success');
      }
    }
  }

  async function boot() {
    // Initialize overlay UI first so it's always visible
    AU_OVERLAY.init();

    // Load persisted state
    try {
      await AU_STORAGE.load();
    } catch (e) {
      console.error('[AU GPA Optimizer] Storage load error:', e);
    }

    // Initial parse attempt
    _parseDebounced = AU_H.debounce(_parse, 1200);
    _parse();

    // Watch for dynamic page changes (SPA navigation, lazy-loaded tables)
    const observer = new MutationObserver(() => {
      if (AU_PARSER.isGradePageLoaded()) {
        _parseDebounced();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
