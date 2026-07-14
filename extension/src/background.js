importScripts('env.js');

const MEASUREMENT_ID = (self.AU_ENV && self.AU_ENV.GA_MEASUREMENT_ID) || '';
const API_SECRET = (self.AU_ENV && self.AU_ENV.GA_API_SECRET) || '';
const GA_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

const SESSION_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes

function _uuidv4() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// Get or create unique Client ID
async function getClientId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['au_analytics_client_id'], (result) => {
      if (result.au_analytics_client_id) {
        resolve(result.au_analytics_client_id);
      } else {
        const newId = _uuidv4();
        chrome.storage.local.set({ au_analytics_client_id: newId }, () => resolve(newId));
      }
    });
  });
}

// Get or create Session ID (for Realtime tracking)
async function getSession() {
  return new Promise((resolve) => {
    chrome.storage.session.get(['session_id', 'session_timestamp'], (result) => {
      const now = Date.now();
      let sessionId = result.session_id;
      let timestamp = result.session_timestamp || 0;

      // If no session exists or it has expired
      if (!sessionId || (now - timestamp > SESSION_EXPIRATION_MS)) {
        sessionId = now.toString();
        timestamp = now;
      }

      // Update timestamp to keep session alive
      chrome.storage.session.set({ session_id: sessionId, session_timestamp: now }, () => {
        resolve({ sessionId, engagementTime: now - timestamp + 1 }); // +1 to ensure > 0
      });
    });
  });
}

// Execute the fetch request to GA4 Measurement Protocol
async function trackEvent(eventName, params = {}) {
  if (!MEASUREMENT_ID || MEASUREMENT_ID === 'YOUR_MEASUREMENT_ID') return;

  try {
    const clientId = await getClientId();
    const session = await getSession();

    // Inject required session parameters for Realtime dashboard
    params.session_id = session.sessionId;
    params.engagement_time_msec = session.engagementTime;

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
    console.log(`[AU_ANALYTICS] Dispatched event: ${eventName}`);
  } catch (err) {
    console.warn('[AU_ANALYTICS] Background tracking failed', err);
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRACK_EVENT' && message.eventName) {
    trackEvent(message.eventName, message.params || {});
    // Return true to indicate we will send a response asynchronously if needed
    // But since we just fire and forget, sendResponse() immediately is fine
    sendResponse({ status: 'queued' });
  }
});
