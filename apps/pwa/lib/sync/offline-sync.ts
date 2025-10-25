/**
 * Offline Sync Manager
 *
 * Handles background synchronization of offline actions when connectivity returns.
 * Implements retry logic, conflict resolution, and sync status tracking.
 */

import {
  getSyncQueue,
  removeFromSyncQueue,
  incrementSyncRetry,
  markAsSynced,
  markAsSyncFailed,
  getDB
} from '../db/indexeddb';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Sync manager class
 */
export class OfflineSyncManager {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(result: SyncResult) => void> = new Set();

  /**
   * Start automatic sync on network reconnection
   */
  startAutoSync(): void {
    if (typeof window === 'undefined') return;

    // Listen for online event
    window.addEventListener('online', () => {
      console.log('[OfflineSync] Network online - starting sync');
      this.sync();
    });

    // Periodic sync check (every 5 minutes)
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, 5 * 60 * 1000);

    // Initial sync if online
    if (navigator.onLine) {
      this.sync();
    }
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Add sync listener
   */
  addListener(listener: (result: SyncResult) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove sync listener
   */
  removeListener(listener: (result: SyncResult) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(result: SyncResult): void {
    this.listeners.forEach(listener => listener(result));
  }

  /**
   * Main sync function
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[OfflineSync] Sync already in progress');
      return { success: false, synced: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    if (!navigator.onLine) {
      console.log('[OfflineSync] Offline - skipping sync');
      return { success: false, synced: 0, failed: 0, errors: ['Device is offline'] };
    }

    this.isSyncing = true;
    const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

    try {
      console.log('[OfflineSync] Starting sync...');
      const queue = await getSyncQueue();

      if (queue.length === 0) {
        console.log('[OfflineSync] No items to sync');
        return result;
      }

      console.log(`[OfflineSync] Syncing ${queue.length} items`);

      for (const item of queue) {
        try {
          // Check retry limit
          if (item.retryCount >= MAX_RETRY_ATTEMPTS) {
            console.warn(`[OfflineSync] Max retries reached for ${item.id}`);
            result.failed++;
            result.errors.push(`Max retries reached for ${item.id}`);
            await removeFromSyncQueue(item.id);
            continue;
          }

          // Sync the item
          await this.syncItem(item);

          // Mark as synced in local store
          await markAsSynced(item.collection as any, item.data.id);

          // Remove from sync queue
          await removeFromSyncQueue(item.id);

          result.synced++;
          console.log(`[OfflineSync] Synced ${item.id}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[OfflineSync] Failed to sync ${item.id}:`, errorMessage);

          result.failed++;
          result.errors.push(`${item.id}: ${errorMessage}`);

          // Increment retry count
          await incrementSyncRetry(item.id, errorMessage);

          // Mark as failed in local store
          await markAsSyncFailed(item.collection as any, item.data.id, errorMessage);
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }

      result.success = result.failed === 0;
      console.log(`[OfflineSync] Sync complete: ${result.synced} synced, ${result.failed} failed`);
    } catch (error) {
      console.error('[OfflineSync] Sync error:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isSyncing = false;
      this.notifyListeners(result);
    }

    return result;
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: any): Promise<void> {
    const { action, collection, data } = item;
    const endpoint = `${API_BASE_URL}/api/${collection}`;

    let response: Response;

    switch (action) {
      case 'create':
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;

      case 'update':
        response = await fetch(`${endpoint}/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;

      case 'delete':
        response = await fetch(`${endpoint}/${data.id}`, {
          method: 'DELETE'
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle conflict resolution for 409 responses
    if (response.status === 409) {
      const serverData = await response.json();
      await this.resolveConflict(collection, data, serverData);
    }
  }

  /**
   * Resolve conflicts between local and server data
   */
  private async resolveConflict(
    collection: string,
    localData: any,
    serverData: any
  ): Promise<void> {
    console.log('[OfflineSync] Resolving conflict for', collection, localData.id);

    // Simple conflict resolution: use the most recently modified version
    const localTime = localData.lastModified || 0;
    const serverTime = serverData.lastModified || 0;

    if (localTime > serverTime) {
      // Local version is newer, force update server
      const response = await fetch(`${API_BASE_URL}/api/${collection}/${localData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Force-Update': 'true'
        },
        body: JSON.stringify(localData)
      });

      if (!response.ok) {
        throw new Error('Failed to resolve conflict');
      }
    } else {
      // Server version is newer, update local
      const db = await getDB();
      await db.put(collection as any, {
        ...serverData,
        syncStatus: 'synced',
        lastModified: Date.now()
      });
    }
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<SyncResult> {
    return this.sync();
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

// Singleton instance
let syncManagerInstance: OfflineSyncManager | null = null;

/**
 * Get singleton sync manager instance
 */
export function getSyncManager(): OfflineSyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new OfflineSyncManager();
  }
  return syncManagerInstance;
}

/**
 * Initialize sync manager for PWA
 */
export function initializeSync(): void {
  if (typeof window === 'undefined') return;

  const manager = getSyncManager();
  manager.startAutoSync();

  // Register sync event for service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration: any) => {
      // Check if Background Sync API is supported
      if (registration.sync) {
        return registration.sync.register('sync-data');
      }
    }).catch((error: Error) => {
      console.error('[OfflineSync] Failed to register sync:', error);
    });
  }
}

/**
 * React hook for using sync manager
 */
export function useSyncManager() {
  return getSyncManager();
}
