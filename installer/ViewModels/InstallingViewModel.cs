using System;
using System.Threading.Tasks;
using System.Windows.Input;
using GradePilotInstaller.Models;
using GradePilotInstaller.Services;

namespace GradePilotInstaller.ViewModels
{
    public class InstallingViewModel : BaseViewModel
    {
        private readonly IInstallerCoordinator _coordinator;
        
        private string _statusMessage = "Preparing to install...";
        private double _progressValue = 0;
        private bool _isIndeterminate = true;

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
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

        public InstallingViewModel(IInstallerCoordinator coordinator)
        {
            _coordinator = coordinator;
        }

        public async Task StartInstallationAsync(Action onComplete)
        {
            var progress = new Progress<InstallerProgressReport>(report =>
            {
                StatusMessage = string.IsNullOrEmpty(report.CurrentFile) 
                    ? report.CurrentOperation 
                    : $"{report.CurrentOperation}: {report.CurrentFile}";
                
                IsIndeterminate = report.IsIndeterminate;
                ProgressValue = report.Percentage;
            });

            var result = await _coordinator.RunInstallationAsync(progress);

            // In a real scenario we'd pass result.Success and errors to FinishView.
            // For now, move to the next screen immediately.
            onComplete?.Invoke();
        }
    }
}
