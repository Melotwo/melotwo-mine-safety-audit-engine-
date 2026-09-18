import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Droplets, 
  Flame, 
  Wind, 
  Layers, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Scale, 
  RotateCcw, 
  Sliders, 
  ArrowRight,
  ShieldCheck,
  FileText,
  ExternalLink
} from 'lucide-react';
import { 
  ZAMBIAN_MHS_COMPLIANCE_MODULE, 
  calculateZambianMhsAuditScore,
  MhsChecklistItem,
  ZemaDischargeLimit
} from '../config/zambianMhsCompliance';

interface ZambianMhsCompliancePanelProps {
  onApplyDirective?: (directive: string) => void;
}

export const ZambianMhsCompliancePanel: React.FC<ZambianMhsCompliancePanelProps> = ({
  onApplyDirective
}) => {
  const [activeTab, setActiveTab] = useState<'SUBTERRANEAN' | 'ZEMA_EFFLUENT' | 'STATUTORY_SUMMARY'>('SUBTERRANEAN');

  // Subterranean checklist states
  const [checklistStatus, setChecklistStatus] = useState<Record<string, 'PASS' | 'FLAGGED' | 'CRITICAL_FAIL'>>(() => {
    const init: Record<string, 'PASS' | 'FLAGGED' | 'CRITICAL_FAIL'> = {};
    ZAMBIAN_MHS_COMPLIANCE_MODULE.subterraneanChecklist.forEach((item) => {
      init[item.id] = 'PASS';
    });
    return init;
  });

  // ZEMA simulated effluent readings
  const [effluentReadings, setEffluentReadings] = useState<Record<string, number>>({
    'ZEMA-EFF-PH': 7.4,
    'ZEMA-EFF-CU': 0.65,
    'ZEMA-EFF-TSS': 42.0,
    'ZEMA-EFF-CO': 0.35,
    'ZEMA-EFF-CN': 0.08,
    'ZEMA-TSF-FREEBOARD': 1.95,
    'ZEMA-TSF-FOS': 1.62
  });

  // Calculate Breaches for Effluent
  const effluentEvaluations: Record<string, { observed: number; limit: number; breached: boolean }> = {};
  
  // pH (6.5 - 9.0)
  const phVal = effluentReadings['ZEMA-EFF-PH'];
  effluentEvaluations['ZEMA-EFF-PH'] = {
    observed: phVal,
    limit: 9.0,
    breached: phVal < 6.5 || phVal > 9.0
  };

  // Cu (<= 1.0)
  const cuVal = effluentReadings['ZEMA-EFF-CU'];
  effluentEvaluations['ZEMA-EFF-CU'] = {
    observed: cuVal,
    limit: 1.0,
    breached: cuVal > 1.0
  };

  // TSS (<= 100)
  const tssVal = effluentReadings['ZEMA-EFF-TSS'];
  effluentEvaluations['ZEMA-EFF-TSS'] = {
    observed: tssVal,
    limit: 100.0,
    breached: tssVal > 100.0
  };

  // Co (<= 1.0)
  const coVal = effluentReadings['ZEMA-EFF-CO'];
  effluentEvaluations['ZEMA-EFF-CO'] = {
    observed: coVal,
    limit: 1.0,
    breached: coVal > 1.0
  };

  // WAD Cyanide (<= 0.2)
  const cnVal = effluentReadings['ZEMA-EFF-CN'];
  effluentEvaluations['ZEMA-EFF-CN'] = {
    observed: cnVal,
    limit: 0.2,
    breached: cnVal > 0.2
  };

  // TSF Freeboard (>= 1.5)
  const fbVal = effluentReadings['ZEMA-TSF-FREEBOARD'];
  effluentEvaluations['ZEMA-TSF-FREEBOARD'] = {
    observed: fbVal,
    limit: 1.5,
    breached: fbVal < 1.5
  };

  // TSF Factor of safety (>= 1.5)
  const fosVal = effluentReadings['ZEMA-TSF-FOS'];
  effluentEvaluations['ZEMA-TSF-FOS'] = {
    observed: fosVal,
    limit: 1.5,
    breached: fosVal < 1.5
  };

  const auditScore = calculateZambianMhsAuditScore(checklistStatus, effluentEvaluations);

  const handleToggleChecklist = (id: string, status: 'PASS' | 'FLAGGED' | 'CRITICAL_FAIL') => {
    setChecklistStatus(prev => ({
      ...prev,
      [id]: status
    }));
  };

  const handleResetChecklist = () => {
    const reset: Record<string, 'PASS' | 'FLAGGED' | 'CRITICAL_FAIL'> = {};
    ZAMBIAN_MHS_COMPLIANCE_MODULE.subterraneanChecklist.forEach(i => {
      reset[i.id] = 'PASS';
    });
    setChecklistStatus(reset);
    setEffluentReadings({
      'ZEMA-EFF-PH': 7.4,
      'ZEMA-EFF-CU': 0.65,
      'ZEMA-EFF-TSS': 42.0,
      'ZEMA-EFF-CO': 0.35,
      'ZEMA-EFF-CN': 0.08,
      'ZEMA-TSF-FREEBOARD': 1.95,
      'ZEMA-TSF-FOS': 1.62
    });
  };

  const handlePushCorrectiveDirectives = () => {
    if (onApplyDirective && auditScore.recommendations.length > 0) {
      const formatted = `ZAMBIAN MHS / ZEMA COMPLIANCE DIRECTIVE:\n` + auditScore.recommendations.join('\n');
      onApplyDirective(formatted);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 md:p-7 shadow-2xl backdrop-blur-xl mb-8">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <Scale className="w-3 h-3" />
              Zambia MHS Statutory Engine
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              MSD Kitwe &bull; ZEMA SI 112
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Zambian Mine Health, Safety &amp; Environmental Discharge Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
            Directly enforces statutory limits under the <strong className="text-slate-300">Mining Regulations (MSR Parts IX, X, XII, XIV)</strong> and <strong className="text-slate-300">ZEMA SI 112 Aquatic Effluent Standards</strong> across Copperbelt subterranean and decant operations.
          </p>
        </div>

        {/* Audit Scorecard */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-3 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">MHS Statutory Index</div>
            <div className={`text-2xl font-black font-mono ${
              auditScore.overallScore >= 95 ? 'text-emerald-400' : auditScore.overallScore >= 80 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {auditScore.overallScore}%
            </div>
          </div>
          <div className={`w-3 h-10 rounded-full ${
            auditScore.overallScore >= 95 ? 'bg-emerald-500' : auditScore.overallScore >= 80 ? 'bg-amber-500' : 'bg-rose-500'
          }`} />
          <button
            onClick={handleResetChecklist}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Reset to baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 my-5 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('SUBTERRANEAN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'SUBTERRANEAN'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          <span>Subterranean Hazard Checklist (MSR)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full font-mono">
            {ZAMBIAN_MHS_COMPLIANCE_MODULE.subterraneanChecklist.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ZEMA_EFFLUENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ZEMA_EFFLUENT'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-300" />
          <span>ZEMA Aquatic Effluent &amp; TSF Limits</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full font-mono">
            {ZAMBIAN_MHS_COMPLIANCE_MODULE.zemaEffluentDischargeLimits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('STATUTORY_SUMMARY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'STATUTORY_SUMMARY'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-300" />
          <span>MSD &amp; ZEMA Enforcement Rules</span>
        </button>
      </div>

      {/* Tab 1: Subterranean Hazard Checklist */}
      {activeTab === 'SUBTERRANEAN' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ZAMBIAN_MHS_COMPLIANCE_MODULE.subterraneanChecklist.map((item) => {
              const status = checklistStatus[item.id] || 'PASS';
              return (
                <div 
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    status === 'CRITICAL_FAIL'
                      ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : status === 'FLAGGED'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {item.code}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                      <p className="text-[11px] font-mono text-slate-400">{item.statutoryRegulation}</p>
                    </div>

                    {/* Quick State Toggle Buttons */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => handleToggleChecklist(item.id, 'PASS')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                          status === 'PASS' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Pass compliance check"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Pass
                      </button>
                      <button
                        onClick={() => handleToggleChecklist(item.id, 'FLAGGED')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                          status === 'FLAGGED' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Flag for non-critical maintenance"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Warn
                      </button>
                      <button
                        onClick={() => handleToggleChecklist(item.id, 'CRITICAL_FAIL')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                          status === 'CRITICAL_FAIL' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Trigger critical statutory breach / stoppage"
                      >
                        <XCircle className="w-3 h-3" />
                        Halt
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 mt-3 pt-2.5 border-t border-slate-800/80">
                    <p className="flex items-start gap-1.5">
                      <strong className="text-slate-400 font-mono text-[10px] uppercase shrink-0">Threshold:</strong>
                      <span className="text-amber-300 font-medium">{item.criticalThreshold}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <strong className="text-slate-400 font-mono text-[10px] uppercase shrink-0">Pass Criteria:</strong>
                      <span className="text-slate-300">{item.passCriteria}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <strong className="text-rose-400 font-mono text-[10px] uppercase shrink-0">Stoppage:</strong>
                      <span className="text-rose-300/90 text-[11px]">{item.stoppageTrigger}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: ZEMA Aquatic Effluent Limits */}
      {activeTab === 'ZEMA_EFFLUENT' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
            <Droplets className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                ZEMA Statutory Instrument No. 112 of 2013 (Aquatic Effluent Standards)
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Discharge from decant weirs, underground dewatering pumps, and acid leach circuits into the Kafue River drainage basin is legally constrained by strict concentration limits. Adjust telemetry sliders below to test automated statutory breach alarms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ZAMBIAN_MHS_COMPLIANCE_MODULE.zemaEffluentDischargeLimits.map((param) => {
              const currentVal = effluentReadings[param.parameterId] ?? 0;
              const evalRes = effluentEvaluations[param.parameterId];
              const isBreached = evalRes ? evalRes.breached : false;

              return (
                <div 
                  key={param.parameterId}
                  className={`p-4 rounded-2xl border transition-all ${
                    isBreached 
                      ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/30' 
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {param.chemicalSymbol || param.parameterId}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isBreached ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isBreached ? 'BREACH DETECTED' : 'IN COMPLIANCE'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{param.parameterName}</h4>
                  <p className="text-[10px] font-mono text-slate-400 mb-3">{param.standardReference}</p>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[11px] text-slate-400">Current Observation:</span>
                    <span className={`text-lg font-black font-mono ${isBreached ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {currentVal} <span className="text-xs font-normal text-slate-400">{param.unit}</span>
                    </span>
                  </div>

                  {/* Interactive slider for real-time compliance simulation */}
                  <div className="space-y-1 my-2">
                    <input 
                      type="range"
                      min={param.parameterId === 'ZEMA-EFF-PH' ? 4.0 : 0}
                      max={
                        param.parameterId === 'ZEMA-EFF-PH' ? 11.0 :
                        param.parameterId === 'ZEMA-EFF-TSS' ? 250 :
                        param.parameterId === 'ZEMA-TSF-FREEBOARD' ? 3.0 :
                        param.parameterId === 'ZEMA-TSF-FOS' ? 2.5 : 3.0
                      }
                      step={param.parameterId === 'ZEMA-EFF-TSS' ? 5 : 0.05}
                      value={currentVal}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setEffluentReadings(prev => ({
                          ...prev,
                          [param.parameterId]: val
                        }));
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>Statutory Limit: {param.statutoryLimit} {param.unit}</span>
                      <span>Target: {param.targetWaterBody}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <strong className="text-slate-300">Neutralization:</strong> {param.neutralizationMethod}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Statutory Summary & Remediation */}
      {activeTab === 'STATUTORY_SUMMARY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl">
              <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Mines Safety Department (MSD) Powers
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under the <strong className="text-white">Mining Regulations (MSR)</strong>, inspectors stationed in Kitwe hold statutory jurisdiction to conduct unannounced subterranean audits. Breaches of gas ceilings (CH4 &gt; 1.25%, CO &gt; 30 ppm) or unventilated faces (&lt; 0.30 m/s) result in immediate cessation notices and criminal referral.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl">
              <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                ZEMA Environmental Protection Orders
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The <strong className="text-white">Zambia Environmental Management Agency (ZEMA)</strong> enforces strict aquatic effluent standards under SI 112. Discharge of copper (&gt; 1.0 mg/L) or acidic water (pH &lt; 6.5) into Kafue waterways triggers immediate emergency lime dosing orders, civil damages, and facility closure.
              </p>
            </div>
          </div>

          {/* Active Breaches and Recommendations */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Automated Statutory Directives ({auditScore.recommendations.length} Active Directives)
            </h4>

            {auditScore.recommendations.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                All subterranean parameters and ZEMA aquatic discharge levels comply with statutory thresholds.
              </div>
            ) : (
              <div className="space-y-2">
                {auditScore.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                    <span>{rec}</span>
                  </div>
                ))}

                {onApplyDirective && (
                  <div className="pt-3">
                    <button
                      onClick={handlePushCorrectiveDirectives}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/40"
                    >
                      <span>Inject Directives into Active Shift Handover</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZambianMhsCompliancePanel;
