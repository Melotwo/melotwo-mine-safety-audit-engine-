/**
 * Global TypeScript types for Melotwo Mine Safety Audit Engine
 */

export type Page = 'home' | 'solutions' | 'inspector' | 'academy';

export interface AuditRecord {
  id: string;
  date: string;
  operator: string;
  score: number;
  status: string;
  standard: string;
}
