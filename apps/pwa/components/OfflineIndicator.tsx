import { useState, useEffect } from 'react';
import { getSyncManager, SyncResult } from '../lib/sync/offline-sync';
import { getDBStats } from '../lib/db/indexeddb';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState({ synced: 0, failed: 0, pending: 0 });
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine);

    // Load initial stats
    loadStats();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync events
    const syncManager = getSyncManager();
    const handleSyncResult = (result: SyncResult) => {
      setIsSyncing(false);
      setLastSyncResult(result);
      loadStats();

      // Auto-hide success message after 3 seconds
      if (result.success) {
        setTimeout(() => setLastSyncResult(null), 3000);
      }
    };

    syncManager.addListener(handleSyncResult);

    // Check sync status periodically
    const interval = setInterval(() => {
      setIsSyncing(syncManager.isSyncInProgress());
      loadStats();
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncManager.removeListener(handleSyncResult);
      clearInterval(interval);
    };
  }, []);

  const loadStats = async () => {
    try {
      const stats = await getDBStats();
      setSyncStats({
        synced: 0, // This would need to be tracked separately
        failed: 0,
        pending: stats.pendingSync
      });
    } catch (error) {
      console.error('[OfflineIndicator] Failed to load stats:', error);
    }
  };

  const handleForceSync = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    const syncManager = getSyncManager();
    await syncManager.forceSyncNow();
  };

  if (isOnline && syncStats.pending === 0 && !lastSyncResult) {
    return null; // Don't show indicator when online and nothing to sync
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
          rounded-lg shadow-lg backdrop-blur-md transition-all duration-300
          ${isOnline ? 'bg-green-900/90' : 'bg-red-900/90'}
          ${showDetails ? 'w-80' : 'w-auto'}
        `}
      >
        {/* Main Status Bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          {/* Status Indicator */}
          <div className="relative">
            <div
              className={`
                w-3 h-3 rounded-full
                ${isOnline ? 'bg-green-400' : 'bg-red-400'}
                ${isOnline && 'animate-pulse'}
              `}
            />
            {isSyncing && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping" />
            )}
          </div>

          {/* Status Text */}
          <div className="flex-1 text-sm font-medium text-white">
            {isSyncing ? (
              <span>Syncing...</span>
            ) : isOnline ? (
              syncStats.pending > 0 ? (
                <span>{syncStats.pending} items to sync</span>
              ) : (
                <span>All synced</span>
              )
            ) : (
              <span>Offline Mode</span>
            )}
          </div>

          {/* Expand Icon */}
          <div className="text-white text-xs">
            {showDetails ? '▼' : '▶'}
          </div>
        </div>

        {/* Details Panel */}
        {showDetails && (
          <div className="border-t border-white/20 px-4 py-3 space-y-3">
            {/* Sync Statistics */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Status:</span>
                <span className="font-medium text-white">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Pending:</span>
                <span className="font-medium text-white">{syncStats.pending}</span>
              </div>
              {lastSyncResult && (
                <>
                  <div className="flex justify-between text-white/80">
                    <span>Last Sync:</span>
                    <span className="font-medium text-white">
                      {lastSyncResult.synced} synced, {lastSyncResult.failed} failed
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Errors */}
            {lastSyncResult && lastSyncResult.errors.length > 0 && (
              <div className="bg-red-950/50 rounded p-2">
                <div className="text-xs font-medium text-red-200 mb-1">Sync Errors:</div>
                <div className="text-xs text-red-300 space-y-1">
                  {lastSyncResult.errors.slice(0, 3).map((error, i) => (
                    <div key={i} className="truncate">{error}</div>
                  ))}
                  {lastSyncResult.errors.length > 3 && (
                    <div>+{lastSyncResult.errors.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleForceSync}
                disabled={!isOnline || isSyncing || syncStats.pending === 0}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium rounded
                  transition-all duration-200
                  ${
                    !isOnline || isSyncing || syncStats.pending === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:bg-gray-100 active:scale-95'
                  }
                `}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>

            {/* Info Text */}
            <div className="text-xs text-white/60 text-center">
              {isOnline
                ? 'Auto-sync enabled'
                : 'Changes will sync when online'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
