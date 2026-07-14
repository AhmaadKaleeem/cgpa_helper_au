using System;
using System.IO;
using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using GradePilotInstaller.Services;
using GradePilotInstaller.ViewModels;

namespace GradePilotInstaller
{
    public partial class App : Application
    {
        private readonly IHost _host;

        public App()
        {

            _host = Host.CreateDefaultBuilder()
                .ConfigureLogging((context, logging) =>
                {
                    logging.AddSimpleConsole(options => options.TimestampFormat = "[HH:mm:ss] ");
                    logging.Services.AddSingleton<ILoggerProvider>(sp => 
                    {
                        var pathService = sp.GetRequiredService<IPathService>();
                        return new FileLoggerProvider(pathService.LogFile);
                    });
                })
                .ConfigureServices((context, services) =>
                {
                    // Services
                    services.AddSingleton<INavigationService, NavigationService>();
                    services.AddSingleton<IPathService, PathService>();
                    services.AddSingleton<IDirectoryService, DirectoryService>();
                    services.AddSingleton<IChromeDetectionService, ChromeDetectionService>();
                    services.AddSingleton<IPrerequisiteService, PrerequisiteService>();
                    services.AddSingleton<IExtensionExtractionService, ExtensionExtractionService>();
                    services.AddSingleton<IClipboardService, ClipboardService>();
                    services.AddSingleton<IExplorerService, ExplorerService>();
                    services.AddSingleton<IChromeLaunchService, ChromeLaunchService>();
                    services.AddSingleton<IInstallerCoordinator, InstallerCoordinator>();

                    // ViewModels
                    services.AddSingleton<MainViewModel>();
                    services.AddTransient<SplashViewModel>();
                    services.AddTransient<WelcomeViewModel>();
                    services.AddTransient<TermsViewModel>();
                    services.AddTransient<DirectoryViewModel>();
                    services.AddTransient<InstallingViewModel>();
                    services.AddTransient<ChromeSetupViewModel>();
                    services.AddTransient<FinishViewModel>();

                    // Main Window
                    services.AddSingleton<MainWindow>();
                })
                .Build();
        }

        protected override async void OnStartup(StartupEventArgs e)
        {
            await _host.StartAsync();

            var mainWindow = _host.Services.GetRequiredService<MainWindow>();
            mainWindow.Show();

            base.OnStartup(e);
        }

        protected override async void OnExit(ExitEventArgs e)
        {
            using (_host)
            {
                await _host.StopAsync();
            }
            base.OnExit(e);
        }
    }
}
