import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  HardHat,
  Cpu,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Users,
  Building2,
  Calendar,
  Clock,
  Zap,
  Lock,
  Unlock,
  Key,
  Flame,
  Activity,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  Plus,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  BarChart3,
  Percent,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  DailyComplianceSignOff,
  StatutoryLegalAppointment,
  HighRiskOperationalPermit,
  SafetyFileBinderDossier,
  OperatorCredentialProfile,
  HeavyMachineAsset,
  MachineAssignmentEvaluation,
  TradeQualificationRecord,
  WorkplaceSkillsPlanSummary,
  AnnualTrainingReportSummary,
  BbeeSkillsScorecardSummary,
  Tier1HostSite
} from '../types/complianceEngine';
import {
  fetchDailySignOffs,
  createDailySignOff,
  fetchStatutoryAppointments,
  createStatutoryAppointment,
  fetchHighRiskPermits,
  createHighRiskPermit,
  fetchSafetyFileBinder,
  fetchOperators,
  fetchMachines,
  evaluateMachineAssignment,
  fetchTradeCandidates,
  verifyTradeCandidate,
  fetchSkillsDevelopmentReports,
  exportSafetyFileBinderPdf
} from '../services/complianceEngineService';

export interface OperationalComplianceHubProps {
  onBack?: () => void;
  onOpenTenderWizard?: () => void;
}

export const OperationalComplianceHub: React.FC<OperationalComplianceHubProps> = ({
  onBack,
  onOpenTenderWizard
}) => {
  // Navigation Tabs for the 3 Core Functional Pillars
  const [activePillar, setActivePillar] = useState<'PILLAR_1' | 'PILLAR_2' | 'PILLAR_3'>('PILLAR_1');

  // Pillar 1 States: Safety Files & Statutory Appointments
  const [pillar1SubTab, setPillar1SubTab] = useState<'SIGN_OFFS' | 'APPOINTMENTS' | 'PERMITS' | 'BINDER'>('BINDER');
  const [signOffs, setSignOffs] = useState<DailyComplianceSignOff[]>([]);
  const [appointments, setAppointments] = useState<StatutoryLegalAppointment[]>([]);
  const [permits, setPermits] = useState<HighRiskOperationalPermit[]>([]);
  const [selectedHostSite, setSelectedHostSite] = useState<Tier1HostSite>('ANGLO_AMERICAN');
  const [binderDossier, setBinderDossier] = useState<SafetyFileBinderDossier | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // New Item Modals for Pillar 1
  const [isNewSignOffOpen, setIsNewSignOffOpen] = useState(false);
  const [newSignOffTitle, setNewSignOffTitle] = useState('');
  const [newSignOffType, setNewSignOffType] = useState<any>('BASELINE_HIRA');
  const [newSignOffSupervisor, setNewSignOffSupervisor] = useState('Sipho Sithole (Mine Overseer)');
  const [newSignOffRisk, setNewSignOffRisk] = useState<any>('LOW');

  const [isNewPermitOpen, setIsNewPermitOpen] = useState(false);
  const [newPermitType, setNewPermitType] = useState<any>('HOT_WORK');
  const [newPermitLocation, setNewPermitLocation] = useState('Substation 4B / High-Tension Switchgear');
  const [newPermitIssuer, setNewPermitIssuer] = useState('Johan van der Merwe (GCC Engineer)');
  const [newPermitReceiver, setNewPermitReceiver] = useState('Thulani Mthembu (Master Artisan)');

  // Pillar 2 States: Operator VR Credentials & Machine Rule Engine
  const [operators, setOperators] = useState<OperatorCredentialProfile[]>([]);
  const [machines, setMachines] = useState<HeavyMachineAsset[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('OP-001');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('EQ-LHD-01');
  const [assignmentEvaluation, setAssignmentEvaluation] = useState<MachineAssignmentEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Pillar 3 States: SETA/QCTO & TVET Skills Verification
  const [tradeCandidates, setTradeCandidates] = useState<TradeQualificationRecord[]>([]);
  const [wspData, setWspData] = useState<WorkplaceSkillsPlanSummary | null>(null);
  const [atrData, setAtrData] = useState<AnnualTrainingReportSummary | null>(null);
  const [bbeeData, setBbeeData] = useState<BbeeSkillsScorecardSummary | null>(null);
  const [verifyingCandidateId, setVerifyingCandidateId] = useState<string | null>(null);
  const [certInput, setCertInput] = useState('RS-NAMB-2026-9941');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Data Loading
  useEffect(() => {
    loadAllData();
  }, [selectedHostSite]);

  const loadAllData = async () => {
    // Pillar 1
    const sList = await fetchDailySignOffs();
    setSignOffs(sList);
    const aList = await fetchStatutoryAppointments();
    setAppointments(aList);
    const pList = await fetchHighRiskPermits();
    setPermits(pList);
    const bDossier = await fetchSafetyFileBinder(selectedHostSite);
    setBinderDossier(bDossier);

    // Pillar 2
    const opList = await fetchOperators();
    setOperators(opList);
    const mList = await fetchMachines();
    setMachines(mList);

    // Pillar 3
    const cList = await fetchTradeCandidates();
    setTradeCandidates(cList);
    const repData = await fetchSkillsDevelopmentReports();
    if (repData) {
      setWspData(repData.wspSummary);
      setAtrData(repData.atrSummary);
      setBbeeData(repData.bbeeScorecard);
    }
  };

  // Evaluate machine assignment on demand
  const handleRunMachineEvaluation = async () => {
    setIsEvaluating(true);
    const result = await evaluateMachineAssignment(selectedOperatorId, selectedMachineId);
    setAssignmentEvaluation(result);
    setIsEvaluating(false);
    if (result) {
      if (result.isAuthorized) {
        showToast(`Authorization Approved: Startup permit ${result.startupPermitId} generated.`);
      } else {
        showToast(`Compliance Lockout: ${result.criticalBlockers.length} statutory rule violations detected.`);
      }
    }
  };

  // Create daily sign-off handler
  const handleCreateSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignOffTitle) return;
    const res = await createDailySignOff({
      title: newSignOffTitle,
      type: newSignOffType,
      supervisorName: newSignOffSupervisor,
      residualRiskRating: newSignOffRisk,
      hazardCategories: ['Operational Machinery', 'Underground Atmosphere', 'Personnel Proximity'],
      controlMeasuresApplied: ['Full PPE donning', 'Barricade established', 'Continuous telemetry active']
    });
    if (res) {
      setSignOffs(prev => [res, ...prev]);
      setIsNewSignOffOpen(false);
      setNewSignOffTitle('');
      showToast('Daily compliance sign-off recorded in audit ledger.');
    }
  };

  // Create high-risk permit handler
  const handleCreatePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createHighRiskPermit({
      permitType: newPermitType,
      exactWorkLocation: newPermitLocation,
      issuerName: newPermitIssuer,
      receiverName: newPermitReceiver,
      validHours: 8
    });
    if (res) {
      setPermits(prev => [res, ...prev]);
      setIsNewPermitOpen(false);
      showToast(`Permit ${res.permitNumber} successfully authorized and activated.`);
    }
  };

  // Verify candidate trade credential handler
  const handleVerifyCandidate = async (candidateId: string) => {
    setVerifyingCandidateId(candidateId);
    const res = await verifyTradeCandidate(candidateId, certInput, 'NAMB-ZA-2026-VAL');
    setVerifyingCandidateId(null);
    if (res) {
      setTradeCandidates(prev => prev.map(c => c.id === candidateId ? res : c));
      showToast(`Trade Test verified on NAMB registry for ${res.candidateName}!`);
    }
  };

  // PDF Export trigger
  const handleExportPdf = () => {
    if (!binderDossier) return;
    setIsExportingPdf(true);
    try {
      exportSafetyFileBinderPdf(binderDossier);
      showToast(`100% Audit-Ready PDF Binder generated for ${binderDossier.hostSiteDisplayName}`);
    } catch (e) {
      console.error(e);
      showToast('Failed to export PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                South African MHSA &amp; SETA/QCTO Engine
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                SADC Tier-1 Pre-Qualified
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              Operational, Safety &amp; SETA Compliance Engine
            </h1>
            <p className="text-xs text-slate-400 font-sans max-w-2xl">
              Automated statutory legal appointments, VR operator simulator machine authorization rule engine, and verified SETA/QCTO trade learnership tracker.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenTenderWizard && (
              <button
                onClick={onOpenTenderWizard}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Tender Safety File Wizard</span>
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Back to Platform
              </button>
            )}
          </div>
        </div>

        {/* 3 Core Pillar Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActivePillar('PILLAR_1')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activePillar === 'PILLAR_1'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pillar 1: Automated Safety File &amp; Statutory Verification</span>
          </button>

          <button
            onClick={() => setActivePillar('PILLAR_2')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activePillar === 'PILLAR_2'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Pillar 2: VR Simulator &amp; Machine Authorization</span>
          </button>

          <button
            onClick={() => setActivePillar('PILLAR_3')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activePillar === 'PILLAR_3'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Pillar 3: SETA, QCTO &amp; TVET Skills Tracker</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ================================================================= */}
        {/* PILLAR 1: AUTOMATED SAFETY FILE & STATUTORY VERIFICATION          */}
        {/* ================================================================= */}
        {activePillar === 'PILLAR_1' && (
          <div className="space-y-6">
            {/* Pillar 1 Sub-Tab Selector */}
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {[
                  { key: 'BINDER', label: '100% Audit Ready Digital Binder', icon: FileText },
                  { key: 'APPOINTMENTS', label: 'Statutory Legal Appointments (MHSA 2.9.2 / 2.6.1)', icon: Users },
                  { key: 'PERMITS', label: 'High-Risk Operational Permits (WAH, Hot Work, LOTO)', icon: Flame },
                  { key: 'SIGN_OFFS', label: 'Daily Sign-Offs (HIRA, SWP, SOP)', icon: CheckCircle2 }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setPillar1SubTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      pillar1SubTab === tab.key
                        ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {pillar1SubTab === 'SIGN_OFFS' && (
                <button
                  onClick={() => setIsNewSignOffOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Daily Sign-Off</span>
                </button>
              )}

              {pillar1SubTab === 'PERMITS' && (
                <button
                  onClick={() => setIsNewPermitOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue High-Risk Permit</span>
                </button>
              )}
            </div>

            {/* SUB-VIEW 1: TIER-1 HOST SITE DIGITAL BINDER */}
            {pillar1SubTab === 'BINDER' && (
              <div className="space-y-6">
                {/* Host Site Selector & Audit Readiness Scorecard */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                        Tier-1 Host Site Pre-Qualification Matrix
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Digital Safety File Compilation &amp; Audit Dossier
                      </h2>
                      <p className="text-xs text-slate-400 font-sans max-w-xl">
                        Select host mining house to compile site-specific returnable schedules adhering to DMR regulations, COIDA, SANS standards, and Fatal Risk Protocols.
                      </p>
                    </div>

                    {/* Host Site Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { key: 'ANGLO_AMERICAN', label: 'Anglo American', sub: 'Platinum / Kumba' },
                        { key: 'SIBANYE_STILLWATER', label: 'Sibanye-Stillwater', sub: 'Deep Reef Gold & PGM' },
                        { key: 'VALTERRA_PLATINUM', label: 'Valterra Platinum', sub: 'PPR Mechanised' },
                        { key: 'IVANPLATS', label: 'Ivanplats', sub: 'Platreef Complex' }
                      ].map(site => (
                        <button
                          key={site.key}
                          onClick={() => setSelectedHostSite(site.key as any)}
                          className={`px-3 py-2 rounded-xl text-left border transition cursor-pointer ${
                            selectedHostSite === site.key
                              ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold leading-tight">{site.label}</div>
                          <div className="text-[9px] font-mono text-slate-500">{site.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audit Readiness Banner */}
                  {binderDossier && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Audit Readiness State</span>
                        <div className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>{binderDossier.auditReadinessState}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Zero gate-rejection defects</span>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Statutory Compliance Score</span>
                        <div className="text-2xl font-black text-white mt-1 font-mono">
                          {binderDossier.overallAuditScorePct}%
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">10/10 Sections Verified</span>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Host Mining House Target</span>
                        <div className="text-sm font-bold text-slate-200 mt-1 truncate">
                          {binderDossier.hostSiteDisplayName}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Valid 90 Days</span>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center">
                        <button
                          onClick={handleExportPdf}
                          disabled={isExportingPdf}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-950/40"
                        >
                          <Download className="w-4 h-4" />
                          <span>{isExportingPdf ? 'Generating PDF...' : 'Download Full PDF Binder'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 10 Statutory Binder Returnable Sections */}
                {binderDossier && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                      10 Statutory Returnable Schedules Attached to Safety File
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {binderDossier.sections.map((sec) => (
                        <div
                          key={sec.sectionCode}
                          className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {sec.sectionCode}
                              </span>
                              <h4 className="text-sm font-bold text-white mt-1">{sec.title}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">{sec.statutoryReference}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{sec.status}</span>
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>Attached: <strong className="text-slate-200">{sec.documentsAttached} documents</strong></span>
                            <span>Audited: {sec.lastAuditDate}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {sec.requiredDocuments.map((doc, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800"
                              >
                                ✓ {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 2: STATUTORY LEGAL APPOINTMENTS */}
            {pillar1SubTab === 'APPOINTMENTS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Statutory Appointments Governance Register</h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Mandatory legally appointed officials under Mine Health &amp; Safety Act (MHSA) and Occupational Health &amp; Safety Act (OHSA).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {appt.act} Section {appt.sectionCode.replace(/_/g, ' ')}
                          </span>
                          <h4 className="text-base font-bold text-white">{appt.appointeeName}</h4>
                          <p className="text-xs text-slate-300 font-medium">{appt.appointeeDesignation}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{appt.certificateOfCompetency}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                          appt.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {appt.status} ({appt.daysUntilExpiry}d left)
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <div className="font-bold text-slate-200">Gazetted Legal Scope:</div>
                        <p className="text-slate-400 leading-relaxed font-sans">{appt.gazettedLegalScope}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                        <div>Shaft / Scope: <strong className="text-slate-200 block truncate">{appt.appointedAreaOrShaft}</strong></div>
                        <div>Appointing Authority: <strong className="text-slate-200 block truncate">{appt.appointingAuthorityName}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: HIGH-RISK OPERATIONAL PERMITS */}
            {pillar1SubTab === 'PERMITS' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">High-Risk Shift Operational Permits</h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Live shift clearance for Working-at-Height, Hot Work, Confined Space Entry, and LOTO Zero-Energy Isolation.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {permits.map((perm) => (
                    <div
                      key={perm.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {perm.permitNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{Math.round(perm.minsRemaining / 60)}h remaining</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{perm.permitType.replace(/_/g, ' ')}</h4>
                          <p className="text-[11px] text-slate-300 font-mono mt-0.5">{perm.exactWorkLocation}</p>
                        </div>

                        {/* Gas test readings if Confined Space */}
                        {perm.gasTest && (
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[10px]">
                            <div className="text-cyan-400 font-bold flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>Calibrated Gas Testing Protocol:</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-slate-300">
                              <span>O₂: {perm.gasTest.o2Percentage}%</span>
                              <span>LEL: {perm.gasTest.lelPercentage}%</span>
                              <span>CO: {perm.gasTest.coPpm} ppm</span>
                            </div>
                            <div className="text-slate-500 text-[9px]">Tested by: {perm.gasTest.testedBy}</div>
                          </div>
                        )}

                        {/* LOTO points if Energy Isolation */}
                        {perm.lotoPoints && (
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[10px]">
                            <div className="text-amber-400 font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>LOTO Zero-Energy Padlocks:</span>
                            </div>
                            {perm.lotoPoints.map((pt, idx) => (
                              <div key={idx} className="text-slate-300 flex items-center justify-between">
                                <span>{pt.equipmentTag} ({pt.isolationType})</span>
                                <span className="text-emerald-400">✓ {pt.padlockNumber}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Checklist */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Mandatory Checks:</span>
                          {perm.safetyChecklist.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{item.item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Issuer: {perm.issuerName}</span>
                        <span>Team: {perm.receiverTeamCount} Artisans</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 4: DAILY OPERATIONAL SIGN-OFFS */}
            {pillar1SubTab === 'SIGN_OFFS' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Daily Operational Risk Sign-Offs (HIRA / SWP / SOP)</h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Pre-shift continuous hazard evaluations verified on site with supervisory cryptographic sign-off.
                  </p>
                </div>

                <div className="space-y-3">
                  {signOffs.map((so) => (
                    <div
                      key={so.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                            {so.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {so.date} &bull; {so.shift.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Residual Risk: {so.residualRiskRating}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white">{so.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{so.taskDescription}</p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {so.controlMeasuresApplied.map((ctrl, idx) => (
                            <span key={idx} className="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                              🛡️ {ctrl}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-[11px] text-slate-400 space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5">
                        <div className="text-slate-200 font-bold">{so.supervisorName}</div>
                        <div>Team Size: {so.teamMembersCount} Artisans</div>
                        <div className="text-[9px] text-cyan-400 truncate max-w-xs">Hash: {so.supervisorSignatureHash}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PILLAR 2: VR/SIMULATOR OPERATOR QUALIFICATION & MACHINE ENGINE   */}
        {/* ================================================================= */}
        {activePillar === 'PILLAR_2' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                Pillar 2: Real-Time Equipment Authorization
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                VR/Simulator Operator Qualification &amp; Machine Assignment Rule Engine
              </h2>
              <p className="text-xs text-slate-400 font-sans max-w-3xl">
                Enforce machine startup safety by synchronizing OEM simulator credentials (Epiroc, Immersive Technologies), statutory Annexure 3 medical fitness certificates, and machine class licenses. Automatically blocks uncertified operators from equipment rosters.
              </p>
            </div>

            {/* LIVE MACHINE ASSIGNMENT EVALUATION SANDBOX */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Machine Assignment Rule Engine Sandbox</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                  6-Rule Statutory Cross-Check
                </span>
              </div>

              {/* Selectors for Operator and Machine */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Operator */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                    Select Operator Candidate:
                  </label>
                  <select
                    value={selectedOperatorId}
                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.operatorName} ({op.primaryMachineClass} - Med: {op.medicalFitness.isExpired ? 'EXPIRED' : 'VALID'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Heavy Machinery Asset */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                    Select Heavy Machinery Asset:
                  </label>
                  <select
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {machines.map((m) => (
                      <option key={m.assetId} value={m.assetId}>
                        {m.modelName} ({m.operationalDomain} - {m.assetTag})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Run Evaluation CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-sans">
                  Cross-references medical Annexure 3, VR simulation threshold (&ge;85%), OEM class license, and shift fatigue limits.
                </span>
                <button
                  type="button"
                  onClick={handleRunMachineEvaluation}
                  disabled={isEvaluating}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-950/40"
                >
                  <Cpu className="w-4 h-4" />
                  <span>{isEvaluating ? 'Cross-Referencing Rules...' : 'Evaluate Machine Authorization'}</span>
                </button>
              </div>

              {/* Evaluation Result Display */}
              {assignmentEvaluation && (
                <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in duration-300 ${
                  assignmentEvaluation.isAuthorized
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/40'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {assignmentEvaluation.isAuthorized ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400" />
                      )}
                      <div>
                        <div className={`text-base font-black ${
                          assignmentEvaluation.isAuthorized ? 'text-emerald-300' : 'text-rose-300'
                        }`}>
                          {assignmentEvaluation.authorizationCode === 'PERMIT_ISSUED' 
                            ? 'AUTHORIZED - STARTUP PERMIT ISSUED' 
                            : 'COMPLIANCE LOCKOUT - ACCESS DENIED'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Operator: <strong className="text-white">{assignmentEvaluation.operatorName}</strong> &bull; Machine: <strong className="text-white">{assignmentEvaluation.machineModel}</strong>
                        </div>
                      </div>
                    </div>

                    {assignmentEvaluation.isAuthorized && (
                      <div className="text-right font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-600/30">
                        <div>Permit: <strong>{assignmentEvaluation.startupPermitId}</strong></div>
                        <div className="text-[8px] text-slate-400 truncate max-w-xs">Hash: {assignmentEvaluation.authorizationHash}</div>
                      </div>
                    )}
                  </div>

                  {/* Critical Lockout Blockers if failed */}
                  {!assignmentEvaluation.isAuthorized && assignmentEvaluation.criticalBlockers.length > 0 && (
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-500/30 space-y-2">
                      <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase font-mono">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Statutory Lockout Blockers ({assignmentEvaluation.criticalBlockers.length}):</span>
                      </div>
                      <div className="space-y-1.5">
                        {assignmentEvaluation.ruleChecks.filter(r => !r.passed).map((rule, idx) => (
                          <div key={idx} className="text-xs text-rose-200 font-sans flex items-start gap-2">
                            <span className="font-mono text-rose-400 font-bold shrink-0">[{rule.ruleCode}]</span>
                            <span>{rule.failureReason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complete Rule Audit Trail Breakdown */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Individual Rule Check Breakdown:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {assignmentEvaluation.ruleChecks.map((check, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between"
                        >
                          <span className="text-slate-300 truncate max-w-xs">{check.ruleDescription}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            check.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {check.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Operator Credential Cards Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Operator Simulator Credentials &amp; Medical Fitness Registry ({operators.length} Operators)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {operators.map((op) => (
                  <div
                    key={op.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                            {op.employeeNumber}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {op.primaryMachineClass}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{op.operatorName}</h4>
                        <p className="text-xs text-slate-400">{op.contractorCompany}</p>
                      </div>

                      {/* Medical Status Pill */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                        !op.medicalFitness.isExpired
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}>
                        {op.medicalFitness.isExpired ? 'MEDICAL EXPIRED' : 'MEDICAL VALID'}
                      </span>
                    </div>

                    {/* Simulator Training Output */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center justify-between">
                        <span>VR Simulator Output:</span>
                        <span>{op.simulatorCertifications[0]?.simulatorOem || 'OEM'}</span>
                      </div>
                      {op.simulatorCertifications[0] ? (
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300">
                          <div>Hazard Score: <strong className={op.simulatorCertifications[0].hazardAvoidanceScorePct >= 85 ? 'text-emerald-400' : 'text-rose-400'}>
                            {op.simulatorCertifications[0].hazardAvoidanceScorePct}%
                          </strong></div>
                          <div>Reaction: <strong className="text-cyan-400">{op.simulatorCertifications[0].reactionTimeSeconds}s</strong></div>
                          <div>Hours: <strong className="text-slate-200">{op.simulatorCertifications[0].virtualHoursLogged}h</strong></div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 font-mono">No simulation tests logged</div>
                      )}
                    </div>

                    {/* Medical details */}
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
                      <span>Annexure 3: {op.medicalFitness.certificateNumber}</span>
                      <span>Expires: {op.medicalFitness.expiryDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PILLAR 3: SETA, QCTO & TVET SKILLS TRACKER                        */}
        {/* ================================================================= */}
        {activePillar === 'PILLAR_3' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                Pillar 3: National Skills Accord &amp; Trade Recognition
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                SETA, QCTO &amp; TVET Skills Verification &amp; Learnership Tracker
              </h2>
              <p className="text-xs text-slate-400 font-sans max-w-3xl">
                Standardize artisan trade credential tracking across MQA, MERSETA, CETA, and TVET Colleges. Automates annual Workplace Skills Plans (WSP), Annual Training Reports (ATR), and B-BBEE Element 400 Scorecard reporting.
              </p>
            </div>

            {/* WSP, ATR & B-BBEE Scorecards Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WSP Card */}
              {wspData && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                      Workplace Skills Plan (WSP)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Due 30 April
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {wspData.totalPlannedTrainingInterventions} Planned
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Leviable Payroll: <strong className="text-white font-mono">R{(wspData.leviablePayrollAmountZar / 1000000).toFixed(1)}M</strong>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    Mandatory Grant Claim: <strong className="text-amber-400">R{wspData.estimatedMandatoryGrantClaimZar.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              {/* ATR Card */}
              {atrData && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Annual Training Report (ATR)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {atrData.statutoryAuditReadiness}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {atrData.actualBeneficiariesCompleted} Completed
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Achievement vs WSP: <strong className="text-emerald-400 font-mono">{atrData.plannedVsActualAchievementPct}%</strong>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    Completed Apprenticeships: <strong className="text-cyan-300">{atrData.completedApprenticeshipsCount} Artisans</strong>
                  </div>
                </div>
              )}

              {/* B-BBEE Scorecard Card */}
              {bbeeData && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      B-BBEE Skills (Element 400)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {bbeeData.status}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {bbeeData.totalSkillsPointsEarned} / {bbeeData.maxSkillsPoints} Pts
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Absorption Bonus: <strong className="text-emerald-400 font-mono">+{bbeeData.absorptionBonusPointsEarned} Pts (100% Rate)</strong>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    Black Learners Target: <strong className="text-emerald-300">5.4% (Target 5.0% Exceeded)</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Onboarding & Trade Certification Verification Pipeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Artisan Trade Test &amp; Learnership Candidate Roster</h3>
                  <p className="text-xs text-slate-400 font-sans">
                    NAMB verified Red Seal certifications (Section 26D), TVET diplomas, and logbook completion tracking.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {tradeCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                          {cand.seta} &bull; OFO {cand.ofoCode}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {cand.academicQualification.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          cand.tradeTestCertification.status === 'RED_SEAL_CERTIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {cand.tradeTestCertification.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{cand.candidateName}</h4>
                      <p className="text-xs text-slate-300 font-medium">{cand.tradeTitle}</p>
                      <p className="text-[11px] text-slate-400 font-mono">College: {cand.tvetCollege} | ID: {cand.idNumber}</p>

                      {/* Logbook Progress Bar */}
                      <div className="space-y-1 pt-1 max-w-md">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Logbook Practical Hours:</span>
                          <span className="text-white font-bold">{cand.logbookProgress.hoursLogged} / {cand.logbookProgress.totalRequiredHours}h ({cand.logbookProgress.percentageCompleted}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${cand.logbookProgress.percentageCompleted}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Verification Actions on Right */}
                    <div className="shrink-0 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-5 text-right font-mono text-xs">
                      {cand.tradeTestCertification.status === 'RED_SEAL_CERTIFIED' ? (
                        <div className="space-y-1">
                          <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>NAMB Red Seal Verified</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Cert: {cand.tradeTestCertification.redSealCertificateNumber}</div>
                          <div className="text-[9px] text-slate-500">Center: {cand.tradeTestCertification.tradeTestCenter}</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleVerifyCandidate(cand.id)}
                            disabled={verifyingCandidateId === cand.id}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>{verifyingCandidateId === cand.id ? 'Querying NAMB Database...' : 'Verify Red Seal Pass'}</span>
                          </button>
                          <div className="text-[9px] text-slate-500">Apprentice Logbook Active</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* MODAL 1: NEW DAILY COMPLIANCE SIGN-OFF MODAL                        */}
      {/* =================================================================== */}
      {isNewSignOffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                Log Daily Operational Compliance Sign-Off
              </h3>
              <button onClick={() => setIsNewSignOffOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSignOff} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Sign-Off Type:</label>
                <select
                  value={newSignOffType}
                  onChange={(e) => setNewSignOffType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                >
                  <option value="BASELINE_HIRA">Baseline Risk Assessment (HIRA)</option>
                  <option value="ISSUE_BASED_RISK_ASSESSMENT">Issue-Based Pre-Shift Risk Assessment</option>
                  <option value="SAFE_WORK_PROCEDURE_SWP">Safe Work Procedure (SWP) Sign-Off</option>
                  <option value="WRITTEN_SOP_SIGN_OFF">Written Safe Operating Procedure (SOP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Title / Task Description:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., SWP-055: High-Voltage Transformer Oil Sampling"
                  value={newSignOffTitle}
                  onChange={(e) => setNewSignOffTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Supervisor In Charge:</label>
                  <input
                    type="text"
                    required
                    value={newSignOffSupervisor}
                    onChange={(e) => setNewSignOffSupervisor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Residual Risk Level:</label>
                  <select
                    value={newSignOffRisk}
                    onChange={(e) => setNewSignOffRisk(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewSignOffOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Authorize Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ISSUE HIGH-RISK OPERATIONAL PERMIT MODAL                   */}
      {/* =================================================================== */}
      {isNewPermitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Issue High-Risk Operational Work Permit
              </h3>
              <button onClick={() => setIsNewPermitOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePermit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Permit Classification:</label>
                <select
                  value={newPermitType}
                  onChange={(e) => setNewPermitType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                >
                  <option value="HOT_WORK">Hot Work Permit (SANS 10287 / Fire Watch)</option>
                  <option value="WORKING_AT_HEIGHT">Working-at-Height Permit (SANS 10333 / Fall Protection)</option>
                  <option value="CONFINED_SPACE_ENTRY">Confined Space Entry (SANS 10228 / Calibrated Gas Test)</option>
                  <option value="LOTO_ENERGY_ISOLATION">LOTO Energy Isolation (SANS 10142-1 / Zero-Energy)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Exact Work Location:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Overland Conveyor CV-02 Head Pulley"
                  value={newPermitLocation}
                  onChange={(e) => setNewPermitLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Authorized Statutory Issuer:</label>
                  <input
                    type="text"
                    required
                    value={newPermitIssuer}
                    onChange={(e) => setNewPermitIssuer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Authorized Artisan Receiver:</label>
                  <input
                    type="text"
                    required
                    value={newPermitReceiver}
                    onChange={(e) => setNewPermitReceiver(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1">
                <div className="font-bold text-amber-400">Statutory Pre-Conditions Checked:</div>
                <div>✓ Mandatory continuous gas testing probe calibrated</div>
                <div>✓ Physical lockouts applied with personal zero-energy padlocks</div>
                <div>✓ Valid for 8 hours (single shift duration)</div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPermitOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Issue Operational Permit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationalComplianceHub;
