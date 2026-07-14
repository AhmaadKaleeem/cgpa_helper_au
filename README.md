# GradePilot

GradePilot is an open-source Chrome extension built for Air University students. It analyzes your student portal grade report, applies official university retake rules, and calculates your true academic standing with complete privacy.

Unlike manual GPA calculators, GradePilot automatically handles repeated courses, excludes non-credit subjects, and provides planning tools to help you make informed academic decisions.


---

# Features

### Accurate GPA Calculation

* Calculate Semester GPA (SGPA)
* Calculate Cumulative GPA (CGPA)
* Automatically exclude non-credit courses
* Apply Air University retake rules automatically

### Degree Planning

Plan your remaining semesters by setting a target CGPA and seeing the grades required to achieve it.

### Retake Analysis

Simulate course retakes and identify which subjects will have the greatest impact on improving your CGPA.

### Excel Reports & Backup

Generate beautiful, multi-sheet Excel (`.xlsx`) reports containing your full transcript, simulated grades, and future plans with a single click. Keep your data safe with JSON import/export functionality.

### Privacy First

Your academic data never leaves your computer. GradePilot performs all calculations locally inside your browser.

---

# Installation

Here are all 4 ways you can download and install the extension:

## Option A: WinGet (Recommended)

Open Command Prompt or PowerShell and type:
```bash
winget install AhmadKaleemBhatti.GradePilot
```

---

## Option B: Windows Installer (.exe)

Users can download `GradePilotSetup.exe` from our GitHub Releases page, which automatically installs the extension files and opens Chrome for them.
* **Direct Download**: [GradePilotSetup.exe (v1.0.0)](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases/download/v1.0.0/GradePilotSetup.exe)
* **Releases Page**: [GitHub Releases](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases)
* **Manual Setup Guide**: [View User Manual](extension/USER_MANUAL.md)

---

## Option C: ZIP File (Advanced)

Users can download the `GradePilot-v1.0.0.zip` from our GitHub Releases, extract it anywhere on their computer, and load the folder in Chrome via Developer Mode.
* **Direct Download**: [GradePilot-v1.0.0.zip](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases/download/v1.0.0/GradePilot-v1.0.0.zip)
* **Releases Page**: [GitHub Releases](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases)
* **Manual Setup Guide**: [View User Manual](extension/USER_MANUAL.md)

---

## Option D: Build from Source (For Developers)

Developers can run:
```bash
git clone https://github.com/AhmaadKaleeem/cgpa_helper_au.git
```
and load the `extension` folder manually into Chrome's Developer Mode.
* **Releases Page**: [GitHub Releases](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases)
* **Manual Setup Guide**: [View User Manual](extension/USER_MANUAL.md)

---

# How GradePilot Works

### Secure UI

The interface is rendered inside a Shadow DOM, preventing conflicts with the university portal while maintaining a consistent user experience.

### Smart Data Extraction

GradePilot reads your grade report directly from the portal and extracts the required academic information automatically.

### GPA Engine

The calculation engine follows Air University academic policies, including repeated course handling and exclusion of non-credit courses.

### Local Storage

All preferences are stored locally in your browser. No academic records are uploaded or transmitted.

---

# Documentation

Additional documentation is available in this repository.

* [User Manual](extension/USER_MANUAL.md)
* [Privacy Policy](extension/PRIVACY_POLICY.md)
* [Terms of Service](extension/TERMS_OF_SERVICE.md)

---

# Support

If you encounter a bug, installation issue, or calculation problem, please create a [GitHub Issue](https://github.com/AhmaadKaleeem/cgpa_helper_au/issues).

For direct support, contact:

**[ahmadkaleeem1@gmail.com](mailto:ahmadkaleeem1@gmail.com)**

When reporting an issue, please include:

* GradePilot version
* Chrome version
* Windows version (if applicable)
* Screenshots (if available)
* Steps to reproduce the problem

---

# Contributing

Contributions, bug reports, and feature requests are welcome.

Please open an Issue before submitting large changes.

---

# License

This project is released under the MIT License.

---

Designed and developed by Ahmad Kaleem Bhatti.
