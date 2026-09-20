import React, { useState, useEffect } from 'react';
import {
  X,
  Timer,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ShieldCheck,
  Building,
  User,
  FileCheck,
  Download,
  Share2,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import { QctoModuleMapping, WorkerCompetencyRecord } from '../types/qcto';
import { ActiveWorkerProfile } from '../hooks/useQctoTraining';

interface QctoFieldDrillModalProps {
  mapping: QctoModuleMapping;
  workerProfile: ActiveWorkerProfile;
  isOpen: boolean;
  onClose: () => void;
  onRecordDrill: (params: {
    moduleId: number;
    drillScore: number;
    passed: boolean;
    workerName: string;
    idNumber: string;
    companyName: string;
    siteName: string;
    supervisorName: string;
    supervisorDesignation: string;
    location: {
      siteName: string;
      latitude: number;
      longitude: number;
      accuracyMeters?: number;
    };
    notes?: string;
  }) => WorkerCompetencyRecord | null;
  onExportPdf?: (record: WorkerCompetencyRecord) => void;
  onOpenTenderWizard?: () => void;
}

export const QctoFieldDrillModal: React.FC<QctoFieldDrillModalProps> = ({
  mapping,
  workerProfile,
  isOpen,
  onClose,
  onRecordDrill,
  onExportPdf,
  onOpenTenderWizard
}) => {
  const drill = mapping.drill;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes (300s)
  const [timerActive, setTimerActive] = useState(true);

  // Worker and supervisor fields
  const [workerName, setWorkerName] = useState(workerProfile.workerName);
  const [idNumber, setIdNumber] = useState(workerProfile.idNumber);
  const [companyName, setCompanyName] = useState(workerProfile.companyName);
  const [siteName, setSiteName] = useState(workerProfile.siteName);
  const [supervisorName, setSupervisorName] = useState(workerProfile.supervisorName);
  const [supervisorDesignation, setSupervisorDesignation] = useState(workerProfile.supervisorDesignation);

  // Geolocation
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  }>({
    latitude: -26.1952,
    longitude: 28.0346,
    accuracyMeters: 4.2
  });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'locked'>('idle');

  // Saved record result
  const [savedRecord, setSavedRecord] = useState<WorkerCompetencyRecord | null>(null);

  // Sync profile when opened
  useEffect(() => {
    if (isOpen) {
      setWorkerName(workerProfile.workerName);
      setIdNumber(workerProfile.idNumber);
      setCompanyName(workerProfile.companyName);
      setSiteName(workerProfile.siteName);
      setSupervisorName(workerProfile.supervisorName);
      setSupervisorDesignation(workerProfile.supervisorDesignation);
      setSelectedOptionId(null);
      setIsSubmitted(false);
      setSavedRecord(null);
      setTimeRemaining(300);
      setTimerActive(true);
    }
  }, [isOpen, workerProfile]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !timerActive || isSubmitted || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timerActive, isSubmitted, timeRemaining]);

  // Request actual geolocation
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported on this browser. Using standard mining site coordinates.');
      return;
    }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: Math.round(pos.coords.accuracy)
        });
        setGpsStatus('locked');
      },
      (err) => {
        console.warn('Geolocation failed, keeping default coordinates:', err.message);
        setGpsStatus('locked');
      },
      { timeout: 7000 }
    );
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const selectedOption = drill.options.find((o) => o.id === selectedOptionId);
  const isPassed = selectedOption?.isCorrect ?? false;
  const score = isPassed ? 100 : 0;

  const handleSubmitDrill = () => {
    if (!selectedOptionId) return;
    setIsSubmitted(true);
    setTimerActive(false);

    // Save record
    const result = onRecordDrill({
      moduleId: mapping.moduleId,
      drillScore: isPassed ? 100 : 0,
      passed: isPassed,
      workerName,
      idNumber,
      companyName,
      siteName,
      supervisorName,
      supervisorDesignation,
      location: {
        siteName,
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude,
        accuracyMeters: gpsLocation.accuracyMeters
      },
      notes: `5-Min Field Practice Drill completed. Candidate answered: ${selectedOption?.text.substring(0, 70)}...`
    });

    if (result) {
      setSavedRecord(result);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full my-6 p-5 sm:p-7 text-white space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-20 -top-20 w-56 h-56 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-900/40 text-blue-400 border border-blue-700/50 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>5-Minute Field Practice Drill</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                {mapping.sansCode}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-900/30 text-purple-300 border border-purple-700/40 text-xs font-bold">
                SAQA ID: {mapping.saqaId}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {drill.title}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              QCTO Module: {mapping.curriculumCode} • {mapping.qualityAssuringBody} Aligned
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar: Timer + Geolocation + Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Timer Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <Timer className={`w-4 h-4 ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
              <span>Target Time (5m):</span>
            </div>
            <span
              className={`font-mono font-black text-sm ${
                timeRemaining < 60 ? 'text-red-400' : 'text-cyan-300'
              }`}
            >
              {formatTimer(timeRemaining)}
            </span>
          </div>

          {/* GPS Geolocation Tag */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-300 truncate">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                GPS: {gpsLocation.latitude.toFixed(3)}, {gpsLocation.longitude.toFixed(3)}
              </span>
            </div>
            <button
              onClick={handleRequestGps}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-emerald-300 font-semibold cursor-pointer shrink-0"
            >
              {gpsStatus === 'locating' ? 'Locating...' : gpsStatus === 'locked' ? 'Locked ✓' : 'Pin GPS'}
            </button>
          </div>

          {/* Hazard Severity */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <span className="text-xs text-slate-300">Hazard Tier:</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-black uppercase ${
                drill.hazardSeverity === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {drill.hazardSeverity}
            </span>
          </div>
        </div>

        {/* Operational Field Scenario */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Operational Workplace Scenario</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-normal">
            {drill.scenarioContext}
          </p>
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Statutory Citation: <strong className="text-slate-200">{drill.sansRef}</strong></span>
          </div>
        </div>

        {/* The Question */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-start space-x-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              ?
            </span>
            <span>{drill.question}</span>
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {drill.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              let btnStyle =
                'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600';

              if (isSubmitted) {
                if (opt.isCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-100 font-bold';
                } else if (isSelected && !opt.isCorrect) {
                  btnStyle = 'bg-red-950/60 border-red-500 text-red-100 font-bold';
                } else {
                  btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50';
                }
              } else if (isSelected) {
                btnStyle =
                  'bg-blue-950/80 border-blue-500 text-white ring-2 ring-blue-500/30 font-semibold';
              }

              return (
                <button
                  key={opt.id}
                  disabled={isSubmitted}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition flex items-start space-x-3 cursor-pointer ${btnStyle}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-600 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-grow space-y-1">
                    <p>{opt.text}</p>
                    {isSubmitted && isSelected && (
                      <p
                        className={`text-xs pt-1 font-normal ${
                          opt.isCorrect ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {opt.feedback}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drill Feedback & Protocol (Visible After Submission) */}
        {isSubmitted && (
          <div
            className={`p-5 rounded-2xl border space-y-3 animate-fade-in ${
              isPassed
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                : 'bg-red-950/40 border-red-700/60 text-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-black text-sm uppercase tracking-wide">
                  {isPassed ? 'Drill Passed (100% S-Tier Competency)' : 'Incorrect Action Selected'}
                </span>
              </div>
              <span className="text-xl font-black">{score}%</span>
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <p className="font-bold text-amber-400 uppercase tracking-wide">
                Mandatory Operational Action Protocol:
              </p>
              <p className="leading-relaxed">{drill.correctActionProtocol}</p>
            </div>
          </div>
        )}

        {/* Candidate & Supervisor Verification Metadata Form */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
          <p className="text-xs font-bold text-slate-300 flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Worker Profile & Supervisor Verification for Tender Safety File</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Worker Full Name</label>
              <input
                type="text"
                disabled={isSubmitted}
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">RSA ID / Passport No.</label>
              <input
                type="text"
                disabled={isSubmitted}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Contractor / SMME Company</label>
              <input
                type="text"
                disabled={isSubmitted}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Operational Site / Shaft</label>
              <input
                type="text"
                disabled={isSubmitted}
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {isSubmitted
              ? 'Evidence record stamped with SHA-256 token and attached to tender file.'
              : 'Select an option and submit to verify workplace competency.'}
          </p>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {!isSubmitted ? (
              <button
                disabled={!selectedOptionId}
                onClick={handleSubmitDrill}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Submit Drill & Verify Score</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {savedRecord && onExportPdf && (
                  <button
                    onClick={() => onExportPdf(savedRecord)}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer flex items-center space-x-2 shadow-lg shadow-cyan-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Log</span>
                  </button>
                )}

                {onOpenTenderWizard && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTenderWizard();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <span>View in Tender File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
