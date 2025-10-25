import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';

/**
 * Configure auto-updater logging
 */
export function configureAutoUpdaterLogging(): void {
  // Configure logging
  autoUpdater.logger = log;
  (autoUpdater.logger as typeof log).transports.file.level = 'info';

  log.info('Auto-updater configured');
}

/**
 * Set up auto-updater with event handlers
 */
export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // Configure update server (will be set in production)
  // autoUpdater.setFeedURL({
  //   provider: 'github',
  //   owner: 'yourusername',
  //   repo: 'personal-dashboard'
  // });

  // Check for updates on startup (after a delay)
  setTimeout(() => {
    if (process.env.NODE_ENV === 'production') {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }, 5000);

  // Event: Checking for updates
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...');
    mainWindow.webContents.send('update:checking');
  });

  // Event: Update available
  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    mainWindow.webContents.send('update:available', info);

    // Show notification
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. It will be downloaded in the background.`,
      buttons: ['OK']
    });
  });

  // Event: Update not available
  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
    mainWindow.webContents.send('update:not-available', info);
  });

  // Event: Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
    logMessage += ` - Downloaded ${progressObj.percent}%`;
    logMessage += ` (${progressObj.transferred}/${progressObj.total})`;

    log.info(logMessage);
    mainWindow.webContents.send('update:download-progress', progressObj);
  });

  // Event: Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    mainWindow.webContents.send('update:downloaded', info);

    // Show prompt to restart
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded. Restart the application to apply the update.`,
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  // Event: Error occurred
  autoUpdater.on('error', (error) => {
    log.error('Update error:', error);
    mainWindow.webContents.send('update:error', error.message);
  });
}

/**
 * Manually check for updates
 */
export function checkForUpdates(mainWindow: BrowserWindow): void {
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdates().catch((error) => {
      log.error('Failed to check for updates:', error);
      dialog.showErrorBox('Update Check Failed', error.message);
    });
  } else {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Development Mode',
      message: 'Auto-updates are disabled in development mode.',
      buttons: ['OK']
    });
  }
}

/**
 * Get current app version
 */
export function getCurrentVersion(): string {
  return autoUpdater.currentVersion.version;
}
