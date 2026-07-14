using System.Windows;

namespace GradePilotInstaller.Views
{
    public partial class ConfirmDialog : Window
    {
        public ConfirmDialog(ViewModels.ConfirmDialogViewModel viewModel)
        {
            InitializeComponent();
            DataContext = viewModel;
        }
    }
}
