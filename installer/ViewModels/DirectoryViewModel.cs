using GradePilotInstaller.Services;
using System.Windows.Input;
using Microsoft.Win32;

namespace GradePilotInstaller.ViewModels
{
    public class DirectoryViewModel : BaseViewModel
    {
        private readonly IPathService _pathService;
        private string _displayPath = string.Empty;
        private string _spaceText = string.Empty;
        private bool _hasSufficientSpace = true;

        public ICommand BrowseCommand { get; }

        public string InstallPath
        {
            get => _displayPath;
            private set => SetProperty(ref _displayPath, value);
        }

        public string SpaceText
        {
            get => _spaceText;
            private set => SetProperty(ref _spaceText, value);
        }

        public bool HasSufficientSpace
        {
            get => _hasSufficientSpace;
            private set => SetProperty(ref _hasSufficientSpace, value);
        }

        public DirectoryViewModel(IPathService pathService)
        {
            _pathService = pathService;
            _displayPath = _pathService.InstallRoot;
            BrowseCommand = new RelayCommand(OnBrowse);
            UpdateSpaceCheck();
        }

        private void OnBrowse(object? parameter)
        {
            var dialog = new OpenFolderDialog
            {
                Title = "Select Installation Folder",
                InitialDirectory = InstallPath
            };

            if (dialog.ShowDialog() == true)
            {
                string selectedPath = dialog.FolderName;
                if (!selectedPath.TrimEnd(System.IO.Path.DirectorySeparatorChar, System.IO.Path.AltDirectorySeparatorChar)
                    .EndsWith("GradePilot", System.StringComparison.OrdinalIgnoreCase))
                {
                    selectedPath = System.IO.Path.Combine(selectedPath, "GradePilot");
                }

                _pathService.InstallRoot = selectedPath;
                InstallPath = selectedPath;
                UpdateSpaceCheck();
            }
        }
        
        public void UpdateSpaceCheck()
        {
            try
            {
                var drive = new System.IO.DriveInfo(System.IO.Path.GetPathRoot(InstallPath) ?? "C:\\");
                long availableBytes = drive.AvailableFreeSpace;
                double availableGB = availableBytes / (1024.0 * 1024.0 * 1024.0);
                
                HasSufficientSpace = availableBytes > 50 * 1024 * 1024; // Require at least 50 MB
                
                if (HasSufficientSpace)
                    SpaceText = $"Space required: 15 MB | Available: {availableGB:F2} GB";
                else
                    SpaceText = $"Space required: 15 MB | Available: {availableGB:F2} GB (Insufficient space!)";
            }
            catch
            {
                SpaceText = "Space required: 15 MB | Available: Unknown";
                HasSufficientSpace = true;
            }
            System.Windows.Input.CommandManager.InvalidateRequerySuggested();
        }
    }
}
