using System;
using System.Diagnostics;

namespace GradePilotInstaller.Services
{
    public interface IInstallerLogger
    {
        void LogInfo(string message);
        void LogError(string message, Exception? ex = null);
    }

    public class FileInstallerLogger : IInstallerLogger
    {
        // For Milestone 1, we just provide the abstraction. 
        // File-writing logic can be wired up later.
        
        public void LogInfo(string message)
        {
            Debug.WriteLine($"[INFO] {DateTime.Now}: {message}");
        }

        public void LogError(string message, Exception? ex = null)
        {
            Debug.WriteLine($"[ERROR] {DateTime.Now}: {message}");
            if (ex != null)
            {
                Debug.WriteLine($"[EXCEPTION] {ex}");
            }
        }
    }
}
