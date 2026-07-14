using System.IO;

namespace GradePilotInstaller.Services
{
    public interface IDirectoryService
    {
        void InitializeDirectories();
        void ValidateDirectories();
        void CleanTemporaryFolders();
    }

    public class DirectoryService : IDirectoryService
    {
        private readonly IPathService _pathService;

        public DirectoryService(IPathService pathService)
        {
            _pathService = pathService;
        }

        public void InitializeDirectories()
        {
            // Extension destination (user-chosen — Chrome loads this directly)
            Directory.CreateDirectory(_pathService.InstallRoot);

            // Support files always go under AppDataRoot (may be same as InstallRoot for default path)
            Directory.CreateDirectory(_pathService.AppDataRoot);
            Directory.CreateDirectory(_pathService.ConfigDirectory);
            Directory.CreateDirectory(_pathService.CacheDirectory);
            Directory.CreateDirectory(_pathService.LogDirectory);
            Directory.CreateDirectory(_pathService.LegalDirectory);
        }

        public void ValidateDirectories()
        {
            if (!Directory.Exists(_pathService.InstallRoot))
                throw new DirectoryNotFoundException(
                    $"Extension installation folder was not created: {_pathService.InstallRoot}");

            if (!Directory.Exists(_pathService.AppDataRoot))
                throw new DirectoryNotFoundException(
                    $"AppData support folder was not created: {_pathService.AppDataRoot}");
        }

        public void CleanTemporaryFolders()
        {
            if (Directory.Exists(_pathService.CacheDirectory))
            {
                Directory.Delete(_pathService.CacheDirectory, recursive: true);
            }
        }
    }
}
