import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  FileSpreadsheet, 
  Shield, 
  Terminal, 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  ArrowRight, 
  RotateCcw, 
  Scale, 
  Layers
} from 'lucide-react';
import { Page } from '../types';
import { WhatsAppChatButton } from './WhatsAppChatButton';
import { MeloTwoLogo } from './MeloTwoLogo';
import { StatutoryFactSheet } from './StatutoryFactSheet';

export interface NavbarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  userId?: string | null;
  isAuthReady?: boolean;
  isAdmin?: boolean;
  onGetStarted?: () => void;
  onOpenCostCalculator?: () => void;
  onOpenTenderWizard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setPage,
  userId,
  isAuthReady,
  isAdmin = false,
  onGetStarted,
  onOpenCostCalculator,
  onOpenTenderWizard
}) => {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close solutions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSolutionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsSolutionsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsSolutionsOpen(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* BRAND ZONE */}
        <button 
          onClick={() => {
            setPage('home');
            if (typeof window !== 'undefined') {
              try {
                window.history.pushState(null, '', '/');
              } catch {}
            }
          }} 
          className="flex items-center space-x-3 shrink-0 cursor-pointer text-left focus:outline-none"
          aria-label="Go to MeloTwo Homepage"
        >
          <MeloTwoLogo size="md" />
          <span className="text-lg font-black tracking-tight text-white font-sans flex items-center gap-1.5">
            MeloTwo <span className="text-amber-400 font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/60 uppercase">MINE SAFETY</span>
          </span>
        </button>

        {/* 5 CORE NAV LINKS (LEFT / CENTER) */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          
          {/* 1. Dashboard */}
          <button
            onClick={() => setPage('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              currentPage === 'home'
                ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* 2. Auditing Terminal */}
          <button
            onClick={() => setPage('inspector')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              currentPage === 'inspector'
                ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auditing Terminal</span>
          </button>

          {/* 3. SHEQ Academy (With Partner Hub integrated) */}
          <button
            onClick={() => setPage('academy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              currentPage === 'academy'
                ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>SHEQ Academy</span>
          </button>

          {/* 4. Solutions Dropdown */}
          <div 
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'solutions' || currentPage === 'handover' || isSolutionsOpen
                  ? 'bg-slate-800 text-white border border-slate-700 font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-expanded={isSolutionsOpen}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Solutions</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isSolutionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isSolutionsOpen && (
              <div className="absolute left-0 mt-1 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-slate-200 animate-fade-in space-y-1">
                <button
                  onClick={() => {
                    setPage('handover');
                    setIsSolutionsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-slate-800 hover:text-white transition cursor-pointer ${
                    currentPage === 'handover' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Shift Handover Assistant</span>
                  </div>
                  <ChevronDown className="w-3 h-3 -rotate-90 text-slate-500" />
                </button>

                <div className="px-1 py-1 border-t border-slate-800/80">
                  <StatutoryFactSheet 
                    triggerLabel="OHSA Audit Matrix™" 
                    variant="popover"
                    className="w-full"
                  />
                </div>

                <button
                  onClick={() => {
                    setPage('solutions');
                    setIsSolutionsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-slate-800 hover:text-white transition cursor-pointer ${
                    currentPage === 'solutions' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Workplace Hazard Matrix</span>
                  </div>
                  <ChevronDown className="w-3 h-3 -rotate-90 text-slate-500" />
                </button>
              </div>
            )}
          </div>

          {/* 5. Blog */}
          <button
            onClick={() => {
              setPage('blog');
              if (typeof window !== 'undefined') {
                try {
                  window.history.pushState(null, '', '/blog');
                } catch {
                  window.location.hash = 'blog';
                }
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              currentPage === 'blog'
                ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Blog</span>
          </button>
        </nav>

        {/* 3 DIRECT ACTION BUTTONS (RIGHT SIDE) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Action 1: Tender Safety File (High-Contrast Amber) */}
          {onOpenTenderWizard && (
            <button
              id="build-tender-btn"
              onClick={onOpenTenderWizard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 rounded-xl transition shadow-md hover:shadow-amber-400/20 cursor-pointer uppercase tracking-wider shrink-0"
              title="Generate 20-Section Tender-Ready Safety File (R750)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-950" />
              <span>Tender Safety File</span>
            </button>
          )}

          {/* Action 2: Calculate Cost (Secondary Blue/Cyan Outline) */}
          {onOpenCostCalculator && (
            <button
              id="calculate-cost-btn"
              onClick={onOpenCostCalculator}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-900/60 hover:border-cyan-400 rounded-xl transition shadow-sm cursor-pointer shrink-0"
              title="Calculate Site Stoppage Cost & ROI"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Calculate Cost</span>
              <span className="sm:hidden">Cost</span>
            </button>
          )}

          {/* Action 3: WhatsApp Icon Button */}
          <WhatsAppChatButton variant="nav" />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2 shadow-inner">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setPage('home');
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                currentPage === 'home' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setPage('inspector');
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                currentPage === 'inspector' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Terminal</span>
            </button>

            <button
              onClick={() => {
                setPage('academy');
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                currentPage === 'academy' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>SHEQ Academy</span>
            </button>

            <button
              onClick={() => {
                setPage('blog');
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                currentPage === 'blog' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Blog / Guides</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setPage('handover');
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                currentPage === 'handover' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shift Handover</span>
            </button>

            <button
              onClick={() => {
                setPage('solutions');
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                currentPage === 'solutions' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hazard Matrix</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export { Navbar as AppNavbar };
export default Navbar;
