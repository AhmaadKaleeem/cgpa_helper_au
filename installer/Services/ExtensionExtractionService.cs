using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using GradePilotInstaller.Models;

namespace GradePilotInstaller.Services
{
    public interface IExtensionExtractionService
    {
        Task ExtractAsync(IProgress<InstallerProgressReport> progress);
    }

    public class ExtensionExtractionService : IExtensionExtractionService
    {
        private readonly IPathService _pathService;

        public ExtensionExtractionService(IPathService pathService)
        {
            _pathService = pathService;
        }

        public async Task ExtractAsync(IProgress<InstallerProgressReport> progress)
        {
            string archivePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "extension.zip");
            string targetDir = _pathService.ExtensionDirectory;

            await Task.Run(() =>
            {
                using var archive = ZipFile.OpenRead(archivePath);

                // Validation Phase
                progress?.Report(new InstallerProgressReport 
                { 
                    CurrentStage = "Extracting", 
                    CurrentOperation = "Validating archive integrity",
                    IsIndeterminate = true 
                });

                var manifestEntry = archive.Entries.FirstOrDefault(e => e.FullName.Equals("manifest.json", StringComparison.OrdinalIgnoreCase));
                if (manifestEntry == null)
                {
                    throw new InvalidDataException("The bundled archive is corrupted or missing manifest.json.");
                }

                // Extraction Phase
                int totalFiles = archive.Entries.Count;
                int processed = 0;

                foreach (var entry in archive.Entries)
                {
                    // Skip directories
                    if (string.IsNullOrEmpty(entry.Name)) continue;

                    string destPath = Path.GetFullPath(Path.Combine(targetDir, entry.FullName));
                    
                    // Security check to prevent zip slip
                    if (!destPath.StartsWith(targetDir, StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    Directory.CreateDirectory(Path.GetDirectoryName(destPath)!);
                    
                    entry.ExtractToFile(destPath, overwrite: true);

                    processed++;
                    progress?.Report(new InstallerProgressReport
                    {
                        CurrentStage = "Extracting",
                        CurrentOperation = "Extracting files",
                        CurrentFile = entry.FullName,
                        FilesProcessed = processed,
                        TotalFiles = totalFiles,
                        Percentage = (double)processed / totalFiles * 100,
                        IsIndeterminate = false
                    });
                }
            });
        }
    }
}
