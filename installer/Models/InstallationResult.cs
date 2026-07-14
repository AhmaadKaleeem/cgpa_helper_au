using System;

namespace GradePilotInstaller.Models
{
    public class InstallationResult
    {
        public bool Success { get; set; }
        public string ErrorCode { get; set; } = string.Empty;
        public string UserMessage { get; set; } = string.Empty;
        public string TechnicalMessage { get; set; } = string.Empty;
        public string InstalledPath { get; set; } = string.Empty;
        public TimeSpan Duration { get; set; }
    }
}
