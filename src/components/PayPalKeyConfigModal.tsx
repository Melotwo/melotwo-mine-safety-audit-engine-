import React, { useState, useEffect } from 'react';
import { 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Clipboard, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  ExternalLink,
  Lock,
  DollarSign
} from 'lucide-react';
import { getStoredPayPalConfig, saveStoredPayPalConfig } from '../services/paymentService';
import { PayPalConfig } from '../types';

interface PayPalKeyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: PayPalConfig) => void;
}

export const PayPalKeyConfigModal: React.FC<PayPalKeyConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [mode, setMode] = useState<'sandbox' | 'live'>('sandbox');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredPayPalConfig();
      setClientId(current.clientId || '');
      setMode(current.mode || 'sandbox');
      setCurrency(current.currency || 'USD');
      setSavedSuccess(false);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      setIsPasting(true);
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const clean = text.trim();
        setClientId(clean);
        setStatusMessage('PayPal key successfully pasted from clipboard!');
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage('Clipboard appears to be empty. Please paste your key manually into the box.');
      }
    } catch (err) {
      setStatusMessage('Clipboard access denied. Please click into the field and press Ctrl+V (or Cmd+V).');
    } finally {
      setIsPasting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim()) {
      setStatusMessage('Please enter or paste your PayPal Client ID.');
      return;
    }

    const updated = saveStoredPayPalConfig({
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim() || undefined,
      mode,
      currency
    });

    setSavedSuccess(true);
    setStatusMessage('PayPal Gateway credentials successfully configured and activated!');
    if (onSaved) onSaved(updated);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('melotwo_paypal_client_id');
    setClientId('');
    setStatusMessage('Stored key removed. Switched to sandbox defaults.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Accent top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-sky-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider font-display">
                  PayPal Gateway Key Setup
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {mode.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your PayPal REST API Client Key for live/sandbox checkout
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* Quick paste helper banner for the user */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-display">
                <Clipboard className="w-3.5 h-3.5" />
                Have your key copied to your clipboard?
              </span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Click the button to automatically paste your PayPal Client ID key.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              disabled={isPasting}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Paste Key
            </button>
          </div>

          {/* Client ID Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                PayPal Client ID (API Key) <span className="text-rose-400">*</span>
              </label>
              {clientId && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition"
                >
                  Clear Key
                </button>
              )}
            </div>
            <textarea
              rows={2}
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Paste your PayPal Client ID here (e.g., A21AAK... or test sandbox key)"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition resize-none"
            />
          </div>

          {/* Optional Client Secret */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              PayPal Secret <span className="text-[10px] font-normal text-slate-500">(Optional for backend order capture)</span>
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Leave blank if using client-side approval flow"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Mode & Currency Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Environment Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('sandbox')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    mode === 'sandbox'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setMode('live')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    mode === 'live'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live Production
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                Processing Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="USD">USD ($) - Auto-converted from ZAR</option>
                <option value="EUR">EUR (€) - Auto-converted</option>
                <option value="GBP">GBP (£) - Auto-converted</option>
              </select>
            </div>
          </div>

          {/* Status feedback message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              savedSuccess 
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
            }`}>
              {savedSuccess ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
            <a
              href="https://developer.paypal.com/dashboard/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 font-medium transition"
            >
              PayPal Developer Console <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Save & Activate Key
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
