import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  HardHat, 
  Sprout, 
  Building2, 
  Factory, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  ArrowRight, 
  AlertTriangle,
  Zap,
  Info,
  DollarSign
} from 'lucide-react';
import jsPDF from 'jspdf';

export type IndustryType = 'mining' | 'agriculture' | 'construction' | 'manufacturing';

export interface IndustryConfig {
  id: IndustryType;
  name: string;
  shortName: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  governingAct: string;
  stoppageTerm: string;
  baseDailyStoppageCost: number; // in ZAR
  stoppageRiskMultiplier: number;
  avgHoursPerSiteFile: number;
  workerWeeklyAdminMinutes: number;
  binderPhysicalCostPerSite: number;
  colorTheme: {
    badge: string;
    border: string;
    accent: string;
    gradient: string;
  };
}

export const INDUSTRY_CONFIGS: Record<IndustryType, IndustryConfig> = {
  mining: {
    id: 'mining',
    name: 'Mining & Mineral Extraction',
    shortName: 'Mining',
    badge: 'DMRE / MHSA Regulated',
    icon: HardHat,
    description: 'Underground & open-cast pits, shaft sinking, mineral processing, plant infrastructure.',
    governingAct: 'Mine Health and Safety Act (Act 29 of 1996) & DMRE Guidelines',
    stoppageTerm: 'MHSA Section 54 / 55 Shaft Stoppage Order',
    baseDailyStoppageCost: 650000, // R650,000 / day default baseline
    stoppageRiskMultiplier: 1.45,
    avgHoursPerSiteFile: 84, // hours per year per site compiling 20-section statutory files
    workerWeeklyAdminMinutes: 18, // minutes/worker/week for toolbox talks, medicals, PPE loggers
    binderPhysicalCostPerSite: 6800, // ZAR printing, lever-arch files, courier to remote mine
    colorTheme: {
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      border: 'border-amber-500/30 hover:border-amber-500/60',
      accent: 'text-amber-400',
      gradient: 'from-amber-500/20 via-slate-900 to-slate-950'
    }
  },
  construction: {
    id: 'construction',
    name: 'Construction & Civil Engineering',
    shortName: 'Construction',
    badge: 'OHS Act / CR 2014 & CIDB',
    icon: Building2,
    description: 'Commercial builds, roadworks, earthmoving, high-voltage electrical contractor works.',
    governingAct: 'Construction Regulations 2014 (CR 2014) & OHS Act 85 of 1993',
    stoppageTerm: 'DoEL Section 30 Prohibition / Work Stoppage Notice',
    baseDailyStoppageCost: 220000, // R220,000 / day
    stoppageRiskMultiplier: 1.15,
    avgHoursPerSiteFile: 64,
    workerWeeklyAdminMinutes: 14,
    binderPhysicalCostPerSite: 4500,
    colorTheme: {
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      accent: 'text-cyan-400',
      gradient: 'from-cyan-500/20 via-slate-900 to-slate-950'
    }
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Heavy Manufacturing & Logistics',
    shortName: 'Manufacturing',
    badge: 'DMR 18 / SANS 10142-1',
    icon: Factory,
    description: 'Foundries, automotive assembly, chemical plants, automated FMCG packaging facilities.',
    governingAct: 'General Machinery Regulations & Driven Machinery Regulations (DMR 18)',
    stoppageTerm: 'DoEL Mechanical Lockout / Factory Halt Order',
    baseDailyStoppageCost: 310000, // R310,000 / day
    stoppageRiskMultiplier: 1.25,
    avgHoursPerSiteFile: 56,
    workerWeeklyAdminMinutes: 12,
    binderPhysicalCostPerSite: 3800,
    colorTheme: {
      badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      border: 'border-blue-500/30 hover:border-blue-500/60',
      accent: 'text-blue-400',
      gradient: 'from-blue-500/20 via-slate-900 to-slate-950'
    }
  },
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture & Agri-Processing',
    shortName: 'Agriculture',
    badge: 'SANS 10330 / HACCP',
    icon: Sprout,
    description: 'Commercial farms, packhouses, grain silos, agrochemical spray operators, cold chains.',
    governingAct: 'Occupational Health and Safety Act & SANS 10330 HACCP Standards',
    stoppageTerm: 'DoEL Non-Compliance Audit Freeze / Export Delay',
    baseDailyStoppageCost: 95000, // R95,000 / day
    stoppageRiskMultiplier: 0.85,
    avgHoursPerSiteFile: 42,
    workerWeeklyAdminMinutes: 10,
    binderPhysicalCostPerSite: 2400,
    colorTheme: {
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      accent: 'text-emerald-400',
      gradient: 'from-emerald-500/20 via-slate-900 to-slate-950'
    }
  }
};

export interface CalculatorState {
  industry: IndustryType;
  workerCount: number;
  siteCount: number;
  sheqHourlyRate: number; // default R450/hr
  includeStoppageRisk: boolean;
}

export interface CalculationResult {
  industryConfig: IndustryConfig;
  annualAdminHoursManual: number;
  annualAdminHoursMeloTwo: number;
  hoursSaved: number;
  hoursSavedPercentage: number;
  
  // Cost breakdown
  annualLaborCostManual: number;
  annualPhysicalStationeryCost: number;
  annualStoppageRiskExposure: number;
  totalAnnualDrainManual: number;
  
  // MeloTwo savings
  meloTwoEstimatedCost: number;
  netAnnualSavingsZAR: number;
  stoppageRiskReductionPercentage: number;
  roiMultiplier: number;
}

export function calculateSafetySavings(state: CalculatorState): CalculationResult {
  const cfg = INDUSTRY_CONFIGS[state.industry];
  const { workerCount, siteCount, sheqHourlyRate, includeStoppageRisk } = state;

  // 1. Time Lost Formula:
  // - Annual File Compilation & Statutory Audit Prep: Site Count * avgHoursPerSiteFile
  // - Daily/Weekly Worker Admin (Medicals, ToolBox Talks, SANS PPE sign-offs): 
  //   (Worker Count * Minutes per week * 48 working weeks / 60 minutes)
  const sitePrepAdminHours = siteCount * cfg.avgHoursPerSiteFile;
  const workerOngoingAdminHours = Math.round((workerCount * cfg.workerWeeklyAdminMinutes * 48) / 60);
  const annualAdminHoursManual = sitePrepAdminHours + workerOngoingAdminHours;

  // MeloTwo cuts file generation time by 88%
  const annualAdminHoursMeloTwo = Math.round(annualAdminHoursManual * 0.12);
  const hoursSaved = annualAdminHoursManual - annualAdminHoursMeloTwo;
  const hoursSavedPercentage = Math.round((hoursSaved / Math.max(1, annualAdminHoursManual)) * 100);

  // 2. Direct Financial Drain (Labor + Printing/Physical Logistics)
  const annualLaborCostManual = annualAdminHoursManual * sheqHourlyRate;
  const annualPhysicalStationeryCost = siteCount * cfg.binderPhysicalCostPerSite;

  // 3. Stoppage & Regulatory Penalty Risk Liability:
  // Probability scale: ~5% - 15% annual risk of at least 1 day stoppage per 5 sites
  const estimatedStoppageDaysExposure = Math.max(0.35, (siteCount * 0.25) * (workerCount > 100 ? 1.3 : 1.0));
  const rawStoppageRisk = estimatedStoppageDaysExposure * cfg.baseDailyStoppageCost;
  const annualStoppageRiskExposure = includeStoppageRisk ? Math.round(rawStoppageRisk) : 0;

  // Total Manual Drain
  const totalAnnualDrainManual = annualLaborCostManual + annualPhysicalStationeryCost + annualStoppageRiskExposure;

  // 4. Estimated MeloTwo Platform Tier Cost
  // Base tier pricing + modest user scaling
  let basePlatformMonthly = 2499;
  if (state.industry === 'mining') basePlatformMonthly = 14999;
  else if (state.industry === 'construction' || state.industry === 'manufacturing') basePlatformMonthly = 4500;
  
  const estimatedAnnualMeloTwoCost = basePlatformMonthly * 12 + (siteCount > 3 ? (siteCount - 3) * 1200 * 12 : 0);

  // Net Savings (Labor saved + Stationery saved + Stoppage Risk mitigation (90% risk reduction))
  const directCostSavings = (hoursSaved * sheqHourlyRate) + (annualPhysicalStationeryCost * 0.90);
  const riskMitigatedSavings = annualStoppageRiskExposure * 0.92;
  const totalGrossSavings = directCostSavings + riskMitigatedSavings;
  const netAnnualSavingsZAR = Math.max(15000, Math.round(totalGrossSavings - estimatedAnnualMeloTwoCost));

  const roiMultiplier = Math.max(2.5, Math.round((totalGrossSavings / Math.max(1, estimatedAnnualMeloTwoCost)) * 10) / 10);

  return {
    industryConfig: cfg,
    annualAdminHoursManual,
    annualAdminHoursMeloTwo,
    hoursSaved,
    hoursSavedPercentage,
    annualLaborCostManual,
    annualPhysicalStationeryCost,
    annualStoppageRiskExposure,
    totalAnnualDrainManual,
    meloTwoEstimatedCost: estimatedAnnualMeloTwoCost,
    netAnnualSavingsZAR,
    stoppageRiskReductionPercentage: 92,
    roiMultiplier
  };
}

export interface SafetySavingsCalculatorProps {
  onAutomateClick?: (calculatedData: {
    industry: IndustryType;
    workerCount: number;
    siteCount: number;
    netAnnualSavings: number;
    hoursSaved: number;
  }) => void;
  className?: string;
  isStandalone?: boolean;
}

export const SafetySavingsCalculator: React.FC<SafetySavingsCalculatorProps> = ({
  onAutomateClick,
  className = '',
  isStandalone = false
}) => {
  const [industry, setIndustry] = useState<IndustryType>('mining');
  const [workerCount, setWorkerCount] = useState<number>(45);
  const [siteCount, setSiteCount] = useState<number>(3);
  const [sheqHourlyRate, setSheqHourlyRate] = useState<number>(450);
  const [includeStoppageRisk, setIncludeStoppageRisk] = useState<boolean>(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Calculate live results
  const results = useMemo(() => {
    return calculateSafetySavings({
      industry,
      workerCount,
      siteCount,
      sheqHourlyRate,
      includeStoppageRisk
    });
  }, [industry, workerCount, siteCount, sheqHourlyRate, includeStoppageRisk]);

  const activeConfig = INDUSTRY_CONFIGS[industry];

  const formatZAR = (val: number) => {
    return `R${Math.round(val).toLocaleString('en-ZA')}`;
  };

  const handleCtaClick = () => {
    if (onAutomateClick) {
      onAutomateClick({
        industry,
        workerCount,
        siteCount,
        netAnnualSavings: results.netAnnualSavingsZAR,
        hoursSaved: results.hoursSaved
      });
    } else {
      // Default behavior: scroll to top or trigger file generator
      const tenderWizardBtn = document.getElementById('tender-wizard-trigger');
      if (tenderWizardBtn) {
        tenderWizardBtn.click();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Export Executive PDF Business Case
  const handleDownloadExecutiveReport = () => {
    setIsDownloadingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('MELOTWO INDUSTRIAL SAFETY ENGINE', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(56, 189, 248); // cyan-400
      doc.text('EXECUTIVE COST & COMPLIANCE SAVINGS ASSESSMENT', 14, 26);

      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(8);
      doc.text(`Generated for: ${activeConfig.name} Operations | Date: ${new Date().toLocaleDateString('en-ZA')}`, 14, 34);

      // Section 1: Parameters
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Operational Parameters & Site Profile', 14, 52);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`• Industry Classification: ${activeConfig.name} (${activeConfig.badge})`, 14, 60);
      doc.text(`• Governing Legislation: ${activeConfig.governingAct}`, 14, 66);
      doc.text(`• Active Project Sites / Shaft IDs: ${siteCount} sites`, 14, 72);
      doc.text(`• Workforce Size on Site: ${workerCount} registered personnel`, 14, 78);
      doc.text(`• SHEQ Officer / Consultant Cost Baseline: R${sheqHourlyRate}/hour`, 14, 84);

      // Section 2: Financial Drain Breakdown
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Financial Drain & Time Lost Under Manual Operations', 14, 98);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(185, 28, 28); // red-700
      doc.text(`• Annual Manual Admin Hours: ${results.annualAdminHoursManual.toLocaleString()} hours/year`, 14, 106);
      doc.text(`• Direct SHEQ Labor Overhead: ${formatZAR(results.annualLaborCostManual)}`, 14, 112);
      doc.text(`• Physical Stationery & Courier Binders: ${formatZAR(results.annualPhysicalStationeryCost)}`, 14, 118);
      if (includeStoppageRisk) {
        doc.text(`• ${activeConfig.stoppageTerm} Risk Exposure: ${formatZAR(results.annualStoppageRiskExposure)}`, 14, 124);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`• TOTAL MANUAL COMPLIANCE DRAIN: ${formatZAR(results.totalAnnualDrainManual)}/year`, 14, 132);

      // Section 3: Projected Savings with MeloTwo
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Projected Efficiency & Savings with MeloTwo Automation', 14, 146);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 118, 110);
      doc.text(`• Time Reclaimed: ${results.hoursSaved.toLocaleString()} hours saved/year (${results.hoursSavedPercentage}% reduction)`, 14, 154);
      doc.text(`• Automated File Assembly Time: Under 90 seconds (vs 64-84 manual hours)`, 14, 160);
      doc.text(`• Statutory Stoppage Risk Reduction: ${results.stoppageRiskReductionPercentage}% risk mitigation`, 14, 166);
      doc.text(`• Estimated Annual ROI Multiplier: ${results.roiMultiplier}x return on investment`, 14, 172);

      // Total Highlight Box
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.setDrawColor(16, 185, 129); // emerald-500
      doc.roundedRect(14, 182, pageWidth - 28, 30, 3, 3, 'FD');

      doc.setTextColor(6, 95, 70); // emerald-800
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('ESTIMATED NET ANNUAL FINANCIAL BENEFIT:', 20, 194);
      doc.setFontSize(18);
      doc.text(`${formatZAR(results.netAnnualSavingsZAR)} / year`, 20, 205);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('MeloTwo Safety Engine | South African OHS Act, MHSA & SANS 10142-1 Compliance Platform', 14, 280);
      doc.text('Website: https://melotwo.com | Support: safety@melotwo.com', 14, 285);

      doc.save(`MeloTwo_Safety_Savings_Report_${industry}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className={`w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Top Banner Header */}
      <div className="bg-slate-950/80 p-6 md:p-8 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Calculator className="w-3.5 h-3.5" />
                South African Industrial ROI Engine
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                OHS & MHSA 2026 Edition
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Safety File Cost & Stoppage Risk Calculator
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Calculate the true financial drain of manual 3-ring binder compliance, contractor admin delays, and Section 54/55 statutory stoppage penalties across your sites.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadExecutiveReport}
            disabled={isDownloadingPdf}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
            title="Download executive business case in PDF"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Executive Report (PDF)'}</span>
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Industry Sector Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span>1. Select Industry Sector</span>
              <span className="text-[11px] font-normal text-slate-400">Determines statutory risk profile</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(INDUSTRY_CONFIGS) as IndustryType[]).map((key) => {
                const config = INDUSTRY_CONFIGS[key];
                const IconComponent = config.icon;
                const isSelected = industry === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIndustry(key)}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-white leading-snug">{config.shortName}</span>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{config.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Industry Regulatory Badge */}
            <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">{activeConfig.governingAct}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">{activeConfig.description}</p>
              </div>
            </div>
          </div>

          {/* Step 2: Number of Workers */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/70">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="worker-range" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Workforce on Site
              </label>
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                <input
                  type="number"
                  min="1"
                  max="2500"
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-transparent text-right font-mono font-bold text-sm text-emerald-400 focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-medium">workers</span>
              </div>
            </div>
            <input
              id="worker-range"
              type="range"
              min="5"
              max="500"
              step="5"
              value={workerCount}
              onChange={(e) => setWorkerCount(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>5 workers</span>
              <span>100</span>
              <span>250</span>
              <span>500+ workers</span>
            </div>
          </div>

          {/* Step 3: Number of Active Project Sites / Shaft IDs */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/70">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="site-range" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Active Sites / Shaft IDs
              </label>
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={siteCount}
                  onChange={(e) => setSiteCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 bg-transparent text-right font-mono font-bold text-sm text-cyan-400 focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-medium">sites</span>
              </div>
            </div>
            <input
              id="site-range"
              type="range"
              min="1"
              max="25"
              step="1"
              value={siteCount}
              onChange={(e) => setSiteCount(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>1 site</span>
              <span>5 sites</span>
              <span>15 sites</span>
              <span>25+ sites</span>
            </div>
          </div>

          {/* Advanced Risk Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStoppageRisk}
                  onChange={(e) => setIncludeStoppageRisk(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Include {activeConfig.stoppageTerm} Modeling</span>
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                {formatZAR(activeConfig.baseDailyStoppageCost)}/day baseline
              </span>
            </div>

            {includeStoppageRisk && (
              <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                Calculates weighted financial exposure based on DMRE / DoEL statutory shutdown risk for missing daily checklists, expired medicals, or delayed SANS 10142 compliance records.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Impact Summary & Conversion Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Top Level Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Annual Financial Drain */}
            <div className="bg-gradient-to-b from-rose-950/30 to-slate-950 p-4 rounded-xl border border-rose-900/30">
              <div className="flex items-center gap-2 text-rose-400 mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Manual Drain</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-200 font-mono tracking-tight">
                {formatZAR(results.totalAnnualDrainManual)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Lost in manual SHEQ hours & paper binders</p>
            </div>

            {/* Card 2: Hours Lost */}
            <div className="bg-gradient-to-b from-amber-950/30 to-slate-950 p-4 rounded-xl border border-amber-900/30">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Time Lost</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-200 font-mono tracking-tight">
                {results.annualAdminHoursManual.toLocaleString()} <span className="text-xs font-normal text-slate-400">hrs/yr</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Chasing signatures, scans & binder updates</p>
            </div>

            {/* Card 3: Stoppage Risk Exposure */}
            <div className="bg-gradient-to-b from-purple-950/30 to-slate-950 p-4 rounded-xl border border-purple-900/30">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Stoppage Risk</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-purple-200 font-mono tracking-tight">
                {includeStoppageRisk ? formatZAR(results.annualStoppageRiskExposure) : 'R0'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{activeConfig.shortName} inspection exposure</p>
            </div>
          </div>

          {/* Hero ROI / Savings Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500/40 p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Zap className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Projected Net Annual Value with MeloTwo
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 font-mono">
                {results.roiMultiplier}x ROI
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-emerald-500/20 pb-4">
              <div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                  {formatZAR(results.netAnnualSavingsZAR)}
                </div>
                <p className="text-xs text-emerald-300/80 mt-1 font-medium">
                  Direct savings in labor, stationery elimination & risk mitigation
                </p>
              </div>

              <div className="sm:text-right">
                <div className="text-xl md:text-2xl font-bold text-white font-mono">
                  {results.hoursSaved.toLocaleString()} Hours
                </div>
                <p className="text-xs text-slate-400">
                  Reclaimed for site operations ({results.hoursSavedPercentage}% reduction)
                </p>
              </div>
            </div>

            {/* Impact Feature Checklist */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant 20-section statutory safety file in &lt; 90 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero binder printing, couriers, or lost physical sheets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time COIDA & Annexure 3 medical fitness expiry alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeConfig.governingAct.split('&')[0]} audit readiness guarantee</span>
              </div>
            </div>

            {/* High-Conversion Primary CTA */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-sm md:text-base tracking-wide rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>[ Automate My Safety Files Now ]</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>

              <button
                type="button"
                onClick={handleDownloadExecutiveReport}
                disabled={isDownloadingPdf}
                className="w-full sm:w-auto px-4 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Export PDF</span>
              </button>
            </div>
            
            <p className="text-center sm:text-left text-[11px] text-slate-400 mt-2">
              No credit card required. Compliant with SANS, OHS Act, MHSA & CIDB statutory tender requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
