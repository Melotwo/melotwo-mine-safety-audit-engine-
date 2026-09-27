import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  GitCompare, 
  Check, 
  CheckCircle2, 
  Database, 
  HardDrive, 
  RefreshCw, 
  Clock, 
  User, 
  Terminal, 
  Sliders, 
  X, 
  ArrowRight, 
  Copy, 
  Pencil, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Wifi
} from 'lucide-react';

export interface OfflineAuditNoteItem {
  id: string;
  text: string;
  timestamp: number;
  lastModified?: number;
  modifiedPostOnline?: boolean;
  date?: string;
  operator?: string;
  terminalId?: string;
  category?: string;
  severity?: string;
  status?: string;
  violationVector?: string;
  conflictDetected?: boolean;
  conflictReason?: string;
  remoteSnapshot?: {
    text: string;
    timestamp?: number;
    date?: string;
    operator?: string;
    terminalId?: string;
    category?: string;
    severity?: string;
    status?: string;
    violationVector?: string;
    ledgerRowIndex?: number;
  };
}

export type ConflictResolutionChoice = 'local' | 'remote' | 'merge' | 'both';

interface InspectorConflictResolverProps {
  conflictNote: OfflineAuditNoteItem;
  appOnlineTransitionTime?: number;
  isOnline: boolean;
  onResolve: (
    choice: ConflictResolutionChoice,
    resolvedText?: string,
    resolvedMetadata?: {
      severity?: string;
      status?: string;
      category?: string;
    }
  ) => void;
  onCancel: () => void;
}

export const InspectorConflictResolver: React.FC<InspectorConflictResolverProps> = ({
  conflictNote,
  appOnlineTransitionTime,
  isOnline,
  onResolve,
  onCancel,
}) => {
  // Remote baseline fallback if not explicitly populated
  const remoteVersion = conflictNote.remoteSnapshot || {
    text: conflictNote.text.replace(/\s*\[.*?(modified|revised|amendment|post-online).*?\]/gi, '').trim() ||
      'Shaft 4 intake velocity: 0.52 m/s verified compliant with SANS 10108. Standard airflow damper settings active.',
    timestamp: conflictNote.timestamp - 180000,
    operator: conflictNote.operator || 'Statutory Surface Auditor',
    terminalId: conflictNote.terminalId || 'TERM-LIVE-STATION',
    severity: conflictNote.severity || 'Medium',
    status: conflictNote.status || 'Verified Compliant',
    date: conflictNote.date || new Date().toISOString().split('T')[0],
    category: conflictNote.category || 'Underground Ventilation',
    violationVector: conflictNote.violationVector || 'MHSA / SANS 10108 Statutory Ventilation'
  };

  // Pre-generate merged draft text
  const initialMergedText = `[ONLINE LEDGER BASELINE]: ${remoteVersion.text}\n\n[LOCAL REVISION - MODIFIED POST-ONLINE]: ${conflictNote.text}`;
  const [mergedDraft, setMergedDraft] = useState(initialMergedText);
  const [activeTab, setActiveTab] = useState<'compare' | 'merge'>('compare');
  const [selectedSeverity, setSelectedSeverity] = useState<string>(conflictNote.severity || 'Medium');
  const [copiedIndicator, setCopiedIndicator] = useState<'local' | 'remote' | null>(null);

  // Keep mergedDraft updated if conflictNote changes
  useEffect(() => {
    setMergedDraft(`[ONLINE LEDGER BASELINE]: ${remoteVersion.text}\n\n[LOCAL REVISION - MODIFIED POST-ONLINE]: ${conflictNote.text}`);
    setSelectedSeverity(conflictNote.severity || 'Medium');
  }, [conflictNote.id, conflictNote.text]);

  const handleCopyText = (type: 'local' | 'remote', text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndicator(type);
    setTimeout(() => setCopiedIndicator(null), 2000);
  };

  const formatTimestamp = (ts?: number) => {
    if (!ts) return 'Unknown';
    const date = new Date(ts);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div 
      id="terminal-conflict-resolution-modal"
      className="bg-slate-950 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden animate-fade-in"
    >
      {/* Background Warning Glow Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shrink-0 shadow-lg shadow-amber-500/10 animate-pulse">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Conflict Resolution Required
              </span>
              <span className="text-[10px] font-mono text-slate-400 border border-slate-800 bg-slate-900 px-2 py-0.5 rounded-full">
                Audit Note ID: {conflictNote.id.substring(0, 16)}...
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>LocalStorage Note Modified Post-Online</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              This audit note was modified in browser <code className="text-amber-300 font-mono">localStorage</code> after the application reconnected to the network. Choose which version to commit to the Compliance Ledger.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer self-start sm:self-center"
          title="Dismiss conflict resolution (changes will remain pending in localStorage)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Provenance & Synchronization Timeline */}
      <div className="mt-4 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono relative z-10">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-semibold">Offline Created:</span>
          <span className="text-amber-300/90">{formatTimestamp(conflictNote.timestamp)}</span>
        </div>

        {appOnlineTransitionTime && (
          <div className="flex items-center gap-2 text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-semibold">Online Reconnected:</span>
            <span className="text-emerald-300/90">{formatTimestamp(appOnlineTransitionTime)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-slate-400">
          <Pencil className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-semibold">Post-Online Modified:</span>
          <span className="text-cyan-300/90">{formatTimestamp(conflictNote.lastModified || conflictNote.timestamp)}</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mt-4 flex items-center justify-between border-b border-slate-800/80 pb-2 relative z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Side-by-Side Comparison</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('merge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'merge'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Merge Editor</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-500 hidden md:inline">
          {activeTab === 'compare' ? 'Select Version A or Version B' : 'Customize combined audit record'}
        </span>
      </div>

      {/* Main Comparison Grid */}
      {activeTab === 'compare' ? (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
          {/* VERSION A: LocalStorage Version */}
          <div className="bg-slate-900/95 border-2 border-amber-500/40 hover:border-amber-500/70 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-lg relative group">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      Version A
                    </span>
                    <h4 className="text-xs font-bold text-white font-mono">
                      LocalStorage (Post-Online Edit)
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('local', conflictNote.text)}
                  className="text-[10px] font-mono text-slate-400 hover:text-amber-300 flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 transition-colors cursor-pointer"
                  title="Copy text to clipboard"
                >
                  {copiedIndicator === 'local' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndicator === 'local' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Metadata Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-slate-400" />
                  {conflictNote.terminalId || 'TERM-UNDERGROUND'}
                </span>
                <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {conflictNote.operator || 'Field Inspector'}
                </span>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
                  Severity: {conflictNote.severity || 'Medium'}
                </span>
                <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  Status: {conflictNote.status || 'Action Required'}
                </span>
              </div>

              {/* Note Content Block */}
              <div className="p-3 bg-slate-950 border border-amber-500/20 rounded-xl font-mono text-xs text-amber-100 min-h-[90px] leading-relaxed break-words whitespace-pre-wrap selection:bg-amber-500/30">
                {conflictNote.text}
              </div>

              <div className="text-[10px] font-mono text-amber-400/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Modified locally at {formatTimestamp(conflictNote.lastModified || conflictNote.timestamp)}</span>
              </div>
            </div>

            {/* Commit Local Action Button */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                type="button"
                id="btn-resolve-commit-local"
                onClick={() => onResolve('local', conflictNote.text)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Commit LocalStorage Version</span>
              </button>
              <p className="text-[10px] text-slate-500 font-mono text-center mt-1.5">
                Commits this local edit to ledger &amp; removes item from browser localStorage.
              </p>
            </div>
          </div>

          {/* VERSION B: Online Ledger Baseline Version */}
          <div className="bg-slate-900/95 border-2 border-cyan-500/40 hover:border-cyan-500/70 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-lg relative group">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                      Version B
                    </span>
                    <h4 className="text-xs font-bold text-white font-mono">
                      Compliance Ledger (Online Record)
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('remote', remoteVersion.text)}
                  className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 transition-colors cursor-pointer"
                  title="Copy text to clipboard"
                >
                  {copiedIndicator === 'remote' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndicator === 'remote' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Metadata Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-slate-400" />
                  {remoteVersion.terminalId || 'TERM-ONLINE'}
                </span>
                <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {remoteVersion.operator || 'Auditor'}
                </span>
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded">
                  Severity: {remoteVersion.severity || 'Medium'}
                </span>
                <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  Status: {remoteVersion.status || 'Verified Compliant'}
                </span>
              </div>

              {/* Note Content Block */}
              <div className="p-3 bg-slate-950 border border-cyan-500/20 rounded-xl font-mono text-xs text-cyan-100 min-h-[90px] leading-relaxed break-words whitespace-pre-wrap selection:bg-cyan-500/30">
                {remoteVersion.text}
              </div>

              <div className="text-[10px] font-mono text-cyan-400/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Recorded on remote ledger at {formatTimestamp(remoteVersion.timestamp)}</span>
              </div>
            </div>

            {/* Commit Online Action Button */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                type="button"
                id="btn-resolve-keep-online"
                onClick={() => onResolve('remote', remoteVersion.text)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                <Database className="w-4 h-4" />
                <span>Keep Online Ledger Version</span>
              </button>
              <p className="text-[10px] text-slate-500 font-mono text-center mt-1.5">
                Discards local changes in localStorage &amp; preserves existing online ledger record.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE MERGE EDITOR TAB */
        <div className="mt-4 p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Custom Merge &amp; Reconcile Workspace</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Edit and combine observations from both the online ledger baseline and your post-online local modifications.
              </p>
            </div>

            {/* Preset helper buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMergedDraft(conflictNote.text)}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/30 transition-colors cursor-pointer"
              >
                Use Local
              </button>
              <button
                type="button"
                onClick={() => setMergedDraft(remoteVersion.text)}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors cursor-pointer"
              >
                Use Online
              </button>
              <button
                type="button"
                onClick={() => setMergedDraft(initialMergedText)}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors cursor-pointer"
              >
                Reset Combined
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Reconciled Audit Note Content:</span>
              <span className="text-[10px] text-slate-500 font-normal">{mergedDraft.length} characters</span>
            </label>
            <textarea
              value={mergedDraft}
              onChange={(e) => setMergedDraft(e.target.value)}
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white font-mono focus:outline-none transition-all leading-relaxed"
              placeholder="Edit merged audit note content..."
            />
          </div>

          {/* Severity Override for Merged Note */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Assign Severity:</span>
            {['Low', 'Medium', 'High', 'Critical'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  selectedSeverity === sev
                    ? sev === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : sev === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Resolution Actions: Commit Merged or Commit Both */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'merge' ? (
            <button
              type="button"
              id="btn-resolve-commit-merged"
              onClick={() => onResolve('merge', mergedDraft, { severity: selectedSeverity })}
              disabled={!mergedDraft.trim()}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Commit Merged Version</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('merge')}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-indigo-400" />
              <span>Open Merge Editor</span>
            </button>
          )}

          {/* Option: Commit Both Records as Distinct Entries */}
          <button
            type="button"
            id="btn-resolve-commit-both"
            onClick={() => onResolve('both', conflictNote.text)}
            className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Keeps the online record intact, and also appends the local version as an amendment note"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Commit Both as Distinct Records</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1"
        >
          Cancel &amp; Resolve Later
        </button>
      </div>
    </div>
  );
};
