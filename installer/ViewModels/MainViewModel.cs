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
                splash,
                welcome,
                terms,
                directory,
                installing,
                chromeSetup,
                finish
            };

            NextCommand = new RelayCommand(OnNext, CanNext);
            BackCommand = new RelayCommand(OnBack, CanBack);
            CancelCommand = new RelayCommand(o => System.Windows.Application.Current.Shutdown());

            // Start at the first step
            _navigationService.NavigateTo(_steps[_currentIndex]);
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
                    _ = installingViewModel.StartInstallationAsync(() =>
                    {
                        // Auto-advance to next screen on completion
                        System.Windows.Application.Current.Dispatcher.Invoke(() => OnNext(null));
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
            return _currentIndex < _steps.Count - 1;
        }

        private void OnBack(object? parameter)
        {
            if (_currentIndex > 0)
            {
                _currentIndex--;
                _navigationService.NavigateTo(_steps[_currentIndex]);
                CommandManager.InvalidateRequerySuggested();
            }
        }

        private bool CanBack(object? parameter)
        {
            // Disallow going back from certain screens (e.g., Splash, Installing, Finish)
            if (CurrentView is SplashViewModel || 
                CurrentView is InstallingViewModel || 
                CurrentView is FinishViewModel)
            {
                return false;
            }
            return _currentIndex > 0;
        }

        private void OnCurrentViewChanged()
        {
            OnPropertyChanged(nameof(CurrentView));
        }
    }
}
