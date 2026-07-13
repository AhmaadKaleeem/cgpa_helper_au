/**
 * AU GPA Optimizer — analytics.js
 * Secure Google Analytics 4 Measurement Protocol integration.
 * Exposed as window.AU_ANALYTICS
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  const MEASUREMENT_ID = (window.AU_ENV && window.AU_ENV.GA_MEASUREMENT_ID) || '';
  const API_SECRET = (window.AU_ENV && window.AU_ENV.GA_API_SECRET) || '';
  const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect?measurement_id=' + MEASUREMENT_ID + '&api_secret=' + API_SECRET;

  // Generate a random UUID for the client
  function _uuidv4() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  /**
   * Get or create a unique, anonymous client ID for this user installation.
   * @returns {Promise<string>}
   */
  function _getClientId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['au_analytics_client_id'], (result) => {
        if (result.au_analytics_client_id) {
          resolve(result.au_analytics_client_id);
        } else {
          const newId = _uuidv4();
          chrome.storage.local.set({ au_analytics_client_id: newId }, () => {
            resolve(newId);
          });
        }
      });
    });
  }

  /**
   * Track an event securely via Measurement Protocol.
   * @param {string} eventName 
   * @param {Object} [params]
   */
  async function trackEvent(eventName, params = {}) {
    if (!MEASUREMENT_ID || MEASUREMENT_ID === 'YOUR_MEASUREMENT_ID') return; // Not configured

    try {
      const clientId = await _getClientId();
      
      const payload = {
        client_id: clientId,
        events: [{
          name: eventName,
          params: params
        }]
      };

      await fetch(GA_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[AU_ANALYTICS] Tracking failed', err);
    }
  }

  window.AU_ANALYTICS = Object.freeze({
    trackEvent
  });
})();
