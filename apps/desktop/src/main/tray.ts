import { Tray, Menu, BrowserWindow, app, nativeImage } from 'electron';
import * as path from 'path';

export interface TrayOptions {
  mainWindow: BrowserWindow;
  onQuickCapture?: () => void;
}

/**
 * Create system tray
 */
export function createSystemTray(options: TrayOptions): Tray {
  const { mainWindow } = options;

  // Create tray icon
  // For now using a placeholder path - replace with actual icon
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png');
  let trayIcon: Tray;

  try {
    const icon = nativeImage.createFromPath(iconPath);
    trayIcon = new Tray(icon.resize({ width: 16, height: 16 }));
  } catch {
    // Fallback to creating empty tray if icon doesn't exist
    trayIcon = new Tray(nativeImage.createEmpty());
  }

  trayIcon.setToolTip('Personal Dashboard');

  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Dashboard',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Quick Capture',
      accelerator: process.platform === 'darwin' ? 'Cmd+Shift+N' : 'Ctrl+Shift+N',
      click: () => {
        if (options.onQuickCapture) {
          options.onQuickCapture();
        }
        mainWindow.webContents.send('menu:quick-capture');
      }
    },
    { type: 'separator' },
    {
      label: 'Financial',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('navigate', '/financial');
      }
    },
    {
      label: 'Health & Fitness',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('navigate', '/health');
      }
    },
    {
      label: 'Schedule & Tasks',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('navigate', '/schedule');
      }
    },
    { type: 'separator' },
    {
      label: 'Today\'s Insights',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('navigate', '/insights/today');
      }
    },
    { type: 'separator' },
    {
      label: 'Preferences',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('menu:open-preferences');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  trayIcon.setContextMenu(contextMenu);

  // Double-click to show window
  trayIcon.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
    }
  });

  // Single click behavior (different on different platforms)
  if (process.platform !== 'darwin') {
    trayIcon.on('click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }

  return trayIcon;
}

/**
 * Update tray icon badge (for notifications count)
 */
export function updateTrayBadge(tray: Tray, count: number): void {
  if (count > 0) {
    tray.setTitle(`${count}`);
  } else {
    tray.setTitle('');
  }
}

/**
 * Show tray balloon (Windows only)
 */
export function showTrayBalloon(
  tray: Tray,
  options: { title: string; content: string; icon?: Electron.NativeImage }
): void {
  if (process.platform === 'win32') {
    tray.displayBalloon({
      title: options.title,
      content: options.content,
      icon: options.icon
    });
  }
}
