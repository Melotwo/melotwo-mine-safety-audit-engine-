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

export interface MineParams {
  mineName: string;
  miningSector: 'gold' | 'coal' | 'platinum' | 'iron_ore' | 'diamond' | 'copper';
  depthLevel: number;
  headcount: number;
  environmentHazards: string[];
  currentPPE: {
    fabricType: string;
    fabricWashCycles: number;
    footwearSoleMaterial: string;
    footwearSpecification: string;
    arcRatingValue: string;
  };
}

export interface SANSStandard {
  code: string;
  title: string;
  scope: string;
  relevance: string;
  auditCheck: string;
}

export interface AuditReportResponse {
  auditSummary: {
    complianceScore: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
    regulatoryFrameworksChecked: string[];
    executiveSummary: string;
    primaryThreatIdentified?: string;
  };
  riskAnalysis: {
    primaryVulnerabilities: Array<{
      hazard: string;
      currentEquipmentDeficiency: string;
      sansViolationCode: string;
      severity: string;
      consequenceDescription: string;
    }>;
    environmentalImpactScore: number;
    theVillain?: string;
    technicalDeficitReasoning?: string;
    potentialFinancialImpact?: string;
  };
  complianceActionPlan: {
    requiredMaterialSpecifications: {
      fabricTypeRequired: string;
      minimumPerformanceRating: string;
      footwearSpecification: string;
      recommendedSolingMaterial?: string;
    };
    remediationSteps: Array<{
      stepNumber: number;
      actionTitle: string;
      implementationDetails: string;
      targetCompletionTimeframe: string;
    }>;
    theVow?: string;
    immediateRemediationSteps?: string[];
  };
  vendorMatchingCriteria: {
    targetSupplierCategory: string;
    bulkOrderSpecsSummary: string;
    estimatedCostVarianceZar?: string;
  };
  dailyShiftBriefing?: {
    briefingTitle: string;
    shiftName?: string;
    siteName?: string;
    mineType?: string;
    hazardsOverview: string;
    toolboxMessage: string;
    gearChecklist?: string[];
    ppeInspectionPoints?: Array<{
      item: string;
      checkDescription: string;
      mandatoryStandard: string;
    }>;
  };
  dailyDstiBriefing?: {
    briefingTitle: string;
    siteName?: string;
    hazardsOverview: string;
    toolboxMessage: string;
    heightsChecklist?: string[];
    scaffoldChecklist?: string[];
    electricalChecklist?: string[];
    ppeInspectionPoints?: Array<{
      item: string;
      checkDescription: string;
      mandatoryStandard: string;
    }>;
  };
  riskHeatmap?: {
    score?: string | number;
    likelihood?: string;
    consequence?: string;
    zone?: string;
    mitigation?: string;
    breakdown?: Record<string, any>;
  };
  pdfExport?: any;
  _fallback?: boolean;
}
