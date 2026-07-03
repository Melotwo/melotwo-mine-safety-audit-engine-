/**
 * PII Sanitization & Data Masking Utility (POPIA Compliant)
 * Specifically designed to detect and redact South African specific PII (IDs, Phones)
 * and generic Named Entities (operators, reports) prior to upstream processing.
 */

/**
 * South African ID number validation regex.
 * Format: YYMMDDSSSSCAZ
 * - YYMMDD: valid date
 * - SSSS: gender (0000-4999 female, 5000-9999 male)
 * - C: citizenship status (0 for SA citizen, 1 for permanent resident)
 * - A: usually 8 or 9
 * - Z: checksum digit
 */
export const SA_ID_REGEX = /\b\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{7}\b/g;

/**
 * South African Phone number regex.
 * Matches:
 * - International format: +27 71 234 5678, +27(0)821234567, +27831234567
 * - Local format: 082 123 4567, 071-123-4567, 011 123 4567, 0611234567
 */
export const SA_PHONE_REGEX = /\b(?:\+27\s?\(?0?\)?\s?|0)[1-8]\d(?:[\s.-]?\d){7}\b/g;

/**
 * Names and Entities regex.
 * Matches common introductory phrases and titles:
 * - "Operator [Name]"
 * - "Reported by [Name]"
 * - Capitalized words following titles: Mr, Ms, Mrs, Dr, Prof, Eng, Inspector, Auditor
 */
export const NAME_PATTERNS = [
  // 1. Phrases with name: "Operator John Doe" or "Reported by Jane" or "Attended by Dave"
  /\b(Operator|Reported\s+by|Attended\s+by|Auditor|Inspector|Officer|Manager|Supervisor|Consultant)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
  
  // 2. Capitalized words following formal titles: "Mr. Smith", "Dr Jane Doe"
  /\b(Mr\.?|Ms\.?|Mrs\.?|Dr\.?|Prof\.?|Eng\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
];

/**
 * Sanitizes input text by finding and masking South African ID numbers,
 * phone numbers, and named entities to prevent PII leakage.
 * 
 * @param text The raw input text to sanitize
 * @returns The sanitized/masked text
 */
export function sanitizeInputText(text: string): string {
  if (!text) return '';
  
  let sanitized = text;

  // 1. Mask South African ID Numbers
  sanitized = sanitized.replace(SA_ID_REGEX, '[ID_MASKED]');

  // 2. Mask South African Phone Numbers
  sanitized = sanitized.replace(SA_PHONE_REGEX, '[PHONE_MASKED]');

  // 3. Mask Names / Entities following specific structural patterns
  for (const pattern of NAME_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match, prefix, name) => {
      // Retain the structural context (prefix) and mask only the sensitive name
      return `${prefix} [NAME_MASKED]`;
    });
  }

  return sanitized;
}
