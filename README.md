# AU GPA Optimizer

The AU GPA Optimizer is a Chrome Extension designed for Air University students. It integrates into the AU Student Portal to calculate your CGPA, handle retake policies, and help plan future semesters.

## Features
- **Calculate CGPA**: View your CGPA, SGPA, and earned credits.
- **Retake Logic**: Applies Air University's retake policies, factoring in only the best grade for repeated courses. It also excludes non-credit courses (e.g., S/U grades, Pre-Calculus).
- **Target Planning**: Input a target CGPA to see the average SGPA required for remaining semesters.
- **Impact Analysis**: Identifies which past courses yield the highest GPA increase if retaken.
- **Local Operation**: The extension runs entirely in your browser. No external servers or data tracking.

## Installation
You can install this extension via a ZIP file or by cloning from GitHub.

1. Extract the downloaded ZIP file or clone this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** in the top right corner.
4. Click **Load unpacked** and select the directory containing `manifest.json`.
5. Log into the AU Student Portal and navigate to your Grade Report.

For detailed instructions on using the extension, please see the [User Manual](USER_MANUAL.md).

## Technical Overview
The extension is built using ES2022 Vanilla JavaScript and adheres to Manifest V3 Content Security Policies.

### Architecture
- **Isolated UI (`src/overlay.js` & `src/ui.js`)**: Rendered inside a Shadow DOM to prevent CSS conflicts with the portal.
- **DOM Parser (`src/parser.js`)**: Extracts data from the HTML structure.
- **Engine (`src/engine.js`)**: Calculates GPAs and applies university retake rules.
- **Optimizer (`src/optimizer.js`)**: Generates pacing strategies for target CGPAs and dynamic retake simulations.
- **Messaging (`src/eventBus.js`)**: Uses a Publish-Subscribe event bus for module communication.
- **Storage (`src/storage.js`)**: Uses `chrome.storage.local` for data persistence.

## Open Source License
This codebase is open source. You may freely reuse, revise, modify, and distribute this code. 

---
**Designed by Ahmad Kaleem Bhatti** (BSCSev-F-24-A)  
[LinkedIn](https://www.linkedin.com/in/ahmadkaleembhatti/)
