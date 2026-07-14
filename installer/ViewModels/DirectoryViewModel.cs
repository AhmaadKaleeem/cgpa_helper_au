using GradePilotInstaller.Services;

namespace GradePilotInstaller.ViewModels
{
    public class DirectoryViewModel : BaseViewModel
    {
        private readonly IPathService _pathService;

        public DirectoryViewModel(IPathService pathService)
        {
            _pathService = pathService;
        }

        public string InstallPath => _pathService.InstallRoot;
    }
}
