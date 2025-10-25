import '@testing-library/jest-dom';

// Mock Electron APIs
Object.assign(global, {
  electronAPI: {
    ping: () => Promise.resolve('pong'),
    getAppVersion: () => Promise.resolve('1.0.0')
  }
});

// Mock window.electronAPI for renderer process
Object.defineProperty(window, 'electronAPI', {
  value: global.electronAPI,
  writable: true
});