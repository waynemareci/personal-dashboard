import { ipcMain, shell, dialog, app, BrowserWindow, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Register all IPC handlers for main-renderer communication
 */
export function registerIPCHandlers(mainWindow: BrowserWindow): void {
  // ===================================
  // System Operations
  // ===================================

  // Get app version
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

  // Get app path
  ipcMain.handle('app:get-path', (_event, name: string) => {
    return app.getPath(name as any);
  });

  // Open external URL
  ipcMain.handle('shell:open-external', async (_event, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Show item in folder
  ipcMain.handle('shell:show-item-in-folder', (_event, fullPath: string) => {
    shell.showItemInFolder(fullPath);
  });

  // Open path in system file manager
  ipcMain.handle('shell:open-path', async (_event, filePath: string) => {
    const result = await shell.openPath(filePath);
    return { success: !result, error: result };
  });

  // ===================================
  // Window Operations
  // ===================================

  // Minimize window
  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize();
  });

  // Maximize/unmaximize window
  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return mainWindow.isMaximized();
  });

  // Close window
  ipcMain.handle('window:close', () => {
    mainWindow.close();
  });

  // Toggle fullscreen
  ipcMain.handle('window:toggle-fullscreen', () => {
    const isFullScreen = !mainWindow.isFullScreen();
    mainWindow.setFullScreen(isFullScreen);
    return isFullScreen;
  });

  // Get window state
  ipcMain.handle('window:get-state', () => {
    return {
      isMaximized: mainWindow.isMaximized(),
      isFullScreen: mainWindow.isFullScreen(),
      isMinimized: mainWindow.isMinimized(),
      bounds: mainWindow.getBounds()
    };
  });

  // Show window (unhide)
  ipcMain.handle('window:show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Hide window
  ipcMain.handle('window:hide', () => {
    mainWindow.hide();
  });

  // ===================================
  // Dialog Operations
  // ===================================

  // Show open dialog
  ipcMain.handle('dialog:open', async (_event, options: Electron.OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  });

  // Show save dialog
  ipcMain.handle('dialog:save', async (_event, options: Electron.SaveDialogOptions) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  });

  // Show message box
  ipcMain.handle('dialog:message', async (_event, options: Electron.MessageBoxOptions) => {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
  });

  // Show error box
  ipcMain.handle('dialog:error', (_event, title: string, content: string) => {
    dialog.showErrorBox(title, content);
  });

  // ===================================
  // File System Operations
  // ===================================

  // Read file
  ipcMain.handle('fs:read-file', async (_event, filePath: string, encoding: BufferEncoding = 'utf8') => {
    try {
      const data = await fs.promises.readFile(filePath, encoding);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Write file
  ipcMain.handle('fs:write-file', async (_event, filePath: string, data: string, encoding: BufferEncoding = 'utf8') => {
    try {
      await fs.promises.writeFile(filePath, data, encoding);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Check if file/directory exists
  ipcMain.handle('fs:exists', async (_event, filePath: string) => {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  });

  // ===================================
  // Notification Operations
  // ===================================

  // Show notification
  ipcMain.handle('notification:show', (_event, options: { title: string; body: string; silent?: boolean }) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        silent: options.silent
      });

      notification.show();

      notification.on('click', () => {
        mainWindow.show();
        mainWindow.focus();
      });

      return { success: true };
    }
    return { success: false, error: 'Notifications not supported' };
  });

  // ===================================
  // Store Operations (Electron Store pattern)
  // ===================================

  const userDataPath = app.getPath('userData');
  const storePath = path.join(userDataPath, 'user-store.json');

  // Load store
  const loadStore = (): Record<string, any> => {
    try {
      if (fs.existsSync(storePath)) {
        const data = fs.readFileSync(storePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load store:', error);
    }
    return {};
  };

  // Save store
  const saveStore = (store: Record<string, any>): void => {
    try {
      const dir = path.dirname(storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
    } catch (error) {
      console.error('Failed to save store:', error);
    }
  };

  // Get value from store
  ipcMain.handle('store:get', (_event, key: string) => {
    const store = loadStore();
    return store[key];
  });

  // Set value in store
  ipcMain.handle('store:set', (_event, key: string, value: any) => {
    const store = loadStore();
    store[key] = value;
    saveStore(store);
    return { success: true };
  });

  // Delete value from store
  ipcMain.handle('store:delete', (_event, key: string) => {
    const store = loadStore();
    delete store[key];
    saveStore(store);
    return { success: true };
  });

  // Clear entire store
  ipcMain.handle('store:clear', () => {
    saveStore({});
    return { success: true };
  });

  // Get all store keys
  ipcMain.handle('store:keys', () => {
    const store = loadStore();
    return Object.keys(store);
  });

  // ===================================
  // Clipboard Operations
  // ===================================

  // Note: These are available in renderer via navigator.clipboard
  // But we can add them here if needed for special cases

  // ===================================
  // Database/API Communication
  // ===================================

  // Send request to API server (for offline-first pattern)
  ipcMain.handle('api:request', async (_event, options: {
    method: string;
    endpoint: string;
    body?: any;
    headers?: Record<string, string>;
  }) => {
    // This will be implemented to communicate with the local API server
    // For now, return a placeholder
    return {
      success: false,
      error: 'API communication not yet implemented'
    };
  });

  // ===================================
  // Development Tools
  // ===================================

  // Toggle DevTools
  ipcMain.handle('dev:toggle-devtools', () => {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  });

  // Reload window
  ipcMain.handle('dev:reload', () => {
    mainWindow.reload();
  });

  // ===================================
  // Ping Test
  // ===================================

  ipcMain.on('ping', (event) => {
    event.reply('pong');
  });
}

/**
 * Remove all IPC handlers (cleanup)
 */
export function unregisterIPCHandlers(): void {
  const channels = [
    'app:get-version',
    'app:get-path',
    'shell:open-external',
    'shell:show-item-in-folder',
    'shell:open-path',
    'window:minimize',
    'window:maximize',
    'window:close',
    'window:toggle-fullscreen',
    'window:get-state',
    'window:show',
    'window:hide',
    'dialog:open',
    'dialog:save',
    'dialog:message',
    'dialog:error',
    'fs:read-file',
    'fs:write-file',
    'fs:exists',
    'notification:show',
    'store:get',
    'store:set',
    'store:delete',
    'store:clear',
    'store:keys',
    'api:request',
    'dev:toggle-devtools',
    'dev:reload',
    'ping'
  ];

  channels.forEach(channel => {
    ipcMain.removeHandler(channel);
    ipcMain.removeAllListeners(channel);
  });
}
