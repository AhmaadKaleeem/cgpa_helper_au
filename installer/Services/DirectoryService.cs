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
            Directory.CreateDirectory(_pathService.InstallRoot);
            Directory.CreateDirectory(_pathService.ExtensionDirectory);
            Directory.CreateDirectory(_pathService.ConfigDirectory);
            Directory.CreateDirectory(_pathService.CacheDirectory);
            Directory.CreateDirectory(_pathService.LogDirectory);
            Directory.CreateDirectory(_pathService.LegalDirectory);
        }

        public void ValidateDirectories()
        {
            if (!Directory.Exists(_pathService.InstallRoot))
                throw new DirectoryNotFoundException($"Installation root was not created: {_pathService.InstallRoot}");
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
