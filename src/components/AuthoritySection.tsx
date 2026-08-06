import React from 'react';
import { Award, Shield, Sparkles, CheckCircle2, BookOpen, Cpu, Anchor, BadgeCheck } from 'lucide-react';

export const AuthoritySection: React.FC = () => {
  return (
    <section className="mb-20 scroll-mt-24" id="authority-section">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                <BadgeCheck className="w-4 h-4 text-amber-400" />
                <span>Executive Authorship & Subject Matter Authority</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Architected for DMRE & SANS 10330 Precision
              </h2>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-300">Verified SANS 10330 Lead Practitioner</span>
            </div>
          </div>

          {/* Main Author Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Author Badge & Credentials */}
            <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
              <div className="relative inline-block">
                <div className="w-28 h-28 md:w-32 md:w-32 mx-auto lg:mx-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 p-1 shadow-xl">
                  <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="text-center p-2">
                      <span className="text-3xl font-black text-white font-mono tracking-tighter">TS</span>
                      <span className="block text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest mt-0.5">MeloTwo Founder</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 rounded-full p-1.5 shadow-lg border-2 border-slate-900" title="Google AI Certified & SANS Practitioner">
                  <Award className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Tumi Seroka</h3>
                <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                  Founder & Chief Technical Architect
                </p>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Culinary Technology Founder, SANS 10330 Practitioner & Enterprise Software Architect
                </p>
              </div>

              {/* Verified Expertise Tags */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 pt-2">
                <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1">
                  <Anchor className="w-3 h-3 text-sky-400" /> Disney Cruise Line Hospitality Alum
                </span>
                <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-indigo-400" /> Google AI Certified
                </span>
                <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-400" /> SANS 10330 HACCP Expert
                </span>
              </div>
            </div>

            {/* Right Column: Authoritative Statement Quote Box */}
            <div className="lg:col-span-8 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-6 md:p-8 space-y-4 relative">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-3">
                <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" /> Official Authority Blueprint Statement
                </span>
                <span className="text-slate-500 font-mono">Johannesburg & Polokwane, RSA</span>
              </div>

              <blockquote className="text-xs md:text-sm text-slate-200 leading-relaxed italic font-sans">
                "MeloTwo Safety Engine is architected by Tumi Seroka, a culinary technology founder and solutions architect with over a decade of domain expertise spanning high-volume commercial food operations, luxury fleet hospitality with Disney Cruise Line, and specialized software engineering. Combining rigorous culinary arts training with advanced SaaS development and Google AI certification, Seroka designed MeloTwo to bridge the dangerous gap between complex statutory food safety regulations (SANS 10330) and daily operational reality on South African mine sites. Grounded in direct operational experience across Limpopo and Gauteng industrial corridors, this leadership ensures that every feature—from subterranean thermal retention tracking to automated CAPA workflows—meets both strict DMRE legal mandates and practical front-line execution standards."
              </blockquote>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono text-[11px]">10+ Years Expertise</strong>
                    <span className="text-slate-400 text-[11px]">Culinary & Industrial Catering</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono text-[11px]">Subterranean Focus</strong>
                    <span className="text-slate-400 text-[11px]">CCP #4 Thermal Cage Transit</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono text-[11px]">DMRE Zero Penalty</strong>
                    <span className="text-slate-400 text-[11px]">Section 54 Exposure Mitigation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
