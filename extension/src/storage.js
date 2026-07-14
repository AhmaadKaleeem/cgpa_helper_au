/**
 * AU storage.js
 * Versioned chrome.storage.local wrapper with debounced autosave.
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  /** @type {AppState} */
  let _state = {
    version: AU_C.STORAGE_VERSION,
    lastParsed: null,
    record: null,
    settings: Object.assign({}, AU_C.DEFAULT_SETTINGS),
    simulatedOverrides: {},
    futureSemesters: [],
    scenarios: [],
  };

  const _autosave = AU_H.debounce(_write, 800);

  function _write() {
    try {
      chrome.storage.local.set({ [AU_C.STORAGE_KEY]: _state }, () => {
        if (chrome.runtime.lastError) {
          console.error('[AU_STORAGE] Write error:', chrome.runtime.lastError);
        }
      });
    } catch (e) {
      if (e.message && e.message.includes('Extension context invalidated')) {
        console.warn('[AU_STORAGE] Extension context invalidated (extension was updated/reloaded). Please refresh the page.');
      } else {
        console.error('[AU_STORAGE] Write exception:', e);
      }
    }
  }

  /**
   * Migrate older storage schemas to current version.
   * @param {Object} raw
   * @returns {AppState}
   */
  function _migrate(raw) {
    if (!raw) return _state;
    // v1 -> v2: add new fields that didn't exist
    const migrated = Object.assign({}, _state, raw);
    migrated.version = AU_C.STORAGE_VERSION;
    migrated.settings = Object.assign({}, AU_C.DEFAULT_SETTINGS, raw.settings || {});
    migrated.simulatedOverrides = raw.simulatedOverrides || {};
    migrated.futureSemesters = raw.futureSemesters || [];
    migrated.scenarios = raw.scenarios || [];
    return migrated;
  }

  /**
   * Load state from storage. Returns a Promise.
   * @returns {Promise<AppState>}
   */
  function load() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([AU_C.STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        _state = _migrate(result[AU_C.STORAGE_KEY]);
        AU_BUS.emit(AU_C.EVENTS.STORAGE_RESTORED, _state);
        resolve(_state);
      });
    });
  }

  /** Save the student record. @param {StudentRecord} record */
  function setRecord(record) {
    _state.record = record;
    _state.lastParsed = new Date().toISOString();
    _autosave();
  }

  /** @returns {StudentRecord|null} */
  function getRecord() { return _state.record; }

  /** Update settings and persist. @param {Object} patch */
  function updateSettings(patch) {
    _state.settings = Object.assign({}, _state.settings, patch);
    _autosave();
    AU_BUS.emit(AU_C.EVENTS.SETTINGS_CHANGED, _state.settings);
  }

  /** @returns {Object} */
  function getSettings() { return _state.settings; }

  /** @returns {Object} simulatedOverrides courseId->grade */
  function getOverrides() { return _state.simulatedOverrides; }

  /** @param {string} courseId @param {string|null} grade */
  function setOverride(courseId, grade) {
    if (grade === null) {
      delete _state.simulatedOverrides[courseId];
    } else {
      _state.simulatedOverrides[courseId] = grade;
    }
    _autosave();
  }

  /** @param {FutureSemester[]} semesters */
  function setFutureSemesters(semesters) {
    _state.futureSemesters = semesters;
    _autosave();
  }

  /** @returns {FutureSemester[]} */
  function getFutureSemesters() { return _state.futureSemesters; }

  /** @param {Scenario[]} scenarios */
  function setScenarios(scenarios) {
    _state.scenarios = scenarios;
    _autosave();
  }

  /** @returns {Scenario[]} */
  function getScenarios() { return _state.scenarios; }

  /** Full state for exporting */
  function getState() { return _state; }

  /** Replace full state (import) */
  function setState(newState) {
    _state = _migrate(newState);
    _write();
    AU_BUS.emit(AU_C.EVENTS.UI_REFRESH, _state);
  }

  /** Wipe all data */
  function reset() {
    _state = {
      version: AU_C.STORAGE_VERSION,
      lastParsed: null,
      record: null,
      settings: Object.assign({}, AU_C.DEFAULT_SETTINGS),
      simulatedOverrides: {},
      futureSemesters: [],
      scenarios: [],
    };
    chrome.storage.local.remove([AU_C.STORAGE_KEY]);
    AU_BUS.emit(AU_C.EVENTS.UI_REFRESH, _state);
  }

  window.AU_STORAGE = Object.freeze({
    load, setRecord, getRecord,
    updateSettings, getSettings,
    getOverrides, setOverride,
    setFutureSemesters, getFutureSemesters,
    setScenarios, getScenarios,
    getState, setState, reset,
  });
})();
