<div align="center">

# GradePilot

**An Academic Assistant for Air University Students**

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Chrome-lightgrey.svg)]()
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg)]()

*Developed by Ahmad Kaleem*

</div>

---

## Overview

Calculating grade point averages manually or predicting how a retake will impact academic standing can be error-prone. 

GradePilot is a Chrome Extension that integrates with the Air University student portal. It parses grade reports to calculate Semester and Cumulative GPAs and provides simulation tools for academic planning.

### Features

- **Academic Standing:** View your calculated SGPA and CGPA.
- **Retake Simulator:** Apply official university retake rules to calculate potential CGPA changes.
- **Target Planner:** Calculate the exact grades required in the current semester to reach a target CGPA.
- **Privacy:** GradePilot runs locally within your browser. Data is not sent to external servers.

---

## Technical Architecture

GradePilot consists of a web extension and a Windows desktop installer.

### The Chrome Extension
- **Core:** Vanilla JavaScript (ES6+), HTML5, and CSS3.
- **Architecture:** Modular, event-driven design (`eventBus.js`, `engine.js`, `optimizer.js`).
- **Standard:** Complies with Chrome Extension Manifest V3.

### The Windows Installer
A standalone desktop application to install the extension files.
- **Core:** C# and .NET 8.
- **Architecture:** Model-View-ViewModel (MVVM) pattern using Windows Presentation Foundation (WPF).
- **Dependency Injection:** Utilizes `Microsoft.Extensions.Hosting` and `Microsoft.Extensions.Logging`.
- **Extraction:** Extracts the extension payload using `ZipArchive` streams with UI progress updates.

### Release Pipeline
An automated build and packaging workflow.
- **`release.ps1`**: A PowerShell script that compiles the extension, updates manifest versions, builds the .NET application, and triggers Inno Setup.
- **Bootstrapper:** Inno Setup (`bootstrapper.iss`) is used to extract the WPF application to a temporary directory.
- **Winget:** YAML manifests (`GradePilot.yaml`, `installer.yaml`) are provided for the Windows Package Manager.

---

## Installation

### Option 1: Winget
Open PowerShell and run:
```powershell
winget install AirUniversity.GradePilot
```

### Option 2: Standalone Installer
1. Navigate to the **Releases** tab on GitHub.
2. Download `GradePilotSetup.exe`.
3. Run the installer and follow the setup wizard.
4. When prompted, Google Chrome will open. Enable **Developer Mode** and select the extracted extension folder.

---

## Developer Setup

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/AhmaadKaleeem/cgpa_helper_au.git
   ```
2. **Run the Release Pipeline:**
   ```powershell
   cd installer
   .\release.ps1
   ```
   *The pipeline will zip the extension, compile the C# WPF installer, and output the artifacts into the `installer/Release/` directory.*

---

<div align="center">
  <i>GradePilot is an independent, open-source educational tool and is not affiliated with Air University.</i>
</div>
