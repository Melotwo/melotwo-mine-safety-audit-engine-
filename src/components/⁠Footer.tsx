import React from 'react';
import { APP_NAME } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-8 mt-auto text-slate-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs">
        <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="mt-2 md:mt-0 text-slate-600 font-mono">
          POPIA Compliant • SANS 10286 Standard • Melotwo Mining Safety
        </p>
      </div>
    </footer>
  );
};
