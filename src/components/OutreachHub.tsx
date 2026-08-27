import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Share2, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  FileSpreadsheet, 
  ShieldCheck,
  Send,
  HelpCircle,
  ExternalLink,
  DollarSign,
  Users,
  Layers
} from 'lucide-react';
import { MeloTwoLogo } from './MeloTwoLogo';
import { LeadManagementTable } from './LeadManagementTable';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

export interface OutreachHubProps {
  onBack?: () => void;
  userId?: string;
}

export const OutreachHub: React.FC<OutreachHubProps> = ({ 
  onBack,
  userId = 'BUILD10'
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'referrals' | 'earnings'>('pipeline');
  const [promoCode, setPromoCode] = useState<string>('BUILD10');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCodeCopied, setIsCodeCopied] = useState<boolean>(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    bankName: 'FNB / RMB',
    accountNumber: '',
    branchCode: '',
    notificationEmail: ''
  });
  const [payoutSaved, setPayoutSaved] = useState<boolean>(false);

  // Dynamic Origin Link Generation
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://melotwo.com';
  const referralLink = `${baseUrl}/?ref=${promoCode}`;

  // WhatsApp Pre-filled share message for South African contractors
  const whatsappShareText = encodeURIComponent(
    `Hi! If you need a fully compliant 20-Section Mining & Industrial Tender Safety File (SANS 10330, SANS 10142, & OHSA compliant), check out MeloTwo.\n\nUse my code *${promoCode}* for priority sign-off & fast-track review:\n${referralLink}`
  );
  const whatsappShareUrl = `https://wa.me/?text=${whatsappShareText}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = referralLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);

      toast({
        title: 'Referral Link Copied!',
        message: 'Share this direct tracking link with mining peers and subcontractors.',
        type: 'success',
        duration: 3500
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(promoCode);
      }
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2500);

      toast({
        title: 'Promo Code Copied!',
        message: `Code "${promoCode}" copied to clipboard.`,
        type: 'success',
        duration: 3000
      });
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Recent Referral Activity Data (South African Industrial context)
  const recentReferrals = [
    {
      id: 'REF-8041',
      client: 'Witwatersrand Deep Reef Civils',
      item: '20-Section Tender Safety File (R750)',
      payout: 'R100.00',
      status: 'Paid',
      date: '14 Aug 2026'
    },
    {
      id: 'REF-7920',
      client: 'Polokwane Shaft Logistics Ltd',
      item: 'Site Pack (SANS 10330 + SANS 10142)',
      payout: 'R650.00',
      status: 'Paid',
      date: '08 Aug 2026'
    },
    {
      id: 'REF-8109',
      client: 'Rustenburg Core Drilling Contractors',
      item: '20-Section Tender Safety File (R750)',
      payout: 'R100.00',
      status: 'Pending',
      date: '17 Aug 2026'
    },
    {
      id: 'REF-8114',
      client: 'Middelburg Coal Heavy Haulage',
      item: 'Annual Multi-Shaft Compliance Pack',
      payout: 'R1,100.00',
      status: 'Pending',
      date: '18 Aug 2026'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* Top Header Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
                aria-label="Return to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            )}
            
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                MeloTwo Partner & Referral Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>EFT Banking Settings</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* Page Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct Contractor Referral Program</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                MeloTwo Partner & Referral Hub
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Empower your network of mining contractors, SHEQ officers, and industrial suppliers with instant 20-Section Tender Safety Files. Earn instant cash rewards deposited directly via EFT for every file and site pack processed.
              </p>
            </div>

            <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-2 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Payout Frequency</span>
              <span className="text-sm font-black text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Weekly Direct EFT
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lead Pipeline & Cold Pitches</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === 'pipeline' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-400'}`}>
              5
            </span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'referrals'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Referral Links & Code</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Earnings & Payout Ledger</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              R3,400
            </span>
          </button>
        </div>

        {/* TAB 1: LEAD PIPELINE (LEAD MANAGEMENT TABLE) */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <LeadManagementTable />
          </div>
        )}

        {/* TAB 2: REFERRAL CODE & SHARE LINKS */}
        {(activeTab === 'referrals' || activeTab === 'pipeline') && (
          <div className={`space-y-6 ${activeTab === 'pipeline' ? 'pt-4 border-t border-slate-800/80' : ''}`}>
            {/* SECTION 1: REFERRAL CODE & SHARE LINK GENERATOR (TOP CARD) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    SHARE & INVITE CONTRACTORS
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                    Your Unique Referral Code & Link
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  Share with mining peers, subcontractors, and tenders leads
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Promo Code Box */}
                <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Your Promo Code
                    </label>
                    <div className="flex items-center justify-between bg-slate-900 border border-amber-500/40 rounded-xl px-4 py-3">
                      <span className="font-mono text-xl font-black text-amber-400 tracking-wider">
                        {promoCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Copy Promo Code"
                      >
                        {isCodeCopied ? (
                          <span className="text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Contractors entering this promo code during tender file setup are automatically credited to your payout balance.
                  </p>
                </div>

                {/* Tracking Link & Share Actions */}
                <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Your Direct Share Link
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                      <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="bg-transparent border-none px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none flex-grow"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                          isCopied 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Referral Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/60 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share on WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Automatic cookie & session attribution (60 days)</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: EARNINGS & PAYOUT SUMMARY */}
        {(activeTab === 'earnings' || activeTab === 'pipeline') && (
          <div className="space-y-6">
            {/* SECTION 2: EARNINGS & PAYOUT SUMMARY (KPI GRID) */}
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    PERFORMANCE & BALANCE
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                    Earnings & Payout Summary
                  </h2>
                </div>

                <span className="text-xs font-mono text-slate-400">
                  Currency: South African Rand (ZAR)
                </span>
              </div>

              {/* 3 Clean KPI Cards Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* KPI 1: Total Earnings */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                      Total Earnings (ZAR)
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    R3,400<span className="text-xs text-slate-400 font-normal">.00</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Cumulative revenue across all referrals
                  </p>
                </div>

                {/* KPI 2: Pending Payouts */}
                <div className="bg-slate-900 border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/20 rounded-2xl p-6 relative overflow-hidden shadow-lg hover:border-amber-500/50 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                      Pending Payouts (ZAR)
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                    R1,200<span className="text-xs text-amber-300/70 font-normal">.00</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Scheduled for next weekly EFT batch
                  </p>
                </div>

                {/* KPI 3: Total Paid Out */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                      Total Paid Out (ZAR)
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    R2,200<span className="text-xs text-emerald-300/70 font-normal">.00</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Successfully cleared to your bank account
                  </p>
                </div>

              </div>

              {/* Explicit Helper Note on Payout Rules */}
              <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-slate-300">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-white uppercase text-[11px] font-mono tracking-wide block">
                    Standard Payout Rules
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    <strong className="text-amber-400">R100 instant cash</strong> per standard R750 Tender File &bull; <strong className="text-cyan-300">10%–15%</strong> on custom multi-site & enterprise safety packs. Payouts are reconciled and released directly to your verified South African bank account every Friday.
                  </p>
                </div>
              </div>

            </div>

            {/* RECENT REFERRAL ACTIVITY TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Referral Activity</h3>
                  <p className="text-xs text-slate-400">Real-time breakdown of contractor registrations and orders</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  Auto-Track Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                      <th className="py-3 px-3">Reference ID</th>
                      <th className="py-3 px-3">Contractor / Mine Client</th>
                      <th className="py-3 px-3">Service Ordered</th>
                      <th className="py-3 px-3">Your Reward</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {recentReferrals.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3 font-mono text-slate-300 font-bold">{item.id}</td>
                        <td className="py-3 px-3 text-white font-medium">{item.client}</td>
                        <td className="py-3 px-3 text-slate-300">{item.item}</td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">{item.payout}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{item.date}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            item.status === 'Paid'
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                          }`}>
                            {item.status === 'Paid' ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-400" />
                            )}
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* EFT Banking Details Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">EFT Bank Account Details</h3>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter the bank account where you would like your weekly MeloTwo referral rewards deposited.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              setPayoutSaved(true);
              setTimeout(() => {
                setPayoutSaved(false);
                setIsPayoutModalOpen(false);
              }, 1200);
            }} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T. Seroka"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Bank Name</label>
                  <select
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="FNB / RMB">First National Bank (FNB)</option>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="Absa Bank">Absa Bank</option>
                    <option value="Nedbank">Nedbank</option>
                    <option value="Capitec Bank">Capitec Bank</option>
                    <option value="Investec">Investec</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 62891029381"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Proof of Payment Email</label>
                <input
                  type="email"
                  placeholder="e.g. yourname@domain.co.za"
                  value={bankDetails.notificationEmail}
                  onChange={(e) => setBankDetails({ ...bankDetails, notificationEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  {payoutSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Bank Details Saved!</span>
                    </>
                  ) : (
                    <span>Save Bank Details</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer position="bottom-right" />

    </div>
  );
};
