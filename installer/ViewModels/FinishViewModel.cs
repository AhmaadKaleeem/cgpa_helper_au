using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Input;
using GradePilotInstaller.Services;

namespace GradePilotInstaller.ViewModels
{
    public class FinishViewModel : BaseViewModel
    {
        private readonly IPathService _pathService;
        private bool _createDesktopShortcut = true;
        private bool _createStartMenuShortcut = true;
        private bool _installationSucceeded = false;
        private string _statusMessage = "GradePilot has been installed successfully.";

        public bool CreateDesktopShortcut
        {
            get => _createDesktopShortcut;
            set => SetProperty(ref _createDesktopShortcut, value);
        }

        public bool CreateStartMenuShortcut
        {
            get => _createStartMenuShortcut;
            set => SetProperty(ref _createStartMenuShortcut, value);
        }

        public bool InstallationSucceeded
        {
            get => _installationSucceeded;
            set => SetProperty(ref _installationSucceeded, value);
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public ICommand FinishCommand { get; }

        public FinishViewModel(IPathService pathService)
        {
            _pathService = pathService;
            FinishCommand = new RelayCommand(OnFinish);
        }

        /// <summary>
        /// Called by MainViewModel after successful installation. 
        /// Only creates shortcuts when the extension directory is confirmed to exist.
        /// </summary>
        public void MarkInstallationSuccess()
        {
            string manifestPath = Path.Combine(_pathService.ExtensionDirectory, "manifest.json");
            InstallationSucceeded = File.Exists(manifestPath);

            if (!InstallationSucceeded)
            {
                StatusMessage = "Installation encountered an error. The extension files could not be verified.";
                CreateDesktopShortcut = false;
                CreateStartMenuShortcut = false;
            }
        }

        private void OnFinish(object? parameter)
        {
            // Only create shortcuts if we know the files actually exist
            string extensionDir = _pathService.ExtensionDirectory;
            bool filesExist = Directory.Exists(extensionDir) && File.Exists(Path.Combine(extensionDir, "manifest.json"));

            if (filesExist)
            {
                if (CreateDesktopShortcut)
                {
                    var desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    var linkPath = Path.Combine(desktopDir, "GradePilot.lnk");
                    CreateShortcut(linkPath, extensionDir);
                }

                if (CreateStartMenuShortcut)
                {
                    var startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "GradePilot");
                    Directory.CreateDirectory(startMenuDir);
                    var linkPath = Path.Combine(startMenuDir, "GradePilot.lnk");
                    CreateShortcut(linkPath, extensionDir);
                }
            }

            System.Windows.Application.Current.Shutdown();
        }

        private void CreateShortcut(string shortcutPath, string targetPath)
        {
            try
            {
                var p = new Process();
                p.StartInfo.FileName = "powershell.exe";
                p.StartInfo.Arguments = $"-NoProfile -WindowStyle Hidden -Command \"$wshell = New-Object -ComObject WScript.Shell; $s = $wshell.CreateShortcut('{shortcutPath}'); $s.TargetPath = '{targetPath}'; $s.Save()\"";
                p.StartInfo.UseShellExecute = false;
                p.StartInfo.CreateNoWindow = true;
                p.Start();
                p.WaitForExit();
            }
            catch { }
        }
    }
}
