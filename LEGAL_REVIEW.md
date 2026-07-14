# GradePilot Legal and Privacy Review

This document serves as the formal compliance and legal audit for the GradePilot Chrome Extension and its associated Windows Setup Wizard. 

## 1. Extension Summary
GradePilot is a local first browser extension designed for Air University students. It automatically extracts academic grades from the authenticated Air University Student Portal to calculate Semester GPA (SGPA) and Cumulative GPA (CGPA) according to official university retake rules. It provides a visual dashboard for students to project future grades.

## 2. Data Flow Diagram
The extension enforces strict client side processing. No academic data leaves the user's local machine.

`Air University Portal` -> `Browser DOM` -> `GradePilot Parser` -> `Local Math Engine` -> `GradePilot Dashboard`

**State Storage:** User settings and simulated grades are saved locally using `chrome.storage.local`. 

**Analytics Flow:**
`User Action (e.g. click)` -> `analytics.js` -> `Google Analytics 4 Measurement Protocol`
*Note: Only anonymous interaction events are tracked. No names, grades, or courses are ever transmitted.*

## 3. Browser Permissions Explanation
The extension requests minimal permissions to operate.

*   `storage`: Required to save the user's manual simulated grades, UI settings, and a persistent anonymous client ID for analytics locally on the machine.
*   `host_permissions` (`https://portals.au.edu.pk/*`): Required to inject the content scripts into the specific university domain to read the DOM and overlay the dashboard UI.

## 4. Compliance Checklist

### Chrome Web Store Policies
*   **Single Purpose:** Compliant. The extension is strictly focused on GPA calculation and academic planning.
*   **Minimal Permissions:** Compliant. Only `storage` and the specific host URL are requested.
*   **Use of Permissions:** Compliant. `host_permissions` are used explicitly to read the grade report.
*   **Remote Code Execution:** Compliant. The extension relies entirely on locally bundled JavaScript (Manifest V3).

### GDPR (General Data Protection Regulation) Observations
*   **Scope:** The extension does not collect or process Personally Identifiable Information (PII) on any external servers. 
*   **Analytics:** The use of Google Analytics requires disclosure. An anonymous UUID is generated locally, preventing tracking across multiple sites. Since no PII is transmitted, the risk profile is extremely low.
*   **Consent:** Because analytics are tied to an anonymous ID and strictly monitor extension performance, explicit cookie consent banners are generally not required, though disclosure in the Privacy Policy is mandatory.

### CCPA (California Consumer Privacy Act) Observations
*   **Scope:** GradePilot does not sell any user data. The tool does not collect personal data into any database.
*   **Compliance:** Highly compliant due to the strict local first architecture.

## 5. Risks and Recommendations
*   **Risk:** The extension scrapes data from a live university portal. If Air University updates their DOM structure, the parser will break.
    *   **Recommendation:** Ensure terms of service explicitly state the tool is provided "as is" and is not officially affiliated with Air University.
*   **Risk:** Users might rely on the tool's simulated calculations for official graduation clearance.
    *   **Recommendation:** Include a strong Academic Disclaimer in the Terms of Service stating that official university records always supersede the extension's calculations.

## 6. Assumptions and Developer Confirmations
*   **Assumption:** There are no hidden background scripts, server APIs, or remote databases planned for the immediate future.
*   **Assumption:** Google Analytics will only track broad interaction metrics (`extension_opened`, `simulate_retake_clicked`) and will never be configured to pull DOM data containing grades.

---
*Audit completed July 2026.*
