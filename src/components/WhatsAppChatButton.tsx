import React from 'react';
import { MessageCircle } from 'lucide-react';

export interface WhatsAppChatButtonProps {
  phoneNumber?: string;
  message?: string;
  variant?: 'floating' | 'nav' | 'button' | 'compact';
  className?: string;
  label?: string;
  subLabel?: string;
}

/**
 * WhatsAppChatButton provides a masked, secure link to WhatsApp using wa.me.
 * It strictly prevents the raw phone number from ever being exposed as plain text in the UI.
 */
export const WhatsAppChatButton: React.FC<WhatsAppChatButtonProps> = ({
  phoneNumber,
  message = 'Hi MeloTwo Team, I am interested in a Tender Safety File',
  variant = 'floating',
  className = '',
  label = 'Chat on WhatsApp',
  subLabel = 'Typically replies in 5m'
}) => {
  // Use prop or environment variable, falling back to default South African business contact number
  const rawNumber = phoneNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '27824509182';
  
  // Clean phone number: remove all non-digits, leading +, brackets, dashes, and spaces
  const sanitizedNumber = rawNumber.replace(/\D/g, '');
  
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${sanitizedNumber}?text=${encodedText}`;

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // 1. Navigation Bar Variant
  if (variant === 'nav') {
    return (
      <a
        href={whatsappUrl}
        onClick={handleOpenWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/70 hover:border-emerald-400 rounded-xl transition shadow-sm cursor-pointer group ${className}`}
        title="Chat with MeloTwo Safety Engineer on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20 group-hover:scale-110 transition-transform" />
        <span>{label}</span>
      </a>
    );
  }

  // 2. Compact Icon/Pill Variant
  if (variant === 'compact') {
    return (
      <a
        href={whatsappUrl}
        onClick={handleOpenWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer ${className}`}
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-white/20" />
      </a>
    );
  }

  // 3. Regular In-Page Button Variant
  if (variant === 'button') {
    return (
      <a
        href={whatsappUrl}
        onClick={handleOpenWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all cursor-pointer ${className}`}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-white/20" />
        <span>{label}</span>
      </a>
    );
  }

  // 4. Default: Floating Bottom-Right Action Button with Pulse Aura
  return (
    <div 
      id="floating-whatsapp-widget" 
      className={`fixed bottom-6 right-6 z-50 flex items-center group ${className}`}
    >
      {/* Expanding Tooltip Pill on Desktop Hover */}
      <div className="hidden sm:flex flex-col items-end mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 text-white px-3.5 py-1.5 rounded-xl shadow-xl flex flex-col items-end text-right">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            {label}
          </span>
          <span className="text-[10px] text-slate-400">{subLabel}</span>
        </div>
      </div>

      {/* Main Floating Trigger Button */}
      <a
        href={whatsappUrl}
        onClick={handleOpenWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-2xl shadow-emerald-950/80 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-emerald-400/40"
        aria-label="Open WhatsApp conversation with MeloTwo SHEQ specialist"
        title="Direct WhatsApp Support"
      >
        {/* Ambient Ring Glow */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-pulse blur-sm -z-10"></span>
        
        <MessageCircle className="w-7 h-7 fill-white/15 drop-shadow-md" />

        {/* Live Online Badge */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
      </a>
    </div>
  );
};
