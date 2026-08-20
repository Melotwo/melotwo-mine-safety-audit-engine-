import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Code,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Share2,
  Globe,
  Bot
} from 'lucide-react';
import {
  generateSiteJsonLd,
  generateSiteMarkdownSummary,
  SiteComplianceData
} from '../utils/aeoGenerator';

interface AeoPreviewProps {
  siteData?: SiteComplianceData;
  onBack?: () => void;
}

const DEFAULT_SITE_DATA: SiteComplianceData = {
  site_id: 'SITE-WIT-01',
  contractor_name: 'Impala Subterranean Catering & Logistics Pty Ltd',
  site_name: 'Witwatersrand Deep Shaft 3 & 4 Complex',
  location: 'Gauteng & North West Mining Belt, South Africa',
  primary_standard: 'SANS 10330:2020 & DMRE MHSA',
  standards_list: [
    'SANS 10330:2020 (HACCP)',
    'SANS 10049:2019 (PRP Hygiene)',
    'SANS 10142-1 (SANAS Probes)',
    'DMRE MHSA Sec 54 Compliance',
    'Regulation R638 (DOH)'
  ],
  total_verified_records: 14820,
  zero_incident_streak_days: 412,
  compliance_score_percentage: 99.4,
  last_audited_date: '2026-08-18',
  sheq_officer_name: 'T. Seroka',
  sheq_officer_id: 'TS-981-SHEQ',
  verification_url: 'https://melotwo.co.za/sites/site-wit-01',
  merkle_root_hash: '9a8e2b77c019284e9102482bb214f828a201bfa82940294821038291048291'
};

export const AeoPreview: React.FC<AeoPreviewProps> = ({
  siteData = DEFAULT_SITE_DATA,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'JSON_LD' | 'MARKDOWN'>('JSON_LD');
  const [copied, setCopied] = useState<boolean>(false);

  const jsonLdObject = useMemo(() => generateSiteJsonLd(siteData), [siteData]);
  const jsonLdString = useMemo(() => JSON.stringify(jsonLdObject, null, 2), [jsonLdObject]);
  const markdownString = useMemo(() => generateSiteMarkdownSummary(siteData), [siteData]);

  const activeContent = activeTab === 'JSON_LD' ? jsonLdString : markdownString;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(activeContent);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* Top Header Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
              >
                &larr; Return to Dashboard
              </button>
            )}
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>AEO (Answer Engine Optimization) Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                  MODULE 3
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={`/api/v1/aeo/site-summary/${siteData.site_id}.json`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition border border-slate-700 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>.json API</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={`/api/v1/aeo/site-summary/${siteData.site_id}.md`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition border border-slate-700 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>.md API</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* Hero Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Search & Rich Results Grounding</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                AEO Micro-Frameworks & LLM Crawl Ready Data
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Empower Perplexity, Google Gemini, and AI answer engines to accurately cite your mine compliance defensibility record with deterministic Schema.org JSON-LD and clean, hallucination-resistant Markdown dossiers.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-slate-950/80 border border-emerald-500/30 p-3.5 rounded-2xl">
                <span className="text-[10px] font-mono text-emerald-300 uppercase block">Compliance Score</span>
                <span className="text-2xl font-black text-white font-mono">{siteData.compliance_score_percentage}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">SANS 10330 Defended</span>
              </div>
              <div className="bg-slate-950/80 border border-cyan-500/30 p-3.5 rounded-2xl">
                <span className="text-[10px] font-mono text-cyan-300 uppercase block">Zero Incident Streak</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">{siteData.zero_incident_streak_days}d</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Continuous Record</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector & Copy Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="inline-flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('JSON_LD')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'JSON_LD'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Schema.org JSON-LD</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950/60 text-slate-200">
                Google Rich Results
              </span>
            </button>

            <button
              onClick={() => setActiveTab('MARKDOWN')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'MARKDOWN'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>LLM Semantic Markdown</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950/60 text-slate-200">
                Perplexity & AI Ingestion
              </span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition cursor-pointer shadow-lg"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy {activeTab === 'JSON_LD' ? 'JSON-LD' : 'Markdown'}</span>
              </>
            )}
          </button>
        </div>

        {/* Code / Markdown Preview Surface */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-slate-400 text-xs font-mono ml-2">
                {activeTab === 'JSON_LD' ? `schema-${siteData.site_id.toLowerCase()}.json` : `dossier-${siteData.site_id.toLowerCase()}.md`}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              {activeTab === 'JSON_LD' ? 'application/ld+json' : 'text/markdown; charset=utf-8'}
            </span>
          </div>

          <pre className="p-6 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200 bg-slate-950/50 max-h-[580px] selection:bg-cyan-500/30">
            <code>{activeContent}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};

export default AeoPreview;
