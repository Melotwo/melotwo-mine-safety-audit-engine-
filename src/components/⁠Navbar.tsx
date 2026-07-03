import React from 'react';
import * as Icons from './icons';
import { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  userId?: string | null;
  isAuthReady?: boolean;
  onGetStarted?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setPage,
  userId,
  isAuthReady,
  onGetStarted
}) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 text-white">
      <div className="flex justify-between items-center mx-auto max-w-7xl">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setPage('home')}>
          <Icons.Shield className="h-6 w-6 text-indigo-400" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Melotwo Safety Engine
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
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
