import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, ShieldCheck, HelpCircle, Activity } from 'lucide-react';

export interface FAQItem {
  id: string;
  category: string;
  sansCode?: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'sans-fr-fabrics',
    category: 'Personal Protective Equipment',
    sansCode: 'SANS 434 / SANS 1423',
    question: 'What are the exact SANS requirements for inherent flame-resistant (FR) fabrics in underground mining operations?',
    answer: 'Under South African National Standards (specifically aligned with SANS 434 and SANS 1423), all thermal protective workwear used in high-risk underground zones must be manufactured using permanently flame-resistant fibers that cannot wash or wear out. Unlike treated cotton fabrics which lose safety efficacy over time through commercial laundering, inherent FR fabrics must maintain non-tripping, self-extinguishing thermal protection for the entire lifecycle of the garment. This guarantees continuous protection against flash fires and electric arc flashes in restricted mining sectors.'
  },
  {
    id: 'sans-loto-protocol',
    category: 'Operational Safety',
    sansCode: 'SANS 10286',
    question: "How do you update a mine's Lockout/Tagout (LOTO) protocol to meet SANS 10286 standards?",
    answer: "To bring an underground ventilation or mechanical system up to SANS 10286 compliance, your operational protocol must implement a strict multi-point dual-authorization framework. Every isolation point requires a dedicated physical lock and high-visibility tag that explicitly states the active technician's registration index, the date of isolation, and the functional department. A standard isolation key cannot be bypassed or forced open under any circumstances; if a lock mechanism or key fails during maintenance, operations must remain halted until an emergency dual-sign-off is authorized by the Chief Engineer and Safety Officer simultaneously."
  },
  {
    id: 'sans-ppe-gloves',
    category: 'Personal Protective Equipment',
    sansCode: 'SANS Guidelines',
    question: 'When are specialized personal protective equipment (PPE) like anti-vibration and chemical-resistant gloves legally mandated under South African industrial standards?',
    answer: 'Specialized protective gloves are legally required the moment a risk assessment identifies prolonged exposure to mechanical vibration (exceeding daily exposure action values from pneumatic drilling) or chemical handling zones. Under SANS safety frameworks, standard leather rigging gloves are insufficient for handling heavy machinery or processing chemicals. Operations must provision certified anti-vibration gloves to mitigate Hand-Arm Vibration Syndrome (HAVS) and dedicated nitrile or neoprene chemical-resistant gloves that feature explicit degradation and breakthrough times matching the specific chemical safety data sheets (SDS) on site.'
  },
  {
    id: 'popia-health-logs',
    category: 'Information Security & Privacy',
    sansCode: 'POPIA Act',
    question: 'How does the Protection of Personal Information Act (POPIA) impact employee health logging and biometric tracking at mine access control points?',
    answer: 'Employee health logs, respiratory fitness test results, and medical histories are classified as Special Personal Information under POPIA. While access control biometric scans are legally permitted for underground safety tracking and emergency manifests, this health data must be heavily restricted. It cannot be combined with general HR records or exposed to unauthorized network boundaries. Any platform processing these logs must automatically mask sensitive personal identifiers (such as 13-digit South African ID numbers) and route raw telemetry streams through dedicated data protection circuits to prevent unauthorized perimeter leaks.'
  }
];

export const ComplianceFAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('sans-fr-fabrics'); // default-expand the first item for rich initial layout

  // Get unique categories for tab filter
  const categories = useMemo(() => {
    const cats = FAQ_DATA.map(item => item.category);
    return ['All', ...Array.from(new Set(cats))];
  }, []);

  // Filter items based on search query and category
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesSearch = 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sansCode && item.sansCode.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div 
      id="compliance-faq-section" 
      className="w-full max-w-4xl mx-auto my-12 p-6 md:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl"
    >
      {/* Header and Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Audit Knowledge Base</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            SANS Mining Compliance &amp; Safety FAQ
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Verified, search-optimized regulatory reference answers for underground industrial operations, personal safety standards, and information protection.
          </p>
        </div>
        <div className="bg-slate-950/80 px-4 py-2 border border-slate-800 rounded-2xl flex items-center gap-2 self-start md:self-center">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-mono text-slate-300">GEO-Optimized Index</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Search Input */}
        <div className="md:col-span-7 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search questions, standards, or codes (e.g. SANS 10286)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="md:col-span-5 flex flex-wrap items-center gap-2 md:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.35)]'
                  : 'bg-slate-950/80 text-slate-200 border-slate-800 hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Stream */}
      <div className="space-y-4">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? 'bg-slate-950/80 border-slate-700/80 shadow-lg shadow-blue-950/10'
                    : 'bg-slate-950/30 border-slate-800 hover:border-slate-700/50 hover:bg-slate-950/50'
                }`}
              >
                {/* Trigger Button with conversational query */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 rounded-md">
                        {faq.category}
                      </span>
                      {faq.sansCode && (
                        <span className="text-[10px] font-mono text-blue-400 font-semibold">
                          {faq.sansCode}
                        </span>
                      )}
                    </div>
                    {/* long-tail search question formatted as an H3 block */}
                    <h3 className="text-slate-200 group-hover:text-white font-medium text-sm md:text-base leading-relaxed tracking-tight">
                      {faq.question}
                    </h3>
                  </div>
                  <span className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180 text-blue-400 border-blue-500/20 bg-blue-950/20' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {/* Animated Answer Panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[500px] border-t border-slate-900' : 'max-h-0 pointer-events-none'
                  } overflow-hidden`}
                >
                  <div className="px-5 py-4 md:px-6 md:py-5 bg-slate-950/50 text-slate-300 text-sm leading-relaxed space-y-3 font-sans select-text">
                    <p className="text-slate-300">
                      {faq.answer}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Verbatim Regulatory Compliance Data Match (POPIA &amp; SANS Compliant)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No regulatory answers found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-3 text-xs text-blue-400 hover:underline cursor-pointer"
            >
              Clear filters and search again
            </button>
          </div>
        )}
      </div>

      {/* Decorative Footer info */}
      <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white font-bold">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-200">Integrated with </span>
          <span className="font-mono text-white bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-700 shadow-[0_0_10px_rgba(255,255,255,0.05)]">MeloTwo Audit Core v1.0.4</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 border border-slate-700/80 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"></span>
          <span className="font-black text-emerald-400 font-mono tracking-wide">SANS REGULATORY INDEXES ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
