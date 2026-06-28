import React from 'react';
import { Shield, Settings, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            <span className="font-extrabold text-xl tracking-tight">
              Melotwo AI Safety
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#" className="hover:text-amber-500 transition-colors flex items-center gap-1">
              <Activity className="h-4 w-4" /> Dashboard
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">SANS Compliance</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Audit History</a>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
