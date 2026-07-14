# GradePilot User Manual

**Version 1.0 — Air University Student Portal Extension**

Support: [ahmadkaleeem1@gmail.com](mailto:ahmadkaleeem1@gmail.com)  
Bugs: [GitHub Issues](https://github.com/AhmaadKaleeem/cgpa_helper_au/issues)

---

## Table of Contents

1. [Installation](#1-installation)
2. [Getting Started](#2-getting-started)
3. [Overview Tab](#3-overview-tab)
4. [Plan Tab](#4-plan-tab)
5. [Simulate Tab](#5-simulate-tab)
6. [Settings](#6-settings)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Installation

There are three ways to install GradePilot.

### Option A — Windows Installer (recommended for most users)

1. Download `GradePilotSetup.exe` from the [Releases](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases) page.
2. Run the installer and follow the on-screen steps.
3. The installer extracts the extension files to the folder you select and opens the Chrome extensions page.
4. In Chrome, turn on **Developer Mode** (top right of `chrome://extensions`).
5. Click **Load unpacked** and select the folder shown by the installer.

### Option B — ZIP File (manual install)

1. Download the extension ZIP from the [Releases](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases) page.
2. Extract the ZIP to any folder on your computer (for example, `C:\GradePilot`).
3. Open Chrome and go to `chrome://extensions`.
4. Turn on **Developer Mode**.
5. Click **Load unpacked** and select the folder you extracted to.

### Option C — Clone from GitHub (for developers)

```bash
git clone https://github.com/AhmaadKaleeem/cgpa_helper_au.git
```

Then follow Option B steps 3–5, selecting the `extension` folder inside the cloned repository.

---

## 2. Getting Started

After installing:

1. Go to the [Air University Student Portal](https://stdportal.au.edu.pk).
2. Log in and open your **Grade Report**.
3. GradePilot loads automatically when it detects the grade report page.
4. A floating button showing your CGPA appears on screen. You can drag it to any position.
5. Click the button or press `Ctrl+Shift+G` to open the main panel.

**Note:** GradePilot only activates on the Grade Report page. It will not run on other portal pages.

---

## 3. Overview Tab

Shows a summary of your academic record.

| Field | What it shows |
|---|---|
| CGPA | Cumulative GPA calculated with retake rules applied |
| Latest SGPA | Semester GPA from your most recent completed semester |
| Earned Credits | Total credit hours you have passed |
| Quality Points | Total grade-weighted credit points |
| Graduation Progress | Percentage of required credits completed |

**Retake rules applied:** If you have taken the same course more than once, only the highest grade is counted. The lower attempt is excluded from both the credit count and the GPA calculation.

**Exclusions:** If the tool finds non-credit courses (for example, Pre-Calculus) or Pass/Fail grades (S/U), it excludes them and shows a notice.

---

## 4. Plan Tab

Tells you what grades you need to reach a target CGPA.

1. Enter your target CGPA in the input field.
2. The tool calculates the required average SGPA across your remaining semesters.
3. A difficulty indicator shows whether the target is realistic given your current standing.
4. The **Roadmap** section breaks down the required SGPA per semester.

### Retake Opportunities

Lists past courses where a retake could improve your CGPA. Only courses below a B- grade are eligible under Air University policy.

- Select a target grade from the dropdown next to any course.
- The tool shows the estimated CGPA gain immediately.
- Click **Simulate** to apply the change and update all calculations.

### Advanced Planning

Expand this section to add future courses manually. Enter course names and credit hours to include them in the plan.

---

## 5. Simulate Tab

Lets you test retake scenarios without committing to anything.

1. Use the search bar to find a past course.
2. Check the box next to the course to mark it for simulation.
3. Select a new grade from the dropdown.
4. The CGPA updates live to show the effect.

You can simulate multiple courses at the same time. Changes are temporary and do not affect your actual records.

---

## 6. Settings

Click the gear icon to open settings.

| Setting | Description |
|---|---|
| Program Level | Set to Undergraduate or Graduate. Changes graduation credit requirements and grading scale. |
| Total Degree Credits | Adjust if your specific degree requires a different total credit count. |
| Remaining Semesters | Update this to keep the semester roadmap accurate. |
| Clear Data | Removes all cached data and simulations from your browser. |

---

## 7. Troubleshooting

**The CGPA button does not appear.**  
Make sure you are on the Grade Report page, not the portal homepage or another section. Reload the page and try again.

**The calculated CGPA does not match my portal.**  
The portal does not always apply retake rules correctly. GradePilot applies the official Air University policy. If you believe there is an error in the calculation, email [ahmadkaleeem1@gmail.com](mailto:ahmadkaleeem1@gmail.com) with a description.

**The extension is not loading after installation.**  
Go to `chrome://extensions` and confirm GradePilot is listed and the toggle is on. If it is not listed, repeat the Load unpacked step and make sure you selected the correct folder (the one containing `manifest.json`).

**Chrome asked me to pick a profile when the installer opened it.**  
Select your profile. Then go to `chrome://extensions` manually in the address bar and continue from step 4 of the installation.

**I need to reinstall or update the extension.**  
Remove the old extension from `chrome://extensions`, then repeat the installation steps with the new files.

---

## Support

For bugs and errors, open an issue on [GitHub](https://github.com/AhmaadKaleeem/cgpa_helper_au/issues).

For other questions, email [ahmadkaleeem1@gmail.com](mailto:ahmadkaleeem1@gmail.com).

---

Developed by Ahmad Kaleem Bhatti. Not affiliated with Air University.
