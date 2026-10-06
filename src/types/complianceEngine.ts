/**
 * Operational, Safety & SETA/QCTO Skills Compliance Engine Types
 * MeloTwo Industrial Mining & Contractor Platform (melotwo.com)
 *
 * Core Functional Pillars:
 * 1. Automated Safety File & Statutory Verification (MHSA, OHS Act, Permits, Tier-1 Host Site Binders)
 * 2. VR/Simulator Operator Qualification & Machine Assignment Rule Engine (Epiroc/Immersive Tech, Medicals)
 * 3. SETA, QCTO & TVET Skills Verification & Learnership Tracker (WSP, ATR, B-BBEE Scorecard)
 */

// ============================================================================
// PILLAR 1: AUTOMATED SAFETY FILE & STATUTORY VERIFICATION
// ============================================================================

export type DailySignOffType = 
  | 'BASELINE_HIRA' 
  | 'ISSUE_BASED_RISK_ASSESSMENT' 
  | 'SAFE_WORK_PROCEDURE_SWP' 
  | 'WRITTEN_SOP_SIGN_OFF';

export type ShiftType = 'DAY_SHIFT' | 'NIGHT_SHIFT' | 'AFTERNOON_SHIFT';

export type ResidualRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DailyComplianceSignOff {
  id: string;
  siteId: string;
  siteName: string;
  date: string; // ISO format
  shift: ShiftType;
  type: DailySignOffType;
  title: string;
  taskDescription: string;
  hazardCategories: string[];
  residualRiskRating: ResidualRiskLevel;
  controlMeasuresApplied: string[];
  supervisorName: string;
  supervisorDesignation: string;
  supervisorSignatureHash: string;
  teamMembersCount: number;
  status: 'APPROVED' | 'REQUIRES_REVISION' | 'PENDING_AUDIT';
  sansReference?: string;
  mhsaClause?: string;
}

export type StatutoryAct = 'MHSA' | 'OHSA';

export type StatutoryAppointmentSection = 
  | 'MHSA_2_9_2'    // Subordinate Manager / Mine Overseer (MHSA Act 29 of 1996)
  | 'MHSA_2_6_1'    // Competent Engineer in charge of Machinery
  | 'MHSA_2_13_1'   // Subordinate Engineer / Section Engineer
  | 'MHSA_7_4'      // Health & Safety Representative
  | 'OHSA_16_2'     // Assignee of Chief Executive Officer (OHS Act 85 of 1993)
  | 'OHSA_CR_8_1'   // Construction Manager (Construction Regulations 2014)
  | 'OHSA_CR_8_2';  // Assistant Construction Manager

export interface StatutoryLegalAppointment {
  id: string;
  act: StatutoryAct;
  sectionCode: StatutoryAppointmentSection;
  sectionTitle: string;
  appointeeName: string;
  appointeeIdNumber: string;
  appointeeDesignation: string;
  certificateOfCompetency: string; // e.g., 'GCC Mines & Works Mechanical', 'Mine Overseer Certificate'
  gazettedLegalScope: string;
  appointedAreaOrShaft: string;
  appointingAuthorityName: string;
  appointingAuthorityDesignation: string;
  appointmentDate: string;
  acceptanceDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'PENDING_ACCEPTANCE';
  daysUntilExpiry: number;
  appointmentLetterUrl?: string;
  verifiedInAuditLedger: boolean;
}

export type HighRiskPermitType = 
  | 'WORKING_AT_HEIGHT' 
  | 'HOT_WORK' 
  | 'CONFINED_SPACE_ENTRY' 
  | 'LOTO_ENERGY_ISOLATION';

export interface GasTestReading {
  o2Percentage: number;     // Normal: 19.5% - 23.5%
  lelPercentage: number;    // Explosive gas: must be 0% LEL
  coPpm: number;            // Carbon Monoxide: max 30 ppm
  h2sPpm: number;           // Hydrogen Sulfide: max 10 ppm
  ch4Percentage: number;    // Methane: max 0.0% v/v (underground MHSA threshold)
  testedBy: string;
  gasProbeSerialNumber: string;
  calibrationValid: boolean;
  timestamp: string;
}

export interface LotoIsolationPoint {
  equipmentTag: string;
  isolationType: 'ELECTRICAL_BREAKER' | 'HYDRAULIC_VALVE' | 'PNEUMATIC_DUMP' | 'GRAVITY_LOCK';
  padlockNumber: string;
  dangerTagNumber: string;
  zeroEnergyVerified: boolean;
  isolationSignature: string;
}

export interface HighRiskOperationalPermit {
  id: string;
  permitNumber: string;
  permitType: HighRiskPermitType;
  siteId: string;
  exactWorkLocation: string;
  validFrom: string;
  validTo: string;
  validHours?: number;
  issuerName: string;
  issuerDesignation: string;
  receiverName: string;
  receiverTeamCount: number;
  safetyChecklist: {
    item: string;
    verified: boolean;
    statutoryMandate: string;
  }[];
  gasTest?: GasTestReading;
  lotoPoints?: LotoIsolationPoint[];
  fallProtectionPlanVerified?: boolean;
  rescuePlanInPlace: boolean;
  status: 'ACTIVE_VALID' | 'EXPIRED' | 'REVOKED' | 'HANDED_OVER';
  minsRemaining: number;
}

export type Tier1HostSite = 
  | 'ANGLO_AMERICAN' 
  | 'SIBANYE_STILLWATER' 
  | 'VALTERRA_PLATINUM' 
  | 'IVANPLATS';

export interface BinderSectionCompliance {
  sectionIndex: number;
  sectionCode: string;
  title: string;
  statutoryReference: string;
  documentsAttached: number;
  requiredDocuments: string[];
  status: 'COMPLIANT' | 'FLAGGED' | 'INCOMPLETE';
  lastAuditDate: string;
  criticalFinding?: string;
}

export interface SafetyFileBinderDossier {
  binderId: string;
  contractorName: string;
  contractorCipcNumber: string;
  hostSite: Tier1HostSite;
  hostSiteDisplayName: string;
  sections: BinderSectionCompliance[];
  overallAuditScorePct: number;
  auditReadinessState: '100% AUDIT READY' | 'CONDITIONAL PASS' | 'GATE REJECTION RISK';
  compiledDate: string;
  validUntil: string;
  safetyOfficerApprovalHash: string;
  exportPdfReady: boolean;
}

// ============================================================================
// PILLAR 2: VR/SIMULATOR OPERATOR QUALIFICATION & MACHINE AUTHORIZATION
// ============================================================================

export type MachineClass = 
  | 'LHD_LOADER' 
  | 'DRILL_RIG' 
  | 'ROOF_BOLTER' 
  | 'ADT_DUMP_TRUCK' 
  | 'SURFACE_HAUL_TRUCK' 
  | 'OVERHEAD_CRANE';

export interface MedicalFitnessProfile {
  certificateNumber: string;
  ompName: string; // Occupational Medical Practitioner
  ompPracticeNumber: string;
  issueDate: string;
  expiryDate: string;
  isExpired: boolean;
  daysToExpiry: number;
  fitnessClassification: 'FIT_UNDERGROUND' | 'FIT_SURFACE_ONLY' | 'FIT_RESTRICTED' | 'UNFIT';
  audiometryPlhPercentage: number; // Percentage Loss of Hearing
  lungFunctionFvcPercentage: number;
  cardiacClearance: boolean;
  specialRestrictions: string[]; // e.g. ['Corrective Lenses Required', 'No Underground Solo Shifts']
}

export interface SimulatorAssessmentOutput {
  simulatorOem: 'EPIROC' | 'IMMERSIVE_TECHNOLOGIES' | 'THOROUGHTEC_CYBERMINE';
  simulatorModel: string;
  machineClass: MachineClass;
  assessmentDate: string;
  virtualHoursLogged: number;
  hazardAvoidanceScorePct: number; // Target: >= 85%
  reactionTimeSeconds: number; // e.g. 1.2s
  operatingEfficiencyPct: number;
  gradeLevel: 'LEVEL_1_BASIC' | 'LEVEL_2_ADVANCED' | 'LEVEL_3_MASTER_OPERATOR';
  isCertified: boolean;
  certificateHash: string;
}

export interface OperatorLicense {
  licenseNumber: string;
  licenseCode?: string;
  machineClass: MachineClass;
  issuingAuthority: 'DMRE' | 'TETA_ACCREDITED' | 'OEM_FACTORY';
  issueDate: string;
  expiryDate: string;
  isValid: boolean;
}

export interface OperatorCredentialProfile {
  id: string;
  operatorName: string;
  idNumber: string;
  employeeNumber: string;
  contractorCompany: string;
  primaryMachineClass: MachineClass;
  medicalFitness: MedicalFitnessProfile;
  simulatorAssessments?: SimulatorAssessmentOutput[];
  simulatorCertifications: SimulatorAssessmentOutput[];
  licenses: OperatorLicense[];
  shiftHoursLoggedPast24h: number;
  fatigueRiskScore: 'LOW' | 'ELEVATED' | 'CRITICAL_STAND_DOWN';
  activePermitsAssigned: string[];
}

export interface HeavyMachineAsset {
  assetId: string;
  assetTag: string;
  serialNumber: string;
  machineClass: MachineClass;
  oemBrand: 'Epiroc' | 'Sandvik' | 'Caterpillar' | 'Bell' | 'Liebherr' | 'Komatsu';
  modelName: string;
  operationalDomain: 'UNDERGROUND_HARD_ROCK' | 'SURFACE_OPEN_PIT' | 'CONCENTRATOR_PLANT';
  currentShaftOrBench: string;
  minRequiredSimGrade: number; // default 85%
  requiresUndergroundFitness: boolean;
  lastPreStartCheckDate: string;
  preStartPassed: boolean;
  operationalState: 'OPERATIONAL' | 'MAINTENANCE_LOCKED' | 'ASSIGNED_TO_SHIFT';
}

export interface MachineAssignmentEvaluation {
  isAuthorized: boolean;
  authorizationCode: 'PERMIT_ISSUED' | 'COMPLIANCE_LOCKOUT';
  startupPermitId?: string;
  authorizationHash?: string;
  operatorId: string;
  operatorName: string;
  machineAssetId: string;
  machineModel: string;
  machineClass: MachineClass;
  evaluatedTimestamp: string;
  ruleChecks: {
    ruleCode: string;
    ruleDescription: string;
    passed: boolean;
    failureReason?: string;
  }[];
  criticalBlockers: string[];
}

// ============================================================================
// PILLAR 3: SETA, QCTO & TVET SKILLS VERIFICATION & LEARNERSHIP TRACKER
// ============================================================================

export type QualityAssuringSeta = 
  | 'MQA'      // Mining Qualifications Authority
  | 'MERSETA'  // Manufacturing, Engineering and Related Services
  | 'CETA'     // Construction Education & Training Authority
  | 'HWSETA';  // Health and Welfare SETA

export interface TradeQualificationRecord {
  id: string;
  candidateName: string;
  idNumber: string;
  seta: QualityAssuringSeta;
  tradeTitle: string; // e.g. 'Diesel Mechanic', 'Boilermaker', 'Millwright', 'Electrician', 'Rigger'
  ofoCode: string; // Organising Framework for Occupations (e.g. '653306')
  saqaQualificationId: string;
  tvetCollege: string;
  academicQualification: 'N3_ENGINEERING' | 'N4_N6_NATIONAL_DIPLOMA' | 'NCV_LEVEL_4' | 'MATRIC_TECHNICAL';
  tradeTestCertification: {
    status: 'RED_SEAL_CERTIFIED' | 'APPRENTICE_IN_TRAINING' | 'SECTION_28_EXPERIENCE_ASSESSED' | 'PENDING_TRADE_TEST';
    redSealCertificateNumber?: string;
    nambVerificationStatus: 'VERIFIED_ON_NATIONAL_DATABASE' | 'UNDER_REVIEW' | 'FLAGGED_UNVERIFIED';
    tradeTestCenter: string;
    passDate?: string;
  };
  logbookProgress: {
    totalRequiredHours: number;
    hoursLogged: number;
    percentageCompleted: number;
    mentorSignedOff: boolean;
  };
  learnershipContract: {
    agreementNumber: string;
    agreementType: 'SECTION_18_1_EMPLOYED' | 'SECTION_18_2_UNEMPLOYED';
    startDate: string;
    endDate: string;
    stipendFundedBy: 'MQA_DISCRETIONARY_GRANT' | 'EMPLOYER_FUNDED' | 'YES_PROGRAMME';
  };
  demographics: {
    race: 'AFRICAN' | 'COLOURED' | 'INDIAN' | 'WHITE';
    gender: 'MALE' | 'FEMALE';
    disability: boolean;
    youthUnder35: boolean;
  };
}

export interface WorkplaceSkillsPlanSummary {
  wspReportingYear: number;
  submissionDeadline: string; // e.g. '2026-04-30'
  primarySeta: QualityAssuringSeta;
  leviablePayrollAmountZar: number;
  totalPlannedTrainingInterventions: number;
  estimatedMandatoryGrantClaimZar: number; // 20% of 1% SDL
  occupationalBreakdown: {
    occupationalLevel: string;
    headcount: number;
    plannedTrainees: number;
    budgetAllocatedZar: number;
  }[];
}

export interface AnnualTrainingReportSummary {
  atrReportingYear: number;
  actualBeneficiariesCompleted: number;
  plannedVsActualAchievementPct: number;
  totalExpenditureClaimedZar: number;
  discretionaryGrantsDisbursedZar: number;
  completedApprenticeshipsCount: number;
  completedLearnershipsCount: number;
  statutoryAuditReadiness: 'READY_TO_SUBMIT' | 'ACTION_REQUIRED';
}

export interface BbeeSkillsScorecardSummary {
  scorecardYear: number;
  totalSkillsPointsEarned: number;
  maxSkillsPoints: number; // 20 points + 5 bonus points = 25
  indicators: {
    code: string;
    description: string;
    targetPct: number;
    actualPct: number;
    pointsAwarded: number;
    maxPoints: number;
    isCompliant: boolean;
  }[];
  absorptionBonusPointsEarned: number;
  absorptionRatePct: number;
  status: 'AUDIT_VERIFIED' | 'TARGET_SHORTFALL';
}
