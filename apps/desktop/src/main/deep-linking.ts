import { app, BrowserWindow } from 'electron';

const PROTOCOL = 'personal-dashboard';

/**
 * Set up deep linking protocol
 */
export function setupDeepLinking(mainWindow: BrowserWindow): void {
  // Set as default protocol client
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [process.argv[1]]);
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }

  // Handle deep links on macOS
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url, mainWindow);
  });

  // Handle deep links on Windows/Linux
  // Check if app is single instance
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (_event, commandLine) => {
      // Someone tried to run a second instance, focus our window instead
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();

        // Handle deep link from second instance
        const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`));
        if (url) {
          handleDeepLink(url, mainWindow);
        }
      }
    });
  }
}

/**
 * Handle deep link URL
 */
export function handleDeepLink(url: string, mainWindow: BrowserWindow): void {
  console.log('Deep link received:', url);

  // Parse URL
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const params = Object.fromEntries(urlObj.searchParams);

  // Show and focus window
  mainWindow.show();
  mainWindow.focus();

  // Route to appropriate location based on path
  switch (path) {
    case '/financial':
    case '/financial/transactions':
      mainWindow.webContents.send('navigate', '/financial/transactions', params);
      break;

    case '/financial/accounts':
      mainWindow.webContents.send('navigate', '/financial/accounts', params);
      break;

    case '/financial/budgets':
      mainWindow.webContents.send('navigate', '/financial/budgets', params);
      break;

    case '/health':
    case '/health/metrics':
      mainWindow.webContents.send('navigate', '/health/metrics', params);
      break;

    case '/health/meals':
      mainWindow.webContents.send('navigate', '/health/meals', params);
      break;

    case '/health/workouts':
      mainWindow.webContents.send('navigate', '/health/workouts', params);
      break;

    case '/schedule':
    case '/schedule/tasks':
      mainWindow.webContents.send('navigate', '/schedule/tasks', params);
      break;

    case '/schedule/calendar':
      mainWindow.webContents.send('navigate', '/schedule/calendar', params);
      break;

    case '/schedule/projects':
      mainWindow.webContents.send('navigate', '/schedule/projects', params);
      break;

    case '/graph':
      mainWindow.webContents.send('navigate', '/graph', params);
      break;

    case '/insights':
      mainWindow.webContents.send('navigate', '/insights', params);
      break;

    case '/quick-capture':
      mainWindow.webContents.send('menu:quick-capture', params);
      break;

    default:
      // Default to dashboard
      mainWindow.webContents.send('navigate', '/dashboard', params);
      break;
  }
}

/**
 * Generate deep link URL
 * @param path - Path within the app (e.g., '/financial/transactions')
 * @param params - Optional query parameters
 */
export function generateDeepLink(path: string, params?: Record<string, string>): string {
  const url = new URL(`${PROTOCOL}://${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
}

/**
 * Check if app is set as default protocol client
 */
export function isDefaultProtocolClient(): boolean {
  return app.isDefaultProtocolClient(PROTOCOL);
}

/**
 * Remove as default protocol client
 */
export function removeAsDefaultProtocolClient(): void {
  app.removeAsDefaultProtocolClient(PROTOCOL);
}

/**
 * Examples of deep link URLs:
 *
 * personal-dashboard://financial/transactions?id=123
 * personal-dashboard://health/meals?date=2024-01-01
 * personal-dashboard://schedule/tasks?priority=high
 * personal-dashboard://quick-capture
 * personal-dashboard://graph?nodeId=user-123
 */
