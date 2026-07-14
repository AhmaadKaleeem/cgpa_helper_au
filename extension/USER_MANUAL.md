# GradePilot User Manual

**Version 1.0 - Air University Student Portal Extension**

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

Here are all 4 ways you can download and install the extension:

### Option A: WinGet (Recommended)

Open Command Prompt or PowerShell and type:
```bash
winget install AhmadKaleemBhatti.GradePilot
```

### Option B: Windows Installer (.exe)

Users can download `GradePilotSetup.exe` from our GitHub Releases page, which automatically installs the extension files and opens Chrome for them.
* **Direct Download**: [GradePilotSetup.exe (v1.0.0)](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases/download/v1.0.0/GradePilotSetup.exe)
* **Releases Page**: [GitHub Releases](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases)

### Option C: ZIP File (Advanced)

Users can download the `GradePilot-v1.0.0.zip` from our GitHub Releases, extract it anywhere on their computer, and load the folder in Chrome via Developer Mode.
* **Direct Download**: [GradePilot-v1.0.0.zip](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases/download/v1.0.0/GradePilot-v1.0.0.zip)
* **Releases Page**: [GitHub Releases](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases)

### Option D: Build from Source (For Developers)

Developers can run:
```bash
git clone https://github.com/AhmaadKaleeem/cgpa_helper_au.git
```
and load the `extension` folder manually into Chrome's Developer Mode.
* **Releases Page**: [GitHub Releases](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases)

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

### Active Simulations Menu

Whenever you simulate a grade, that course is instantly added to the **Active Simulations** list at the top of the tab. This gives you a central location to view, modify, or remove all of your active overrides across all semesters without scrolling.

You can simulate multiple courses at the same time. Changes are temporary and do not affect your actual records. Click **Clear All Simulations** at the bottom of the page to reset.

---

## 6. Settings

Click the gear icon to open settings.

| Setting | Description |
|---|---|
| Program Level | Set to Undergraduate or Graduate. Changes graduation credit requirements and grading scale. |
| Total Degree Credits | Adjust if your specific degree requires a different total credit count. |
| Remaining Semesters | Update this to keep the semester roadmap accurate. |
| Export Backup (JSON) | Downloads your entire transcript and simulations as a backup file. |
| Download Excel Report | Generates a multi-sheet Excel (.xlsx) file containing your transcript, simulations, settings, and scenarios. |
| Clear Data | Removes all cached data and simulations from your browser. |

---

## 7. Uninstallation

Since GradePilot is an unpacked extension, you can easily remove it without a dedicated uninstaller program:
1. Open Chrome and go to `chrome://extensions`.
2. Find GradePilot and click **Remove**.
3. Delete the GradePilot installation folder from your computer (e.g., `%LOCALAPPDATA%\GradePilot` or your custom folder).
4. If you created shortcuts on your Desktop or Start Menu, you can delete them.

---

## 8. Troubleshooting

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
