import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom API for renderer process
const api = {
  // App Operations
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
    checkForUpdates: () => ipcRenderer.invoke('app:check-for-updates'),
    showQuickCapture: () => ipcRenderer.invoke('app:show-quick-capture')
  },

  // Shell Operations
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
    showItemInFolder: (path: string) => ipcRenderer.invoke('shell:show-item-in-folder', path),
    openPath: (path: string) => ipcRenderer.invoke('shell:open-path', path)
  },

  // Window Operations
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
    getState: () => ipcRenderer.invoke('window:get-state'),
    show: () => ipcRenderer.invoke('window:show'),
    hide: () => ipcRenderer.invoke('window:hide')
  },

  // Dialog Operations
  dialog: {
    showOpen: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('dialog:open', options),
    showSave: (options: Electron.SaveDialogOptions) => ipcRenderer.invoke('dialog:save', options),
    showMessage: (options: Electron.MessageBoxOptions) => ipcRenderer.invoke('dialog:message', options),
    showError: (title: string, content: string) => ipcRenderer.invoke('dialog:error', title, content)
  },

  // File System Operations
  fs: {
    readFile: (path: string, encoding?: BufferEncoding) =>
      ipcRenderer.invoke('fs:read-file', path, encoding),
    writeFile: (path: string, data: string, encoding?: BufferEncoding) =>
      ipcRenderer.invoke('fs:write-file', path, data, encoding),
    exists: (path: string) => ipcRenderer.invoke('fs:exists', path)
  },

  // Notification Operations
  notification: {
    show: (options: { title: string; body: string; silent?: boolean }) =>
      ipcRenderer.invoke('notification:show', options)
  },

  // Store Operations (Local Storage)
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
    clear: () => ipcRenderer.invoke('store:clear'),
    keys: () => ipcRenderer.invoke('store:keys')
  },

  // API Communication
  api: {
    request: (options: {
      method: string;
      endpoint: string;
      body?: any;
      headers?: Record<string, string>;
    }) => ipcRenderer.invoke('api:request', options)
  },

  // Development Tools
  dev: {
    toggleDevTools: () => ipcRenderer.invoke('dev:toggle-devtools'),
    reload: () => ipcRenderer.invoke('dev:reload')
  },

  // Event Listeners
  on: (channel: string, callback: (...args: any[]) => void) => {
    const subscription = (_event: IpcRendererEvent, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },

  once: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args: any[]) => callback(...args));
  },

  // Send messages
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args);
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error('Failed to expose APIs:', error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

// Export type for use in renderer
export type API = typeof api;
