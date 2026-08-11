/**
 * Global TypeScript types for Melotwo Mine Safety Audit Engine
 */

export type Page = 'home' | 'solutions' | 'inspector' | 'academy' | 'handover' | 'outreach';

export interface AuditRecord {
  id: string;
  date: string;
  operator: string;
  score: number;
  status: string;
  standard: string;
}

export interface DailyComplianceData {
  date: string;
  complianceScore: number;
  flaggedIncidents: number;
}
