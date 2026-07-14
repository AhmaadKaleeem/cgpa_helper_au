using System;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using GradePilotInstaller.Models;
using Microsoft.Extensions.Logging;

namespace GradePilotInstaller.Services
{
    public interface IInstallerCoordinator
    {
        Task<InstallationResult> RunInstallationAsync(IProgress<InstallerProgressReport> progress);
    }

    public class InstallerCoordinator : IInstallerCoordinator
    {
        private readonly IPrerequisiteService _prerequisiteService;
        private readonly IDirectoryService _directoryService;
        private readonly IExtensionExtractionService _extractionService;
        private readonly IPathService _pathService;
        private readonly ILogger<InstallerCoordinator> _logger;

        public InstallerCoordinator(
            IPrerequisiteService prerequisiteService,
            IDirectoryService directoryService,
            IExtensionExtractionService extractionService,
            IPathService pathService,
            ILogger<InstallerCoordinator> logger)
        {
            _prerequisiteService = prerequisiteService;
            _directoryService = directoryService;
            _extractionService = extractionService;
            _pathService = pathService;
            _logger = logger;
        }

        public async Task<InstallationResult> RunInstallationAsync(IProgress<InstallerProgressReport> progress)
        {
            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation("Installation started.");

            try
            {
                // 1. Prerequisites
                progress?.Report(new InstallerProgressReport { CurrentStage = "Preparing", CurrentOperation = "Checking prerequisites", IsIndeterminate = true });
                if (!_prerequisiteService.Validate(out string errorMessage))
                {
                    _logger.LogWarning("Prerequisite validation failed: {ErrorMessage}", errorMessage);
                    return new InstallationResult
                    {
                        Success = false,
                        ErrorCode = "ERR_PREREQ",
                        UserMessage = errorMessage,
                        Duration = stopwatch.Elapsed
                    };
                }

                // 2. Directories
                progress?.Report(new InstallerProgressReport { CurrentStage = "Preparing", CurrentOperation = "Creating directories", IsIndeterminate = true });
                _directoryService.InitializeDirectories();
                _directoryService.ValidateDirectories();

                // 3. Extraction
                await _extractionService.ExtractAsync(progress!);

                // 4. Configuration
                progress?.Report(new InstallerProgressReport { CurrentStage = "Finalizing", CurrentOperation = "Writing configuration", IsIndeterminate = true });
                await WriteConfigurationAsync();

                // 5. Copy Legal Docs
                CopyLegalDocuments();

                // 6. Copy icon to install root so shortcuts can reference a stable path
                CopyIcon();

                _logger.LogInformation("Installation completed successfully.");
                return new InstallationResult
                {
                    Success = true,
                    InstalledPath = _pathService.ExtensionDirectory,
                    Duration = stopwatch.Elapsed
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Installation failed with an unexpected error.");
                
                try
                {
                    if (Directory.Exists(_pathService.InstallRoot))
                    {
                        Directory.Delete(_pathService.InstallRoot, true);
                        _logger.LogInformation("Rollback completed: installation directory removed.");
                    }
                }
                catch (Exception rbEx)
                {
                    _logger.LogError(rbEx, "Rollback failed.");
                }

                return new InstallationResult
                {
                    Success = false,
                    ErrorCode = "ERR_EXCEPTION",
                    UserMessage = "An unexpected error occurred during installation.",
                    TechnicalMessage = ex.Message,
                    Duration = stopwatch.Elapsed
                };
            }
            finally
            {
                stopwatch.Stop();
            }
        }

        private async Task WriteConfigurationAsync()
        {
            var manifestPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "installer-manifest.json");
            InstallerManifest manifest = new InstallerManifest();
            
            if (File.Exists(manifestPath))
            {
                var json = await File.ReadAllTextAsync(manifestPath);
                manifest = JsonSerializer.Deserialize<InstallerManifest>(json) ?? new InstallerManifest();
            }

            var settings = new
            {
                InstallerVersion = manifest.InstallerVersion,
                ExtensionVersion = manifest.ExtensionVersion,
                InstallationDate = DateTime.UtcNow.ToString("o"),
                InstallationPath = _pathService.InstallRoot,
                UpdateChannel = manifest.Channel
            };

            var settingsJson = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_pathService.SettingsFile, settingsJson);
        }

        private void CopyLegalDocuments()
        {
            var legalSourceDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Legal");
            if (Directory.Exists(legalSourceDir))
            {
                foreach (var file in Directory.GetFiles(legalSourceDir))
                {
                    var destFile = Path.Combine(_pathService.LegalDirectory, Path.GetFileName(file));
                    File.Copy(file, destFile, overwrite: true);
                }
            }
        }
    }
}
