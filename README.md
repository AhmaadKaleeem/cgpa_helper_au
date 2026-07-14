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

GradePilot can be installed using one of the following methods.

## Option 1: WinGet (Recommended)

Install GradePilot directly from the Windows Package Manager:

```bash
winget install AhmadKaleemBhatti.GradePilot
```

Note: The package may take some time to appear after a new release or initial publication due to WinGet repository synchronization.

---

## Option 2: Windows Installer

You can download the installer manually:
* **Direct Download**: [GradePilotSetup.exe (v1.0.0)](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases/download/v1.0.0/GradePilotSetup.exe)
* **Release Page**: [View all v1.0.0 downloads](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases/tag/v1.0.0)

Run the installer once downloaded. It will:

* Install GradePilot to your computer
* Create Desktop and Start Menu shortcuts (optional)
* Guide you through loading the extension in Chrome
* Configure everything required for first-time setup

---

## Option 3: Install from ZIP (Advanced)

1. Download the ZIP file using one of these options:
   * **Direct Download**: [GradePilot-v1.0.0.zip](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases/download/v1.0.0/GradePilot-v1.0.0.zip)
   * **Release Page**: [View all v1.0.0 downloads](https://github.com/AhmaadKaleeem/cgpa_helper_au/releases/tag/v1.0.0)
2. Extract the archive.
3. Open Chrome.
4. Navigate to `chrome://extensions`.
5. Enable **Developer Mode**.
6. Click **Load unpacked**.
7. Select the extracted GradePilot folder.

---

## Option 4: Build from Source

```bash
git clone https://github.com/AhmaadKaleeem/cgpa_helper_au.git
```

Open Chrome, enable Developer Mode, and load the `extension` folder as an unpacked extension.

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
