import React, { useState, useEffect } from "react";
import { MineParams, AuditReportResponse } from "./types";
import { MINE_PRESETS } from "./data";
import { AuditForm } from "./components/AuditForm";
import { AuditReport } from "./components/AuditReport";
import { WashCycleSimulator } from "./components/WashCycleSimulator";
import { SANSReferenceTable } from "./components/SANSReferenceTable";

import { 
  ShieldCheck, AlertOctagon, Landmark, Database, HelpCircle, 
  RefreshCw, Layers, Sparkles, BookOpen, Clock, FileText,
  Lock, ShieldAlert
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'simulator' | 'legislation'>('audit');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [currentParams, setCurrentParams] = useState<MineParams | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReportResponse | null>(null);

  // Free audits and premium status state variables
  const [auditCount, setAuditCount] = useState<number>(() => {
    const saved = localStorage.getItem("sans_audit_count");
    return saved ? Number(saved) : 0;
  });

  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem("sans_trial_active") === "true";
  });

  const [paywallResponse, setPaywallResponse] = useState<any | null>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [enterpriseName, setEnterpriseName] = useState("");
  const [operationType, setOperationType] = useState("Mining");
  const [workforceSize, setWorkforceSize] = useState("");
  const [submittingTrial, setSubmittingTrial] = useState(false);
  const [trialError, setTrialError] = useState("");
  const [auditHistory, setAuditHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("sans_audit_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Periodically check local storage to keep tabs synchronised
  useEffect(() => {
    const checkPremium = () => {
      const active = localStorage.getItem("sans_trial_active") === "true";
      if (active !== isPremium) {
        setIsPremium(active);
        if (active) {
          setPaywallResponse(null); // Instantly bypass paywall screen
        }
      }
    };
    const interval = setInterval(checkPremium, 1000);
    return () => clearInterval(interval);
  }, [isPremium]);

  // Simulated live African Standard Time clock
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // South Africa Standard Time (UTC+2) is typical, let's format beautifully
      const formatted = now.toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
      setCurrentTime(formatted + " SAST");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-load a gold mine preset by default so there's instant active imagery
  useEffect(() => {
    if (!currentParams) {
      setCurrentParams(MINE_PRESETS[0].data);
    }
  }, []);

  // Handle Trial activation from inside App.tsx (e.g. from the paywall)
  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enterpriseName.trim() || !workforceSize.trim()) {
      setTrialError("Please fill in all fields.");
      return;
    }
    setSubmittingTrial(true);
    setTrialError("");

    try {
      const response = await fetch("/api/paystack/initialize-trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enterpriseName,
          operationType,
          workforceSize,
          email: "turoka15@gmail.com",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize free trial subscription.");
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("sans_trial_active", "true");
        setIsPremium(true);
        setPaywallResponse(null);
        setShowTrialModal(false);
      } else {
        setTrialError(data.error || "An error occurred.");
      }
    } catch (err: any) {
      setTrialError(err.message || "Network error. Please try again.");
    } finally {
      setSubmittingTrial(false);
    }
  };

  // Execute the audit by calling our server.ts backend endpoint
  const handleRunAudit = async (params: MineParams, dailyShiftCheck?: boolean) => {
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentParams(params);

    // Dynamic state fetch
    const currentIsPremium = localStorage.getItem("sans_trial_active") === "true";
    let countToUse = auditCount;
    
    if (!dailyShiftCheck) {
      countToUse = auditCount + 1;
      // Save count to localStorage and state only if it is NOT a free daily shift check
      setAuditCount(countToUse);
      localStorage.setItem("sans_audit_count", countToUse.toString());
    }

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...params,
          audit_count: countToUse,
          is_premium: currentIsPremium,
          daily_shift_check: dailyShiftCheck ? true : false
        })
      });

      if (!response.ok) {
        throw new Error(`Technical Server Error (Status ${response.status})`);
      }

      const reportData = await response.json();
      
      // If paywall_locked status is returned, store paywall state
      if (reportData.status === "paywall_locked") {
        setPaywallResponse(reportData);
        setAuditReport(null);
      } else {
        setAuditReport(reportData);
        setPaywallResponse(null);

        // Save to audit history logs if historyLog is present
        if (reportData.historyLog) {
          setAuditHistory(prev => {
            const updated = [reportData.historyLog, ...prev.filter(h => h.id !== reportData.historyLog.id)];
            const trimmed = updated.slice(0, 10);
            localStorage.setItem("sans_audit_history", JSON.stringify(trimmed));
            return trimmed;
          });
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch SANS audit details:", err);
      setErrorMsg(err.message || "Auditing node failed to establish connection. Double check configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAudit = () => {
    setAuditReport(null);
    setPaywallResponse(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-sleek-radial text-slate-100 flex flex-col font-sans selection:bg-sky-500/35 selection:text-slate-100" id="main-safety-app-root">
      
      {/* 1. Header Section */}
      <header className="border-b border-slate-700 bg-[#1e293b]/90 backdrop-blur sticky top-0 z-50 print:hidden" id="app-header-bar">
        {/* Warning stripe pattern */}
        <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#38bdf8,#38bdf8_10px,#1e293b_10px,#1e293b_20px)]" />
        
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-950/45 shrink-0 border border-sky-400/25">
              <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" id="header-logo-shield" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase tracking-tight text-[#38bdf8] leading-none font-display">MELOTWO MINE SAFETY</h1>
                <span className="text-[9px] bg-sky-500/10 border border-sky-500/30 text-sky-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                  S-Tier Engine
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium tracking-wide mt-0.5 block">
                S-Tier Compliance & PPE Audit Engine | Terminal ID: ZA-9942-K
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentTime || "SAST Terminal Ready"}</span>
            </div>

            <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300" id="audit-count-indicator">
              <span className="text-[10px] uppercase font-bold text-slate-500">Audits:</span>
              <span className={`font-mono font-bold ${auditCount >= 3 && !isPremium ? "text-rose-400" : "text-sky-400"}`}>
                {isPremium ? "SANS UNLOCKED" : `${Math.min(3, auditCount)}/3 Free`}
              </span>
            </div>
            
            <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sky-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>SANS ENGINE ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 print:p-0 print:m-0" id="app-workspace-body">
        
        {/* Concept Introduction Box (S-Tier Insurance Intro) */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
          <div className="space-y-2 max-w-3xl">
            <h2 className="text-base font-bold text-[#38bdf8] flex items-center gap-2 tracking-wide uppercase font-display">
              <Landmark className="w-4.5 h-4.5 text-sky-400" />
              S-Tier Regulatory & Liability Insurance Policy Interface
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mining procurement and SHEQ officers under the South African Department of Mineral Resources and Energy (DMRE) carry high personal litigation risk. 
              This engine audits operational elements against mandatory South African National Standards (SANS) protocols and produces immediate Technical Core Specifications matching <strong>SANS 724 (Arc Flash)</strong>, <strong>SANS 20345 (Footwear Standards)</strong>, and <strong>SANS 434 (Conti Designs)</strong> guidelines.
            </p>
          </div>
          <div className="flex gap-4 border-l border-slate-700 pl-0 md:pl-6 shrink-0 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">Differentiator Focus:</span>
              <span className="text-slate-300 font-semibold block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Inherent Atomic FR vs Treated Coatings
              </span>
              <span className="text-slate-300 font-semibold block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Polyurethane Soles Acid-Vulnerability
              </span>
            </div>
          </div>
        </div>

        {/* 3. Navigation Controls / Tab Selector */}
        <div className="flex flex-wrap border-b border-slate-700 gap-2 pb-px print:hidden" id="workspace-tabs-selectors">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 -mb-px border-b-2 ${
              activeTab === 'audit'
                ? "bg-[#1e293b]/90 border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            id="tab-selector-audit"
          >
            <Database className="w-4 h-4 text-sky-400" />
            1. Auditing Terminal
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 -mb-px border-b-2 ${
              activeTab === 'simulator'
                ? "bg-[#1e293b]/90 border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            id="tab-selector-simulator"
          >
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin-slow" />
            2. Material Degradation Simulator
          </button>

          <button
            onClick={() => setActiveTab('legislation')}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 -mb-px border-b-2 ${
              activeTab === 'legislation'
                ? "bg-[#1e293b]/90 border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            id="tab-selector-legislation"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            3. Mandated SANS Library
          </button>
        </div>

        {/* 4. Tab Context Presentation Render Area */}
        <div id="workspace-active-panel">
          
          {/* TAB 1: AUDITING COCKPIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6" id="audit-tab-panel">
              {errorMsg && (
                <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-400 flex items-start gap-2.5">
                  <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Compliance Engine Encountered a Network / Key Block:</span>
                    <span className="text-xs text-slate-350">{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Loader Simulation UI */}
              {isLoading && (
                <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-xl" id="quantum-loader-screen">
                  {/* Glowing atomic style spinner */}
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-sky-500/30 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-sky-500 animate-ping opacity-35" />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <ShieldCheck className="w-8 h-8 text-slate-950" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h4 className="text-base font-bold text-slate-100 tracking-wider uppercase font-display">Calibrating SANS Regulatory Matrices</h4>
                    <p className="text-xs text-slate-400 leading-normal font-sans">
                      We are parsing raw mine profiles against active South African protective apparel frameworks. Our auditor model is assessing polymer wear factors & sole composition tolerances...
                    </p>
                  </div>

                  {/* Micro task stages representation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl font-mono text-[10px] text-slate-400">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 flex items-center gap-2 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                      <span>SANS Footwear Database</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 flex items-center gap-2 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                      <span>Polymer wash decay ratios</span>
                    </div>
                    <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-900 flex items-center gap-2 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                      <span>SANS 724 switching ratings</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard active parameters form OR produced final report cards OR paywall screen */}
              {!isLoading && !auditReport && !paywallResponse && (
                <AuditForm onRunAudit={handleRunAudit} isLoading={isLoading} />
              )}

              {!isLoading && paywallResponse && (
                <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-8 shadow-xl text-center relative overflow-hidden animate-fade-in" id="paywall-screen-gate">
                  {/* Glowing warning accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-sky-500" />
                  
                  <div className="max-w-2xl mx-auto py-6 space-y-6">
                    <div className="h-16 w-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
                      <Lock className="w-8 h-8 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-1 rounded font-mono font-bold tracking-wider uppercase inline-block">
                        {paywallResponse.status ? paywallResponse.status.replace("_", " ") : "PAYWALL LOCKED"}
                      </span>
                      <h3 className="text-xl font-black uppercase tracking-tight text-slate-100 font-display">
                        Limit Reached: SANS Regulatory Audit Gate
                      </h3>
                      <p className="text-sm text-slate-350 leading-relaxed font-sans">
                        {paywallResponse.message}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-3 font-sans">
                      <span className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider block">Included with Paystack Enterprise Beta Shield:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-450">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>Unlimited SANS Compliance Audits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>Continuous Degradation Monitoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>Tender Spec Blueprint Exporter</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>Official Certificate Print Portal</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                      <button
                        onClick={handleClearAudit}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-450 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer font-sans"
                      >
                        Reset & Modify Profile
                      </button>
                      <button
                        onClick={() => setShowTrialModal(true)}
                        className="bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-950/50 cursor-pointer flex items-center justify-center gap-2 font-sans"
                        id="upgrade-button-paywall"
                      >
                        Start 14-Day Free Beta Trial
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && auditReport && currentParams && !paywallResponse && (
                <AuditReport 
                  report={auditReport} 
                  originalParams={currentParams} 
                  onRunAuditAgain={handleClearAudit} 
                  historyLogs={auditHistory}
                />
              )}
            </div>
          )}

          {/* TAB 2: WASH DEGRADATION SIMULATOR */}
          {activeTab === 'simulator' && (
            <div id="simulator-tab-panel">
              <WashCycleSimulator />
            </div>
          )}

          {/* TAB 3: LEGISLATION REFERENCE ENCYCLOPEDIA */}
          {activeTab === 'legislation' && (
            <div id="legislation-tab-panel">
              <SANSReferenceTable />
            </div>
          )}

        </div>

      </main>

      {/* 5. Footer and Regulatory Disclaimer */}
      <footer className="border-t border-slate-900 bg-[#090d16] py-8 text-center text-xs text-slate-500 mt-auto print:hidden" id="app-footer-sec">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2">
            <Landmark className="w-4 h-4 text-slate-600" />
            <span className="font-bold tracking-wider uppercase font-mono">MINE COMPLIANCE ASSURANCE SHIELD</span>
          </div>
          <p className="max-w-2xl mx-auto text-[11px] leading-relaxed text-slate-600">
            DISCLAIMER: Content derived here serves as procedural compliance guidance and legal risk mitigators. 
            All final PPE specifications must be countersigned by qualified occupational health scientists and mine managers in alignment with standard South African Mine Health and Safety Act rules.
          </p>
          <p className="text-[10px] font-mono text-slate-650">
            Melotwo SHEQ Compliance Portal © 2026. All Rights Reserved.
          </p>
        </div>
      </footer>

      {showTrialModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
            {/* Visual Sky Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-blue-500" />
            
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider mb-2 font-display flex items-center gap-2 mt-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              Activate SANS Beta Access
            </h3>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
              Enter your corporate operational scope to register your 14-day deferred billing trial and generate official procurement blueprints.
            </p>

            <form onSubmit={handleStartTrial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-sans">
                  Enterprise Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anglo American Platinum"
                  value={enterpriseName}
                  onChange={(e) => setEnterpriseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-sans">
                  Primary Operation Type
                </label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer font-sans"
                >
                  <option value="Mining">Mining Operations (Deep/Open-Cast)</option>
                  <option value="Construction">Civil Engineering & Construction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-sans">
                  Workforce Size
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1500 personnel"
                  value={workforceSize}
                  onChange={(e) => setWorkforceSize(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 font-sans"
                />
              </div>

              {trialError && (
                <div className="text-xs text-rose-400 font-sans bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg">
                  {trialError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrialModal(false)}
                  className="w-1/2 bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-450 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTrial}
                  className="w-1/2 bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer font-sans"
                >
                  {submittingTrial ? "Activating..." : "Confirm & Unlock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
