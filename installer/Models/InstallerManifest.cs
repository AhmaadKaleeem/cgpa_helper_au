namespace GradePilotInstaller.Models
{
    public class InstallerManifest
    {
        public string InstallerVersion { get; set; } = string.Empty;
        public string ExtensionVersion { get; set; } = string.Empty;
        public string BuildDate { get; set; } = string.Empty;
        public string Channel { get; set; } = string.Empty;
        public string MinimumWindowsVersion { get; set; } = string.Empty;
        public string LegalVersion { get; set; } = string.Empty;
    }
}
