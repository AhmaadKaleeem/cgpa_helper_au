/**
 * AU engine.js
 * Core logic for GPA calculations.
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  /**
   * Get GPA multiplier for a normalized grade string.
   * @param {string} normalizedGrade
   * @returns {number|null}
   */
  function getMultiplier(normalizedGrade) {
    if (!normalizedGrade) return null;
    const val = AU_C.GRADE_MAP[normalizedGrade];
    return val !== undefined ? val : null;
  }

  /**
   * Returns true if a course should be completely excluded from ALL
   * credit and GPA calculations (S/U-only institutional courses).
   * @param {Course} course
   * @returns {boolean}
   */
  function isCourseExcluded(course, manualExclusions = []) {
    if (course.id && manualExclusions.includes(course.id)) return true;
    const grade = normalizeGrade(course.grade);
    if (AU_C.EXCLUDED_GRADES.includes(grade)) return true;
    const name = (course.name || '').trim();
    return AU_C.EXCLUDED_COURSE_PATTERNS.some(pattern => pattern.test(name));
  }

  /**
   * Normalize a raw grade from the portal.
   * @param {string} raw
   * @returns {string}
   */
  function normalizeGrade(raw) {
    return AU_H.normalizeGrade(raw);
  }

  /**
   * Apply retake logic across all semesters.
   * AU Policy: best attempt for a repeated course counts; previous attempts are excluded from CGPA.
   * @param {Semester[]} semesters - in chronological order
   * @returns {Semester[]} semesters with countsTowardsCGPA flags set
   */
  function applyRetakeLogic(semesters) {
    // Map: normalizedCourseName -> { bestMultiplier, bestSemId }
    const history = {};

    // First pass: mark each course in context of history
    const tagged = semesters.map(sem => {
      const courses = sem.courses.map(course => {
        const grade = normalizeGrade(course.grade);
        const multiplier = getMultiplier(grade);
        const isExcluded = AU_C.EXCLUDED_GRADES.includes(grade);

        let countsTowardsCGPA = !isExcluded && multiplier !== null;
        let isRetake = false;
        let isRetakeReplaced = false;

        if (!isExcluded && multiplier !== null) {
          const key = course.name.trim().toLowerCase();
          if (history[key] !== undefined) {
            isRetake = true;
            if (multiplier > history[key].bestMultiplier) {
              // Improved - supersede old entry
              history[key] = { bestMultiplier: multiplier, bestSemId: sem.id };
            } else {
              // Not improved - this attempt doesn't count
              countsTowardsCGPA = false;
            }
          } else {
            history[key] = { bestMultiplier: multiplier, bestSemId: sem.id };
          }
        }

        return Object.assign({}, course, {
          normalizedGrade: grade,
          countsTowardsCGPA,
          isRetake,
          isRetakeReplaced,
        });
      });
      return Object.assign({}, sem, { courses });
    });

    // Second pass: mark older attempts that were superseded
    return tagged.map(sem => {
      const courses = sem.courses.map(course => {
        const key = course.name.trim().toLowerCase();
        const h = history[key];
        if (h && h.bestSemId !== sem.id && course.countsTowardsCGPA) {
          return Object.assign({}, course, { countsTowardsCGPA: false, isRetakeReplaced: true });
        }
        return course;
      });
      return Object.assign({}, sem, { courses });
    });
  }

  /**
   * Apply simulated grade overrides to a record copy.
   * @param {StudentRecord} record
   * @param {Object} overrides - courseId -> grade string
   * @returns {StudentRecord} new record with simulated grades
   */
  function applyOverrides(record, overrides) {
    if (!overrides || Object.keys(overrides).length === 0) return record;
    const semesters = record.semesters.map(sem => {
      const courses = sem.courses.map(course => {
        if (overrides[course.id]) {
          return Object.assign({}, course, {
            grade: overrides[course.id],
            isSimulated: true,
            simulatedGrade: overrides[course.id],
          });
        }
        return course;
      });
      return Object.assign({}, sem, { courses });
    });
    return Object.assign({}, record, { semesters });
  }

  /**
   * Calculate SGPA for a single semester.
   * Uses all courses in that semester (even retakes) for the semester's own SGPA.
   * @param {Semester} semester
   * @param {number} [decimals=2]
   * @returns {{ sgpa: number, countedCredits: number, qualityPoints: number }}
   */
  function calcSGPA(semester, excl, decimals) {
    let countedCredits = 0;
    let qualityPoints = 0;
    semester.courses.forEach(course => {
      if (isCourseExcluded(course, excl)) return;
      const grade = normalizeGrade(course.grade);
      const mult = getMultiplier(grade);
      if (mult !== null && !AU_C.EXCLUDED_GRADES.includes(grade)) {
        countedCredits += course.credits;
        qualityPoints += mult * course.credits;
      }
    });
    const sgpa = countedCredits > 0 ? qualityPoints / countedCredits : 0;
    return {
      sgpa: AU_H.roundGPA(sgpa, decimals),
      countedCredits,
      qualityPoints: AU_H.roundGPA(qualityPoints, decimals),
    };
  }

  /**
   * Full calculation on a StudentRecord.
   * Returns a new record with all computed fields (SGPA per sem, CGPA, totals).
   * @param {StudentRecord} record
   * @param {Object} [overrides] - courseId -> grade (simulation)
   * @param {number} [decimals=2]
   * @returns {StudentRecord}
   */
  function calculate(record, overrides, manualExclusions, decimals) {
    const excl = Array.isArray(manualExclusions) ? manualExclusions : [];
    if (!record) return record;
    const dec = typeof decimals === 'number' ? decimals : 2;

    // Apply simulated overrides
    const working = applyOverrides(record, overrides || {});

    // Apply retake logic
    const semesters = applyRetakeLogic(working.semesters);

    let totalCountedCredits = 0;
    let totalQualityPoints = 0;
    let totalEarnedCredits = 0;
    let hasNonCreditCourses = false;

    const updatedSemesters = semesters.map(sem => {
      const { sgpa, countedCredits, qualityPoints } = calcSGPA(sem, excl, dec);

      // Earned credits: passed courses. Foundation/S courses count toward degree progress!
      const earnedCredits = sem.courses.reduce((acc, c) => {
        if (c.id && excl.includes(c.id)) return acc; // manual exclusion
        if (c.isRetakeReplaced) return acc; // superseded attempt does not grant duplicate credits
        const g = normalizeGrade(c.grade);
        if (g && !AU_C.FAILURE_GRADES.includes(g) && g !== 'W') {
          return acc + c.credits;
        }
        return acc;
      }, 0);

      const sgpaExcludedCredits = sem.courses.reduce((acc, c) => {
        if (isCourseExcluded(c, excl)) return acc + c.credits;
        return acc;
      }, 0);

      const cgpaExcludedCredits = sem.courses.reduce((acc, c) => {
        if (c.isRetakeReplaced) return acc + c.credits;
        return acc;
      }, 0);

      // CGPA accumulation: only courses that count toward CGPA and are not excluded
      sem.courses.forEach(course => {
        if (course.countsTowardsCGPA && !isCourseExcluded(course, excl)) {
          const mult = getMultiplier(normalizeGrade(course.grade));
          if (mult !== null) {
            totalCountedCredits += course.credits;
            totalQualityPoints += mult * course.credits;
          }
        }
      });

      return Object.assign({}, sem, { sgpa, countedCredits, qualityPoints, earnedCredits, sgpaExcludedCredits, cgpaExcludedCredits });
    });

    totalEarnedCredits = updatedSemesters.reduce((a, s) => a + s.earnedCredits, 0);
    const cgpa = totalCountedCredits > 0
      ? AU_H.roundGPA(totalQualityPoints / totalCountedCredits, dec)
      : 0;

    return Object.assign({}, record, {
      semesters: updatedSemesters,
      cgpa,
      totalCountedCredits,
      totalEarnedCredits,
      totalQualityPoints: AU_H.roundGPA(totalQualityPoints, dec),
      hasNonCreditCourses,
    });
  }

  /**
   * Grade distribution: count of each normalized grade across all semesters.
   * @param {StudentRecord} record
   * @returns {Object.<string,number>}
   */
  function gradeDistribution(record) {
    const dist = {};
    (record.semesters || []).forEach(sem => {
      sem.courses.forEach(c => {
        const g = normalizeGrade(c.grade);
        if (g) dist[g] = (dist[g] || 0) + 1;
      });
    });
    return dist;
  }

  /**
   * Get the best and worst semester by SGPA.
   * @param {StudentRecord} record
   * @returns {{ best: Semester|null, worst: Semester|null }}
   */
  function extremeSemesters(record) {
    const sems = (record.semesters || []).filter(s => s.countedCredits > 0);
    if (sems.length === 0) return { best: null, worst: null };
    const sorted = [...sems].sort((a, b) => b.sgpa - a.sgpa);
    return { best: sorted[0], worst: sorted[sorted.length - 1] };
  }

  /**
   * Determine GPA trend across semesters.
   * @param {StudentRecord} record
   * @returns {'Improving'|'Declining'|'Stable'}
   */
  function gpaTrend(record) {
    const sems = (record.semesters || []).filter(s => s.countedCredits > 0);
    if (sems.length < 2) return 'Stable';
    const last = sems[sems.length - 1].sgpa;
    const prev = sems[sems.length - 2].sgpa;
    if (last > prev + 0.05) return 'Improving';
    if (last < prev - 0.05) return 'Declining';
    return 'Stable';
  }

  window.AU_ENGINE = Object.freeze({
    calculate,
    applyOverrides,
    applyRetakeLogic,
    calcSGPA,
    gradeDistribution,
    extremeSemesters,
    gpaTrend,
    normalizeGrade,
    getMultiplier,
    isCourseExcluded,
  });
})();
