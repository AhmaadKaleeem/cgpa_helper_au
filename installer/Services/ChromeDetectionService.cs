using System;
using System.IO;
using Microsoft.Win32;

namespace GradePilotInstaller.Services
{
    public interface IChromeDetectionService
    {
        bool TryFindChrome(out string chromePath);
    }

    public class ChromeDetectionService : IChromeDetectionService
    {
        public bool TryFindChrome(out string chromePath)
        {
            chromePath = string.Empty;

            try
            {
                // 1. Check Registry (Most reliable for actual installs)
                using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Clients\StartMenuInternet\Google Chrome\shell\open\command"))
                {
                    if (key != null)
                    {
                        var val = key.GetValue(null) as string;
                        if (!string.IsNullOrEmpty(val))
                        {
                            var cleanPath = val.Trim('"');
                            if (File.Exists(cleanPath))
                            {
                                chromePath = cleanPath;
                                return true;
                            }
                        }
                    }
                }

                // 2. Check Standard Paths
                var standardPaths = new[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
                };

                foreach (var path in standardPaths)
                {
                    if (File.Exists(path))
                    {
                        chromePath = path;
                        return true;
                    }
                }
            }
            catch
            {
                // Ignore any registry or IO exceptions
            }

            return false;
        }
    }
}
