using System;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Win32;
using GradePilotInstaller.Models;
using GradePilotInstaller.Services;

namespace GradePilotInstaller.ViewModels
{
    public class InstallingViewModel : BaseViewModel
    {
        private readonly IInstallerCoordinator _coordinator;
        private readonly IPathService _pathService;
        
        private string _statusMessage = "Preparing to install...";
        private string _currentStage = "Initializing";
        private double _progressValue = 0;
        private bool _isIndeterminate = true;
        private string _filesProcessedText = "0 files";
        private string _progressPercentageText = "0%";
        private bool _hasError = false;
        private string _errorMessage = string.Empty;

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public string CurrentStage
        {
            get => _currentStage;
            set => SetProperty(ref _currentStage, value);
        }

        public double ProgressValue
        {
            get => _progressValue;
            set => SetProperty(ref _progressValue, value);
        }

        public bool IsIndeterminate
        {
            get => _isIndeterminate;
            set => SetProperty(ref _isIndeterminate, value);
        }

        public string FilesProcessedText
        {
            get => _filesProcessedText;
            set => SetProperty(ref _filesProcessedText, value);
        }

        public string ProgressPercentageText
        {
            get => _progressPercentageText;
            set => SetProperty(ref _progressPercentageText, value);
        }

        public bool HasError
        {
            get => _hasError;
            set => SetProperty(ref _hasError, value);
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        // Populated on success, passed to FinishViewModel
        public InstallationResult? LastResult { get; private set; }

        public InstallingViewModel(IInstallerCoordinator coordinator, IPathService pathService)
        {
            _coordinator = coordinator;
            _pathService = pathService;
        }

        public async Task StartInstallationAsync(Action<bool> onComplete)
        {
            HasError = false;
            ErrorMessage = string.Empty;

            var progress = new Progress<InstallerProgressReport>(report =>
            {
                CurrentStage = report.CurrentStage;
                StatusMessage = string.IsNullOrEmpty(report.CurrentFile)
                    ? report.CurrentOperation
                    : $"{report.CurrentOperation}: {report.CurrentFile}";

                IsIndeterminate = report.IsIndeterminate;
                ProgressValue = report.Percentage;

                if (report.HasError)
                {
                    HasError = true;
                    ErrorMessage = report.ErrorMessage ?? "An unknown error occurred.";
                }

                if (report.FilesProcessed > 0 && report.TotalFiles > 0)
                {
                    FilesProcessedText = $"{report.FilesProcessed} / {report.TotalFiles} files";
                    ProgressPercentageText = $"{report.Percentage:F0}%";
                }
                else
                {
                    FilesProcessedText = "Processing...";
                    ProgressPercentageText = report.IsIndeterminate ? "..." : $"{report.Percentage:F0}%";
                }
            });

            var result = await _coordinator.RunInstallationAsync(progress);
            LastResult = result;

            if (!result.Success)
            {
                HasError = true;
                ErrorMessage = result.UserMessage ?? "Installation failed. Please try again.";
                CurrentStage = "Error";
                StatusMessage = result.TechnicalMessage ?? result.UserMessage ?? "An unexpected error occurred.";
                // Do NOT advance — stay on this screen so the user can see the error
                onComplete?.Invoke(false);
                return;
            }

            // Verify extraction actually produced files before declaring success
            string manifestPath = Path.Combine(_pathService.ExtensionDirectory, "manifest.json");
            if (!File.Exists(manifestPath))
            {
                HasError = true;
                ErrorMessage = $"Extraction completed but manifest.json was not found in '{_pathService.ExtensionDirectory}'. Installation is invalid.";
                CurrentStage = "Error";
                StatusMessage = ErrorMessage;
                onComplete?.Invoke(false);
                return;
            }

            // Write registry uninstall entry only on confirmed success
            try
            {
                using var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\GradePilot");
                if (key != null)
                {
                    key.SetValue("DisplayName", "GradePilot");
                    key.SetValue("DisplayVersion", "1.0.0");
                    key.SetValue("Publisher", "Ahmad Kaleem Bhatti");
                    string uninstallCmd = $"powershell.exe -WindowStyle Hidden -Command \"Start-Sleep -Seconds 2; Remove-Item -Recurse -Force '{_pathService.InstallRoot}'; Remove-Item -Force 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GradePilot'\"";
                    key.SetValue("UninstallString", uninstallCmd);
                    key.SetValue("NoModify", 1);
                    key.SetValue("NoRepair", 1);
                    key.SetValue("InstallLocation", _pathService.InstallRoot);
                }
            }
            catch { /* Registry write failures are non-fatal */ }

            onComplete?.Invoke(true);
        }
    }
}
