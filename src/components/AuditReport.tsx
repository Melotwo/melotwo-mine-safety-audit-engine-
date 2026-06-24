import React, { useState } from "react";
import { AuditReportResponse, MineParams } from "../types";
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Hammer, CheckSquare, Square,
  Building, Copy, Check, Printer, FileText, Landmark, RefreshCcw, Briefcase
} from "lucide-react";
import { motion } from "motion/react";

interface AuditReportProps {
  report: AuditReportResponse;
  originalParams: MineParams;
  onRunAuditAgain: () => void;
}

export function AuditReport({ report, originalParams, onRunAuditAgain }: AuditReportProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedSpecs, setCopiedSpecs] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(() => {
    return localStorage.getItem("sans_trial_active") === "true";
  });
  const [showModal, setShowModal] = useState(false);
  const [enterpriseName, setEnterpriseName] = useState("");
  const [operationType, setOperationType] = useState("Mining");
  const [workforceSize, setWorkforceSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enterpriseName.trim() || !workforceSize.trim()) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    setErrorMessage("");

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
        setIsTrialActive(true);
        setShowModal(false);
      } else {
        setErrorMessage(data.error || "An error occurred.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const { auditSummary, riskAnalysis, complianceActionPlan, vendorMatchingCriteria, _fallback } = report;

  // Toggle remediation checks
  const toggleStep = (idx: number) => {
    setCompletedSteps({
      ...completedSteps,
      [idx]: !completedSteps[idx]
    });
  };

  // Copy specifications for procurement tenders
  const copySpecsToClipboard = () => {
    const textToCopy = `MELOTWO MINE SAFETY PPE SPECIFICATION TENDER BULLETIN
Mine: ${originalParams.mineName}
Sector: ${originalParams.miningSector.toUpperCase()}
Required Fabric: ${complianceActionPlan.requiredMaterialSpecifications.fabricTypeRequired}
Required Performance Rating: ${complianceActionPlan.requiredMaterialSpecifications.minimumPerformanceRating}
Required Footwear SANS Standard: ${complianceActionPlan.requiredMaterialSpecifications.footwearSpecification}
Audited SANS Frameworks: ${auditSummary.regulatoryFrameworksChecked.join(", ")}
Summary Target supplier: ${vendorMatchingCriteria.targetSupplierCategory}
Bulk specs summary: ${vendorMatchingCriteria.bulkOrderSpecsSummary}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSpecs(true);
    setTimeout(() => setCopiedSpecs(false), 2000);
  };

  // Color mappings
  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return {
          bg: "bg-red-950/40 border-red-500/40",
          text: "text-red-400",
          glow: "shadow-red-950/20",
          accentBg: "bg-red-500",
          description: "Immediate shut-down risk. Fatal incident threat detected."
        };
      case "HIGH":
        return {
          bg: "bg-amber-950/40 border-amber-500/40",
          text: "text-amber-400",
          glow: "shadow-amber-950/20",
          accentBg: "bg-amber-500",
          description: "Severe statutory gap. Major liability in the event of an inspection."
        };
      case "MEDIUM":
        return {
          bg: "bg-yellow-950/20 border-yellow-500/30",
          text: "text-yellow-400",
          glow: "shadow-yellow-950/10",
          accentBg: "bg-yellow-500",
          description: "Partial compliance. Protective longevity is compromised."
        };
      default:
        return {
          bg: "bg-emerald-950/30 border-emerald-500/35",
          text: "text-emerald-400",
          glow: "shadow-emerald-950/10",
          accentBg: "bg-emerald-500",
          description: "Full compliance verified on primary operational hazards."
        };
    }
  };

  const riskStyle = getRiskColor(auditSummary.riskLevel);

  // Score circular indicator parameters
  const score = auditSummary.complianceScore;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="compliance-report-view">
      
      {/* Fallback Notice */}
      {_fallback && (
        <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-3 text-xs text-slate-300 flex items-center gap-2 font-mono">
          <InfoIcon className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Local SANS Auditing Engine: Active Offline Evaluation (Regulatory Logic Implemented)</span>
        </div>
      )}

      {/* Grid: Gauge + Basic stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Compliance Gauge */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-72 shadow-lg">
          <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-slate-400 font-mono">SANS Compliance Guard</div>
          
          <div className="relative mt-2">
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Secondary background circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-700"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Primary active score dial */}
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className={score > 85 ? "stroke-sky-400" : score > 60 ? "stroke-yellow-500" : "stroke-rose-500"}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-50 leading-none font-display">{score}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">SANS SCORE</span>
            </div>
          </div>

          <div className="mt-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border border-opacity-30 ${riskStyle.text} ${riskStyle.bg} ${riskStyle.glow}`}>
              {auditSummary.riskLevel} SAFETY LEVEL
            </span>
            <p className="text-[11px] text-slate-400 mt-2 max-w-[200px] leading-tight mx-auto">
              {riskStyle.description}
            </p>
          </div>
        </div>

        {/* Audit Meta Context */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 md:col-span-2 relative overflow-hidden h-72 flex flex-col justify-between shadow-lg">
          <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-slate-400 font-mono">Operational Parameters Audited</div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Registered Mine Name:</span>
              <span className="text-sm font-bold text-slate-100 block truncate">{originalParams.mineName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Assessed Hazard Depth:</span>
              <span className="text-sm font-bold text-slate-100 block font-mono">{originalParams.depthLevel}m underground</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">SANS Standards Tested:</span>
              <div className="flex flex-wrap gap-1 mt-1 max-h-[60px] overflow-y-auto">
                {auditSummary.regulatoryFrameworksChecked.map((f) => (
                  <span key={f} className="text-[9px] bg-slate-900 border border-slate-700 text-sky-400 font-mono px-1.5 py-0.5 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Workforce Contingent audited:</span>
              <span className="text-sm font-bold text-slate-100 block font-mono">{originalParams.headcount} SHEQ-Insured</span>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mt-2">
            <div className="flex items-start gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold block text-slate-400">Primary Insurgency Gaps:</span>
                <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-tight">{auditSummary.primaryThreatIdentified}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Deep Risk Analysis vs The Vow Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Risk Analysis Card (The Villain) */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 flex flex-col justify-between shadow-lg" id="villain-card">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
              <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider font-display">The Operational Villain</h4>
                <p className="text-[11px] text-slate-400">Physical & chemical degradation threats undermining mine security</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Active Operational Risk:</span>
                <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-750 mt-1 leading-relaxed">
                  {riskAnalysis.theVillain}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Scientific Technical Deficit:</span>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {riskAnalysis.technicalDeficitReasoning}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-rose-950/10 border border-rose-500/10 p-3 rounded-xl mt-4 flex items-start gap-2.5">
            <Building className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase block">Underground DMRE Legal Liability:</span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {riskAnalysis.potentialFinancialImpact}
              </p>
            </div>
          </div>
        </div>

        {/* Action Plan Card (The Vow) */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 flex flex-col justify-between shadow-lg" id="action-plan-card">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
              <div className="bg-sky-500/10 border border-sky-500/20 p-2 rounded-lg">
                <Hammer className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider font-display">The Corrective Action vow</h4>
                <p className="text-[11px] text-slate-400">Remedial actions and engineering commitment path forward</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">The Engineering Pledge:</span>
                <p className="text-xs text-sky-400 italic bg-sky-950/25 border border-sky-500/20 p-3 rounded-lg mt-1 leading-relaxed font-semibold">
                  "{complianceActionPlan.theVow}"
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-2">Immediate Remediation Tracks Checklist (Interactive):</span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {complianceActionPlan.immediateRemediationSteps.map((step, idx) => {
                    const isChecked = completedSteps[idx] || false;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleStep(idx)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs leading-normal font-medium transition-all flex items-start gap-2.5 border cursor-pointer ${
                          isChecked 
                            ? "bg-slate-900 border-slate-800 text-slate-500 line-through" 
                            : "bg-slate-950/60 border-slate-700 text-slate-300 hover:border-sky-500/50"
                        }`}
                        id={`remediation-step-${idx}`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-sky-450 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span>{step}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 mt-4 space-y-2.5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Recommended Material Specifications</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono leading-tight">
              <div className="bg-[#1e293b] p-2 rounded border border-slate-700">
                <span className="text-slate-400 block uppercase mb-1">Fabric required</span>
                <span className="text-sky-400 font-bold block truncate">{complianceActionPlan.requiredMaterialSpecifications.fabricTypeRequired}</span>
              </div>
              <div className="bg-[#1e293b] p-2 rounded border border-slate-700">
                <span className="text-slate-400 block uppercase mb-1">Min performance</span>
                <span className="text-sky-400 font-bold block truncate">{complianceActionPlan.requiredMaterialSpecifications.minimumPerformanceRating}</span>
              </div>
              <div className="bg-[#1e293b] p-2 rounded border border-slate-700">
                <span className="text-slate-400 block uppercase mb-1">Footwear spec</span>
                <span className="text-sky-400 font-bold block truncate">{complianceActionPlan.requiredMaterialSpecifications.footwearSpecification}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Procurement & Copy tender wrapper with relative layout for overlay */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700 shadow-lg" id="procurement-card-container">
        {/* The actual procurement-card */}
        <div className={`bg-[#1e293b] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${!isTrialActive ? 'blur-md pointer-events-none select-none opacity-40' : ''}`} id="procurement-card">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 font-display">
              <Briefcase className="w-4.5 h-4.5 text-sky-400" />
              Tender Specification Blueprint Generator
            </h4>
            <p className="text-xs text-slate-400 font-sans">
              Export correct SANS material demands instantly into procurement tenders or supplier requests.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-sky-400 block uppercase tracking-wider">Supplier Category Matching:</span>
              <span className="text-xs text-slate-300 italic">{vendorMatchingCriteria.targetSupplierCategory}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copySpecsToClipboard}
              disabled={!isTrialActive}
              className="bg-[#0f172a] hover:bg-slate-950 border border-slate-700 text-slate-350 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 select-none hover:text-slate-100 cursor-pointer"
              id="copy-tender-specs"
            >
              {copiedSpecs ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Specs copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-sky-400" /> Copy Tender Specs
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={!isTrialActive}
              className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 select-none cursor-pointer"
              id="print-audit"
            >
              <Printer className="w-4 h-4 text-sky-450" /> Print SANS Audit
            </button>
          </div>
        </div>

        {/* Sleek blurred high-contrast overlay card */}
        {!isTrialActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-sm text-center z-10 transition-all">
            <div className="max-w-2xl px-4 py-3">
              <h5 className="text-sm font-black text-sky-400 uppercase tracking-widest mb-1.5 font-display flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400 animate-pulse" />
                Unlock Your Official SANS Compliance Shield
              </h5>
              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
                Join our exclusive 2026 South African Industry Beta. Export legally defensible procurement specifications and lock in early-bird corporate access completely free for 14 days.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 hover:text-slate-900 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-sky-950/50 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                id="start-trial-overlay"
              >
                Start 14-Day Free Beta Trial
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Re-run button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onRunAuditAgain}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 bg-[#1e293b] border border-slate-700 py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
          id="rerun-audit-bottom"
        >
          <RefreshCcw className="w-3.5 h-3.5 text-sky-450" /> Perform Alternative Configuration Check
        </button>
      </div>


      {/* HIDDEN PRINT-TEMPLATES (ONLY ACTIVATES WHEN USER INITIATES BROWSER PRINT) */}
      <div className="hidden print:block bg-white text-black p-8 font-sans" id="print-sheet">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">MELOTWO MINING SAFETY SERVICES</h1>
            <p className="text-sm font-semibold text-slate-700">Official South African SANS PPE Audit Certificate</p>
          </div>
          <div className="text-right font-mono text-xs text-slate-600">
            <p>Generated: {new Date().toISOString().split('T')[0]}</p>
            <p>Authority: DMRE Regulatory Engine</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border p-4 rounded bg-slate-50">
            <h3 className="font-bold text-sm uppercase text-slate-800 border-b pb-1 mb-2">Mine Profile Context</h3>
            <table className="w-full text-xs text-left">
              <tbody>
                <tr><td className="font-semibold py-1">Mine Operator:</td><td>{originalParams.mineName}</td></tr>
                <tr><td className="font-semibold py-1">Sector Class:</td><td>{originalParams.miningSector.toUpperCase()} Mine</td></tr>
                <tr><td className="font-semibold py-1">Shaft Depth Level:</td><td>{originalParams.depthLevel} meters</td></tr>
                <tr><td className="font-semibold py-1">Deployment Headcount:</td><td>{originalParams.headcount} SANS-Insured Staff</td></tr>
                <tr><td className="font-semibold py-1">Typical hazards present:</td><td>{originalParams.environmentHazards.join(", ")}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="border p-4 rounded bg-slate-50">
            <h3 className="font-bold text-sm uppercase text-slate-800 border-b pb-1 mb-2">Primary Auditor Conclusions</h3>
            <table className="w-full text-xs text-left">
              <tbody>
                <tr><td className="font-semibold py-1">SANS Compliance Score:</td><td className="font-bold text-base">{score} / 100</td></tr>
                <tr><td className="font-semibold py-1">Risk Classification Level:</td><td className="font-bold text-rose-600 font-mono">{auditSummary.riskLevel}</td></tr>
                <tr><td className="font-semibold py-1">Primary Threat Vector:</td><td>{auditSummary.primaryThreatIdentified}</td></tr>
                <tr><td className="font-semibold py-1">Audited Codes:</td><td>{auditSummary.regulatoryFrameworksChecked.join(", ")}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border p-4 rounded mb-6">
          <h3 className="font-bold text-sm uppercase text-slate-900 border-b pb-1 mb-2">Technical Deficit Analysis (The Villain)</h3>
          <p className="text-xs text-slate-800 leading-relaxed mb-3">
            <strong>Active Asset Failures:</strong> {riskAnalysis.theVillain}
          </p>
          <p className="text-xs text-slate-800 leading-relaxed font-mono bg-slate-100 p-2 rounded">
            <strong>Materials Scientific Failures:</strong> {riskAnalysis.technicalDeficitReasoning}
          </p>
          <p className="text-xs text-red-700 font-bold leading-relaxed mt-2">
            <strong>Potential legal Liabilities:</strong> {riskAnalysis.potentialFinancialImpact}
          </p>
        </div>

        <div className="border p-4 rounded mb-6">
          <h3 className="font-bold text-sm uppercase text-slate-900 border-b pb-1 mb-2">Corrective Remediation Directives (The Vow)</h3>
          <p className="text-xs text-emerald-800 font-bold mb-3">
            "We hereby commit to: {complianceActionPlan.theVow}"
          </p>
          <ul className="list-decimal pl-5 text-xs text-slate-800 space-y-1.5">
            {complianceActionPlan.immediateRemediationSteps.map((step, idx) => (
              <li key={idx}><strong>{step}</strong></li>
            ))}
          </ul>
        </div>

        <div className="border p-4 rounded bg-slate-100">
          <h3 className="font-bold text-sm uppercase text-slate-900 border-b pb-1 mb-2">Target SANS Procurement Requirements</h3>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="py-1">Specification Aspect</th>
                <th className="py-1">Audited Compliance standard</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="py-1 font-semibold">Tender Protective Fabric required:</td><td>{complianceActionPlan.requiredMaterialSpecifications.fabricTypeRequired}</td></tr>
              <tr className="border-b"><td className="py-1 font-semibold">Required ATPV Heat Rating:</td><td>{complianceActionPlan.requiredMaterialSpecifications.minimumPerformanceRating}</td></tr>
              <tr className="border-b"><td className="py-1 font-semibold">Safety Boots Sole Spec:</td><td>{complianceActionPlan.requiredMaterialSpecifications.footwearSpecification}</td></tr>
              <tr><td className="py-1 font-semibold">Tender Bulk Scope Summary:</td><td>{vendorMatchingCriteria.bulkOrderSpecsSummary}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="text-center font-mono text-[9px] text-slate-500 mt-12">
          This document is compiled automatically by the Melotwo Mine Safety Auditing platform in conformance with SANS 10119 rules. All signatures on file.
        </div>
      </div>

      {showModal && (
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

              {errorMessage && (
                <div className="text-xs text-rose-400 font-sans bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-400 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer font-sans"
                >
                  {submitting ? "Activating..." : "Confirm & Unlock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
