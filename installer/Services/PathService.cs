using System;
using System.IO;

namespace GradePilotInstaller.Services
{
    public interface IPathService
    {
        string InstallRoot { get; set; }
        string ExtensionDirectory { get; }
        string ConfigDirectory { get; }
        string CacheDirectory { get; }
        string LogDirectory { get; }
        string LegalDirectory { get; }
        string SettingsFile { get; }
        string LogFile { get; }
    }

    public class PathService : IPathService
    {
        public string InstallRoot { get; set; }

        public PathService()
        {
            InstallRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "GradePilot");
        }

        public string ExtensionDirectory => Path.Combine(InstallRoot, "extension");
        public string ConfigDirectory => Path.Combine(InstallRoot, "config");
        public string CacheDirectory => Path.Combine(InstallRoot, "cache");
        public string LogDirectory => Path.Combine(InstallRoot, "logs");
        public string LegalDirectory => Path.Combine(InstallRoot, "Legal");
        
        public string SettingsFile => Path.Combine(ConfigDirectory, "settings.json");
        public string LogFile => Path.Combine(LogDirectory, "install.log");
    }
}
