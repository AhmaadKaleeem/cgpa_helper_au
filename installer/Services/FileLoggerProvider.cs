using System;
using System.IO;
using Microsoft.Extensions.Logging;

namespace GradePilotInstaller.Services
{
    public class FileLoggerProvider : ILoggerProvider
    {
        private readonly string _logFilePath;

        public FileLoggerProvider(string logFilePath)
        {
            _logFilePath = logFilePath;
            var dir = Path.GetDirectoryName(logFilePath);
            if (!string.IsNullOrEmpty(dir))
            {
                Directory.CreateDirectory(dir);
            }
        }

        public ILogger CreateLogger(string categoryName) => new FileLogger(_logFilePath, categoryName);

        public void Dispose() { }
    }

    public class FileLogger : ILogger
    {
        private readonly string _path;
        private readonly string _category;
        private static readonly object _lock = new object();

        public FileLogger(string path, string category)
        {
            _path = path;
            _category = category;
        }

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            if (!IsEnabled(logLevel)) return;

            var msg = formatter(state, exception);
            var exMsg = exception != null ? $"\n{exception}" : "";
            
            lock (_lock)
            {
                try
                {
                    File.AppendAllText(_path, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [{logLevel}] [{_category}] {msg}{exMsg}\n");
                }
                catch { }
            }
        }
    }
}
