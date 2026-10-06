/**
 * Cross-Border & Mine Life-Cycle Compliance Sandbox Types
 * MeloTwo Industrial Mining & Contractor Platform (melotwo.com)
 *
 * Core Functional Capabilities:
 * 1. Mine Closure, Rehabilitation & Environmental Transition Suite
 *    - DMRE, NEMA & DWS Water Use Licenses (WULA) & Environmental Authorizations
 *    - Liability Transfer Checklists & GISTM Tailings Management
 *    - ESG Transition & Social and Labour Plan (SLP) Closure Winding-Down
 *
 * 2. Tier-1 Contractor Pre-Qualification & Cross-Border Audit Sandbox
 *    - Defensibility Index Matrix (Anglo American, Valterra Platinum, Barrick, First Quantum)
 *    - Cross-Border Regulatory Mapping (SA DMRE/MHSA vs. Zambia MSD/ZEMA & SADC)
 *    - Real-Time Compliance Gap Analysis Alerts
 */

// ============================================================================
// PILLAR 1: MINE CLOSURE, REHABILITATION & ENVIRONMENTAL TRANSITION SUITE
// ============================================================================

export type EnvironmentalStatutoryBody = 
  | 'DMRE'       // Department of Mineral Resources and Energy (MPRDA Sec 43 Closure)
  | 'DWS'        // Department of Water and Sanitation (NWA Act 36 of 1998 WULA)
  | 'DFFE_NEMA'  // Department of Forestry, Fisheries & Environment (NEMA Act 107 of 1998)
  | 'ZEMA_ZAMBIA'// Zambia Environmental Management Agency (EMA Act 2011 & SI 112)
  | 'MSD_ZAMBIA';// Mines Safety Department Kitwe (Mines & Minerals Act 2015)

export interface StatutoryEnvironmentalLicense {
  licenseId: string;
  licenseNumber: string;
  statutoryBody: EnvironmentalStatutoryBody;
  title: string;
  actReference: string;
  issueDate: string;
  renewalDate: string;
  status: 'ACTIVE_COMPLIANT' | 'AUDIT_REVIEW_PENDING' | 'REHABILITATION_TRIGGERED' | 'EXPIRED';
  financialProvisionAmountZar: number; // NEMA GN R1147 Financial Provisioning for Mine Rehabilitation
  keyConditions: string[];
  monitoringBoreholesCount?: number;
  waterDischargeLimitM3Day?: number;
}

export type DecommissioningPhase = 
  | 'INFRASTRUCTURE_DEMOLITION' 
  | 'HAZARDOUS_STRIPPING_ASBESTOS' 
  | 'TAILINGS_DRAWDOWM_GISTM' 
  | 'TOPSOIL_REVEGETATION' 
  | 'GROUNDWATER_AMD_TREATMENT' 
  | 'FINAL_LIABILITY_HANDOVER';

export interface LiabilityTransferHandoverItem {
  itemId: string;
  phase: DecommissioningPhase;
  workstreamName: string;
  locationArea: string;
  contractorResponsible: string;
  clientSuperintendent: string;
  independentEnvironmentalAuditor: string;
  checklistRequirements: {
    itemDescription: string;
    completed: boolean;
    statutoryStandard: string;
    verifiedDate?: string;
  }[];
  signOffStatus: 'PENDING_AUDIT' | 'PARTIALLY_VERIFIED' | 'LIABILITY_DISCHARGED';
  gistmConformance?: {
    tailingsFactorOfSafety: number; // Target: > 1.5 static, > 1.2 post-liquefaction
    phAcidMineDrainage: number;    // Target: 6.5 - 8.5
    piezometerPressureKpa: number;
    conformanceLevel: 'CONFORMANT' | 'ACTION_REQUIRED';
  };
  handoverCertificateHash?: string;
}

export interface EsgClosureTransitionMetric {
  metricId: string;
  domain: 'ENVIRONMENTAL_REMEDIATION' | 'SOCIAL_LABOUR_PLAN_SLP' | 'GOVERNANCE_LEGACY';
  indicatorName: string;
  statutoryReference: string;
  baselineAtClosure: string;
  targetAtFinalRelinquishment: string;
  currentProgressPct: number;
  status: 'ON_TRACK' | 'ATTENTION_REQUIRED' | 'TARGET_ACHIEVED';
  expenditureToDateZar: number;
  slpCommunityBeneficiariesCount?: number;
  futureForumConsultationHeld: boolean;
}

export interface MineClosureSuiteOverview {
  siteId: string;
  siteName: string;
  mineStage: 'ACTIVE_DECOMMISSIONING' | 'CARE_AND_MAINTENANCE' | 'POST_CLOSURE_STEWARDSHIP';
  overallRehabilitationProgressPct: number;
  financialProvisionBondGuaranteeZar: number;
  licenses: StatutoryEnvironmentalLicense[];
  liabilityHandoverItems: LiabilityTransferHandoverItem[];
  esgTransitionMetrics: EsgClosureTransitionMetric[];
}

// ============================================================================
// PILLAR 2: TIER-1 CONTRACTOR PRE-QUALIFICATION & CROSS-BORDER AUDIT SANDBOX
// ============================================================================

export type EnterpriseTier1Host = 
  | 'ANGLO_AMERICAN'       // Anglo American Platinum / Kumba Iron Ore
  | 'VALTERRA_PLATINUM'    // Valterra Platinum Mechanized Operations
  | 'BARRICK_GOLD'         // Barrick Gold (Lumwana / Kibali / SADC Operations)
  | 'FIRST_QUANTUM_FQM';   // First Quantum Minerals (Kansanshi / Sentinel)

export interface DefensibilityCategoryScore {
  categoryKey: 'STATUTORY_LEGAL' | 'OCCUPATIONAL_HEALTH' | 'PERMITS_AND_HIRAS' | 'ENVIRONMENTAL_TAILINGS' | 'ARTISAN_QUALIFICATIONS';
  categoryTitle: string;
  weightPercentage: number;
  scoreAchievedPct: number;
  maxPoints: number;
  pointsAwarded: number;
  findingsCount: number;
  mandatoryRequirementsMet: boolean;
  criticalGaps: string[];
}

export interface DefensibilityIndexResult {
  simulationId: string;
  contractorName: string;
  hostEnterprise: EnterpriseTier1Host;
  hostEnterpriseName: string;
  jurisdiction: 'SOUTH_AFRICA' | 'ZAMBIA' | 'CROSS_BORDER_SADC';
  overallDefensibilityScorePct: number; // 0 - 100%
  verdict: 'QUALIFIED_FOR_TENDER' | 'CONDITIONAL_REVISION_REQUIRED' | 'REJECTED_AT_MINE_GATE';
  categories: DefensibilityCategoryScore[];
  defensibilityRating: 'AAA_EXEMPLARY' | 'AA_DEFENSIBLE' | 'A_SATISFACTORY' | 'SUB_STANDARD_RISK';
  simulatedAt: string;
  auditSimulationHash: string;
  summaryExecutiveAdvice: string;
}

export interface CrossBorderRegulatoryMappingItem {
  id: string;
  functionalDomain: string; // e.g., 'Statutory Machinery Appointment', 'Medical Surveillance', 'Explosives', 'Contractor Mandatary Agreement'
  southAfricaStatute: {
    authority: 'DMRE' | 'DoEL' | 'SABS' | 'DWS' | 'DFFE';
    legislation: string;
    sectionOrStandard: string;
    requiredDocument: string;
    validityCycle: string;
  };
  zambiaStatute: {
    authority: 'MSD_KITWE' | 'ZEMA' | 'WCFCB' | 'MBOD';
    legislation: string;
    sectionOrStandard: string;
    requiredDocument: string;
    validityCycle: string;
  };
  harmonizationGuidance: string;
  commonPitfall: string;
}

export type ComplianceGapSeverity = 'CRITICAL_DISQUALIFIER' | 'MAJOR_DEFICIENCY' | 'MINOR_DOCUMENT_REQUEST';

export interface ComplianceGapAlert {
  alertId: string;
  severity: ComplianceGapSeverity;
  domain: string;
  title: string;
  affectedTenderScope: string;
  statutoryMandate: string;
  detailDescription: string;
  remediationAction: string;
  daysToDeadline: number;
  remediationEndpoint?: string;
  isResolved: boolean;
}
