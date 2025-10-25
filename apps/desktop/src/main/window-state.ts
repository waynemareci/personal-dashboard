import { BrowserWindow, screen, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
  isFullScreen?: boolean;
}

export interface WindowStateKeeperOptions {
  /**
   * The name of the window for state tracking
   */
  windowName: string;

  /**
   * Default width if no state exists
   */
  defaultWidth: number;

  /**
   * Default height if no state exists
   */
  defaultHeight: number;

  /**
   * Whether to save window state
   */
  persist?: boolean;
}

/**
 * Window state keeper utility
 * Saves and restores window position and size
 */
export class WindowStateKeeper {
  private state: WindowState;
  private windowName: string;
  private persist: boolean;
  private stateFilePath: string;
  private window: BrowserWindow | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(options: WindowStateKeeperOptions) {
    this.windowName = options.windowName;
    this.persist = options.persist !== false;

    // Path to state file
    this.stateFilePath = path.join(
      app.getPath('userData'),
      `window-state-${this.windowName}.json`
    );

    // Load saved state or use defaults
    this.state = this.loadState() || {
      width: options.defaultWidth,
      height: options.defaultHeight
    };

    // Ensure window is visible on screen
    this.ensureVisibleOnScreen();
  }

  /**
   * Load window state from disk
   */
  private loadState(): WindowState | null {
    if (!this.persist) {
      return null;
    }

    try {
      if (fs.existsSync(this.stateFilePath)) {
        const data = fs.readFileSync(this.stateFilePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`Failed to load window state for ${this.windowName}:`, error);
    }

    return null;
  }

  /**
   * Save window state to disk (debounced)
   */
  private saveState(): void {
    if (!this.persist || !this.window) {
      return;
    }

    // Clear previous timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Debounce save operation
    this.saveTimeout = setTimeout(() => {
      try {
        const bounds = this.window!.getBounds();
        const state: WindowState = {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          isMaximized: this.window!.isMaximized(),
          isFullScreen: this.window!.isFullScreen()
        };

        const dir = path.dirname(this.stateFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(this.stateFilePath, JSON.stringify(state, null, 2));
      } catch (error) {
        console.error(`Failed to save window state for ${this.windowName}:`, error);
      }
    }, 500);
  }

  /**
   * Ensure window is visible on at least one screen
   */
  private ensureVisibleOnScreen(): void {
    const displays = screen.getAllDisplays();
    let isVisible = false;

    if (this.state.x !== undefined && this.state.y !== undefined) {
      for (const display of displays) {
        const { x, y, width, height } = display.bounds;

        // Check if window center point is within display bounds
        const centerX = this.state.x + this.state.width / 2;
        const centerY = this.state.y + this.state.height / 2;

        if (
          centerX >= x &&
          centerX < x + width &&
          centerY >= y &&
          centerY < y + height
        ) {
          isVisible = true;
          break;
        }
      }
    }

    if (!isVisible) {
      // Reset to center of primary display
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize;

      this.state.x = Math.round((width - this.state.width) / 2);
      this.state.y = Math.round((height - this.state.height) / 2);
    }
  }

  /**
   * Get window state for BrowserWindow options
   */
  public getState(): WindowState {
    return { ...this.state };
  }

  /**
   * Track a window instance
   */
  public track(window: BrowserWindow): void {
    this.window = window;

    // Restore maximized/fullscreen state
    if (this.state.isMaximized) {
      window.maximize();
    }

    if (this.state.isFullScreen) {
      window.setFullScreen(true);
    }

    // Save state on various events
    window.on('resize', () => this.saveState());
    window.on('move', () => this.saveState());
    window.on('close', () => {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      this.saveState();
    });
  }

  /**
   * Manually trigger state save
   */
  public save(): void {
    this.saveState();
  }
}

/**
 * Factory function to create window state keeper
 */
export function createWindowStateKeeper(
  options: WindowStateKeeperOptions
): WindowStateKeeper {
  return new WindowStateKeeper(options);
}
