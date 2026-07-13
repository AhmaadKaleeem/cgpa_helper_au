/**
 * AU GPA Optimizer v2 — constants.js
 * All application-wide constants. Exposed as window.AU_C
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  /** @type {Object.<string,number|null>} Grade letter -> GPA multiplier */
  const GRADE_MAP = {
    'A':   4.00,
    'A-':  3.67,
    'B+':  3.33,
    'B':   3.00,
    'B-':  2.67,
    'C+':  2.33,
    'C':   2.00,
    'C-':  1.67,
    'D+':  1.33,
    'D':   1.00,
    'F':   0.00,
    'XF':  0.00,
    'W':   null,
    'I':   null,
    'S':   null,   // Satisfactory — excluded from GPA
    'U':   null,   // Unsatisfactory — excluded from GPA
    'INC': null,
    'IP':  null,
  };

  /** Grades that are completely excluded from GPA numerator AND denominator */
  const EXCLUDED_GRADES = ['W', 'I', 'S', 'U', 'INC', 'IP'];

  /** Grades that count in denominator (as 0 GP) but are not passes */
  const FAILURE_GRADES = ['F', 'XF'];

  /** Grades allowed only in regular semesters (not summer retakes) */
  const SUMMER_ALLOWED_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'XF', 'S', 'U', 'W'];

  /**
   * Course name patterns that are always S/U-graded at AU and must NEVER
   * appear in any credit count or GPA calculation regardless of recorded grade.
   */
  const EXCLUDED_COURSE_PATTERNS = [
    /pre.?calculus/i,
    /foundational\s+math/i,
    /quranic\s+studies/i,
    /sirat.?ul.?nabi/i,
    /pakistan\s+studies/i,
    /islamic\s+studies/i,
  ];

  const STORAGE_VERSION = 2;
  const STORAGE_KEY = 'au_gpa_optimizer_v2';

  const EVENTS = {
    PARSER_COMPLETE:    'PARSER_COMPLETE',
    STORAGE_RESTORED:   'STORAGE_RESTORED',
    UI_REFRESH:         'UI_REFRESH',
    SETTINGS_CHANGED:   'SETTINGS_CHANGED',
    NOTIFICATION:       'NOTIFICATION',
    OPTIMIZER_FINISHED: 'OPTIMIZER_FINISHED',
  };

  /** CSS selectors for the AU Portal grade report page */
  const SELECTORS = {
    SEMESTER_COL:      '.col-lg-6',
    SEM_NUM_BADGE:     '.badge.bg-success',
    SEM_NAME_BADGE:    '.badge.personalheadercolor',
    COURSE_TABLE:      'table.table-bordered',
    COURSE_ROW:        'tbody tr',
    SGPA_BADGE:        'p strong.badge.bg-success, p .badge.bg-success',
    STUDENT_CARD:      '.student-card',
    STUDENT_INFO_P:    '.student-card p',
  };

  const DEFAULT_SETTINGS = {
    theme:             'dark',
    gpaDecimals:       2,
    summerCreditLimit: 9,
    summerCourseLimit: 3,
    notifications:     true,
    targetCGPA:        3.00,
    totalDegreeCredits: 136,
    panelWidth:        500,
    roadmapSemesters:  4,
    roadmapCreditsPerSem: 15,
  };

  window.AU_C = Object.freeze({
    GRADE_MAP,
    EXCLUDED_GRADES,
    FAILURE_GRADES,
    SUMMER_ALLOWED_GRADES,
    EXCLUDED_COURSE_PATTERNS,
    STORAGE_VERSION,
    STORAGE_KEY,
    EVENTS,
    SELECTORS,
    DEFAULT_SETTINGS,
  });
})();
