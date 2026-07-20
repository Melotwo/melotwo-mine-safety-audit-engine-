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
  console.log(`[Express API Server] ${req.method} ${req.url}`);
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
app.all(['/api/analyze', '/api/analyze/'], async (req, res) => {
  if (req.method !== 'POST') {
     res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use POST instead.` });
     return;
  }

  try {
    const { scenario, systemPrompt } = req.body;
    if (!scenario) {
       res.status(400).json({ error: 'Scenario text is required.' });
       return;
    }

    if (!ai) {
       res.status(503).json({ error: 'Gemini API key is not configured on the server.' });
       return;
    }

    // Call the upstream Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: scenario,
      config: {
        systemInstruction: systemPrompt
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error during analysis.' });
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
    const queryTerms = lowerQuery.split(/\s+/).filter(t => t.length > 2);
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

      let matchCount = 0;
      let directMatch = false;

      // Direct exact query match (highest weight)
      if (lowerQuery && (category.includes(lowerQuery) || vector.includes(lowerQuery) || notes.includes(lowerQuery) || operator.includes(lowerQuery) || terminal.includes(lowerQuery))) {
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer();
