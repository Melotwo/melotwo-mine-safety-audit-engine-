import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, FileText, Sparkles, Clock, ArrowRight, ShieldCheck, Zap, Activity, Check, XCircle } from 'lucide-react';

export interface RegulatoryAlert {
  id: string;
  code: string;
  title: string;
  sectorId: string;
  sectorName: string;
  standardCode: string;
  severity: 'Critical Directive' | 'Mandatory Revision' | 'Compliance Warning' | 'Safety Alert' | 'Statutory Stoppage' | 'AIMS Non-Conformity';
  severityColor: string;
  effectiveDate: string;
  summary: string;
  impactDetails: string;
  actionRequired: string;
  authority: string;
  clauseRef: string;
}

export const REGULATORY_SHIFTS_DATA: Record<string, RegulatoryAlert[]> = {
  mining: [
    {
      id: 'alert-min-1',
      code: 'REG-2026-M01',
      title: 'DMRE Sec 54: Methane Sensor Calibration Intervals & Thermal Logging',
      sectorId: 'mining',
      sectorName: 'Deep Mining & Extraction',
      standardCode: 'SANS 10108 / DMRE Sec 54',
      severity: 'Critical Directive',
      severityColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      effectiveDate: 'Aug 1, 2026',
      summary: 'Department of Mineral Resources directive MANDATES 14-day mandatory recalibration cycles for all subterranean Ex-d gas monitoring probes.',
      impactDetails: 'All deep reef shafts operating below 2,000m must verify sensor calibration logs every 14 days. Probes with unverified calibration trigger automatic Section 54 stoppage warnings. Active ventilation flow velocity logs must be attached to every shift inspection report.',
      actionRequired: 'REGULATORY SHIFT DIRECTIVE: Recalibrate Ex-d gas monitoring probes on Shaft 4 and verify Flameproof Enclosure locking bolt torque logs under DMRE Sec 54.',
      authority: 'Department of Mineral Resources (DMRE)',
      clauseRef: 'MHSA Act 29 of 1996 / DMRE Circular 2026-08'
    },
    {
      id: 'alert-min-2',
      code: 'REG-2026-M02',
      title: 'SANS 10330: Subterranean Thermal Logging Update',
      sectorId: 'mining',
      sectorName: 'Deep Mining & Extraction',
      standardCode: 'SANS 10330 / SANS 10108',
      severity: 'Statutory Stoppage',
      severityColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      effectiveDate: 'Jul 20, 2026',
      summary: 'Subterranean thermal logging sensors required at all active stope refuge chambers to prevent heat stress failure.',
      impactDetails: 'Refuge chamber internal temperatures exceeding 32°C wet-bulb must trigger instant alert telemetry to central dispatch. Manual temperature key bypasses are prohibited.',
      actionRequired: 'Inspect stope refuge chamber air conditioning units and log wet-bulb temperature readings.',
      authority: 'DMRE Mining Health & Safety Inspectorate',
      clauseRef: 'MHSA Guideline 2026 Thermal Stress'
    }
  ],
  electrical: [
    {
      id: 'alert-elec-1',
      code: 'REG-2026-E04',
      title: 'SANS 10142-1 Amendment 3: Substation Arc-Flash Clearance Boundary',
      sectorId: 'electrical',
      sectorName: 'Electrical & Infrastructure',
      standardCode: 'SANS 10142-1',
      severity: 'Mandatory Revision',
      severityColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      effectiveDate: 'Jul 15, 2026',
      summary: 'SABS & NERSA mandate minimum 1.2m clear frontage boundary around all 400V+ industrial switchgear kiosks and IP65 busbar enclosures.',
      impactDetails: 'All secondary sub-panel obstructions must be cleared immediately. Kiosks with broken door hinges or cable tie closures are subject to immediate Certificate of Compliance (CoC) revocation.',
      actionRequired: 'REGULATORY SHIFT DIRECTIVE: Clear storage packing crates in Substation Panel Room A to enforce 1.2m boundary and repair kiosk door locking catches under SANS 10142-1.',
      authority: 'National Energy Regulator of SA (NERSA)',
      clauseRef: 'SANS 10142-1:2026 Annexure K'
    }
  ],
  catering: [
    {
      id: 'alert-cat-1',
      code: 'REG-2026-C02',
      title: 'SANS 10330: Subterranean Canteen Cold Chain & Thermal Logging Update',
      sectorId: 'catering',
      sectorName: 'Commercial HACCP & Catering',
      standardCode: 'SANS 10330 / SANS 10049',
      severity: 'Compliance Warning',
      severityColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      effectiveDate: 'Aug 5, 2026',
      summary: 'NDoH SANS 10330 HACCP revision mandates automated continuous 15-min digital thermal logging for mine canteen cold storage holding raw meat below 4.0°C.',
      impactDetails: 'Paper-based manual logbooks are deprecated for kitchens catering >100 personnel. Cold storage units exceeding 5.0°C for >2 hours trigger mandatory stock quarantine and pathogen testing.',
      actionRequired: 'REGULATORY SHIFT DIRECTIVE: Install IoT digital temperature logging in Canteen Storage Unit #2 and replace inoperable sanitizer dispenser handles under SANS 10330.',
      authority: 'National Department of Health (NDoH)',
      clauseRef: 'SANS 10330:2026 Section 7.3'
    }
  ],
  sheq: [
    {
      id: 'alert-sheq-1',
      code: 'REG-2026-S08',
      title: 'DoEL Directive 2026: Chemical Reagent Respirator Mandate',
      sectorId: 'sheq',
      sectorName: 'General SHEQ & PPE',
      standardCode: 'SANS 10049 / OHS Act',
      severity: 'Safety Alert',
      severityColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      effectiveDate: 'Jul 28, 2026',
      summary: 'Department of Employment & Labour enforces double-filtered P3 particulate cartridges for all chemical separation reagent handlers.',
      impactDetails: 'Single-ply dust masks are strictly prohibited near flotation tanks and surface sorting belts. Key logs for PPE storage cabinets must be digitally synchronized with daily shift rosters.',
      actionRequired: 'REGULATORY SHIFT DIRECTIVE: Enforce double-filtered P3 respirators for surface sorting belt personnel and audit key logs for locked goggle cabinets under OHS Sec 16(2).',
      authority: 'Department of Employment and Labour (DoEL)',
      clauseRef: 'OHS Act Sec 16(2) / SANS 10049:2026'
    }
  ],
  lifting: [
    {
      id: 'alert-lift-1',
      code: 'REG-2026-L03',
      title: 'SANS 10375 / EN 362: Wire Rope Fraying & Fall Harness Latch Fatigue',
      sectorId: 'lifting',
      sectorName: 'Fall Protection, Rigging & Lifting',
      standardCode: 'SANS 10375 / EN 362',
      severity: 'Statutory Stoppage',
      severityColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      effectiveDate: 'Aug 3, 2026',
      summary: 'DMR Inspectorate lowers maximum permissible wire rope strand breakage threshold from 8% down to 5% before mandatory hoist lockout.',
      impactDetails: 'All main hoisting gantries and secondary winch drums with strand fraying >5% must be locked out immediately. Carabiners must pass double-action latch spring recoil tests under 100N tension.',
      actionRequired: 'REGULATORY SHIFT DIRECTIVE: Dispatch NDT rope inspection team to Shaft 1 hoist gantry and quarantine fatigued EN 362 harness carabiners.',
      authority: 'DMR Mining Machinery Inspectorate',
      clauseRef: 'SANS 10375:2026 Cl 4.2 / EN 362:2004'
    }
  ],
  ai_governance: [
    {
      id: 'alert-ai-1',
      code: 'REG-2026-A01',
      title: 'ISO/IEC 42001 AIMS: Autonomous Vehicle Drift Bounds & Telemetry Scrubbing',
      sectorId: 'ai_governance',
      sectorName: 'AI Governance & Risk',
      standardCode: 'ISO/IEC 42001',
      severity: 'AIMS Non-Conformity',
      severityColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      effectiveDate: 'Aug 1, 2026',
      summary: 'Global AI Risk Governance Board mandates real-time telemetry model drift capping at 3.5% for underground autonomous vehicle copilots.',
      impactDetails: 'Drift exceeding 3.5% requires instant fallback to human-in-the-loop manual override circuit (<100ms latency). Biometric and location telemetry must be anonymized before cloud model fine-tuning.',
      actionRequired: 'REGULATORY SHIFT DIRECTIVE: Re-calibrate collision avoidance vision models on autonomous haulers and verify POPIA telemetry anonymization pipelines.',
      authority: 'International AI Governance Council (ISO/IEC JTC 1/SC 42)',
      clauseRef: 'ISO/IEC 42001:2023 Annex A.8.2'
    }
  ]
};

interface RegulatoryShiftAlertFeedProps {
  selectedSector: string;
  onApplyDirective?: (directiveText: string) => void;
}

export const RegulatoryShiftAlertFeed: React.FC<RegulatoryShiftAlertFeedProps> = ({
  selectedSector,
  onApplyDirective
}) => {
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('melotwo_acknowledged_regulatory_alerts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Sector alerts
  const alerts = REGULATORY_SHIFTS_DATA[selectedSector] || REGULATORY_SHIFTS_DATA.mining;
  const currentAlert = alerts[currentAlertIndex] || alerts[0];

  // Reset index when sector changes
  useEffect(() => {
    setCurrentAlertIndex(0);
    setExpandedDetailsId(null);
  }, [selectedSector]);

  if (isDismissed) {
    return null;
  }

  const isAcknowledged = !!acknowledgedIds[currentAlert.id];

  const handleToggleAcknowledge = (alertId: string) => {
    const updated = {
      ...acknowledgedIds,
      [alertId]: !acknowledgedIds[alertId]
    };
    setAcknowledgedIds(updated);
    try {
      localStorage.setItem('melotwo_acknowledged_regulatory_alerts', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save alert acknowledgment to localStorage', e);
    }
  };

  const handleApplyDirective = () => {
    if (onApplyDirective && currentAlert) {
      onApplyDirective(currentAlert.actionRequired);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 rounded-2xl p-4 md:p-5 shadow-xl shadow-amber-950/10 mb-6 transition-all">
      {/* Top Bar: Live Alert Indicator & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                REGULATORY SHIFT FEED
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentAlert.standardCode}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-300 block">
              Dynamic Statutory Compliance Update for <span className="text-white font-bold">{currentAlert.sectorName}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          {alerts.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setCurrentAlertIndex((prev) => (prev > 0 ? prev - 1 : alerts.length - 1))}
                className="px-2 py-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Previous alert"
              >
                &larr;
              </button>
              <span className="text-[10px] text-slate-400 px-1">
                {currentAlertIndex + 1} / {alerts.length}
              </span>
              <button
                onClick={() => setCurrentAlertIndex((prev) => (prev < alerts.length - 1 ? prev + 1 : 0))}
                className="px-2 py-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Next alert"
              >
                &rarr;
              </button>
            </div>
          )}

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${currentAlert.severityColor}`}>
            {currentAlert.severity}
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hidden sm:inline-block">
            {currentAlert.effectiveDate}
          </span>

          <div className="flex items-center gap-1.5 ml-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-all cursor-pointer"
              title={isMinimized ? "Expand Warning Banner" : "Minimize / Collapse Alert"}
            >
              {isMinimized ? <ChevronDown className="w-3.5 h-3.5 text-amber-400" /> : <ChevronUp className="w-3.5 h-3.5 text-amber-400" />}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-all cursor-pointer"
              title="Dismiss Regulatory Alert Banner"
            >
              <XCircle className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Alert Banner Content */}
      {!isMinimized && (
        <div className="pt-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 mt-0.5">
                {currentAlert.code}
              </span>
              <h4 className="text-sm md:text-base font-bold text-white leading-snug">
                {currentAlert.title}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-0 md:pl-1 pt-0.5">
              {currentAlert.summary}
            </p>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
            {/* Acknowledge Button */}
            <button
              onClick={() => handleToggleAcknowledge(currentAlert.id)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all border cursor-pointer ${
                isAcknowledged
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-amber-500/20 border-amber-500/50 text-amber-200 hover:bg-amber-500/30 hover:border-amber-400 shadow-lg shadow-amber-500/10'
              }`}
              id={`btn-acknowledge-alert-${currentAlert.id}`}
            >
              {isAcknowledged ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Acknowledged ✓</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Acknowledge Shift Alert</span>
                </>
              )}
            </button>

            {/* View Impact Details Button */}
            <button
              onClick={() => setExpandedDetailsId(expandedDetailsId === currentAlert.id ? null : currentAlert.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              id={`btn-view-impact-details-${currentAlert.id}`}
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>{expandedDetailsId === currentAlert.id ? 'Hide Details' : 'View Impact Details'}</span>
              {expandedDetailsId === currentAlert.id ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Impact Details Drawer */}
        {expandedDetailsId === currentAlert.id && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/80 rounded-xl p-4 space-y-3.5 font-sans animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Enforcing Authority</span>
                <span className="text-slate-200 font-semibold">{currentAlert.authority}</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Statutory Reference</span>
                <span className="text-slate-200 font-semibold">{currentAlert.clauseRef}</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Status Badge</span>
                <span className="text-amber-400 font-bold">{isAcknowledged ? 'Acknowledged by Inspector' : 'Pending Inspector Action'}</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Operational & Audit Impact Analysis
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                {currentAlert.impactDetails}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex-1 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-xs text-amber-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[11px]">Required Statutory Inspector Directive:</span>
                  <span className="text-[11px] opacity-90">{currentAlert.actionRequired}</span>
                </div>
              </div>

              {onApplyDirective && (
                <button
                  onClick={handleApplyDirective}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all cursor-pointer shadow-md shrink-0"
                  title="Copy this regulatory directive directly into the active audit notes"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Applied to Audit Notes!</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Apply Directive to Audit</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
