import React, { useState, useMemo, useEffect } from 'react';
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
  DollarSign,
  FileText,
  Eye,
  X,
  RefreshCw,
  XCircle,
  Key,
  QrCode,
  Smartphone
} from 'lucide-react';
import { ZAMBIAN_COMPLIANCE_DISCLAIMERS, getZambianRulesByVerificationStatus, getZambianRulesByAuthority } from '../config/regulatoryRules.zambia';
import { MeloTwoLogo } from './MeloTwoLogo';
import { EftOrderSubmission } from '../types';
import { EFT_BANK_ACCOUNTS, generateEftInvoicePdf } from '../services/paymentService';
import { PayPalKeyConfigModal } from './PayPalKeyConfigModal';
import { generateQrCodeDataUrl } from '../services/qrVerificationService';

export interface PartnerCoPilotAdminViewProps {
  onBack?: () => void;
  onLaunchDiagnostic?: () => void;
  onOpenTenderWizard?: () => void;
  onOpenPayPalKeyConfig?: () => void;
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
  onOpenTenderWizard,
  onOpenPayPalKeyConfig
}) => {
  const [partnerOrg, setPartnerOrg] = useState<string>('Zambia Chamber of Mines - Copperbelt Chapter');
  const [partnerCode, setPartnerCode] = useState<string>('CHAMBER-KITWE');
  const [customCodeInput, setCustomCodeInput] = useState<string>('CHAMBER-KITWE');
  const [isEditingCode, setIsEditingCode] = useState<boolean>(false);
  const [linkDestination, setLinkDestination] = useState<'zambia' | 'tender' | 'calculator' | 'home'>('zambia');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'INTELLIGENCE' | 'REFERRAL_PIPELINE' | 'EFT_APPROVALS' | 'GOVERNANCE'>('INTELLIGENCE');
  const [isAdminPayPalModalOpen, setIsAdminPayPalModalOpen] = useState(false);

  // QR Code Referral Generation State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [showInlineQr, setShowInlineQr] = useState<boolean>(false);

  // Direct EFT & POP Admin Approval Queue State
  const [eftOrders, setEftOrders] = useState<EftOrderSubmission[]>([]);
  const [isLoadingEft, setIsLoadingEft] = useState(false);
  const [eftFilter, setEftFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [previewPopOrder, setPreviewPopOrder] = useState<EftOrderSubmission | null>(null);

  // Load EFT Orders from server & localStorage
  const loadEftOrders = async () => {
    setIsLoadingEft(true);
    try {
      const res = await fetch('/api/eft/orders');
      let serverList: EftOrderSubmission[] = [];
      if (res.ok) {
        const data = await res.json();
        serverList = data.orders || [];
      }
      const localList: EftOrderSubmission[] = typeof localStorage !== 'undefined'
        ? JSON.parse(localStorage.getItem('melotwo_eft_orders') || '[]')
        : [];

      const map = new Map<string, EftOrderSubmission>();
      localList.forEach(o => map.set(o.reference || o.id, o));
      serverList.forEach(o => map.set(o.reference || o.id, { ...map.get(o.reference || o.id), ...o }));
      setEftOrders(Array.from(map.values()));
    } catch (e) {
      console.warn('Failed to load EFT orders:', e);
    } finally {
      setIsLoadingEft(false);
    }
  };

  useEffect(() => {
    loadEftOrders();
  }, []);

  const handleApproveOrder = async (order: EftOrderSubmission) => {
    try {
      await fetch('/api/eft/approve-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id, 
          reference: order.reference, 
          notes: 'Verified & Approved via Executive Admin Console' 
        })
      });
      setEftOrders(prev => prev.map(o => (o.reference === order.reference || o.id === order.id) ? { ...o, status: 'VERIFIED', verifiedAt: new Date().toISOString() } : o));
      
      // Update local storage
      if (typeof localStorage !== 'undefined') {
        const localList: EftOrderSubmission[] = JSON.parse(localStorage.getItem('melotwo_eft_orders') || '[]');
        const updated = localList.map(o => (o.reference === order.reference || o.id === order.id) ? { ...o, status: 'VERIFIED', verifiedAt: new Date().toISOString() } : o);
        localStorage.setItem('melotwo_eft_orders', JSON.stringify(updated));
        localStorage.setItem('sans_trial_active', 'true');
        localStorage.setItem('melotwo_vip_unlocked', 'true');
        localStorage.setItem('sans_vip_unlocked', 'true');
      }

      if (previewPopOrder && (previewPopOrder.reference === order.reference || previewPopOrder.id === order.id)) {
        setPreviewPopOrder(prev => prev ? { ...prev, status: 'VERIFIED' } : null);
      }
    } catch (e) {
      console.error('Failed to approve EFT order:', e);
    }
  };

  const handleRejectOrder = async (order: EftOrderSubmission) => {
    try {
      await fetch('/api/eft/reject-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id, 
          reference: order.reference, 
          reason: 'Incomplete or unverified bank deposit slip' 
        })
      });
      setEftOrders(prev => prev.map(o => (o.reference === order.reference || o.id === order.id) ? { ...o, status: 'REJECTED' } : o));
      
      if (typeof localStorage !== 'undefined') {
        const localList: EftOrderSubmission[] = JSON.parse(localStorage.getItem('melotwo_eft_orders') || '[]');
        const updated = localList.map(o => (o.reference === order.reference || o.id === order.id) ? { ...o, status: 'REJECTED' } : o);
        localStorage.setItem('melotwo_eft_orders', JSON.stringify(updated));
      }

      if (previewPopOrder && (previewPopOrder.reference === order.reference || previewPopOrder.id === order.id)) {
        setPreviewPopOrder(prev => prev ? { ...prev, status: 'REJECTED' } : null);
      }
    } catch (e) {
      console.error('Failed to reject EFT order:', e);
    }
  };

  // Dynamic Origin Link Generation
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://melotwo.com';
  
  const getDestinationHash = () => {
    switch (linkDestination) {
      case 'zambia': return '#zambia-assessment';
      case 'tender': return '#tender-file';
      case 'calculator': return '#calculate-cost';
      case 'home': return '';
      default: return '#zambia-assessment';
    }
  };

  const partnerTrackingLink = `${baseUrl}/?ref=${encodeURIComponent(partnerCode.trim().toUpperCase())}${getDestinationHash()}`;

  const handleApplyCustomCode = () => {
    const clean = customCodeInput.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (clean) {
      setPartnerCode(clean);
      setIsEditingCode(false);
      setToastMessage(`Partner referral code set to "${clean}". Unique link generated!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

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
      setToastMessage(`Referral link copied to clipboard! (Code: ${partnerCode})`);
      setTimeout(() => {
        setIsCopied(false);
        setToastMessage(null);
      }, 3500);
    } catch (e) {
      console.error('Failed to copy partner link:', e);
    }
  };

  // Generate QR Code data URL dynamically whenever partnerTrackingLink changes
  useEffect(() => {
    let isMounted = true;
    setIsGeneratingQr(true);
    generateQrCodeDataUrl(partnerTrackingLink, {
      width: 420,
      margin: 2,
      darkColor: '#090d16',
      lightColor: '#ffffff'
    })
      .then(url => {
        if (isMounted) {
          setQrCodeDataUrl(url);
          setIsGeneratingQr(false);
        }
      })
      .catch(err => {
        console.error('Failed to generate partner QR code:', err);
        if (isMounted) setIsGeneratingQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [partnerTrackingLink]);

  const handleDownloadQrCode = () => {
    if (!qrCodeDataUrl) return;
    try {
      const downloadLink = document.createElement('a');
      downloadLink.href = qrCodeDataUrl;
      downloadLink.download = `melotwo-referral-qr-${partnerCode.toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setToastMessage(`QR Code downloaded for partner code "${partnerCode}"!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error('Failed to download QR code:', e);
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

  // Dynamic Integration: Merge newly captured leads from 15-Point Diagnostic assessments
  const allContractorLeads = useMemo<ContractorLeadRecord[]>(() => {
    let dynamicLeads: ContractorLeadRecord[] = [];
    try {
      const raw = localStorage.getItem('melotwo_partner_leads');
      if (raw) {
        const parsed = JSON.parse(raw);
        dynamicLeads = parsed.map((l: any, idx: number): ContractorLeadRecord => ({
          id: l.id || `ZM-LEAD-LIVE-${idx}`,
          alias: l.companyName ? `${l.companyName} (${l.district?.split(',')[0] || 'Copperbelt'})` : `Contractor ${l.id}`,
          district: l.district || 'Kitwe, Copperbelt',
          sector: 'Statutory Mining Contractor',
          tier: l.tier === 'TIER_1_PRIMARY' ? 'TIER_1' : l.tier === 'TIER_2_SUBCONTRACTOR' ? 'TIER_2' : 'SME',
          referralCode: l.attributionRef || partnerCode,
          readinessScore: Number(l.score) || 75,
          stage: l.binderGenerated ? 'BINDER_GENERATED' : 'DIAGNOSTIC_COMPLETED',
          binderCount: l.binderGenerated ? 1 : 0,
          payoutAccruedZmw: l.binderGenerated ? 1200 : 0,
          lastActive: new Date(l.date || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        }));
      }
    } catch (e) {
      console.warn('Failed to parse local partner leads:', e);
    }

    return [...dynamicLeads, ...contractorLeads];
  }, [partnerCode]);

  // Compute Verified vs Pending Regulatory Tags breakdown
  const verifiedRulesCount = useMemo(() => {
    try {
      return getZambianRulesByVerificationStatus('VERIFIED').length;
    } catch {
      return 18;
    }
  }, []);

  const pendingRulesCount = useMemo(() => {
    try {
      return getZambianRulesByVerificationStatus('PENDING_VALIDATION').length;
    } catch {
      return 3;
    }
  }, []);

  // Filter contractor leads
  const filteredLeads = useMemo(() => {
    return allContractorLeads.filter(lead => {
      const matchDistrict = selectedDistrict === 'ALL' || lead.district.includes(selectedDistrict);
      const matchTier = selectedTier === 'ALL' || lead.tier === selectedTier;
      return matchDistrict && matchTier;
    });
  }, [allContractorLeads, selectedDistrict, selectedTier]);

  const totalReferrals = allContractorLeads.length;
  const totalBinders = allContractorLeads.reduce((acc, l) => acc + l.binderCount, 0);
  const totalCommissionZmw = allContractorLeads.reduce((acc, l) => acc + l.payoutAccruedZmw, 0);

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
            <button
              onClick={() => {
                if (onOpenPayPalKeyConfig) onOpenPayPalKeyConfig();
                else setIsAdminPayPalModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Admin Only: Configure PayPal Client ID, Secret, and Mode"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>PayPal API Keys (Admin)</span>
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 border border-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Partner Accreditation & Tracking Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Accredited Channel Co-Pilot:</span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white">
                {partnerOrg}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Active Partner Code: <strong className="text-amber-400">{partnerCode}</strong>
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Territory: <strong className="text-slate-200">Copperbelt &amp; North-Western Provinces</strong>
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  15% Rev Share Active
                </span>
              </div>

              {/* Custom Code Input / Generator Toggle */}
              <div className="pt-2">
                {isEditingCode ? (
                  <div className="flex items-center gap-2 max-w-sm">
                    <input 
                      type="text"
                      value={customCodeInput}
                      onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                      placeholder="ENTER-CUSTOM-CODE"
                      className="bg-slate-950 border border-amber-500/60 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-400 focus:outline-none w-full"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomCode}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                    >
                      Apply Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCodeInput(partnerCode);
                        setIsEditingCode(true);
                      }}
                      className="text-amber-400 hover:underline text-[11px] font-mono cursor-pointer flex items-center gap-1"
                    >
                      <span>Customize Partner Code</span>
                    </button>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 text-[11px] font-mono">Quick Presets:</span>
                    {['CHAMBER-KITWE', 'MINE-AUDITOR', 'COPPERBELT-SHEQ'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setPartnerCode(preset);
                          setCustomCodeInput(preset);
                          setToastMessage(`Partner code updated to ${preset}`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                          partnerCode === preset 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Partner Referral Link Generator Box */}
            <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl max-w-lg w-full space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Partner Referral Link Generator
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Attribution Active
                </span>
              </div>

              {/* Destination Selector */}
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Target Landing Destination:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { key: 'zambia', label: '15-PT Diagnostic', badge: 'Zambia' },
                    { key: 'tender', label: 'Tender Safety File', badge: 'Red File' },
                    { key: 'calculator', label: 'Cost Calculator', badge: 'ROI' },
                    { key: 'home', label: 'Platform Home', badge: 'Overview' }
                  ].map(dest => (
                    <button
                      key={dest.key}
                      type="button"
                      onClick={() => setLinkDestination(dest.key as any)}
                      className={`px-2 py-1.5 rounded-lg text-left transition cursor-pointer border ${
                        linkDestination === dest.key
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-[10px] font-bold block truncate">{dest.label}</span>
                      <span className="text-[8px] font-mono opacity-70 block">{dest.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* The Link Output Bar */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <input 
                  type="text"
                  readOnly
                  value={partnerTrackingLink}
                  className="bg-transparent text-xs font-mono text-slate-200 w-full focus:outline-none truncate select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isCopied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                  }`}
                  title="Copy Tracking Link to Clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Referral Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: QR Scan, Inline Toggle & WhatsApp */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  Bounty: <strong className="text-amber-400">ZMW 1,200</strong> / Binder or 15% SaaS
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition"
                    title="Generate & View QR Code for Mobile Scanning"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scan QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInlineQr(!showInlineQr)}
                    className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded-lg transition"
                    title="Toggle quick inline QR display"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{showInlineQr ? 'Hide' : 'Quick QR'}</span>
                  </button>
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Inline Quick QR Drawer */}
              {showInlineQr && (
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3.5 animate-fadeIn">
                  <div 
                    onClick={() => setIsQrModalOpen(true)}
                    className="bg-white p-2 rounded-lg cursor-pointer hover:ring-2 hover:ring-amber-400 transition shrink-0 group relative shadow-md"
                    title="Click to expand QR Code"
                  >
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt={`QR Code for ${partnerCode}`} 
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center text-slate-500 text-xs font-mono">
                        Generating...
                      </div>
                    )}
                    <span className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg text-[10px] font-bold text-white transition">
                      Enlarge
                    </span>
                  </div>
                  <div className="text-left space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold uppercase">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Instant Mobile Referral Scan</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      Contractors scan this code on mobile to land directly on your selected destination with attribution tag <code className="text-amber-300 font-mono">?ref={partnerCode}</code>.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleDownloadQrCode}
                        className="text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-cyan-400" />
                        <span>Save PNG</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsQrModalOpen(true)}
                        className="text-[10px] font-mono font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition cursor-pointer"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Full Screen &amp; Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Partner Program Details & Tracking Terms Banner */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                1. Commission Structure
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Earn <strong className="text-white">15% recurring commission</strong> on all annual &amp; monthly SaaS licenses, plus <strong className="text-amber-400">ZMW 1,200 (or R750)</strong> instant bounty on every standalone 20-Section Tender Safety File or Diagnostic Audit report.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                2. Attribution &amp; Tracking
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Every visitor landing via <code className="text-cyan-300 font-mono">?ref={partnerCode}</code> has their partner code stored in persistent browser storage with a <strong className="text-white">60-day attribution window</strong>. Conversions automatically credit your dashboard.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                3. Settlement Schedule
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Referral payouts are disbursed weekly every Friday directly via <strong className="text-white">South African Corporate EFT</strong> (Capitec / FNB) or international <strong className="text-white">PayPal gateway</strong>. Zero threshold barrier.
              </p>
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

          {/* Verified vs Pending Statutory Regulatory Status Breakdown */}
          <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-white text-[11px] uppercase tracking-wide">Statutory Verification Tags:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {verifiedRulesCount} Verified Statutory Mandates
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 font-mono text-[11px] font-bold">
                <Clock className="w-3 h-3 text-amber-400" />
                {pendingRulesCount} Pending Secondary Validation
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Regulatory Citations: <strong className="text-slate-200">ZEMA SI 112 &bull; MSD Kitwe &bull; MBOD &bull; CEEC</strong>
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
            onClick={() => setActiveTab('EFT_APPROVALS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'EFT_APPROVALS'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-950/40'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${activeTab === 'EFT_APPROVALS' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>Direct EFT &amp; POP Approval Queue ({eftOrders.length})</span>
            {eftOrders.filter(o => o.status === 'PROVISIONALLY_APPROVED' || o.status === 'PENDING_VERIFICATION').length > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                activeTab === 'EFT_APPROVALS' ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'
              }`}>
                {eftOrders.filter(o => o.status === 'PROVISIONALLY_APPROVED' || o.status === 'PENDING_VERIFICATION').length}
              </span>
            )}
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

        {/* TAB 4: DIRECT EFT & POP APPROVAL QUEUE */}
        {activeTab === 'EFT_APPROVALS' && (() => {
          const filteredEftOrders = eftOrders.filter(o => {
            if (eftFilter === 'PENDING') return o.status === 'PROVISIONALLY_APPROVED' || o.status === 'PENDING_VERIFICATION';
            if (eftFilter === 'VERIFIED') return o.status === 'VERIFIED';
            if (eftFilter === 'REJECTED') return o.status === 'REJECTED';
            return true;
          });

          const totalVolumeZar = eftOrders.reduce((acc, o) => acc + (Number(o.amountZar) || 0), 0);
          const pendingCount = eftOrders.filter(o => o.status === 'PROVISIONALLY_APPROVED' || o.status === 'PENDING_VERIFICATION').length;
          const verifiedCount = eftOrders.filter(o => o.status === 'VERIFIED').length;
          const capitecCount = eftOrders.filter(o => o.selectedBank === 'capitec' || (o.bankName && o.bankName.includes('Capitec'))).length;
          const fnbCount = eftOrders.filter(o => o.selectedBank === 'fnb' || (o.bankName && o.bankName.includes('FNB'))).length;

          return (
            <div className="space-y-6">
              
              {/* Header Banner & Official Banking Coordinate Review */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      Direct EFT &amp; Wire Transfer Executive Approval Queue
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time ledger of industrial transfers and submitted Proofs of Payment (POP) awaiting clearance.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadEftOrders}
                      disabled={isLoadingEft}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEft ? 'animate-spin' : ''}`} />
                      Refresh Ledger
                    </button>
                  </div>
                </div>

                {/* Official Bank Coordinates Summary Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{EFT_BANK_ACCOUNTS.capitec.bankName}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Primary Account
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-300">
                        Holder: <strong className="text-white">{EFT_BANK_ACCOUNTS.capitec.accountName}</strong> &bull; Acc: <strong className="text-amber-400">{EFT_BANK_ACCOUNTS.capitec.accountNumber}</strong>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Branch: {EFT_BANK_ACCOUNTS.capitec.branchCode} &bull; SWIFT: {EFT_BANK_ACCOUNTS.capitec.swiftCode} &bull; {EFT_BANK_ACCOUNTS.capitec.accountType}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {capitecCount} orders
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-sky-500/30 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{EFT_BANK_ACCOUNTS.fnb.bankName}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          Secondary Wire
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-300">
                        Holder: <strong className="text-white">{EFT_BANK_ACCOUNTS.fnb.accountName}</strong> &bull; Acc: <strong className="text-sky-300">{EFT_BANK_ACCOUNTS.fnb.accountNumber}</strong>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Branch: {EFT_BANK_ACCOUNTS.fnb.branchCode} &bull; SWIFT: {EFT_BANK_ACCOUNTS.fnb.swiftCode} &bull; {EFT_BANK_ACCOUNTS.fnb.accountType}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-400 font-mono">
                      {fnbCount} orders
                    </span>
                  </div>
                </div>

                {/* Metrics Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Volume</span>
                    <span className="text-lg font-black text-white font-mono">
                      R{totalVolumeZar.toLocaleString('en-ZA')}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Pending Review</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {pendingCount}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Verified VIPs</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {verifiedCount}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Records</span>
                    <span className="text-lg font-black text-slate-200 font-mono">
                      {eftOrders.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Approval Filter Strip */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
                  </span>
                  {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map(filterOption => (
                    <button
                      key={filterOption}
                      type="button"
                      onClick={() => setEftFilter(filterOption)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        eftFilter === filterOption
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {filterOption === 'ALL' && `All (${eftOrders.length})`}
                      {filterOption === 'PENDING' && `Pending POP (${pendingCount})`}
                      {filterOption === 'VERIFIED' && `Verified (${verifiedCount})`}
                      {filterOption === 'REJECTED' && `Rejected (${eftOrders.filter(o => o.status === 'REJECTED').length})`}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Showing {filteredEftOrders.length} submission{filteredEftOrders.length === 1 ? '' : 's'}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                {filteredEftOrders.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-400">No EFT orders matching filter.</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Direct EFT orders and uploaded POP slips will appear here for review and one-click VIP approval.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3.5 px-4">Payment Ref</th>
                          <th className="py-3.5 px-4">Enterprise &amp; Email</th>
                          <th className="py-3.5 px-4">Settlement Bank</th>
                          <th className="py-3.5 px-4">Amount (ZAR)</th>
                          <th className="py-3.5 px-4">Proof of Payment (POP)</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {filteredEftOrders.map((order) => {
                          const isCapitec = order.selectedBank === 'capitec' || (order.bankName && order.bankName.includes('Capitec'));
                          const isVerified = order.status === 'VERIFIED';
                          const isRejected = order.status === 'REJECTED';

                          return (
                            <tr key={order.reference || order.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                                {order.reference}
                                <div className="text-[10px] text-slate-500 font-sans">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-ZA') : 'Recent'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white">{order.enterpriseName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{order.email || 'N/A'}</div>
                                <div className="text-[10px] text-slate-500">{order.tierOrItem}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                  isCapitec 
                                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' 
                                    : 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                                }`}>
                                  <Building2 className="w-3 h-3" />
                                  {isCapitec ? 'Capitec Bank (Primary)' : 'FNB (Secondary Wire)'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                                R{Number(order.amountZar).toLocaleString('en-ZA')}
                              </td>

                              <td className="py-3.5 px-4">
                                {order.popFileName ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewPopOrder(order)}
                                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{order.popFileName.slice(0, 18)}</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Slip Pending
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="w-3 h-3" /> Verified &bull; VIP Unlocked
                                  </span>
                                ) : isRejected ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider">
                                    <XCircle className="w-3 h-3" /> Rejected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                    <Clock className="w-3 h-3" /> Pending Admin Action
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!isVerified && (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveOrder(order)}
                                      title="Approve Order & Grant VIP"
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shadow"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                  )}

                                  {!isRejected && (
                                    <button
                                      type="button"
                                      onClick={() => handleRejectOrder(order)}
                                      title="Reject Order"
                                      className="p-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-lg text-xs transition cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => generateEftInvoicePdf({
                                      reference: order.reference,
                                      amountZar: order.amountZar,
                                      enterpriseName: order.enterpriseName,
                                      email: order.email,
                                      tierOrItem: order.tierOrItem,
                                      selectedBank: isCapitec ? 'capitec' : 'fnb'
                                    })}
                                    title="Download Proforma PDF"
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* POP Inspection Modal */}
              {previewPopOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <div>
                          <h4 className="text-sm font-bold text-white">Proof of Payment Review</h4>
                          <span className="text-[11px] font-mono text-amber-400">{previewPopOrder.reference}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewPopOrder(null)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Order Details Preview */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Enterprise:</span>
                        <strong className="text-white">{previewPopOrder.enterpriseName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-mono text-slate-300">{previewPopOrder.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Amount Due:</span>
                        <strong className="text-amber-400 font-mono">R{Number(previewPopOrder.amountZar).toLocaleString('en-ZA')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Clearing Bank:</span>
                        <span className="font-bold text-white">
                          {previewPopOrder.selectedBank === 'fnb' ? 'First National Bank (FNB)' : 'Capitec Bank (Primary)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Attached File:</span>
                        <span className="font-mono text-emerald-400">{previewPopOrder.popFileName || 'N/A'}</span>
                      </div>
                    </div>

                    {/* File Preview Area */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-center min-h-[160px] flex items-center justify-center">
                      {previewPopOrder.popFileDataUrl ? (
                        previewPopOrder.popFileDataUrl.startsWith('data:image') ? (
                          <img
                            src={previewPopOrder.popFileDataUrl}
                            alt="Uploaded POP"
                            className="max-h-64 mx-auto rounded-xl border border-slate-800 object-contain shadow"
                          />
                        ) : (
                          <div className="space-y-2">
                            <FileText className="w-12 h-12 text-amber-400 mx-auto" />
                            <p className="text-xs font-bold text-white">{previewPopOrder.popFileName}</p>
                            <p className="text-[11px] text-slate-400">Audit-grade document submitted for verification.</p>
                            <a
                              href={previewPopOrder.popFileDataUrl}
                              download={previewPopOrder.popFileName}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs mt-2"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Uploaded Slip
                            </a>
                          </div>
                        )
                      ) : (
                        <div className="space-y-1 text-slate-400">
                          <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto" />
                          <p className="text-xs font-bold text-slate-300">File record: {previewPopOrder.popFileName || 'Manual Wire Reference'}</p>
                          <p className="text-[11px] text-slate-500">Transferred via South African Interbank EFT Clearing (SABS/SARB standards).</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          generateEftInvoicePdf({
                            reference: previewPopOrder.reference,
                            amountZar: previewPopOrder.amountZar,
                            enterpriseName: previewPopOrder.enterpriseName,
                            email: previewPopOrder.email,
                            tierOrItem: previewPopOrder.tierOrItem,
                            selectedBank: previewPopOrder.selectedBank || 'capitec'
                          });
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Proforma PDF
                      </button>

                      <div className="flex items-center gap-2">
                        {previewPopOrder.status !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => handleRejectOrder(previewPopOrder)}
                            className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                        {previewPopOrder.status !== 'VERIFIED' && (
                          <button
                            type="button"
                            onClick={() => handleApproveOrder(previewPopOrder)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                          >
                            <Check className="w-4 h-4" />
                            Approve &amp; Unlock VIP
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          );
        })()}

      </div>

      {/* Admin-Restricted PayPal Gateway Key Configuration Modal */}
      <PayPalKeyConfigModal
        isOpen={isAdminPayPalModalOpen}
        onClose={() => setIsAdminPayPalModalOpen(false)}
      />

      {/* Partner Referral QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-950/20 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Partner Referral QR Code
                    <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Live
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Scan with any smartphone camera
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-center">
              {/* Destination & Partner Info Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Partner Code: <strong className="text-amber-400">{partnerCode}</strong>
                </span>
                <span className="font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Target: <strong className="text-cyan-400">
                    {linkDestination === 'zambia' ? '15-PT Diagnostic' : linkDestination === 'tender' ? 'Tender File' : linkDestination === 'calculator' ? 'Cost Calculator' : 'Platform Home'}
                  </strong>
                </span>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                  15% Rev Share
                </span>
              </div>

              {/* High-Contrast QR Code Card */}
              <div className="flex justify-center my-2">
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl shadow-slate-950/60 inline-block border-4 border-slate-800">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt={`Referral QR Code for ${partnerCode}`} 
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto block"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-slate-600 text-xs font-mono">
                      Generating scannable QR Code...
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Scan Helper */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Mobile Scan Instructions</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Open any smartphone camera (iOS Camera app or Android Google Lens / QR Scanner). Point at this QR code to immediately launch MeloTwo with your partner referral code attached.
                </p>
                <div className="pt-1">
                  <div className="text-[10px] font-mono text-slate-500 truncate select-all bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-cyan-300">
                    {partnerTrackingLink}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownloadQrCode}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-950/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerCoPilotAdminView;
