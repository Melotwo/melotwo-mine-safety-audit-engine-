import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, TrendingUp, Download, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';

export const CaseStudySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'outcomes' | 'checklist'>('overview');
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadChecklist = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <section className="mb-20 scroll-mt-24" id="case-study-section">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Proof of Work &bull; High-Contrast Industrial Case Study</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Achieving Zero-Penalty SANS 10330 Audit Readiness
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-sans">
              Deploying MeloTwo Safety Engine across 2,500+ daily subterranean shift meals in high-density mine shafts.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadChecklist}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{downloaded ? 'Checklist Downloaded!' : 'Download 1-Page Checklist (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* Case Study Card Main Showcase */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          {/* Top Title & Metadata Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Witbank / Rustenburg / Polokwane Mining Corridors</span>
              </div>
              <h3 className="text-base md:text-lg font-extrabold text-white">
                Case Study: SANS 10330 & DMRE Shaft Catering Audit Verification
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded-lg">
                12-Month Zero Finding Audit Record
              </span>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              I. Operational Context & Baseline
            </button>
            <button
              onClick={() => setActiveTab('outcomes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                activeTab === 'outcomes'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              II. System Deployment & Outcomes
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              III. 1-Page Audit Readiness Checklist
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase block">Site Operational Scope</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  2,500+ daily shift meals prepared at a high-volume central kitchen in Limpopo and dispatched underground via shaft cages.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-mono text-rose-400 font-bold uppercase block">Hazard & Paper Pain Point</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Reliance on paper binders leading to illegible entries, unrecorded thermal holding drift during shaft transport (CCP #4), and acute DMRE Section 54 exposure risks under the Mine Health and Safety Act.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase block">MeloTwo Solution</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Digitization of CCP #1 (Cold storage sub-4°C), CCP #2 (Core cooking 72°C/15s), and CCP #4 (Subterranean transit &ge;60°C) with instant auto-CAPA tickets.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'outcomes' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-950 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-emerald-400 font-mono block">100% Elimination</span>
                <span className="text-xs text-slate-300 block">Of lost or falsified paper temperature logbooks</span>
              </div>

              <div className="p-5 bg-slate-950 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-emerald-400 font-mono block">0 DMRE Penalties</span>
                <span className="text-xs text-slate-300 block">Zero non-conformance orders across 12-month auditing cycle</span>
              </div>

              <div className="p-5 bg-slate-950 border border-amber-500/30 rounded-xl text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-amber-400 font-mono block">&lt; 30 Sec Auto-CAPA</span>
                <span className="text-xs text-slate-300 block">Instant deviation alert when shaft transit temps dip below +60.0°C</span>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-extrabold text-white font-mono">1-Page Audit Readiness Checklist (Doc M2-SANS-10330-CCP)</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Status: Verified Ready</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-amber-400 font-mono block text-[11px]">Check 1: CCP #1 Refrigeration</strong>
                  <span className="text-slate-300 text-[11px] block">Walk-in chilling units held strictly at 0.0°C to +4.0°C.</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-amber-400 font-mono block text-[11px]">Check 2: CCP #2 Core Temp</strong>
                  <span className="text-slate-300 text-[11px] block">Cooked protein core temperatures logged at &ge; 72.0°C for 15s.</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-amber-400 font-mono block text-[11px]">Check 3: CCP #4 Shaft Transit</strong>
                  <span className="text-slate-300 text-[11px] block">Thermal food canisters maintained at &ge; +60.0°C during cage drops.</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-amber-400 font-mono block text-[11px]">Check 4: Pre-Shift Sign-Off</strong>
                  <span className="text-slate-300 text-[11px] block">Digital worker hygiene and health declaration before shift entry.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
