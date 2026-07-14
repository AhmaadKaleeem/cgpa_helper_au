using System;
using System.IO;

namespace GradePilotInstaller.Services
{
    public interface IPrerequisiteService
    {
        bool Validate(out string errorMessage);
    }

    public class PrerequisiteService : IPrerequisiteService
    {
        private readonly IChromeDetectionService _chromeDetectionService;

        public PrerequisiteService(IChromeDetectionService chromeDetectionService)
        {
            _chromeDetectionService = chromeDetectionService;
        }

        public bool Validate(out string errorMessage)
        {
            // 1. Check Windows Version
            if (Environment.OSVersion.Version.Major < 10)
            {
                errorMessage = "GradePilot requires Windows 10 or later.";
                return false;
            }

            // 2. Check Chrome Installation
            if (!_chromeDetectionService.TryFindChrome(out _))
            {
                errorMessage = "Google Chrome could not be found on this system. Please install Google Chrome to use GradePilot.";
                return false;
            }

            // 3. Check Archive Exists
            string archivePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "extension.zip");
            if (!File.Exists(archivePath))
            {
                errorMessage = $"The installation package is missing the extension archive (expected at: {archivePath}). Please download the installer again.";
                return false;
            }

            errorMessage = string.Empty;
            return true;
        }
    }
}
