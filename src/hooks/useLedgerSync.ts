import { useState, useEffect, useCallback, useRef } from 'react';

export type LedgerSeverityLevel = 'NORMAL' | 'ADVISORY' | 'DEVIATION' | 'CRITICAL_BREACH';

export interface LedgerEntryInput {
  site_id: string;
  terminal_id: string;
  operator_user_id: string;
  operator_name?: string;
  taxonomy_tag_id: string;
  asset_serial_number?: string;
  measurement_key: string;
  measurement_value: number;
  min_threshold: number;
  max_threshold?: number;
  unit?: string;
  severity?: LedgerSeverityLevel;
  latitude?: number;
  longitude?: number;
  location_description?: string;
  photo_evidence_url?: string;
  capa_action_taken?: string;
}

export interface OfflineLedgerRecord extends LedgerEntryInput {
  client_uuid: string;
  recorded_at_local: string;
  digital_signature_hash: string;
  is_offline_captured: boolean;
  sync_attempts?: number;
}

export interface SyncResult {
  success: boolean;
  total_synced: number;
  critical_breaches_count: number;
  deviations_count: number;
  gap_warnings: string[];
  defensibility_status: string;
  cloud_sync_timestamp?: string;
  error?: string;
}

const DB_NAME = 'MeloTwo_Defensibility_Ledger_DB';
const STORE_NAME = 'offline_ledger_queue';
const DB_VERSION = 1;

/**
 * Initializes the browser IndexedDB instance for subterranean offline queuing
 */
function openLedgerDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'client_uuid' });
        store.createIndex('recorded_at_local', 'recorded_at_local', { unique: false });
        store.createIndex('site_id', 'site_id', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Computes a SHA-256 digital signature hash for record integrity
 */
async function computeSha256Signature(dataString: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback pseudorandom hash if subtle crypto unavailable
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sha256-fallback-${Math.abs(hash).toString(16)}-${Date.now().toString(16)}`;
}

export function useLedgerSync(terminalId: string = 'TAB-SHAFT-3-UG', siteId: string = 'SITE-WIT-01') {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<Date | null>(null);

  const syncingRef = useRef<boolean>(false);

  // Refresh offline queue count from IndexedDB
  const refreshQueueCount = useCallback(async () => {
    try {
      const db = await openLedgerDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        setOfflineQueueCount(countRequest.result || 0);
      };
    } catch {
      // Ignore in non-browser env
    }
  }, []);

  // Save record to local IndexedDB
  const saveToIndexedDB = useCallback(async (record: OfflineLedgerRecord): Promise<void> => {
    const db = await openLedgerDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => {
        refreshQueueCount();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }, [refreshQueueCount]);

  // Read all pending offline records from IndexedDB
  const getAllPendingRecords = useCallback(async (): Promise<OfflineLedgerRecord[]> => {
    const db = await openLedgerDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }, []);

  // Delete synced records from IndexedDB by UUID array
  const removeSyncedRecords = useCallback(async (uuids: string[]): Promise<void> => {
    if (!uuids || uuids.length === 0) return;
    const db = await openLedgerDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      for (const id of uuids) {
        store.delete(id);
      }

      transaction.oncomplete = () => {
        refreshQueueCount();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }, [refreshQueueCount]);

  // Main background / manual sync trigger
  const syncPendingRecords = useCallback(async (): Promise<SyncResult | null> => {
    if (syncingRef.current) return null;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        total_synced: 0,
        critical_breaches_count: 0,
        deviations_count: 0,
        gap_warnings: [],
        defensibility_status: 'OFFLINE_QUEUED',
        error: 'Terminal is currently offline subterranean'
      };
    }

    try {
      syncingRef.current = true;
      setIsSyncing(true);

      const pending = await getAllPendingRecords();
      if (pending.length === 0) {
        setIsSyncing(false);
        syncingRef.current = false;
        return null;
      }

      const payload = {
        site_id: siteId,
        terminal_id: terminalId,
        records: pending
      };

      const response = await fetch('/api/v1/ledger/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Sync API responded with status ${response.status}`);
      }

      const data = await response.json();
      
      // Evict successfully synced UUIDs from client queue
      if (data.synced_uuids && Array.isArray(data.synced_uuids)) {
        await removeSyncedRecords(data.synced_uuids);
      }

      const result: SyncResult = {
        success: true,
        total_synced: data.total_synced || 0,
        critical_breaches_count: data.critical_breaches_count || 0,
        deviations_count: data.deviations_count || 0,
        gap_warnings: data.gap_warnings || [],
        defensibility_status: data.defensibility_status || 'STATUTORILY_DEFENDED',
        cloud_sync_timestamp: data.cloud_sync_timestamp
      };

      setLastSyncResult(result);
      setLastSyncTimestamp(new Date());
      await refreshQueueCount();
      return result;

    } catch (err: any) {
      const failResult: SyncResult = {
        success: false,
        total_synced: 0,
        critical_breaches_count: 0,
        deviations_count: 0,
        gap_warnings: [],
        defensibility_status: 'SYNC_ERROR',
        error: err.message || 'Network sync error'
      };
      setLastSyncResult(failResult);
      return failResult;
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [getAllPendingRecords, removeSyncedRecords, refreshQueueCount, siteId, terminalId]);

  // Primary capture function: logs a compliance point (online or offline)
  const recordComplianceLog = useCallback(async (
    input: LedgerEntryInput
  ): Promise<OfflineLedgerRecord> => {
    const clientUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const recordedAtLocal = new Date().toISOString();
    const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

    // Build raw payload for digital signature
    const signaturePayload = `${clientUuid}|${input.site_id}|${input.terminal_id}|${input.taxonomy_tag_id}|${input.measurement_value}|${recordedAtLocal}`;
    const digitalSignature = await computeSha256Signature(signaturePayload);

    // Dynamic severity auto-classification
    let calculatedSeverity: LedgerSeverityLevel = input.severity || 'NORMAL';
    if (input.measurement_value < input.min_threshold) {
      if (input.min_threshold - input.measurement_value > 10) {
        calculatedSeverity = 'CRITICAL_BREACH';
      } else {
        calculatedSeverity = 'DEVIATION';
      }
    } else if (input.max_threshold !== undefined && input.measurement_value > input.max_threshold) {
      calculatedSeverity = 'DEVIATION';
    }

    const record: OfflineLedgerRecord = {
      ...input,
      client_uuid: clientUuid,
      recorded_at_local: recordedAtLocal,
      digital_signature_hash: digitalSignature,
      is_offline_captured: !isCurrentlyOnline,
      severity: calculatedSeverity
    };

    // 1. Always write to IndexedDB first for write-ahead resilience
    await saveToIndexedDB(record);

    // 2. If online, immediately trigger batch sync in background
    if (isCurrentlyOnline) {
      syncPendingRecords().catch(console.error);
    }

    return record;
  }, [saveToIndexedDB, syncPendingRecords]);

  // Event Listeners for browser online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when connectivity returns
      syncPendingRecords().catch(console.error);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      refreshQueueCount();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [syncPendingRecords, refreshQueueCount]);

  return {
    isOnline,
    isSyncing,
    offlineQueueCount,
    lastSyncResult,
    lastSyncTimestamp,
    recordComplianceLog,
    syncPendingRecords,
    refreshQueueCount
  };
}

export default useLedgerSync;
