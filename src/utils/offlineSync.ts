import { useState, useEffect, useCallback } from 'react';

/**
 * MeloTwo SHEQ Offline Synchronization Engine
 * Pure TypeScript & Native IndexedDB solution for offline safety audits,
 * inspections, and compliance form submissions.
 */

export interface PendingSyncItem {
  id?: number;
  timestamp: number;
  endpoint: string;
  payload: any;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  errorDetails?: string;
}

const DB_NAME = 'MeloTwo_Offline_DB';
const DB_VERSION = 1;
const STORE_NAME = 'pending_logs';

let dbInstance: IDBDatabase | null = null;
const listeners = new Set<() => void>();

function notifySubscribers() {
  listeners.forEach(cb => cb());
}

/**
 * Initialize IndexedDB Object Store
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('endpoint', 'endpoint', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      reject(error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Save a safety audit/form submission offline into IndexedDB when connectivity is lost.
 */
export async function saveLogOffline(data: any, endpoint: string = '/api/audit/sync'): Promise<number> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record: Omit<PendingSyncItem, 'id'> = {
        timestamp: Date.now(),
        endpoint,
        payload: data,
        retryCount: 0,
        status: 'pending'
      };

      const request = store.add(record);

      request.onsuccess = (event) => {
        const generatedId = (event.target as IDBRequest).result as number;
        notifySubscribers();
        
        // If back online unexpectedly, trigger immediate background flush
        if (navigator.onLine) {
          syncPendingLogs(endpoint).catch(() => {});
        }
        
        resolve(generatedId);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error || new Error('Failed to save log offline'));
      };
    });
  } catch (err) {
    console.error('[OfflineSync] Error saving log to IndexedDB:', err);
    throw err;
  }
}

/**
 * Get all current pending offline logs.
 */
export async function getPendingLogs(): Promise<PendingSyncItem[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to read pending logs'));
      };
    });
  } catch {
    return [];
  }
}

/**
 * Count total pending sync records.
 */
export async function getPendingCount(): Promise<number> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result || 0);
      };

      request.onerror = () => {
        resolve(0);
      };
    });
  } catch {
    return 0;
  }
}

/**
 * Delete a synced record from IndexedDB.
 */
async function deletePendingLog(id: number): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      notifySubscribers();
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Update a record status/retry count.
 */
async function updatePendingLog(item: PendingSyncItem): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => {
      notifySubscribers();
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

let isSyncingActive = false;

/**
 * Automatically or manually flushes pending offline logs to the server.
 */
export async function syncPendingLogs(defaultEndpoint: string = '/api/audit/sync'): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine || isSyncingActive) {
    return { synced: 0, failed: 0 };
  }

  isSyncingActive = true;
  let syncedCount = 0;
  let failedCount = 0;

  try {
    const pendingLogs = await getPendingLogs();
    if (pendingLogs.length === 0) {
      isSyncingActive = false;
      return { synced: 0, failed: 0 };
    }

    for (const item of pendingLogs) {
      if (!item.id) continue;

      const targetEndpoint = item.endpoint || defaultEndpoint;
      
      try {
        item.status = 'syncing';
        await updatePendingLog(item);

        const response = await fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MeloTwo-Offline-Sync': 'true',
            'X-MeloTwo-Sync-Timestamp': item.timestamp.toString()
          },
          body: JSON.stringify(item.payload)
        });

        if (response.ok) {
          await deletePendingLog(item.id);
          syncedCount++;
        } else {
          item.retryCount = (item.retryCount || 0) + 1;
          item.status = item.retryCount > 5 ? 'failed' : 'pending';
          item.errorDetails = `HTTP ${response.status}: ${response.statusText}`;
          await updatePendingLog(item);
          failedCount++;
        }
      } catch (err: any) {
        item.retryCount = (item.retryCount || 0) + 1;
        item.status = item.retryCount > 5 ? 'failed' : 'pending';
        item.errorDetails = err.message || 'Network exception during sync';
        await updatePendingLog(item);
        failedCount++;
      }
    }
  } finally {
    isSyncingActive = false;
    notifySubscribers();
  }

  return { synced: syncedCount, failed: failedCount };
}

/**
 * Attach global event listeners for seamless background synchronization.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineSync] Network status changed to ONLINE. Initializing queue flush...');
    notifySubscribers();
    syncPendingLogs().catch(err => console.error('[OfflineSync] Auto-sync exception:', err));
  });

  window.addEventListener('offline', () => {
    console.log('[OfflineSync] Network status changed to OFFLINE. Offline engine active.');
    notifySubscribers();
  });

  // Pre-initialize IndexedDB
  initDB().catch(() => {});
}

/**
 * Lightweight React Hook providing online/offline status and pending sync queue metrics.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshState = useCallback(async () => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    refreshState();

    const handleNetworkChange = () => {
      refreshState();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    listeners.add(refreshState);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      listeners.delete(refreshState);
    };
  }, [refreshState]);

  const triggerManualSync = useCallback(async (endpoint?: string) => {
    setIsSyncing(true);
    try {
      const result = await syncPendingLogs(endpoint);
      await refreshState();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshState]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncNow: triggerManualSync,
    saveOffline: saveLogOffline,
    getPendingLogs
  };
}
