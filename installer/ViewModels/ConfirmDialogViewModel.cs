using System.Windows.Input;

namespace GradePilotInstaller.ViewModels
{
    public class ConfirmDialogViewModel : BaseViewModel
    {
        private string _message = string.Empty;
        private bool? _result = false;

        public string Message
        {
            get => _message;
            set => SetProperty(ref _message, value);
        }

        public bool? Result
        {
            get => _result;
            private set => SetProperty(ref _result, value);
        }

        public ICommand YesCommand { get; }
        public ICommand NoCommand { get; }

        public ConfirmDialogViewModel(string message)
        {
            Message = message;
            YesCommand = new RelayCommand(OnYes);
            NoCommand = new RelayCommand(OnNo);
        }

        private void OnYes(object? parameter)
        {
            Result = true;
            RequestClose?.Invoke();
        }

        private void OnNo(object? parameter)
        {
            Result = false;
            RequestClose?.Invoke();
        }

        public System.Action? RequestClose { get; set; }
    }
}
