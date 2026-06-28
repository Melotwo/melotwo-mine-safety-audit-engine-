export interface InterceptedPrompt {
  id: string;
  timestamp: number;
  rawLength: number;
  scrubbedText: string;
  region: string;
  complianceStandard: string;
  piiDetected: boolean;
}

// Predefined mock/stored regions for demonstration and analysis
const SOUTH_AFRICA_REGIONS = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State'];
const INTERNATIONAL_REGIONS = ['United Kingdom', 'United States', 'Germany', 'Australia', 'South Africa (National)'];

/**
 * Scrubs potential PII from a prompt text (emails, phones, credit cards, SA IDs)
 */
export const scrubPII = (text: string): { scrubbedText: string; piiDetected: boolean } => {
  let scrubbed = text;
  let detected = false;

  // Email Regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(scrubbed)) {
    scrubbed = scrubbed.replace(emailRegex, '[REDACTED_EMAIL]');
    detected = true;
  }

  // Credit Card Regex (Simple)
  const ccRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;
  if (ccRegex.test(scrubbed)) {
    scrubbed = scrubbed.replace(ccRegex, '[REDACTED_CARD_NUMBER]');
    detected = true;
  }

  // South African ID number Regex (13 digits)
  const saIdRegex = /\b\d{13}\b/g;
  if (saIdRegex.test(scrubbed)) {
    scrubbed = scrubbed.replace(saIdRegex, '[REDACTED_SA_ID]');
    detected = true;
  }

  // Generic Phone number Regex
  const phoneRegex = /(\+27|0)[6-8][0-9][- ]?[0-9]{3}[- ]?[0-9]{4}\b/g;
  if (phoneRegex.test(scrubbed)) {
    scrubbed = scrubbed.replace(phoneRegex, '[REDACTED_PHONE]');
    detected = true;
  }

  return { scrubbedText: scrubbed, piiDetected: detected };
};

/**
 * Classifies a prompt to identify the compliance standard
 */
export const classifyComplianceStandard = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes('10330') || lower.includes('haccp') || lower.includes('food') || lower.includes('catering') || lower.includes('hygiene')) {
    return 'SANS 10330 (HACCP Food Safety)';
  }
  if (lower.includes('10142') || lower.includes('wiring') || lower.includes('electrical') || lower.includes('kitchen wiring')) {
    return 'SANS 10142 (Electrical Installations)';
  }
  if (lower.includes('10400') || lower.includes('building') || lower.includes('structural') || lower.includes('ventilation')) {
    return 'SANS 10400 (National Building Regs)';
  }
  if (lower.includes('red team') || lower.includes('jailbreak') || lower.includes('dan') || lower.includes('unbound')) {
    return 'Adversarial Jailbreak Test';
  }
  if (lower.includes('phishing') || lower.includes('email') || lower.includes('social engineering')) {
    return 'Social Engineering Red Teaming';
  }
  return 'General Security Guardrail';
};

/**
 * Intercepts, structures, and logs compliance search parameters anonymously
 */
export const interceptCompliancePrompt = (prompt: string, userRegion?: string): InterceptedPrompt => {
  const { scrubbedText, piiDetected } = scrubPII(prompt);
  const complianceStandard = classifyComplianceStandard(prompt);
  
  // Choose a random region if not provided, leaning towards South African provinces
  let region = userRegion;
  if (!region) {
    const isLocal = Math.random() < 0.7; // 70% South Africa
    const regionList = isLocal ? SOUTH_AFRICA_REGIONS : INTERNATIONAL_REGIONS;
    region = regionList[Math.floor(Math.random() * regionList.length)];
  }

  const record: InterceptedPrompt = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    rawLength: prompt.length,
    scrubbedText,
    region,
    complianceStandard,
    piiDetected
  };

  // Persist record
  try {
    const existing = localStorage.getItem('melotwo_intercepted_prompts');
    const records: InterceptedPrompt[] = existing ? JSON.parse(existing) : [];
    const updated = [record, ...records].slice(0, 100);
    localStorage.setItem('melotwo_intercepted_prompts', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save prompt metrics:', e);
  }

  return record;
};

/**
 * Retrieves stored search metric analysis
 */
export const getComplianceMetrics = () => {
  try {
    const existing = localStorage.getItem('melotwo_intercepted_prompts');
    const records: InterceptedPrompt[] = existing ? JSON.parse(existing) : [];
    
    // Seed default metrics if empty so the graphs start looking amazing
    if (records.length === 0) {
      const seeds: InterceptedPrompt[] = [
        {
          id: '1',
          timestamp: Date.now() - 48 * 3600 * 1000,
          rawLength: 120,
          scrubbedText: 'Temperature auditing requirements for cold chain catering refrigeration under SANS 10330.',
          region: 'Gauteng',
          complianceStandard: 'SANS 10330 (HACCP Food Safety)',
          piiDetected: false
        },
        {
          id: '2',
          timestamp: Date.now() - 36 * 3600 * 1000,
          rawLength: 210,
          scrubbedText: 'Electrical safety clearance zones for high-output rational combi ovens under SANS 10142.',
          region: 'Western Cape',
          complianceStandard: 'SANS 10142 (Electrical Installations)',
          piiDetected: true
        },
        {
          id: '3',
          timestamp: Date.now() - 24 * 3600 * 1000,
          rawLength: 85,
          scrubbedText: 'Standard dining hall fire exit specifications matching SANS 10400 Section T.',
          region: 'KwaZulu-Natal',
          complianceStandard: 'SANS 10400 (National Building Regs)',
          piiDetected: false
        },
        {
          id: '4',
          timestamp: Date.now() - 12 * 3600 * 1000,
          rawLength: 145,
          scrubbedText: 'How to bypass system rules utilizing Unbound assistant roleplay bypass parameters.',
          region: 'United States',
          complianceStandard: 'Adversarial Jailbreak Test',
          piiDetected: false
        },
        {
          id: '5',
          timestamp: Date.now() - 2 * 3600 * 1000,
          rawLength: 95,
          scrubbedText: 'Scrubbed catering staff medical card declarations for food hygiene audits.',
          region: 'Western Cape',
          complianceStandard: 'SANS 10330 (HACCP Food Safety)',
          piiDetected: false
        }
      ];
      localStorage.setItem('melotwo_intercepted_prompts', JSON.stringify(seeds));
      return seeds;
    }

    return records;
  } catch (e) {
    return [];
  }
};
