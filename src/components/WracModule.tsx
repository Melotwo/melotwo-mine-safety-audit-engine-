import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Filter,
  Plus,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Info,
  X,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  FileText
} from 'lucide-react';
import {
  WracProbability,
  WracSeverity,
  WracRiskLevel,
  ControlHierarchyType,
  WracAssessmentItem
} from '../types/riskManagementTypes';
import {
  CONTROL_HIERARCHY_CONFIG,
  calculateWracRisk,
  fetchWracAssessments,
  saveWracAssessment,
  deleteWracAssessment,
  exportWracMatrixPdf,
  signOffWracCapa
} from '../services/riskManagementService';

export interface WracModuleProps {
  onNotify?: (message: string) => void;
}

const PROBABILITY_LABELS: Record<WracProbability, { title: string; desc: string }> = {
  1: { title: '1 - Rare', desc: 'Conceivable only in extreme circumstances (< 5% probability)' },
  2: { title: '2 - Unlikely', desc: 'Could occur at some time, infrequent in industry (5 - 20%)' },
  3: { title: '3 - Possible', desc: 'Might occur at some time during mine operation (20 - 50%)' },
  4: { title: '4 - Likely', desc: 'Will probably occur in most mining circumstances (50 - 80%)' },
  5: { title: '5 - Almost Certain', desc: 'Expected to occur frequently in normal operational shifts (> 80%)' }
};

const SEVERITY_LABELS: Record<WracSeverity, { title: string; desc: string }> = {
  1: { title: '1 - Insignificant', desc: 'First aid treatment on site; zero work stoppage; negligible financial impact' },
  2: { title: '2 - Minor', desc: 'Medical treatment required; reversible injury; < 1 shift lost time' },
  3: { title: '3 - Moderate', desc: 'Reportable Lost Time Injury (LTI); localized property damage; DMRE notification' },
  4: { title: '4 - Major', desc: 'Severe irreversible disability; extensive structural damage; Section 54 temporary stoppage' },
  5: { title: '5 - Catastrophic', desc: 'Single or multiple fatalities; total shaft collapse; prolonged legal/regulatory closure' }
};

export const WracModule: React.FC<WracModuleProps> = ({ onNotify }) => {
  const [assessments, setAssessments] = useState<WracAssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedHierarchyFilter, setSelectedHierarchyFilter] = useState<string>('ALL');
  const [activeCellFilter, setActiveCellFilter] = useState<{ p: WracProbability; s: WracSeverity } | null>(null);

  // Modal State for New/Edit Assessment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<WracAssessmentItem> | null>(null);

  // Form states inside modal
  const [formActivity, setFormActivity] = useState('');
  const [formHazard, setFormHazard] = useState('');
  const [formConsequence, setFormConsequence] = useState('');
  const [formInitProb, setFormInitProb] = useState<WracProbability>(4);
  const [formInitSev, setFormInitSev] = useState<WracSeverity>(4);
  const [formHierarchy, setFormHierarchy] = useState<ControlHierarchyType>('ENGINEERING');
  const [formControlDesc, setFormControlDesc] = useState('');
  const [formResProb, setFormResProb] = useState<WracProbability>(2);
  const [formResSev, setFormResSev] = useState<WracSeverity>(2);
  const [formResponsible, setFormResponsible] = useState('Section Safety Officer / Appointee');
  const [formFrequency, setFormFrequency] = useState<'CONTINUOUS' | 'PER_SHIFT' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('PER_SHIFT');

  // CR 9.1 Auto-CAPA Sign-Off Modal State
  const [signingCapaItem, setSigningCapaItem] = useState<WracAssessmentItem | null>(null);
  const [cr91AssessorInput, setCr91AssessorInput] = useState('Sipho Sithole (Appointed CR 9.1 Risk Assessor)');
  const [cr91DirectiveInput, setCr91DirectiveInput] = useState('Critical Section 54 barrier verified. Mandatory positive isolation and engineering controls approved for safe operational execution.');

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    const data = await fetchWracAssessments();
    setAssessments(data);
    setLoading(false);
  };

  const handleExecuteCr91SignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingCapaItem) return;
    await signOffWracCapa(signingCapaItem.id, cr91AssessorInput, cr91DirectiveInput);
    setSigningCapaItem(null);
    await loadAssessments();
    if (onNotify) {
      onNotify(`CR 9.1 Risk Assessor digital sign-off recorded for ${signingCapaItem.hazard}. Execution cleared.`);
    }
  };

  const handleOpenAddModal = (p?: WracProbability, s?: WracSeverity) => {
    setEditingItem(null);
    setFormActivity('');
    setFormHazard('');
    setFormConsequence('');
    setFormInitProb(p || 4);
    setFormInitSev(s || 4);
    setFormHierarchy('ENGINEERING');
    setFormControlDesc('');
    setFormResProb(Math.max(1, (p || 4) - 2) as WracProbability);
    setFormResSev(Math.max(1, (s || 4) - 1) as WracSeverity);
    setFormResponsible('Section Safety Officer / Appointee');
    setFormFrequency('PER_SHIFT');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: WracAssessmentItem) => {
    setEditingItem(item);
    setFormActivity(item.activityOrArea);
    setFormHazard(item.hazard);
    setFormConsequence(item.consequence);
    setFormInitProb(item.initialProbability);
    setFormInitSev(item.initialSeverity);
    setFormHierarchy(item.selectedHierarchy);
    setFormControlDesc(item.controlDescription);
    setFormResProb(item.residualProbability);
    setFormResSev(item.residualSeverity);
    setFormResponsible(item.responsiblePerson);
    setFormFrequency(item.monitoringFrequency);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHazard.trim() || !formActivity.trim()) return;

    const saved = await saveWracAssessment({
      id: editingItem?.id,
      activityOrArea: formActivity,
      hazard: formHazard,
      consequence: formConsequence,
      initialProbability: formInitProb,
      initialSeverity: formInitSev,
      selectedHierarchy: formHierarchy,
      controlDescription: formControlDesc,
      residualProbability: formResProb,
      residualSeverity: formResSev,
      responsiblePerson: formResponsible,
      monitoringFrequency: formFrequency,
      status: 'VERIFIED'
    });

    setIsModalOpen(false);
    await loadAssessments();
    if (onNotify) {
      onNotify(`WRAC Assessment saved: Residual Risk ${saved.residualRiskLevel} (${saved.residualRiskScore})`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this risk assessment item?')) {
      await deleteWracAssessment(id);
      await loadAssessments();
      if (onNotify) onNotify('Risk assessment item removed from WRAC register.');
    }
  };

  // Filtered assessments list
  const filteredAssessments = useMemo(() => {
    return assessments.filter(item => {
      const matchesSearch = 
        item.activityOrArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hazard.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.controlDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk = 
        selectedRiskFilter === 'ALL' ||
        item.initialRiskLevel === selectedRiskFilter ||
        item.residualRiskLevel === selectedRiskFilter;

      const matchesHierarchy = 
        selectedHierarchyFilter === 'ALL' ||
        item.selectedHierarchy === selectedHierarchyFilter;

      const matchesCell = 
        !activeCellFilter ||
        (item.initialProbability === activeCellFilter.p && item.initialSeverity === activeCellFilter.s);

      return matchesSearch && matchesRisk && matchesHierarchy && matchesCell;
    });
  }, [assessments, searchTerm, selectedRiskFilter, selectedHierarchyFilter, activeCellFilter]);

  // Compute live matrix counts for each 5x5 cell
  const matrixCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let p = 1; p <= 5; p++) {
      for (let s = 1; s <= 5; s++) {
        counts[`${p}_${s}`] = 0;
      }
    }
    assessments.forEach(item => {
      const key = `${item.initialProbability}_${item.initialSeverity}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [assessments]);

  // Summary KPIs
  const stats = useMemo(() => {
    const total = assessments.length;
    const critical = assessments.filter(a => a.initialRiskLevel === 'CRITICAL').length;
    const high = assessments.filter(a => a.initialRiskLevel === 'HIGH').length;
    const residualLow = assessments.filter(a => a.residualRiskLevel === 'LOW').length;
    const avgReduction = total > 0
      ? Math.round(
          assessments.reduce((sum, a) => sum + ((a.initialRiskScore - a.residualRiskScore) / a.initialRiskScore) * 100, 0) / total
        )
      : 0;

    return { total, critical, high, residualLow, avgReduction };
  }, [assessments]);

  // Live calculation for modal preview
  const liveInitRisk = calculateWracRisk(formInitProb, formInitSev);
  const liveResRisk = calculateWracRisk(formResProb, formResSev);

  return (
    <div className="space-y-6">
      {/* Module Header & Summary KPI Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-40 bg-amber-500/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                SANS 31000 / MHSA Section 11(1)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Hierarchy of Controls Compliant
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                2,000m Subterranean Offline (IndexedDB) • &lt;3s Surface Wi-Fi Auto-Sync
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
              Workplace Risk Assessment &amp; Control (WRAC 5x5)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Dynamic operational risk rating engine mapping incident probability against severity. Enforces statutory hierarchy of controls to calculate post-mitigation residual risk scores for DMRE inspectors.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Risk Assessment</span>
            </button>

            <button
              onClick={() => exportWracMatrixPdf(assessments)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-2 cursor-pointer"
              title="Export official WRAC Risk Register PDF"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export WRAC PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Assessments</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{stats.total}</div>
            <span className="text-[10px] text-slate-500">Active site workplace hazards</span>
          </div>

          <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block">Critical / Stop Work</span>
            <div className="text-2xl font-black text-red-400 font-mono mt-0.5">{stats.critical}</div>
            <span className="text-[10px] text-red-500/80">Requires Section 54 barrier</span>
          </div>

          <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">High Initial Hazards</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{stats.high}</div>
            <span className="text-[10px] text-amber-500/80">Mandatory supervisor sign-off</span>
          </div>

          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Risk Reduction Index</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
              <TrendingDown className="w-5 h-5" />
              <span>{stats.avgReduction}%</span>
            </div>
            <span className="text-[10px] text-emerald-500/80">{stats.residualLow} controlled to Low</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC 5x5 RISK MATRIX INTERFACE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Interactive Heat Map
              </span>
              {activeCellFilter && (
                <button
                  onClick={() => setActiveCellFilter(null)}
                  className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                >
                  <span>Filtering P:{activeCellFilter.p} x S:{activeCellFilter.s}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              5x5 Probability vs Severity Evaluation Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Click any cell to filter the active hazard register below or immediately log a hazard with those coordinates.
            </p>
          </div>

          {/* Legend Badges */}
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
            <span className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-bold">1 - 4: Low</span>
            <span className="px-2 py-1 rounded bg-yellow-400 text-slate-950 font-bold">5 - 9: Medium</span>
            <span className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold">10 - 16: High</span>
            <span className="px-2 py-1 rounded bg-red-600 text-white font-bold">17 - 25: Critical</span>
          </div>
        </div>

        {/* 5x5 Grid Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Column Headers: Severities 1 to 5 */}
            <div className="grid grid-cols-6 gap-2 mb-2 text-center text-xs font-mono font-bold">
              <div className="text-left text-slate-500 flex items-end pb-1 font-sans text-[11px]">
                Probability &darr; \ Severity &rarr;
              </div>
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                  <div className="text-white text-xs">{SEVERITY_LABELS[s as WracSeverity].title}</div>
                  <div className="text-[9px] text-slate-400 font-sans truncate font-normal">
                    {s === 1 ? 'First Aid' : s === 2 ? 'Minor LTI' : s === 3 ? 'Lost Time' : s === 4 ? 'Disability' : 'Fatality'}
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix Rows: Probabilities 5 down to 1 */}
            {([5, 4, 3, 2, 1] as WracProbability[]).map(p => (
              <div key={p} className="grid grid-cols-6 gap-2 mb-2">
                {/* Row Header */}
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 flex flex-col justify-center">
                  <span className="text-xs font-bold text-white font-mono">{PROBABILITY_LABELS[p].title}</span>
                  <span className="text-[9px] text-slate-400 font-sans truncate font-normal">
                    {p === 5 ? '>80% / Frequent' : p === 4 ? '50-80% / Likely' : p === 3 ? '20-50% / Possible' : p === 2 ? '5-20% / Unlikely' : '<5% / Rare'}
                  </span>
                </div>

                {/* 5 Severity Cells for this Probability */}
                {([1, 2, 3, 4, 5] as WracSeverity[]).map(s => {
                  const risk = calculateWracRisk(p, s);
                  const count = matrixCounts[`${p}_${s}`] || 0;
                  const isSelected = activeCellFilter?.p === p && activeCellFilter?.s === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setActiveCellFilter(null);
                        } else {
                          setActiveCellFilter({ p, s });
                        }
                      }}
                      className={`relative p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-between min-h-[74px] group ${
                        isSelected
                          ? 'ring-2 ring-white scale-105 shadow-xl z-10 ' + risk.colorClass
                          : risk.level === 'CRITICAL'
                          ? 'bg-red-950/40 border-red-800/60 hover:bg-red-900/60 hover:border-red-500'
                          : risk.level === 'HIGH'
                          ? 'bg-amber-950/40 border-amber-800/60 hover:bg-amber-900/60 hover:border-amber-500'
                          : risk.level === 'MEDIUM'
                          ? 'bg-yellow-950/30 border-yellow-800/50 hover:bg-yellow-900/50 hover:border-yellow-400'
                          : 'bg-emerald-950/30 border-emerald-800/50 hover:bg-emerald-900/50 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[11px] font-mono font-black ${isSelected ? 'text-current' : risk.level === 'CRITICAL' ? 'text-red-300' : risk.level === 'HIGH' ? 'text-amber-300' : risk.level === 'MEDIUM' ? 'text-yellow-300' : 'text-emerald-300'}`}>
                          {risk.score}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-slate-950 text-white'
                            : risk.level === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : risk.level === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : risk.level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {risk.level.slice(0, 4)}
                        </span>
                      </div>

                      {/* Hazard Count Pill */}
                      <div className="mt-1">
                        {count > 0 ? (
                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${
                            isSelected
                              ? 'bg-slate-950 text-white'
                              : 'bg-white text-slate-950'
                          }`}>
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{count} {count === 1 ? 'Hazard' : 'Hazards'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 opacity-60 group-hover:opacity-100 font-mono">
                            0
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATUTORY CONTROL HIERARCHY OVERVIEW BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Statutory Control Hierarchy Discipline (OHS &amp; MHSA Compliance)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Highest &rarr; Lowest Effectiveness</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {(Object.keys(CONTROL_HIERARCHY_CONFIG) as ControlHierarchyType[]).map((key, i) => {
            const h = CONTROL_HIERARCHY_CONFIG[key];
            const count = assessments.filter(a => a.selectedHierarchy === key).length;
            return (
              <div
                key={key}
                onClick={() => setSelectedHierarchyFilter(selectedHierarchyFilter === key ? 'ALL' : key)}
                className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  selectedHierarchyFilter === key
                    ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-400">Step {i + 1}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-black ${h.badgeBg}`}>
                      {count} Logged
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white">{h.shortLabel}</h5>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {h.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[9px] font-mono text-slate-400">
                  {h.effectiveness.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HAZARD REGISTER FILTER BAR & DATA TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Active Hazard Assessments &amp; Residual Controls</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({filteredAssessments.length} shown)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hazard or area..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Risk filter */}
            <select
              value={selectedRiskFilter}
              onChange={e => setSelectedRiskFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Initial Risk</option>
              <option value="HIGH">High Initial Risk</option>
              <option value="MEDIUM">Medium Initial Risk</option>
              <option value="LOW">Low Initial Risk</option>
            </select>

            {/* Hierarchy filter */}
            <select
              value={selectedHierarchyFilter}
              onChange={e => setSelectedHierarchyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Hierarchies</option>
              <option value="ELIMINATION">Elimination</option>
              <option value="SUBSTITUTION">Substitution</option>
              <option value="ENGINEERING">Engineering</option>
              <option value="ADMINISTRATIVE">Administrative</option>
              <option value="PPE">PPE</option>
            </select>
          </div>
        </div>

        {/* Hazard Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-3">Area / Activity</th>
                <th className="py-3 px-3">Hazard &amp; Consequence</th>
                <th className="py-3 px-3">Initial Risk</th>
                <th className="py-3 px-3">Applied Control Hierarchy</th>
                <th className="py-3 px-3">Residual Risk</th>
                <th className="py-3 px-3">Assignee &amp; Frequency</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No hazards matching active filter</p>
                    <p className="text-xs text-slate-500 mt-1">Clear filters or click "Log Risk Assessment" to register new items.</p>
                  </td>
                </tr>
              ) : (
                filteredAssessments.map(item => {
                  const hierarchyConfig = CONTROL_HIERARCHY_CONFIG[item.selectedHierarchy];
                  const initRisk = calculateWracRisk(item.initialProbability, item.initialSeverity);
                  const resRisk = calculateWracRisk(item.residualProbability, item.residualSeverity);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white max-w-[180px]">
                        <div>{item.activityOrArea}</div>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          {item.standardsReference || 'MHSA Section 11'}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-[240px]">
                        <div className="font-bold text-slate-200">{item.hazard}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.consequence}
                        </div>
                      </td>

                      {/* Initial Risk */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${initRisk.colorClass}`}>
                            {item.initialRiskLevel} ({item.initialRiskScore})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            P{item.initialProbability}×S{item.initialSeverity}
                          </span>
                        </div>
                        {item.initialRiskScore >= 17 && (
                          <div className="mt-1.5">
                            {item.autoCapaStatus === 'CR91_SIGNED_OFF' ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>CR 9.1 Signed Off</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSigningCapaItem(item)}
                                className="inline-flex items-center gap-1 text-[9px] font-mono text-red-200 bg-red-600/40 hover:bg-red-600/60 border border-red-500/60 px-2 py-0.5 rounded-lg cursor-pointer animate-pulse font-bold transition"
                                title="0-1h High-Severity Auto-CAPA ticket triggered. Mandatory appointed CR 9.1 Risk Assessor digital sign-off required."
                              >
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                <span>0-1h Auto-CAPA: Sign Off</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Hierarchy & Description */}
                      <td className="py-3 px-3 max-w-[260px]">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black inline-block mb-1 ${hierarchyConfig.badgeBg}`}>
                          {item.selectedHierarchy}
                        </span>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {item.controlDescription}
                        </p>
                      </td>

                      {/* Residual Risk */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${resRisk.colorClass}`}>
                            {item.residualRiskLevel} ({item.residualRiskScore})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            P{item.residualProbability}×S{item.residualSeverity}
                          </span>
                        </div>
                      </td>

                      {/* Responsible */}
                      <td className="py-3 px-3 text-[11px] text-slate-300">
                        <div className="font-semibold text-slate-200">{item.responsiblePerson}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.monitoringFrequency}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold mr-1.5 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2 py-1 hover:bg-red-500/20 text-red-400 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT WRAC MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-auto">
            {/* Modal Accent Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500" />

            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  SANS 31000 / MHSA Section 11 Assessment
                </span>
                <h3 className="text-base font-black text-white font-display mt-0.5">
                  {editingItem?.id ? 'Edit Workplace Risk Assessment' : 'Log New Workplace Risk Assessment (WRAC)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Activity or Mine Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Underground Stope 44-East / Mechanised Face"
                    value={formActivity}
                    onChange={e => setFormActivity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Responsible Safety Officer / Appointee *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sipho Sithole (MHSA 2.9.2 Manager)"
                    value={formResponsible}
                    onChange={e => setFormResponsible(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Identified Hazard *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fall of Unsupported Hanging Wall & Geological Rockburst"
                  value={formHazard}
                  onChange={e => setFormHazard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Potential Incident Consequence *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Multiple worker crush fatalities, structural damage and DMRE Section 54 stoppage"
                  value={formConsequence}
                  onChange={e => setFormConsequence(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Initial Risk Rating Selectors */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Initial Uncontrolled Risk Evaluation (1 to 5)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-black font-mono ${liveInitRisk.colorClass}`}>
                    Initial: {liveInitRisk.level} ({liveInitRisk.score})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                      Probability (1 = Rare, 5 = Almost Certain)
                    </label>
                    <select
                      value={formInitProb}
                      onChange={e => setFormInitProb(Number(e.target.value) as WracProbability)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {[1, 2, 3, 4, 5].map(v => (
                        <option key={v} value={v}>{PROBABILITY_LABELS[v as WracProbability].title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                      Severity (1 = Insignificant, 5 = Catastrophic)
                    </label>
                    <select
                      value={formInitSev}
                      onChange={e => setFormInitSev(Number(e.target.value) as WracSeverity)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {[1, 2, 3, 4, 5].map(v => (
                        <option key={v} value={v}>{SEVERITY_LABELS[v as WracSeverity].title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  {liveInitRisk.action}
                </p>
              </div>

              {/* Control Hierarchy Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Applied Control Hierarchy (Primary Mechanism) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(CONTROL_HIERARCHY_CONFIG) as ControlHierarchyType[]).map(type => {
                    const h = CONTROL_HIERARCHY_CONFIG[type];
                    const isSelected = formHierarchy === type;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setFormHierarchy(type)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-slate-500 uppercase">{h.shortLabel}</div>
                        <div className="text-xs font-bold mt-0.5 truncate">{type}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl text-[11px] text-slate-300">
                  <strong className="text-amber-400">{CONTROL_HIERARCHY_CONFIG[formHierarchy].label}:</strong>{' '}
                  {CONTROL_HIERARCHY_CONFIG[formHierarchy].description}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Detailed Control Measures &amp; Barriers Applied *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specify physical guards, automated interlocks, continuous sensors, or standard operating procedures..."
                  value={formControlDesc}
                  onChange={e => setFormControlDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Residual Risk Rating Selectors */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    Residual Risk Rating (After Control Measures)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-black font-mono ${liveResRisk.colorClass}`}>
                    Residual: {liveResRisk.level} ({liveResRisk.score})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                      Residual Probability (After Controls)
                    </label>
                    <select
                      value={formResProb}
                      onChange={e => setFormResProb(Number(e.target.value) as WracProbability)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {[1, 2, 3, 4, 5].map(v => (
                        <option key={v} value={v}>{PROBABILITY_LABELS[v as WracProbability].title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                      Residual Severity (After Controls)
                    </label>
                    <select
                      value={formResSev}
                      onChange={e => setFormResSev(Number(e.target.value) as WracSeverity)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {[1, 2, 3, 4, 5].map(v => (
                        <option key={v} value={v}>{SEVERITY_LABELS[v as WracSeverity].title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">
                  Supervisory Monitoring Frequency
                </label>
                <select
                  value={formFrequency}
                  onChange={e => setFormFrequency(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="CONTINUOUS">Continuous Real-Time Telemetry</option>
                  <option value="PER_SHIFT">Per Shift Pre-Start Barring Down</option>
                  <option value="DAILY">Daily Engineering Walkthrough</option>
                  <option value="WEEKLY">Weekly Planned Task Observation</option>
                  <option value="MONTHLY">Monthly Statutory Committee Review</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  {editingItem?.id ? 'Update Assessment' : 'Save to WRAC Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CR 9.1 Risk Assessor Auto-CAPA Sign-Off Modal */}
      {signingCapaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-red-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">CR 9.1 Risk Assessor Statutory Sign-Off</h3>
                  <span className="text-[10px] font-mono text-red-400 block">
                    0-1h High-Severity Auto-CAPA Escalation ({signingCapaItem.autoCapaTicketId || 'CAPA-CR9.1-ACTIVE'})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSigningCapaItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{signingCapaItem.hazard}</span>
                <span className="text-red-400 font-mono font-bold">Initial Score: {signingCapaItem.initialRiskScore}/25 (CRITICAL)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Location: {signingCapaItem.activityOrArea} • Work is stopped under Section 54 mandate until positive physical isolation and statutory controls are confirmed by an appointed CR 9.1 Risk Assessor.
              </p>
            </div>

            <form onSubmit={handleExecuteCr91SignOff} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Appointed CR 9.1 Risk Assessor Name &amp; Designation
                </label>
                <input
                  type="text"
                  value={cr91AssessorInput}
                  onChange={e => setCr91AssessorInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Statutory Engineering Directives &amp; Execution Clearance
                </label>
                <textarea
                  rows={3}
                  value={cr91DirectiveInput}
                  onChange={e => setCr91DirectiveInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                  required
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1">
                <div className="text-slate-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Digital Cryptographic Audit Seal Attached</span>
                </div>
                <p className="font-mono text-[9px] text-slate-500">
                  Generates tamper-evident timestamped signature logged into subterranean IndexedDB persistence register.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSigningCapaItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-950/40 cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Execute CR 9.1 Sign-Off</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
