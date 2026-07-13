/**
 * AU helpers.js
 * Reusable, pure utility functions. 
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  /**
   * Debounce: delay execution until after `wait` ms of no calls.
   * @param {Function} fn
   * @param {number} wait
   * @returns {Function}
   */
  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /**
   * Throttle: execute at most once per `limit` ms.
   * @param {Function} fn
   * @param {number} limit
   * @returns {Function}
   */
  function throttle(fn, limit) {
    let active = false;
    return function (...args) {
      if (!active) {
        fn.apply(this, args);
        active = true;
        setTimeout(() => { active = false; }, limit);
      }
    };
  }

  /**
   * Deep clone a JSON-serializable object.
   * @param {*} obj
   * @returns {*}
   */
  function deepClone(obj) {
    if (obj === null || obj === undefined) return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Generate a short random alphanumeric ID.
   * @returns {string}
   */
  function generateId() {
    return Math.random().toString(36).slice(2, 10);
  }

  /**
   * Remove extra whitespace and trim.
   * @param {string} str
   * @returns {string}
   */
  function cleanString(str) {
    if (!str) return '';
    return String(str).replace(/\s+/g, ' ').trim();
  }

  /**
   * Normalize a raw grade string from the portal.
   * Strips asterisks, spaces, and other portal decorations.
   * e.g. "C+ *" -> "C+", " B-  " -> "B-"
   * @param {string} raw
   * @returns {string}
   */
  function normalizeGrade(raw) {
    if (!raw) return '';
    return String(raw).replace(/[^A-Za-z+-]/g, '').toUpperCase();
  }

  /**
   * Round a GPA value to specified decimal places.
   * @param {number} value
   * @param {number} [decimals=2]
   * @returns {number}
   */
  function roundGPA(value, decimals) {
    if (isNaN(value) || value === null) return 0;
    const d = typeof decimals === 'number' ? decimals : 2;
    const factor = Math.pow(10, d);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Format a number as a GPA string.
   * @param {number} value
   * @param {number} [decimals=2]
   * @returns {string}
   */
  function formatGPA(value, decimals) {
    return roundGPA(value, decimals).toFixed(typeof decimals === 'number' ? decimals : 2);
  }

  /**
   * Clamp a number between min and max.
   * @param {number} val
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  /**
   * Escape HTML special chars to prevent XSS.
   * @param {string} str
   * @returns {string}
   */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.AU_H = Object.freeze({
    debounce,
    throttle,
    deepClone,
    generateId,
    cleanString,
    normalizeGrade,
    roundGPA,
    formatGPA,
    clamp,
    escHtml,
  });
})();
