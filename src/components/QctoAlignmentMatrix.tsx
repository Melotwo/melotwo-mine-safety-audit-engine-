import React, { useState } from 'react';
import {
  Shield,
  Award,
  BookOpen,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  MapPin,
  FileText,
  Briefcase,
  Search,
  Filter,
  Plus,
  RefreshCw,
  FolderCheck,
  Check,
  Zap,
  Flame,
  HardHat,
  Cpu,
  Eye,
  Info
} from 'lucide-react';
import {
  QCTO_MODULE_MAPPINGS,
  QCTO_DISCLAIMER_TEXT,
  QCTO_ACCREDITATION_NOTICE
} from '../data/qctoCurriculumData';
import { QctoModuleMapping, WorkerCompetencyRecord } from '../types/qcto';
import { useQctoTraining, ActiveWorkerProfile } from '../hooks/useQctoTraining';
import { QctoFieldDrillModal } from './QctoFieldDrillModal';
import { QctoToolboxTalkModal } from './QctoToolboxTalkModal';
import { QctoTrainingReportModal } from './QctoTrainingReportModal';

interface QctoAlignmentMatrixProps {
  onOpenTenderWizard?: () => void;
}

export const QctoAlignmentMatrix: React.FC<QctoAlignmentMatrixProps> = ({
  onOpenTenderWizard
}) => {
  const {
    records,
    workerProfile,
    setWorkerProfile,
    recordDrillCompletion,
    recordToolboxTalk,
    getWorkerStats,
    exportRecordPdf,
    exportRecordJson,
    deleteRecord,
    resetToDefaults
  } = useQctoTraining();

  // Active module selected in matrix
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const selectedMapping =
    QCTO_MODULE_MAPPINGS.find((m) => m.moduleId === selectedModuleId) || QCTO_MODULE_MAPPINGS[0];

  // Active Curriculum Tab within the selected module
  const [curriculumView, setCurriculumView] = useState<'knowledge' | 'practical' | 'workplace'>('knowledge');

  // Modals state
  const [drillModalOpen, setDrillModalOpen] = useState(false);
  const [toolboxModalOpen, setToolboxModalOpen] = useState(false);
  const [reportModalRecord, setReportModalRecord] = useState<WorkerCompetencyRecord | null>(null);

  // Filter logs in table
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');

  // Worker profile editor modal/toggle
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<ActiveWorkerProfile>(workerProfile);

  // Worker stats
  const stats = getWorkerStats();

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.workerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      rec.companyName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      rec.idNumber.includes(searchFilter) ||
      rec.verificationStamp.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesModule =
      selectedModuleFilter === 'ALL' || rec.moduleId.toString() === selectedModuleFilter;

    return matchesSearch && matchesModule;
  });

  const handleSaveProfile = () => {
    setWorkerProfile(tempProfile);
    setIsEditingProfile(false);
  };

  const getModuleIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 2:
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 3:
        return <HardHat className="w-4 h-4 text-blue-400" />;
      case 4:
        return <Flame className="w-4 h-4 text-red-400" />;
      case 5:
        return <Award className="w-4 h-4 text-orange-400" />;
      case 6:
        return <Cpu className="w-4 h-4 text-purple-400" />;
      default:
        return <FileCheck className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* 1. TOP STATUTORY DISCLAIMER BANNER */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 relative overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                  Operational Safety Companion Disclosure
                </span>
                <span className="text-slate-400 text-xs">• MHSA Section 10 & Construction Reg 9 Support</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {QCTO_DISCLAIMER_TEXT}
              </p>
              <p className="text-[11px] text-slate-400 pt-0.5">
                MeloTwo is an operational workplace training verification engine, not an accredited Skills Development Provider (SDP).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
            {onOpenTenderWizard && (
              <button
                onClick={onOpenTenderWizard}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20"
              >
                <FolderCheck className="w-4 h-4" />
                <span>Tender Safety File Builder</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. WORKER REAL-TIME COMPETENCY SCORECARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-700/50 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Worker Competency Tracker</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Site Worker Competency Progress & Tender Readiness
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Active Assessment Profile: <strong className="text-slate-200">{workerProfile.workerName}</strong> (ID: {workerProfile.idNumber}) • {workerProfile.companyName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setTempProfile(workerProfile);
                setIsEditingProfile(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Switch / Edit Worker
            </button>
            <button
              onClick={() => setDrillModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-blue-600/25 flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Start 5-Min Drill</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Modules Completed */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Modules Verified</span>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.modulesCompletedCount} <span className="text-sm font-normal text-slate-500">/ 6</span>
            </p>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${stats.progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Drill Mastery Average</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400">
              {stats.averageDrillScore}%
            </p>
            <p className="text-[11px] text-slate-400">Benchmark: 80% Passing Target</p>
          </div>

          {/* Card 3: Toolbox Talk Logs */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Shift Toolbox Talks</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-300">
              {stats.toolboxLogsCount}
            </p>
            <p className="text-[11px] text-slate-400">Pre-Shift Briefings Logged</p>
          </div>

          {/* Card 4: Tender Readiness */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tender Safety File</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="pt-1">
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                  stats.tenderReady
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                }`}
              >
                {stats.tenderReady ? <Check className="w-3.5 h-3.5 mr-1" /> : null}
                <span>{stats.tenderReady ? 'Tender Ready (S-Tier)' : 'In Progress'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Section 07 Training Proof Attachment
            </p>
          </div>
        </div>
      </div>

      {/* 3. CORE MATRIX: 6 MODULES TABS & DETAILED BREAKDOWN */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>QCTO & MQA Curriculum Alignment Matrix (6 Core Standards)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Select a standard to inspect registered SAQA qualification codes, Knowledge Modules (KM), Practical Skills (PM), and launch field drills.
          </p>
        </div>

        {/* 6 Module Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {QCTO_MODULE_MAPPINGS.map((mod) => {
            const isSelected = selectedModuleId === mod.moduleId;
            return (
              <button
                key={mod.moduleId}
                onClick={() => setSelectedModuleId(mod.moduleId)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center shrink-0">
                    {getModuleIcon(mod.moduleId)}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                    NQF {mod.nqfLevel}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-black text-white truncate">{mod.sansCode}</p>
                  <p className="text-[11px] text-purple-300 font-bold truncate">SAQA: {mod.saqaId}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Module Detail Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-700/50 text-xs font-bold">
                  {selectedMapping.sansCode}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-700/40 text-xs font-bold">
                  Registered SAQA ID: {selectedMapping.saqaId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                  {selectedMapping.qualityAssuringBody}
                </span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {selectedMapping.qualificationTitle}
              </h4>
              <p className="text-xs text-slate-400">
                Curriculum Code: <span className="font-mono text-slate-200">{selectedMapping.curriculumCode}</span> • OFO: {selectedMapping.ofoCode} • {selectedMapping.credits} Total Credits
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => setDrillModalOpen(true)}
                className="flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Launch 5-Min Field Drill</span>
              </button>

              <button
                onClick={() => setToolboxModalOpen(true)}
                className="flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Toolbox Talk Generator</span>
              </button>
            </div>
          </div>

          {/* Legal Framework & Target Occupations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Statutory Legal Framework:
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedMapping.legalFramework}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                Target Site Occupations & Artisans:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedMapping.targetOccupations.map((occ, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium"
                  >
                    {occ}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Curriculum Breakdown Tabs: Knowledge / Practical / Workplace */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setCurriculumView('knowledge')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
                  curriculumView === 'knowledge'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge Modules (KM)</span>
              </button>

              <button
                onClick={() => setCurriculumView('practical')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
                  curriculumView === 'practical'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Practical Skill Modules (PM)</span>
              </button>

              <button
                onClick={() => setCurriculumView('workplace')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
                  curriculumView === 'workplace'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Workplace Experience (WM)</span>
              </button>
            </div>

            {/* List of Curriculum Modules */}
            <div className="space-y-3">
              {curriculumView === 'knowledge' &&
                selectedMapping.knowledgeModules.map((km) => (
                  <div
                    key={km.code}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{km.code}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-bold text-white">{km.title}</span>
                      </div>
                      {km.description && <p className="text-xs text-slate-400">{km.description}</p>}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold shrink-0 self-start sm:self-center">
                      {km.credits} Credits
                    </span>
                  </div>
                ))}

              {curriculumView === 'practical' &&
                selectedMapping.practicalModules.map((pm) => (
                  <div
                    key={pm.code}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{pm.code}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-bold text-white">{pm.title}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold shrink-0 self-start sm:self-center">
                      {pm.credits} Credits
                    </span>
                  </div>
                ))}

              {curriculumView === 'workplace' &&
                selectedMapping.workExperienceModules.map((wm) => (
                  <div
                    key={wm.code}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-purple-400">{wm.code}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-bold text-white">{wm.title}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold shrink-0 self-start sm:self-center">
                      {wm.credits} Credits
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. DIGITAL EVIDENCE TABLE: WORKER TRAINING LOGS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-xs font-bold mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Digital Tender Evidence Repository</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Workplace Safety Training Logs & Competency Register
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified records with timestamped GPS tags and supervisor signature tokens ready for tender binder export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setDrillModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Drill</span>
            </button>

            <button
              onClick={resetToDefaults}
              title="Reset records to default sample data"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by worker name, ID number, SMME company, or verification stamp..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={selectedModuleFilter}
              onChange={(e) => setSelectedModuleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Standards (1 - 6)</option>
              {QCTO_MODULE_MAPPINGS.map((m) => (
                <option key={m.moduleId} value={m.moduleId.toString()}>
                  {m.sansCode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table of Records */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <th className="p-3.5">Worker & SMME</th>
                <th className="p-3.5">Standard & SAQA ID</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">GPS & Timestamp</th>
                <th className="p-3.5">Supervisor Stamp</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No competency records match your search criteria. Record a drill to generate evidence.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-white">{rec.workerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{rec.idNumber}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{rec.companyName}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-200">{rec.moduleName}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-300 border border-purple-800/40 font-bold">
                        SAQA ID: {rec.saqaId}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-black text-sm text-emerald-400">
                        {rec.drillScore}%
                      </span>
                      <p className="text-[10px] text-emerald-500 font-bold">PASSED ✓</p>
                    </td>

                    <td className="p-3.5 text-slate-300">
                      <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{rec.location.siteName}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">{rec.completedAt}</p>
                    </td>

                    <td className="p-3.5">
                      <span className="font-mono text-[10px] text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {rec.verificationStamp.substring(0, 24)}...
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{rec.supervisorName}</p>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setReportModalRecord(rec)}
                        title="View Full Report & Tender File Placement"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        View
                      </button>

                      <button
                        onClick={() => exportRecordPdf(rec)}
                        title="Download Verified PDF"
                        className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-800/40 cursor-pointer inline-flex items-center"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => exportRecordJson(rec)}
                        title="Export JSON Evidence"
                        className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-400 border border-purple-800/40 cursor-pointer inline-flex items-center"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. EDIT WORKER PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <h4 className="text-lg font-black text-white">Active Assessment Worker Profile</h4>
            <p className="text-xs text-slate-400">
              Update worker and supervisor credentials to personalize generated competency logs.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Worker Full Name</label>
                <input
                  type="text"
                  value={tempProfile.workerName}
                  onChange={(e) => setTempProfile({ ...tempProfile, workerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">South African ID / Passport No.</label>
                <input
                  type="text"
                  value={tempProfile.idNumber}
                  onChange={(e) => setTempProfile({ ...tempProfile, idNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Contractor / SMME Company</label>
                <input
                  type="text"
                  value={tempProfile.companyName}
                  onChange={(e) => setTempProfile({ ...tempProfile, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Mine / Site Name</label>
                <input
                  type="text"
                  value={tempProfile.siteName}
                  onChange={(e) => setTempProfile({ ...tempProfile, siteName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Appointed SHEQ Supervisor</label>
                <input
                  type="text"
                  value={tempProfile.supervisorName}
                  onChange={(e) => setTempProfile({ ...tempProfile, supervisorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DRILL RUNNER MODAL */}
      <QctoFieldDrillModal
        mapping={selectedMapping}
        workerProfile={workerProfile}
        isOpen={drillModalOpen}
        onClose={() => setDrillModalOpen(false)}
        onRecordDrill={recordDrillCompletion}
        onExportPdf={exportRecordPdf}
        onOpenTenderWizard={onOpenTenderWizard}
      />

      {/* 7. TOOLBOX TALK MODAL */}
      <QctoToolboxTalkModal
        mapping={selectedMapping}
        workerProfile={workerProfile}
        isOpen={toolboxModalOpen}
        onClose={() => setToolboxModalOpen(false)}
        onLogToolboxTalk={recordToolboxTalk}
      />

      {/* 8. TRAINING REPORT MODAL */}
      <QctoTrainingReportModal
        record={reportModalRecord}
        isOpen={!!reportModalRecord}
        onClose={() => setReportModalRecord(null)}
        onExportPdf={exportRecordPdf}
        onExportJson={exportRecordJson}
        onOpenTenderWizard={onOpenTenderWizard}
      />
    </div>
  );
};
