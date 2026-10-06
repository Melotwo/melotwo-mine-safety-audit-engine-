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
  AlertCircle,
  Globe,
  TreePine,
  Scale,
  CheckSquare,
  Square,
  TrendingUp,
  MapPin,
  AlertOctagon,
  FileCheck,
  ShieldAlert
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
  StatutoryEnvironmentalLicense,
  LiabilityTransferHandoverItem,
  EsgClosureTransitionMetric,
  MineClosureSuiteOverview,
  EnterpriseTier1Host,
  DefensibilityIndexResult,
  CrossBorderRegulatoryMappingItem,
  ComplianceGapAlert
} from '../types/crossBorderCompliance';
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
  exportSafetyFileBinderPdf,
  fetchMineClosureOverview,
  createEnvironmentalLicense,
  updateHandoverItemSignOff,
  fetchCrossBorderMapping,
  fetchDefensibilityIndex,
  simulateCustomDefensibility,
  fetchComplianceGapAlerts,
  resolveComplianceGapAlert,
  exportDefensibilityAuditReportPdf
} from '../services/complianceEngineService';

export interface OperationalComplianceHubProps {
  onBack?: () => void;
  onOpenTenderWizard?: () => void;
  initialPillar?: 'PILLAR_1' | 'PILLAR_2' | 'PILLAR_3' | 'PILLAR_4' | 'PILLAR_5';
}

export const OperationalComplianceHub: React.FC<OperationalComplianceHubProps> = ({
  onBack,
  onOpenTenderWizard,
  initialPillar
}) => {
  // Navigation Tabs for the 5 Core Functional Pillars
  const [activePillar, setActivePillar] = useState<'PILLAR_1' | 'PILLAR_2' | 'PILLAR_3' | 'PILLAR_4' | 'PILLAR_5'>(
    initialPillar || 'PILLAR_1'
  );

  // Check URL hash for direct pillar navigation on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#mine-closure' || hash === '#closure') {
        setActivePillar('PILLAR_4');
      } else if (hash === '#cross-border-sandbox' || hash === '#defensibility-index' || hash === '#cross-border') {
        setActivePillar('PILLAR_5');
      }
    }
  }, []);

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

  // Pillar 4 States: Mine Closure & Environmental Transition Suite
  const [pillar4SubTab, setPillar4SubTab] = useState<'OVERVIEW' | 'LICENSES' | 'HANDOVER' | 'ESG'>('OVERVIEW');
  const [mineClosure, setMineClosure] = useState<MineClosureSuiteOverview | null>(null);
  const [isNewLicenseOpen, setIsNewLicenseOpen] = useState(false);
  const [newLicNumber, setNewLicNumber] = useState('DMRE-MPRDA-SEC43-2026-901');
  const [newLicTitle, setNewLicTitle] = useState('MPRDA Section 43 Decommissioning & Rehabilitation Clearance');
  const [newLicBody, setNewLicBody] = useState<any>('DMRE');
  const [newLicAmount, setNewLicAmount] = useState('18500000');
  const [newLicConditions, setNewLicConditions] = useState('Continuous groundwater AMD monitoring; Final tailings revegetation to SANS specification');

  // Pillar 5 States: Tier-1 Pre-Qualification & Cross-Border Sandbox
  const [pillar5SubTab, setPillar5SubTab] = useState<'DEFENSIBILITY' | 'CROSS_BORDER_MAP' | 'GAP_ALERTS'>('DEFENSIBILITY');
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseTier1Host>('ANGLO_AMERICAN');
  const [defensibility, setDefensibility] = useState<DefensibilityIndexResult | null>(null);
  const [isSimulatingDefensibility, setIsSimulatingDefensibility] = useState(false);
  const [isExportingDefensibilityPdf, setIsExportingDefensibilityPdf] = useState(false);
  const [crossBorderList, setCrossBorderList] = useState<CrossBorderRegulatoryMappingItem[]>([]);
  const [gapAlertsList, setGapAlertsList] = useState<ComplianceGapAlert[]>([]);
  const [resolvingGapId, setResolvingGapId] = useState<string | null>(null);

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

  // Re-run defensibility when selectedEnterprise changes
  useEffect(() => {
    const runSim = async () => {
      setIsSimulatingDefensibility(true);
      const res = await fetchDefensibilityIndex(selectedEnterprise);
      setDefensibility(res);
      setIsSimulatingDefensibility(false);
    };
    runSim();
  }, [selectedEnterprise]);

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

    // Pillar 4
    const closureData = await fetchMineClosureOverview();
    setMineClosure(closureData);

    // Pillar 5
    const defData = await fetchDefensibilityIndex(selectedEnterprise);
    setDefensibility(defData);
    const mapData = await fetchCrossBorderMapping();
    setCrossBorderList(mapData);
    const alertsData = await fetchComplianceGapAlerts();
    setGapAlertsList(alertsData);
  };

  // Pillar 4 Handlers: Mine Closure & Liability Handover
  const handleToggleChecklist = async (itemId: string, checkIndex: number, currentCompleted: boolean) => {
    const updated = await updateHandoverItemSignOff(itemId, {
      checkIndex,
      completed: !currentCompleted
    });
    if (updated) {
      setMineClosure(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          liabilityHandoverItems: prev.liabilityHandoverItems.map(item => item.itemId === itemId ? updated : item)
        };
      });
      showToast('Handover checklist condition verified in audit ledger.');
    }
  };

  const handleDischargeLiability = async (itemId: string) => {
    const updated = await updateHandoverItemSignOff(itemId, {
      signOffStatus: 'LIABILITY_DISCHARGED'
    });
    if (updated) {
      setMineClosure(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          liabilityHandoverItems: prev.liabilityHandoverItems.map(item => item.itemId === itemId ? updated : item)
        };
      });
      showToast(`Workstream ${itemId} liability discharged & certified.`);
    }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicNumber || !newLicTitle) return;
    const condArray = newLicConditions.split(';').map(s => s.trim()).filter(Boolean);
    const created = await createEnvironmentalLicense({
      licenseNumber: newLicNumber,
      title: newLicTitle,
      statutoryBody: newLicBody,
      financialProvisionAmountZar: Number(newLicAmount) || 5000000,
      keyConditions: condArray
    });
    if (created) {
      setMineClosure(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          licenses: [created, ...prev.licenses]
        };
      });
      setIsNewLicenseOpen(false);
      showToast(`Statutory license ${created.licenseNumber} registered.`);
    }
  };

  // Pillar 5 Handlers: Cross-Border & Gap Remediation
  const handleResolveGapAlert = async (alertId: string) => {
    setResolvingGapId(alertId);
    const resolved = await resolveComplianceGapAlert(alertId);
    setResolvingGapId(null);
    if (resolved) {
      setGapAlertsList(prev => prev.map(a => a.alertId === alertId ? resolved : a));
      const updatedDef = await fetchDefensibilityIndex(selectedEnterprise);
      setDefensibility(updatedDef);
      showToast(`Gap ${alertId} remediated! Defensibility score increased.`);
    }
  };

  const handleExportDefensibilityReport = () => {
    if (!defensibility) return;
    setIsExportingDefensibilityPdf(true);
    try {
      exportDefensibilityAuditReportPdf(defensibility);
      showToast(`Audit report for ${defensibility.hostEnterpriseName} exported.`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingDefensibilityPdf(false);
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

        {/* 5 Core Pillar Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActivePillar('PILLAR_1')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activePillar === 'PILLAR_1'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Pillar 1: Safety File &amp; Statutory</span>
          </button>

          <button
            onClick={() => setActivePillar('PILLAR_2')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activePillar === 'PILLAR_2'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>Pillar 2: VR Simulator &amp; Machine Rules</span>
          </button>

          <button
            onClick={() => setActivePillar('PILLAR_3')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activePillar === 'PILLAR_3'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Pillar 3: SETA / QCTO Skills</span>
          </button>

          <button
            onClick={() => setActivePillar('PILLAR_4')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activePillar === 'PILLAR_4'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <TreePine className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Pillar 4: Mine Closure &amp; Environmental Suite</span>
          </button>

          <button
            onClick={() => setActivePillar('PILLAR_5')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activePillar === 'PILLAR_5'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>Pillar 5: Tier-1 Pre-Qual &amp; Cross-Border Sandbox</span>
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

        {/* ================================================================= */}
        {/* PILLAR 4: MINE CLOSURE, REHABILITATION & ENVIRONMENTAL TRANSITION */}
        {/* ================================================================= */}
        {activePillar === 'PILLAR_4' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                    Pillar 4: Statutory Mine Decommissioning &amp; Environmental Stewardship
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <TreePine className="w-6 h-6 text-emerald-400" />
                    Mine Closure, Rehabilitation &amp; Environmental Transition Suite
                  </h2>
                  <p className="text-xs text-slate-400 font-sans max-w-3xl mt-1">
                    Manage contractor workflows transitioning from active ore extraction to mine closure. Enforce statutory environmental authorizations under DMRE MPRDA Section 43, NEMA GN R1147 financial provisioning, DWS Water Use Licenses (WULA), and Global Industry Standard on Tailings Management (GISTM).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono font-bold">
                    Stage: {mineClosure?.mineStage.replace(/_/g, ' ') || 'ACTIVE DECOMMISSIONING'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsNewLicenseOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register License</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics KPI Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Rehabilitation Progress</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {mineClosure?.overallRehabilitationProgressPct || 76.5}%
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${mineClosure?.overallRehabilitationProgressPct || 76.5}%` }} 
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Target: 100% Relinquishment</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Financial Provisioning (GN R1147)</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  R {(mineClosure?.financialProvisionBondGuaranteeZar || 28500000).toLocaleString('en-ZA')}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>DMRE &amp; DFFE Guarantee Bond Active</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Statutory Licenses</div>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {mineClosure?.licenses.length || 3} Active
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DWS WULA, DMRE Sec 43, ZEMA SI 112</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Liability Handover Workstreams</div>
                <div className="text-2xl font-black text-indigo-400 font-mono">
                  {mineClosure?.liabilityHandoverItems.filter(i => i.signOffStatus === 'LIABILITY_DISCHARGED').length || 0} / {mineClosure?.liabilityHandoverItems.length || 4} Discharged
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>GISTM Tailings &amp; Demolition Handover</span>
                </div>
              </div>
            </div>

            {/* Pillar 4 Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
              {[
                { id: 'OVERVIEW', label: 'Suite Overview & ESG Metrics', icon: BarChart3 },
                { id: 'LICENSES', label: 'Statutory Environmental Licenses (DMRE/DWS/NEMA)', icon: FileText },
                { id: 'HANDOVER', label: 'Liability Transfer & Contractor Handover Checklists', icon: CheckSquare },
                { id: 'ESG', label: 'GISTM Tailings Stability Telemetry', icon: Activity }
              ].map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setPillar4SubTab(sub.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                      pillar4SubTab === sub.id
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Tab 1: Overview & ESG Metrics */}
            {pillar4SubTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      ESG Transition &amp; Social and Labour Plan (SLP) Closure Tracker
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      MPRDA Reg 46(e) Compliant
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Statutory tracking of downscaling commitments, alternative livelihoods reskilling for mine workers, Future Forum consultations, and post-mining ecological restoration.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {(mineClosure?.esgTransitionMetrics || []).map(m => (
                      <div key={m.metricId} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {m.domain.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            m.status === 'ON_TRACK' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {m.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{m.indicatorName}</h4>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{m.statutoryReference}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-emerald-400 font-bold">{m.currentProgressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${m.currentProgressPct}%` }} />
                          </div>
                        </div>
                        <div className="pt-1 text-[11px] text-slate-400 font-sans space-y-1 border-t border-slate-800/80">
                          <div><strong className="text-slate-300">Target:</strong> {m.targetAtFinalRelinquishment}</div>
                          <div><strong className="text-slate-300">Expenditure:</strong> R {m.expenditureToDateZar.toLocaleString('en-ZA')}</div>
                          {m.slpCommunityBeneficiariesCount && (
                            <div><strong className="text-slate-300">Beneficiaries:</strong> {m.slpCommunityBeneficiariesCount} workers</div>
                          )}
                          <div className="flex items-center gap-1 text-emerald-400 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Future Forum Consultation Complete</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Statutory Environmental Licenses */}
            {pillar4SubTab === 'LICENSES' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Statutory Environmental Licenses &amp; Water Use Permits
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsNewLicenseOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Statutory License</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(mineClosure?.licenses || []).map(lic => (
                    <div key={lic.licenseId} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {lic.statutoryBody}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                          {lic.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{lic.title}</h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">Ref: {lic.licenseNumber}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{lic.actReference}</div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                        <div className="text-slate-400">Financial Provision (GN R1147):</div>
                        <div className="text-amber-400 font-bold">R {lic.financialProvisionAmountZar.toLocaleString('en-ZA')}</div>
                        {lic.waterDischargeLimitM3Day && (
                          <div className="text-cyan-400 text-[11px]">Discharge limit: {lic.waterDischargeLimitM3Day} m³/day</div>
                        )}
                        {lic.monitoringBoreholesCount && (
                          <div className="text-slate-400 text-[11px]">Boreholes: {lic.monitoringBoreholesCount} monitoring points</div>
                        )}
                      </div>
                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Mandatory Conditions:</span>
                        <ul className="text-[11px] text-slate-300 font-sans space-y-1 list-disc list-inside">
                          {lic.keyConditions.map((cond, i) => (
                            <li key={i} className="leading-tight">{cond}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Liability Transfer & Contractor Handover Checklists */}
            {pillar4SubTab === 'HANDOVER' && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                      Liability Transfer Checklists &amp; Contractor Handover Workstreams
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Enforce statutory sign-offs during site demolition, hazardous asbestos stripping, tailings management, and revegetation. Discharging liability generates an immutable cryptographic verification certificate for host-site audits.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {(mineClosure?.liabilityHandoverItems || []).map(item => {
                      const allChecked = item.checklistRequirements.every(c => c.completed);
                      const isDischarged = item.signOffStatus === 'LIABILITY_DISCHARGED';

                      return (
                        <div key={item.itemId} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                                  {item.phase.replace(/_/g, ' ')}
                                </span>
                                <h4 className="text-sm font-bold text-white">{item.workstreamName}</h4>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-1">
                                Location: {item.locationArea} | Contractor: {item.contractorResponsible}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Auditor: {item.independentEnvironmentalAuditor} | Superintendent: {item.clientSuperintendent}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                                isDischarged
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : allChecked
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {item.signOffStatus.replace(/_/g, ' ')}
                              </span>
                              {!isDischarged && (
                                <button
                                  type="button"
                                  onClick={() => handleDischargeLiability(item.itemId)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer shadow-md"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Discharge Liability</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Checklist Requirements */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                              Statutory Returnable Verification Checkpoints:
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {item.checklistRequirements.map((check, cIdx) => (
                                <div
                                  key={cIdx}
                                  onClick={() => handleToggleChecklist(item.itemId, cIdx, check.completed)}
                                  className={`p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                                    check.completed
                                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  {check.completed ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                  )}
                                  <div className="text-xs space-y-0.5">
                                    <p className={`font-sans ${check.completed ? 'text-slate-100 font-semibold' : 'text-slate-300'}`}>
                                      {check.itemDescription}
                                    </p>
                                    <div className="text-[10px] font-mono text-slate-500">
                                      Standard: {check.statutoryStandard} {check.verifiedDate ? `| Verified: ${check.verifiedDate}` : ''}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Cryptographic Discharge Hash if present */}
                          {item.handoverCertificateHash && (
                            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400">Certificate Hash:</span>
                              <span className="text-cyan-300 font-bold truncate max-w-xs">{item.handoverCertificateHash}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 4: GISTM Tailings Stability Telemetry */}
            {pillar4SubTab === 'ESG' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-400" />
                      Global Industry Standard on Tailings Management (GISTM) Conformance
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Continuous geotechnical stability factor monitoring for TSF 2 West Basin during decommissioning and dewatering.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono font-bold">
                    GISTM Level 4 Conformance Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Static Factor of Safety (FoS)</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">1.62</div>
                    <span className="text-[10px] text-slate-500">Target: &gt; 1.50 (Passes GISTM requirement)</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Post-Liquefaction FoS</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">1.34</div>
                    <span className="text-[10px] text-slate-500">Target: &gt; 1.20 (Seismic stability verified)</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Piezometer Pore Pressure</span>
                    <div className="text-2xl font-black text-cyan-400 font-mono">42.0 kPa</div>
                    <span className="text-[10px] text-slate-500">Operating threshold: &lt; 65 kPa</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Acid Mine Drainage (pH)</span>
                    <div className="text-2xl font-black text-amber-400 font-mono">7.4 pH</div>
                    <span className="text-[10px] text-slate-500">Neutralized HDS discharge (Target: 6.5 - 8.5)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PILLAR 5: TIER-1 CONTRACTOR PRE-QUALIFICATION & CROSS-BORDER      */}
        {/* ================================================================= */}
        {activePillar === 'PILLAR_5' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                    Pillar 5: Tender Readiness &amp; Cross-Border Regulatory Sandbox
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Globe className="w-6 h-6 text-cyan-400" />
                    Tier-1 Contractor Pre-Qualification &amp; Cross-Border Audit Sandbox
                  </h2>
                  <p className="text-xs text-slate-400 font-sans max-w-3xl mt-1">
                    Simulate safety file defensibility against strict enterprise vendor standards (Anglo American, Valterra Platinum, Barrick Gold, First Quantum Minerals) and cross-border SADC statutory requirements (South Africa DMRE vs Zambia Mines Safety Department).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportDefensibilityReport}
                    disabled={isExportingDefensibilityPdf || !defensibility}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-950/40"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingDefensibilityPdf ? 'Generating PDF...' : 'Export Defensibility PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Host Enterprise Switcher */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Target Enterprise Host:</span>
                {[
                  { id: 'ANGLO_AMERICAN', name: 'Anglo American Platinum' },
                  { id: 'VALTERRA_PLATINUM', name: 'Valterra Platinum' },
                  { id: 'BARRICK_GOLD', name: 'Barrick Gold (Lumwana / SADC)' },
                  { id: 'FIRST_QUANTUM_FQM', name: 'First Quantum Minerals (Zambia)' }
                ].map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedEnterprise(h.id as EnterpriseTier1Host)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      selectedEnterprise === h.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pillar 5 Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
              {[
                { id: 'DEFENSIBILITY', label: 'Defensibility Index Matrix & Scorecard', icon: Scale },
                { id: 'CROSS_BORDER_MAP', label: 'Cross-Border Regulatory Mapping (SA vs. Zambia)', icon: Globe },
                { id: 'GAP_ALERTS', label: `Live Compliance Gap Scanner (${gapAlertsList.filter(g => !g.isResolved).length} Active)`, icon: AlertTriangle }
              ].map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setPillar5SubTab(sub.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                      pillar5SubTab === sub.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Tab 1: Defensibility Index Matrix */}
            {pillar5SubTab === 'DEFENSIBILITY' && defensibility && (
              <div className="space-y-6">
                {/* Scorecard Hero Banner */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                          defensibility.verdict === 'QUALIFIED_FOR_TENDER'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : defensibility.verdict === 'CONDITIONAL_REVISION_REQUIRED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          Verdict: {defensibility.verdict.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          Rating: {defensibility.defensibilityRating.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {defensibility.hostEnterpriseName} Pre-Qualification Defensibility
                      </h3>
                      <p className="text-xs text-slate-400 font-sans max-w-2xl">
                        Contractor: {defensibility.contractorName} | Simulated: {new Date(defensibility.simulatedAt).toLocaleDateString('en-ZA')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Defensibility Score</div>
                        <div className="text-3xl font-black text-amber-400 font-mono">
                          {defensibility.overallDefensibilityScorePct}%
                        </div>
                      </div>
                      <div className="h-10 w-[1px] bg-slate-800" />
                      <div className="text-[11px] font-mono text-slate-400">
                        Threshold: &ge; 82%<br />
                        <span className="text-emerald-400 font-bold">100% Audit Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* 5 Weighted Categories Table */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      5-Category Audit Weighting &amp; Scoring Matrix:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {defensibility.categories.map(cat => (
                        <div key={cat.categoryKey} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{cat.categoryTitle}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{cat.weightPercentage}% weight</span>
                          </div>
                          <div className="flex items-baseline justify-between text-xs font-mono">
                            <span className="text-slate-400">Awarded:</span>
                            <span className="text-amber-400 font-bold">{cat.pointsAwarded} / {cat.maxPoints} pts ({cat.scoreAchievedPct}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${cat.scoreAchievedPct}%` }} />
                          </div>
                          <div className="pt-1 text-[10px] font-sans">
                            {cat.criticalGaps.length > 0 ? (
                              <span className="text-rose-400 font-medium">⚠️ {cat.criticalGaps[0]}</span>
                            ) : (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> All host mandatory items compliant
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Executive Summary Advice */}
                  <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-1 text-xs">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Executive Auditor Advice:</span>
                    <p className="text-slate-300 font-sans leading-relaxed">{defensibility.summaryExecutiveAdvice}</p>
                    <div className="pt-2 text-[10px] font-mono text-slate-500 truncate select-all">
                      Verification Ledger Hash: {defensibility.auditSimulationHash}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Cross-Border Regulatory Mapping */}
            {pillar5SubTab === 'CROSS_BORDER_MAP' && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Scale className="w-5 h-5 text-cyan-400" />
                      SADC Cross-Border Statutory Safety Regulatory Harmonization Matrix
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Direct side-by-side mapping between South Africa (DMRE / MHSA / DoEL) and Zambia (Mines Safety Department Kitwe / ZEMA / WCFCB) across critical operational domains.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {crossBorderList.map(item => (
                      <div key={item.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="border-b border-slate-800 pb-2">
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                            Domain: {item.functionalDomain}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* South Africa */}
                          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                🇿🇦 South Africa ({item.southAfricaStatute.authority})
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{item.southAfricaStatute.validityCycle}</span>
                            </div>
                            <div className="text-xs font-mono text-slate-200">{item.southAfricaStatute.legislation}</div>
                            <div className="text-[11px] text-slate-400 font-sans">
                              <strong>Mandate:</strong> {item.southAfricaStatute.sectionOrStandard}
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans">
                              <strong>Returnable Document:</strong> {item.southAfricaStatute.requiredDocument}
                            </div>
                          </div>

                          {/* Zambia */}
                          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                                🇿🇲 Zambia ({item.zambiaStatute.authority})
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{item.zambiaStatute.validityCycle}</span>
                            </div>
                            <div className="text-xs font-mono text-slate-200">{item.zambiaStatute.legislation}</div>
                            <div className="text-[11px] text-slate-400 font-sans">
                              <strong>Mandate:</strong> {item.zambiaStatute.sectionOrStandard}
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans">
                              <strong>Returnable Document:</strong> {item.zambiaStatute.requiredDocument}
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                          <div>
                            <strong className="text-emerald-400">Harmonization Guidance:</strong>{' '}
                            <span className="text-slate-300 font-sans">{item.harmonizationGuidance}</span>
                          </div>
                          <div>
                            <strong className="text-rose-400">Common Bidding Pitfall:</strong>{' '}
                            <span className="text-slate-400 font-sans">{item.commonPitfall}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Real-Time Compliance Gap Alerts */}
            {pillar5SubTab === 'GAP_ALERTS' && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Tender Readiness Scanner &amp; Real-Time Compliance Gap Alerts
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Active statutory gap alerts scanned across appointments, medicals, and licenses. Resolving items restores defensibility before host tender submission deadlines.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-mono font-bold">
                      {gapAlertsList.filter(g => !g.isResolved).length} Active Gaps
                    </span>
                  </div>

                  <div className="space-y-3">
                    {gapAlertsList.map(alert => (
                      <div
                        key={alert.alertId}
                        className={`border rounded-2xl p-5 space-y-3 transition ${
                          alert.isResolved
                            ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                            : alert.severity === 'CRITICAL_DISQUALIFIER'
                            ? 'bg-rose-950/15 border-rose-500/40'
                            : alert.severity === 'MAJOR_DEFICIENCY'
                            ? 'bg-amber-950/15 border-amber-500/40'
                            : 'bg-cyan-950/15 border-cyan-500/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              alert.isResolved
                                ? 'bg-slate-800 text-slate-400'
                                : alert.severity === 'CRITICAL_DISQUALIFIER'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : alert.severity === 'MAJOR_DEFICIENCY'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {alert.severity.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">{alert.domain}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              ⏱️ {alert.daysToDeadline} days to deadline
                            </span>
                            {!alert.isResolved ? (
                              <button
                                type="button"
                                onClick={() => handleResolveGapAlert(alert.alertId)}
                                disabled={resolvingGapId === alert.alertId}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer shadow-md"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{resolvingGapId === alert.alertId ? 'Remediating...' : 'Remediate & Resolve'}</span>
                              </button>
                            ) : (
                              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Resolved
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Affected Tender Scope: <strong className="text-slate-300">{alert.affectedTenderScope}</strong>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Mandate: {alert.statutoryMandate}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {alert.detailDescription}
                        </p>

                        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs space-y-0.5">
                          <strong className="text-emerald-400 font-mono text-[11px]">Remediation Action:</strong>
                          <p className="text-slate-300 font-sans">{alert.remediationAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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

      {/* =================================================================== */}
      {/* MODAL 3: REGISTER STATUTORY ENVIRONMENTAL LICENSE MODAL             */}
      {/* =================================================================== */}
      {isNewLicenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TreePine className="w-5 h-5 text-emerald-400" />
                Register Statutory Environmental License
              </h3>
              <button onClick={() => setIsNewLicenseOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Statutory Authority:</label>
                  <select
                    value={newLicBody}
                    onChange={(e) => setNewLicBody(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  >
                    <option value="DMRE">DMRE (MPRDA Sec 43 Mine Closure)</option>
                    <option value="DWS">DWS (NWA Act 36 Water Use License)</option>
                    <option value="DFFE_NEMA">DFFE / NEMA (Act 107 EA Authorization)</option>
                    <option value="ZEMA_ZAMBIA">ZEMA (Zambia EMA SI 112)</option>
                    <option value="MSD_ZAMBIA">MSD Kitwe (Mining Reg Part V)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">License Reference No:</label>
                  <input
                    type="text"
                    required
                    value={newLicNumber}
                    onChange={(e) => setNewLicNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">License / Permit Title:</label>
                <input
                  type="text"
                  required
                  value={newLicTitle}
                  onChange={(e) => setNewLicTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Financial Provision Amount (ZAR):</label>
                <input
                  type="number"
                  required
                  value={newLicAmount}
                  onChange={(e) => setNewLicAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Key Conditions (separated by semicolons):</label>
                <textarea
                  rows={2}
                  value={newLicConditions}
                  onChange={(e) => setNewLicConditions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLicenseOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Register Statutory License
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
