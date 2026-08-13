import React, { useState, useEffect, useId } from 'react';
import { 
  X, 
  Calculator, 
  Check, 
  Sprout, 
  Factory, 
  HardHat, 
  Users, 
  FileSpreadsheet, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';

export type IndustryTierId = 'agriculture' | 'light_industrial' | 'mining_enterprise';

export interface IndustryTier {
  id: IndustryTierId;
  name: string;
  subtitle: string;
  basePrice: number;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

export const INDUSTRY_TIERS: IndustryTier[] = [
  {
    id: 'agriculture',
    name: 'Agriculture / Local Supply',
    subtitle: 'Farms, packhouses, primary food processors & local suppliers',
    basePrice: 1999,
    badge: 'SMB Friendly',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: Sprout,
    features: ['SANS 10330 / HACCP basics', 'Mobile offline checklist entry', '2 supervisors included free']
  },
  {
    id: 'light_industrial',
    name: 'Light Industrial / Logistics / Workshop',
    subtitle: 'Warehouses, fleet depots, light manufacturing & fabrication plants',
    basePrice: 4500,
    badge: 'Most Popular',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    icon: Factory,
    features: ['OHS Act statutory logs', 'Incident & near-miss register', 'Shift handover sign-offs']
  },
  {
    id: 'mining_enterprise',
    name: 'Mining / Heavy Enterprise',
    subtitle: 'Underground & open-cast operations, mineral processing & heavy industry',
    basePrice: 15000,
    badge: 'DMRE Compliant',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    icon: HardHat,
    features: ['MHSA Section 54/55 readiness', 'SANS 10142-1 & 10108 high-risk logs', 'Tamper-proof audit ledger']
  }
];

export interface SiteCostCalculation {
  selectedTier: IndustryTier;
  userCount: number;
  extraUsersCount: number;
  baseMonthlyFee: number;
  extraUsersMonthlyFee: number;
  totalMonthlyFee: number;
  digitizationBundle: boolean;
  oneTimeSetupFee: number;
}

export interface CalculateSiteCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial?: (calculation: SiteCostCalculation) => void;
  onRequestProposal?: (calculation: SiteCostCalculation) => void;
}

export const CalculateSiteCostModal: React.FC<CalculateSiteCostModalProps> = ({
  isOpen,
  onClose,
  onStartTrial,
  onRequestProposal
}) => {
  const [selectedTierId, setSelectedTierId] = useState<IndustryTierId>('agriculture');
  const [userCount, setUserCount] = useState<number>(2);
  const [digitizationBundle, setDigitizationBundle] = useState<boolean>(true);
  const [proposalSubmitted, setProposalSubmitted] = useState<boolean>(false);
  const [isAnnualBilling, setIsAnnualBilling] = useState<boolean>(false);

  const sliderId = useId();
  const checkboxId = useId();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setProposalSubmitted(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTier = INDUSTRY_TIERS.find(t => t.id === selectedTierId) || INDUSTRY_TIERS[0];
  
  // Pricing formulas
  // Rule: Up to 2 users included free. Add R1,500/mo for each user above 2.
  const extraUsersCount = Math.max(0, userCount - 2);
  const extraUsersMonthlyFee = extraUsersCount * 1500;
  const baseMonthlyFee = currentTier.basePrice;
  const rawMonthlyFee = baseMonthlyFee + extraUsersMonthlyFee;
  const effectiveMonthlyFee = isAnnualBilling ? Math.round(rawMonthlyFee * 0.85) : rawMonthlyFee;
  
  // Setup fee: R2,500 for digitization bundle, otherwise R0
  const oneTimeSetupFee = digitizationBundle ? 2500 : 0;

  const calculationDetails: SiteCostCalculation = {
    selectedTier: currentTier,
    userCount,
    extraUsersCount,
    baseMonthlyFee,
    extraUsersMonthlyFee,
    totalMonthlyFee: effectiveMonthlyFee,
    digitizationBundle,
    oneTimeSetupFee
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString('en-ZA')}`;
  };

  const handleStartTrial = () => {
    if (onStartTrial) {
      onStartTrial(calculationDetails);
    } else {
      onClose();
    }
  };

  const handleRequestProposal = () => {
    if (onRequestProposal) {
      onRequestProposal(calculationDetails);
    } else {
      setProposalSubmitted(true);
    }
  };

  return (
    <div 
      id="calculate-site-cost-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="calculate-site-cost-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-cost-modal-title"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="site-cost-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Calculate Site Deployment Cost
                </h2>
                <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Instant Estimate
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent SHEQ compliance pricing tailored from family-run packhouses to deep-level mines
              </p>
            </div>
          </div>
          <button
            id="close-site-cost-modal-btn"
            onClick={onClose}
            aria-label="Close cost calculator"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {proposalSubmitted ? (
          /* Confirmation View */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Proposal Request Generated!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Our SHEQ engineers have received your configuration for <span className="text-white font-medium">{currentTier.name}</span> with <span className="text-white font-medium">{userCount} supervisor seats</span>.
            </p>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl max-w-sm mx-auto text-left text-xs text-slate-300 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Subscription:</span>
                <span className="text-cyan-300 font-bold">{formatCurrency(effectiveMonthlyFee)} / mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Setup & Digitization:</span>
                <span className="text-amber-300 font-bold">{formatCurrency(oneTimeSetupFee)}</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-cyan-950/50 cursor-pointer"
              >
                Return to Workspace
              </button>
            </div>
          </div>
        ) : (
          /* Calculator Body */
          <div className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
            
            {/* Step 1: Industry & Framework Focus */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">1</span>
                  <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                    Select Industry & Regulatory Framework
                  </label>
                </div>
                <span className="text-xs text-slate-400">Tailored baseline modules</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {INDUSTRY_TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const Icon = tier.icon;
                  return (
                    <div
                      key={tier.id}
                      id={`tier-card-${tier.id}`}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isSelected 
                          ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                            {tier.badge}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {tier.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                        <span className="text-[11px] text-slate-400">Base Plan</span>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-white">{formatCurrency(tier.basePrice)}</span>
                          <span className="text-[10px] text-slate-400 ml-1">/mo</span>
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Scale (Duty-Bearers / Supervisors Slider) */}
            <div className="p-4 sm:p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">2</span>
                  <div>
                    <label htmlFor={sliderId} className="text-sm font-semibold text-slate-200">
                      Active Duty-Bearers & Site Supervisors
                    </label>
                    <p className="text-xs text-slate-400">
                      Inspectors, SHEQ officers, pit bosses, or farm managers with write/sign-off access
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-lg text-right">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-mono font-bold text-white">
                    {userCount} {userCount === 1 ? 'User' : 'Users'}
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-2">
                <input
                  id={sliderId}
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={userCount}
                  onChange={(e) => setUserCount(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>1 User</span>
                  <span className="text-cyan-400 font-medium">2 Users Free</span>
                  <span>10 Users</span>
                  <span>20+ Enterprise</span>
                </div>
              </div>

              {/* User Pricing Explainer */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  First 2 supervisor seats included free
                </span>
                <span className="font-mono text-slate-300">
                  {extraUsersCount > 0 ? (
                    <span className="text-cyan-300 font-semibold">
                      +{extraUsersCount} extra × R1,500/mo = +{formatCurrency(extraUsersMonthlyFee)}/mo
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">No extra user charges</span>
                  )}
                </span>
              </div>
            </div>

            {/* Step 3: Form Onboarding Option */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">3</span>
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  Onboarding & Digitization Setup
                </label>
              </div>

              <div 
                id="digitization-bundle-card"
                onClick={() => setDigitizationBundle(!digitizationBundle)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                  digitizationBundle
                    ? 'bg-slate-950/90 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={digitizationBundle}
                    onChange={(e) => setDigitizationBundle(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/40 accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                      Initial Paper Checklist Digitization Bundle
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      R2,500 One-Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Convert up to 5 existing paper audits, pre-trip checklists, or daily log sheets into compliant, automated MeloTwo forms with custom validation rules & export templates.
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Output Calculation Display */}
            <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-inner">
              
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Billing Cycle</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsAnnualBilling(false)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        !isAnnualBilling ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnnualBilling(true)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                        isAnnualBilling ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Annual <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded">-15%</span>
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">One-Time Setup Fee</span>
                  <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                    {formatCurrency(oneTimeSetupFee)}
                  </div>
                </div>
              </div>

              {/* Total Monthly Subscription */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
                    Estimated Subscription:
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1 mt-0.5">
                    <span className="text-cyan-400 font-mono">{formatCurrency(effectiveMonthlyFee)}</span>
                    <span className="text-xs text-slate-400 font-normal">/ mo</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <span>Base: {formatCurrency(baseMonthlyFee)}</span>
                  {extraUsersCount > 0 && <span> + Extra Seats: {formatCurrency(extraUsersMonthlyFee)}</span>}
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  id="modal-start-trial-cta"
                  onClick={handleStartTrial}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Start 14-Day Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="modal-request-proposal-cta"
                  onClick={handleRequestProposal}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  Request Custom Proposal
                </button>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-slate-400">
                  Zero long-term lock-in • Cancel anytime • Includes SSL & daily cloud backups
                </p>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};
