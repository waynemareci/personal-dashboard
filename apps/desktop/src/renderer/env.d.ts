/// <reference types="vite/client" />

import { ElectronAPI } from '@electron-toolkit/preload';
import { API } from '../preload/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
