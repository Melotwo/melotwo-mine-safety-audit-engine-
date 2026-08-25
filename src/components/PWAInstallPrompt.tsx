import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  PlusSquare, 
  Layers, 
  Zap, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed the prompt within the last 5 days
    const dismissedTimestamp = localStorage.getItem('melotwo_pwa_prompt_dismissed');
    if (dismissedTimestamp) {
      const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTimestamp, 10) < fiveDaysMs) {
        setIsDismissed(true);
      }
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isAppleDevice);

    // Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Make sure it's accessible globally if triggered from custom buttons
      (window as unknown as { melotwoInstallPrompt?: BeforeInstallPromptEvent }).melotwoInstallPrompt = e;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallSuccess(true);
      localStorage.removeItem('melotwo_pwa_prompt_dismissed');
      setTimeout(() => setInstallSuccess(false), 6000);
    };

    // Listen for manual install requests from buttons / links (e.g. #install-app)
    const handleHashChange = () => {
      if (window.location.hash === '#install-app') {
        setIsDismissed(false);
        if (isAppleDevice) {
          setShowIOSModal(true);
        } else {
          handleInstallClick();
        }
      }
    };

    const handleCustomTrigger = () => {
      setIsDismissed(false);
      if (isAppleDevice) {
        setShowIOSModal(true);
      } else {
        handleInstallClick();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('open-pwa-install', handleCustomTrigger);

    if (window.location.hash === '#install-app') {
      handleHashChange();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('open-pwa-install', handleCustomTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    const promptEvent = deferredPrompt || (window as unknown as { melotwoInstallPrompt?: BeforeInstallPromptEvent }).melotwoInstallPrompt;
    
    if (!promptEvent) {
      // Fallback for browsers that don't support automated prompt (e.g. desktop safari/firefox)
      setShowIOSModal(true);
      return;
    }

    try {
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[MeloTwo PWA] User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('[MeloTwo PWA] User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[MeloTwo PWA] Install error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('melotwo_pwa_prompt_dismissed', Date.now().toString());
  };

  // If already running as installed app or dismissed and not actively installing, hide banner
  if (isInstalled && !installSuccess) {
    return null;
  }

  return (
    <>
      {/* Toast Confirmation on Successful App Installation */}
      {installSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm bg-emerald-950/95 border border-emerald-500/80 rounded-2xl p-4 text-white shadow-2xl backdrop-blur-md flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">MeloTwo App Installed!</h4>
            <p className="text-xs text-emerald-200">You can now access your SHEQ terminal directly from your home screen offline.</p>
          </div>
        </div>
      )}

      {/* Floating High-Converting PWA Install Banner */}
      {!isDismissed && !isInstalled && (
        <aside 
          aria-label="Install MeloTwo Progressive Web App"
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fade-in-up"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-500/60 p-4 sm:p-5 text-white shadow-2xl backdrop-blur-xl">
            
            {/* Ambient accent corner */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss install banner"
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0 mt-0.5">
                <Smartphone className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                  <Zap className="w-2.5 h-2.5" />
                  <span>Free App Install</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  📲 Install MeloTwo App — Instant Access to Free Daily SHEQ Tools
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fast 1-tap launch, offline subterranean inspection terminal & instant 20-section tender binders.
                </p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px] text-slate-200">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Offline Auditing</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>No App Store Needed</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Install MeloTwo App</span>
              </button>

              <button
                onClick={handleDismiss}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer shrink-0"
              >
                Later
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* iOS / Manual Browser Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install MeloTwo on Your Device</h3>
                <p className="text-xs text-slate-400">Add to your Home Screen in 2 simple steps:</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-slate-200">
                  Tap the <strong className="text-amber-300 font-semibold inline-flex items-center gap-1 mx-1"><Share2 className="w-3.5 h-3.5 inline" /> Share</strong> icon in your browser toolbar (bottom on iOS Safari or top right in Chrome).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-slate-200">
                  Scroll down and tap <strong className="text-amber-300 font-semibold inline-flex items-center gap-1 mx-1"><PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen</strong>, then tap <strong>Add</strong>.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Got It, Ready!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
