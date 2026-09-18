import { useState } from "react";
import { SANS_STANDARDS, ZAMBIAN_STATUTORY_STANDARDS } from "../data";
import { BookOpen, Search, ArrowRight, CheckCircle, Scale, Globe } from "lucide-react";

export function SANSReferenceTable() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<'ALL' | 'ZA_SANS' | 'ZM_MHS'>('ALL');
  const [searchTerm, setSearchTerm] = useState("");

  const combinedStandards = [
    ...SANS_STANDARDS,
    ...ZAMBIAN_STATUTORY_STANDARDS
  ];

  const standardsPool = selectedJurisdiction === 'ZA_SANS'
    ? SANS_STANDARDS
    : selectedJurisdiction === 'ZM_MHS'
    ? ZAMBIAN_STATUTORY_STANDARDS
    : combinedStandards;

  const [selectedStandard, setSelectedStandard] = useState<string>(standardsPool[0].code);

  const filtered = standardsPool.filter(
    (std) => 
      std.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.scope.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStd = standardsPool.find(s => s.code === selectedStandard) || standardsPool[0];
  const isZambianStd = activeStd.code.startsWith('ZM') || activeStd.code.startsWith('ZEMA') || activeStd.code.startsWith('MMDA');

  return (
    <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 shadow-xl overflow-hidden" id="sans-reference-container">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 font-display">
            <BookOpen className="w-5 h-5 text-sky-400" />
            Statutory Mining Standards &amp; Regulatory Reference Library
          </h3>
          <p className="text-sm text-slate-400">
            Mandatory South African (SABS/SANS) &amp; Zambian (MSD MSR / ZEMA SI 112) mine safety &amp; environmental frameworks
          </p>
        </div>

        {/* Jurisdiction Filter & Local Quick Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs font-mono">
            <button
              onClick={() => setSelectedJurisdiction('ALL')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                selectedJurisdiction === 'ALL'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Regions
            </button>
            <button
              onClick={() => setSelectedJurisdiction('ZA_SANS')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                selectedJurisdiction === 'ZA_SANS'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RSA (SANS)
            </button>
            <button
              onClick={() => setSelectedJurisdiction('ZM_MHS')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                selectedJurisdiction === 'ZM_MHS'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Zambia (MSR/ZEMA)
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search standards, codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              id="sans-search-input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Standard Items Selector */}
        <div className="space-y-2 md:col-span-1 border-r border-slate-700 pr-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            {selectedJurisdiction === 'ZM_MHS' ? 'Zambian MHS & ZEMA Rules' : 'Statutory Standard Frameworks'}
          </p>
          <div className="space-y-1.5 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map((std) => {
              const isZm = std.code.startsWith('ZM') || std.code.startsWith('ZEMA') || std.code.startsWith('MMDA');
              return (
                <button
                  key={std.code}
                  onClick={() => setSelectedStandard(std.code)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 block cursor-pointer ${
                    selectedStandard === std.code
                      ? isZm 
                        ? "bg-emerald-500/15 border-emerald-500/40 text-slate-100 font-bold"
                        : "bg-sky-500/10 border-sky-500/40 text-slate-100 font-bold"
                      : "bg-slate-900/40 border-slate-700/60 text-slate-400 hover:bg-slate-900/70 hover:text-slate-300"
                  }`}
                  id={`sans-select-${std.code.replace(/[:.\s]/g, "-")}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-mono text-xs font-bold ${isZm ? 'text-emerald-400' : 'text-sky-400'}`}>
                      {std.code}
                    </span>
                    <ArrowRight className={`w-3 h-3 transition-transform ${selectedStandard === std.code ? 'translate-x-0.5 text-sky-400' : 'opacity-0'}`} />
                  </div>
                  <p className="text-xs font-semibold truncate">{std.title}</p>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No matching standard located in this jurisdiction.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed standard presentation */}
        <div className="md:col-span-2 bg-slate-950/35 rounded-xl border border-slate-700 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  isZambianStd
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                }`}>
                  {isZambianStd ? 'Republic of Zambia Statutory Regulation' : 'South African National Standard (SABS/SANS)'}
                </span>
                <h4 className="text-base font-bold text-slate-200 mt-1">{activeStd.code}: {activeStd.title}</h4>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Scope & Engineering Testing Specs:</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#1e293b]/50 p-3 rounded-lg border border-slate-700">
                {activeStd.scope}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Critical relevance to Mines &amp; Processing Plants:</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeStd.relevance}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-950/15 border border-emerald-500/10 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">Compliance Checklist Audit:</span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                  {activeStd.auditCheck}
                </p>
              </div>
            </div>

            <div className="bg-[#1e293b] border border-slate-700 rounded-lg p-3 flex items-start gap-2">
              <Scale className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase block">
                  {isZambianStd ? 'Zambian MSD / ZEMA Legal Power:' : 'MHSA Legal Mandate:'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-normal font-sans">
                  {isZambianStd
                    ? 'MSD Kitwe Inspectors and ZEMA enforcement officers possess statutory authority to execute instant Section 54 stoppages, impound non-compliant equipment, and revoke discharge licenses.'
                    : 'Non-compliance gives DMRE auditors authority to immediately issue Section 54 stop-work notifications and list site-level risks.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
