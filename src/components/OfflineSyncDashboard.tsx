import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Database, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  PlusCircle, 
  GitCompare, 
  FileText, 
  Layers, 
  Activity, 
  Check, 
  X, 
  Pencil, 
  Terminal, 
  User, 
  ShieldAlert, 
  ArrowRight,
  Maximize2,
  Minimize2,
  Sliders
} from 'lucide-react';
import { OfflineAuditNoteItem, ConflictResolutionChoice } from './InspectorConflictResolver';
import { ComplianceLedgerRow } from '../types';

export type NoteSyncState = 'pending' | 'syncing' | 'synced' | 'conflict' | 'error';

interface OfflineSyncDashboardProps {
  offlineNotes: OfflineAuditNoteItem[];
  isOnline: boolean;
  isSimulatedOffline?: boolean;
  onCommitRecord: (record: ComplianceLedgerRow) => Promise<boolean>;
  onUpdateNotesList: (notes: OfflineAuditNoteItem[]) => void;
  onRequestResolveConflict: (note: OfflineAuditNoteItem) => void;
  onToggleSimulateOffline?: () => void;
  onClose?: () => void;
  currentUserDisplayName?: string;
}

export const OfflineSyncDashboard: React.FC<OfflineSyncDashboardProps> = ({
  offlineNotes,
  isOnline,
  isSimulatedOffline = false,
  onCommitRecord,
  onUpdateNotesList,
  onRequestResolveConflict,
  onToggleSimulateOffline,
  onClose,
  currentUserDisplayName = 'Statutory Field Inspector',
}) => {
  const isEffectivelyOnline = isOnline && !isSimulatedOffline;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'conflict'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'cards' | 'compact'>('cards');
  const [isExpanded, setIsExpanded] = useState(false);

  // In-line Note Editing State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // Batch Sync Execution & Progress Reporting State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCancelled, setSyncCancelled] = useState(false);
  const cancelSyncRef = useRef(false);

  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    currentNoteTitle: string;
    syncedCount: number;
    conflictCount: number;
    errorCount: number;
    startTime?: number;
    elapsedSeconds: number;
  }>({
    current: 0,
    total: 0,
    percent: 0,
    currentNoteTitle: '',
    syncedCount: 0,
    conflictCount: 0,
    errorCount: 0,
    elapsedSeconds: 0
  });

  // Granular Item-level Sync Statuses (noteId -> NoteSyncState)
  const [itemStatuses, setItemStatuses] = useState<Record<string, {
    state: NoteSyncState;
    timestamp?: number;
    errorMessage?: string;
  }>>({});

  // Feedback Notification Banner
  const [dashboardMessage, setDashboardMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  // Initialize and synchronize item statuses when offlineNotes change
  useEffect(() => {
    setItemStatuses(prev => {
      const next = { ...prev };
      offlineNotes.forEach(note => {
        if (!next[note.id]) {
          if (note.conflictDetected || note.modifiedPostOnline) {
            next[note.id] = { state: 'conflict' };
          } else {
            next[note.id] = { state: 'pending' };
          }
        } else if (note.conflictDetected || note.modifiedPostOnline) {
          next[note.id] = { state: 'conflict' };
        }
      });
      return next;
    });
  }, [offlineNotes]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const total = offlineNotes.length;
    const conflicts = offlineNotes.filter(n => n.conflictDetected || n.modifiedPostOnline).length;
    const ready = total - conflicts;
    
    // Estimate JSON localStorage storage size
    let storageBytes = 0;
    try {
      const raw = localStorage.getItem('melotwo_offline_audit_notes') || '';
      storageBytes = new Blob([raw]).size;
    } catch (e) {
      storageBytes = JSON.stringify(offlineNotes).length;
    }

    const storageSizeFormatted = storageBytes > 1024 
      ? `${(storageBytes / 1024).toFixed(1)} KB` 
      : `${storageBytes} B`;

    return { total, conflicts, ready, storageSizeFormatted };
  }, [offlineNotes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return offlineNotes.filter(note => {
      const isConflicted = note.conflictDetected || note.modifiedPostOnline;
      if (statusFilter === 'ready' && isConflicted) return false;
      if (statusFilter === 'conflict' && !isConflicted) return false;

      if (severityFilter !== 'all' && (note.severity || 'Medium') !== severityFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesText = note.text.toLowerCase().includes(query);
        const matchesOperator = (note.operator || '').toLowerCase().includes(query);
        const matchesTerminal = (note.terminalId || '').toLowerCase().includes(query);
        const matchesCategory = (note.category || '').toLowerCase().includes(query);
        const matchesVector = (note.violationVector || '').toLowerCase().includes(query);
        return matchesText || matchesOperator || matchesTerminal || matchesCategory || matchesVector;
      }

      return true;
    });
  }, [offlineNotes, statusFilter, severityFilter, searchTerm]);

  // Generate Sample Batch of Offline Audit Notes for Realistic Testing
  const handleGenerateSampleBatch = () => {
    const now = Date.now();
    const sampleBatch: OfflineAuditNoteItem[] = [
      {
        id: `offline-batch-${now}-1`,
        text: 'Shaft 4 intake velocity: 0.52 m/s verified compliant with SANS 10108. Standard airflow damper settings active. Auxiliary intake duct cleared of fine dust buildup.',
        timestamp: now - 1800000,
        date: new Date(now - 1800000).toISOString().split('T')[0],
        operator: currentUserDisplayName,
        terminalId: 'TERM-SHAFT-04',
        category: 'Underground Ventilation',
        severity: 'Low',
        status: 'Verified Compliant',
        violationVector: 'MHSA Statutory Airflow (SANS 10108)'
      },
      {
        id: `offline-batch-${now}-2`,
        text: 'Main Haulage Belt C-02: Emergency pull-wire lanyard tension slack measured at 180mm deflection (tolerance <= 100mm). Immediate tensioning required per statutory standard.',
        timestamp: now - 1440000,
        date: new Date(now - 1440000).toISOString().split('T')[0],
        operator: currentUserDisplayName,
        terminalId: 'TERM-HAULAGE-02',
        category: 'Haulage & Conveyor Systems',
        severity: 'High',
        status: 'Action Required',
        violationVector: 'MHSA Reg 8.8 Conveyor Belt Safety Devices'
      },
      {
        id: `offline-batch-${now}-3`,
        text: 'Flammable gas monitoring station G-12: Methane CH4 reading 0.08% vol, Carbon Monoxide CO reading 12 ppm. Catalytic pellistor bead sensor calibration due in 4 days.',
        timestamp: now - 900000,
        date: new Date(now - 900000).toISOString().split('T')[0],
        operator: currentUserDisplayName,
        terminalId: 'TERM-GAS-STAT-12',
        category: 'Atmospheric & Gas Monitoring',
        severity: 'Medium',
        status: 'Routine Inspection',
        violationVector: 'MHSA Chapter 9 Environmental Engineering'
      },
      {
        id: `offline-batch-${now}-4`,
        text: 'Substation B-West: Ex d flameproof enclosure bolt missing on terminal junction cover. High risk ignition source in Zone 1 boundary. Isolation tag #4412 applied.',
        timestamp: now - 600000,
        date: new Date(now - 600000).toISOString().split('T')[0],
        operator: currentUserDisplayName,
        terminalId: 'TERM-SUB-WEST',
        category: 'Electrical Subterranean Safety',
        severity: 'Critical',
        status: 'Stop Order Issued',
        violationVector: 'SANS 60079-1 Flameproof Enclosures (Ex d)'
      },
      {
        id: `offline-batch-${now}-5`,
        text: 'Level 14 Refuge Bay #3: Statutory life-support oxygen cylinder manifold pressure verified at 210 bar. Chemical CO2 scrubber cartridges expiration date valid through Q4 2027.',
        timestamp: now - 300000,
        date: new Date(now - 300000).toISOString().split('T')[0],
        operator: currentUserDisplayName,
        terminalId: 'TERM-REFUGE-14',
        category: 'Emergency Preparedness & Refuge',
        severity: 'Low',
        status: 'Verified Compliant',
        violationVector: 'MHSA Guideline for Safe Refuge Bays'
      }
    ];

    const currentNotes = [...offlineNotes];
    const combined = [...sampleBatch, ...currentNotes];
    localStorage.setItem('melotwo_offline_audit_notes', JSON.stringify(combined));
    onUpdateNotesList(combined);

    setDashboardMessage({
      text: `Generated 5 realistic statutory offline audit notes in localStorage buffer.`,
      type: 'info'
    });
    setTimeout(() => setDashboardMessage(null), 5000);
  };

  // Simulate Post-Online Conflict
  const handleSimulateConflict = () => {
    const now = Date.now();
    const conflictNote: OfflineAuditNoteItem = {
      id: `offline-conflict-${now}`,
      text: 'Ventilation Fan 3 Booster: [POST-ONLINE REVISION]: Thermal bearing sensor tripped at 14:15. Temporary airflow recirculation risk. Damper 2 locked open.',
      timestamp: now - 240000,
      lastModified: now - 20000,
      modifiedPostOnline: true,
      conflictDetected: true,
      conflictReason: 'Audit note in localStorage was modified after the app restored online connectivity.',
      date: new Date(now).toISOString().split('T')[0],
      operator: currentUserDisplayName,
      terminalId: 'TERM-FAN-03',
      category: 'Underground Ventilation',
      severity: 'Critical',
      status: 'Conflict Resolution Required',
      violationVector: 'MHSA Part X Underground Ventilation Safety',
      remoteSnapshot: {
        text: 'Ventilation Fan 3 Booster: Normal baseline operation at 48 m3/s. Registered by SCADA Surface Terminal.',
        timestamp: now - 120000,
        date: new Date(now).toISOString().split('T')[0],
        operator: 'Central Surface Dispatcher',
        terminalId: 'TERM-SCADA-SURFACE',
        category: 'Underground Ventilation',
        severity: 'Low',
        status: 'Verified Compliant',
        violationVector: 'MHSA Part X Underground Ventilation Safety'
      }
    };

    const combined = [conflictNote, ...offlineNotes];
    localStorage.setItem('melotwo_offline_audit_notes', JSON.stringify(combined));
    onUpdateNotesList(combined);

    setDashboardMessage({
      text: `Added conflicted audit note. Post-online conflict resolution is demonstrated.`,
      type: 'warning'
    });
    setTimeout(() => setDashboardMessage(null), 5000);
  };

  // Export Notes Backup as JSON file
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(offlineNotes, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `melotwo-offline-audit-notes-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDashboardMessage({
        text: `Exported ${offlineNotes.length} audit notes to backup JSON file.`,
        type: 'success'
      });
      setTimeout(() => setDashboardMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export notes backup:', err);
    }
  };

  // Clear All Notes in Buffer
  const handleClearAll = () => {
    if (window.confirm(`Are you sure you want to delete all ${offlineNotes.length} pending offline audit notes from localStorage? This cannot be undone.`)) {
      localStorage.removeItem('melotwo_offline_audit_notes');
      onUpdateNotesList([]);
      setItemStatuses({});
      setDashboardMessage({
        text: `Cleared all offline audit notes from localStorage buffer.`,
        type: 'info'
      });
      setTimeout(() => setDashboardMessage(null), 4000);
    }
  };

  // In-line Edit Save
  const handleSaveInlineEdit = (noteId: string) => {
    if (!editingText.trim()) return;
    const now = Date.now();
    const updated = offlineNotes.map(n => {
      if (n.id === noteId) {
        const isModifiedWhileOnline = isEffectivelyOnline;
        return {
          ...n,
          text: editingText.trim(),
          lastModified: now,
          modifiedPostOnline: isModifiedWhileOnline,
          conflictDetected: isModifiedWhileOnline,
          conflictReason: isModifiedWhileOnline ? 'Modified in localStorage after reconnecting online' : undefined,
          remoteSnapshot: isModifiedWhileOnline ? (n.remoteSnapshot || {
            text: n.text,
            timestamp: n.timestamp,
            operator: n.operator,
            terminalId: n.terminalId,
            severity: n.severity,
            status: n.status
          }) : undefined
        };
      }
      return n;
    });

    localStorage.setItem('melotwo_offline_audit_notes', JSON.stringify(updated));
    onUpdateNotesList(updated);
    setEditingNoteId(null);
    setEditingText('');

    setDashboardMessage({
      text: isEffectivelyOnline ? 'Note edited post-online: marked for conflict resolution.' : 'Note updated in localStorage.',
      type: isEffectivelyOnline ? 'warning' : 'success'
    });
    setTimeout(() => setDashboardMessage(null), 4000);
  };

  // Delete Individual Note
  const handleDeleteNote = (noteId: string) => {
    const updated = offlineNotes.filter(n => n.id !== noteId);
    if (updated.length > 0) {
      localStorage.setItem('melotwo_offline_audit_notes', JSON.stringify(updated));
    } else {
      localStorage.removeItem('melotwo_offline_audit_notes');
    }
    onUpdateNotesList(updated);
    setItemStatuses(prev => {
      const next = { ...prev };
      delete next[noteId];
      return next;
    });
  };

  // Individual Sync Single Note
  const handleSyncSingleNote = async (note: OfflineAuditNoteItem) => {
    if (!isEffectivelyOnline) {
      setDashboardMessage({
        text: 'Network offline. Connect to network or disable simulation to sync.',
        type: 'error'
      });
      return;
    }

    if (note.conflictDetected || note.modifiedPostOnline) {
      onRequestResolveConflict(note);
      return;
    }

    setItemStatuses(prev => ({
      ...prev,
      [note.id]: { state: 'syncing' }
    }));

    const ledgerRecord: ComplianceLedgerRow = {
      date: note.date || new Date(note.timestamp).toISOString().split('T')[0],
      operator: note.operator || currentUserDisplayName,
      terminalId: note.terminalId || 'TERM-UNDERGROUND',
      riskCategory: note.category || 'Field Audit Note',
      violationVector: note.violationVector || 'MHSA Statutory Offline Audit',
      severityLevel: note.severity || 'Medium',
      auditStatus: note.status || 'Action Required',
      detailedNotes: note.text
    };

    try {
      const success = await onCommitRecord(ledgerRecord);
      if (success) {
        setItemStatuses(prev => ({
          ...prev,
          [note.id]: { state: 'synced', timestamp: Date.now() }
        }));

        // Remove from list & localStorage after brief visual confirmation
        setTimeout(() => {
          handleDeleteNote(note.id);
        }, 1200);

        setDashboardMessage({
          text: `Audit note committed to Compliance Ledger.`,
          type: 'success'
        });
      } else {
        setItemStatuses(prev => ({
          ...prev,
          [note.id]: { state: 'error', errorMessage: 'Server rejected append' }
        }));
      }
    } catch (err: any) {
      setItemStatuses(prev => ({
        ...prev,
        [note.id]: { state: 'error', errorMessage: err?.message || 'Sync failed' }
      }));
    }
  };

  // BATCH SYNC ALL WITH VISUAL PROGRESS BAR & GRANULAR STATUS REPORTING
  const handleSyncAll = async () => {
    if (!isEffectivelyOnline) {
      setDashboardMessage({
        text: 'Cannot Sync All: Device is currently offline. Connect to network to commit records.',
        type: 'error'
      });
      return;
    }

    if (offlineNotes.length === 0) {
      setDashboardMessage({
        text: 'No pending offline audit notes to sync.',
        type: 'info'
      });
      return;
    }

    // Filter out notes with conflicts - they must be resolved manually for transparency & data integrity
    const notesToSync = offlineNotes.filter(n => !n.conflictDetected && !n.modifiedPostOnline);
    const conflictedNotes = offlineNotes.filter(n => n.conflictDetected || n.modifiedPostOnline);

    if (notesToSync.length === 0) {
      setDashboardMessage({
        text: `All ${conflictedNotes.length} pending note(s) have post-online conflicts. Resolve each conflict first before syncing.`,
        type: 'warning'
      });
      if (conflictedNotes[0]) {
        onRequestResolveConflict(conflictedNotes[0]);
      }
      return;
    }

    setIsSyncing(true);
    setSyncCancelled(false);
    cancelSyncRef.current = false;

    const startTime = Date.now();
    const total = notesToSync.length;

    setSyncProgress({
      current: 0,
      total,
      percent: 0,
      currentNoteTitle: `Preparing batch upload of ${total} audit note(s)...`,
      syncedCount: 0,
      conflictCount: conflictedNotes.length,
      errorCount: 0,
      startTime,
      elapsedSeconds: 0
    });

    let currentSynced = 0;
    let currentErrors = 0;
    const successfullySyncedIds: string[] = [];

    // Process each note sequentially with granular updates & pacing for transparent feedback
    for (let i = 0; i < notesToSync.length; i++) {
      if (cancelSyncRef.current) {
        break;
      }

      const note = notesToSync[i];
      const previewText = note.text.length > 55 ? `${note.text.substring(0, 55)}...` : note.text;

      // Update current note indicator to 'syncing'
      setItemStatuses(prev => ({
        ...prev,
        [note.id]: { state: 'syncing' }
      }));

      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const percent = Math.round(((i) / total) * 100);

      setSyncProgress(prev => ({
        ...prev,
        current: i + 1,
        percent,
        currentNoteTitle: `[${i + 1}/${total}] Uploading: "${previewText}"`,
        elapsedSeconds: elapsed
      }));

      // Small pacing pause so large batch progress is visually discernible and transparent
      await new Promise(r => setTimeout(r, 260));

      const ledgerRecord: ComplianceLedgerRow = {
        date: note.date || new Date(note.timestamp).toISOString().split('T')[0],
        operator: note.operator || currentUserDisplayName,
        terminalId: note.terminalId || 'TERM-UNDERGROUND',
        riskCategory: note.category || 'Field Audit Note',
        violationVector: note.violationVector || 'MHSA Statutory Offline Audit',
        severityLevel: note.severity || 'Medium',
        auditStatus: note.status || 'Action Required',
        detailedNotes: note.text
      };

      try {
        const success = await onCommitRecord(ledgerRecord);
        if (success) {
          currentSynced++;
          successfullySyncedIds.push(note.id);
          setItemStatuses(prev => ({
            ...prev,
            [note.id]: { state: 'synced', timestamp: Date.now() }
          }));
        } else {
          currentErrors++;
          setItemStatuses(prev => ({
            ...prev,
            [note.id]: { state: 'error', errorMessage: 'Commit rejected' }
          }));
        }
      } catch (err: any) {
        currentErrors++;
        setItemStatuses(prev => ({
          ...prev,
          [note.id]: { state: 'error', errorMessage: err?.message || 'Sync failed' }
        }));
      }

      const finalElapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      setSyncProgress(prev => ({
        ...prev,
        percent: Math.round(((i + 1) / total) * 100),
        syncedCount: currentSynced,
        errorCount: currentErrors,
        elapsedSeconds: finalElapsed
      }));
    }

    // Retain only un-synced notes (e.g. conflicted or errored) in localStorage
    const remainingNotes = offlineNotes.filter(n => !successfullySyncedIds.includes(n.id));
    if (remainingNotes.length > 0) {
      localStorage.setItem('melotwo_offline_audit_notes', JSON.stringify(remainingNotes));
      onUpdateNotesList(remainingNotes);
    } else {
      localStorage.removeItem('melotwo_offline_audit_notes');
      onUpdateNotesList([]);
    }

    setIsSyncing(false);

    if (conflictedNotes.length > 0) {
      setDashboardMessage({
        text: `Batch Complete: Successfully synced ${currentSynced} note(s). ${conflictedNotes.length} note(s) kept in localStorage due to post-online conflicts.`,
        type: 'warning'
      });
    } else if (currentErrors > 0) {
      setDashboardMessage({
        text: `Batch finished with ${currentSynced} synced and ${currentErrors} error(s). Review failed items below.`,
        type: 'error'
      });
    } else {
      setDashboardMessage({
        text: `Batch Upload Succeeded! All ${currentSynced} offline audit note(s) committed to the Compliance Ledger.`,
        type: 'success'
      });
    }
  };

  const handleCancelSync = () => {
    cancelSyncRef.current = true;
    setSyncCancelled(true);
    setDashboardMessage({
      text: 'Batch sync paused by user.',
      type: 'info'
    });
  };

  return (
    <div 
      id="offline-sync-dashboard-panel"
      className={`bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl relative transition-all duration-300 font-sans ${
        isExpanded ? 'fixed inset-4 z-50 overflow-y-auto max-h-[calc(100vh-2rem)]' : 'relative my-4'
      }`}
    >
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mt-24" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mb-24" />

      {/* DASHBOARD TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <Layers className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Offline Sync Dashboard
              </span>

              {/* Real-time Connection State Pill */}
              {isEffectivelyOnline ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Online &amp; Connected</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <WifiOff className="w-3 h-3 text-rose-400" />
                  <span>{isSimulatedOffline ? 'Simulated Offline Mode' : 'Network Offline'}</span>
                </span>
              )}

              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
                Buffer Footprint: {metrics.storageSizeFormatted}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 font-mono">
              <span>Offline Audit Notes Queue</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-sans">
                {metrics.total} {metrics.total === 1 ? 'Note' : 'Notes'} Pending
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent batch upload manager for subterranean field notes. Review, inspect conflicts, and execute high-reliability ledger synchronization.
            </p>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {onToggleSimulateOffline && (
            <button
              type="button"
              onClick={onToggleSimulateOffline}
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSimulatedOffline
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
              title="Toggle simulated offline state to test subterranean logging"
            >
              {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isSimulatedOffline ? 'Resume Online' : 'Simulate Offline'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleGenerateSampleBatch}
            disabled={isSyncing}
            className="text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Generate 5 realistic South African statutory audit notes for batch testing"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Batch (+5)</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateConflict}
            disabled={isSyncing}
            className="text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Add a post-online conflicted note to test skipping and interactive resolution"
          >
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Simulate</span> Conflict
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title={isExpanded ? 'Restore window size' : 'Expand to full view'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Dashboard"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10">
        {/* Total Queued */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Pending Total</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{metrics.total}</span>
            <span className="text-[10px] text-slate-500 font-mono">in localStorage</span>
          </div>
        </div>

        {/* Ready to Sync */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Ready to Sync</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{metrics.ready}</span>
            <span className="text-[10px] text-slate-500 font-mono">no conflict</span>
          </div>
        </div>

        {/* Conflicts Requiring Attention */}
        <div className={`p-3.5 rounded-2xl flex flex-col justify-between transition-all ${
          metrics.conflicts > 0
            ? 'bg-amber-950/25 border-2 border-amber-500/50 shadow-md shadow-amber-500/10'
            : 'bg-slate-900/90 border border-slate-800/90'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={metrics.conflicts > 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}>Conflicts</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.conflicts > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${metrics.conflicts > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {metrics.conflicts}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">requires review</span>
          </div>
        </div>

        {/* Ledger Sync Status */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Ledger Target</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-bold text-white font-mono truncate">Compliance Ledger</span>
            <span className="text-[10px] text-cyan-400 font-mono">Immutable</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC FEEDBACK BANNER */}
      {dashboardMessage && (
        <div className={`mb-4 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-mono border transition-all animate-fade-in ${
          dashboardMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : dashboardMessage.type === 'warning'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            : dashboardMessage.type === 'error'
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
        }`}>
          <div className="flex items-center gap-2">
            {dashboardMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {dashboardMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {dashboardMessage.type === 'error' && <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />}
            {dashboardMessage.type === 'info' && <Layers className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{dashboardMessage.text}</span>
          </div>
          <button 
            type="button"
            onClick={() => setDashboardMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PRIMARY 'SYNC ALL' ACTION BAR WITH REAL-TIME PROGRESS REPORTING */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border-2 border-indigo-500/30 rounded-2xl my-4 relative z-10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded">
                Transparent Batch Executor
              </span>
              {isSyncing && (
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  Synchronizing Notes to Ledger...
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <span>Synchronize Offline Buffer to Compliance Ledger</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 font-sans max-w-2xl">
              Uploads pending offline audit notes sequentially with live progress bars and item-level status verification. Conflicted notes are safely held in localStorage until resolved.
            </p>
          </div>

          {/* Sync All Button & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {isSyncing ? (
              <button
                type="button"
                id="btn-cancel-batch-sync"
                onClick={handleCancelSync}
                className="py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
              >
                <X className="w-4 h-4" />
                <span>Pause Batch</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-execute-sync-all"
                onClick={handleSyncAll}
                disabled={!isEffectivelyOnline || metrics.total === 0}
                className={`py-3 px-6 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xl ${
                  !isEffectivelyOnline || metrics.total === 0
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25 active:scale-98'
                }`}
                title={
                  !isEffectivelyOnline
                    ? 'Offline: Cannot sync until network connectivity is active'
                    : metrics.total === 0
                    ? 'Buffer is empty: No offline audit notes to sync'
                    : `Sync ${metrics.ready} ready offline note(s) to Compliance Ledger`
                }
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync All ({metrics.ready} Ready)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportJSON}
              disabled={offlineNotes.length === 0}
              className="py-3 px-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              title="Download backup JSON of all pending offline notes"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Backup</span> JSON
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={isSyncing || offlineNotes.length === 0}
              className="py-3 px-3.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              title="Delete all notes currently in offline buffer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* VISUAL REAL-TIME PROGRESS BAR & GRANULAR STATUS READOUT */}
        {(isSyncing || syncProgress.percent > 0) && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3 font-mono">
            {/* Percentage & Live Counter Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Batch Progress: {syncProgress.percent}%</span>
                </span>
                <span className="text-slate-400">
                  ({syncProgress.syncedCount} of {syncProgress.total} notes committed)
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {syncProgress.syncedCount} Synced
                </span>
                {syncProgress.conflictCount > 0 && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {syncProgress.conflictCount} Skipped (Conflict)
                  </span>
                )}
                {syncProgress.errorCount > 0 && (
                  <span className="text-rose-400 flex items-center gap-1">
                    <X className="w-3 h-3" /> {syncProgress.errorCount} Errors
                  </span>
                )}
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {syncProgress.elapsedSeconds}s elapsed
                </span>
              </div>
            </div>

            {/* Multi-segmented animated progress bar */}
            <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 relative overflow-hidden"
                style={{ width: `${Math.max(4, syncProgress.percent)}%` }}
              >
                {/* Shimmer animation effect */}
                <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-[pulse_2s_infinite]" />
              </div>
            </div>

            {/* Granular Current Task Readout */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-slate-400 shrink-0">Current Action:</span>
                <span className="text-cyan-300 truncate font-mono">{syncProgress.currentNoteTitle}</span>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                Sequential MHSA Append
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-4 relative z-10 font-mono">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search note text, operator, terminal, MHSA vector..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({offlineNotes.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ready')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ready' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ready ({metrics.ready})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('conflict')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'conflict' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conflicts ({metrics.conflicts})
            </button>
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* FULL LIST OF PENDING OFFLINE AUDIT NOTES WITH GRANULAR STATUS INDICATORS */}
      <div className="space-y-3 relative z-10 max-h-[500px] overflow-y-auto pr-1">
        {filteredNotes.length === 0 ? (
          <div className="p-8 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center font-mono">
            <HardDrive className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h5 className="text-sm font-bold text-white">No Offline Audit Notes Found</h5>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                ? 'No offline audit notes match the active filter criteria. Clear filters to see all queued notes.'
                : 'All field notes are synchronized with the Compliance Ledger. Create audit notes while disconnected or click "Generate Batch (+5)" to test batch synchronization.'}
            </p>
            {offlineNotes.length === 0 && (
              <button
                type="button"
                onClick={handleGenerateSampleBatch}
                className="mt-4 inline-flex items-center gap-2 text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Generate Test Batch (5 Notes)</span>
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note, index) => {
            const isEditing = editingNoteId === note.id;
            const isConflicted = note.conflictDetected || note.modifiedPostOnline;
            const currentItemStatus = itemStatuses[note.id] || { 
              state: isConflicted ? 'conflict' : 'pending' 
            };

            return (
              <div
                key={note.id || index}
                className={`p-4 rounded-2xl border transition-all duration-200 relative group font-mono ${
                  currentItemStatus.state === 'syncing'
                    ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : currentItemStatus.state === 'synced'
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : isConflicted
                    ? 'bg-amber-950/25 border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Granular Status Header per Note Item */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Item Granular Status Badge */}
                    {currentItemStatus.state === 'syncing' && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                        Uploading to Ledger...
                      </span>
                    )}

                    {currentItemStatus.state === 'synced' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Committed to Ledger
                      </span>
                    )}

                    {currentItemStatus.state === 'conflict' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Post-Online Conflict Detected
                      </span>
                    )}

                    {currentItemStatus.state === 'error' && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <X className="w-3 h-3 text-rose-400" />
                        Failed: {currentItemStatus.errorMessage || 'Sync Error'}
                      </span>
                    )}

                    {currentItemStatus.state === 'pending' && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Pending Batch Upload
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400">
                      ID: {note.id.substring(0, 14)}...
                    </span>
                  </div>

                  {/* Date & Terminal ID */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-slate-500" />
                      {note.terminalId || 'TERM-UNDERGROUND'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {note.operator || 'Inspector'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">
                      {new Date(note.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Note Content / Inline Edit Form */}
                {isEditing ? (
                  <div className="my-3 space-y-2.5 bg-slate-950 p-3.5 rounded-xl border border-indigo-500/40">
                    <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" /> Edit Offline Note in LocalStorage
                      </span>
                      {isEffectivelyOnline && (
                        <span className="text-[10px] text-amber-400 font-normal">
                          Online: Saving will mark note as post-online conflict
                        </span>
                      )}
                    </div>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-lg p-2.5 text-xs text-white focus:outline-none leading-relaxed font-mono"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditingText('');
                        }}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveInlineEdit(note.id)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="my-3">
                    <p className="text-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-amber-500/30">
                      {note.text}
                    </p>
                  </div>
                )}

                {/* Metadata Pills & Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Category */}
                    <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {note.category || 'Field Note'}
                    </span>

                    {/* Violation Vector */}
                    {note.violationVector && (
                      <span className="bg-slate-950 border border-slate-800 text-cyan-300 px-2.5 py-0.5 rounded-lg">
                        {note.violationVector}
                      </span>
                    )}

                    {/* Severity */}
                    <span className={`px-2 py-0.5 rounded-lg font-bold ${
                      note.severity === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : note.severity === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-950 text-slate-300 border border-slate-800'
                    }`}>
                      {note.severity || 'Medium'}
                    </span>

                    {/* Status */}
                    <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">
                      {note.status || 'Action Required'}
                    </span>
                  </div>

                  {/* Individual Note Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isConflicted && (
                      <button
                        type="button"
                        onClick={() => onRequestResolveConflict(note)}
                        className="text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        title="Open interactive version comparison and merge workspace"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>Resolve Conflict</span>
                      </button>
                    )}

                    {!isConflicted && (
                      <button
                        type="button"
                        onClick={() => handleSyncSingleNote(note)}
                        disabled={!isEffectivelyOnline || currentItemStatus.state === 'syncing'}
                        className="text-[11px] font-bold bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Upload this single note immediately to the compliance ledger"
                      >
                        <RefreshCw className={`w-3 h-3 ${currentItemStatus.state === 'syncing' ? 'animate-spin' : ''}`} />
                        <span>Sync Single</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditingText(note.text);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit note in localStorage"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Remove note from buffer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DASHBOARD BOTTOM FOOTER */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-500 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Storage Engine: Browser LocalStorage (Key: <code className="text-slate-400">melotwo_offline_audit_notes</code>)</span>
        </div>
        <div>
          <span>MHSA &amp; SANS Compliant Subterranean Synchronization</span>
        </div>
      </div>
    </div>
  );
};
