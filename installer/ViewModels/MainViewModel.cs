using System;
using System.Collections.Generic;
using System.Windows.Input;
using GradePilotInstaller.Services;

namespace GradePilotInstaller.ViewModels
{
    public class MainViewModel : BaseViewModel
    {
        private readonly INavigationService _navigationService;
        private readonly List<BaseViewModel> _steps;
        private int _currentIndex = 0;

        public BaseViewModel CurrentView => _navigationService.CurrentView;

        public bool IsFooterVisible
        {
            get
            {
                return !(CurrentView is SplashViewModel || 
                         CurrentView is InstallingViewModel || 
                         CurrentView is FinishViewModel);
            }
        }

        public ICommand NextCommand { get; }
        public ICommand BackCommand { get; }
        public ICommand CancelCommand { get; }

        public MainViewModel(
            INavigationService navigationService,
            SplashViewModel splash,
            WelcomeViewModel welcome,
            TermsViewModel terms,
            DirectoryViewModel directory,
            InstallingViewModel installing,
            ChromeSetupViewModel chromeSetup,
            FinishViewModel finish)
        {
            _navigationService = navigationService;
            _navigationService.CurrentViewChanged += OnCurrentViewChanged;

            _steps = new List<BaseViewModel>
            {
                welcome,
                terms,
                directory,
                installing,
                chromeSetup,
                finish
            };

            NextCommand = new RelayCommand(OnNext, CanNext);
            BackCommand = new RelayCommand(OnBack, CanBack);
            CancelCommand = new RelayCommand(OnCancel);

            // Show splash screen first, then navigate to welcome
            _navigationService.NavigateTo(splash);

            // Auto-advance from splash after animation completes
            _ = AutoAdvanceFromSplashAsync();
        }

        private async System.Threading.Tasks.Task AutoAdvanceFromSplashAsync()
        {
            await System.Threading.Tasks.Task.Delay(3000); // Wait for the progress bar animation
            System.Windows.Application.Current.Dispatcher.Invoke(() =>
            {
                if (CurrentView is SplashViewModel)
                {
                    _navigationService.NavigateTo(_steps[0]); // Navigate to welcome screen
                    CommandManager.InvalidateRequerySuggested();
                }
            });
        }

        private void OnNext(object? parameter)
        {
            if (_currentIndex < _steps.Count - 1)
            {
                _currentIndex++;
                _navigationService.NavigateTo(_steps[_currentIndex]);
                CommandManager.InvalidateRequerySuggested();

                if (_steps[_currentIndex] is InstallingViewModel installingViewModel)
                {
                    _ = installingViewModel.StartInstallationAsync((success) =>
                    {
                        System.Windows.Application.Current.Dispatcher.Invoke(() =>
                        {
                            if (success)
                            {
                                OnNext(null);
                            }
                            // On failure, we stay on the Installing screen showing the error
                        });
                    });
                }
            }
        }

        private bool CanNext(object? parameter)
        {
            // Terms View requires agreement
            if (CurrentView is TermsViewModel termsViewModel)
            {
                return termsViewModel.AcceptedTerms;
            }
            if (CurrentView is DirectoryViewModel dirViewModel)
            {
                return dirViewModel.HasSufficientSpace;
            }
            return _currentIndex < _steps.Count - 1;
        }

        private void OnBack(object? parameter)
        {
            if (_currentIndex > 0)
            {
                _currentIndex--;
                
                // Skip the installing screen when going back
                if (_steps[_currentIndex] is InstallingViewModel)
                {
                    _currentIndex--;
                }
                
                _navigationService.NavigateTo(_steps[_currentIndex]);
                CommandManager.InvalidateRequerySuggested();
            }
        }

        private bool CanBack(object? parameter)
        {
            // Disallow going back from certain screens where it doesn't make sense
            // (e.g., during or after installation)
            if (CurrentView is InstallingViewModel || 
                CurrentView is FinishViewModel)
            {
                return false;
            }
            return _currentIndex > 0;
        }

        public bool ForceClose { get; set; } = false;
        private bool _isConfirmingCancel = false;

        private void OnCancel(object? parameter)
        {
            if (_isConfirmingCancel) return;
            _isConfirmingCancel = true;
            
            var viewModel = new ConfirmDialogViewModel("Stop installing GradePilot?");
            var dialog = new Views.ConfirmDialog(viewModel);
            
            viewModel.RequestClose = () => dialog.Close();
            
            try
            {
                dialog.ShowDialog();
                
                if (viewModel.Result == true)
                {
                    ForceClose = true;
                    System.Windows.Application.Current.Shutdown();
                }
                else
                {
                    _isConfirmingCancel = false;
                }
            }
            catch (Exception ex)
            {
                System.Windows.MessageBox.Show(ex.ToString());
                _isConfirmingCancel = false;
            }
        }

        private void OnCurrentViewChanged()
        {
            OnPropertyChanged(nameof(CurrentView));
            OnPropertyChanged(nameof(IsFooterVisible));

            if (CurrentView is ChromeSetupViewModel chromeSetup)
            {
                if (chromeSetup.OpenChromeCommand.CanExecute(null))
                {
                    chromeSetup.OpenChromeCommand.Execute(null);
                }
            }

            if (CurrentView is FinishViewModel finishVm)
            {
                finishVm.MarkInstallationSuccess();
            }
        }
    }
}
