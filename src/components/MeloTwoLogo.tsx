import React from 'react';

interface MeloTwoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const MeloTwoLogo: React.FC<MeloTwoLogoProps> = ({
  className = '',
  size = 'md',
  showText = false
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 drop-shadow-md`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="MeloTwo Shield Logo"
        >
          <defs>
            <linearGradient id="m2ShieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0b0f19" />
            </linearGradient>
            <linearGradient id="m2GoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="m2CyanRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          <path
            d="M32 4 L54 12 C54 36 43 52 32 60 C21 52 10 36 10 12 Z"
            fill="url(#m2ShieldBg)"
            stroke="url(#m2GoldBorder)"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          <path
            d="M32 9.5 L49 15.5 C49 33.5 40 46.5 32 53 C24 46.5 15 33.5 15 15.5 Z"
            fill="none"
            stroke="url(#m2CyanRim)"
            strokeWidth="1.4"
            strokeOpacity="0.7"
          />

          <path
            d="M22 41 L22 23 L26.5 23 L29.5 32.5 L32.5 23 L37 23 L37 41 L33 41 L33 30 L30.5 37.5 L28.5 37.5 L26 30 L26 41 Z"
            fill="#ffffff"
          />

          <path
            d="M39 23 C39 21.3 40.5 20.2 42.5 20.2 C44.5 20.2 46 21.3 46 23 C46 24.6 44.4 26.2 42 28.2 L39 31 L46 31 L46 33.2 L39 33.2 L39 30.6 L43 26.6 C44.2 25.4 44.7 24.4 44.7 23.4 C44.7 22.4 43.7 21.8 42.5 21.8 C41.3 21.8 40.4 22.4 40.4 23.4 Z"
            fill="#fbbf24"
          />

          <circle cx="32" cy="46" r="3.2" fill="#f59e0b" />
          <path
            d="M32 43.8 L32 48.2 M29.8 46 L34.2 46"
            stroke="#0b0f19"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-white font-sans">
              Melo<span className="text-amber-400">Two</span>
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
              MINE SAFETY
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 -mt-0.5">
            SANS 10330 / MHSA COMPLIANCE
          </span>
        </div>
      )}
    </div>
  );
};
