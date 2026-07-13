/**
 * AU GPA Optimizer — types.js
 * JSDoc type definitions only — no runtime output.
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */

/**
 * @typedef {Object} Course
 * @property {string}  id                - Unique identifier
 * @property {string}  name              - Course full name
 * @property {number}  credits           - Credit hours
 * @property {string}  grade             - Raw grade string from portal (e.g. "B+ *")
 * @property {string}  normalizedGrade   - Cleaned grade (e.g. "B+")
 * @property {number|null} gradePoints   - Quality points (grade_multiplier * credits)
 * @property {boolean} countsTowardsCGPA - Whether this course enters the GPA denominator
 * @property {boolean} isRetake          - Whether this is a retake of a previous course
 * @property {boolean} isRetakeReplaced  - Whether this was superseded by a later retake
 * @property {boolean} isSimulated       - Whether grade is user-overridden in simulation
 * @property {string|null} simulatedGrade - User's simulated grade (if isSimulated)
 */

/**
 * @typedef {Object} Semester
 * @property {string}   id              - Unique identifier
 * @property {string}   name            - Semester name (e.g. "FALL-2024")
 * @property {number}   number          - Sequential number shown in portal
 * @property {boolean}  isSummer        - Whether this is a summer semester
 * @property {Course[]} courses         - Courses taken in this semester
 * @property {number}   sgpa            - Calculated SGPA
 * @property {number}   countedCredits  - Credits counted in SGPA denominator
 * @property {number}   qualityPoints   - Total quality points this semester
 * @property {number}   earnedCredits   - Credits where student did not fail/withdraw
 */

/**
 * @typedef {Object} StudentRecord
 * @property {string}     name               - Student full name
 * @property {string}     session            - Current academic session
 * @property {number}     parsedCGPA         - CGPA as shown on portal
 * @property {number}     cgpa               - CGPA calculated by engine
 * @property {Semester[]} semesters          - All semesters in order
 * @property {number}     totalEarnedCredits
 * @property {number}     totalCountedCredits
 * @property {number}     totalQualityPoints
 */

/**
 * @typedef {Object} FutureSemester
 * @property {string}   id
 * @property {string}   name
 * @property {boolean}  isSummer
 * @property {Array<{id:string, name:string, credits:number, expectedGrade:string}>} courses
 */

/**
 * @typedef {Object} Scenario
 * @property {string} id
 * @property {string} name
 * @property {Object} simulatedOverrides   - courseId -> grade
 * @property {FutureSemester[]} futureSemesters
 * @property {number} projectedCGPA
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AppState
 * @property {number}           version
 * @property {string|null}      lastParsed
 * @property {StudentRecord|null} record
 * @property {Object}           settings
 * @property {Object}           simulatedOverrides  - courseId -> grade string
 * @property {FutureSemester[]} futureSemesters
 * @property {Scenario[]}       scenarios
 */
