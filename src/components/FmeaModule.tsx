import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Plus,
  Download,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  Calendar,
  X,
  Sparkles,
  Wrench,
  Activity,
  Zap,
  RotateCcw
} from 'lucide-react';
import { FmeaItem, FmeaRpnLevel } from '../types/riskManagementTypes';
import {
  calculateRpn,
  fetchFmeaItems,
  saveFmeaItem,
  updateFmeaMitigation,
  exportFmeaReportPdf
} from '../services/riskManagementService';

export interface FmeaModuleProps {
  onNotify?: (message: string) => void;
}

export const FmeaModule: React.FC<FmeaModuleProps> = ({ onNotify }) => {
  const [fmeaItems, setFmeaItems] = useState<FmeaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState('ALL');
  const [selectedRpnFilter, setSelectedRpnFilter] = useState<string>('ALL');

  // Modal State for New FMEA Item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<FmeaItem> | null>(null);

  // Form states
  const [formSystem, setFormSystem] = useState('');
  const [formSubsystem, setFormSubsystem] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formFailureMode, setFormFailureMode] = useState('');
  const [formEffects, setFormEffects] = useState('');
  const [formCauses, setFormCauses] = useState('');
  const [formCurrentControls, setFormCurrentControls] = useState('');
  const [formSeverity, setFormSeverity] = useState<number>(8);
  const [formOccurrence, setFormOccurrence] = useState<number>(5);
  const [formDetection, setFormDetection] = useState<number>(5);
  const [formMitigation, setFormMitigation] = useState('');
  const [formOfficer, setFormOfficer] = useState('Johan van der Merwe (GCC Mechanical Engineer)');
  const [formDueDate, setFormDueDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');
  const [formRevSev, setFormRevSev] = useState<number>(7);
  const [formRevOcc, setFormRevOcc] = useState<number>(2);
  const [formRevDet, setFormRevDet] = useState<number>(2);

  // Quick mitigation drawer / modal
  const [activeMitigationItem, setActiveMitigationItem] = useState<FmeaItem | null>(null);
  const [mitigationActionInput, setMitigationActionInput] = useState('');
  const [mitigationOfficerInput, setMitigationOfficerInput] = useState('');
  const [mitigationDueDateInput, setMitigationDueDateInput] = useState('');
  const [mitigationStatusInput, setMitigationStatusInput] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');
  const [mitigationRevSev, setMitigationRevSev] = useState(6);
  const [mitigationRevOcc, setMitigationRevOcc] = useState(2);
  const [mitigationRevDet, setMitigationRevDet] = useState(2);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await fetchFmeaItems();
    setFmeaItems(data);
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormSystem('Underground Trackless Mobile Machinery (LHD / Hauler)');
    setFormSubsystem('Hydraulic Steering & Brake Circuit');
    setFormSerial('SN-LHD-2026-9041');
    setFormFailureMode('');
    setFormEffects('');
    setFormCauses('');
    setFormCurrentControls('Weekly visual inspection during planned maintenance');
    setFormSeverity(8);
    setFormOccurrence(5);
    setFormDetection(5);
    setFormMitigation('');
    setFormOfficer('Johan van der Merwe (GCC Mechanical Engineer)');
    setFormDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setFormStatus('IN_PROGRESS');
    setFormRevSev(7);
    setFormRevOcc(2);
    setFormRevDet(2);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: FmeaItem) => {
    setEditingItem(item);
    setFormSystem(item.equipmentSystem);
    setFormSubsystem(item.subsystem);
    setFormSerial(item.equipmentSerialId || '');
    setFormFailureMode(item.failureMode);
    setFormEffects(item.potentialEffects);
    setFormCauses(item.potentialCauses);
    setFormCurrentControls(item.currentControls);
    setFormSeverity(item.severity);
    setFormOccurrence(item.occurrence);
    setFormDetection(item.detection);
    setFormMitigation(item.mitigationAction);
    setFormOfficer(item.safetyOfficer);
    setFormDueDate(item.dueDate);
    setFormStatus(item.taskStatus);
    setFormRevSev(item.revisedSeverity || Math.max(1, item.severity - 1));
    setFormRevOcc(item.revisedOccurrence || Math.max(1, Math.round(item.occurrence / 2)));
    setFormRevDet(item.revisedDetection || Math.max(1, Math.round(item.detection / 2)));
    setIsAddModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFailureMode.trim() || !formSystem.trim()) return;

    const saved = await saveFmeaItem({
      id: editingItem?.id,
      equipmentSystem: formSystem,
      subsystem: formSubsystem,
      equipmentSerialId: formSerial,
      failureMode: formFailureMode,
      potentialEffects: formEffects,
      potentialCauses: formCauses,
      currentControls: formCurrentControls,
      severity: formSeverity,
      occurrence: formOccurrence,
      detection: formDetection,
      mitigationAction: formMitigation,
      safetyOfficer: formOfficer,
      dueDate: formDueDate,
      taskStatus: formStatus,
      revisedSeverity: formRevSev,
      revisedOccurrence: formRevOcc,
      revisedDetection: formRevDet
    });

    setIsAddModalOpen(false);
    await loadItems();
    if (onNotify) {
      onNotify(`FMEA Failure Mode Logged: Initial RPN ${saved.rpn} → Revised Target RPN ${saved.revisedRpn || 'N/A'}`);
    }
  };

  const handleOpenMitigationDrawer = (item: FmeaItem) => {
    setActiveMitigationItem(item);
    setMitigationActionInput(item.mitigationAction);
    setMitigationOfficerInput(item.safetyOfficer);
    setMitigationDueDateInput(item.dueDate);
    setMitigationStatusInput(item.taskStatus);
    setMitigationRevSev(item.revisedSeverity || Math.max(1, item.severity - 1));
    setMitigationRevOcc(item.revisedOccurrence || Math.max(1, Math.round(item.occurrence / 2)));
    setMitigationRevDet(item.revisedDetection || Math.max(1, Math.round(item.detection / 2)));
  };

  const handleSaveMitigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMitigationItem) return;

    await updateFmeaMitigation(activeMitigationItem.id, {
      mitigationAction: mitigationActionInput,
      safetyOfficer: mitigationOfficerInput,
      dueDate: mitigationDueDateInput,
      taskStatus: mitigationStatusInput,
      revisedSeverity: mitigationRevSev,
      revisedOccurrence: mitigationRevOcc,
      revisedDetection: mitigationRevDet
    });

    setActiveMitigationItem(null);
    await loadItems();
    if (onNotify) {
      onNotify(`Mitigation action updated for ${activeMitigationItem.equipmentSystem}`);
    }
  };

  // Systems unique list
  const availableSystems = useMemo(() => {
    const set = new Set<string>();
    fmeaItems.forEach(i => set.add(i.equipmentSystem));
    return Array.from(set);
  }, [fmeaItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return fmeaItems.filter(item => {
      const matchesSearch =
        item.equipmentSystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subsystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.failureMode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.potentialEffects.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.safetyOfficer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.equipmentSerialId && item.equipmentSerialId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSystem = selectedSystemFilter === 'ALL' || item.equipmentSystem === selectedSystemFilter;
      const matchesRpn = selectedRpnFilter === 'ALL' || item.rpnLevel === selectedRpnFilter;

      return matchesSearch && matchesSystem && matchesRpn;
    });
  }, [fmeaItems, searchTerm, selectedSystemFilter, selectedRpnFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = fmeaItems.length;
    const critical = fmeaItems.filter(i => i.rpnLevel === 'CRITICAL').length;
    const high = fmeaItems.filter(i => i.rpnLevel === 'HIGH').length;
    const inProgress = fmeaItems.filter(i => i.taskStatus === 'IN_PROGRESS').length;
    const completed = fmeaItems.filter(i => i.taskStatus === 'COMPLETED').length;
    const maxRpn = fmeaItems.reduce((max, i) => Math.max(max, i.rpn), 0);

    return { total, critical, high, inProgress, completed, maxRpn };
  }, [fmeaItems]);

  // Live RPN calculations for modal
  const liveInitialRpn = calculateRpn(formSeverity, formOccurrence, formDetection);
  const liveRevisedRpn = calculateRpn(formRevSev, formRevOcc, formRevDet);

  return (
    <div className="space-y-6">
      {/* Header Banner & Summary KPI Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-40 bg-rose-500/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                SANS / ISO 31010 Reliability Engineering
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                RPN = Severity &times; Occurrence &times; Detection
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
              Failure Modes and Effects Analysis (FMEA Engine)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Mechanical and electrical equipment reliability scoring table calculating Risk Priority Numbers (RPN). Prioritizes critical failure modes and tracks engineer mitigation assignments to completion.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-rose-950/40 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Failure Mode</span>
            </button>

            <button
              onClick={() => exportFmeaReportPdf(fmeaItems)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-2 cursor-pointer"
              title="Export official FMEA reliability report PDF"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>Export FMEA PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Equipment Failure Modes</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{metrics.total}</div>
            <span className="text-[10px] text-slate-500">Tracked across mining fleet</span>
          </div>

          <div className="bg-slate-950/60 border border-rose-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">Critical RPN (≥200)</span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">{metrics.critical}</div>
            <span className="text-[10px] text-rose-500/80">Peak RPN Score: {metrics.maxRpn}</span>
          </div>

          <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Active Mitigations</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{metrics.inProgress}</div>
            <span className="text-[10px] text-amber-500/80">Under engineer execution</span>
          </div>

          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Verified &amp; Resolved</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5" />
              <span>{metrics.completed}</span>
            </div>
            <span className="text-[10px] text-emerald-500/80">Risk re-scored to controlled RPN</span>
          </div>
        </div>
      </div>

      {/* FMEA INTERACTIVE SCORING GUIDE BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              FMEA 10-Point Scoring Standard (RPN = S &times; O &times; D)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Range: 1 (Lowest) to 1000 (Maximum Criticality)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white">Severity (S: 1 - 10)</span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Impact</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1 = Barely noticeable; 5 = Moderate production loss; 9-10 = Hazardous without warning; multiple fatalities or catastrophic collapse.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white">Occurrence (O: 1 - 10)</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Frequency</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1 = Extremely remote (&lt; 1 in 1.5M hours); 5 = Occasional (1 in 2,000 hrs); 9-10 = Persistent failure; &gt; 1 in 10 operational shifts.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white">Detection (D: 1 - 10)</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">Control</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1 = Almost certain automatic detection via live SCADA; 5 = Moderate manual detection; 9-10 = Undetectable prior to failure.
            </p>
          </div>
        </div>
      </div>

      {/* FMEA DATA TABLE & MITIGATION TASK LOGGER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-rose-400" />
              <span>Equipment &amp; System Failure Mode Register</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({filteredItems.length} records)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search system, failure, or serial..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* System filter */}
            <select
              value={selectedSystemFilter}
              onChange={e => setSelectedSystemFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500 max-w-[200px]"
            >
              <option value="ALL">All Equipment Systems</option>
              {availableSystems.map(sys => (
                <option key={sys} value={sys}>{sys}</option>
              ))}
            </select>

            {/* RPN Level filter */}
            <select
              value={selectedRpnFilter}
              onChange={e => setSelectedRpnFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All RPN Levels</option>
              <option value="CRITICAL">Critical RPN (≥200)</option>
              <option value="HIGH">High RPN (100-199)</option>
              <option value="MEDIUM">Moderate RPN (40-99)</option>
              <option value="LOW">Low RPN (&lt;40)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-3">Equipment / Subsystem</th>
                <th className="py-3 px-3">Failure Mode &amp; Potential Effect</th>
                <th className="py-3 px-2 text-center">S</th>
                <th className="py-3 px-2 text-center">O</th>
                <th className="py-3 px-2 text-center">D</th>
                <th className="py-3 px-3 text-center">RPN</th>
                <th className="py-3 px-3">Mitigation Task &amp; Assignee</th>
                <th className="py-3 px-3">Status / Target</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <AlertOctagon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No equipment failure modes found</p>
                    <p className="text-xs text-slate-500 mt-1">Clear your filter criteria or click "Log Failure Mode" to add new equipment records.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const rpnMeta = calculateRpn(item.severity, item.occurrence, item.detection);
                  const isCritical = item.rpn >= 200;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Equipment / Subsystem */}
                      <td className="py-3 px-3 max-w-[180px]">
                        <div className="font-bold text-white">{item.equipmentSystem}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.subsystem}</div>
                        {item.equipmentSerialId && (
                          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            {item.equipmentSerialId}
                          </span>
                        )}
                      </td>

                      {/* Failure Mode & Effects */}
                      <td className="py-3 px-3 max-w-[240px]">
                        <div className="font-semibold text-rose-300">{item.failureMode}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          <strong>Effect:</strong> {item.potentialEffects}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          <strong>Cause:</strong> {item.potentialCauses}
                        </p>
                      </td>

                      {/* S, O, D */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">
                        {item.severity}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">
                        {item.occurrence}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">
                        {item.detection}
                      </td>

                      {/* RPN Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className={`px-2.5 py-1 rounded-xl border font-mono font-black text-xs inline-block ${rpnMeta.colorClass}`}>
                          {item.rpn}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                          {item.rpnLevel}
                        </div>
                      </td>

                      {/* Mitigation Action & Assignee */}
                      <td className="py-3 px-3 max-w-[240px]">
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {item.mitigationAction}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          <span className="truncate">{item.safetyOfficer}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Due: {item.dueDate}</span>
                        </div>
                      </td>

                      {/* Status / Target RPN */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          item.taskStatus === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.taskStatus === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.taskStatus}
                        </span>
                        {item.revisedRpn ? (
                          <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            <span>Target: {item.revisedRpn}</span>
                          </div>
                        ) : (
                          <div className="text-[9px] font-mono text-slate-500 mt-1">
                            Pending Re-score
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenMitigationDrawer(item)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold mr-1.5 transition cursor-pointer"
                          title="Log or update mitigation task"
                        >
                          Mitigate
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK MITIGATION TASK DRAWER / MODAL */}
      {activeMitigationItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-200">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-rose-500" />

            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  Mitigation Task Logger &amp; Re-Scorer
                </span>
                <h3 className="text-base font-black text-white font-display mt-0.5 truncate max-w-sm">
                  {activeMitigationItem.equipmentSystem}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMitigationItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMitigation} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Failure Mode</span>
                <p className="text-xs font-semibold text-rose-300 mt-0.5">
                  {activeMitigationItem.failureMode}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs font-mono">
                  <span className="text-slate-400">Current RPN:</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    {activeMitigationItem.rpn} ({activeMitigationItem.rpnLevel})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mitigation Action / Engineering Control *
                </label>
                <textarea
                  rows={2}
                  required
                  value={mitigationActionInput}
                  onChange={e => setMitigationActionInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Assigned Safety Officer / GCC Engineer *
                  </label>
                  <input
                    type="text"
                    required
                    value={mitigationOfficerInput}
                    onChange={e => setMitigationOfficerInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Mitigation Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={mitigationDueDateInput}
                    onChange={e => setMitigationDueDateInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">
                  Task Execution Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setMitigationStatusInput(st)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                        mitigationStatusInput === st
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-950 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revised RPN Scoring Controls */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                    Post-Mitigation Target RPN
                  </span>
                  <span className="text-xs font-black font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    RPN: {mitigationRevSev * mitigationRevOcc * mitigationRevDet}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Rev Severity</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={mitigationRevSev}
                      onChange={e => setMitigationRevSev(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Rev Occurrence</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={mitigationRevOcc}
                      onChange={e => setMitigationRevOcc(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Rev Detection</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={mitigationRevDet}
                      onChange={e => setMitigationRevDet(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveMitigationItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  Save Mitigation &amp; Re-Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL ADD / EDIT FMEA MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-auto">
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />

            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">
                  SANS / ISO 31010 Reliability Engineering
                </span>
                <h3 className="text-base font-black text-white font-display mt-0.5">
                  {editingItem?.id ? 'Edit Equipment Failure Mode (FMEA)' : 'Log New Equipment Failure Mode & Effects Analysis'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Equipment System *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Underground LHD Loader (Sandvik LH517i)"
                    value={formSystem}
                    onChange={e => setFormSystem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Serial / Tag ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SN-LHD-2026-9041"
                    value={formSerial}
                    onChange={e => setFormSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subsystem / Critical Component *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Hydraulic Steering & Articulation Cylinder"
                  value={formSubsystem}
                  onChange={e => setFormSubsystem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Potential Failure Mode *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-pressure hydraulic flex hose rupture at 280 bar cyclic pulse"
                  value={formFailureMode}
                  onChange={e => setFormFailureMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Potential Failure Effects *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Loss of steering control in decline; collision with personnel"
                    value={formEffects}
                    onChange={e => setFormEffects(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Potential Root Causes *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Quartz rock rub against hose, thermal fluid degradation"
                    value={formCauses}
                    onChange={e => setFormCauses(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* RPN Scoring Spinners */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Initial Risk Priority Number (RPN) Scoring (1 to 10)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">
                      {formSeverity} &times; {formOccurrence} &times; {formDetection} =
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black font-mono ${liveInitialRpn.colorClass}`}>
                      RPN {liveInitialRpn.rpn} ({liveInitialRpn.level})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                      Severity (1-10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formSeverity}
                      onChange={e => setFormSeverity(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white text-center font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                      Occurrence (1-10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formOccurrence}
                      onChange={e => setFormOccurrence(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white text-center font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                      Detection (1-10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formDetection}
                      onChange={e => setFormDetection(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white text-center font-mono font-bold"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  {liveInitialRpn.alertMessage}
                </p>
              </div>

              {/* Mitigation action */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mandatory Mitigation Action / Engineering Redesign *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Fit SANS-approved Kevlar burst-containment wrap over all steering hoses; install dual redundant secondary steering circuit."
                  value={formMitigation}
                  onChange={e => setFormMitigation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Assigned Safety Officer / Engineer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formOfficer}
                    onChange={e => setFormOfficer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Target Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Target Revised RPN */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                    Post-Mitigation Target RPN Calculation
                  </span>
                  <span className="text-xs font-black font-mono text-emerald-400">
                    Target: {liveRevisedRpn.rpn} ({liveRevisedRpn.level})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Target Sev</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formRevSev}
                      onChange={e => setFormRevSev(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Target Occ</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formRevOcc}
                      onChange={e => setFormRevOcc(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Target Det</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formRevDet}
                      onChange={e => setFormRevDet(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-950/40 cursor-pointer"
                >
                  {editingItem?.id ? 'Update Failure Mode' : 'Save Failure Mode to FMEA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
