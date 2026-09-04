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
              <stop offset="0%" stopColor="#24324a" />
              <stop offset="50%" stopColor="#151e2e" />
              <stop offset="100%" stopColor="#080c14" />
            </linearGradient>
            <linearGradient id="m2GoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="m2CyanRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="m2Num2Gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* 1. Outer Wide Shield with Heavy Safety Gold Bevel */}
          <path
            d="M32 4.5 L57.5 12.8 C57.5 32 46.5 49 32 60 C17.5 49 6.5 32 6.5 12.8 Z"
            fill="url(#m2ShieldBg)"
            stroke="url(#m2GoldBorder)"
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 2. High-Tech Cyan Precision Accent (Inner Rim) */}
          <path
            d="M32 9.5 L52.5 16.2 C52.5 31.5 43.5 44.8 32 54 C20.5 44.8 11.5 31.5 11.5 16.2 Z"
            fill="none"
            stroke="url(#m2CyanRim)"
            strokeWidth="1.3"
            strokeOpacity="0.85"
          />

          {/* 3. Bold Industrial "M" (White, widened, authoritative) */}
          <path
            d="M16.5 41 L16.5 22 L21.2 22 L25.5 32 L29.8 22 L34.5 22 L34.5 41 L30.2 41 L30.2 28.5 L27 36 L24 36 L20.8 28.5 L20.8 41 Z"
            fill="#ffffff"
          />

          {/* 4. Bold Industrial "2" (Safety Amber/Gold, perfectly balanced) */}
          <path
            d="M37.5 25.8 C37.5 23.2 39.5 21.2 42.8 21.2 C46 21.2 48 23.2 48 25.6 C48 27.6 46.8 29.5 44 32 L39.8 36 L48.2 36 L48.2 40.2 L37.2 40.2 L37.2 37.2 L42.5 32.2 C44.2 30.6 44.8 29.4 44.8 28.2 C44.8 26.8 43.8 25.8 42.5 25.8 C41.2 25.8 40.4 26.6 40.3 27.8 Z"
            fill="url(#m2Num2Gold)"
          />

          {/* 5. Bottom Statutory Seal / Mechanical Crosshair (Gold rivet) */}
          <circle cx="32" cy="46.8" r="3.2" fill="#f59e0b" stroke="#78350f" strokeWidth="0.6" />
          <path
            d="M32 44.2 L32 49.4 M29.4 46.8 L34.6 46.8"
            stroke="#0b0f19"
            strokeWidth="1.3"
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
