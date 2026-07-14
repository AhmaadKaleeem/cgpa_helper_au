using System;
using System.IO;
using System.Text.Json;
using GradePilotInstaller.Models;

namespace GradePilotInstaller.ViewModels
{
    public class WelcomeViewModel : BaseViewModel
    {
        private string _installerVersion = string.Empty;
        private string _extensionVersion = string.Empty;
        private string _buildDate = string.Empty;

        public string InstallerVersion
        {
            get => _installerVersion;
            set => SetProperty(ref _installerVersion, value);
        }

        public string ExtensionVersion
        {
            get => _extensionVersion;
            set => SetProperty(ref _extensionVersion, value);
        }

        public string BuildDate
        {
            get => _buildDate;
            set => SetProperty(ref _buildDate, value);
        }

        public WelcomeViewModel()
        {
            LoadManifest();
        }

        private void LoadManifest()
        {
            try
            {
                var manifestPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "installer-manifest.json");
                if (File.Exists(manifestPath))
                {
                    var json = File.ReadAllText(manifestPath);
                    var manifest = JsonSerializer.Deserialize<InstallerManifest>(json);
                    if (manifest != null)
                    {
                        InstallerVersion = manifest.InstallerVersion;
                        ExtensionVersion = manifest.ExtensionVersion;
                        BuildDate = manifest.BuildDate;
                    }
                }
            }
            catch
            {
                // Fallback to defaults
                InstallerVersion = "1.0.0";
                ExtensionVersion = "1.0.0";
            }
        }
    }
}
