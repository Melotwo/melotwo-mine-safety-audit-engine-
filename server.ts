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

app.use(express.json());

// API health and configuration check endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ai_initialized: ai !== null
  });
});

// Upstream safety analysis proxy endpoint
app.post('/api/analyze', async (req, res) => {
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

// Document scanner parser endpoint using Gemini API with JSON output format
app.post('/api/parse-document', async (req, res) => {
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
