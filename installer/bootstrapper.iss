#define AppName "GradePilot"
#define AppVersion "1.0.0"
#define Publisher "Ahmad Kaleem Bhatti"

[Setup]
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#Publisher}
DefaultDirName={tmp}\GradePilotInstallerTemp
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=yes
DisableFinishedPage=yes
DisableWelcomePage=yes
CreateAppDir=yes
Uninstallable=no
PrivilegesRequired=lowest
OutputDir=Release
OutputBaseFilename=GradePilotSetup
Compression=lzma
SolidCompression=yes
; Skipping SetupIconFile to avoid missing .ico error

[Files]
Source: "bin\Release\net8.0-windows\win-x64\publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Run]
Filename: "{app}\GradePilotInstaller.exe"; Parameters: "/silent"; Flags: waituntilterminated; Check: WizardSilent
Filename: "{app}\GradePilotInstaller.exe"; Flags: waituntilterminated; Check: not WizardSilent
