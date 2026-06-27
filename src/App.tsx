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
  Lock, ShieldAlert,
  Shield, CheckCircle, AlertTriangle, Cpu, Factory, Users, ArrowRight
} from "lucide-react";

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
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

  // Client-Side High-Fidelity SANS & DSTI Evaluation Engine
  const getClientSideAuditReport = (params: MineParams, dailyShiftCheck?: boolean, dailyDstiCheck?: boolean): any => {
    if (dailyDstiCheck) {
      const mineName = params.mineName || "MeloTwo Construction Site Block 4";
      const sector = params.miningSector || "gold";
      return {
        auditSummary: {
          complianceScore: 100,
          riskLevel: "LOW",
          regulatoryFrameworksChecked: ["SANS 10085 (Design of access scaffolding)", "SANS 50353 (Fall protection systems)", "South African Construction Regulations 2014"],
          primaryThreatIdentified: "None - Daily Construction DSTI completed successfully"
        },
        riskAnalysis: {
          theVillain: "Elevated fall hazards and scaffolding failures before tasks start.",
          technicalDeficitReasoning: "Uninspected working at heights harness lines and base structural checks.",
          potentialFinancialImpact: "Zero active construction liabilities when daily pre-task instructions are strictly completed."
        },
        complianceActionPlan: {
          theVow: "To execute daily construction Safe Task Instructions without compromise.",
          immediateRemediationSteps: ["Inspect fall harnesses", "Lock scaffold wheel systems", "Check tagging on portable drills"],
          requiredMaterialSpecifications: {
            fabricTypeRequired: "Heavy-duty high-vis flame retardant workwear",
            minimumPerformanceRating: "SANS 50353 fall arrest rated",
            footwearSpecification: "SANS 20345 steel toe shoes with anti-slip tread"
          }
        },
        vendorMatchingCriteria: {
          targetSupplierCategory: "Construction Safety Outfitters",
          bulkOrderSpecsSummary: "Daily Construction DSTI active"
        },
        dailyDstiBriefing: {
          briefingTitle: "Daily Construction Safe Task Instruction (DSTI)",
          siteName: mineName,
          constructionSector: sector.charAt(0).toUpperCase() + sector.slice(1),
          hazardsOverview: "Elevated structural rigging, potential falls from heights, unstable scaffolding footings, and electrical shock hazards in wet workspace zones.",
          toolboxMessage: "Let's work safely today! Always inspect your double-lanyard harness before working above 1.5 meters. Verify that the mobile scaffold's wheels are double-locked before anyone ascends. Never use an electrical tool unless its safety inspection tag is present and valid.",
          heightsChecklist: [
            "Double-Lanyard Inspection: Inspect all safety harnesses for fraying, dynamic stress tears, and solid D-ring integrity.",
            "Anchor Points: Confirm that structural anchor points are load-certified and fall-arrest tethers are secured.",
            "Drop Zone Barriers: Ensure drop zones below elevated assembly spots are clearly barricaded and warning signages are posted."
          ],
          scaffoldChecklist: [
            "Green Safe Scaff-Tag: Verify that a valid, signed 'Green Tag' is clearly displayed, proving inspection within 24 hours.",
            "Ground Footing Check: Check that base jacks rest firmly on solid ground with adequate timber sole-boards to spread load.",
            "Guardrail Security: Confirm that guardrails, intermediate safety midrails, and toe-boards are fully locked into position."
          ],
          electricalChecklist: [
            "Valid Color Tagging: Verify that the portable electric drill/grinder displays a current, color-coded safety inspection tag.",
            "Cable & Jacket Integrity: Inspect all supply cords for exposed wiring, internal cuts, or temporary electrical tape jointing.",
            "Earth Leakage Switch test: Perform a fast push-button trip test on the portable Earth Leakage Protection board before operation."
          ]
        },
        _fallback: true
      };
    }

    if (dailyShiftCheck) {
      const sector = params.miningSector || "gold";
      const mineName = params.mineName || "Melotwo Mine Shaft 2";
      
      let hazardsOverview = "";
      let gearChecklist: string[] = [];
      let toolboxMessage = "";
      
      if (sector === "coal") {
        hazardsOverview = "High risk of combustible coal dust accumulation and invisible methane pockets in the face.";
        gearChecklist = [
          "Verify High-Vis Vest reflectivity is pristine and clear of grease layers.",
          "Check boot sole pattern depth and ensure no static-conductive metal particles are trapped.",
          "Ensure oxygen self-rescuer pressure dial reads strictly in the green safe zone.",
          "Inspect safety helmet suspension for dust grit wear and strap security."
        ];
        toolboxMessage = "Stay sharp in the dark! Prioritize high-visibility and ensure methane detection is active. No shortcuts under coal faces today. Go home safe!";
      } else if (sector === "gold") {
        hazardsOverview = "Deep subterranean pressure stress and high humidity causing slick walkways and high ambient heat.";
        gearChecklist = [
          "Inspect safety footwear: verify sole pattern depth is over 4mm for wet floor traction.",
          "Check for outsole cracks/chemical degradation from pyritic acid mine drainage water.",
          "Verify your sweat-resistant high-absorbency shift-suit fabric is dry and clean.",
          "Ensure waterproof battery seals on headlamps are fully locked."
        ];
        toolboxMessage = "Deep-level alertness is our first line of defense. Acid waters degrade substandard PU soles fast. Keep dry, watch the ground, and stay hydrated down there!";
      } else {
        hazardsOverview = "Heavy mechanical vehicle operations in confined spaces. High noise levels and seismic vibrations.";
        gearChecklist = [
          "Check steel toe cap alignment on both safety boots for balance.",
          "Ensure ear protection/muffs are present, clean, and seal tightly.",
          "Inspect safety gloves for physical grip coating fatigue and side tears.",
          "Test emergency alert whistle tether security."
        ];
        toolboxMessage = "Team, heavy haulers are moving across the face today. Keep eyes open, check your grip gloves, and verify steel caps. Let's work together to make this shift accident-free!";
      }

      return {
        auditSummary: {
          complianceScore: 100,
          riskLevel: "LOW",
          regulatoryFrameworksChecked: ["SANS 20345", "SANS 434"],
          primaryThreatIdentified: "None - Daily shift check completed"
        },
        riskAnalysis: {
          theVow: "Pre-shift focus alignment.",
          theVillain: "Operational complacency before descending.",
          technicalDeficitReasoning: "Pre-shift fatigue and uninspected personal safety gear.",
          potentialFinancialImpact: "Zero active liabilities when pre-shift toolbox briefings are strictly followed."
        },
        complianceActionPlan: {
          theVow: "To execute pre-shift safety protocols without fail.",
          immediateRemediationSteps: ["Equip PPE", "Attend morning toolbox briefing", "Perform descending check"],
          requiredMaterialSpecifications: {
            fabricTypeRequired: "Inherent FR Blend",
            minimumPerformanceRating: "8.4 cal/cm²",
            footwearSpecification: "SANS 20345 dual-density nitrile sole"
          }
        },
        vendorMatchingCriteria: {
          targetSupplierCategory: "Industrial Outfitters",
          bulkOrderSpecsSummary: "Daily check active"
        },
        dailyShiftBriefing: {
          briefingTitle: `Pre-Descending Shift Check: ${mineName} (${sector.toUpperCase()})`,
          mineType: sector.charAt(0).toUpperCase() + sector.slice(1),
          hazardsOverview,
          gearChecklist,
          toolboxMessage
        },
        _fallback: true
      };
    }

    // Normal local SANS compliance audit
    const { miningSector, depthLevel = 1000, environmentHazards = [] } = params;
    const currentPPE = (params.currentPPE || {}) as any;
    const fabric = currentPPE.fabricType || "D59 Cotton";
    const washCycles = Number(currentPPE.fabricWashCycles) || 0;
    const footwear = currentPPE.footwearSoleMaterial || "Standard PU (Polyurethane)";
    const arcRating = currentPPE.arcRatingValue || "No rating";

    let complianceScore = 85;
    const frameworks = ["SANS 434"];
    const threats: string[] = [];
    const remediation: string[] = [];
    let riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
    
    let villainText = "";
    let techDeficit = "";
    let financialImpact = "";
    let requiredFabricType = "Inherent FR Blend (Aramid/Modacrylic)";
    let requiredArcMin = "8 cal/cm²";
    let requiredFootwear = "Vulcanized AMD-resistant Nitrile Sole (SANS 20345)";

    const hasAMD = environmentHazards.includes("Acid Mine Drainage") || depthLevel > 1500 || miningSector === "gold";
    if (hasAMD) {
      frameworks.push("SANS 20345");
      if (footwear.includes("PU") || footwear.includes("Polyurethane")) {
        complianceScore -= 25;
        threats.push("Acid Mine Drainage Sole Disintegration");
        remediation.push("Immediately replace standard PU (Polyurethane) safety boots with dual-density vulcanized Nitrile rubber soles.");
        villainText += "Acid Mine Drainage (AMD) containing sulfuric acid from deep pyritic strata directly reacts with and disintegrates Polyurethane outsoles. ";
        techDeficit += "PU soles suffer hydrolytic attack when exposed to acidic water, making them brittle and leading to sudden tread loss. ";
        financialImpact += "Worker slip-and-fall injuries, exposure to caustic acidic waters, medical claims, and standard SANS 20345 non-compliance fines up to ZAR 500k. ";
      }
    }

    const isCoal = miningSector === "coal";
    const hasFlashFire = environmentHazards.includes("Thermal/Flash Fire") || isCoal || environmentHazards.includes("Electric Arc");
    if (hasFlashFire) {
      if (isCoal) frameworks.push("SANS 1423");
      if (environmentHazards.includes("Electric Arc")) frameworks.push("SANS 724");

      const isPoly = fabric.includes("Poly");
      const isTreated = fabric.includes("Treated");
      
      if (isPoly) {
        complianceScore -= 40;
        threats.push("Polyester Melting & Skin Fusion Threat");
        remediation.push("Ban all polyester-blend garments from active underground or smelter faces. Enforce inherent non-melting protection.");
        villainText += "Synthetic plastic fabrics in explosive/combustible thermal zones. ";
        techDeficit += "Polyester under extreme high-temperature electric arc or flash fire shocks melts directly into severe, deep-dermal third-degree burns. ";
        financialImpact += "ZAR Millions in employee treatment, legal litigation under section 86 of the MHSA, and potential Section 54 shaft shutdown instructions by the DMRE. ";
      } else if (isTreated && washCycles > 30) {
        complianceScore -= 20;
        threats.push("Invisible FR Protection Wash-out Gaps");
        remediation.push("Institute a strict RFID/barcode laundering tracking manifest or migrate to inherent atomic-level FR fibers.");
        villainText += "Flame-retardant capabilities leaching away invisibly during laundry cycles. ";
        techDeficit += "Treated Flame-Retardant cotton relies on surface chemical coatings. Regular harsh mine washing degrades these surface chemicals over 30-50 wash cycles. ";
        financialImpact += "Catastrophic third-degree burns during flash fire ignitions, severe liability for SHEQ officers. ";
      }
    }

    if (environmentHazards.includes("Electric Arc")) {
      if (arcRating === "No rating" || parseInt(arcRating) < 8) {
        complianceScore -= 20;
        threats.push("Insufficient Electric Arc Blast PPE Rating");
        remediation.push("Upgrade all electrical switching staff to certified SANS 724 garments with Arc Thermal Performance Value (ATPV) exceeding 8 cal/cm².");
        villainText += "Sub-standard ATPV clothing exposed to high-energy substation switches. ";
        techDeficit += "Current garments offer insufficient insulation under plasma-arc fault explosions. ";
        financialImpact += "Compensable fatal injuries, total switchboard destruction downtime (costing upwards of ZAR 1.5M/day). ";
      }
    }

    if (complianceScore < 50) {
      riskLevel = "CRITICAL";
    } else if (complianceScore < 75) {
      riskLevel = "HIGH";
    } else if (complianceScore < 90) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    const generatedId = `AUD-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toISOString().split("T")[0];

    return {
      auditSummary: {
        complianceScore: Math.max(10, complianceScore),
        riskLevel,
        regulatoryFrameworksChecked: frameworks,
        primaryThreatIdentified: threats[0] || "None - Gear aligns with primary localized SANS guidelines"
      },
      riskAnalysis: {
        theVillain: villainText || "Minor unmitigated equipment friction gaps.",
        technicalDeficitReasoning: techDeficit || "Standard mechanical wear on personal protective garments.",
        potentialFinancialImpact: financialImpact || "No direct DMRE action. Maintain current proactive equipment refresh cycles."
      },
      complianceActionPlan: {
        theVow: "To enforce permanent safety alignment under South African safety benchmarks.",
        immediateRemediationSteps: remediation.length > 0 ? remediation : ["Conduct continuous quarterly fitment checks", "Record all PPE washing cycles"],
        requiredMaterialSpecifications: {
          fabricTypeRequired: requiredFabricType,
          minimumPerformanceRating: requiredArcMin,
          footwearSpecification: requiredFootwear
        }
      },
      vendorMatchingCriteria: {
        targetSupplierCategory: "SANS-Certified Protective Equipment Distributors",
        bulkOrderSpecsSummary: `Requires protective uniforms and safety boots meeting SANS 20345 specifications.`
      },
      historyLog: {
        id: generatedId,
        date: dateStr,
        mineName: params.mineName || "Melotwo Mine Shaft 2",
        complianceScore: Math.max(10, complianceScore),
        riskLevel,
        summary: threats[0] || "Compliant safety posture under current inventory checks."
      },
      riskHeatmap: {
        likelihood: complianceScore < 60 ? "Almost Certain" : complianceScore < 80 ? "Likely" : "Possible",
        consequence: hasFlashFire ? "Catastrophic" : hasAMD ? "Major" : "Moderate",
        score: `${Math.max(10, complianceScore)}/100`,
        zone: riskLevel,
        mitigation: remediation[0] || "Maintain quarterly safety gear audit audits."
      },
      pdfExport: {
        title: "OFFLINE SANS COMPLIANCE AUDIT RECORD",
        subtitle: `${params.mineName || "Melotwo Mine Shaft 2"} - Compiled Offline`,
        sections: [
          {
            header: "1. Executive Summary & Scoring",
            content: [`Compliance Score: ${Math.max(10, complianceScore)}/100 (Risk: ${riskLevel})`, `Primary threat: ${threats[0] || "None detected."}`]
          },
          {
            header: "2. Technical Material Defense Assessment",
            content: [villainText || "Inventory fully matched to regional SANS hazard blueprints."]
          }
        ]
      },
      _fallback: true
    };
  };

  // Execute the audit by calling our server.ts backend endpoint
  const handleRunAudit = async (params: MineParams, dailyShiftCheck?: boolean, dailyDstiCheck?: boolean) => {
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentParams(params);

    // Save parameters locally to browser's localStorage immediately (Frontline offline resilience)
    try {
      localStorage.setItem("last_sans_params", JSON.stringify(params));
    } catch (e) {
      console.error("Local caching of audit parameters failed", e);
    }

    // Dynamic premium check
    const currentIsPremium = localStorage.getItem("sans_trial_active") === "true";
    let countToUse = auditCount;
    
    if (!dailyShiftCheck && !dailyDstiCheck) {
      countToUse = auditCount + 1;
      setAuditCount(countToUse);
      localStorage.setItem("sans_audit_count", countToUse.toString());
    }

    // Optimization for static deployments (e.g. GitHub Pages) or offline network states
    const isStaticDeploy = window.location.hostname.includes("github.io") || !navigator.onLine;

    if (isStaticDeploy) {
      // Instant standalone client-side calculation to bypass non-existent server
      setTimeout(() => {
        try {
          const reportData = getClientSideAuditReport(params, dailyShiftCheck, dailyDstiCheck);
          setAuditReport(reportData);
          setPaywallResponse(null);

          // Save to history logs
          if (reportData.historyLog) {
            setAuditHistory(prev => {
              const updated = [reportData.historyLog, ...prev.filter(h => h.id !== reportData.historyLog.id)];
              const trimmed = updated.slice(0, 10);
              localStorage.setItem("sans_audit_history", JSON.stringify(trimmed));
              return trimmed;
            });
          }
        } catch (err: any) {
          console.error("Local client-side audit engine error:", err);
          setErrorMsg("Local compliance evaluator failed to resolve. Check parameters.");
        } finally {
          setIsLoading(false);
        }
      }, 500);
      return;
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
          daily_shift_check: dailyShiftCheck ? true : false,
          daily_dsti_check: dailyDstiCheck ? true : false
        })
      });

      if (!response.ok) {
        throw new Error(`Technical Server Error (Status ${response.status})`);
      }

      const reportData = await response.json();
      
      if (reportData.status === "paywall_locked") {
        setPaywallResponse(reportData);
        setAuditReport(null);
      } else {
        setAuditReport(reportData);
        setPaywallResponse(null);

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
      console.warn("Server node unavailable. Falling back to local offline-safe SANS evaluator.", err);
      // Beautiful seamless fallback to high-fidelity client-side calculations
      try {
        const fallbackReport = getClientSideAuditReport(params, dailyShiftCheck, dailyDstiCheck);
        setAuditReport(fallbackReport);
        setPaywallResponse(null);
        if (fallbackReport.historyLog) {
          setAuditHistory(prev => {
            const updated = [fallbackReport.historyLog, ...prev.filter(h => h.id !== fallbackReport.historyLog.id)];
            const trimmed = updated.slice(0, 10);
            localStorage.setItem("sans_audit_history", JSON.stringify(trimmed));
            return trimmed;
          });
        }
      } catch (fallbackErr) {
        setErrorMsg("Failed to establish server connection and local SANS evaluator is unavailable.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAudit = () => {
    setAuditReport(null);
    setPaywallResponse(null);
    setErrorMsg(null);
  };

  if (showLanding) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/35 selection:text-slate-100 relative overflow-hidden" id="melotwo-safety-landing">
        {/* Amber glowing background ambient highlights */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

        {/* Top bar warning stripe */}
        <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#090d16_10px,#090d16_20px)]" />

        {/* Header container */}
        <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-950/45 shrink-0 border border-amber-400/25">
              <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" id="landing-logo-shield" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black uppercase tracking-tight text-amber-500 font-display">MELOTWO</span>
                <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                  S-Tier SECURE
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">PORTAL ID: ZA-9942-K</span>
            </div>
          </div>
          <div className="text-xs font-mono bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-amber-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>SHEQ CORE READY</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center py-12 md:py-20 relative z-10">
          <div className="text-center max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              DMRE Compliance &amp; Litigation Defense Engine
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-slate-100 font-display leading-[1.1]" id="landing-hero-heading">
              Melotwo Mine <span className="text-amber-500">Safety Engine</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans">
              Advanced compliance audit terminal for South African National Standards (<strong className="text-amber-400">SANS 724, 20345, and 434</strong>). Defend deep-level operations against invisible material decay and safety litigation risks.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setShowLanding(false)}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black px-8 py-4 rounded-xl text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-950/40 cursor-pointer flex items-center justify-center gap-2 group font-sans"
                id="cta-secure-audit"
              >
                Secure Your Operational Audit
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setShowLanding(false)}
                className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-wider transition-all cursor-pointer font-sans"
                id="cta-explore-platform"
              >
                Explore the Platform
              </button>
            </div>
          </div>

          {/* Grid highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16 md:mt-24">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-sm hover:border-amber-500/30 transition-colors" id="feature-sans-audit">
              <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-display">S-Tier SANS Auditing</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Audit material resilience including inherent aramid atomic-level flame retardancy versus surface chemical treatments under severe South African thermal profiles.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-sm hover:border-amber-500/30 transition-colors" id="feature-offline-resilience">
              <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-display">Offline Fallback Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Full client-side fallback compliance calculators. Continue active pre-shift inspections and DSTI briefs securely even when underground or out of cell coverage.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-sm hover:border-amber-500/30 transition-colors" id="feature-degradation-simulator">
              <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                <Factory className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-display">Degradation Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Model chemical wash cycles, track polyurethane sole hydrolytic degradation under Acid Mine Drainage (AMD), and maintain rigorous SHEQ oversight.
              </p>
            </div>
          </div>
        </main>

        {/* Quiet footer */}
        <footer className="border-t border-slate-900 py-6 text-center text-[11px] text-slate-500 relative z-10 bg-slate-950" id="landing-footer">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 font-mono">
              <Users className="w-4 h-4 text-amber-500" />
              <span className="font-bold tracking-wider uppercase">SANS COMPLIANCE INTERFACE</span>
            </div>
            <p className="font-sans text-slate-650">
              Approved for regulatory risk mitigation under DMRE guidelines. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

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

      {/* Offline Mode Banner */}
      <div className="bg-amber-500 text-slate-950 font-sans text-xs px-4 py-2 flex items-center justify-center gap-2 font-bold shadow-md select-none relative z-40 shrink-0 print:hidden" id="offline-mode-status-banner">
        <Database className="w-4 h-4 animate-pulse shrink-0 text-slate-950" />
        <span>Running in Offline-Safe Local Mode. Data saved to device.</span>
        <span className="hidden md:inline bg-slate-950 text-amber-400 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded font-mono uppercase">
          SANS &amp; DSTI Active
        </span>
      </div>

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
