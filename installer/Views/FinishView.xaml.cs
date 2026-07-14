using System.Diagnostics;
using System.Windows.Controls;

namespace GradePilotInstaller.Views
{
    public partial class FinishView : UserControl
    {
        public FinishView()
        {
            InitializeComponent();
        }

        private void OpenUserManual_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "https://github.com/AhmaadKaleeem/cgpa_helper_au/blob/main/extension/USER_MANUAL.md",
                UseShellExecute = true
            });
        }

        private void ContactSupport_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "mailto:ahmadkaleeem1@gmail.com?subject=GradePilot Support",
                UseShellExecute = true
            });
        }

        private void ReportBug_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "https://github.com/AhmaadKaleeem/cgpa_helper_au/issues/new",
                UseShellExecute = true
            });
        }
    }
}
