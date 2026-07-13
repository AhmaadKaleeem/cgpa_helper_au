/**
 * AU GPA Optimizer — eventBus.js
 * Lightweight publish-subscribe event system. Exposed as window.AU_BUS
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  const _listeners = {};

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} callback
   */
  function on(event, callback) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(callback);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event
   * @param {Function} callback
   */
  function off(event, callback) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Publish an event, passing data to all subscribers.
   * @param {string} event
   * @param {*} [data]
   */
  function emit(event, data) {
    if (!_listeners[event]) return;
    _listeners[event].forEach(cb => {
      try { cb(data); } catch (e) {
        console.error('[AU_BUS] Error in listener for "' + event + '":', e);
      }
    });
  }

  window.AU_BUS = Object.freeze({ on, off, emit });
})();
