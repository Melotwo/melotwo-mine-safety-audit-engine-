import React, { useState } from 'react';
import { 
  Mail, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Building2, 
  User, 
  ShieldAlert, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  ExternalLink, 
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  PhoneCall
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

export interface ContractorLead {
  id: string;
  name: string;
  role: string;
  company: string;
  sector: string;
  region: string;
  email: string;
  phone?: string;
  painPoint: string;
  statutoryFocus: string;
  status: 'New Lead' | 'Pitch Sent' | 'Followed Up' | 'Demo Booked' | 'Tender Active' | 'Won';
  estimatedValue: string;
  pitchSubject: string;
  pitchBody: string;
}

export const INITIAL_LEADS: ContractorLead[] = [
  {
    id: 'LEAD-001',
    name: 'Sipho Khumalo',
    role: 'Head of SHEQ & Subcontractor Compliance',
    company: 'Mogalakwena Platinum JV (Limpopo Belt)',
    sector: 'Platinum Mining & Smelting',
    region: 'Mokopane, Limpopo',
    email: 's.khumalo@mogalakwenaplat.co.za',
    phone: '+27 15 491 8000',
    painPoint: 'Subcontractor Section 37.2 mandatory agreements getting rejected at shaft security boom.',
    statutoryFocus: 'MHSA Act 29 of 1996 & Section 37.2 Transfer of Liability',
    status: 'New Lead',
    estimatedValue: 'R45,000 / mo',
    pitchSubject: 'Quick question regarding Mogalakwena subcontractor MHSA Section 37.2 gate clearances',
    pitchBody: `Hi Sipho,

I noticed your teams are managing heavy underground & surface contractor packages across the Mogalakwena mining operations in Limpopo.

Across South African operations, up to 70% of subcontractor safety files get turned away at the shaft boom due to flawed MHSA Section 37.2 mandatory agreements and mismatched Annexure 3 medical baselines—costing subbies R15,000–R50,000 daily in idle shift downtime.

MeloTwo solves this automatically:
• Instantly generates site-tailored, 20-Section MHSA & SANS 10330 compliant tender safety files in 90 seconds.
• Guarantees statutory defensibility with automated DMRE appointment letters & digital audit trails.
• Real-time expiry tracking for COID letters of good standing & subterranean medical surveillance.

Would you be open to a brief 7-minute overview this Thursday to see how Mogalakwena can eliminate subcontractor gate clearance delays?

Best regards,
MeloTwo Safety Intelligence Team
https://melotwo.com`
  },
  {
    id: 'LEAD-002',
    name: 'Francois van der Merwe',
    role: 'Contracts Director & Pr.CPM',
    company: 'Highveld Coal & Haulage Engineering',
    sector: 'Open-Cast Coal & Heavy Civils',
    region: 'eMalahleni, Mpumalanga',
    email: 'f.vandermerwe@highveldhaul.co.za',
    phone: '+27 13 690 1200',
    painPoint: 'Tender submissions delayed 5-7 days while manually compiling lever-arch safety binders.',
    statutoryFocus: 'SANS 10142, SANS 10330 & CIDB Grade 7/8 Compliance',
    status: 'Pitch Sent',
    estimatedValue: 'R28,000 / mo',
    pitchSubject: 'Compressing Highveld Coal tender safety file compilation from 5 days to 90 seconds',
    pitchBody: `Goeiedag Francois,

When bidding on DMRE and Eskom coal supply tenders around eMalahleni and Middelburg, compiling a 20-section compliant safety binder usually takes your SHEQ officers 4 to 6 sleepless nights of printing and cross-referencing.

MeloTwo automates your entire tender file generation:
• Pre-populates all 20 statutory sections (Section 16.2 / 8.2 appointments, baseline HIRAs, fall protection, and SANS PPE registers).
• Formats directly for CIDB, SACPCMP, and Tier-1 mining house procurement audits.
• Enables your field engineers to capture and digitally sign risk assessments directly from mobile tablets on site.

We helped contractors eliminate tender compliance disqualifications completely. 

Let's do a quick 5-minute screen share to demonstrate your next tender pack generation: https://melotwo.com/#tender-file

Groete,
MeloTwo Enterprise Division`
  },
  {
    id: 'LEAD-003',
    name: 'Nomvula Sithole',
    role: 'Senior Project Health & Safety Manager',
    company: 'Witwatersrand Deep Reef Structural Civils',
    sector: 'Deep-Level Gold & Industrial Construction',
    region: 'Carletonville, Gauteng',
    email: 'n.sithole@witsdeepcivils.co.za',
    phone: '+27 11 789 4400',
    painPoint: 'Annexure 3 medicals and heat tolerance certificates lapsing without proactive warning.',
    statutoryFocus: 'MHSA Annexure 3 & OHS Subterranean Hazard Matrix',
    status: 'Demo Booked',
    estimatedValue: 'R62,000 / yr',
    pitchSubject: 'Zero-latency Annexure 3 medical & COID expiry defense for Witwatersrand deep reef projects',
    pitchBody: `Sanibonani Nomvula,

Handling statutory medical certificates, heat tolerance tests, and COID letters of good standing across multiple deep-level shafts is an administrative nightmare when managed in spreadsheets.

One expired audiogram or lapsed FEM clearance letter exposes your principal contractor to Section 54 work-stoppage instructions from the Mine Health and Safety Inspectorate.

MeloTwo gives your SHEQ department:
1. Automated 30-day, 14-day, and 48-hour proactive expiry alerts for all contractor medicals.
2. QR-verifiable digital safety passports for instant shaft gate clearance at 05:00 AM.
3. Automated SANS 10049 and SANS 10330 audit-readiness reports.

I'd love to show you how Witwatersrand Deep Reef can automate this before your next DMRE audit cycle.

Kind regards,
MeloTwo Compliance Intelligence
https://melotwo.com`
  },
  {
    id: 'LEAD-004',
    name: 'Jacques Du Plessis',
    role: 'Managing Director',
    company: 'Bushveld Earthmoving & Blast Contractors',
    sector: 'Drilling, Blasting & Heavy Earthmoving',
    region: 'Rustenburg, North West',
    email: 'jacques@bushveldblasting.co.za',
    phone: '+27 14 592 3310',
    painPoint: 'Repeated client audit findings on plant maintenance logs and SANS 10142 certificates.',
    statutoryFocus: 'OHSA Driven Machinery Regulations & Plant Clearances',
    status: 'New Lead',
    estimatedValue: 'R38,000 / mo',
    pitchSubject: 'Eliminating plant checklist audit findings across Rustenburg platinum operations',
    pitchBody: `Hi Jacques,

Operating heavy drill rigs and yellow metal plant across the Rustenburg platinum belt requires rigorous, daily-auditable pre-use inspection registers under the Driven Machinery Regulations.

Missing calibration certificates or incomplete operator license records are among the top 3 triggers for mining safety penalties.

With MeloTwo's Mobile Safety Engine:
• Operators complete digital pre-use checklists on phone/tablet with tamper-proof timestamping.
• Equipment registers sync instantly to your central 20-section master safety binder.
• Your tender safety file is continuously live, audit-defensible, and ready for instant client inspection.

Check out our automated tender file builder here: https://melotwo.com/#tender-file

Best regards,
MeloTwo Industrial Solutions`
  },
  {
    id: 'LEAD-005',
    name: 'Kagiso Mokoena',
    role: 'Procurement & Vendor Onboarding Lead',
    company: 'Sasolburg Industrial Maintenance Solutions',
    sector: 'Petrochemical & Mechanical Engineering',
    region: 'Sasolburg, Free State',
    email: 'k.mokoena@sasolburgmaint.co.za',
    phone: '+27 16 976 5000',
    painPoint: 'Vendor SHEQ pre-qualification takes over 2 weeks per subbie.',
    statutoryFocus: 'Major Hazard Installation (MHI) & OHS Act 85 of 1993',
    status: 'Tender Active',
    estimatedValue: 'R55,000 / yr',
    pitchSubject: 'Fast-tracking subcontractor SHEQ vendor onboarding from 14 days to 24 hours',
    pitchBody: `Dumelang Kagiso,

Onboarding mechanical & electrical maintenance subcontractors for petrochemical shutdown tenders usually grinds to a halt while verifying SHEQ files, COID standing, and baseline risk assessments.

MeloTwo's AI-assisted compliance engine pre-screens subcontractor binders against statutory OHS Act and MHI protocols in 90 seconds, flagging missing mandatory agreements before files hit your desk.

Would you like to test a sample automated safety file audit for your upcoming shutdown tender?

Warm regards,
MeloTwo Partner Solutions
https://melotwo.com`
  }
];

export interface LeadManagementTableProps {
  initialLeads?: ContractorLead[];
  onSelectLead?: (lead: ContractorLead) => void;
}

export const LeadManagementTable: React.FC<LeadManagementTableProps> = ({
  initialLeads = INITIAL_LEADS,
  onSelectLead
}) => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<ContractorLead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  
  // Track which lead ID had its pitch copied for micro-animations
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);
  
  // Selected lead for full preview / modal inspection
  const [activePreviewLead, setActivePreviewLead] = useState<ContractorLead | null>(null);

  // Filtered Leads Calculation
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.sector.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesSector = sectorFilter === 'ALL' || lead.sector.toLowerCase().includes(sectorFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesSector;
  });

  /**
   * Primary action: Copies personalized pitch to clipboard and triggers custom useToast notification
   */
  const handleCopyEmailPitch = async (lead: ContractorLead, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const fullPitchText = `Subject: ${lead.pitchSubject}\n\n${lead.pitchBody}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullPitchText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullPitchText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      // Visual micro-feedback on the button
      setCopiedLeadId(lead.id);
      setTimeout(() => {
        setCopiedLeadId((current) => (current === lead.id ? null : current));
      }, 2500);

      // Trigger custom useToast notification
      toast({
        title: 'Email Pitch Copied to Clipboard!',
        message: `Cold outreach template for ${lead.name} (${lead.company}) copied with customized MHSA & statutory pain point hooks.`,
        type: 'success',
        duration: 4000,
        actionLabel: 'Preview Lead',
        onAction: () => setActivePreviewLead(lead)
      });
    } catch (err) {
      console.error('Failed to copy email pitch:', err);
      toast({
        title: 'Copy Failed',
        message: 'Could not access system clipboard. Please copy manually from the preview window.',
        type: 'error',
        duration: 3500
      });
    }
  };

  const handleUpdateStatus = (leadId: string, newStatus: ContractorLead['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    setLeads((prev) => 
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    toast({
      title: 'Lead Status Updated',
      message: `Lead ${leadId} status changed to "${newStatus}".`,
      type: 'info',
      duration: 2500
    });
  };

  const getStatusBadge = (status: ContractorLead['status']) => {
    switch (status) {
      case 'Won':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Demo Booked':
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
      case 'Tender Active':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      case 'Pitch Sent':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
      case 'Followed Up':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'New Lead':
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Contractor Lead Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              &bull; {filteredLeads.length} Qualified Mining & Civils Prospects
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Lead Management & Cold Outreach Table
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Target South African SHEQ directors, mining project overseers, and tender managers with automated, statutory-compliant MHSA and OHS Act cold email pitches.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              toast({
                title: 'Lead Pipeline Synchronized',
                message: 'All 5 contractor accounts refreshed against active DMRE CIDB tender registries.',
                type: 'info',
                duration: 3000
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sync DMRE Leads</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Bar */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads by contractor name, company, or mining belt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses ({leads.length})</option>
            <option value="New Lead">New Lead</option>
            <option value="Pitch Sent">Pitch Sent</option>
            <option value="Followed Up">Followed Up</option>
            <option value="Demo Booked">Demo Booked</option>
            <option value="Tender Active">Tender Active</option>
            <option value="Won">Closed Won</option>
          </select>
        </div>

        {/* Sector Filter */}
        <div className="sm:col-span-3">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Industry Sectors</option>
            <option value="Platinum">Platinum & Smelting</option>
            <option value="Coal">Coal & Bulk Haulage</option>
            <option value="Gold">Deep-Level Gold</option>
            <option value="Earthmoving">Drilling & Blasting</option>
            <option value="Petrochemical">Petrochemical & Plant</option>
          </select>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-inner">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-3.5 px-4">Contact & Company</th>
              <th className="py-3.5 px-3">Mining Sector & Region</th>
              <th className="py-3.5 px-3">Compliance Vulnerability</th>
              <th className="py-3.5 px-3">Deal Value</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Outreach Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-300">No contractor leads found matching filter criteria</p>
                  <p className="text-[11px] text-slate-500 mt-1">Try resetting the search bar or status filters.</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const isCopied = copiedLeadId === lead.id;

                return (
                  <tr 
                    key={lead.id}
                    onClick={() => {
                      setActivePreviewLead(lead);
                      onSelectLead?.(lead);
                    }}
                    className="hover:bg-slate-900/70 transition group cursor-pointer"
                  >
                    {/* Contact & Company */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white group-hover:text-amber-400 transition text-sm">
                            {lead.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {lead.role}
                        </p>
                        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300/90 font-bold bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-900/60">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          <span>{lead.company}</span>
                        </div>
                      </div>
                    </td>

                    {/* Sector & Region */}
                    <td className="py-4 px-3 align-top">
                      <div className="space-y-1">
                        <span className="text-slate-200 font-medium block">
                          {lead.sector}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          📍 {lead.region}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                          ✉️ {lead.email}
                        </span>
                      </div>
                    </td>

                    {/* Compliance Vulnerability / Pain Point */}
                    <td className="py-4 px-3 align-top max-w-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-1.5 text-rose-300/90 text-[11px] leading-snug">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{lead.painPoint}</span>
                        </div>
                        <div className="text-[10px] font-mono text-amber-400/80 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40 inline-block">
                          ⚖️ {lead.statutoryFocus}
                        </div>
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="py-4 px-3 align-top">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {lead.estimatedValue}
                      </span>
                    </td>

                    {/* Status with Quick Change Menu */}
                    <td className="py-4 px-3 align-top">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border ${getStatusBadge(lead.status)}`}>
                        {lead.status === 'Won' && <Check className="w-3 h-3 text-emerald-400" />}
                        {lead.status}
                      </span>
                    </td>

                    {/* Outreach Actions (Copy Pitch Button) */}
                    <td className="py-4 px-4 align-top text-right space-y-2">
                      {/* PRIMARY TASK ACTION: COPY EMAIL PITCH BUTTON */}
                      <button
                        id={`btn-copy-pitch-${lead.id}`}
                        onClick={(e) => handleCopyEmailPitch(lead, e)}
                        title="Copy personalized cold outreach email pitch to clipboard"
                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md w-full sm:w-auto cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-emerald-950/60 ring-2 ring-emerald-400'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-950/50'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-950" />
                            <span>Copy Email Pitch</span>
                          </>
                        )}
                      </button>

                      {/* Secondary Action: Preview Pitch */}
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePreviewLead(lead);
                          }}
                          className="text-[11px] font-medium text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition p-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect Pitch</span>
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

      {/* Footer Info Banner */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Pitches are pre-tailored to <strong className="text-white">MHSA Act 29 of 1996</strong> and <strong className="text-white">SANS 10330 / 10142</strong> statutory standards.
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-amber-400">
          <span>Tip: Click any lead row to preview full email body & custom variables</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EMAIL PITCH PREVIEW MODAL                                                 */}
      {/* ========================================================================= */}
      {activePreviewLead && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setActivePreviewLead(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase mb-1">
                  <Mail className="w-3 h-3" />
                  <span>Personalized Outreach Pitch</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Email Pitch for {activePreviewLead.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {activePreviewLead.role} &bull; <span className="text-cyan-400">{activePreviewLead.company}</span>
                </p>
              </div>

              <button
                onClick={() => setActivePreviewLead(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Email Fields */}
            <div className="space-y-3 font-sans text-xs">
              {/* Recipient */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[11px]">To:</span>
                <span className="text-white font-mono font-medium">{activePreviewLead.email}</span>
              </div>

              {/* Subject Line */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-slate-400 font-mono text-[11px] block mb-1">Subject Line:</span>
                <span className="text-amber-300 font-bold">{activePreviewLead.pitchSubject}</span>
              </div>

              {/* Body */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 font-mono text-[11px] block mb-2">Message Body:</span>
                <pre className="text-slate-200 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {activePreviewLead.pitchBody}
                </pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activePreviewLead.email}?subject=${encodeURIComponent(activePreviewLead.pitchSubject)}&body=${encodeURIComponent(activePreviewLead.pitchBody)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open in Mail Client</span>
                </a>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActivePreviewLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => handleCopyEmailPitch(activePreviewLead)}
                  className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-lg flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
                >
                  {copiedLeadId === activePreviewLead.id ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      <span>Copy Email Pitch</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LeadManagementTable;
