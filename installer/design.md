# GradePilot Setup Wizard (Installer)

## Architecture Overview
- **Language**: C# (.NET 8)
- **UI Framework**: WPF (Windows Presentation Foundation)
- **Pattern**: MVVM (Model-View-ViewModel)
- **Packaging**: Inno Setup

## Design Guidelines & Theme
The installer must feel like premium software from a professional company (e.g., Notion, Figma, Grammarly). 
- **Color Palette**: The primary theme must be **White and Black**.
- **Interior Styling**: The internal text, typography, and specific layout elements should strictly follow the existing GradePilot Chrome extension design language (clean, minimalist, modern).
- **Branding**: The wizard must prominently feature the GradePilot logo (`Assets/logo.png`) and current version number.

## Professional Installation Workflow

### 1. Splash Screen
A clean, branded splash screen while the installer initializes.
* Actions: Check Windows version, Administrator privileges (if needed), Chrome installation status, Disk space, and existing GradePilot installations.

### 2. Welcome Screen
* Title: "Welcome to GradePilot"
* Body: "This installer will install GradePilot on your computer."
* Footer: Version 1.0.0
* Buttons: [Next]

### 3. Terms of Service (Optional License)
* Displays Terms of Service.
* Checkbox: "I accept"
* Buttons: [Back] [Next]

### 4. Installation Folder
* Default path: `C:\Users\{Username}\AppData\Local\GradePilot\`
* User can change the path via a [Browse] button.
* Buttons: [Install]

### 5. Installation Process (Behind the Scenes)
When the user clicks **Install**, the following happens automatically:
1. **Create Folders**: Creates `extension\`, `logs\`, `cache\`, and `config\` inside the target directory.
2. **Extract ZIP**: Extracts the bundled `extension.zip` into the `extension\` folder.
3. **Create Config**: Generates a `config.json` with version and install date.
4. **Create Shortcuts**: Creates Desktop and Start Menu shortcuts.
5. **Register Uninstall**: Adds GradePilot to Windows "Installed Apps" so it can be uninstalled normally.
6. **Detect Chrome**: Verifies Google Chrome is installed via Registry/Program Files.
7. **Open Chrome**: Launches `chrome.exe` navigating directly to `chrome://extensions`.
8. **Open Extension Folder**: Automatically opens the newly created `extension\` folder in Windows File Explorer.

### 6. Final Window
* Title: "Installation Complete"
* Body: Outlines the next manual steps to load the extension.
  1. Enable Developer Mode in Chrome.
  2. Click "Load unpacked".
  3. Select the installation path.
* Buttons (UX Enhancements):
  - 📂 **Open Folder** (Opens the extension directory)
  - 📋 **Copy Path** (Copies the directory path to the clipboard)
  - 🌐 **Open Chrome** (Launches `chrome://extensions`)
* Button: [Finish]

## Future Expansion
This installer is designed to be upgraded into an **Updater**. In future versions, running the setup wizard will detect the current version, download the latest package, and replace the files dynamically.
