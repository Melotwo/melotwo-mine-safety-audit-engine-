import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Check, Sparkles, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { MeloTwoLogo } from './MeloTwoLogo';

interface GooglePreferredSourceBannerProps {
  variant?: 'banner' | 'card' | 'compact' | 'footer';
  className?: string;
}

export const GooglePreferredSourceBanner: React.FC<GooglePreferredSourceBannerProps> = ({
  variant = 'banner',
  className = '',
}) => {
  const [showExplainer, setShowExplainer] = useState(false);
  const [copied, setCopied] = useState(false);
  const nativeBtnRef = useRef<HTMLDivElement>(null);
  const PREFERRED_SOURCE_URL = 'https://www.google.com/preferences/source?q=melotwo.com';

  useEffect(() => {
    // Ensure the native google-add-preferred-source-btn attribute is present for Option A
    if (nativeBtnRef.current) {
      nativeBtnRef.current.setAttribute('google-add-preferred-source-btn', '');
    }
  }, []);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(PREFERRED_SOURCE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Google G Multi-Color SVG
  const GoogleLogoSvg = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 ${className}`}>
        <GoogleLogoSvg size={16} />
        <span>Add MeloTwo to Google Preferred Sources</span>
        {/* Native Option A mount point */}
        <div ref={nativeBtnRef} className="google-add-preferred-source-btn inline-block" />
        <a
          href={PREFERRED_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-[11px]"
        >
          <span>Add</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 md:p-6 shadow-xl ${className}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
              <GoogleLogoSvg size={24} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Google Search & AI Overviews
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Official Integration
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                Make MeloTwo Your Preferred Source on Google
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Prioritize South African MHSA, DMRE Section 54/55, and SANS 10330 HACCP statutory guides whenever you or your team search Google or query Gemini AI.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            {/* Native Google Preferred Sources button container (Option A) */}
            <div ref={nativeBtnRef} className="google-add-preferred-source-btn empty:hidden" />

            {/* Direct 1-Click Action Button (works instantly across all devices) */}
            <a
              href={PREFERRED_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer"
            >
              <GoogleLogoSvg size={16} />
              <span>Add to Preferred Sources</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setShowExplainer(!showExplainer)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              title="How this works"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Why add?</span>
              {showExplainer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Explainer Drawer */}
        {showExplainer && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid sm:grid-cols-3 gap-4 text-xs text-slate-300 animate-fadeIn">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Priority AI Overviews</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Google surfaces MeloTwo's vetted statutory checklists at the top of AI search summaries and Gemini prompts.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trusted Badge in Top Stories</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Articles and statutory updates from melotwo.com receive a "Preferred Source" trust badge on your Google account.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share with SHEQ Team</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Equip your site safety officers, engineers, and catering managers with uniform, audit-ready compliance answers.
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-1 text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied invite link!</span>
                  </>
                ) : (
                  <span>Copy team setup link</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default 'banner' variant
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/20 p-6 md:p-8 shadow-2xl ${className}`}>
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono">
              <GoogleLogoSvg size={14} />
              <span>Google Preferred Sources</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              NEW GOOGLE SEARCH FEATURE
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Add MeloTwo as Your Preferred Source on Google
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Google now allows engineers, mine overseers, and SHEQ officers to choose preferred trusted domains. When you add <strong className="text-white">melotwo.com</strong>, Google Search and AI Overviews prioritize our verified MHSA, DMRE Section 54/55 stoppage protocols, and SANS 10330 food safety audit models whenever you search.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Direct citation in Gemini & AI Search
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Official "Preferred Source" badge
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              100% Free & reversible anytime
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-stretch gap-3 w-full md:w-auto shrink-0">
          {/* Native Google button slot (Option A) */}
          <div ref={nativeBtnRef} className="google-add-preferred-source-btn empty:hidden" />

          {/* High-Converting 1-Click Button */}
          <a
            href={PREFERRED_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all cursor-pointer group"
          >
            <GoogleLogoSvg size={18} />
            <span>Add to Preferred Sources</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 text-xs font-semibold transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Link with SHEQ Team</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GooglePreferredSourceBanner;
