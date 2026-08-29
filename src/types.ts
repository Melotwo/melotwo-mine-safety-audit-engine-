/**
 * Global TypeScript types for Melotwo Mine Safety Audit Engine
 */

export type Page = 'home' | 'solutions' | 'inspector' | 'academy' | 'handover' | 'outreach' | 'blog';

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

export type TenderCategory = 
  | 'Civil Engineering' 
  | 'Building Construction' 
  | 'Electrical' 
  | 'Mining Services' 
  | 'Earthworks' 
  | 'General Maintenance';

export type LeadType = 'PRE_SUBMISSION' | 'POST_WIN';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'DISQUALIFIED';

export interface TenderLead {
  id: string;
  leadType: LeadType;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  sourceTenderId: string;
  tenderTitle: string;
  category: TenderCategory;
  closingDate?: string;
  awardValueZar?: string;
  status: LeadStatus;
  extractedFrom: 'BRIEFING_REGISTER_PDF' | 'ETENDERS_AWARD_FEED' | 'LIVE_SCRAPER_CRAWL' | 'MANUAL_ENTRY';
  targetSafetyProduct: string;
  customPitchSubject: string;
  customPitchBody: string;
  notes: string;
  createdAt: string;
  lastContactedAt?: string;
}

export interface ScrapedTender {
  tenderId: string;
  title: string;
  organOfState: string;
  category: TenderCategory;
  closingDate: string;
  publishedDate: string;
  status: 'ACTIVE' | 'AWARDED' | 'BRIEFING_ATTENDED';
  estimatedValueZar?: string;
  briefingSession?: {
    date: string;
    venue: string;
    compulsory: boolean;
  };
  documents: Array<{
    name: string;
    url: string;
    isBriefingRegister: boolean;
    fileSize?: string;
  }>;
  awardedContractor?: {
    name: string;
    valueZar: string;
    dateAwarded: string;
    registrationNumber?: string;
  };
  leadsExtractedCount: number;
}

export interface ScraperCronJobStatus {
  lastRunAt: string;
  nextScheduledRun: string;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  totalActiveTendersScraped: number;
  totalAwardedTendersScraped: number;
  totalRegistersParsed: number;
  totalLeadsGenerated: number;
  lastRunSummary?: string;
}
