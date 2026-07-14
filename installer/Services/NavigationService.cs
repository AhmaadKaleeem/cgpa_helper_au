using System;
using GradePilotInstaller.ViewModels;

namespace GradePilotInstaller.Services
{
    public interface INavigationService
    {
        BaseViewModel CurrentView { get; }
        event Action CurrentViewChanged;
        void NavigateTo<TViewModel>() where TViewModel : BaseViewModel, new();
        void NavigateTo(BaseViewModel viewModel);
    }

    public class NavigationService : INavigationService
    {
        private BaseViewModel _currentView = null!;

        public BaseViewModel CurrentView
        {
            get => _currentView;
            private set
            {
                _currentView = value;
                CurrentViewChanged?.Invoke();
            }
        }

        public event Action? CurrentViewChanged;

        public void NavigateTo<TViewModel>() where TViewModel : BaseViewModel, new()
        {
            NavigateTo(new TViewModel());
        }

        public void NavigateTo(BaseViewModel viewModel)
        {
            CurrentView = viewModel;
        }
    }
}
