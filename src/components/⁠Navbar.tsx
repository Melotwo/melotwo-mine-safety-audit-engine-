import React from 'react';
import * as Icons from './icons';
import { Page } from '../types';
import { WhatsAppChatButton } from './WhatsAppChatButton';

interface NavbarProps {
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
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 text-white">
      <div className="flex justify-between items-center mx-auto max-w-7xl">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setPage('home')}>
          <img
            src="/apple-touch-icon.png"
            alt="MeloTwo Logo"
            className="w-8 h-8 rounded-lg object-cover shadow-sm ring-1 ring-cyan-500/30"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/melotwo_shield_logo.svg';
            }}
          />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Melotwo Safety Engine
          </span>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-6">
          <button
            onClick={() => setPage('home')}
            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
              currentPage === 'home' ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setPage('solutions')}
            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
              currentPage === 'solutions' ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            Solutions
          </button>
          <button
            onClick={() => setPage('inspector')}
            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
              currentPage === 'inspector' ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            Inspector
          </button>
          <button
            onClick={() => setPage('handover')}
            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
              currentPage === 'handover' ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            Shift Handover
          </button>
          <button
            onClick={() => setPage('academy')}
            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
              currentPage === 'academy' ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            SHEQ Academy
          </button>
          <a
            href="#savings-calculator"
            onClick={() => {
              if (currentPage !== 'home') setPage('home');
            }}
            className="text-xs md:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
          >
            <Icons.Calculator className="w-3.5 h-3.5" />
            <span>ROI Calculator</span>
          </a>

          {/* Protected Admin Route Link - Only visible when isAdmin is active */}
          {isAdmin && (
            <button
              onClick={() => setPage('outreach')}
              className={`text-xs font-bold transition-colors hover:text-amber-400 flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-950/40 ${
                currentPage === 'outreach' ? 'text-amber-400 border-amber-400' : 'text-amber-300'
              }`}
            >
              <Icons.Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin: Klaviyo</span>
            </button>
          )}

          {onOpenTenderWizard && (
            <button
              id="build-tender-btn"
              onClick={onOpenTenderWizard}
              className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Generate Tender-Ready Safety File (Once-off R750)"
            >
              <Icons.FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Tender Safety File</span>
            </button>
          )}

          {onOpenCostCalculator && (
            <button
              id="calculate-cost-btn"
              onClick={onOpenCostCalculator}
              className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Calculate Site Cost for SMBs or Enterprise"
            >
              <Icons.Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calculate Cost</span>
            </button>
          )}

          <WhatsAppChatButton variant="nav" />

          {isAuthReady && (
            <div>
              {userId ? (
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-mono text-slate-400">Compliant</span>
                </div>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs px-4 py-2 transition-all duration-200"
                >
                  Get Started
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

