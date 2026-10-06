/**
 * Global TypeScript types for Melotwo Mine Safety Audit Engine
 */

export type Page = 'home' | 'solutions' | 'inspector' | 'academy' | 'handover' | 'outreach' | 'blog' | 'zambia-assessment' | 'partner-copilot' | 'operational-compliance';

export interface AuditRecord {
  id: string;
  date: string;
  operator: string;
  score: number;
  status: string;
  standard: string;
}

export interface ComplianceLedgerRow {
  date: string;
  operator: string;
  terminalId: string;
  riskCategory: string;
  violationVector: string;
  severityLevel: string;
  auditStatus: string;
  detailedNotes?: string;
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

export * from './config/regulatoryRules.zambia';

export type PaymentGatewayType = 'paypal' | 'eft';

export interface PayPalConfig {
  clientId: string;
  clientSecret?: string;
  mode: 'sandbox' | 'live';
  currency: 'USD' | 'EUR' | 'GBP';
  isConfigured: boolean;
}

export type SupportedEftBankKey = 'capitec' | 'fnb';

export interface EftBankDetails {
  bankKey: SupportedEftBankKey;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  swiftCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface EftBankAccountsConfig {
  capitec: EftBankDetails;
  fnb: EftBankDetails;
}

export interface EftOrderSubmission {
  id: string;
  reference: string;
  amountZar: number;
  enterpriseName: string;
  email: string;
  tierOrItem: string;
  selectedBank?: SupportedEftBankKey;
  bankName?: string;
  notes?: string;
  popFileName?: string;
  popFileDataUrl?: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'PROVISIONALLY_APPROVED' | 'REJECTED';
  createdAt: string;
  verifiedAt?: string;
  partnerCode?: string;
}

export interface PaymentSuccessResult {
  gateway: 'paypal' | 'eft';
  transactionId: string;
  amount: number;
  currency: string;
  item: string;
  customerName?: string;
  customerEmail?: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING_EFT_CLEARANCE';
}

export * from './types/complianceEngine';
