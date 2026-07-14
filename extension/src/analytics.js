/**
 * AU analytics.js
 * Content script proxy for secure GA4 tracking.
 * Routes events to the background service worker to bypass CSP.
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  /**
   * Track an event securely by delegating to the service worker.
   * @param {string} eventName 
   * @param {Object} [params]
   */
  function trackEvent(eventName, params = {}) {
    try {
      chrome.runtime.sendMessage({
        type: 'TRACK_EVENT',
        eventName: eventName,
        params: params
      });
    } catch (err) {
      console.warn('[AU_ANALYTICS] Failed to dispatch message to background', err);
    }
  }

  window.AU_ANALYTICS = Object.freeze({
    trackEvent
  });
})();
