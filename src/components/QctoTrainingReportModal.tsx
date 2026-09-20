import React from 'react';
import {
  X,
  FileCheck,
  Download,
  FileCode,
  ShieldCheck,
  Building,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { WorkerCompetencyRecord } from '../types/qcto';
import { QCTO_DISCLAIMER_TEXT, QCTO_MODULE_MAPPINGS } from '../data/qctoCurriculumData';

interface QctoTrainingReportModalProps {
  record: WorkerCompetencyRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onExportPdf: (record: WorkerCompetencyRecord) => void;
  onExportJson: (record: WorkerCompetencyRecord) => void;
  onOpenTenderWizard?: () => void;
}

export const QctoTrainingReportModal: React.FC<QctoTrainingReportModalProps> = ({
  record,
  isOpen,
  onClose,
  onExportPdf,
  onExportJson,
  onOpenTenderWizard
}) => {
  if (!isOpen || !record) return null;

  const mapping = QCTO_MODULE_MAPPINGS.find((m) => m.moduleId === record.moduleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full my-6 p-5 sm:p-7 text-white space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-20 -top-20 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 text-xs font-bold">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Workplace Safety Training Log & Competency Report</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-xs font-bold">
                VERIFIED TENDER EVIDENCE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {record.workerName} • {record.moduleName}
            </h2>
            <p className="text-slate-400 text-xs font-mono">
              Verification Stamp: <span className="text-amber-400">{record.verificationStamp}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>MeloTwo Non-Accredited SDP Operational Companion Disclosure</span>
          </div>
          <p className="leading-relaxed text-slate-300 text-[11px] sm:text-xs">
            {QCTO_DISCLAIMER_TEXT}
          </p>
        </div>

        {/* Evidence Card Preview */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5">
          {/* Top Bar with score */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-medium">Candidate & SMME Record</span>
              <h3 className="text-lg font-black text-white">{record.workerName}</h3>
              <p className="text-xs text-slate-400">
                RSA ID: <span className="font-mono text-slate-200">{record.idNumber}</span> • {record.companyName}
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Drill Score</span>
                <span className="text-xl font-black text-emerald-400">{record.drillScore}%</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">SANS Statutory Code</span>
              <p className="font-bold text-slate-200">{record.moduleName}</p>
              <p className="text-[11px] text-slate-400">Ref: {record.sansRef}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Registered SAQA Qualification</span>
              <p className="font-bold text-purple-300">SAQA ID: {record.saqaId}</p>
              <p className="text-[11px] text-slate-400">
                Curriculum: <span className="font-mono">{record.curriculumCode}</span> (NQF {mapping?.nqfLevel || 4})
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Operational Site & GPS Tag</span>
              <p className="font-bold text-slate-200">{record.location.siteName}</p>
              <p className="text-[11px] text-emerald-400 font-mono">
                Lat: {record.location.latitude.toFixed(4)}, Lon: {record.location.longitude.toFixed(4)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Appointed Safety Supervisor</span>
              <p className="font-bold text-slate-200">{record.supervisorName}</p>
              <p className="text-[11px] text-cyan-400">{record.supervisorDesignation}</p>
            </div>
          </div>

          {/* Verification Trail */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Tender Safety Dossier Placement:</span>
              <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800/40 text-[10px] font-bold">
                Section 07: Proof of Worker Competency
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Completed At: {record.completedAt} • Complies with MHSA Section 10 & OHSA Construction Reg 9 for mining contractor pre-qualification.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically sealed for audit defensibility</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onExportJson(record)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 border border-slate-700"
            >
              <FileCode className="w-4 h-4 text-purple-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => onExportPdf(record)}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Log</span>
            </button>

            {onOpenTenderWizard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTenderWizard();
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
              >
                <span>Attach to Tender File</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
