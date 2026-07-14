using System;
using System.IO;

namespace GradePilotInstaller.Services
{
    public interface IPathService
    {
        // User-chosen folder. Extension files are extracted here.
        string InstallRoot { get; set; }

        // Same as InstallRoot. Chrome loads this folder as the unpacked extension.
        string ExtensionDirectory { get; }

        // Fixed support-file location under %LOCALAPPDATA%\GradePilot.
        string AppDataRoot { get; }

        string ConfigDirectory { get; }
        string CacheDirectory { get; }
        string LogDirectory { get; }
        string LegalDirectory { get; }
        string SettingsFile { get; }
        string LogFile { get; }
        string InstalledIcoPath { get; }
    }

    public class PathService : IPathService
    {
        public string InstallRoot { get; set; }

        public PathService()
        {
            // Default: user's local app data so no admin rights needed
            InstallRoot = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "GradePilot");
        }

        // Extension files are extracted directly into InstallRoot. No subfolder.
        public string ExtensionDirectory => InstallRoot;

        // Support files always live here, regardless of where the extension is installed.
        public string AppDataRoot => Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "GradePilot");

        public string ConfigDirectory  => Path.Combine(AppDataRoot, "config");
        public string CacheDirectory   => Path.Combine(AppDataRoot, "cache");
        public string LogDirectory     => Path.Combine(AppDataRoot, "logs");
        public string LegalDirectory   => Path.Combine(AppDataRoot, "Legal");
        public string InstalledIcoPath => Path.Combine(AppDataRoot, "logo.ico");

        public string SettingsFile => Path.Combine(ConfigDirectory, "settings.json");
        public string LogFile      => Path.Combine(LogDirectory,    "install.log");
    }
}
