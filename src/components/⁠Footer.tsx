import React from 'react';
import { ExternalLink, HardHat } from 'lucide-react';

export const Footer: React.FC = () => {
  // Replace the href string with your actual Mine Africa affiliate link
  const mineAfricaAffiliateUrl = "https://www.mineafricasafetysolutions.co.za/?your-affiliate-id";

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="text-sm">
          &copy; {new Date().getFullYear()} <span className="text-slate-200 font-semibold">Melotwo AI</span>. All rights reserved. Mine Safety & Compliance Engine.
        </div>

        {/* Affiliate Link Callout */}
        <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-3 max-w-md">
          <HardHat className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-200 font-medium block">Need certified PPE & Safety Shoes?</span>
            <a 
              href={mineAfricaAffiliateUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-semibold transition-colors mt-0.5"
            >
              Shop Mine Africa Safety Solutions <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
