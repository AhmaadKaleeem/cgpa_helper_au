using System;
using System.Diagnostics;
using System.Windows;
using GradePilotInstaller.Models;

namespace GradePilotInstaller.Services
{
    public interface IClipboardService
    {
        void CopyText(string text);
    }

    public class ClipboardService : IClipboardService
    {
        public void CopyText(string text)
        {
            Application.Current.Dispatcher.Invoke(() => Clipboard.SetText(text));
        }
    }

    public interface IExplorerService
    {
        void OpenFolder(string folderPath);
    }

    public class ExplorerService : IExplorerService
    {
        public void OpenFolder(string folderPath)
        {
            if (System.IO.Directory.Exists(folderPath))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = folderPath,
                    UseShellExecute = true
                });
            }
        }
    }

    public interface IChromeLaunchService
    {
        bool LaunchExtensionsPage();
    }

    public class ChromeLaunchService : IChromeLaunchService
    {
        private readonly IChromeDetectionService _chromeDetectionService;

        public ChromeLaunchService(IChromeDetectionService chromeDetectionService)
        {
            _chromeDetectionService = chromeDetectionService;
        }

        public bool LaunchExtensionsPage()
        {
            if (_chromeDetectionService.TryFindChrome(out string chromePath))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = chromePath,
                    Arguments = "chrome://extensions",
                    UseShellExecute = true
                });
                return true;
            }
            return false;
        }
    }
}
