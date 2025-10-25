import { Menu, MenuItem, BrowserWindow, app, shell } from 'electron';

export interface MenuOptions {
  mainWindow: BrowserWindow;
  onQuickCapture?: () => void;
}

/**
 * Create application menu
 */
export function createApplicationMenu(options: MenuOptions): Menu {
  const { mainWindow } = options;
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    // App Menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              {
                label: 'Preferences',
                accelerator: 'Cmd+,',
                click: () => {
                  mainWindow.webContents.send('menu:open-preferences');
                }
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),

    // File Menu
    {
      label: 'File',
      submenu: [
        {
          label: 'Quick Capture',
          accelerator: isMac ? 'Cmd+Shift+N' : 'Ctrl+Shift+N',
          click: () => {
            if (options.onQuickCapture) {
              options.onQuickCapture();
            }
            mainWindow.webContents.send('menu:quick-capture');
          }
        },
        { type: 'separator' },
        {
          label: 'New Transaction',
          accelerator: isMac ? 'Cmd+T' : 'Ctrl+T',
          click: () => {
            mainWindow.webContents.send('menu:new-transaction');
          }
        },
        {
          label: 'New Task',
          accelerator: isMac ? 'Cmd+K' : 'Ctrl+K',
          click: () => {
            mainWindow.webContents.send('menu:new-task');
          }
        },
        {
          label: 'New Note',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: () => {
            mainWindow.webContents.send('menu:new-note');
          }
        },
        { type: 'separator' },
        {
          label: 'Import Data',
          click: () => {
            mainWindow.webContents.send('menu:import-data');
          }
        },
        {
          label: 'Export Data',
          click: () => {
            mainWindow.webContents.send('menu:export-data');
          }
        },
        { type: 'separator' },
        ...(!isMac
          ? [
              {
                label: 'Preferences',
                accelerator: 'Ctrl+,',
                click: () => {
                  mainWindow.webContents.send('menu:open-preferences');
                }
              },
              { type: 'separator' as const }
            ]
          : []),
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },

    // Edit Menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const },
              { role: 'delete' as const },
              { role: 'selectAll' as const },
              { type: 'separator' as const },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' as const }, { role: 'stopSpeaking' as const }]
              }
            ]
          : [{ role: 'delete' as const }, { type: 'separator' as const }, { role: 'selectAll' as const }])
      ]
    },

    // View Menu
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: isMac ? 'Cmd+1' : 'Ctrl+1',
          click: () => {
            mainWindow.webContents.send('navigate', '/dashboard');
          }
        },
        { type: 'separator' },
        {
          label: 'Financial',
          accelerator: isMac ? 'Cmd+2' : 'Ctrl+2',
          click: () => {
            mainWindow.webContents.send('navigate', '/financial');
          }
        },
        {
          label: 'Health & Fitness',
          accelerator: isMac ? 'Cmd+3' : 'Ctrl+3',
          click: () => {
            mainWindow.webContents.send('navigate', '/health');
          }
        },
        {
          label: 'Schedule & Tasks',
          accelerator: isMac ? 'Cmd+4' : 'Ctrl+4',
          click: () => {
            mainWindow.webContents.send('navigate', '/schedule');
          }
        },
        {
          label: 'Knowledge Graph',
          accelerator: isMac ? 'Cmd+5' : 'Ctrl+5',
          click: () => {
            mainWindow.webContents.send('navigate', '/graph');
          }
        },
        { type: 'separator' },
        {
          label: 'Search',
          accelerator: isMac ? 'Cmd+F' : 'Ctrl+F',
          click: () => {
            mainWindow.webContents.send('menu:search');
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Window Menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const }
            ]
          : [{ role: 'close' as const }])
      ]
    },

    // Help Menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/personal-dashboard#readme');
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/personal-dashboard/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            mainWindow.webContents.send('menu:check-updates');
          }
        },
        ...(!isMac
          ? [
              { type: 'separator' as const },
              {
                label: 'About',
                click: () => {
                  mainWindow.webContents.send('menu:about');
                }
              }
            ]
          : [])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  return menu;
}

/**
 * Create context menu for text selection
 */
export function createContextMenu(): Menu {
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: 'Cut',
      role: 'cut'
    })
  );

  menu.append(
    new MenuItem({
      label: 'Copy',
      role: 'copy'
    })
  );

  menu.append(
    new MenuItem({
      label: 'Paste',
      role: 'paste'
    })
  );

  menu.append(
    new MenuItem({
      type: 'separator'
    })
  );

  menu.append(
    new MenuItem({
      label: 'Select All',
      role: 'selectAll'
    })
  );

  return menu;
}

/**
 * Set up context menu for right-clicks
 */
export function setupContextMenu(window: BrowserWindow): void {
  window.webContents.on('context-menu', (_event, params) => {
    const menu = createContextMenu();

    // Only show menu if there's selected text or editable content
    if (params.selectionText || params.isEditable) {
      menu.popup({ window });
    }
  });
}
