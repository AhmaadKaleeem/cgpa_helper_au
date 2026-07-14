using System;
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

        public InstallingViewModel(IInstallerCoordinator coordinator, IPathService pathService)
        {
            _coordinator = coordinator;
            _pathService = pathService;
        }

        public async Task StartInstallationAsync(Action onComplete)
        {
            var progress = new Progress<InstallerProgressReport>(report =>
            {
                CurrentStage = report.CurrentStage;
                StatusMessage = string.IsNullOrEmpty(report.CurrentFile) 
                    ? report.CurrentOperation 
                    : $"{report.CurrentOperation}: {report.CurrentFile}";
                
                IsIndeterminate = report.IsIndeterminate;
                ProgressValue = report.Percentage;
                
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

            if (result.Success)
            {
                try
                {
                    using var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\GradePilot");
                    if (key != null)
                    {
                        key.SetValue("DisplayName", "GradePilot");
                        key.SetValue("DisplayVersion", "1.0.0");
                        key.SetValue("Publisher", "Ahmad Kaleem");
                        
                        string uninstallCmd = $"powershell.exe -WindowStyle Hidden -Command \"Start-Sleep -Seconds 2; Remove-Item -Recurse -Force '{_pathService.InstallRoot}'; Remove-Item -Force 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GradePilot'\"";
                        key.SetValue("UninstallString", uninstallCmd);
                        key.SetValue("NoModify", 1);
                        key.SetValue("NoRepair", 1);
                        key.SetValue("InstallLocation", _pathService.InstallRoot);
                    }
                }
                catch { }
            }

            // In a real scenario we'd pass result.Success and errors to FinishView.
            // For now, move to the next screen immediately.
            onComplete?.Invoke();
        }
    }
}
