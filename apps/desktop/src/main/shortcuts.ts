import { globalShortcut, BrowserWindow } from 'electron';

export interface ShortcutHandlers {
  onQuickCapture?: () => void;
  onSearch?: () => void;
  onToggleWindow?: () => void;
}

/**
 * Register global keyboard shortcuts
 */
export function registerGlobalShortcuts(
  mainWindow: BrowserWindow,
  handlers: ShortcutHandlers = {}
): void {
  const isMac = process.platform === 'darwin';

  // Quick Capture - Ctrl/Cmd + Shift + N
  globalShortcut.register(isMac ? 'Command+Shift+N' : 'Control+Shift+N', () => {
    if (handlers.onQuickCapture) {
      handlers.onQuickCapture();
    } else {
      // Default: Show window and trigger quick capture
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('shortcut:quick-capture');
    }
  });

  // Global Search - Ctrl/Cmd + Shift + F
  globalShortcut.register(isMac ? 'Command+Shift+F' : 'Control+Shift+F', () => {
    if (handlers.onSearch) {
      handlers.onSearch();
    } else {
      // Default: Show window and trigger search
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('shortcut:search');
    }
  });

  // Toggle Window - Ctrl/Cmd + Shift + Space
  globalShortcut.register(isMac ? 'Command+Shift+Space' : 'Control+Shift+Space', () => {
    if (handlers.onToggleWindow) {
      handlers.onToggleWindow();
    } else {
      // Default: Toggle window visibility
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // New Transaction - Ctrl/Cmd + Alt + T
  globalShortcut.register(isMac ? 'Command+Alt+T' : 'Control+Alt+T', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('shortcut:new-transaction');
  });

  // New Task - Ctrl/Cmd + Alt + K
  globalShortcut.register(isMac ? 'Command+Alt+K' : 'Control+Alt+K', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('shortcut:new-task');
  });

  // Today's Insights - Ctrl/Cmd + Alt + I
  globalShortcut.register(isMac ? 'Command+Alt+I' : 'Control+Alt+I', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('navigate', '/insights/today');
  });

  console.log('Global shortcuts registered');
}

/**
 * Unregister all global shortcuts
 */
export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
  console.log('Global shortcuts unregistered');
}

/**
 * Check if a shortcut is registered
 */
export function isShortcutRegistered(accelerator: string): boolean {
  return globalShortcut.isRegistered(accelerator);
}

/**
 * Get list of registered shortcuts
 */
export function getRegisteredShortcuts(): string[] {
  const isMac = process.platform === 'darwin';

  return [
    isMac ? 'Command+Shift+N' : 'Control+Shift+N',
    isMac ? 'Command+Shift+F' : 'Control+Shift+F',
    isMac ? 'Command+Shift+Space' : 'Control+Shift+Space',
    isMac ? 'Command+Alt+T' : 'Control+Alt+T',
    isMac ? 'Command+Alt+K' : 'Control+Alt+K',
    isMac ? 'Command+Alt+I' : 'Control+Alt+I'
  ];
}
