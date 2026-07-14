using System.Windows.Input;
using GradePilotInstaller.Services;

namespace GradePilotInstaller.ViewModels
{
    public class ChromeSetupViewModel : BaseViewModel
    {
        private readonly IChromeLaunchService _chromeLaunchService;
        private readonly IExplorerService _explorerService;
        private readonly IClipboardService _clipboardService;
        private readonly IPathService _pathService;

        public ICommand OpenFolderCommand { get; }
        public ICommand CopyPathCommand { get; }
        public ICommand OpenChromeCommand { get; }
        
        public string InstallPath => _pathService.ExtensionDirectory;

        public ChromeSetupViewModel(
            IChromeLaunchService chromeLaunchService,
            IExplorerService explorerService,
            IClipboardService clipboardService,
            IPathService pathService)
        {
            _chromeLaunchService = chromeLaunchService;
            _explorerService = explorerService;
            _clipboardService = clipboardService;
            _pathService = pathService;

            OpenFolderCommand = new RelayCommand(o => _explorerService.OpenFolder(_pathService.InstallRoot));
            CopyPathCommand = new RelayCommand(o => _clipboardService.CopyText(_pathService.InstallRoot));
            OpenChromeCommand = new RelayCommand(o => _chromeLaunchService.LaunchExtensionsPage());
        }
    }
}
