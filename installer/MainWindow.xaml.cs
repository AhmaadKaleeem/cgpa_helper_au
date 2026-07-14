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
            Closing += OnClosing;
        }

        private void OnClosing(object? sender, System.ComponentModel.CancelEventArgs e)
        {
            if (DataContext is MainViewModel vm)
            {
                // If it's the finish screen or we're forcing close, allow close
                if (vm.CurrentView is FinishViewModel || vm.ForceClose) 
                    return;

                e.Cancel = true; // Stop immediate closing
                
                if (vm.CancelCommand.CanExecute(null))
                {
                    vm.CancelCommand.Execute(null);
                }
            }
        }
    }
}
