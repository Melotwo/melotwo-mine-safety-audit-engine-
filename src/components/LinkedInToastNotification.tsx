import React, { useEffect, useState } from 'react';
import { ExternalLink, X, CheckCircle, Bell } from 'lucide-react';

export interface LinkedInToastNotificationProps {
  showLinkedInToast: boolean;
  setShowLinkedInToast: (show: boolean) => void;
  autoDismissDuration?: number; // default 4000ms
  title?: string;
  author?: string;
  subtitle?: string;
  url?: string;
  avatarUrl?: string;
}

/**
 * LinkedInToastNotification displays social proof and thought-leadership alerts.
 * Implements a strict 4-second auto-dismiss cleanup with useEffect so the overlay
 * never gets stuck on mobile or iPad viewport orientations.
 */
export const LinkedInToastNotification: React.FC<LinkedInToastNotificationProps> = ({
  showLinkedInToast,
  setShowLinkedInToast,
  autoDismissDuration = 4000,
  title = 'Published 2026 SANS 10330 Mine Compliance Protocol Blueprint',
  author = 'Tumi Seroka (Lead SHEQ Auditor)',
  subtitle = 'View full case study and audit methodology on LinkedIn',
  url = 'https://www.linkedin.com/in/tumiseroka/',
  avatarUrl
}) => {
  const [progress, setProgress] = useState(100);

  // 4-Second Auto-Dismiss Cleanup using useEffect as specified in requirements
  useEffect(() => {
    if (showLinkedInToast) {
      const timer = setTimeout(() => {
        setShowLinkedInToast(false);
      }, autoDismissDuration);

      return () => clearTimeout(timer);
    }
  }, [showLinkedInToast, setShowLinkedInToast, autoDismissDuration]);

  // Subtle progress bar animation
  useEffect(() => {
    if (!showLinkedInToast) {
      setProgress(100);
      return;
    }

    const interval = 50;
    const step = (interval / autoDismissDuration) * 100;
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, interval);

    return () => clearInterval(progressTimer);
  }, [showLinkedInToast, autoDismissDuration]);

  if (!showLinkedInToast) return null;

  return (
    <aside 
      aria-label="LinkedIn activity alert"
      id="linkedin-notification-toast"
      className="fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)] sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100"
    >
      {/* 4-second Progress Indicator Line */}
      <div className="w-full bg-slate-800 h-1">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* LinkedIn Icon / Avatar */}
        <div className="relative shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            <svg 
              className="w-5 h-5 fill-current text-blue-400" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.63-.73 1.63-1.64c0-.9-.72-1.63-1.63-1.63Z" />
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
              LinkedIn Update
            </span>
            <span className="text-[9px] text-slate-400">• Just now</span>
          </div>

          <h4 className="text-xs font-bold text-white leading-tight truncate">
            {author}
          </h4>

          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
            {title}
          </p>

          <div className="mt-2 flex items-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowLinkedInToast(false)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Read on LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[10px] text-slate-400 font-mono">Auto-dismissing...</span>
          </div>
        </div>

        {/* Manual Dismiss Button */}
        <button
          type="button"
          onClick={() => setShowLinkedInToast(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
