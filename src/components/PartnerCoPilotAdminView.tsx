import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Filter, 
  Share2, 
  Building2, 
  MapPin, 
  Layers, 
  Lock, 
  Scale, 
  Sparkles, 
  ArrowLeft, 
  Wallet,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Flame,
  Droplets,
  DollarSign
} from 'lucide-react';
import { ZAMBIAN_COMPLIANCE_DISCLAIMERS } from '../config/regulatoryRules.zambia';
import { MeloTwoLogo } from './MeloTwoLogo';

export interface PartnerCoPilotAdminViewProps {
  onBack?: () => void;
  onLaunchDiagnostic?: () => void;
  onOpenTenderWizard?: () => void;
}

interface ContractorLeadRecord {
  id: string;
  alias: string;
  district: string;
  sector: string;
  tier: 'TIER_1' | 'TIER_2' | 'SME';
  referralCode: string;
  readinessScore: number;
  stage: 'DIAGNOSTIC_COMPLETED' | 'BINDER_GENERATED' | 'AUDIT_VERIFIED' | 'TIER1_QUALIFIED';
  binderCount: number;
  payoutAccruedZmw: number;
  lastActive: string;
}

export const PartnerCoPilotAdminView: React.FC<PartnerCoPilotAdminViewProps> = ({
  onBack,
  onLaunchDiagnostic,
  onOpenTenderWizard
}) => {
  const [partnerOrg, setPartnerOrg] = useState<string>('Zambia Chamber of Mines - Copperbelt Chapter');
  const [partnerCode, setPartnerCode] = useState<string>('CHAMBER-KITWE');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'INTELLIGENCE' | 'REFERRAL_PIPELINE' | 'GOVERNANCE'>('INTELLIGENCE');

  // Dynamic Origin Link Generation
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://melotwo.com';
  const partnerTrackingLink = `${baseUrl}/?ref=${partnerCode}#zambia-assessment`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(partnerTrackingLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = partnerTrackingLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy partner link:', e);
    }
  };

  // WhatsApp Pre-filled share message for Zambian mining partners
  const whatsappShareText = encodeURIComponent(
    `Official Mining Compliance Audit Notice:\n\nRun the 15-Point Zambian Mining Due-Diligence Diagnostic (ZEMA SI 112, MSD Kitwe MSR, MBOD Silicosis & Local Content):\n${partnerTrackingLink}\n\nAccredited Partner: ${partnerOrg}`
  );
  const whatsappShareUrl = `https://wa.me/?text=${whatsappShareText}`;

  // Anonymized Aggregated Compliance Gap Telemetry Data (Mining Compliance Intelligence)
  const aggregatedGapIntelligence = [
    {
      metricId: 'GAP-SILICOSIS',
      domain: 'OHS & Occupational Health',
      label: 'MBOD Silicosis Medical Surveillance Expiries',
      statutoryRef: 'OHSA Act No. 36 of 2010 & MBOD Ndola Directives',
      failureRatePct: 68,
      sampleSize: 184,
      riskImpact: 'HIGH_LIABILITY',
      summary: '68% of evaluated subterranean crews hold expired chest X-rays or uncertified clinic paperwork without MBOD Silicosis Bureau Ndola stamps.'
    },
    {
      metricId: 'GAP-LOCAL-EQUITY',
      domain: 'Local Content & Supply Chain',
      label: 'Citizen Equity Ownership Deficit (<51%)',
      statutoryRef: 'MMDA 2015 Local Content Regulations',
      failureRatePct: 54,
      sampleSize: 210,
      riskImpact: 'TENDER_LOCKOUT',
      summary: '54% of mining contractors lack PACRA-verified 51% Zambian citizen equity, barring them from reserved Tier-1 primary supply contracts.'
    },
    {
      metricId: 'GAP-MSD-BLASTER',
      domain: 'MSD Mines Safety Department',
      label: 'Missing Form MSD-14 Blasting Appointments',
      statutoryRef: 'Mining Regulations (MSR) Part IX, Reg 912',
      failureRatePct: 42,
      sampleSize: 165,
      riskImpact: 'CRITICAL_STOPPAGE',
      summary: '42% of advance headings lack officially registered blasters or valid MSD competency renewal stamps for subterranean shifts.'
    },
    {
      metricId: 'GAP-ZEMA-EFFLUENT',
      domain: 'ZEMA Environmental Discharge',
      label: 'Decant Water Cu & TSS Discharge Breaches',
      statutoryRef: 'ZEMA SI 112 Third Schedule Table 1',
      failureRatePct: 37,
      sampleSize: 142,
      riskImpact: 'ENVIRONMENTAL_SHUTDOWN',
      summary: '37% of mining effluent sample assays exceed the statutory copper ceiling of 1.0 mg/L or TSS of 100 mg/L into Kafue tributaries.'
    },
    {
      metricId: 'GAP-GROUND-SUPPORT',
      domain: 'MSD Ground Support',
      label: 'Uncertified Rock Bolt Pull-Tests (< 80 kN)',
      statutoryRef: 'Mining Regulations (MSR) Part X, Reg 1008',
      failureRatePct: 29,
      sampleSize: 178,
      riskImpact: 'SECTION_55_NOTICE',
      summary: '29% of active development headings do not maintain weekly hydraulic rock bolt pull-test logs, risking MSD Section 55 stoppage.'
    }
  ];

  // Anonymized Partner-Attributed Lead Pipeline Data
  const contractorLeads: ContractorLeadRecord[] = [
    {
      id: 'ZM-LEAD-9041',
      alias: 'Contractor ZM-9041 (Kitwe)',
      district: 'Kitwe, Copperbelt',
      sector: 'Underground Development & Stope Advance',
      tier: 'TIER_1',
      referralCode: 'CHAMBER-KITWE',
      readinessScore: 82,
      stage: 'TIER1_QUALIFIED',
      binderCount: 3,
      payoutAccruedZmw: 3600,
      lastActive: '24 Sep 2026'
    },
    {
      id: 'ZM-LEAD-8812',
      alias: 'Contractor ZM-8812 (Solwezi)',
      district: 'Solwezi, North-Western',
      sector: 'TSF Embankment & Decant Earthworks',
      tier: 'TIER_2',
      referralCode: 'CHAMBER-KITWE',
      readinessScore: 68,
      stage: 'BINDER_GENERATED',
      binderCount: 2,
      payoutAccruedZmw: 2400,
      lastActive: '22 Sep 2026'
    },
    {
      id: 'ZM-LEAD-8729',
      alias: 'Contractor ZM-8729 (Chingola)',
      district: 'Chingola, Copperbelt',
      sector: 'High Voltage Flameproof Substation Wiring',
      tier: 'TIER_2',
      referralCode: 'CHAMBER-KITWE',
      readinessScore: 74,
      stage: 'BINDER_GENERATED',
      binderCount: 1,
      payoutAccruedZmw: 1200,
      lastActive: '19 Sep 2026'
    },
    {
      id: 'ZM-LEAD-8604',
      alias: 'Contractor ZM-8604 (Mufulira)',
      district: 'Mufulira, Copperbelt',
      sector: 'Underground Haulage & Trackless Mobile Machinery',
      tier: 'SME',
      referralCode: 'CHAMBER-KITWE',
      readinessScore: 48,
      stage: 'DIAGNOSTIC_COMPLETED',
      binderCount: 0,
      payoutAccruedZmw: 0,
      lastActive: '18 Sep 2026'
    },
    {
      id: 'ZM-LEAD-8419',
      alias: 'Contractor ZM-8419 (Kalumbila)',
      district: 'Kalumbila, North-Western',
      sector: 'Reagent Transport & Chemical Neutralization',
      tier: 'TIER_1',
      referralCode: 'CHAMBER-KITWE',
      readinessScore: 91,
      stage: 'TIER1_QUALIFIED',
      binderCount: 4,
      payoutAccruedZmw: 4800,
      lastActive: '15 Sep 2026'
    }
  ];

  // Filter contractor leads
  const filteredLeads = useMemo(() => {
    return contractorLeads.filter(lead => {
      const matchDistrict = selectedDistrict === 'ALL' || lead.district.includes(selectedDistrict);
      const matchTier = selectedTier === 'ALL' || lead.tier === selectedTier;
      return matchDistrict && matchTier;
    });
  }, [contractorLeads, selectedDistrict, selectedTier]);

  const totalReferrals = contractorLeads.length;
  const totalBinders = contractorLeads.reduce((acc, l) => acc + l.binderCount, 0);
  const totalCommissionZmw = contractorLeads.reduce((acc, l) => acc + l.payoutAccruedZmw, 0);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  Channel Partner Co-Pilot Admin
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Active Intelligence Feed
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                Mining Compliance Intelligence &amp; Partner Console
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLaunchDiagnostic && (
              <button
                onClick={onLaunchDiagnostic}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Launch Diagnostic</span>
              </button>
            )}
            {onOpenTenderWizard && (
              <button
                onClick={onOpenTenderWizard}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-950/40 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Compile Binder</span>
              </button>
            )}
          </div>
        </div>

        {/* Partner Accreditation & Tracking Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Accredited Channel Co-Pilot:</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {partnerOrg}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Partner Code: <strong className="text-amber-400">{partnerCode}</strong>
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Territory: <strong className="text-slate-200">Copperbelt &amp; North-Western Provinces</strong>
                </span>
              </div>
            </div>

            {/* Partner Referral Link Generator */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl max-w-md w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Partner Lead Magnet Link</span>
                <span className="text-[10px] font-mono text-emerald-400">Attribution Active</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <input 
                  type="text"
                  readOnly
                  value={partnerTrackingLink}
                  className="bg-transparent text-[11px] font-mono text-slate-300 w-full focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  title="Copy Tracking Link"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 font-mono">Commission: ZMW 1,200 / Binder</span>
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
            <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Referred Contractors</div>
              <div className="text-2xl font-black font-mono text-white mt-1">{totalReferrals}</div>
              <div className="text-[10px] text-emerald-400 font-mono">Active Pilot Accounts</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Audits Completed</div>
              <div className="text-2xl font-black font-mono text-white mt-1">142</div>
              <div className="text-[10px] text-cyan-400 font-mono">15-Point Diagnostics</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Binders Compiled</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-1">{totalBinders}</div>
              <div className="text-[10px] text-amber-300 font-mono">20-Section Safety Files</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Partner Commission</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                ZMW {totalCommissionZmw.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">≈ USD ${(totalCommissionZmw / 22).toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('INTELLIGENCE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'INTELLIGENCE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mining Compliance Intelligence (Anonymized Gap Telemetry)</span>
          </button>

          <button
            onClick={() => setActiveTab('REFERRAL_PIPELINE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'REFERRAL_PIPELINE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Referral Attribution Pipeline ({filteredLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('GOVERNANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'GOVERNANCE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>IP Separation &amp; Governance Terms</span>
          </button>
        </div>

        {/* TAB 1: MINING COMPLIANCE INTELLIGENCE (AGGREGATED GAP DATA) */}
        {activeTab === 'INTELLIGENCE' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Aggregated Compliance Gap Telemetry across Zambian Contractors
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Anonymized empirical data tracking recurring regulatory non-conformances across Copperbelt &amp; North-Western mining houses.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">Total Anonymized Records: <strong>879 Shifts</strong></span>
                </div>
              </div>

              {/* Aggregated Telemetry Rows */}
              <div className="space-y-3.5 mt-4">
                {aggregatedGapIntelligence.map((gap) => (
                  <div 
                    key={gap.metricId}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {gap.domain}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {gap.statutoryRef}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{gap.label}</h4>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-black font-mono text-rose-400">
                          {gap.failureRatePct}% Failure Rate
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          Sample size: {gap.sampleSize} audited contractors
                        </div>
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full ${
                          gap.failureRatePct >= 50 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${gap.failureRatePct}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {gap.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Supplier Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase font-mono">
                  <Droplets className="w-4 h-4" />
                  ZEMA SI 112 Advisory
                </div>
                <h4 className="text-sm font-bold text-white">Lime Slurry Circuit Modernization</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  37% of contractors discharging into the Kafue basin lack automated pH telemetry. MeloTwo recommends implementing continuous neutralization interlocks.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase font-mono">
                  <Flame className="w-4 h-4" />
                  MSD Kitwe Advisory
                </div>
                <h4 className="text-sm font-bold text-white">Fast-Track Blasting Form MSD-14</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Over 40% of delays in mining advance stem from uncertified blasters. Channel partners can leverage MeloTwo digital dossier templates to expedite Kitwe approvals.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  Local Content Advisory
                </div>
                <h4 className="text-sm font-bold text-white">Citizen Equity Structuring</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contractors with 25-50% equity can qualify as Citizen-Empowered Joint Ventures under CEEC guidelines to preserve access to Tier-1 mining house packages.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REFERRAL ATTRIBUTION PIPELINE */}
        {activeTab === 'REFERRAL_PIPELINE' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-mono text-slate-400">Filter By District:</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Mining Districts</option>
                    <option value="Kitwe">Kitwe</option>
                    <option value="Solwezi">Solwezi</option>
                    <option value="Chingola">Chingola</option>
                    <option value="Mufulira">Mufulira</option>
                    <option value="Kalumbila">Kalumbila</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Tier:</span>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Tiers</option>
                    <option value="TIER_1">Tier-1 Primary</option>
                    <option value="TIER_2">Tier-2 Subcontractor</option>
                    <option value="SME">SME Supplier</option>
                  </select>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Displaying <strong>{filteredLeads.length}</strong> active pilot accounts
              </div>
            </div>

            {/* Pipeline Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 font-mono text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Contractor Identifier</th>
                      <th className="py-3.5 px-4">District / Specialization</th>
                      <th className="py-3.5 px-4 text-center">Diagnostic Score</th>
                      <th className="py-3.5 px-4">Pipeline Stage</th>
                      <th className="py-3.5 px-4 text-center">Binders</th>
                      <th className="py-3.5 px-4 text-right">Commission (ZMW)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-850/60 transition">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{lead.alias}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {lead.tier.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Ref: {lead.referralCode} &bull; Active: {lead.lastActive}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">{lead.district}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{lead.sector}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            lead.readinessScore >= 80 
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50' 
                              : lead.readinessScore >= 60 
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' 
                              : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                          }`}>
                            {lead.readinessScore}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                            lead.stage === 'TIER1_QUALIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : lead.stage === 'BINDER_GENERATED'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {lead.stage === 'TIER1_QUALIFIED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            {lead.stage === 'BINDER_GENERATED' && <FileSpreadsheet className="w-3 h-3 text-amber-400" />}
                            {lead.stage === 'DIAGNOSTIC_COMPLETED' && <Clock className="w-3 h-3 text-slate-400" />}
                            {lead.stage.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                          {lead.binderCount}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          ZMW {lead.payoutAccruedZmw.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IP SEPARATION & GOVERNANCE TERMS */}
        {activeTab === 'GOVERNANCE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Platform Governance, Legal Disclaimers &amp; IP Protection</h3>
                <p className="text-xs text-slate-400">Statutory operating boundaries between MeloTwo platform architecture and partner co-pilot intelligence.</p>
              </div>
            </div>

            {/* Mandatory Regulatory Notice Box */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs space-y-2">
              <div className="font-bold flex items-center gap-2 text-rose-300 uppercase tracking-wider text-[11px] font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Mandatory Regulatory Disclaimer
              </div>
              <p className="leading-relaxed">
                "{ZAMBIAN_COMPLIANCE_DISCLAIMERS.regulatoryNotice}"
              </p>
            </div>

            {/* Explicit IP Separation Declaration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  MeloTwo Proprietary Platform IP
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The software architecture, cryptographic ledger verification algorithms, multi-jurisdictional schema mapping engines, and automated 20-Section Tender Safety File compilers are the exclusive intellectual property of <strong className="text-white">MeloTwo (Pty) Ltd</strong>. No licensing or co-pilot relationship grants ownership of these underlying proprietary algorithms.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Partner Market Intelligence Telemetry
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Anonymized compliance gap benchmarks, localized contractor performance observations, and district audit trends contributed by channel partners remain licensed under the <strong className="text-white">Co-Pilot Data Sharing Framework</strong>. All contractor personally identifiable information is salted and hashed to ensure complete confidentiality.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-mono text-slate-300 font-bold uppercase text-[10px]">Statutory Authority Benchmarks</div>
              <p className="leading-relaxed">
                {ZAMBIAN_COMPLIANCE_DISCLAIMERS.zambianAuthoritiesCitation}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerCoPilotAdminView;
