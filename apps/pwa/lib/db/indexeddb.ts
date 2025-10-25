/**
 * IndexedDB Storage Layer
 *
 * Provides offline-first data storage using IndexedDB for PWA functionality.
 * Supports background sync, conflict resolution, and data versioning.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema definition
interface DashboardDB extends DBSchema {
  // Financial data
  transactions: {
    key: string;
    value: {
      id: string;
      amount: number;
      category: string;
      description: string;
      date: string;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number;
      version: number;
    };
    indexes: { 'by-date': string; 'by-sync-status': string };
  };

  // Health data
  meals: {
    key: string;
    value: {
      id: string;
      name: string;
      calories: number;
      date: string;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number;
      version: number;
    };
    indexes: { 'by-date': string; 'by-sync-status': string };
  };

  workouts: {
    key: string;
    value: {
      id: string;
      type: string;
      duration: number;
      date: string;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number;
      version: number;
    };
    indexes: { 'by-date': string; 'by-sync-status': string };
  };

  // Schedule data
  tasks: {
    key: string;
    value: {
      id: string;
      title: string;
      completed: boolean;
      priority: string;
      dueDate?: string;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number;
      version: number;
    };
    indexes: { 'by-due-date': string; 'by-sync-status': string };
  };

  events: {
    key: string;
    value: {
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number;
      version: number;
    };
    indexes: { 'by-start-time': string; 'by-sync-status': string };
  };

  // Sync queue for offline actions
  syncQueue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      collection: string;
      data: any;
      timestamp: number;
      retryCount: number;
      lastError?: string;
    };
    indexes: { 'by-timestamp': number };
  };

  // Metadata and configuration
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
      lastUpdated: number;
    };
  };
}

const DB_NAME = 'personal-dashboard-db';
const DB_VERSION = 1;

// Define valid store names as a union type
type ValidStoreName = 'transactions' | 'meals' | 'workouts' | 'tasks' | 'events' | 'syncQueue' | 'metadata';

let dbInstance: IDBPDatabase<DashboardDB> | null = null;

/**
 * Initialize IndexedDB database
 */
export async function initializeDB(): Promise<IDBPDatabase<DashboardDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<DashboardDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`[IndexedDB] Upgrading database from v${oldVersion} to v${newVersion}`);

      // Create transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transactionStore.createIndex('by-date', 'date');
        transactionStore.createIndex('by-sync-status', 'syncStatus');
      }

      // Create meals store
      if (!db.objectStoreNames.contains('meals')) {
        const mealStore = db.createObjectStore('meals', { keyPath: 'id' });
        mealStore.createIndex('by-date', 'date');
        mealStore.createIndex('by-sync-status', 'syncStatus');
      }

      // Create workouts store
      if (!db.objectStoreNames.contains('workouts')) {
        const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
        workoutStore.createIndex('by-date', 'date');
        workoutStore.createIndex('by-sync-status', 'syncStatus');
      }

      // Create tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-due-date', 'dueDate');
        taskStore.createIndex('by-sync-status', 'syncStatus');
      }

      // Create events store
      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', { keyPath: 'id' });
        eventStore.createIndex('by-start-time', 'startTime');
        eventStore.createIndex('by-sync-status', 'syncStatus');
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncQueueStore.createIndex('by-timestamp', 'timestamp');
      }

      // Create metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
    blocked() {
      console.warn('[IndexedDB] Database blocked - close other tabs');
    },
    blocking() {
      console.warn('[IndexedDB] Database blocking - closing connection');
      dbInstance?.close();
      dbInstance = null;
    }
  });

  return dbInstance;
}

/**
 * Get database instance
 */
export async function getDB(): Promise<IDBPDatabase<DashboardDB>> {
  if (!dbInstance) {
    return initializeDB();
  }
  return dbInstance;
}

/**
 * Generic CRUD operations
 */
export class OfflineStore<T extends ValidStoreName> {
  constructor(private storeName: T) {}

  async get(id: string): Promise<DashboardDB[T]['value'] | undefined> {
    const db = await getDB();
    return db.get(this.storeName, id);
  }

  async getAll(): Promise<Array<DashboardDB[T]['value']>> {
    const db = await getDB();
    return db.getAll(this.storeName);
  }

  async add(item: DashboardDB[T]['value']): Promise<string> {
    const db = await getDB();
    return db.add(this.storeName, item);
  }

  async put(item: DashboardDB[T]['value']): Promise<string> {
    const db = await getDB();
    return db.put(this.storeName, item);
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    return db.delete(this.storeName, id);
  }

  async clear(): Promise<void> {
    const db = await getDB();
    return db.clear(this.storeName);
  }

  async count(): Promise<number> {
    const db = await getDB();
    return db.count(this.storeName);
  }

  async getByIndex(
    indexName: string,
    query: IDBValidKey | IDBKeyRange
  ): Promise<Array<DashboardDB[T]['value']>> {
    const db = await getDB();
    return db.getAllFromIndex(this.storeName, indexName as any, query as any);
  }
}

/**
 * Get items pending sync
 */
export async function getPendingSync<T extends ValidStoreName>(
  storeName: T
): Promise<Array<DashboardDB[T]['value']>> {
  const db = await getDB();
  const index = db.transaction(storeName).store.index('by-sync-status' as any);
  return index.getAll('pending' as any);
}

/**
 * Mark item as synced
 */
export async function markAsSynced<T extends ValidStoreName>(
  storeName: T,
  id: string
): Promise<void> {
  const db = await getDB();
  const item = await db.get(storeName, id);
  if (item) {
    (item as any).syncStatus = 'synced';
    (item as any).lastModified = Date.now();
    await db.put(storeName, item);
  }
}

/**
 * Mark item as failed sync
 */
export async function markAsSyncFailed<T extends ValidStoreName>(
  storeName: T,
  id: string,
  error: string
): Promise<void> {
  const db = await getDB();
  const item = await db.get(storeName, id);
  if (item) {
    (item as any).syncStatus = 'failed';
    (item as any).lastError = error;
    (item as any).lastModified = Date.now();
    await db.put(storeName, item);
  }
}

/**
 * Add to sync queue
 */
export async function addToSyncQueue(
  action: 'create' | 'update' | 'delete',
  collection: string,
  data: any
): Promise<void> {
  const db = await getDB();
  const id = `${collection}-${data.id}-${Date.now()}`;

  await db.add('syncQueue', {
    id,
    action,
    collection,
    data,
    timestamp: Date.now(),
    retryCount: 0
  });
}

/**
 * Get sync queue items
 */
export async function getSyncQueue(): Promise<Array<DashboardDB['syncQueue']['value']>> {
  const db = await getDB();
  return db.getAllFromIndex('syncQueue', 'by-timestamp');
}

/**
 * Remove from sync queue
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

/**
 * Update sync queue item retry count
 */
export async function incrementSyncRetry(id: string, error: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    item.retryCount++;
    item.lastError = error;
    await db.put('syncQueue', item);
  }
}

/**
 * Metadata operations
 */
export async function setMetadata(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('metadata', {
    key,
    value,
    lastUpdated: Date.now()
  });
}

export async function getMetadata(key: string): Promise<any> {
  const db = await getDB();
  const item = await db.get('metadata', key);
  return item?.value;
}

/**
 * Clear all data (for testing or reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const storeNames: ValidStoreName[] = [
    'transactions',
    'meals',
    'workouts',
    'tasks',
    'events',
    'syncQueue',
    'metadata'
  ];

  for (const storeName of storeNames) {
    await db.clear(storeName);
  }
}

/**
 * Get database statistics
 */
export async function getDBStats(): Promise<{
  transactions: number;
  meals: number;
  workouts: number;
  tasks: number;
  events: number;
  syncQueue: number;
  pendingSync: number;
}> {
  const db = await getDB();

  const [
    transactions,
    meals,
    workouts,
    tasks,
    events,
    syncQueue
  ] = await Promise.all([
    db.count('transactions'),
    db.count('meals'),
    db.count('workouts'),
    db.count('tasks'),
    db.count('events'),
    db.count('syncQueue')
  ]);

  // Count pending sync items across all stores
  const pendingSync = await Promise.all([
    db.getAllFromIndex('transactions', 'by-sync-status', 'pending'),
    db.getAllFromIndex('meals', 'by-sync-status', 'pending'),
    db.getAllFromIndex('workouts', 'by-sync-status', 'pending'),
    db.getAllFromIndex('tasks', 'by-sync-status', 'pending'),
    db.getAllFromIndex('events', 'by-sync-status', 'pending')
  ]).then(results => results.reduce((sum, arr) => sum + arr.length, 0));

  return {
    transactions,
    meals,
    workouts,
    tasks,
    events,
    syncQueue,
    pendingSync
  };
}
