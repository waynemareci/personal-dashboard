import { app, shell, BrowserWindow, Tray, Menu, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

// Import custom modules
import { createWindowStateKeeper } from './window-state';
import { registerIPCHandlers, unregisterIPCHandlers } from './ipc-handlers';
import { createApplicationMenu, setupContextMenu } from './menu';
import { createSystemTray } from './tray';
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcuts';
import { setupDeepLinking, handleDeepLink } from './deep-linking';
import { setupAutoUpdater, checkForUpdates, configureAutoUpdaterLogging } from './auto-updater';

// Global references
let mainWindow: BrowserWindow | null = null;
let systemTray: Tray | null = null;
let quickCaptureWindow: BrowserWindow | null = null;

/**
 * Create the main application window
 */
function createWindow(): void {
  // Create window state keeper
  const windowState = createWindowStateKeeper({
    windowName: 'main',
    defaultWidth: 1400,
    defaultHeight: 900,
    persist: true
  });

  const state = windowState.getState();

  // Create the browser window
  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: false,
    backgroundColor: '#1a1a1a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      webSecurity: true
    }
  });

  // Track window state
  windowState.track(mainWindow);

  // Show window when ready
  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Prevent window close, minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!app.isQuitting && systemTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Set up context menu
  setupContextMenu(mainWindow);

  // Load the remote URL for development or the local html file for production
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Register IPC handlers
  registerIPCHandlers(mainWindow);

  // Create application menu
  const menu = createApplicationMenu({
    mainWindow,
    onQuickCapture: () => createQuickCaptureWindow()
  });
  Menu.setApplicationMenu(menu);

  // Create system tray
  systemTray = createSystemTray({
    mainWindow,
    onQuickCapture: () => createQuickCaptureWindow()
  });

  // Register global shortcuts
  registerGlobalShortcuts(mainWindow, {
    onQuickCapture: () => createQuickCaptureWindow(),
    onToggleWindow: () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    }
  });

  // Set up auto-updater
  if (process.env.NODE_ENV === 'production') {
    setupAutoUpdater(mainWindow);
  }
}

/**
 * Create quick capture overlay window
 */
function createQuickCaptureWindow(): void {
  if (quickCaptureWindow) {
    quickCaptureWindow.show();
    quickCaptureWindow.focus();
    return;
  }

  quickCaptureWindow = new BrowserWindow({
    width: 600,
    height: 400,
    modal: true,
    parent: mainWindow || undefined,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true
    }
  });

  // Load quick capture page
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    quickCaptureWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/quick-capture`);
  } else {
    quickCaptureWindow.loadFile(join(__dirname, '../renderer/quick-capture.html'));
  }

  quickCaptureWindow.on('ready-to-show', () => {
    quickCaptureWindow?.show();
    quickCaptureWindow?.focus();
  });

  quickCaptureWindow.on('closed', () => {
    quickCaptureWindow = null;
  });

  // Close on blur
  quickCaptureWindow.on('blur', () => {
    quickCaptureWindow?.close();
  });
}

/**
 * Handle manual update check from renderer
 */
ipcMain.handle('app:check-for-updates', () => {
  if (mainWindow) {
    checkForUpdates(mainWindow);
  }
});

/**
 * Handle quick capture request from renderer
 */
ipcMain.handle('app:show-quick-capture', () => {
  createQuickCaptureWindow();
});

/**
 * App initialization
 */
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.personal-dashboard.app');

  // Configure auto-updater logging
  configureAutoUpdaterLogging();

  // Set up deep linking
  if (mainWindow) {
    setupDeepLinking(mainWindow);
  }

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Create main window
  createWindow();

  // Handle activation (macOS)
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });

  // Handle deep links on app start (Windows/Linux)
  if (process.platform === 'win32' || process.platform === 'linux') {
    const url = process.argv.find(arg => arg.startsWith('personal-dashboard://'));
    if (url && mainWindow) {
      handleDeepLink(url, mainWindow);
    }
  }
});

/**
 * Handle quit attempts
 */
app.on('before-quit', () => {
  app.isQuitting = true;
});

/**
 * Cleanup on quit
 */
app.on('will-quit', () => {
  // Unregister global shortcuts
  unregisterGlobalShortcuts();

  // Unregister IPC handlers
  unregisterIPCHandlers();
});

/**
 * Quit when all windows are closed, except on macOS
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Log error to file in production
  if (process.env.NODE_ENV === 'production') {
    // Could implement error logging here
  }
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  // Log error to file in production
  if (process.env.NODE_ENV === 'production') {
    // Could implement error logging here
  }
});

// Export for testing
export { createWindow, createQuickCaptureWindow };
