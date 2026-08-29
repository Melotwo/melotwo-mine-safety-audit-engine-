import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  Send,
  RefreshCw,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Filter,
  UploadCloud,
  FileCheck2,
  Sparkles,
  Phone,
  Mail,
  Briefcase,
  Layers,
  ChevronRight,
  UserCheck,
  DollarSign,
  Play,
  Award,
  Zap
} from 'lucide-react';
import { TenderLead, ScrapedTender, ScraperCronJobStatus, TenderCategory, LeadType, LeadStatus } from '../types';
import { useToast } from '../hooks/useToast';

export interface TenderLeadScraperHubProps {
  onOpenTenderWizard?: () => void;
}

export const TenderLeadScraperHub: React.FC<TenderLeadScraperHubProps> = ({
  onOpenTenderWizard
}) => {
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'leads' | 'tenders' | 'parser'>('leads');
  const [leadFilterType, setLeadFilterType] = useState<'ALL' | 'PRE_SUBMISSION' | 'POST_WIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data state
  const [leads, setLeads] = useState<TenderLead[]>([]);
  const [tenders, setTenders] = useState<ScrapedTender[]>([]);
  const [scraperStatus, setScraperStatus] = useState<ScraperCronJobStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);

  // Selected lead modal
  const [selectedLead, setSelectedLead] = useState<TenderLead | null>(null);

  // PDF Parser state
  const [registerText, setRegisterText] = useState<string>(
`ATTENDANCE REGISTER - COMPULSORY BRIEFING SESSION
Tender: SANRAL-N3-2026-08 (N3 Sec 4 Rehabilitation)
Date: 22 August 2026

1. Witwatersrand Deep Reef Civils Pty Ltd
   Representative: Sipho Ndlovu
   Email: sipho.ndlovu@witreef.co.za
   Mobile: 082 491 8832
   CIDB Grading: 8CE

2. Highveld Bulk Earthmoving & Civils CC
   Representative: Johan Pretorius
   Email: johan@highveldearth.co.za
   Mobile: 072 319 4410
   CIDB Grading: 7CE

3. Mogalakwena Heavy Contractors JV
   Representative: Kobus van der Merwe
   Email: kobus@mogalakwenajv.co.za
   Mobile: 071 884 1029
   CIDB Grading: 8CE / 7GB`
  );
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedResults, setParsedResults] = useState<any[] | null>(null);

  // Load initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statusRes, leadsRes, tendersRes] = await Promise.all([
        fetch('/api/tenders/scraper/status'),
        fetch('/api/tenders/leads'),
        fetch('/api/tenders/list')
      ]);

      if (statusRes.ok) {
        const s = await statusRes.json();
        setScraperStatus(s);
      }
      if (leadsRes.ok) {
        const l = await leadsRes.json();
        setLeads(l.leads || []);
      }
      if (tendersRes.ok) {
        const t = await tendersRes.json();
        setTenders(t.tenders || []);
      }
    } catch (err) {
      console.error('Failed to load scraper data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Trigger On-Demand Crawl
  const handleTriggerCrawl = async () => {
    try {
      setIsCrawling(true);
      const res = await fetch('/api/tenders/scraper/trigger-crawl', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast({
          title: 'eTenders Crawl Completed',
          message: `Scraped ${data.activeTendersCount} active and ${data.awardedTendersCount} awarded tenders. Filtered high-risk SHEQ leads.`,
          type: 'success',
          duration: 4000
        });
        await fetchData();
      }
    } catch (err) {
      toast({
        title: 'Crawl Error',
        message: 'Could not contact eTenders scraping service.',
        type: 'error'
      });
    } finally {
      setIsCrawling(false);
    }
  };

  // Update Lead Status
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/tenders/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        }
        toast({
          title: 'Status Updated',
          message: `Lead updated to ${newStatus}.`,
          type: 'info',
          duration: 2500
        });
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  // Copy cold pitch
  const handleCopyPitch = async (lead: TenderLead) => {
    try {
      const textToCopy = `Subject: ${lead.customPitchSubject}\n\n${lead.customPitchBody}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const el = document.createElement('textarea');
        el.value = textToCopy;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }

      setCopiedLeadId(lead.id);
      setTimeout(() => setCopiedLeadId(null), 2500);

      toast({
        title: 'Pitch Copied to Clipboard!',
        message: `Tailored pitch for ${lead.companyName} is ready to send.`,
        type: 'success',
        duration: 3500
      });
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Trigger Briefing Register Parsing
  const handleParseRegister = async () => {
    if (!registerText.trim()) {
      toast({
        title: 'Empty Document',
        message: 'Please paste briefing attendance text or upload a document.',
        type: 'warning'
      });
      return;
    }

    try {
      setIsParsing(true);
      const res = await fetch('/api/tenders/parse-briefing-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: registerText,
          fileName: 'Uploaded_Attendance_Register.pdf'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setParsedResults(data.extractedLeads || []);
        toast({
          title: `Parsed ${data.extractedLeads?.length || 0} Leads!`,
          message: `Extracted via ${data.parsingMethod}. Leads stored as Pre-Submission pipeline.`,
          type: 'success',
          duration: 4500
        });
        await fetchData();
      }
    } catch (err) {
      toast({
        title: 'Parsing Failed',
        message: 'Could not process briefing register text.',
        type: 'error'
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Export Leads
  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/tenders/leads/export?format=${format}`, '_blank');
    toast({
      title: `Exporting ${format.toUpperCase()}`,
      message: 'Your leads data file download has started.',
      type: 'info',
      duration: 3000
    });
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    if (leadFilterType !== 'ALL' && l.leadType !== leadFilterType) return false;
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && l.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.companyName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.sourceTenderId.toLowerCase().includes(q) ||
        l.tenderTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories: TenderCategory[] = [
    'Civil Engineering',
    'Building Construction',
    'Electrical',
    'Mining Services',
    'Earthworks',
    'General Maintenance'
  ];

  return (
    <div className="space-y-6">
      
      {/* Strategy 3 Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Strategy 3: Automated Tender & Lead Scraper</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>eTenders Portal Lead Engine</span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                Live Cron Active
              </span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Automated scraper harvesting active and awarded high-risk tenders from <strong className="text-white">etenders.gov.za</strong>. Parses compulsory briefing attendance registers for <strong className="text-amber-400">Pre-Submission Bids</strong> and tracks <strong className="text-emerald-400">Post-Win Awards</strong> for 14-day site handover safety files.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap sm:flex-col items-center sm:items-end gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Next Auto-Crawl:</span>
              <span className="font-mono text-slate-200">15 min</span>
            </div>
            <button
              onClick={handleTriggerCrawl}
              disabled={isCrawling}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-950/40 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
              <span>{isCrawling ? 'Crawling eTenders...' : 'Trigger Live eTenders Crawl'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Counter Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Total Scraped Leads</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">{leads.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-mono text-amber-400 uppercase">Pre-Submission (Briefings)</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
              {leads.filter(l => l.leadType === 'PRE_SUBMISSION').length}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-mono text-emerald-400 uppercase">Post-Win (14-Day Rush)</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              {leads.filter(l => l.leadType === 'POST_WIN').length}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-mono text-indigo-400 uppercase">Active Scraped Tenders</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono mt-1">
              {tenders.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Tender Leads Pipeline</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/30">
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tenders')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'tenders'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>eTenders Feed & Registers</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/30">
              {tenders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('parser')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'parser'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Briefing Register Parser</span>
          </button>
        </div>

        {/* Export Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition cursor-pointer"
            title="Download Leads as CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleExport('json')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition cursor-pointer"
            title="Download Leads as JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LEADS MANAGEMENT PIPELINE */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          
          {/* Sub-Filters & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              
              {/* Type Filter */}
              <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setLeadFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition ${leadFilterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All ({leads.length})
                </button>
                <button
                  onClick={() => setLeadFilterType('PRE_SUBMISSION')}
                  className={`px-2.5 py-1 rounded-lg transition ${leadFilterType === 'PRE_SUBMISSION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
                >
                  Pre-Submission
                </button>
                <button
                  onClick={() => setLeadFilterType('POST_WIN')}
                  className={`px-2.5 py-1 rounded-lg transition ${leadFilterType === 'POST_WIN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'}`}
                >
                  Post-Win (14-Day)
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONVERTED">Converted</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search contractor, email, tender ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Contractor & Contact</th>
                  <th className="py-3.5 px-4">Pipeline Type</th>
                  <th className="py-3.5 px-4">Source Tender & Sector</th>
                  <th className="py-3.5 px-4">Targeted Safety Asset</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No tender leads found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => {
                    const isPostWin = lead.leadType === 'POST_WIN';
                    const isCopied = copiedLeadId === lead.id;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                        
                        {/* Contractor & Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{lead.companyName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{lead.contactPerson}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{lead.phone}</span>
                          </div>
                          <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                            {lead.email}
                          </div>
                        </td>

                        {/* Pipeline Type */}
                        <td className="py-3.5 px-4">
                          {isPostWin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              <Award className="w-3 h-3 text-emerald-400" />
                              Post-Win Award
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              <FileText className="w-3 h-3 text-amber-400" />
                              Pre-Submission
                            </span>
                          )}
                          {lead.awardValueZar && (
                            <div className="text-[11px] font-mono text-emerald-400 font-bold mt-1">
                              {lead.awardValueZar}
                            </div>
                          )}
                        </td>

                        {/* Source Tender & Category */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[11px] text-slate-400 font-bold">
                            {lead.sourceTenderId}
                          </div>
                          <div className="text-slate-300 text-[11px] line-clamp-1 max-w-xs mt-0.5">
                            {lead.tenderTitle}
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {lead.category}
                          </span>
                        </td>

                        {/* Target Product */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] font-bold text-slate-200">
                            {lead.targetSafetyProduct}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {isPostWin ? '14-Day Site Handover Rush' : 'Returnable Tender Envelope'}
                          </div>
                        </td>

                        {/* Status Lifecycle Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status}
                            onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className={`text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                              lead.status === 'CONVERTED'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : lead.status === 'CONTACTED'
                                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                                : 'bg-amber-950/80 text-amber-300 border-amber-800'
                            }`}
                          >
                            <option value="NEW">● NEW</option>
                            <option value="CONTACTED">● CONTACTED</option>
                            <option value="CONVERTED">✓ CONVERTED</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy Pitch */}
                            <button
                              onClick={() => handleCopyPitch(lead)}
                              className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                isCopied
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                              }`}
                              title="Copy Tailored Cold Outreach Pitch"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy Pitch'}</span>
                            </button>

                            {/* Email Launcher */}
                            <a
                              href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.customPitchSubject)}&body=${encodeURIComponent(lead.customPitchBody)}`}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>

                            {/* WhatsApp Direct */}
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.contactPerson},\n\n${lead.customPitchBody}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition"
                              title="Send WhatsApp Message"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* Inspect Modal */}
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                              title="Inspect Full Lead Details"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: ETENDERS FEED & ATTACHMENTS */}
      {activeTab === 'tenders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenders.map(t => {
              const isAwarded = t.status === 'AWARDED';

              return (
                <div key={t.tenderId} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{t.tenderId}</span>
                        {isAwarded ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Awarded Final
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                            Active Closing: {t.closingDate}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-sm mt-1">{t.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{t.organOfState}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {t.category}
                    </span>
                  </div>

                  {/* Award or Briefing details */}
                  {isAwarded && t.awardedContractor ? (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 space-y-1">
                      <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Awarded Contractor:
                      </div>
                      <div className="text-xs font-black text-white">{t.awardedContractor.name}</div>
                      <div className="text-xs text-slate-300 font-mono flex items-center justify-between">
                        <span>Value: <strong className="text-emerald-400">{t.awardedContractor.valueZar}</strong></span>
                        <span>Date: {t.awardedContractor.dateAwarded}</span>
                      </div>
                    </div>
                  ) : t.briefingSession ? (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Briefing Session:
                      </div>
                      <div className="text-xs text-slate-200">{t.briefingSession.venue}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{t.briefingSession.date}</div>
                    </div>
                  ) : null}

                  {/* Document Attachments */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Attached Documents ({t.documents.length})</div>
                    <div className="space-y-1">
                      {t.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate text-slate-300">{doc.name}</span>
                          </div>
                          {doc.isBriefingRegister ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              Register Found
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {doc.fileSize || 'PDF'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AI BRIEFING REGISTER PDF PARSER */}
      {activeTab === 'parser' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Parser Input Box */}
          <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3 h-3" /> Cognitive Briefing Register OCR
              </div>
              <h3 className="text-base font-bold text-white">Paste or Dump Briefing Attendance Text</h3>
              <p className="text-xs text-slate-400">
                Upload or paste raw text from compulsory briefing attendance sheets. Gemini AI parses contractor names, representatives, emails, and cell numbers into actionable Pre-Submission leads.
              </p>
            </div>

            <textarea
              rows={12}
              value={registerText}
              onChange={e => setRegisterText(e.target.value)}
              placeholder="Paste raw attendance register text here..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
            />

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400 font-mono">
                {registerText.length} characters
              </div>
              <button
                onClick={handleParseRegister}
                disabled={isParsing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-950/40 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
                <span>{isParsing ? 'Extracting via Gemini OCR...' : 'Parse Briefing Register & Add Leads'}</span>
              </button>
            </div>
          </div>

          {/* Parser Live Output Preview */}
          <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Extracted Contractor Leads</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {parsedResults ? `${parsedResults.length} records parsed` : 'Ready to parse'}
              </span>
            </div>

            {parsedResults && parsedResults.length > 0 ? (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {parsedResults.map((lead, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-xs">{lead.companyName}</div>
                        <div className="text-[11px] text-slate-400">{lead.contactPerson}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Pre-Submission
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                      <div>Email: <span className="text-amber-300">{lead.email}</span></div>
                      <div>Phone: <span className="text-slate-200">{lead.phone}</span></div>
                    </div>

                    <div className="text-[11px] text-slate-300 line-clamp-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 font-mono uppercase text-[10px]">Generated Pitch: </span>
                      {lead.customPitchSubject}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 text-slate-500">
                <UploadCloud className="w-10 h-10 text-slate-600" />
                <p className="text-xs">No newly parsed register yet. Paste text on the left and click "Parse Briefing Register".</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* INSPECT LEAD MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono mb-2 ${
                  selectedLead.leadType === 'POST_WIN'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedLead.leadType === 'POST_WIN' ? 'Post-Win Awarded Bidder' : 'Pre-Submission Attending Bidder'}
                </span>
                <h3 className="text-xl font-black text-white">{selectedLead.companyName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedLead.tenderTitle}</p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">CONTACT PERSON</span>
                <span className="text-white font-bold">{selectedLead.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">EMAIL ADDRESS</span>
                <span className="text-amber-400">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PHONE / CELL</span>
                <span className="text-slate-200">{selectedLead.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SOURCE TENDER</span>
                <span className="text-slate-200">{selectedLead.sourceTenderId}</span>
              </div>
            </div>

            {/* Tailored Pitch Preview */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Tailored Outreach Pitch</span>
                <button
                  onClick={() => handleCopyPitch(selectedLead)}
                  className="text-amber-400 hover:text-amber-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Pitch Text</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                <strong className="text-white block mb-2">Subject: {selectedLead.customPitchSubject}</strong>
                {selectedLead.customPitchBody}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Update Status:</span>
                <select
                  value={selectedLead.status}
                  onChange={e => handleStatusChange(selectedLead.id, e.target.value as LeadStatus)}
                  className="bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CONVERTED">Converted</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(selectedLead.customPitchSubject)}&body=${encodeURIComponent(selectedLead.customPitchBody)}`}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                >
                  Launch Email
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
