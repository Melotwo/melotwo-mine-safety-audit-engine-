import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request payloads
app.use(express.json());

// Helper to sanitize/validate parameters and provide static fallback response
// if GEMINI_API_KEY is not configured or fails.
function getSANSFallbackAudit(params: any): any {
  const { miningSector, depthLevel = 1000, environmentHazards = [], currentPPE = {} } = params;
  const fabric = currentPPE.fabricType || "D59 Cotton";
  const washCycles = Number(currentPPE.fabricWashCycles) || 0;
  const footwear = currentPPE.footwearSoleMaterial || "Standard PU (Polyurethane)";
  const arcRating = currentPPE.arcRatingValue || "No rating";

  let complianceScore = 85;
  const frameworks = ["SANS 434"]; // Standard South African workwear blueprint
  const threats: string[] = [];
  const remediation: string[] = [];
  let riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  
  let villainText = "";
  let techDeficit = "";
  let financialImpact = "";
  let coreVow = "";
  let requiredFabricType = "Inherent FR Blend (Aramid/Modacrylic)";
  let requiredArcMin = "8 cal/cm²";
  let requiredFootwear = "Vulcanized AMD-resistant Nitrile Sole (SANS 20345)";

  // 1. Audit Footwear & Acid Mine Drainage (AMD) / Rubbing hazards
  const hasAMD = environmentHazards.includes("Acid Mine Drainage") || depthLevel > 1500 || miningSector === "gold";
  if (hasAMD) {
    frameworks.push("SANS 20345");
    if (footwear.includes("PU") || footwear.includes("Polyurethane")) {
      complianceScore -= 25;
      threats.push("Acid Mine Drainage Sole Disintegration");
      remediation.push("Immediately replace standard PU (Polyurethane) safety boots with dual-density vulcanized Nitrile rubber soles.");
      villainText += "Acid Mine Drainage (AMD) containing sulfuric acid from deep pyritic strata directly reacts with and disintegrates Polyurethane outsoles. ";
      techDeficit += "PU soles suffer hydrolytic attack when exposed to underground acidic water, making them brittle and leading to sudden tread loss or sole shearing within 4-6 weeks structure fatigue. ";
      financialImpact += "Worker slip-and-fall injuries, exposure to caustic acidic waters, medical claims, and standard SANS 20345 non-compliance fines up to ZAR 500k per occurrence under the SA Mine Health and Safety Act. ";
    }
  }

  // 2. Audit FR vs PolyCotton or Treated Wash cycle failure
  const isCoal = miningSector === "coal";
  const hasFlashFire = environmentHazards.includes("Thermal/Flash Fire") || isCoal || environmentHazards.includes("Electric Arc");
  if (hasFlashFire) {
    if (isCoal) frameworks.push("SANS 1423 (Performance requirements for flame-retardant textiles)");
    if (environmentHazards.includes("Electric Arc")) frameworks.push("SANS 724 (Personal Protective Equipment - Arc Flash protection)");

    const isPoly = fabric.includes("Poly");
    const isTreated = fabric.includes("Treated");
    
    if (isPoly) {
      complianceScore -= 40;
      threats.push("Polyester Melting & Skin Fusion Threat");
      remediation.push("Ban all polyester-blend garments from active underground or smelter faces. Enforce inherent non-melting protection.");
      villainText += "Synthetic plastic fabrics in explosive/combustible thermal zones. ";
      techDeficit += "Polyester under extreme high-temperature electric arc or flash fire shocks melts directly into severe, deep-dermal third-degree burns, bonding molten nylon monomers to human skin. ";
      financialImpact += "ZAR Millions in employee critical-care treatment, legal litigation under section 86 of the MHSA, and potential immediate Section 54 shaft shutdown instructions by the DMRE inspectorate. ";
    } else if (isTreated && washCycles > 30) {
      complianceScore -= 20;
      threats.push("Invisible FR Protection Wash-out Gaps");
      remediation.push("Institute a strict RFID/barcode laundering tracking manifest or migrate to inherent atomic-level FR fibers.");
      villainText += "Flame-retardant capabilities leaching away invisibly during laundry cycles. ";
      techDeficit += "Treated Flame-Retardant cotton relies on surface chemical coatings (e.g., Pyrovatex or Proban). Regular harsh mine washing degrades these surface chemicals over 30-50 wash cycles, leaving the worker clad in plain, volatile combustible cotton while believing they are secure. ";
      financialImpact += "Catastrophic third-degree burns during flash fire ignitions, severe liability for SHEQ officers who failing to track garment service history, and massive civil claims. ";
    } else if (isTreated && washCycles <= 30) {
      complianceScore -= 5;
      remediation.push("Ensure strict laundry-count logging to avoid exceeding the safety lifetime of current treated FR apparel.");
    }
  }

  // 3. Electric arc specific scores
  if (environmentHazards.includes("Electric Arc")) {
    if (arcRating === "No rating" || parseInt(arcRating) < 8) {
      complianceScore -= 20;
      threats.push("Insufficient Electric Arc Blast PPE Rating");
      remediation.push("Upgrade all electrical switching and heavy equipment handling staff to certified SANS 724 garments with Arc Thermal Performance Value (ATPV) exceeding 8 cal/cm² (HRC 2).");
      villainText += "Sub-standard ATPV clothing exposed to high-energy substation switches. ";
      techDeficit += "Current garments offer insufficient insulation under plasma-arc fault explosions, transmitting thermal energies surpassing skin thresholds and triggering severe secondary cell death. ";
      financialImpact += "Compensable fatal injuries, total switchboard destruction downtime (costing upwards of ZAR 1.5M/day), and institutional legal risk. ";
    }
  }

  // General check for low rating
  if (complianceScore < 50) {
    riskLevel = "CRITICAL";
  } else if (complianceScore < 75) {
    riskLevel = "HIGH";
  } else if (complianceScore < 90) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  // Final default strings if not customized
  if (!villainText) {
    villainText = "General unnoted regulatory or wear degradation gap.";
  }
  if (!techDeficit) {
    techDeficit = "Sub-optimal protection. Cotton fibers under heavy humidity lose insulation value and increase sweat-induced electrical conductivity risks.";
  }
  if (!financialImpact) {
    financialImpact = "ZAR 100k - ZAR 250k potential regulatory audit warning fines.";
  }

  coreVow = `Engineering absolute safety protection: We pledge to eliminate ${riskLevel} risks by deploying fully verified, high-performance inherent materials certified to South African mining standards.`;

  // 1. History Log
  const historyLog = {
    id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split("T")[0],
    mineName: params.mineName || "Melotwo Mine Shaft 2",
    complianceScore: Math.max(0, complianceScore),
    riskLevel,
    summary: threats[0] || "General SANS industrial safety standard audit conducted on deep sublevel PPE."
  };

  // 2. Risk Heatmap
  let likelihood = "Possible";
  let consequence = "Moderate";
  if (riskLevel === "CRITICAL") {
    likelihood = "Almost Certain";
    consequence = "Catastrophic";
  } else if (riskLevel === "HIGH") {
    likelihood = "Likely";
    consequence = "Major";
  } else if (riskLevel === "MEDIUM") {
    likelihood = "Possible";
    consequence = "Moderate";
  } else {
    likelihood = "Rare";
    consequence = "Minor";
  }

  const riskHeatmap = {
    likelihood,
    consequence,
    score: `${complianceScore}/100`,
    zone: riskLevel,
    mitigation: remediation[0] || "Ensure high-vis fabrics are clean and sole tread depth exceeds SANS limits."
  };

  // 3. PDF Export format sections
  const pdfExport = {
    title: `SANS SAFETY COMPLIANCE REPORT`,
    subtitle: `Authorized Audit - ${params.mineName || "Melotwo Mine"} (${(miningSector || "GOLD")?.toUpperCase()})`,
    sections: [
      {
        header: "1. Executive Summary & Scoring",
        content: [
          `This document certifies the SANS compliance audit conducted on ${params.mineName || "Melotwo Mine"}.`,
          `Current SANS Compliance Score: ${complianceScore}/100.`,
          `Subterranean Threat Profile: ${threats[0] || "No severe structural PPE non-conformances detected."}`
        ]
      },
      {
        header: "2. Deep-Sublevel Hazard Mapping",
        content: [
          `Identified operational sector: ${(miningSector || "GOLD")?.toUpperCase()} sector face operating at ${depthLevel} meters.`,
          `Physical risk analysis: ${villainText.trim() || "PPE material specifications are within nominal limits."}`,
          `Technical degradation deficit: ${techDeficit.trim() || "No micro-structure material fatigue detected."}`
        ]
      },
      {
        header: "3. Directives & Action Plan",
        content: [
          `The Chief Safety Officer commits to: ${coreVow}`,
          ...remediation.map((step, i) => `${i + 1}. ${step}`)
        ]
      }
    ]
  };

  return {
    auditSummary: {
      complianceScore: Math.max(0, complianceScore),
      riskLevel,
      regulatoryFrameworksChecked: Array.from(new Set(frameworks)),
      primaryThreatIdentified: threats[0] || "Undocumented hazard/gaps overlap"
    },
    riskAnalysis: {
      theVillain: villainText.trim(),
      technicalDeficitReasoning: techDeficit.trim(),
      potentialFinancialImpact: financialImpact.trim()
    },
    complianceActionPlan: {
      theVow: coreVow,
      immediateRemediationSteps: remediation.length > 0 ? remediation : ["Conduct immediate site inspections and confirm label certifications of all subterranean shift suits."],
      requiredMaterialSpecifications: {
        fabricTypeRequired: requiredFabricType,
        minimumPerformanceRating: requiredArcMin,
        footwearSpecification: requiredFootwear
      }
    },
    vendorMatchingCriteria: {
      targetSupplierCategory: "Industrial SHEQ / SANS Certified Mining Outfitters (South Africa)",
      bulkOrderSpecsSummary: `Requires inherent thermal-protective mine fatigues and SANS 20345 dual-density nitrile-soled protective safety footwear tailored for the South African labor demographic.`
    },
    historyLog,
    riskHeatmap,
    pdfExport
  };
}

function getDailyShiftFallbackBriefing(params: any): any {
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
    }
  };
}

// REST API for detailed PPE Compliance Auditing
app.post("/api/audit", async (req, res) => {
  try {
    const params = req.body;
    
    // Extract critical paywall variables passed in the system context
    const auditCount = Number(params.audit_count) || 0;
    const isPremium = params.is_premium === true || params.is_premium === "true";
    const dailyShiftCheck = params.daily_shift_check === true || params.daily_shift_check === "true";

    // Rigid Gatekeeping: If audit count is greater than 3 and the user is not premium,
    // AND this is NOT a daily shift check (which is always free), halt processing immediately.
    if (auditCount > 3 && !isPremium && !dailyShiftCheck) {
      console.log(`[Gatekeeper Alert] Hard Paywall Triggered. audit_count: ${auditCount}, is_premium: ${isPremium}`);
      return res.status(200).json({
        status: "paywall_locked",
        message: "You have reached the limit of your 3 free compliance audits. To unlock unlimited audits, continuous monitoring, and official reporting features, please upgrade to our premium tier.",
        trigger_payment_gateway: true,
        gateway: "Paystack"
      });
    }

    // Check if the user has an active Gemini API key configured
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      // Return high-quality localized standard algorithm output
      if (dailyShiftCheck) {
        console.log("No valid GEMINI_API_KEY. Using local Daily Shift Briefing fallback.");
        const fallbackResult = getDailyShiftFallbackBriefing(params);
        return res.json(fallbackResult);
      } else {
        console.log("No valid GEMINI_API_KEY. Using local South African Mine Standards engine fallback.");
        const mockResult = getSANSFallbackAudit(params);
        return res.json(mockResult);
      }
    }

    try {
      // Lazy initialization of the Gemini SDK inside the request context
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      if (dailyShiftCheck) {
        const systemPrompt = `You are a high-engagement, safety-focused SHEQ shift officer for Melotwo Mine Safety.
Your task is to analyze the operational sector and mine details, then generate a fast, highly engaging, 60-second \"Daily Shift Safety Briefing & Pre-Descending Gear Check\" tailored specifically for the specified mine type.
Focus heavily on daily hazards (e.g., checking boot sole integrity for acid exposure, checking high-vis clothing reflectivity, helmet degradation, atmospheric checks). Keep it concise, motivational, and extremely easy for everyday underground mine workers to read on a mobile device during morning toolbox meetings.

Output strictly valid JSON matching this schema. Do not include markdown ticks or conversational text:
{
  "dailyShiftBriefing": {
    "briefingTitle": "<A strong, motivational toolbox title, e.g., Gold Shaft 2 Pre-Descending Briefing>",
    "mineType": "<The capitalized mine type name, e.g. Gold / Coal / Platinum>",
    "hazardsOverview": "<A concise 2-sentence overview of the specific daily hazards to expect in this sector (e.g. wet slick floors, high heat, pyritic acid, coal dust, ventilation leaks)>",
    "gearChecklist": [
      "Checklist item 1 (Focus on checking boot soles/material, leather degradation, water ingress)",
      "Checklist item 2 (Focus on checking high-vis state, vest dirt/grease layers, or strip state)",
      "Checklist item 3 (Focus on helmet, batteries, or breathing safety rescue packs)",
      "Checklist item 4 (Focus on gloves, grip fatigue, or mechanical protection)"
    ],
    "toolboxMessage": "<A fast, highly engaging 60-second safety message to motivate workers to keep their gear checked and return home safely to their families. Keep it warm but firm.>"
  },
  "auditSummary": {
    "complianceScore": 100,
    "riskLevel": "LOW",
    "regulatoryFrameworksChecked": ["SANS 20345", "SANS 434"],
    "primaryThreatIdentified": "None - Shift check successful"
  },
  "riskAnalysis": { "theVillain": "complacency", "technicalDeficitReasoning": "uninspected gear", "potentialFinancialImpact": "0" },
  "complianceActionPlan": { "theVow": "Stay vigilant.", "immediateRemediationSteps": ["Check gear"], "requiredMaterialSpecifications": { "fabricTypeRequired": "FR", "minimumPerformanceRating": "8", "footwearSpecification": "Nitrile" } },
  "vendorMatchingCriteria": { "targetSupplierCategory": "Outfitters", "bulkOrderSpecsSummary": "Daily check" }
}`;

        const promptMsg = `Generate Daily Shift Safety Briefing for:
- Sector/Mine Type: ${params.miningSector || "gold"}
- Mine Name: ${params.mineName || "Melotwo Mine Shaft 2"}
- Staffing Headcount: ${params.headcount || 120} workers`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptMsg,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.25,
          }
        });

        const rawText = response.text || "";
        const cleanedJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsedBriefing = JSON.parse(cleanedJson);
        return res.json(parsedBriefing);
      }

      const systemPrompt = `You are the lead engineering auditor and chief SHEQ (Safety, Health, Environment, Quality) compliance officer for the Melotwo Mine Safety Compliance & PPE Audit Engine.
Your task is to analyze details. You operate strictly under South African National Standards (SANS) and South African Department of Mineral Resources and Energy (DMRE) guidelines.

Evaluate the provided mine details and output a beautifully formulated, legally rigorous audit in the requested JSON structure.
Be deeply technical, authoritative, and specify the physical mechanisms of material failure (e.g., hydrolytic disintegration of polyurethane soles, wash-decay of Pyrovatex treated FR coating, thermal bonding of nylon polymers onto human skin, sweat-conductivity). Differentiate heavily between:
- \"Treated FR cotton\" (Proban/Pyrovatex coatings) which degrade and wash off (making it an invisible hazard)
- \"Inherent FR\" (Nomex, Kevlar, Modacrylic/Aramid blends) which has permanent atomic-level fire protection.

Output strictly valid JSON matching the exact schema. Do not output any markdown ticks, conversational text, or preamble outside the JSON payload. Only return raw, parseable JSON.

Response JSON Schema:
{
  "auditSummary": {
    "complianceScore": <number between 0 and 100>,
    "riskLevel": "<CRITICAL | HIGH | MEDIUM | LOW>",
    "regulatoryFrameworksChecked": ["SANS 724", "SANS 20345", etc.],
    "primaryThreatIdentified": "<Main technical threat summary>"
  },
  "riskAnalysis": {
    "theVillain": "<Describe the hidden operational or physical risk threatening the workforce>",
    "technicalDeficitReasoning": "<Scientific or metallurgical explanation of why current gear fails underground conditions>",
    "potentialFinancialImpact": "<Describe DMRE section 54 liabilities, fines in ZAR, or production downtime impact>"
  },
  "complianceActionPlan": {
    "theVow": "<The definitive engineering commitment to correct this permanently>",
    "immediateRemediationSteps": ["Step 1", "Step 2", etc.],
    "requiredMaterialSpecifications": {
      "fabricTypeRequired": "<specific inherent fabric recommended>",
      "minimumPerformanceRating": "<e.g., ATPV >= 8.4 cal/cm2 or equivalent standard>",
      "footwearSpecification": "<specific sole and SANS classification requirement>"
    }
  },
  "vendorMatchingCriteria": {
    "targetSupplierCategory": "<Target manufacturer specifications in South Africa>",
    "bulkOrderSpecsSummary": "<Technical outline to copy-paste into procurement tenders>"
  },
  "historyLog": {
    "id": "<Unique audit ID, e.g. AUD-987412>",
    "date": "<Current date in YYYY-MM-DD format>",
    "mineName": "<The name of the mine audited>",
    "complianceScore": <The compliance score as a number>,
    "riskLevel": "<CRITICAL | HIGH | MEDIUM | LOW>",
    "summary": "<Short 1-sentence summary of the main finding>"
  },
  "riskHeatmap": {
    "likelihood": "<Likelihood value, e.g. Almost Certain | Likely | Possible | Rare>",
    "consequence": "<Consequence value, e.g. Catastrophic | Major | Moderate | Minor>",
    "score": "<Formatted score string, e.g. 16/25 (High) or 75/100>",
    "zone": "<Risk level, e.g. CRITICAL | HIGH | MEDIUM | LOW>",
    "mitigation": "<Primary technical recommendation to mitigate this risk>"
  },
  "pdfExport": {
    "title": "<Document title, e.g., SANS COMPLIANCE AUDIT CERTIFICATION>",
    "subtitle": "<Document subtitle showing mine name and date>",
    "sections": [
      {
        "header": "1. Executive Summary & Scoring",
        "content": ["Sentence 1 about the audit score and safety posture.", "Sentence 2 on primary threats and SANS certifications."]
      },
      {
        "header": "2. Sublevel Risk Exposure Analysis",
        "content": ["Sentence 1 detailing technical materials failure details like sole hydrolysis or treated FR wash-out.", "Sentence 2 detailing ZAR financial liabilities and Section 54 DMRE shutdown risks."]
      },
      {
        "header": "3. Immediate Corrective Action Directives",
        "content": ["Step 1 required.", "Step 2 required.", "Technical material specs required."]
      }
    ]
  }
}`;

      const promptMsg = `Mine Details to Audit:
- Sector: ${req.body.miningSector}
- Mine Name: ${req.body.mineName || "Melotwo Mine"}
- Shaft Depth: ${req.body.depthLevel} meters
- Headcount / Staffing: ${req.body.headcount} workers
- Environmental Hazards: ${JSON.stringify(req.body.environmentHazards)}
- Current PPE Garment Fabric: ${req.body.currentPPE?.fabricType || "D59 Untreated Cotton"}
- Garment Laundry Wash Cycles: ${req.body.currentPPE?.fabricWashCycles || 0} cycles
- Current Footwear Outsole: ${req.body.currentPPE?.footwearSoleMaterial || "Generic PU"}
- Footwear SANS Spec: ${req.body.currentPPE?.footwearSpecification || "None"}
- Electric Arc Rating: ${req.body.currentPPE?.arcRatingValue || "No rating"}`;

      // Call Gemini 3.5 Flash
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.15,
        }
      });

      const rawText = response.text || "";
      const cleanedJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsedAudit = JSON.parse(cleanedJson);
      
      // Send result back to the frontend
      return res.json(parsedAudit);

    } catch (apiError) {
      console.error("Gemini API Error, falling back to local SANS rules engine:", apiError);
      const fallbackResult = getSANSFallbackAudit(params);
      fallbackResult._fallback = true;
      res.json(fallbackResult);
    }

  } catch (err: any) {
    console.error("Server general audit error:", err);
    res.status(500).json({ error: err.message || "Failed to process compliance audit" });
  }
});

// Paystack 14-Day Free Beta Trial Deferred Subscription Endpoint
app.post("/api/paystack/initialize-trial", (req, res) => {
  try {
    const { enterpriseName, operationType, workforceSize, email } = req.body;
    
    if (!enterpriseName || !operationType || !workforceSize) {
      return res.status(400).json({ error: "Missing required onboarding parameters (enterpriseName, operationType, workforceSize)" });
    }

    // Defer billing start date by exactly 14 days for the trial period
    const trialStartDate = new Date();
    trialStartDate.setDate(trialStartDate.getDate() + 14);
    
    // Structure metadata/payload for Paystack subscription pipeline with deferred start date
    const paystackPayload = {
      email: email || "trial-onboarding@melotwo-safety.co.za",
      amount: "0", // Free trial initially
      plan: "SANS_ENTERPRISE_BETA_2026",
      start_date: trialStartDate.toISOString(), // Deferred billing start date
      metadata: {
        enterpriseName,
        operationType,
        workforceSize,
        trial_duration: "14 days",
        compliance_shield_active: true,
      }
    };

    console.log("Paystack Deferred Trial Subscription Initialized:", paystackPayload);

    return res.json({
      success: true,
      message: "14-Day Free Beta Trial activated successfully in our Paystack-deferred subscription pipeline.",
      trialStartDate: trialStartDate.toISOString().split("T")[0],
      paystackPayload
    });
  } catch (err: any) {
    console.error("Paystack trial initialization error:", err);
    res.status(500).json({ error: err.message || "Failed to initialize Paystack beta trial" });
  }
});

// Serve static/compiled frontend correctly
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Enable Vite as a middleware inside our Express container
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled assets from the dist directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mine Safety Compliance Compliance Engine running on http://localhost:${PORT}`);
  });
}

startServer();
