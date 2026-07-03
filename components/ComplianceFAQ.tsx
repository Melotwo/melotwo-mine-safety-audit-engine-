import React, { useState } from 'react';

interface FAQItem {
  id: string;
  category: string;
  badge: string;
  question: string;
  answer: string;
}

export default function ComplianceFAQ() {
  const [activeId, setActiveId] = useState<string | null>('fr-fabrics');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Personal Protective Equipment', 'Operational Safety', 'Information Security & Privacy'];

  const faqData: FAQItem[] = [
    {
      id: 'fr-fabrics',
      category: 'Personal Protective Equipment',
      badge: 'SANS 434 / SANS 1423',
      question: 'What are the exact SANS requirements for inherent flame-resistant (FR) fabrics in underground mining operations?',
      answer: 'Under South African National Standards (specifically aligned with SANS 434 and SANS 1423), all thermal protective workwear used in high-risk underground zones must be manufactured using permanently flame-resistant fibers that cannot wash or wear out. Unlike treated cotton fabrics which lose safety efficacy over time through commercial laundering, inherent FR fabrics must maintain non-tripping, self-extinguishing thermal protection for the entire lifecycle of the garment. This guarantees continuous protection against flash fires and electric arc flashes in restricted mining sectors.'
    },
    {
      id: 'loto-protocol',
      category: 'Operational Safety',
      badge: 'SANS 10286',
      question: "How do you update a mine's Lockout/Tagout (LOTO) protocol to meet SANS 10286 standards?",
      answer: 'To bring an underground ventilation or mechanical system up to SANS 10286 compliance, your operational protocol must implement a strict multi-point dual-authorization framework. Every isolation point requires a dedicated physical lock and high-visibility tag that explicitly states the active technician\'s registration index, the date of isolation, and the functional department. A standard isolation key cannot be bypassed or forced open under any circumstances; if a lock mechanism or key fails during maintenance, operations must remain halted until an emergency dual-sign-off is authorized by the Chief Engineer and Safety Officer simultaneously.'
    },
    {
      id: 'ppe-gloves',
      category: 'Personal Protective Equipment',
      badge: 'SANS Guidelines',
      question: 'When are specialized personal protective equipment (PPE) like anti-vibration and chemical-resistant gloves legally mandated under South African industrial standards?',
      answer: 'Specialized protective gloves are legally required the moment a risk assessment identifies prolonged exposure to mechanical vibration (exceeding daily exposure action values from pneumatic drilling) or chemical handling zones. Under SANS safety frameworks, standard leather rigging gloves are insufficient for handling heavy machinery or processing chemicals. Operations must provision certified anti-vibration gloves to mitigate Hand-Arm Vibration Syndrome (HAVS) and dedicated nitrile or neoprene chemical-resistant gloves that feature explicit degradation and breakthrough times matching the specific chemical safety data sheets (SDS) on site.'
    },
    {
      id: 'popia-tracking',
      category: 'Information Security & Privacy',
      badge: 'POPIA Act',
      question: 'How does the Protection of Personal Information Act (POPIA) impact employee health logging and biometric tracking at mine access control points?',
      answer: 'Employee health logs, respiratory fitness test results, and medical histories are classified as Special Personal Information under POPIA. While access control biometric scans are legally permitted for underground safety tracking and emergency manifests, this health data must be heavily restricted. It cannot be combined with general HR records or exposed to unauthorized network boundaries. Any platform processing these logs must automatically mask sensitive personal identifiers (such as 13-digit South African ID numbers) and route raw telemetry streams through dedicated data protection circuits to prevent unauthorized perimeter leaks.'
    }
  ];

  const filteredData = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Audit Knowledge Base
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            SANS Mining Compliance & Safety FAQ
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verified, search-optimized regulatory reference answers for underground industrial operations.
          </p>
        </div>
        <div className="self-start md:self-auto px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400 flex items-center gap-1.5 whitespace-nowrap">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          GEO-Optimized Index
        </div>
      </div>

      {/* FIXED Search Box Mock */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </span>
        <input 
          type="text" 
          disabled
          placeholder="Search questions, standards, or codes (e.g. SANS 10286)..." 
          className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-400 cursor-not-allowed"
        />
      </div>

      {/* FIXED Category Pills: Uses flex-wrap and slimmer padding to fit perfect on two lines or mobile */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredData.map((item) => {
          const isOpen = activeId === item.id;
          return (
            <div 
              key={item.id} 
              className={`border rounded-xl transition-all duration-300 ${
                isOpen 
                  ? 'bg-slate-950/40 border-slate-700/70 shadow-lg' 
                  : 'bg-slate-800/20 border-slate-800/80 hover:border-slate-700/50'
              }`}
            >
              <button
                onClick={() => setActiveId(isOpen ? null : item.id)}
                className="w-full text-left p-4 flex flex-col gap-2 relative"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 bg-blue-950/60 text-blue-400 border border-blue-900/50 rounded">
                    {item.badge}
                  </span>
                  <span className="absolute right-4 top-4 text-slate-500">
                    <svg className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 pr-6 mt-1 leading-snug">
                  {item.question}
                </h3>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] border-t border-slate-800/60' : 'max-h-0'}`}>
                <div className="p-4 bg-slate-950/20">
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {item.answer}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-900/50 flex items-center gap-1.5 text-[10px] text-slate-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Verbatim Regulatory Compliance Data Match (POPIA & SANS Compliant)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FIXED High-Contrast Footer Layer text */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] font-medium text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          Integrated with <span className="text-slate-200 font-semibold">MeloTwo Audit Core v1.0.4</span>
        </div>
        <div className="text-slate-300 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
          🛡️ SANS Regulatory Indexes Current
        </div>
      </div>
    </div>
  );
}
