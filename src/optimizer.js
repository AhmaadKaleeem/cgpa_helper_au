/**
 * AU GPA Optimizer — optimizer.js
 * Target CGPA planning, smart retake advisor, and future semester projections.
 * Exposed as window.AU_OPTIMIZER
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  /**
   * Calculate the required average GPA over future credits to hit a target CGPA.
   * @param {number} currentCGPA
   * @param {number} currentCounted
   * @param {number} targetCGPA
   * @param {number} futureCredits
   * @returns {{ requiredGPA: number, feasible: boolean, message: string }}
   */
  function calcRequired(currentCGPA, currentCounted, targetCGPA, futureCredits) {
    if (futureCredits <= 0) {
      return { requiredGPA: null, feasible: false, message: 'Future credits must be greater than 0.' };
    }
    if (targetCGPA > 4.0 || targetCGPA < 0) {
      return { requiredGPA: null, feasible: false, message: 'Target CGPA must be between 0.0 and 4.0.' };
    }

    const currentQP = currentCGPA * currentCounted;
    const neededQP = targetCGPA * (currentCounted + futureCredits);
    const futureQP = neededQP - currentQP;
    const requiredGPA = futureQP / futureCredits;
    const rounded = AU_H.roundGPA(requiredGPA);

    if (rounded > 4.0) {
      return {
        requiredGPA: rounded,
        feasible: false,
        message: 'Impossible with new courses alone. You would need a ' + rounded.toFixed(2) + ' average, which exceeds the maximum 4.0.',
      };
    }
    if (rounded < 0) {
      return {
        requiredGPA: 0,
        feasible: true,
        message: 'Target already guaranteed even with 0.0 GPA in future courses.',
      };
    }
    return {
      requiredGPA: rounded,
      feasible: true,
      message: 'You need an average of ' + rounded.toFixed(2) + ' GPA across ' + futureCredits + ' future credits.',
    };
  }

  /**
   * Project CGPA including a list of future semesters.
   * @param {number} currentCGPA
   * @param {number} currentCounted
   * @param {FutureSemester[]} futureSemesters
   * @param {number} [decimals=2]
   * @returns {{ projectedCGPA: number, addedCredits: number, addedQP: number }}
   */
  function projectWithFutureSems(currentCGPA, currentCounted, futureSemesters, decimals) {
    const dec = decimals || 2;
    let addedCredits = 0;
    let addedQP = 0;

    (futureSemesters || []).forEach(fs => {
      (fs.courses || []).forEach(c => {
        const mult = AU_ENGINE.getMultiplier(AU_H.normalizeGrade(c.expectedGrade));
        if (mult !== null) {
          addedCredits += (c.credits || 0);
          addedQP += mult * (c.credits || 0);
        }
      });
    });

    const totalCounted = currentCounted + addedCredits;
    const totalQP = currentCGPA * currentCounted + addedQP;
    const projectedCGPA = totalCounted > 0 ? AU_H.roundGPA(totalQP / totalCounted, dec) : currentCGPA;

    return { projectedCGPA, addedCredits, addedQP: AU_H.roundGPA(addedQP, dec) };
  }

  /**
   * Project CGPA after applying simulated retake overrides on top of future semesters.
   * @param {StudentRecord} record
   * @param {Object} overrides  courseId -> grade
   * @param {FutureSemester[]} futureSems
   * @param {number} [dec=2]
   * @returns {number}
   */
  function projectFull(record, overrides, futureSems, dec) {
    const simRecord = AU_ENGINE.calculate(record, overrides, dec || 2);
    const { projectedCGPA } = projectWithFutureSems(
      simRecord.cgpa,
      simRecord.totalCountedCredits,
      futureSems,
      dec || 2
    );
    return AU_H.roundGPA(projectedCGPA, dec || 2);
  }

  /**
   * Graduation predictor.
   * @param {StudentRecord} record
   * @param {number} [totalRequired=136]
   * @returns {{ remainingCredits: number, estimatedGradCGPA: number, percentComplete: number }}
   */
  function predictGraduation(record, totalRequired) {
    const req = totalRequired || 136;
    const earned = record.totalEarnedCredits || 0;
    const remaining = Math.max(req - earned, 0);
    const percentComplete = AU_H.roundGPA(Math.min((earned / req) * 100, 100));
    return { remainingCredits: remaining, estimatedGradCGPA: record.cgpa, percentComplete };
  }

  /**
   * Compute the CGPA impact of retaking one course with a better grade.
   * @param {StudentRecord} record
   * @param {Course} course
   * @param {string} newGrade - normalized grade string
   * @returns {number} delta CGPA (positive = improvement)
   */
  function retakeImpact(record, course, newGrade) {
    const currentMult = AU_ENGINE.getMultiplier(AU_H.normalizeGrade(course.grade));
    const newMult = AU_ENGINE.getMultiplier(AU_H.normalizeGrade(newGrade));
    if (currentMult === null || newMult === null) return 0;
    if (newMult <= currentMult) return 0;
    const deltaQP = (newMult - currentMult) * course.credits;
    return record.totalCountedCredits > 0
      ? AU_H.roundGPA(deltaQP / record.totalCountedCredits, 4)
      : 0;
  }

  /**
   * Find the minimum grade needed to reach targetCGPA by retaking one course.
   * @param {StudentRecord} record
   * @param {Course} course
   * @param {number} targetCGPA
   * @returns {string|null} grade letter or null if impossible with one course
   */
  function minGradeForTarget(record, course, targetCGPA) {
    const gradeOrder = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'];
    const currentMult = AU_ENGINE.getMultiplier(AU_H.normalizeGrade(course.grade));
    if (currentMult === null) return null;

    for (const g of gradeOrder) {
      const mult = AU_ENGINE.getMultiplier(g);
      if (mult === null || mult <= currentMult) continue;
      const deltaQP = (mult - currentMult) * course.credits;
      const newCGPA = record.totalCountedCredits > 0
        ? (record.totalQualityPoints + deltaQP) / record.totalCountedCredits
        : 0;
      if (AU_H.roundGPA(newCGPA, 4) >= targetCGPA) return g;
    }
    return null;
  }

  /**
   * Build a prioritized list of retake recommendations.
   * Sorted by highest CGPA impact from a single retake to grade A.
   * @param {StudentRecord} record
   * @param {number} [targetCGPA]
   * @returns {Array}
   */
  function buildRetakeAdvisor(record, targetCGPA) {
    const results = [];
    const target = targetCGPA || record.cgpa + 0.5;

    record.semesters.forEach(sem => {
      sem.courses.forEach(course => {
        if (AU_ENGINE.isCourseExcluded(course)) return;
        const grade = AU_H.normalizeGrade(course.grade);
        const mult = AU_ENGINE.getMultiplier(grade);
        if (mult === null) return;
        if (mult >= 4.0) return;  // already A, nothing to improve
        if (AU_C.EXCLUDED_GRADES.includes(grade)) return;

        const impactToA = retakeImpact(record, course, 'A');
        const cgpaIfA = AU_H.roundGPA(record.cgpa + impactToA, 4);
        const minGrade = minGradeForTarget(record, course, target);

        let priority = 'low';
        if (impactToA >= 0.08) priority = 'high';
        else if (impactToA >= 0.04) priority = 'medium';

        results.push({
          courseId: course.id,
          courseName: course.name,
          semName: sem.name,
          currentGrade: grade,
          credits: course.credits,
          impactToA: AU_H.roundGPA(impactToA, 4),
          cgpaIfA,
          minGradeForTarget: minGrade,
          priority,
        });
      });
    });

    return results.sort((a, b) => b.impactToA - a.impactToA);
  }

  /**
   * Build a semester-by-semester GPA roadmap to reach a target CGPA.
   *
   * @param {number} currentCGPA
   * @param {number} currentCounted - current counted credits
   * @param {number} targetCGPA
   * @param {number} numSemesters - remaining semesters
   * @param {number} creditsPerSem - average credits per semester
   * @param {'balanced'|'front-loaded'|'gradual'} [strategy='balanced']
   * @returns {{ steps: Array, feasible: boolean, overallRequired: number }}
   */
  function buildRoadmap(currentCGPA, currentCounted, targetCGPA, numSemesters, creditsPerSem, strategy) {
    const strat = strategy || 'balanced';
    if (numSemesters <= 0 || creditsPerSem <= 0) {
      return { steps: [], feasible: false, overallRequired: 0 };
    }

    const totalFutureCredits = numSemesters * creditsPerSem;
    const currentQP = currentCGPA * currentCounted;
    const neededQP = targetCGPA * (currentCounted + totalFutureCredits);
    const totalRequiredQP = neededQP - currentQP;
    const overallRequired = totalFutureCredits > 0 ? totalRequiredQP / totalFutureCredits : 0;

    if (overallRequired > 4.0) {
      // Still generate steps to show why it's infeasible
      const steps = [];
      for (let i = 0; i < numSemesters; i++) {
        steps.push({
          semester: i + 1,
          credits: creditsPerSem,
          requiredGPA: AU_H.roundGPA(overallRequired, 2),
          difficulty: 'impossible',
        });
      }
      return { steps, feasible: false, overallRequired: AU_H.roundGPA(overallRequired, 2) };
    }

    // Generate per-semester requirements based on strategy
    const steps = [];
    let runningCounted = currentCounted;
    let runningQP = currentQP;

    for (let i = 0; i < numSemesters; i++) {
      const remaining = numSemesters - i;
      const remainingCredits = remaining * creditsPerSem;
      const neededFromHere = targetCGPA * (runningCounted + remainingCredits) - runningQP;
      const evenGPA = remainingCredits > 0 ? neededFromHere / remainingCredits : 0;

      let semGPA;
      if (strat === 'front-loaded') {
        // Push harder early: add 0.15 per position from end, capped at 4.0
        const boost = (remaining - 1) * 0.15 / Math.max(numSemesters - 1, 1);
        semGPA = Math.min(4.0, evenGPA + boost * (numSemesters > 1 ? 1 : 0));
      } else if (strat === 'gradual') {
        // Start easier, ramp up
        const reduce = (remaining - 1) * 0.12 / Math.max(numSemesters - 1, 1);
        semGPA = Math.max(0, evenGPA - reduce * (numSemesters > 1 ? 1 : 0));
      } else {
        // Balanced: even distribution
        semGPA = evenGPA;
      }

      semGPA = AU_H.roundGPA(AU_H.clamp(semGPA, 0, 4.0), 2);

      let difficulty = 'achievable';
      if (semGPA > 4.0) difficulty = 'impossible';
      else if (semGPA >= 3.7) difficulty = 'hard';
      else if (semGPA >= 3.3) difficulty = 'challenging';
      else if (semGPA <= 2.5) difficulty = 'easy';

      steps.push({
        semester: i + 1,
        credits: creditsPerSem,
        requiredGPA: semGPA,
        difficulty,
      });

      // Simulate this semester being completed at the required GPA
      runningQP += semGPA * creditsPerSem;
      runningCounted += creditsPerSem;
    }

    return {
      steps,
      feasible: overallRequired >= 0 && overallRequired <= 4.0,
      overallRequired: AU_H.roundGPA(Math.max(0, overallRequired), 2),
    };
  }

  window.AU_OPTIMIZER = Object.freeze({
    calcRequired,
    projectWithFutureSems,
    projectFull,
    predictGraduation,
    retakeImpact,
    minGradeForTarget,
    buildRetakeAdvisor,
    buildRoadmap,
  });
})();
