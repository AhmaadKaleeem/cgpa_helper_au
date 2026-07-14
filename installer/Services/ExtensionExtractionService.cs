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
            string archivePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "extension.zip");
            string targetDir = _pathService.ExtensionDirectory;

            await Task.Run(() =>
            {
                try
                {
                    // Validation Phase
                    progress?.Report(new InstallerProgressReport 
                    { 
                        CurrentStage = "Validating", 
                        CurrentOperation = "Checking archive integrity",
                        IsIndeterminate = true 
                    });

                    if (!File.Exists(archivePath))
                    {
                        throw new FileNotFoundException("Extension archive not found.", archivePath);
                    }

                    using var archive = ZipFile.OpenRead(archivePath);

                    var manifestEntry = archive.Entries.FirstOrDefault(e => e.FullName.Equals("manifest.json", StringComparison.OrdinalIgnoreCase));
                    if (manifestEntry == null)
                    {
                        throw new InvalidDataException("The bundled archive is corrupted or missing manifest.json.");
                    }

                    // Preparation Phase
                    progress?.Report(new InstallerProgressReport 
                    { 
                        CurrentStage = "Preparing", 
                        CurrentOperation = "Creating target directory",
                        IsIndeterminate = true 
                    });

                    if (!Directory.Exists(targetDir))
                    {
                        Directory.CreateDirectory(targetDir);
                    }

                    // Extraction Phase
                    int totalFiles = archive.Entries.Count(e => !string.IsNullOrEmpty(e.Name));
                    int processed = 0;

                    progress?.Report(new InstallerProgressReport 
                    { 
                        CurrentStage = "Extracting", 
                        CurrentOperation = "Extracting files to " + targetDir,
                        FilesProcessed = 0,
                        TotalFiles = totalFiles,
                        Percentage = 0,
                        IsIndeterminate = false 
                    });

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

                        try
                        {
                            Directory.CreateDirectory(Path.GetDirectoryName(destPath)!);
                            entry.ExtractToFile(destPath, overwrite: true);
                            processed++;
                        }
                        catch (Exception ex)
                        {
                            throw new InvalidOperationException($"Failed to extract {entry.FullName}: {ex.Message}", ex);
                        }

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

                    // Completion Phase
                    progress?.Report(new InstallerProgressReport 
                    { 
                        CurrentStage = "Completed", 
                        CurrentOperation = "Extraction completed successfully",
                        FilesProcessed = totalFiles,
                        TotalFiles = totalFiles,
                        Percentage = 100,
                        IsIndeterminate = false 
                    });
                }
                catch (Exception ex)
                {
                    progress?.Report(new InstallerProgressReport 
                    { 
                        CurrentStage = "Error", 
                        CurrentOperation = "Extraction failed",
                        HasError = true,
                        ErrorMessage = ex.Message,
                        IsIndeterminate = false 
                    });
                    throw;
                }
            });
        }
    }
}
