import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Info, X, ExternalLink, Scale, CheckCircle2, Lock, FileText } from 'lucide-react';

export interface StatutoryFactSheetProps {
  variant?: 'popover' | 'modal' | 'badge' | 'card';
  className?: string;
  triggerLabel?: string;
  children?: React.ReactNode;
}

/**
 * "Boring by Design" Statutory Accountability Fact-Sheet
 * 
 * Reassures SHEQ officers and enterprise compliance auditors that MeloTwo AI
 * does not replace human statutory appointments or legal accountability, but acts
 * strictly as a verifiable evidence-retention, document-mapping, and audit-trail compiler.
 */
export const StatutoryFactSheet: React.FC<StatutoryFactSheetProps> = ({
  variant = 'popover',
  className = '',
  triggerLabel = 'OHSA Audit Matrix™ (Statutory Defensibility)',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  // Card Variant (Static Embedded Block)
  if (variant === 'card') {
    return (
      <div className={`bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-300 font-sans ${className}`}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Statutory Accountability Fact-Sheet &bull; Boring by Design
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed italic border-l-2 border-slate-600 pl-3 my-3">
          &ldquo;MeloTwo AI does not replace statutory judgment; it automates evidence retention and document mapping for Section 3.1(a) defensibility.&rdquo;
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Human Duty-Bearer Sign-off</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Tamper-proof Evidence Hash</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>OHS Act 85 / SANS Alignment</span>
          </div>
        </div>
      </div>
    );
  }

  // Popover Trigger Variant (Default)
  return (
    <div 
      className={`relative inline-block ${className}`} 
      ref={popoverRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger element */}
      {children ? (
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg transition shadow-sm cursor-pointer"
          aria-expanded={isOpen}
        >
          <Scale className="w-3 h-3 text-slate-400" />
          <span>{triggerLabel}</span>
          <Info className="w-3 h-3 text-slate-500" />
        </button>
      )}

      {/* High-Contrast Monotone Fact-Sheet Popover */}
      {isOpen && (
        <div 
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 sm:w-96 bg-slate-950 border-2 border-slate-700 text-white rounded-2xl shadow-2xl p-4 sm:p-5 transition-all animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-label="Statutory Accountability Fact-Sheet"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-white">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block leading-tight">
                  Legal Architecture
                </span>
                <span className="text-xs font-bold text-white leading-tight">
                  Statutory Accountability Fact-Sheet
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close fact sheet"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Core Neutral Quote */}
          <div className="my-3.5 bg-slate-900/90 border-l-2 border-slate-400 p-3 rounded-r-xl">
            <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
              &ldquo;MeloTwo AI does not replace statutory judgment; it automates evidence retention and document mapping for Section 3.1(a) defensibility.&rdquo;
            </p>
          </div>

          {/* Bulleted Verifications */}
          <div className="space-y-2 text-[11px] text-slate-300 pt-1">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Strict Chain-of-Custody:</strong> All assessments require explicit Section 16.2 / CR 8.1 duty-bearer electronic verification.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Deterministic SANS Rules:</strong> Zero stochastic hallucinations. Threshold checks against SANS 10330, SANS 10142, and SANS 10049.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Audit Defensibility:</strong> Exportable evidentiary logbooks compliant with Department of Employment and Labour inspections.
              </span>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Boring by Design &bull; SANS 10330</span>
            <span className="text-slate-500">OHS Act Sec 3.1(a)</span>
          </div>

          {/* Pointing triangle */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-950 border-r-2 border-b-2 border-slate-700 rotate-45"></div>
        </div>
      )}
    </div>
  );
};
