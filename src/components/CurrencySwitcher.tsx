import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SupportedCurrency } from '../types/currency';

interface CurrencySwitcherProps {
  variant?: 'navbar' | 'footer' | 'pill' | 'compact' | 'dropdown';
  className?: string;
  showAutoDetectLabel?: boolean;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  variant = 'navbar',
  className = '',
  showAutoDetectLabel = false
}) => {
  const { currency, setCurrency, symbol, isAutoDetected, countryCode, allCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (c: SupportedCurrency) => {
    setCurrency(c);
    setIsOpen(false);
  };

  // Compact variant (used in top utility strip & mobile navbar)
  if (variant === 'compact') {
    return (
      <div 
        className={`inline-flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono shadow-sm ${className}`}
        role="group"
        aria-label="Currency Switcher"
      >
        {allCurrencies.map((c) => {
          const isActive = currency === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(c.code);
              }}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold flex items-center gap-1 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm ring-1 ring-amber-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={`${c.name} (${c.code} ${c.symbol})`}
              aria-label={`Switch currency to ${c.name} (${c.code})`}
              aria-pressed={isActive}
            >
              <span>{c.flag}</span>
              <span className="font-mono">{c.symbol}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Footer variant
  if (variant === 'footer') {
    return (
      <div className={`flex flex-col sm:flex-row items-center gap-2 text-xs text-slate-400 font-sans ${className}`}>
        <div className="flex items-center gap-1.5 font-mono">
          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Regional Currency:</span>
        </div>
        <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 font-mono text-xs shadow-inner">
          {allCurrencies.map((c) => {
            const isActive = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(c.code);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                aria-label={`Set currency to ${c.name}`}
                aria-pressed={isActive}
              >
                <span>{c.flag} {c.code}</span>
                <span className="font-sans font-bold">({c.symbol})</span>
              </button>
            );
          })}
        </div>
        {isAutoDetected && (
          <span className="text-[10px] text-slate-500 font-mono">
            Auto-detected for {countryCode === 'ZM' ? 'Zambia' : countryCode}
          </span>
        )}
      </div>
    );
  }

  // Dropdown / Pill Variant with interactive menu
  if (variant === 'dropdown') {
    const active = allCurrencies.find(c => c.code === currency) || allCurrencies[0];
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-xs font-mono text-white shadow-sm transition cursor-pointer"
          aria-expanded={isOpen}
          aria-label="Currency Selector"
        >
          <span>{active.flag}</span>
          <span className="font-bold text-amber-400">{active.code}</span>
          <span className="text-slate-400 font-sans">({active.symbol})</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-fade-in font-mono text-xs">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
              Select Currency
            </div>
            {allCurrencies.map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition cursor-pointer ${
                    isSelected ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                    <span className="text-slate-400 text-[11px] font-sans">({c.symbol})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default navbar variant (Full segmented pills)
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="inline-flex items-center bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-1 font-mono text-xs shadow-sm transition">
        {allCurrencies.map((c, index) => {
          const isActive = currency === c.code;
          return (
            <React.Fragment key={c.code}>
              {index > 0 && <span className="text-slate-700 select-none px-0.5">|</span>}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(c.code);
                }}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={`${c.name} (${c.code} ${c.symbol})`}
                aria-label={`Switch to ${c.name}`}
                aria-pressed={isActive}
              >
                <span>{c.flag}</span>
                <span>{c.code}</span>
                <span className="opacity-75 font-sans">{c.symbol}</span>
              </button>
            </React.Fragment>
          );
        })}
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

