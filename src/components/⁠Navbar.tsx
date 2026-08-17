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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => setPage('home')}
          className="flex items-center space-x-3 cursor-pointer group"
          aria-label="Go to homepage"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Icons.Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white font-sans">
            MeloTwo
          </span>
        </button>

        <nav className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => setPage('home')}
            className={`text-sm font-bold transition-colors hover:text-amber-400 ${
              currentPage === 'home' ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setPage('solutions')}
            className={`text-sm font-bold transition-colors hover:text-amber-400 ${
              currentPage === 'solutions' ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            Solutions
          </button>
          <button
            onClick={() => setPage('inspector')}
            className={`text-sm font-bold transition-colors hover:text-amber-400 ${
              currentPage === 'inspector' ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            Auditing Terminal
          </button>
          <button
            onClick={() => setPage('handover')}
            className={`text-sm font-bold transition-colors hover:text-amber-400 ${
              currentPage === 'handover' ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            Shift Handover
          </button>
          <button
            onClick={() => setPage('academy')}
            className={`text-sm font-bold transition-colors hover:text-amber-400 ${
              currentPage === 'academy' ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            SHEQ Academy
          </button>

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
              onClick={onOpenTenderWizard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/50 hover:bg-amber-900/70 rounded-xl transition shadow-sm cursor-pointer"
            >
              <Icons.FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Tender Safety File</span>
            </button>
          )}

          {onOpenCostCalculator && (
            <button
              onClick={onOpenCostCalculator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/50 hover:bg-cyan-900/70 rounded-xl transition shadow-sm cursor-pointer"
            >
              <Icons.Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calculate Cost</span>
            </button>
          )}

          <WhatsAppChatButton variant="nav" />

          {isAuthReady && (
            <div>
              {userId ? (
                <div className="inline-flex items-center px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                  <span>ID: {userId.substring(0, 8)}</span>
                </div>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-500 transition"
                >
                  Get Started
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
