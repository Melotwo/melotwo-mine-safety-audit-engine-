import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  Scale, 
  Layers, 
  BookOpen, 
  FileSpreadsheet, 
  Calculator, 
  CreditCard, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  X, 
  Users, 
  RotateCcw, 
  Wrench, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { MeloTwoLogo } from './MeloTwoLogo';
import { CurrencySwitcher } from './CurrencySwitcher';
import { WhatsAppChatButton } from './WhatsAppChatButton';
import { StatutoryFactSheet } from './StatutoryFactSheet';

export type Page = 'home' | 'solutions' | 'inspector' | 'academy' | 'handover' | 'outreach' | 'blog' | 'zambia-assessment' | 'partner-copilot';

export interface AppNavbarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  userId?: string | null;
  isAuthReady?: boolean;
  isAdmin?: boolean;
  onGetStarted?: () => void;
  onOpenCostCalculator?: () => void;
  onOpenTenderWizard?: () => void;
  onOpenPaymentSettings?: () => void;
}

interface NavToolItem {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  category: 'AUDIT & INSPECTION' | 'REGIONAL & SPECIALIZED' | 'MANAGEMENT & TRAINING';
  icon: React.ReactNode;
  action: () => void;
  activeMatch: boolean;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentPage,
  setPage,
  userId,
  isAuthReady,
  isAdmin = false,
  onGetStarted,
  onOpenCostCalculator,
  onOpenTenderWizard,
  onOpenPaymentSettings
}) => {
  // Dropdown states
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const solutionsDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toolsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const solutionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(target)) {
        setIsToolsOpen(false);
      }
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(target)) {
        setIsSolutionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsToolsOpen(false);
        setIsSolutionsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus search input when Tools & Diagnostics dropdown opens
  useEffect(() => {
    if (isToolsOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isToolsOpen]);

  // Hover handlers with debounce to prevent accidental closure
  const handleToolsMouseEnter = () => {
    if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
    setIsToolsOpen(true);
  };
  const handleToolsMouseLeave = () => {
    toolsTimeoutRef.current = setTimeout(() => setIsToolsOpen(false), 200);
  };

  const handleSolutionsMouseEnter = () => {
    if (solutionsTimeoutRef.current) clearTimeout(solutionsTimeoutRef.current);
    setIsSolutionsOpen(true);
  };
  const handleSolutionsMouseLeave = () => {
    solutionsTimeoutRef.current = setTimeout(() => setIsSolutionsOpen(false), 200);
  };

  // Nav tools catalog
  const toolsCatalog: NavToolItem[] = useMemo(() => [
    {
      id: 'terminal',
      name: 'Auditing Terminal',
      badge: 'Core SANS',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Multi-standard SANS 10108 / 10142 / 10330 cognitive audit terminal.',
      category: 'AUDIT & INSPECTION',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      action: () => setPage('inspector'),
      activeMatch: currentPage === 'inspector'
    },
    {
      id: 'zambia',
      name: 'Zambia Mining Diagnostic',
      badge: '15-PT Tool',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Cross-border statutory readiness evaluation for Copperbelt operations.',
      category: 'REGIONAL & SPECIALIZED',
      icon: <Scale className="w-4 h-4 text-amber-400" />,
      action: () => {
        setPage('zambia-assessment');
        if (typeof window !== 'undefined') {
          try { window.history.pushState(null, '', '#zambia-assessment'); } catch {}
        }
      },
      activeMatch: currentPage === 'zambia-assessment'
    },
    {
      id: 'academy',
      name: 'SHEQ Academy & QCTO Drills',
      badge: 'Accredited',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Interactive competency drills and statutory safety practitioner certifications.',
      category: 'MANAGEMENT & TRAINING',
      icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
      action: () => setPage('academy'),
      activeMatch: currentPage === 'academy'
    },
    {
      id: 'cost_calculator',
      name: 'Site Stoppage Cost Calculator',
      badge: 'ROI / DMRE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Quantify Section 54 production losses and return on preventive compliance.',
      category: 'MANAGEMENT & TRAINING',
      icon: <Calculator className="w-4 h-4 text-cyan-400" />,
      action: () => {
        if (onOpenCostCalculator) onOpenCostCalculator();
      },
      activeMatch: false
    },
    {
      id: 'handover',
      name: 'Shift Handover Assistant',
      badge: 'Underground',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Digital stope & haulage handover protocol with automated hazard logging.',
      category: 'AUDIT & INSPECTION',
      icon: <RotateCcw className="w-4 h-4 text-indigo-400" />,
      action: () => setPage('handover'),
      activeMatch: currentPage === 'handover'
    },
    {
      id: 'copilot',
      name: 'Partner Co-Pilot Intelligence',
      badge: 'Lead Gov',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Executive legal review, EFT approvals, and Section 54 defense dashboard.',
      category: 'MANAGEMENT & TRAINING',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      action: () => setPage('partner-copilot'),
      activeMatch: currentPage === 'partner-copilot'
    },
    {
      id: 'hazard_matrix',
      name: 'Workplace Hazard Matrix',
      badge: 'HIRA Specs',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Dynamic risk categorization and engineering control hierarchy verification.',
      category: 'AUDIT & INSPECTION',
      icon: <Layers className="w-4 h-4 text-rose-400" />,
      action: () => setPage('solutions'),
      activeMatch: currentPage === 'solutions'
    }
  ], [currentPage, setPage, onOpenCostCalculator]);

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return toolsCatalog;
    const q = searchQuery.toLowerCase().trim();
    return toolsCatalog.filter(tool => 
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      (tool.badge && tool.badge.toLowerCase().includes(q)) ||
      tool.category.toLowerCase().includes(q)
    );
  }, [toolsCatalog, searchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full transition-all text-white font-sans shadow-lg">
      
      {/* ========================================================================= */}
      {/* TIER 1: SLIM TOP UTILITY STRIP (32px)                                      */}
      {/* Keeps secondary actions organized so the main navbar stays breathable    */}
      {/* ========================================================================= */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Status Indicator (Left) */}
          <div className="flex items-center gap-2 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300 font-semibold truncate hidden sm:inline">
              MHSA &amp; SANS Compliance Engine
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">
              SADC Cross-Border Ready (RSA &amp; Zambia)
            </span>
          </div>

          {/* Quick Utility Links (Right) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-mono">
            {/* Currency Switcher Pill (Option A) */}
            <CurrencySwitcher variant="compact" />

            {/* Direct Support & WhatsApp */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <WhatsAppChatButton variant="nav" />
            </div>

            {/* Fast Checkout CTA */}
            {onOpenPaymentSettings && (
              <button
                onClick={onOpenPaymentSettings}
                className="hidden sm:inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition text-[11px] font-bold cursor-pointer"
                title="Direct PayPal & EFT License Portal"
              >
                <CreditCard className="w-3 h-3 text-amber-400" />
                <span>Instant License Checkout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: MAIN PRIMARY NAVBAR (60px)                                        */}
      {/* Clean 3-Zone Flexbox Grid: Left Brand | Center Links | Right Key Actions  */}
      {/* ========================================================================= */}
      <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 w-full" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-4">
          
          {/* ZONE 1: BRAND LOGO (LEFT) */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                setPage('home');
                if (typeof window !== 'undefined') {
                  try { window.history.pushState(null, '', '/'); } catch {}
                }
              }}
              className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none group"
              aria-label="MeloTwo Homepage"
            >
              <MeloTwoLogo size="sm" />
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                  MeloTwo
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    MINE SAFETY
                  </span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-wider uppercase font-mono mt-0.5 hidden xs:inline">
                  Statutory SHEQ Engine
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2: PRIMARY NAVIGATION & GROUPED DROPDOWNS (CENTER) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            
            {/* 1. Dashboard Link */}
            <button
              onClick={() => setPage('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'home'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dashboard</span>
            </button>

            {/* 2. Solutions Dropdown */}
            <div 
              ref={solutionsDropdownRef}
              className="relative"
              onMouseEnter={handleSolutionsMouseEnter}
              onMouseLeave={handleSolutionsMouseLeave}
            >
              <button
                onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSolutionsOpen || currentPage === 'solutions' || currentPage === 'partner-copilot'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                aria-expanded={isSolutionsOpen}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Solutions</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isSolutionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSolutionsOpen && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <button
                    onClick={() => {
                      setPage('solutions');
                      setIsSolutionsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Hazard Matrix &amp; HIRAs</div>
                      <div className="text-[10px] text-slate-400 font-normal">SANS &amp; MHSA operational risk protocols</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPage('partner-copilot');
                      setIsSolutionsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Partner Governance Portal</div>
                      <div className="text-[10px] text-slate-400 font-normal">Executive audit review &amp; legal defense</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <div className="px-1 py-1">
                    <StatutoryFactSheet 
                      triggerLabel="OHSA Audit Matrix™ (Quick Ref)" 
                      variant="popover"
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. NEW: Grouped "Tools & Diagnostics" Dropdown with Real-Time Tool Search */}
            <div 
              ref={toolsDropdownRef}
              className="relative"
              onMouseEnter={handleToolsMouseEnter}
              onMouseLeave={handleToolsMouseLeave}
            >
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isToolsOpen || currentPage === 'inspector' || currentPage === 'zambia-assessment' || currentPage === 'academy' || currentPage === 'handover'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                aria-expanded={isToolsOpen}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Tools &amp; Diagnostics</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {toolsCatalog.length}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega-Dropdown Menu with Real-Time Search */}
              {isToolsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-[420px] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Search Header Bar */}
                  <div className="relative mb-2.5">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tools (e.g., Zambia, Terminal, 15-PT, Academy)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Results Count & Section Header */}
                  <div className="flex items-center justify-between px-1 pb-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
                    <span>Specialized Safety Tools</span>
                    <span>{filteredTools.length} Available</span>
                  </div>

                  {/* Tools List */}
                  <div className="mt-2 max-h-[340px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredTools.length > 0 ? (
                      filteredTools.map(tool => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => {
                            tool.action();
                            setIsToolsOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-start gap-3 group ${
                            tool.activeMatch
                              ? 'bg-amber-500/10 border border-amber-500/30 text-white'
                              : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5 group-hover:border-slate-700 transition">
                            {tool.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                                {tool.name}
                              </span>
                              {tool.badge && (
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${tool.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                              {tool.description}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                        <p>No tools found matching &quot;{searchQuery}&quot;</p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-amber-400 hover:underline text-[11px] font-mono cursor-pointer"
                        >
                          Clear search query
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer Tip */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                    <span>Press Esc to close</span>
                    <span className="text-amber-400/80">Instant Live Filter</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Blog Link */}
            <button
              onClick={() => {
                setPage('blog');
                if (typeof window !== 'undefined') {
                  try { window.history.pushState(null, '', '/blog'); } catch { window.location.hash = 'blog'; }
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'blog'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Blog</span>
            </button>

          </div>

          {/* ZONE 3: RIGHT UTILITY & HIGH-CONVERTING CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Primary Action CTA: Tender Safety File ("The Red File") */}
            {onOpenTenderWizard && (
              <button
                id="build-tender-btn"
                onClick={onOpenTenderWizard}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 border border-red-500 rounded-xl transition shadow-md shadow-red-950/50 hover:shadow-red-600/30 cursor-pointer uppercase tracking-wider shrink-0"
                title="Generate 20-Section Tender-Ready Safety File (The Red File)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Tender Safety File</span>
              </button>
            )}

            {/* Secondary Action CTA: Calculate Cost */}
            {onOpenCostCalculator && (
              <button
                id="calculate-cost-btn"
                onClick={onOpenCostCalculator}
                className="hidden xl:inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-900/60 hover:border-cyan-400 rounded-xl transition shadow-sm cursor-pointer shrink-0"
                title="Calculate Site Stoppage Cost & Return on Preventive Investment"
              >
                <Calculator className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Calculate Cost</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer shrink-0 transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <div className="space-y-1">
                  <span className="block w-4 h-0.5 bg-slate-300" />
                  <span className="block w-4 h-0.5 bg-slate-300" />
                  <span className="block w-4 h-0.5 bg-slate-300" />
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* TIER 3: MOBILE ACCORDION DRAWER                                           */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Search Bar for Tools */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools & diagnostics..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Primary Action Buttons on Mobile */}
          <div className="grid grid-cols-2 gap-2">
            {onOpenTenderWizard && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenTenderWizard();
                }}
                className="w-full py-2.5 px-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tender File</span>
              </button>
            )}

            {onOpenCostCalculator && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCostCalculator();
                }}
                className="w-full py-2.5 px-3 bg-cyan-950 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculate Cost</span>
              </button>
            )}
          </div>

          {/* Filtered Tools List (If Searching) */}
          {searchQuery && (
            <div className="space-y-1 max-h-48 overflow-y-auto border-t border-slate-800 pt-2">
              <span className="text-[10px] uppercase font-mono text-slate-400 block px-1">Matching Tools</span>
              {filteredTools.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    t.action();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {t.icon}
                    <span className="text-white font-bold">{t.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </button>
              ))}
            </div>
          )}

          {/* Standard Navigation Links */}
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                setPage('home');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                currentPage === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setPage('inspector');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                currentPage === 'inspector' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Auditing Terminal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setPage('zambia-assessment');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                currentPage === 'zambia-assessment' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Zambia Mining Diagnostic (15-PT)</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">15-PT</span>
            </button>

            <button
              onClick={() => {
                setPage('academy');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                currentPage === 'academy' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>SHEQ Academy</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setPage('solutions');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                currentPage === 'solutions' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Solutions &amp; Hazard Matrix</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setPage('blog');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                currentPage === 'blog' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Blog &amp; Knowledge Base</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Regional Currency & Fast Payment in Mobile Menu */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Currency:</span>
            <CurrencySwitcher variant="compact" />
          </div>

        </div>
      )}

    </header>
  );
};

export default AppNavbar;
