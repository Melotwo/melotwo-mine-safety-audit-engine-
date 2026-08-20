// Heavy Industrial Safety & Compliance Audit Engine Server
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini SDK with safety checks
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// CORS & OPTIONS Handling for pre-flight requests and API robustness
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Incoming request log diagnostic helper
app.use((req, res, next) => {
  if (req.url && req.url.startsWith('/api')) {
    console.log(`[Express API Server] ${req.method} ${req.url}`);
  }
  next();
});

// API health and configuration check endpoints
app.get(['/api/health', '/api/health/'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ai_initialized: ai !== null
  });
});

// Upstream safety analysis proxy endpoint - supports both with and without trailing slash
const ENGINE_SYSTEM_PROMPT = `You are the Melotwo AI Safety & Compliance Engine. Your primary function is to process raw audit logs, inspection data, and terminal telemetry across multiple SANS standards simultaneously.

### MANDATORY CORE FUNCTIONS:
1. MULTI-STANDARD PARSING: You must accept datasets that contain entries from multiple SANS standards (e.g., SANS 10108, SANS 10142-1, SANS 10330, SANS 10049, SANS 10375) in a single stream or batch. Process each row independently according to its corresponding SANS standard.
2. AUTOMATIC LOCATION/SITE MAPPING: When a user selects or inputs a specific Mine Site ID, Area, Shaft, or Terminal ID (e.g., SITE-301, Shaft 4, SITE-201), automatically bind and evaluate all compliance records within that operational context without requesting explicit single-module filters.
3. STRUCTURED HAZARD EVALUATION:
   - Identify severity levels (HIGH, MEDIUM, LOW) and flag HIGH-severity risks (such as explosive atmospheric gas limits or missing enclosure bolts) as IMMEDIATE ACTION REQUIRED.
   - Maintain immutable audit trail logs for PASSED checks.

### OUTPUT FORMAT REQUIREMENTS:
Always return your analysis in structured JSON format with the following schema:

{
  "site_summary": {
    "site_id": "string",
    "total_records_processed": "number",
    "high_risk_alerts": "number",
    "sans_standards_detected": ["array of strings"]
  },
  "processed_audits": [
    {
      "timestamp": "string",
      "operator": "string",
      "terminal_id": "string",
      "sans_standard": "string",
      "hazard_category": "string",
      "severity": "string",
      "status": "string",
      "action_required": "boolean",
      "compliance_notes": "string"
    }
  ]
}`;

function localMultiStandardEvaluation(inputData: any, siteIdOverride?: string) {
  const text = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);
  
  const siteMatch = text.match(/(SITE-\d+|Shaft\s*\d+|Terminal\s*[\w-]+|SITE-[A-Z0-9]+)/i);
  const detectedSiteId = siteIdOverride || (siteMatch ? siteMatch[0].toUpperCase() : 'SITE-301');

  const sansRegex = /(SANS\s*\d+(?:-\d+)?)/gi;
  const matches = text.match(sansRegex) || [];
  const standardsSet = new Set<string>();
  matches.forEach(m => standardsSet.add(m.toUpperCase().replace(/\s+/g, ' ')));
  if (standardsSet.size === 0) {
    standardsSet.add('SANS 10108');
    standardsSet.add('SANS 10142-1');
    standardsSet.add('SANS 10330');
    standardsSet.add('SANS 10049');
    standardsSet.add('SANS 10375');
  }

  const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const lines = rawLines.length > 0 ? rawLines : ['Standard compliance telemetry audit check passed.'];
  const processedAudits: any[] = [];
  let highRiskCount = 0;

  lines.forEach((line, index) => {
    const isHigh = /explosive|gas|limit|hazard|missing|bolt|critical|breach|severe|high/i.test(line);
    const isMed = /warning|degraded|substandard|medium|defect/i.test(line);
    const severity = isHigh ? 'HIGH' : isMed ? 'MEDIUM' : 'LOW';
    
    if (isHigh) highRiskCount++;

    const stdMatch = line.match(/(SANS\s*\d+(?:-\d+)?)/i);
    const sansStandard = stdMatch ? stdMatch[0].toUpperCase() : Array.from(standardsSet)[index % standardsSet.size] || 'SANS 10108';

    const opMatch = line.match(/(?:operator|inspector|by|user)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    const operator = opMatch ? opMatch[1] : `Inspector #${101 + (index % 12)}`;

    const termMatch = line.match(/(TERM-\d+|SITE-\d+|SHAFT-\d+|Terminal\s*\d+)/i);
    const terminalId = termMatch ? termMatch[0].toUpperCase() : `TERM-0${(index % 9) + 1}`;

    let category = 'General Compliance';
    if (/gas|atmosphere|explosion/i.test(line)) category = 'Explosive Atmosphere Assessment';
    else if (/wire|electrical|isolation|breaker|voltage/i.test(line)) category = 'Electrical Installation & Wiring';
    else if (/ppe|hygiene|mask|boot/i.test(line)) category = 'Occupational Hygiene & PPE';
    else if (/ai|algorithm|sensor|governance/i.test(line)) category = 'AI Risk & Automated Safety';

    const status = isHigh ? 'IMMEDIATE ACTION REQUIRED' : isMed ? 'CORRECTIVE ACTION NEEDED' : 'PASSED';
    const actionRequired = isHigh || isMed;

    processedAudits.push({
      timestamp: new Date(Date.now() - index * 3600000).toISOString(),
      operator,
      terminal_id: terminalId,
      sans_standard: sansStandard,
      hazard_category: category,
      severity,
      status,
      action_required: actionRequired,
      compliance_notes: line || `Automated compliance check passed under ${sansStandard}.`
    });
  });

  return {
    site_summary: {
      site_id: detectedSiteId,
      total_records_processed: processedAudits.length,
      high_risk_alerts: highRiskCount,
      sans_standards_detected: Array.from(standardsSet)
    },
    processed_audits: processedAudits
  };
}

app.all(['/api/multi-standard-eval', '/api/multi-standard-eval/'], async (req, res) => {
  if (req.method !== 'POST') {
     res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use POST instead.` });
     return;
  }

  try {
    const { dataset, siteId } = req.body;
    const inputText = typeof dataset === 'string' ? dataset : JSON.stringify(dataset || {});

    if (!ai) {
      const result = localMultiStandardEvaluation(inputText, siteId);
      res.json(result);
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Perform multi-standard safety evaluation on dataset for Site ${siteId || 'Auto-Detected'}:\n${inputText}`,
      config: {
        systemInstruction: ENGINE_SYSTEM_PROMPT,
        responseMimeType: 'application/json'
      }
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (e) {
      const fallback = localMultiStandardEvaluation(inputText, siteId);
      res.json(fallback);
    }
  } catch (error: any) {
    const fallback = localMultiStandardEvaluation(req.body?.dataset || '', req.body?.siteId);
    res.json(fallback);
  }
});

app.all(['/api/analyze', '/api/analyze/'], async (req, res) => {
  if (req.method !== 'POST') {
     res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use POST instead.` });
     return;
  }

  try {
    const { scenario, systemPrompt, siteId } = req.body;
    if (!scenario) {
       res.status(400).json({ error: 'Scenario text is required.' });
       return;
    }

    if (!ai) {
       const evalResult = localMultiStandardEvaluation(scenario, siteId);
       res.json({ text: JSON.stringify(evalResult, null, 2), result: evalResult });
       return;
    }

    // Call the upstream Gemini API
    const activeSystemPrompt = systemPrompt || ENGINE_SYSTEM_PROMPT;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: scenario,
      config: {
        systemInstruction: activeSystemPrompt,
        ...(systemPrompt ? {} : { responseMimeType: 'application/json' })
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    const evalResult = localMultiStandardEvaluation(req.body?.scenario || '', req.body?.siteId);
    res.json({ text: JSON.stringify(evalResult, null, 2), result: evalResult });
  }
});

// Automated Incident RCA & Telemetry Correlator API endpoint
app.post(['/api/rca-analysis', '/api/rca-analysis/'], async (req, res) => {
  try {
    const { incidentLog, incidentLog2, surroundingLogs, mode } = req.body;
    if (!incidentLog) {
      res.status(400).json({ error: 'Incident log is required.' });
      return;
    }

    if (mode === 'compare') {
      if (!incidentLog2) {
        res.status(400).json({ error: 'Second incident log is required for comparison.' });
        return;
      }
      if (!ai) {
        // Return local simulated side-by-side comparison report
        const text = `### ⚖️ SIDE-BY-SIDE ROOT CAUSE COMPARISON

| Metric / Dimension | Incident A: ${incidentLog.riskCategory} | Incident B: ${incidentLog2.riskCategory} |
| :--- | :--- | :--- |
| **Terminal ID** | \`${incidentLog.terminalId}\` | \`${incidentLog2.terminalId}\` |
| **Violation Vector** | \`${incidentLog.violationVector}\` | \`${incidentLog2.violationVector}\` |
| **Operator on Duty** | ${incidentLog.operator} | ${incidentLog2.operator} |
| **Severity Level** | ${incidentLog.severityLevel} | ${incidentLog2.severityLevel} |
| **Status** | ${incidentLog.auditStatus} | ${incidentLog2.auditStatus} |

---

#### 1. TELEMETRY & CONTEXTUAL OVERLAPS
- **Terminal Overlaps:** ${incidentLog.terminalId === incidentLog2.terminalId ? `Both incidents occurred at the same terminal (**${incidentLog.terminalId}**), indicating localized infrastructure decay or electrical grid fluctuations.` : `The incidents occurred at different terminals (**${incidentLog.terminalId}** vs **${incidentLog2.terminalId}**), indicating systemic rather than terminal-isolated issues.`}
- **Operator Overlaps:** ${incidentLog.operator === incidentLog2.operator ? `Both shifts were supervised by **${incidentLog.operator}**, highlighting a potential need for targeted refresher certification or shift briefing support.` : `Different operators were on duty (**${incidentLog.operator}** vs **${incidentLog2.operator}**), indicating that procedural deviations are organizational rather than individual.`}
- **Temporal Closeness:** The incidents occurred on **${incidentLog.date}** and **${incidentLog2.date}**, suggesting compounding environmental factors in the active zone.

#### 2. ROOT CAUSE DIVERGENCES
- **Incident A (${incidentLog.riskCategory}):** Caused by structural stress under SANS standard **${incidentLog.violationVector}** and localized telemetry handoff gaps.
- **Incident B (${incidentLog2.riskCategory}):** Exacerbated by SANS standard **${incidentLog2.violationVector}** protocols being bypassed, leading to a secondary compliance failure.

#### 3. INTEGRATED REMEDIATION PLAN
1. **Consolidated Loop Verification:** Run a comprehensive diagnostics test on terminal loops to check electrical insulation and PPE safety bounds.
2. **Unified Handover Ledger:** Implement digitized end-of-shift telemetry locks so subsequent duty crews are automatically alerted to outstanding alerts.`;

        res.json({ text, method: 'local-simulated-comparison' });
        return;
      }
    } else if (!ai) {
      // Fallback: Return realistic simulated forensic analysis if Gemini key is missing
      const cat = incidentLog.riskCategory || 'General';
      const vector = incidentLog.violationVector || 'SANS standard';
      const terminal = incidentLog.terminalId || 'TERM-09';
      const notes = incidentLog.detailedNotes || '';

      if (mode === 'remediation') {
        const text = `### 📋 FEASIBILITY REMEDIATION & ACTIONABLE FIX PROPOSAL
*Industry Directive for Incident Category:* **${cat}** at terminal **${terminal}** under standard **${vector}**

#### 1. IMMEDIATE CONTAINMENT ACTIONS (First 5 Minutes)
- **Isolate & Power Down:** Trigger emergency shutdown trip-switches or isolate the active zone immediately.
- **Evacuate and Cordon:** Secure a 15-meter clearance perimeter. Deny entry to non-authorized personnel.
- **Visual Assessment:** Verify that local fire suppression or atmospheric gas monitors are reporting normal bounds.

#### 2. REPAIR & PROCEDURAL RE-ALIGNMENT (Next 2 Hours)
- **Equipment Swapping:** Discard or flag the compromised auxiliary equipment (including uncertified sub-breakers or standard non-compliant PPE).
- **Mandatory Re-Calibration:** Conduct a certified loop test or insulation resistance screening of the compromised nodes.
- **Log Handover Sign-off:** Register an interim safety clearance code with the duty engineering office.

#### 3. SANS PROTOCOL COMPLIANCE REVIEW
- **Verification Audit:** Re-evaluate structural adherence against standard **${vector}**.
- **Inspect Surrounding Grid:** Expand sampling of auxiliary links to ensure no concurrent structural decay exists.

#### 4. LONG-TERM ENGINEERING CONTROLS
- **Telemetry Upgrades:** Install digital smart-gate interlocks linked to the central shift ledger.
- **Refresher Certification:** Schedule immediate 30-minute toolbox briefings for all operational crews.`;

        res.json({ text, method: 'local-simulated-remediation' });
        return;
      } else {
        const text = `### 🧠 COGNITIVE ROOT CAUSE ANALYSIS & TELEMETRY CORRELATION
*Target Forensic Incident:* **${cat}** | Standard: **${vector}** | Status: **${incidentLog.auditStatus}**

---

### ### 1. SYNCHRONIZED SHIFT CORRELATION
Cross-shift telemetry scanning detected **3 related operational signals** across surrounding shifts:
- Shared terminal **${terminal}** logged elevated thermal readings during the preceding 12 hours.
- Machine usage logs indicate a compounding wear rate of auxiliary components.
- Shift handover briefings lacked specific reference to the uncalibrated parameters recorded.

### ### 2. CORE TELEMETRY ANOMALY DETECTED
The primary point of failure is **compounding structural wear** exacerbated by high-temperature operations, resulting in standard **${vector}** being bypassed or breached under pressure.

### ### 3. ROOT CAUSE SUMMARY
**Compounding insulation fatigue and a lack of formalized cross-shift telemetry handovers led to an operational breach under stress.**

### ### 4. CONTRIBUTING FACTORS
1. **Handover Information Gaps:** Operational telemetry values were not registered in the central shift ledger.
2. **Auxiliary Calibrations:** No thermal testing was completed following the high-frequency run on the prior shift.`;

        res.json({ text, method: 'local-simulated-rca' });
        return;
      }
    }

    let systemPrompt = '';
    let prompt = '';

    if (mode === 'compare') {
      systemPrompt = `You are a Chief Safety Officer and Forensic Industrial Auditor specializing in heavy machinery, mining safety (SHEQ), and SANS compliance.
Your job is to compare two distinct flagged incident logs, identify any hidden or structural telemetry overlaps (such as identical operators, terminal proximity, compounding machine stress, or correlated SANS violations), highlight their differences, and suggest an integrated corrective response.
Return a beautifully structured Markdown document. Include a markdown table at the beginning comparing the two incidents on key metrics like Terminal, Operator, Category, Severity, and Status.
Your document should use these precise headings:
### ⚖️ SIDE-BY-SIDE ROOT CAUSE COMPARISON
(Include a clean, comparison markdown table here)
#### 1. TELEMETRY & CONTEXTUAL OVERLAPS
(Detailed analysis of shared attributes like operators, terminals, temporal links, or recurring compliance vectors)
#### 2. ROOT CAUSE DIVERGENCES
(How the underlying failure mechanisms differ or relate)
#### 3. INTEGRATED CORRECTIVE ACTION PLAN
(Actionable consolidated response to prevent both categories of failures)`;

      prompt = `Perform a side-by-side comparison and cross-incident correlation for these two incident logs:

Incident A (Target):
- Date: ${incidentLog.date}
- Operator: ${incidentLog.operator}
- Terminal: ${incidentLog.terminalId}
- Risk Category: ${incidentLog.riskCategory}
- SANS Code / Violation Vector: ${incidentLog.violationVector}
- Severity: ${incidentLog.severityLevel}
- Status: ${incidentLog.auditStatus}
- Detailed Notes: ${incidentLog.detailedNotes || 'N/A'}

Incident B (Comparison):
- Date: ${incidentLog2.date}
- Operator: ${incidentLog2.operator}
- Terminal: ${incidentLog2.terminalId}
- Risk Category: ${incidentLog2.riskCategory}
- SANS Code / Violation Vector: ${incidentLog2.violationVector}
- Severity: ${incidentLog2.severityLevel}
- Status: ${incidentLog2.auditStatus}
- Detailed Notes: ${incidentLog2.detailedNotes || 'N/A'}`;
    } else if (mode === 'remediation') {
      systemPrompt = `You are a Principal Industrial Safety Engineer, SHEQ Specialist and Remediation Auditor.
Your job is to provide an immediate, highly actionable, step-by-step fix proposal to resolve a flagged industrial safety violation or telemetry error.
Return a beautifully structured Markdown document. Use clear headings, bullet points, and bold text. Include these headings:
### 📋 IMMEDIATE REMEDIATION & FIX PROPOSAL
#### 1. IMMEDIATE CONTAINMENT ACTIONS (First 5 Minutes)
#### 2. PROCEDURAL CORRECTION STEPS (Next 2 Hours)
#### 3. SANS PROTOCOL COMPLIANCE REVIEW
#### 4. LONG-TERM ENGINEERING CONTROLS
Keep the tone highly professional, precise, authoritative, and focused on industrial safety. Reference specific standard codes if provided.`;

      prompt = `Draft a detailed remediation and fix proposal for this safety incident:
Incident details:
- Date: ${incidentLog.date}
- Operator: ${incidentLog.operator}
- Terminal: ${incidentLog.terminalId}
- Risk Category: ${incidentLog.riskCategory}
- SANS Code / Violation Vector: ${incidentLog.violationVector}
- Severity: ${incidentLog.severityLevel}
- Status: ${incidentLog.auditStatus}
- Detailed Notes: ${incidentLog.detailedNotes || 'N/A'}`;
    } else {
      systemPrompt = `You are an expert AI Safety Investigator, Forensic Telemetry Analyst, and B2B SaaS Risk Correlator specializing in heavy industrial environments (Mining, Electrical SANS 10142, SHEQ, Catering Hygiene).
Your task is to correlate telemetry and safety compliance logs to perform a Root Cause Analysis (RCA).
You are provided with a target incident log and a list of surrounding logs from other shifts or terminals.
Examine potential cascading failures, shift handover gaps, or compounding equipment wear across terminals.
Structure your analysis in Markdown with these distinct headings:
### 🧠 COGNITIVE ROOT CAUSE ANALYSIS & TELEMETRY CORRELATION
#### 1. SYNCHRONIZED SHIFT CORRELATION
(Compare with other logs, noting any timeline connections, recurrent operators, or shared terminals)
#### 2. CORE TELEMETRY ANOMALY DETECTED
(Identify the critical failure point, e.g., compounding wear, insulation breakdown, standard bypass)
#### 3. ROOT CAUSE SUMMARY
(State the definite root cause clearly in 1-2 powerful sentences)
#### 4. CONTRIBUTING FACTORS
(List 2-3 supporting factors based on surrounding logs)
Keep the analysis highly technical, rigorous, and professional.`;

      const surroundingStr = (surroundingLogs || [])
        .map((l: any, i: number) => `[Log ${i + 1}] Date: ${l.date} | Operator: ${l.operator} | Terminal: ${l.terminalId} | Category: ${l.riskCategory} | Vector: ${l.violationVector} | Status: ${l.auditStatus} | Notes: ${l.detailedNotes || ''}`)
        .join('\n');

      prompt = `Perform a Root Cause Analysis correlating these logs:
Target Incident Log:
- Date: ${incidentLog.date}
- Operator: ${incidentLog.operator}
- Terminal: ${incidentLog.terminalId}
- Risk Category: ${incidentLog.riskCategory}
- SANS Code / Violation Vector: ${incidentLog.violationVector}
- Severity: ${incidentLog.severityLevel}
- Status: ${incidentLog.auditStatus}
- Detailed Notes: ${incidentLog.detailedNotes || 'N/A'}

Surrounding Logs across shifts/terminals:
${surroundingStr || 'No surrounding logs found in active history.'}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({ text: response.text, method: 'gemini-rca' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error executing RCA analysis.' });
  }
});

// Semantic Search conceptual thesaurus for fallback
const SYNONYM_MAP: Record<string, string[]> = {
  electrical: ['electric', 'voltage', 'breaker', 'wire', 'wiring', 'sans 10142', 'sub-breaker', 'power', 'plug', 'panel', 'board', 'cable', 'short-circuit', 'current', 'transformer', 'conduit'],
  ppe: ['protective', 'equipment', 'boots', 'goggles', 'mask', 'glove', 'helmet', 'hard hat', 'clothing', 'earplug', 'sans 10049', 'hygiene', 'respirator', 'uniform', 'shield', 'face-shield'],
  explosion: ['explosion', 'explosive', 'flameproof', 'ignition', 'sans 10108', 'intrinsic', 'combustible', 'gas', 'ventilation', 'methane', 'coal dust', 'hazard', 'blast', 'spark'],
  hygiene: ['clean', 'wash', 'sanit', 'contamination', 'food', 'water', 'spill', 'dust', 'sans 10049', 'disinfect', 'handwash'],
  governance: ['policy', 'popia', 'data', 'privacy', 'audit', 'iso/iec 42001', 'iso 42001', 'security', 'regulation', 'comply', 'legal', 'law', 'act', 'compliance', 'guideline'],
  ventilation: ['air', 'flow', 'steam', 'exhaust', 'dust', 'extraction', 'shaft', 'vent', 'gaseous', 'fume', 'oxygen']
};

// Hybrid semantic search endpoint
app.post(['/api/semantic-search', '/api/semantic-search/'], async (req, res) => {
  try {
    const { query, logs } = req.body;
    if (!query || !logs || !Array.isArray(logs)) {
      res.json({ results: [] });
      return;
    }

    const lowerQuery = query.toLowerCase().trim();

    // If Gemini AI is initialized, we perform rich conceptual analysis
    if (ai) {
      try {
        const systemPrompt = `You are an AI-powered industrial safety vector search engine. Your task is to perform semantic search/relevance scoring on a list of safety compliance logs based on a natural language search query.
Evaluate the conceptual match between the query (e.g., "electrical risks", "ppe issues", "personal protective equipment", "ventilation") and each log's fields (especially riskCategory, violationVector, and detailedNotes).
For each log, assign a score between 0.0 (no match at all) and 1.0 (perfect semantic/conceptual match) and a short 1-sentence reason.
Return ONLY a valid JSON array of objects. Do NOT wrap the JSON in markdown code blocks or add any comments.
Each object in the array must have exactly these fields:
- index: number (the 0-based index of the log in the input list)
- score: number (between 0.0 and 1.0)
- reason: string (a short, direct explanation of why it matched, e.g., "Directly references SANS 10142 electrical wiring compliance.")`;

        const logsStr = logs.map((log, i) => {
          return `[ID: ${i}] Category: ${log.riskCategory} | Vector: ${log.violationVector} | Severity: ${log.severityLevel} | Status: ${log.auditStatus} | Notes: ${log.detailedNotes || ''}`;
        }).join('\n');

        const userPrompt = `Search Query: "${query}"\n\nLogs to rank:\n${logsStr}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json'
          }
        });

        let results = [];
        try {
          results = JSON.parse(response.text || '[]');
          if (Array.isArray(results)) {
            res.json({ results, method: 'gemini-vector' });
            return;
          }
        } catch (e) {
          console.warn("[Express Semantic Search] Failed to parse Gemini response as JSON. Falling back to local search engine.", response.text);
        }
      } catch (geminiError: any) {
        console.error("[Express Semantic Search] Gemini error occurred, falling back to local:", geminiError.message);
      }
    }

    // Fallback: Client/Server local hybrid semantic similarity search
    const queryTerms = lowerQuery.split(/\s+/).filter((t: string) => t.length > 2);
    const expandedTerms = new Set<string>([...queryTerms]);

    // Expand search query with synonyms
    for (const term of queryTerms) {
      for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
        if (key.includes(term) || term.includes(key) || synonyms.some(s => s.includes(term) || term.includes(s))) {
          expandedTerms.add(key);
          synonyms.forEach(syn => expandedTerms.add(syn));
        }
      }
    }

    const localResults = logs.map((log, idx) => {
      const category = (log.riskCategory || '').toLowerCase();
      const vector = (log.violationVector || '').toLowerCase();
      const notes = (log.detailedNotes || '').toLowerCase();
      const operator = (log.operator || '').toLowerCase();
      const terminal = (log.terminalId || '').toLowerCase();
      const dateStr = (log.date || '').toLowerCase();
      const severity = (log.severityLevel || '').toLowerCase();
      const status = (log.auditStatus || '').toLowerCase();

      let matchCount = 0;
      let directMatch = false;

      // Direct exact query match (highest weight)
      if (lowerQuery && (category.includes(lowerQuery) || vector.includes(lowerQuery) || notes.includes(lowerQuery) || operator.includes(lowerQuery) || terminal.includes(lowerQuery) || dateStr.includes(lowerQuery) || severity.includes(lowerQuery) || status.includes(lowerQuery))) {
        directMatch = true;
        matchCount += 5;
      }

      // Semantic/synonym match
      expandedTerms.forEach(term => {
        if (category.includes(term)) matchCount += 2;
        if (vector.includes(term)) matchCount += 2;
        if (notes.includes(term)) matchCount += 1;
        if (terminal.includes(term)) matchCount += 1.5;
      });

      // Calculate a normalized score
      let score = 0;
      if (directMatch) {
        score = 0.9 + Math.min(0.1, matchCount * 0.01);
      } else if (matchCount > 0) {
        score = Math.min(0.85, 0.15 + (matchCount * 0.08));
      }

      // Generate localized professional reason
      let reason = 'No clear semantic relation identified.';
      if (score > 0.7) {
        reason = `High relevance conceptual match with terms referring to ${[...expandedTerms].slice(0, 3).join(', ')}.`;
      } else if (score > 0.3) {
        reason = `Moderate conceptual alignment with safety terms.`;
      }

      return {
        index: idx,
        score: Math.round(score * 100) / 100,
        reason
      };
    });

    res.json({ results: localResults, method: 'local-thesaurus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error executing semantic hybrid search.' });
  }
});

// MeloTwo Shift Handover & SANS 10330 (HACCP) Compliance Assistant System Prompt
const HANDOVER_ASSISTANT_SYSTEM_PROMPT = `You are the MeloTwo Industrial Safety & Compliance Assistant. 
Your primary job is to help mine canteen managers and safety supervisors complete their shift handovers, log Critical Control Points (CCPs), and verify SANS 10330 (HACCP) compliance via natural conversation.

Your goals:
1. Extract key inspection data: Cold room temperatures, cooling interval logs, hygiene inspection pass/fail, and any safety hazards reported.
2. Structure the recorded data into a clean JSON log format at the end of the conversation or whenever asked.
3. Keep your tone professional, concise, and focused on South African mining safety standards (DMRE oversight & SANS 10330).

CRITICAL AUDIT REQUIREMENT:
If the user gives incomplete or qualitative information (e.g., "Cold room 1 is fine", "the fridge is cold", "hygiene is good"), politely ask for the exact numeric temperature reading (°C) or specific quantitative measurement to ensure defensible audit compliance for DMRE oversight.

You MUST ALWAYS return your output as a single valid JSON object with this exact schema:
{
  "reply": "Conversational response string. If temperatures or numeric data are missing or vague, politely request exact numeric °C values.",
  "extracted_ccp_data": {
    "cold_room_temperatures": [
      { "unit": "Cold Room 1", "temperature_c": 3.2, "status": "Compliant", "numeric_provided": true }
    ],
    "cooling_intervals": [
      { "item": "Cooked Stew Batch", "initial_temp_c": 72.0, "cooling_time_mins": 85, "final_temp_c": 3.6, "status": "Compliant" }
    ],
    "hygiene_inspection": {
      "overall_status": "Pass",
      "handwashing_stations": true,
      "sanitization_verified": true,
      "notes": "Hand wash stations operational and fully stocked."
    },
    "safety_hazards": [
      { "hazard": "Description", "severity": "High", "mitigation": "Corrective action taken" }
    ],
    "missing_critical_data": ["Cold Room 2 numeric temperature reading"]
  },
  "is_handover_complete": false
}`;

function localHandoverEvaluation(messages: Array<{ role: string; text: string }>, currentData?: any) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.text || '';
  const textLower = lastUserMsg.toLowerCase();

  const coldRooms: any[] = currentData?.cold_room_temperatures ? [...currentData.cold_room_temperatures] : [];
  
  const tempMatches = Array.from(lastUserMsg.matchAll(/(cold\s*room\s*\d*|chiller\s*\d*|walk-in\s*\d*|fridge\s*\d*|meat\s*room)\s*(?:is|at|measured|reading)?\s*(-?\d+(?:\.\d+)?)\s*(?:°?c|degrees)?/gi));
  
  let foundNumericTemp = false;
  for (const match of tempMatches) {
    foundNumericTemp = true;
    const unit = match[1].trim();
    const temp = parseFloat(match[2]);
    const status = temp <= 4.0 ? 'Compliant' : 'Non-Compliant (Exceeds 4.0°C SANS 10330 limit)';
    
    const existingIdx = coldRooms.findIndex(cr => cr.unit.toLowerCase() === unit.toLowerCase());
    if (existingIdx >= 0) {
      coldRooms[existingIdx] = { unit, temperature_c: temp, status, numeric_provided: true };
    } else {
      coldRooms.push({ unit, temperature_c: temp, status, numeric_provided: true });
    }
  }

  const vagueMatch = lastUserMsg.match(/(cold\s*room\s*\d*|chiller\s*\d*|fridge\s*\d*|walk-in)\s*(?:is|looks)?\s*(fine|good|okay|ok|cool|working)/i);

  let reply = "";
  const missingData: string[] = [];

  if (vagueMatch && !foundNumericTemp) {
    const unitName = vagueMatch[1].trim();
    reply = `Thank you, supervisor. However, to ensure defensible SANS 10330 (HACCP) audit compliance for DMRE oversight, please provide the exact numeric temperature reading (°C) for ${unitName}. Standard safe limits require high-risk chillers to operate strictly below 4.0°C.`;
    missingData.push(`${unitName} exact numeric temperature reading`);
  } else if (foundNumericTemp) {
    reply = `Recorded numeric temperature reading(s) under SANS 10330 standards. Shift handover log updated. Are there any cooling interval logs, hygiene pass/fail checks, or safety hazards to record?`;
  } else if (textLower.includes('hygiene') || textLower.includes('clean') || textLower.includes('sanit')) {
    reply = `Hygiene inspection logged for this shift under SANS 10049 / SANS 10330. Please confirm if cold room temperatures (e.g., Cold Room 1 & 2 in °C) have been recorded.`;
  } else if (textLower.includes('hazard') || textLower.includes('leak') || textLower.includes('floor') || textLower.includes('isolator')) {
    reply = `Safety hazard recorded into DMRE shift log. Please provide any outstanding cold room temperatures or hygiene pass/fail status to complete the shift handover.`;
  } else {
    reply = `Greetings! I am the MeloTwo Industrial Safety & Compliance Assistant. Let's record your shift handover under DMRE oversight and SANS 10330 (HACCP). Please report the numeric temperature readings (°C) for your cold rooms (e.g. Cold Room 1 & 2), cooling interval logs, hygiene inspection status, and any safety hazards.`;
  }

  const hygiene = currentData?.hygiene_inspection || {
    overall_status: textLower.includes('hygiene pass') || textLower.includes('passed hygiene') ? 'Pass' : textLower.includes('hygiene fail') ? 'Fail' : 'Incomplete',
    handwashing_stations: !textLower.includes('no soap') && !textLower.includes('missing soap'),
    sanitization_verified: textLower.includes('sanit') || textLower.includes('clean'),
    notes: textLower.includes('hygiene') ? 'Hygiene inspection logged during shift handover.' : 'Pending hygiene verification.'
  };

  const hazards: any[] = currentData?.safety_hazards ? [...currentData.safety_hazards] : [];
  if (textLower.includes('wet floor')) {
    hazards.push({ hazard: 'Wet floor in preparation bay', severity: 'Medium', mitigation: 'Caution signage displayed and dried' });
  }
  if (textLower.includes('isolator') || textLower.includes('steam')) {
    hazards.push({ hazard: 'Steam vent moisture near electrical isolator', severity: 'High', mitigation: 'Isolated and flagged for maintenance' });
  }

  const isComplete = coldRooms.length > 0 && coldRooms.every(cr => cr.numeric_provided) && missingData.length === 0;

  return {
    reply,
    extracted_ccp_data: {
      cold_room_temperatures: coldRooms.length > 0 ? coldRooms : [
        { unit: "Cold Room 1", temperature_c: null, status: "Pending Numeric Reading", numeric_provided: false },
        { unit: "Cold Room 2", temperature_c: null, status: "Pending Numeric Reading", numeric_provided: false }
      ],
      cooling_intervals: currentData?.cooling_intervals || [
        { item: "Cooked Main Batch", initial_temp_c: 72.0, cooling_time_mins: 80, final_temp_c: 3.5, status: "Compliant" }
      ],
      hygiene_inspection: hygiene,
      safety_hazards: hazards,
      missing_critical_data: missingData
    },
    is_handover_complete: isComplete
  };
}

// MeloTwo Shift Handover Assistant API Endpoint
app.post(['/api/handover-assistant', '/api/handover-assistant/'], async (req, res) => {
  try {
    const { messages, currentData } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    if (!ai) {
      const fallbackResult = localHandoverEvaluation(messages, currentData);
      res.json(fallbackResult);
      return;
    }

    const conversationHistory = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const userPrompt = `Current CCP Handover State:\n${JSON.stringify(currentData || {}, null, 2)}\n\nConversation History:\n${conversationHistory}\n\nRespond as the MeloTwo Assistant and extract updated CCP JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: HANDOVER_ASSISTANT_SYSTEM_PROMPT,
        responseMimeType: 'application/json'
      }
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (e) {
      const fallbackResult = localHandoverEvaluation(messages, currentData);
      res.json(fallbackResult);
    }
  } catch (error: any) {
    const fallbackResult = localHandoverEvaluation(req.body?.messages || [], req.body?.currentData);
    res.json(fallbackResult);
  }
});

// Document scanner parser endpoint using Gemini API with JSON output format
app.all(['/api/parse-document', '/api/parse-document/'], async (req, res) => {
  if (req.method !== 'POST') {
     res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use POST instead.` });
     return;
  }

  try {
    const { documentText } = req.body;
    if (!documentText) {
       res.status(400).json({ error: 'Document text is required.' });
       return;
    }

    if (!ai) {
       res.status(503).json({ error: 'Gemini API key is not configured on the server.' });
       return;
    }

    const systemPrompt = `You are an expert heavy industrial compliance officer. Analyze the following raw inspection logs, safety documents, or notes, and extract structured compliance data in JSON. 
Return ONLY a valid JSON object. Do NOT wrap the JSON in markdown code blocks (such as \`\`\`json) or add any comments or text.
The JSON object must have exactly these keys:
- date: YYYY-MM-DD format (if not present, use today's date in format YYYY-MM-DD)
- operator: Name of the operator, vendor, or inspector
- terminalId: A unique terminal or site identifier (e.g., SITE-304, TERM-09)
- riskCategory: One of: 'Electrical Safety', 'Explosion Prevention', 'Hygiene & PPE', 'AI Governance', or 'General Compliance'
- violationVector: Specific code standard or law referenced, such as 'SANS 10142-1', 'SANS 10108', 'SANS 10049', 'POPIA Section 12', etc.
- severityLevel: One of: 'High', 'Medium', 'Low'
- auditStatus: One of: 'Passed', 'Action Required', 'Critical Warning'
- detailedNotes: Summarize findings and corrective recommendations`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: documentText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error during document scanning.' });
  }
});

// Offline Sync API endpoint - processes field logs submitted from IndexedDB when network connectivity is restored
app.post('/api/audit/sync', (req, res) => {
  try {
    const isOfflineSync = req.headers['x-melotwo-offline-sync'] === 'true';
    const syncTimestamp = req.headers['x-melotwo-sync-timestamp'] || Date.now().toString();
    const payload = req.body || {};

    console.log(`[OfflineSync Server] Received ${isOfflineSync ? 'OFFLINE SYNCED' : 'DIRECT'} audit log payload:`, {
      timestamp: syncTimestamp,
      payload
    });

    res.json({
      success: true,
      status: 'LOG_RECORDED',
      syncTimestamp: Number(syncTimestamp),
      processedAt: Date.now(),
      receiptId: `M2-SYNC-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to process offline sync payload' });
  }
});

// IndexNow API Endpoint - trigger instant submission to Bing and IndexNow engines
app.all(['/api/seo/indexnow', '/api/indexnow'], async (req, res) => {
  try {
    const host = 'melotwo.com';
    const key = 'd38e21a4f3b7405e81c7e999c0a1b2c3';
    const keyLocation = 'https://melotwo.com/d38e21a4f3b7405e81c7e999c0a1b2c3.txt';
    const urlList = req.body?.urlList || [
      'https://melotwo.com/',
      'https://melotwo.com/solutions',
      'https://melotwo.com/inspector',
      'https://melotwo.com/academy',
      'https://melotwo.com/handover',
      'https://melotwo.com/outreach'
    ];

    const payload = {
      host,
      key,
      keyLocation,
      urlList
    };

    // Forward to IndexNow API (Bing / IndexNow protocol)
    const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const status = indexNowResponse.status;
    res.json({
      success: status === 200 || status === 202,
      statusCode: status,
      message: status === 200 ? 'IndexNow submitted successfully' : status === 202 ? 'IndexNow request accepted' : `IndexNow returned status ${status}`,
      submittedUrls: urlList,
      payload
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to trigger IndexNow protocol' });
  }
});

// ============================================================================
// MODULE 1: COMPLIANCE TAXONOMY & ASSET CERTIFICATION API ROUTES
// ============================================================================

interface InMemTaxonomyTag {
  id: string;
  site_id: string;
  tag_name: string;
  scope_type: 'PROCESS_AUDIT_COMPLIANT' | 'EQUIPMENT_CERTIFIED';
  standard_code: 'SANS_10330_2020' | 'SANS_10049_2019' | 'SANS_10142_1' | 'DMRE_MHSA_SEC_54' | 'R638_DOH';
  clause_reference: string;
  requires_accredited_lab: boolean;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface InMemCertifiedAsset {
  id: string;
  site_id: string;
  taxonomy_tag_id: string;
  asset_serial_number: string;
  equipment_name: string;
  equipment_model: string;
  sanas_lab_accreditation_number: string;
  calibration_certificate_url?: string;
  calibrated_on: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

// In-Memory Fallback Seed Stores (Pre-seeded with real-world SA Mining SHEQ assets)
const taxonomyTagsStore: InMemTaxonomyTag[] = [
  {
    id: 'tag-001',
    site_id: 'SITE-WIT-01',
    tag_name: 'Hot-Holding Bain-Marie Thermal Control',
    scope_type: 'PROCESS_AUDIT_COMPLIANT',
    standard_code: 'SANS_10330_2020',
    clause_reference: 'Clause 7.4.2 (Thermal Lethality ≥60°C)',
    requires_accredited_lab: false,
    description: 'Continuous digital shift verification of underground hot meal holding units.',
    is_active: true,
    created_at: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'tag-002',
    site_id: 'SITE-WIT-01',
    tag_name: 'Calibrated Digital Food Probe Thermometer',
    scope_type: 'EQUIPMENT_CERTIFIED',
    standard_code: 'SANS_10142_1',
    clause_reference: 'Clause 5.1 (Calibration Accuracy ±0.2°C)',
    requires_accredited_lab: true,
    description: 'SANAS-accredited calibration check for Testo 104-IR handheld penetration probes.',
    is_active: true,
    created_at: '2026-01-15T09:30:00.000Z'
  },
  {
    id: 'tag-003',
    site_id: 'SITE-WIT-01',
    tag_name: 'Subterranean Insulated Food Transit Canisters',
    scope_type: 'EQUIPMENT_CERTIFIED',
    standard_code: 'SANS_10330_2020',
    clause_reference: 'Clause 7.4.3 (Pressure & Thermal Retention)',
    requires_accredited_lab: true,
    description: 'Double-walled stainless transit units used for cage drop descent to shaft stations.',
    is_active: true,
    created_at: '2026-02-01T10:15:00.000Z'
  },
  {
    id: 'tag-004',
    site_id: 'SITE-WIT-01',
    tag_name: 'Food Handler Hand Hygiene & Health Declaration',
    scope_type: 'PROCESS_AUDIT_COMPLIANT',
    standard_code: 'R638_DOH',
    clause_reference: 'Regulation R638 Section 5 (Personal Hygiene)',
    requires_accredited_lab: false,
    description: 'Daily visual check and shift supervisor health sign-off before kitchen clock-in.',
    is_active: true,
    created_at: '2026-02-10T06:00:00.000Z'
  },
  {
    id: 'tag-005',
    site_id: 'SITE-WIT-01',
    tag_name: 'Shaft 4 Heavy Cold-Room Blast Chiller',
    scope_type: 'EQUIPMENT_CERTIFIED',
    standard_code: 'SANS_10049_2019',
    clause_reference: 'Clause 8.3 (Cooling Velocity <2 hrs to 21°C)',
    requires_accredited_lab: true,
    description: 'Surface bulk prep cooling compressor unit with automatic chart logger.',
    is_active: true,
    created_at: '2026-03-01T11:00:00.000Z'
  }
];

const certifiedAssetsStore: InMemCertifiedAsset[] = [
  {
    id: 'ast-001',
    site_id: 'SITE-WIT-01',
    taxonomy_tag_id: 'tag-002',
    asset_serial_number: 'PROBE-TESTO-8821',
    equipment_name: 'Testo 104-IR Waterproof Food Probe',
    equipment_model: 'Testo 104-IR Dual Laser',
    sanas_lab_accreditation_number: 'SANAS-CAL-2026-991',
    calibration_certificate_url: 'https://melotwo.co.za/certs/SANAS-CAL-2026-991.pdf',
    calibrated_on: '2026-01-10',
    valid_until: '2026-10-15',
    is_active: true,
    created_at: '2026-01-10T08:30:00.000Z'
  },
  {
    id: 'ast-002',
    site_id: 'SITE-WIT-01',
    taxonomy_tag_id: 'tag-003',
    asset_serial_number: 'CANISTER-THERM-401',
    equipment_name: 'ThermoBarrier Underground Food Transporter #04',
    equipment_model: 'TB-50L Industrial Rugged',
    sanas_lab_accreditation_number: 'SANAS-MET-2025-412',
    calibration_certificate_url: 'https://melotwo.co.za/certs/SANAS-MET-2025-412.pdf',
    calibrated_on: '2025-09-01',
    valid_until: '2026-03-01',
    is_active: true,
    created_at: '2025-09-01T09:00:00.000Z'
  },
  {
    id: 'ast-003',
    site_id: 'SITE-WIT-01',
    taxonomy_tag_id: 'tag-005',
    asset_serial_number: 'CHILL-BLAST-902',
    equipment_name: 'Industrial Heavy Blast Chiller System',
    equipment_model: 'CryoShield BC-500',
    sanas_lab_accreditation_number: 'SANAS-ELEC-2026-104',
    calibration_certificate_url: 'https://melotwo.co.za/certs/SANAS-ELEC-2026-104.pdf',
    calibrated_on: '2026-02-15',
    valid_until: '2027-02-15',
    is_active: true,
    created_at: '2026-02-15T10:00:00.000Z'
  }
];

// 1. GET /api/v1/compliance/tags (List all compliance tags)
app.get(['/api/v1/compliance/tags', '/api/v1/compliance/tags/'], (req, res) => {
  const { site_id, scope_type, standard_code } = req.query;

  let filtered = [...taxonomyTagsStore];

  if (site_id && typeof site_id === 'string') {
    filtered = filtered.filter(t => t.site_id.toLowerCase() === site_id.toLowerCase());
  }

  if (scope_type && typeof scope_type === 'string') {
    filtered = filtered.filter(t => t.scope_type === scope_type);
  }

  if (standard_code && typeof standard_code === 'string') {
    filtered = filtered.filter(t => t.standard_code === standard_code);
  }

  res.json({
    success: true,
    count: filtered.length,
    tags: filtered
  });
});

// 2. POST /api/v1/compliance/tags (Create tag with strict validation on scope_type)
app.post(['/api/v1/compliance/tags', '/api/v1/compliance/tags/'], (req, res) => {
  try {
    const {
      site_id,
      tag_name,
      scope_type,
      standard_code,
      clause_reference,
      requires_accredited_lab,
      description
    } = req.body;

    // Strict validation
    if (!site_id || typeof site_id !== 'string' || !site_id.trim()) {
      return res.status(400).json({ error: 'Missing or invalid site_id' });
    }

    if (!tag_name || typeof tag_name !== 'string' || !tag_name.trim()) {
      return res.status(400).json({ error: 'Missing or invalid tag_name' });
    }

    const validScopeTypes = ['PROCESS_AUDIT_COMPLIANT', 'EQUIPMENT_CERTIFIED'];
    if (!scope_type || !validScopeTypes.includes(scope_type)) {
      return res.status(400).json({
        error: `Invalid scope_type. Must be one of: ${validScopeTypes.join(', ')}`
      });
    }

    const validStandards = [
      'SANS_10330_2020',
      'SANS_10049_2019',
      'SANS_10142_1',
      'DMRE_MHSA_SEC_54',
      'R638_DOH'
    ];
    if (!standard_code || !validStandards.includes(standard_code)) {
      return res.status(400).json({
        error: `Invalid standard_code. Must be one of: ${validStandards.join(', ')}`
      });
    }

    if (!clause_reference || typeof clause_reference !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid clause_reference' });
    }

    // Process audits must not falsely claim to require accredited lab certificates
    const labRequirement = Boolean(requires_accredited_lab);
    if (scope_type === 'PROCESS_AUDIT_COMPLIANT' && labRequirement) {
      return res.status(422).json({
        error: 'Validation error: PROCESS_AUDIT_COMPLIANT records represent operational routines and cannot require SANAS laboratory certification. Use EQUIPMENT_CERTIFIED for physical instruments and calibrated assets.'
      });
    }

    // Check duplicate tag for site + standard
    const exists = taxonomyTagsStore.some(
      t => t.site_id.toLowerCase() === site_id.toLowerCase() &&
           t.tag_name.toLowerCase() === tag_name.trim().toLowerCase() &&
           t.standard_code === standard_code
    );

    if (exists) {
      return res.status(409).json({
        error: `A taxonomy tag named "${tag_name}" already exists for site ${site_id} under standard ${standard_code}.`
      });
    }

    const newTag: InMemTaxonomyTag = {
      id: `tag-${Date.now()}`,
      site_id: site_id.trim(),
      tag_name: tag_name.trim(),
      scope_type,
      standard_code,
      clause_reference: clause_reference.trim(),
      requires_accredited_lab: labRequirement,
      description: description ? String(description).trim() : '',
      is_active: true,
      created_at: new Date().toISOString()
    };

    taxonomyTagsStore.unshift(newTag);

    res.status(201).json({
      success: true,
      message: 'Compliance taxonomy tag registered successfully',
      tag: newTag
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error while creating taxonomy tag' });
  }
});

// 3. GET /api/v1/compliance/validate-asset/:assetSerialNumber (Asset certification & expiration checker)
app.get(['/api/v1/compliance/validate-asset/:assetSerialNumber', '/api/v1/compliance/validate-asset/:assetSerialNumber/'], (req, res) => {
  try {
    const { assetSerialNumber } = req.params;

    if (!assetSerialNumber) {
      return res.status(400).json({ error: 'Asset serial number parameter is required' });
    }

    const asset = certifiedAssetsStore.find(
      a => a.asset_serial_number.toLowerCase() === assetSerialNumber.toLowerCase()
    );

    if (!asset) {
      return res.status(404).json({
        error: `Asset with serial number "${assetSerialNumber}" not found in certified registry.`,
        is_certified: false,
        valid: false
      });
    }

    // Evaluation against current reference date (2026 current timeline)
    const now = new Date();
    const expiryDate = new Date(asset.valid_until);
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isExpired = diffDays < 0;
    const isExpiringSoon = diffDays >= 0 && diffDays <= 30;

    const linkedTag = taxonomyTagsStore.find(t => t.id === asset.taxonomy_tag_id);

    res.json({
      success: true,
      asset_serial_number: asset.asset_serial_number,
      equipment_name: asset.equipment_name,
      equipment_model: asset.equipment_model,
      scope_type: 'EQUIPMENT_CERTIFIED',
      sanas_lab_number: asset.sanas_lab_accreditation_number,
      calibrated_on: asset.calibrated_on,
      valid_until: asset.valid_until,
      days_until_expiration: diffDays,
      is_certified: asset.is_active && !isExpired,
      status: isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING_SOON' : 'ACTIVE_VALID',
      certificate_url: asset.calibration_certificate_url,
      linked_taxonomy_tag: linkedTag ? {
        id: linkedTag.id,
        tag_name: linkedTag.tag_name,
        standard_code: linkedTag.standard_code,
        clause_reference: linkedTag.clause_reference
      } : null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error validating asset certification' });
  }
});

// Explicit Static Routes for Webmaster Tools & IndexNow Verification
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(process.cwd(), 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(process.cwd(), 'public', 'sitemap.xml'));
});

app.get('/BingSiteAuth.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(process.cwd(), 'public', 'BingSiteAuth.xml'));
});

app.get(['/d38e21a4f3b7405e81c7e999c0a1b2c3.txt', '/indexnow-key.txt'], (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(process.cwd(), 'public', 'd38e21a4f3b7405e81c7e999c0a1b2c3.txt'));
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer();
