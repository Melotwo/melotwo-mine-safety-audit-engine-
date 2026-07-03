/**
 * POPIA-Compliant PII Sanitization Utility
 */

export function sanitizeInputText(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // 1. South African 13-Digit ID Numbers
  const idRegex = /\b\d{13}\b/g;
  sanitized = sanitized.replace(idRegex, '[ID_MASKED]');

  // 2. Local South African Phone Numbers (e.g., +27, 082, 071, 061)
  const phoneRegex = /(\+27|0)[6-8][0-9]\s?[0-9]{3}\s?[0-9]{4}\b/g;
  sanitized = sanitized.replace(phoneRegex, '[PHONE_MASKED]');

  // 3. Reporting and Personnel Entity Names
  const entityRegex = /\b(Reported by|Attended by|Operator|Auditor|Inspector|Officer|Manager|Supervisor)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/gi;
  sanitized = sanitized.replace(entityRegex, (match, prefix, name) => {
    return `${prefix} [NAME_MASKED]`;
  });

  return sanitized;
}
