using System.Windows;
using GradePilotInstaller.ViewModels;

namespace GradePilotInstaller
{
    public partial class MainWindow : Window
    {
        public MainWindow(MainViewModel viewModel)
        {
            InitializeComponent();
            DataContext = viewModel;

    }
}
