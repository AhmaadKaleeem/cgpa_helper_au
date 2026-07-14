using System;
using System.IO;

namespace GradePilotInstaller.ViewModels
{
    public class TermsViewModel : BaseViewModel
    {
        private bool _acceptedTerms;
        private string _termsText = string.Empty;

        public TermsViewModel()
        {
            LoadTermsText();
        }

        public string TermsText
        {
            get => _termsText;
            set => SetProperty(ref _termsText, value);
        }

        public bool AcceptedTerms
        {
            get => _acceptedTerms;
            set
            {
                if (SetProperty(ref _acceptedTerms, value))
                {
                    System.Windows.Input.CommandManager.InvalidateRequerySuggested();
                }
            }
        }

        private void LoadTermsText()
        {
            try
            {
                var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Legal", "TERMS_OF_SERVICE.md");
                if (File.Exists(path))
                {
                    TermsText = File.ReadAllText(path);
                }
                else
                {
                    TermsText = "Terms of Service file is missing.";
                }
            }
            catch (Exception ex)
            {
                TermsText = $"Could not load Terms of Service: {ex.Message}";
            }
        }
    }
}
