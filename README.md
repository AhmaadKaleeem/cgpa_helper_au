# GradePilot

GradePilot is an academic assistant designed for Air University students. It integrates with the student portal to calculate grade point averages and simulate academic progress.

Developed by Ahmad Kaleem.

## Overview

Calculating grade point averages manually or predicting how a retake will impact academic standing can be tedious. GradePilot is a Chrome extension that processes your grade reports directly in the browser to calculate Semester and Cumulative GPAs, and provides tools for academic planning.

### Core Functions

* Academic Standing: View your calculated Semester GPA and Cumulative GPA.
* Retake Simulator: Apply official university retake rules to see potential CGPA changes.
* Target Planner: Calculate the exact grades required in the current semester to reach a target CGPA.
* Privacy: GradePilot runs entirely on your local machine. Your data is never sent to external servers.

## Installation Methods

To use GradePilot, you must be using Google Chrome. The extension files are installed to your local application data directory.

Choose one of the four methods below to install GradePilot:

### 1. Winget

Open PowerShell as an Administrator and run:

```powershell
winget install GradePilot
```

### 2. Windows Installer

1. Download GradePilotSetup.exe from the repository.
2. Run the installer (Administrator privileges recommended).
3. Follow the setup wizard instructions.

### 3. ZIP Archive

1. Download the extension ZIP file from the repository.
2. Extract the contents to a folder on your computer.
3. Open Google Chrome and navigate to chrome://extensions.
4. Enable Developer Mode.
5. Click "Load unpacked" and select the extracted folder.

### 4. PowerShell Script

1. Download the installation script.
2. Open PowerShell and run:

```powershell
.\install.ps1
```

## System Requirements

* Operating System: Windows 10 (Version 1809) or newer.
* Browser: Google Chrome.

## Technical Architecture

GradePilot is composed of a web extension and a Windows desktop installer.

The Chrome extension uses standard JavaScript, HTML, and CSS, and complies with Chrome Extension Manifest V3. Its architecture uses a modular, event-driven design.

The Windows installer is a standalone desktop application built with C# and .NET 8, using the Windows Presentation Foundation (WPF) framework. It extracts the extension payload using ZipArchive streams and guides the user through the setup process.

## Developer Setup

To build the installer and package the extension from source:

1. Clone the repository.
2. Open PowerShell and navigate to the installer directory.
3. Run the release pipeline:

```powershell
.\release.ps1
```

The pipeline will compress the extension, compile the C# WPF installer, and output the finalized artifacts.

---

GradePilot is an independent educational tool and is not affiliated with Air University.
