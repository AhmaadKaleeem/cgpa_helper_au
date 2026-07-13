/**
 * AU GPA Optimizer — validation.js
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  const KNOWN_GRADES = new Set(Object.keys(AU_C.GRADE_MAP));

  /**
   * Validate a single course object.
   * @param {Course} course
   * @returns {string[]} errors
   */
  function validateCourse(course) {
    const errors = [];
    if (!course.name) errors.push('Missing course name');
    if (typeof course.credits !== 'number' || course.credits < 0 || course.credits > 12) {
      errors.push('Invalid credits (' + course.credits + ') for ' + (course.name || '?'));
    }
    const ng = AU_H.normalizeGrade(course.grade);
    if (ng && !KNOWN_GRADES.has(ng)) {
      errors.push('Unrecognized grade "' + ng + '" for ' + course.name);
    }
    return errors;
  }

  /**
   * Validate a semester object.
   * @param {Semester} semester
   * @returns {string[]} errors
   */
  function validateSemester(semester) {
    let errors = [];
    if (!semester.name) errors.push('Semester missing name');
    (semester.courses || []).forEach(c => {
      errors = errors.concat(validateCourse(c));
    });
    return errors;
  }

  /**
   * Validate an entire StudentRecord.
   * @param {StudentRecord} record
   * @returns {string[]} errors
   */
  function validateRecord(record) {
    if (!record) return ['No record provided'];
    let errors = [];
    if (!record.semesters || record.semesters.length === 0) {
      errors.push('No semesters found');
    }
    (record.semesters || []).forEach(s => {
      errors = errors.concat(validateSemester(s));
    });
    return errors;
  }

  window.AU_VALIDATION = Object.freeze({ validateCourse, validateSemester, validateRecord });
})();
