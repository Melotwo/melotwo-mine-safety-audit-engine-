import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Layers,
  CheckCircle2,
  Download,
  FileText,
  DollarSign,
  ArrowRight,
  Sparkles,
  Users,
  HardHat,
  Lock,
  RefreshCw,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export interface MeloTwoPricingCalculatorProps {
  onNotify?: (message: string) => void;
  onOpenTenderWizard?: () => void;
}

export type PricingTierId = 'TIER_1_PILOT' | 'TIER_2_MID' | 'TIER_3_ENTERPRISE';

export interface CommercialTierConfig {
  id: PricingTierId;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  baseMonthlyZar: number;
  maxMonthlyZar: number;
  baseMonthlyUsd: number;
  maxMonthlyUsd: number;
  annualZarMin: number;
  annualZarMax: number;
  annualUsdMin: number;
  annualUsdMax: number;
  dutyBearersIncluded: number;
  features: string[];
  statutoryCoverage: string[];
}

export const COMMERCIAL_TIERS: Record<PricingTierId, CommercialTierConfig> = {
  TIER_1_PILOT: {
    id: 'TIER_1_PILOT',
    name: 'Tier 1: Small Contractor / Pilot Entry',
    tagline: 'Rapid entry for subcontractors, engineering vendors & short-term tender submissions',
    badge: 'Pilot / Subcontractor',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    baseMonthlyZar: 1999,
    maxMonthlyZar: 2500,
    baseMonthlyUsd: 108,
    maxMonthlyUsd: 135,
    annualZarMin: 23988,
    annualZarMax: 30000,
    annualUsdMin: 1296,
    annualUsdMax: 1620,
    dutyBearersIncluded: 3,
    features: [
      'Up to 3 Appointed Duty-Bearers (Section 16.2 / Safety Officers)',
      'Single 20-Section Tender Safety File ("The Red File") Compilation',
      'R1,500 - R2,500 once-off per tender dossier or R1,999/mo subscription',
      'Basic HIRA hazard logging & pre-shift checklists',
      'Standard digital PDF export with cryptographic verification hash'
    ],
    statutoryCoverage: ['OHS Act 37(2)', 'SANS 10142 / 10330', 'Section 16(2) Basic Appointees']
  },
  TIER_2_MID: {
    id: 'TIER_2_MID',
    name: 'Tier 2: Mid-Tier Operational Extension',
    tagline: 'Comprehensive operational compliance for multi-shaft contractors and mining supply operations',
    badge: 'Most Popular',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    baseMonthlyZar: 8500,
    maxMonthlyZar: 15000,
    baseMonthlyUsd: 1400,
    maxMonthlyUsd: 1800,
    annualZarMin: 102000,
    annualZarMax: 180000,
    annualUsdMin: 16800,
    annualUsdMax: 21600,
    dutyBearersIncluded: 10,
    features: [
      'Up to 10 Appointed Duty-Bearers (CR 9.1 Risk Assessors, GCC Engineers, Shift Supervisors)',
      'Full Workplace Risk Assessment & Control (WRAC 5x5 Matrix) with SANS 31000 controls',
      'Failure Modes & Effects Analysis (FMEA) Reliability Engine with RPN calculation',
      '0-1 Hour High-Severity Auto-CAPA ticketing for Critical Risks (17-25)',
      'Subterranean offline persistence (IndexedDB 2,000m underground off-grid, <3s Wi-Fi auto-sync)',
      'SETA / QCTO skills tracking & WSP/ATR statutory report generator'
    ],
    statutoryCoverage: ['MHSA Section 11(1)', 'SANS 31000 WRAC', 'CR 9.1 Auto-CAPA', 'SETA/QCTO WSP/ATR']
  },
  TIER_3_ENTERPRISE: {
    id: 'TIER_3_ENTERPRISE',
    name: 'Tier 3: Enterprise Mine & Section 21 Authority',
    tagline: 'Full-mine statutory governance suite with Section 21 OEM Vault, GCC Engineer Lockouts & Aion Risk Review',
    badge: 'Chief Inspector Grade',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    baseMonthlyZar: 15000,
    maxMonthlyZar: 35000,
    baseMonthlyUsd: 2500,
    maxMonthlyUsd: 5000,
    annualZarMin: 180000,
    annualZarMax: 420000,
    annualUsdMin: 30000,
    annualUsdMax: 60000,
    dutyBearersIncluded: 50,
    features: [
      'Unlimited / 50+ Appointed Duty-Bearers across multi-shaft mining complexes',
      'MHSA Section 21 Supplier & OEM Compliance Vault (Sandvik, Epiroc, Komatsu, Joy Global)',
      'Automated Statutory Operational Lockout for RPN > 200 or Severity >= 8 under MHSA Sec 2.13.1 / 2.13.3.1',
      'Mandatory GCC Mechanical/Electrical Engineer digital clearance certification',
      '90-Second DMRE Section 54 inspectorial audit sign-off with public QR validation (melotwo.com/verify/sec21/)',
      'Tailings Liability Transfer & GISTM closure governance suite',
      'Multi-hazard reconciliation and automated chief executive defensibility indexing'
    ],
    statutoryCoverage: ['MHSA Section 3.1(a)', 'MHSA Section 2.13.1 / 2.13.3.1', 'MHSA Section 21 OEM Vault', 'DMRE Section 54/55 Immunity']
  }
};

const FX_ANCHOR_USD_ZAR = 18.50;
const PILOT_CREDIT_USD = 650;
const PILOT_CREDIT_ZAR = Math.round(PILOT_CREDIT_USD * FX_ANCHOR_USD_ZAR); // R12,025

export const MeloTwoPricingCalculator: React.FC<MeloTwoPricingCalculatorProps> = ({
  onNotify,
  onOpenTenderWizard
}) => {
  const [selectedTier, setSelectedTier] = useState<PricingTierId>('TIER_2_MID');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [currency, setCurrency] = useState<'ZAR' | 'USD'>('ZAR');
  const [dutyBearersCount, setDutyBearersCount] = useState<number>(10);
  const [sitesCount, setSitesCount] = useState<number>(1);
  const [applyPilotCredit, setApplyPilotCredit] = useState<boolean>(true);
  const [clientName, setClientName] = useState<string>('Aion Risk Review / Enterprise Client');
  const [assessorName, setAssessorName] = useState<string>('Sipho Sithole (Lead Safety Architect)');

  // Calculation logic
  const tierConfig = COMMERCIAL_TIERS[selectedTier];

  const calculatedCost = useMemo(() => {
    // Base monthly
    let monthlyZar = tierConfig.baseMonthlyZar;
    let monthlyUsd = tierConfig.baseMonthlyUsd;

    // Additional duty-bearers beyond included
    const extraDutyBearers = Math.max(0, dutyBearersCount - tierConfig.dutyBearersIncluded);
    const extraDutyBearerFeeZar = extraDutyBearers * 450;
    const extraDutyBearerFeeUsd = Math.round(extraDutyBearerFeeZar / FX_ANCHOR_USD_ZAR);

    monthlyZar = (monthlyZar + extraDutyBearerFeeZar) * sitesCount;
    monthlyUsd = (monthlyUsd + extraDutyBearerFeeUsd) * sitesCount;

    let totalZar = billingCycle === 'ANNUAL' ? monthlyZar * 12 * 0.85 : monthlyZar; // 15% annual discount
    let totalUsd = billingCycle === 'ANNUAL' ? monthlyUsd * 12 * 0.85 : monthlyUsd;

    // Transition incentive credit: 100% of pilot entry credited if executed within 30 days
    let creditZar = 0;
    let creditUsd = 0;
    if (applyPilotCredit && (billingCycle === 'ANNUAL' || selectedTier === 'TIER_3_ENTERPRISE')) {
      creditZar = PILOT_CREDIT_ZAR;
      creditUsd = PILOT_CREDIT_USD;
      totalZar = Math.max(0, totalZar - creditZar);
      totalUsd = Math.max(0, totalUsd - creditUsd);
    }

    // Estimated DMRE Section 54 Stoppage Loss Prevented per shift (R1.2M - R4.5M)
    const stoppageLossPreventedZar = sitesCount * 2800000;
    const stoppageLossPreventedUsd = Math.round(stoppageLossPreventedZar / FX_ANCHOR_USD_ZAR);

    return {
      monthlyZar: Math.round(monthlyZar),
      monthlyUsd: Math.round(monthlyUsd),
      totalZar: Math.round(totalZar),
      totalUsd: Math.round(totalUsd),
      creditZar,
      creditUsd,
      extraDutyBearers,
      stoppageLossPreventedZar,
      stoppageLossPreventedUsd
    };
  }, [selectedTier, billingCycle, dutyBearersCount, sitesCount, applyPilotCredit, tierConfig]);

  // Generate Official Proposal PDF for Aion Risk / Client Review
  const handleExportProposalPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const currentDate = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

    // Dark Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 44, 'F');

    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 43, 210, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MELOTWO STATUTORY RISK & ENGINEERING PROPOSAL', 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(245, 158, 11);
    doc.text('ENTERPRISE STATUTORY RISK ESCALATION & ENGINEERING GOVERNANCE SUITE', 14, 24);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Client: ${clientName} • Lead Architect: ${assessorName} • Date: ${currentDate}`, 14, 32);
    doc.text(`FX Anchor Standard: USD 1.00 = ZAR ${FX_ANCHOR_USD_ZAR.toFixed(2)} • SADC MHSA / SANS 31000 Certified`, 14, 38);

    let y = 52;

    // Executive Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`RECOMMENDED ARCHITECTURE: ${tierConfig.name.toUpperCase()}`, 18, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Deploying enterprise risk management for ${sitesCount} site(s) with ${dutyBearersCount} appointed statutory duty-bearers.`, 18, y + 13);
    doc.text(`Includes 0-1 Hour Auto-CAPA CR 9.1 escalations, subterranean offline IndexedDB sync, and MHSA Sec 2.13 GCC Lockout governance.`, 18, y + 19);
    doc.text(`Transition Incentive: 100% of pilot entry fees (${currency === 'ZAR' ? `R${calculatedCost.creditZar.toLocaleString()}` : `$${calculatedCost.creditUsd.toLocaleString()}`}) credited against this contract.`, 18, y + 25);

    y += 34;

    // Commercial Investment Schedule
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(14, y, 182, 38, 2, 2, 'F');
    doc.setDrawColor(51, 65, 85);
    doc.roundedRect(14, y, 182, 38, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text('COMMERCIAL INVESTMENT SCHEDULE', 18, y + 8);

    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    const totalLabel = billingCycle === 'ANNUAL' ? 'Total Annual Commitment (with 15% Term Savings)' : 'Total Monthly Recurring Fee';
    const totalValue = currency === 'ZAR' 
      ? `R ${calculatedCost.totalZar.toLocaleString('en-ZA')} ZAR` 
      : `$ ${calculatedCost.totalUsd.toLocaleString('en-US')} USD`;

    doc.text(`${totalLabel}:`, 18, y + 18);
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(totalValue, 18, y + 27);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Equivalent Monthly: ${currency === 'ZAR' ? `R ${calculatedCost.monthlyZar.toLocaleString()} ZAR/mo` : `$ ${calculatedCost.monthlyUsd.toLocaleString()} USD/mo`}`, 120, y + 18);
    doc.text(`Applied Pilot Credit: -${currency === 'ZAR' ? `R ${calculatedCost.creditZar.toLocaleString()}` : `$ ${calculatedCost.creditUsd.toLocaleString()}`}`, 120, y + 25);
    doc.text(`Estimated Section 54 Stoppage Protection: ${currency === 'ZAR' ? `R ${calculatedCost.stoppageLossPreventedZar.toLocaleString()}` : `$ ${calculatedCost.stoppageLossPreventedUsd.toLocaleString()}`}`, 120, y + 32);

    y += 44;

    // Module Capabilities Breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('SYSTEM MODULE CAPABILITIES & STATUTORY ESCALATION GOVERNANCE:', 14, y);

    y += 6;
    tierConfig.features.forEach((feat, idx) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 182, 10, 1.5, 1.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 10, 1.5, 1.5, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text(`[0${idx + 1}]`, 18, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(feat, 28, y + 6.5);

      y += 12;
    });

    y += 4;

    // Statutory Compliance Mandate Alignment Box
    doc.setFillColor(240, 253, 250); // teal-50
    doc.roundedRect(14, y, 182, 24, 2, 2, 'F');
    doc.setDrawColor(204, 251, 241);
    doc.roundedRect(14, y, 182, 24, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 118, 110);
    doc.text('STATUTORY COMPLIANCE MANDATE ALIGNMENT:', 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Republic of South Africa Mine Health & Safety Act (Act 29 of 1996) Section 3.1(a) Duty-Bearer Protection`, 18, y + 12);
    doc.text(`• MHSA Section 11(1) / SANS 31000 Hierarchy of Controls & CR 9.1 Risk Assessor Escalation`, 18, y + 17);
    doc.text(`• MHSA Section 2.13.1 / 2.13.3.1 GCC Mechanical & Electrical Engineer Statutory Lockouts`, 18, y + 22);

    // Signatures
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('COMMERCIAL AUTHORIZATION:', 14, 260);
    doc.setFont('helvetica', 'normal');
    doc.text('____________________________________________________              ____________________________________________________', 14, 270);
    doc.text(`MeloTwo Safety Commercial Authority (${assessorName})           Client Appointed Duty-Bearer (${clientName})`, 14, 275);
    doc.text('Valid for 30 calendar days from issuance. 100% of pilot entry fees credited toward executed annual contract.', 14, 280);

    doc.save(`MeloTwo_Commercial_Proposal_${selectedTier}_${new Date().toISOString().slice(0, 10)}.pdf`);
    if (onNotify) {
      onNotify('Official Commercial Proposal PDF exported successfully.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-40 bg-amber-500/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                MeloTwo Commercial Architecture
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                FX Anchor: 1 USD = R18.50 ZAR
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                100% Pilot Credit Guaranteed
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
              Commercial Pricing Architecture &amp; Client Proposal Engine
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Statutory risk escalation tiering tailored for South African mining duty-bearers (MHSA Sec 3.1a, GCC Engineers, CR 9.1 Assessors). Generates tailored client proposals and commercial review schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleExportProposalPdf}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Aion Risk Proposal PDF</span>
            </button>

            {onOpenTenderWizard && (
              <button
                onClick={onOpenTenderWizard}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Open Tender Wizard</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Controls: Currency Switcher & Billing Cycle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">Billing Cycle:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Term</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">Save 15%</span>
              </button>
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Flexible
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">Currency Display:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCurrency('ZAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currency === 'ZAR'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ZAR (South African Rand)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                USD (FX Anchor 18.50)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(Object.keys(COMMERCIAL_TIERS) as PricingTierId[]).map((tierKey) => {
          const tier = COMMERCIAL_TIERS[tierKey];
          const isSelected = selectedTier === tierKey;

          return (
            <div
              key={tierKey}
              onClick={() => setSelectedTier(tierKey)}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/80 shadow-2xl shadow-amber-950/40 ring-2 ring-amber-500/30'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-lg">
                  Selected Configuration
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {tier.dutyBearersIncluded} Duty-Bearers
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tier.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Baseline Pricing</span>
                  <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
                    {currency === 'ZAR' ? (
                      <>
                        <span>R {tier.baseMonthlyZar.toLocaleString('en-ZA')}</span>
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </>
                    ) : (
                      <>
                        <span>$ {tier.baseMonthlyUsd.toLocaleString('en-US')}</span>
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-mono">
                    {currency === 'ZAR'
                      ? `Annual: R ${tier.annualZarMin.toLocaleString()} - R ${tier.annualZarMax.toLocaleString()}/yr`
                      : `Annual: $ ${tier.annualUsdMin.toLocaleString()} - $ ${tier.annualUsdMax.toLocaleString()}/yr`}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Included Architecture</span>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory coverage pill footer */}
              <div className="pt-4 mt-6 border-t border-slate-800 flex flex-wrap gap-1.5">
                {tier.statutoryCoverage.map((sc, idx) => (
                  <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {sc}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Parameters & Client Proposal Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Sliders & Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>Operational Scale &amp; Client Parameters</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Tailor for Client Mandate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Client / Mine Operation Name</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                placeholder="e.g. Aion Risk Review / Witwatersrand Deep"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Appointed Lead Architect / Engineer</label>
              <input
                type="text"
                value={assessorName}
                onChange={e => setAssessorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                placeholder="e.g. Johan van der Merwe (GCC Mechanical #M88219)"
              />
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  Statutory Duty-Bearers (Section 16.2 / CR 9.1 / GCC Engineers):
                </span>
                <span className="text-amber-400 font-mono font-black text-sm">{dutyBearersCount} Appointees</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={dutyBearersCount}
                onChange={e => setDutyBearersCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 Appointee</span>
                <span>Tier 1 Limit (3)</span>
                <span>Tier 2 Limit (10)</span>
                <span>Enterprise Max (50+)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Mining Operations / Shaft Locations:
                </span>
                <span className="text-cyan-400 font-mono font-black text-sm">{sitesCount} Site(s)</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={sitesCount}
                onChange={e => setSitesCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 Shaft</span>
                <span>3 Shaft Complex</span>
                <span>5 Integrated Sites</span>
                <span>8 Regional Mines</span>
              </div>
            </div>
          </div>

          {/* Transition Incentive Toggle Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">30-Day Transition Incentive Guarantee</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  100% of pilot entry fees ($650 / R12,025 once-off) credited toward annual enterprise contracts executed within 30 days.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={applyPilotCredit}
                onChange={e => setApplyPilotCredit(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        {/* Right 1 Column: Real-Time Commercial Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Commercial Quote Summary</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {billingCycle}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400">Total Net Investment:</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {currency === 'ZAR' ? (
                  <>R {calculatedCost.totalZar.toLocaleString('en-ZA')}</>
                ) : (
                  <>$ {calculatedCost.totalUsd.toLocaleString('en-US')}</>
                )}
              </div>
              <span className="text-[11px] text-slate-500 block">
                {billingCycle === 'ANNUAL' ? 'Billed annually (15% term discount applied)' : 'Monthly flexible recurring'}
              </span>
            </div>

            {/* Line items breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Base Tier Architecture:</span>
                <span className="text-white font-mono">{tierConfig.name.split(':')[0]}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Mining Sites:</span>
                <span className="text-white font-mono">{sitesCount} Site(s)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Duty-Bearers Capacity:</span>
                <span className="text-white font-mono">{dutyBearersCount} ({calculatedCost.extraDutyBearers} billable extras)</span>
              </div>

              {applyPilotCredit && calculatedCost.creditZar > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Pilot Transition Credit:</span>
                  <span className="font-mono">
                    -{currency === 'ZAR' ? `R ${calculatedCost.creditZar.toLocaleString()}` : `$ ${calculatedCost.creditUsd.toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>

            {/* DMRE Stoppage Loss Comparison ROI */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-rose-500/20 space-y-1">
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">Preventive ROI Benchmark</span>
              <div className="text-base font-bold text-white">
                {currency === 'ZAR' ? `R ${calculatedCost.stoppageLossPreventedZar.toLocaleString()} ZAR` : `$ ${calculatedCost.stoppageLossPreventedUsd.toLocaleString()} USD`}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Estimated DMRE Section 54 shift stoppage loss prevented across {sitesCount} site(s) via continuous WRAC, FMEA, and Section 21 OEM audit defense.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <button
              onClick={handleExportProposalPdf}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Executive Proposal</span>
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Includes formal SANS 31000 / MHSA Section 3.1a legal schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
