import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Globe } from 'lucide-react';

interface CurrencySwitcherProps {
  variant?: 'navbar' | 'footer' | 'pill' | 'compact';
  className?: string;
  showAutoDetectLabel?: boolean;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  variant = 'navbar',
  className = '',
  showAutoDetectLabel = false
}) => {
  const { currency, setCurrency, isAutoDetected, countryCode } = useCurrency();

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono ${className}`}>
        <button
          type="button"
          onClick={() => setCurrency('ZAR')}
          className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
            currency === 'ZAR'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="South African Rand (ZAR R)"
          aria-label="Switch to South African Rand"
        >
          ZAR R
        </button>
        <span className="text-slate-600">|</span>
        <button
          type="button"
          onClick={() => setCurrency('USD')}
          className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
            currency === 'USD'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="United States Dollar (USD $)"
          aria-label="Switch to US Dollar"
        >
          USD $
        </button>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex flex-col sm:flex-row items-center gap-2 text-xs text-slate-400 font-sans ${className}`}>
        <div className="flex items-center gap-1.5 font-mono">
          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Regional Currency:</span>
        </div>
        <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 font-mono text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setCurrency('ZAR')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
              currency === 'ZAR'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            aria-label="Set currency to South African Rand"
          >
            <span>🇿🇦 ZAR</span>
            <span className="font-sans font-bold">R</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
              currency === 'USD'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            aria-label="Set currency to US Dollar"
          >
            <span>🌐 USD</span>
            <span className="font-sans font-bold">$</span>
          </button>
        </div>
        {isAutoDetected && (
          <span className="text-[10px] text-slate-500 font-mono">
            Auto-detected for {countryCode === 'ZM' ? 'Zambia' : countryCode}
          </span>
        )}
      </div>
    );
  }

  // Default navbar variant
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="inline-flex items-center bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-1 font-mono text-xs shadow-sm transition">
        <button
          type="button"
          onClick={() => setCurrency('ZAR')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
            currency === 'ZAR'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="South African Rand (ZAR R)"
          aria-label="Switch to South African Rand"
        >
          <span>🇿🇦 ZAR</span>
          <span className="opacity-75 font-sans">R</span>
        </button>

        <span className="text-slate-700 select-none">|</span>

        <button
          type="button"
          onClick={() => setCurrency('USD')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
            currency === 'USD'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="US Dollar (USD $) - Default for Zambia & Cross-Border"
          aria-label="Switch to US Dollar"
        >
          <span>{countryCode === 'ZM' ? '🇿🇲' : '🌐'} USD</span>
          <span className="opacity-75 font-sans">$</span>
        </button>
      </div>

      {showAutoDetectLabel && isAutoDetected && (
        <span className="hidden lg:inline-block text-[10px] text-amber-400/90 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          Auto: {countryCode}
        </span>
      )}
    </div>
  );
};

export default CurrencySwitcher;
