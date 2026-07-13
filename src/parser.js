/**
 * AU GPA Optimizer — parser.js
 * Reads the Air University portal DOM and builds a StudentRecord.
 * Never performs calculations. Exposed as window.AU_PARSER
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  /**
   * Parse the entire grade report page.
   * @returns {StudentRecord|null}
   */
  function parseDOM() {
    try {
      const name = _parseName();
      const session = _parseSession();
      const parsedCGPA = _parseCGPA();
      const semesters = _parseSemesters();

      if (semesters.length === 0) return null;

      return {
        name,
        session,
        parsedCGPA,
        cgpa: 0,
        semesters,
        totalEarnedCredits: 0,
        totalCountedCredits: 0,
        totalQualityPoints: 0,
      };
    } catch (err) {
      console.error('[AU_PARSER] Parse failed:', err);
      return null;
    }
  }

  function _parseName() {
    const ps = document.querySelectorAll(AU_C.SELECTORS.STUDENT_INFO_P);
    for (const p of ps) {
      if (p.textContent.includes('Name:')) {
        return AU_H.cleanString(p.textContent.replace('Name:', ''));
      }
    }
    // Fallback: try strong tags in student card
    const strong = document.querySelector('.student-card strong');
    return strong ? AU_H.cleanString(strong.nextSibling ? strong.nextSibling.textContent : '') : 'Unknown';
  }

  function _parseSession() {
    const ps = document.querySelectorAll(AU_C.SELECTORS.STUDENT_INFO_P);
    for (const p of ps) {
      if (p.textContent.includes('Session:')) {
        return AU_H.cleanString(p.textContent.replace('Session:', ''));
      }
    }
    return '';
  }

  function _parseCGPA() {
    const ps = document.querySelectorAll(AU_C.SELECTORS.STUDENT_INFO_P);
    for (const p of ps) {
      if (p.textContent.includes('CGPA:')) {
        const m = p.textContent.match(/[\d.]+/);
        if (m) return parseFloat(m[0]);
      }
    }
    return 0;
  }

  function _parseSemesters() {
    const cols = document.querySelectorAll(AU_C.SELECTORS.SEMESTER_COL);
    const semesters = [];

    cols.forEach(col => {
      const numBadge = col.querySelector(AU_C.SELECTORS.SEM_NUM_BADGE);
      const nameBadge = col.querySelector(AU_C.SELECTORS.SEM_NAME_BADGE);
      const table = col.querySelector(AU_C.SELECTORS.COURSE_TABLE);

      if (!numBadge || !nameBadge || !table) return;

      const name = AU_H.cleanString(nameBadge.textContent);
      const numText = numBadge.textContent.match(/\d+/);
      const number = numText ? parseInt(numText[0], 10) : semesters.length + 1;
      const isSummer = /summer/i.test(name);

      const courses = _parseCourses(table);

      // Parse displayed SGPA
      const sgpaEl = col.querySelector('p strong, p .badge');
      let sgpa = 0;
      if (sgpaEl) {
        const m = sgpaEl.textContent.match(/[\d.]+/);
        if (m) sgpa = parseFloat(m[0]);
      }

      semesters.push({
        id: 'sem-' + AU_H.generateId(),
        name,
        number,
        isSummer,
        courses,
        sgpa,
        countedCredits: 0,
        qualityPoints: 0,
        earnedCredits: 0,
      });
    });

    return semesters;
  }

  function _parseCourses(table) {
    const rows = table.querySelectorAll(AU_C.SELECTORS.COURSE_ROW);
    const courses = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 3) return;

      const name = AU_H.cleanString(cells[0].textContent);
      const credits = parseFloat(cells[1].textContent) || 0;
      const grade = AU_H.cleanString(cells[2].textContent);
      const gp = cells[3] ? parseFloat(cells[3].textContent) || 0 : 0;

      if (!name) return;

      courses.push({
        id: 'crs-' + AU_H.generateId(),
        name,
        credits,
        grade,
        normalizedGrade: AU_H.normalizeGrade(grade),
        gradePoints: gp,
        countsTowardsCGPA: true,
        isRetake: false,
        isRetakeReplaced: false,
        isSimulated: false,
        simulatedGrade: null,
      });
    });

    return courses;
  }

  /**
   * Check if the grade report table is present on the page.
   * @returns {boolean}
   */
  function isGradePageLoaded() {
    return !!document.querySelector(AU_C.SELECTORS.COURSE_TABLE);
  }

  window.AU_PARSER = Object.freeze({ parseDOM, isGradePageLoaded });
})();
