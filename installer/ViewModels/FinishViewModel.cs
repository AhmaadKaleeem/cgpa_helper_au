using System.Windows.Input;

namespace GradePilotInstaller.ViewModels
{
    public class FinishViewModel : BaseViewModel
    {
        public ICommand FinishCommand { get; }

        public FinishViewModel()
        {
            FinishCommand = new RelayCommand(o => System.Windows.Application.Current.Shutdown());
        }
    }
}
