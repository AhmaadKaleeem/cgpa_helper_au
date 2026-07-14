namespace GradePilotInstaller.Models
{
    public class InstallerProgressReport
    {
        public string CurrentStage { get; set; } = string.Empty;
        public string CurrentOperation { get; set; } = string.Empty;
        public string CurrentFile { get; set; } = string.Empty;
        public int FilesProcessed { get; set; }
        public int TotalFiles { get; set; }
        public double Percentage { get; set; }
        public bool IsIndeterminate { get; set; }
        public bool HasError { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
