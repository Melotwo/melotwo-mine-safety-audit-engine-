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

    // Rigid Gatekeeping: If audit count is greater than 3 and the user is not premium, halt processing immediately.
    if (auditCount > 3 && !isPremium) {
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
      console.log("No valid GEMINI_API_KEY. Using local South African Mine Standards engine fallback.");
      const mockResult = getSANSFallbackAudit(params);
      return res.json(mockResult);
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
  }
}`;

      const promptMsg = `Mine Details to Audit:
- Sector: ${req.body.miningSector}
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
      // Let's add a small flag indicating fallback for auditing
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
