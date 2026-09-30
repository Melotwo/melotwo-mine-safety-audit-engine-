export type ContractorTierId = 'tier_base' | 'tier_standard' | 'tier_enterprise';

export interface ContractorTierOption {
  id: ContractorTierId;
  name: string;
  badge: string;
  priceZar: number;
  monthlyEquivalentZar?: number;
  description: string;
  features: string[];
  recommendedFor: string;
  sectionsIncluded: number;
}

export const CONTRACTOR_TIERS: ContractorTierOption[] = [
  {
    id: 'tier_base',
    name: 'Small Contractor Base File',
    badge: 'Base SMME Tier',
    priceZar: 1500,
    description: 'Essential statutory safety file foundation for emerging subcontractors, SMMEs, and localized site facility maintenance.',
    features: [
      'Statutory Appointments (OHS 16.2, CR 8.1, CR 8.2)',
      'Baseline Hazard Identification & Risk Assessment (HIRA)',
      'Daily Site Inspection Checklists & Tool Logs',
      'PPE Issuing Register & Medical Fitness Matrix',
      'SACPCMP-Aligned SMME Compliance Verification'
    ],
    recommendedFor: 'Subcontractors with < 10 staff on short-duration maintenance or civils tasks',
    sectionsIncluded: 8
  },
  {
    id: 'tier_standard',
    name: 'Standard Trade Contractor Package',
    badge: 'Most Popular',
    priceZar: 2850,
    description: 'Complete 20-Section Red File dossier for multi-trade contractors tendering on primary industrial and commercial sites.',
    features: [
      'Complete 20-Section Tender Dossier ("The Red File")',
      'Multi-Trade SWPs (Electrical SANS 10142, Lifting SANS 10375, Civils, HACCP)',
      'Pre-Use Machinery, Ladder & Power Tool Registers',
      'Incident Investigation GAR 9 Protocols & Emergency Plans',
      'COID & Tax Compliance Verification Linking'
    ],
    recommendedFor: 'Specialist contractors, fabricators, and site engineering teams',
    sectionsIncluded: 20
  },
  {
    id: 'tier_enterprise',
    name: 'Enterprise Deep Mine Full Scope',
    badge: 'High-Risk & Subterranean',
    priceZar: 4500,
    monthlyEquivalentZar: 1999,
    description: 'High-risk subterranean and deep-level mining dossier with real-time operational telemetry, blasting clearance, and physics wear modeling.',
    features: [
      'All 20 Sections + Specialized Subterranean Mining Modules',
      'Industrial Consumable & Gas Infrastructure Safety Registers',
      'Underground Turnstile Headcount & Blasting Zone Clearance Logs',
      'Core Drilling & Fluid Telemetry Risk Correlation Registers',
      'Automated Physics Wear Modeling for PPE & Equipment Life',
      'Cryptographic Ledger Verification QR Code for DMRE Audits',
      'Unrestricted Instant PDF Export & Unwatermarked Certificate'
    ],
    recommendedFor: 'Deep-level shaft contractors, blasting crews, drilling specialists, and Tier-1 vendors',
    sectionsIncluded: 20
  }
];

// 1. Industrial Consumables & Invisible Infrastructure
export interface ConsumableTrackingState {
  oxygenSystem: {
    supplier: string;
    purityGrade: string;
    manifoldPressureBar: number;
    hydrostaticTestExpiry: string;
    dualShutoffValveChecked: boolean;
    status: 'COMPLIANT' | 'NEEDS_INSPECTION' | 'CRITICAL';
  };
  gasInfrastructure: {
    systemType: string;
    cylinderBankCertNumber: string;
    reticulationPressureBar: number;
    leakDetectorCalibratedUntil: string;
    ventilationDilutionVerified: boolean;
    status: 'COMPLIANT' | 'NEEDS_INSPECTION' | 'CRITICAL';
  };
  hydraulicReagents: {
    fluidGrade: string;
    bundingSANS10089Compliant: boolean;
    sdsAvailableOnSite: boolean;
    spillKitInspectionDate: string;
    batchNumber: string;
  };
}

// 2. Underground Access Control & Blasting Zone Clearance
export interface AccessAndBlastingState {
  headcount: {
    shiftCode: string;
    inStopeCrew: number;
    shaftTransitCrew: number;
    surfaceStandbyCrew: number;
    tagReconciliationConfirmed: boolean;
  };
  blastingClearance: {
    stopeHeading: string;
    detonationWindow: string;
    exclusionRadiusMeters: number;
    gasThresholds: {
      carbonMonoxidePpm: number; // max 30
      nitrogenOxidePpm: number;  // max 3
      flammableGasPct: number;   // max 0.2
    };
    sentryGuardsCount: number;
    blastingMasterLicense: string;
    preDetonationProtocolSigned: boolean;
    clearanceStatus: 'CLEAR_TO_BLAST' | 'RESTRICTED' | 'STANDBY';
  };
}

// 3. Drilling & Fluid Telemetry Logging
export interface DrillingTelemetryState {
  coreRigId: string;
  targetBoreholeId: string;
  fluidReturnFlowLpm: number;
  pumpPressureBar: number;
  downholeMudTempC: number;
  drillStringTorqueNm: number;
  vibrationRmsMmSec: number;
  boreholeRiskStratum: 'Nominal Basalt' | 'Fracture Fault Zone' | 'Dolomitic Water Ingress' | 'High Geothermal Area';
  telemetryStreamActive: boolean;
  sensorCalibrationValidUntil: string;
}

// 4. Automated Wear Simulations & Physics Modeling
export interface ComponentWearMetric {
  id: string;
  name: string;
  category: 'PPE' | 'RIGGING' | 'ROTATING_EQUIPMENT' | 'CUTTING_TOOLS';
  standardRef: string;
  runningHours: number;
  wearPercentage: number;
  healthScore: number;
  projectedFailureDays: number;
  discardThreshold: string;
  status: 'OPTIMAL' | 'MODERATE_WEAR' | 'REPLACE_IMMEDIATELY';
  gapAlert?: string;
}

export interface WearSimulationState {
  dutyCyclesHours: number;
  quartzParticulatePpm: number;
  ambientTemperatureC: number;
  chemicalHydrolysisStress: 'LOW' | 'MEDIUM' | 'HIGH';
  monitoredComponents: ComponentWearMetric[];
  lastSimulationRun: string;
}

// Complete Tender Safety File Draft State for Real-Time Auto-Save
export interface TenderSafetyFileDraftState {
  version: number;
  lastSavedAt: string;
  selectedTier: ContractorTierId;
  currentStep: 1 | 2 | 3 | 4;
  profile: {
    fullName: string;
    companyName: string;
    tradingName: string;
    contactPhone: string;
    contactEmail: string;
    physicalAddress: string;
    cipcRegNumber: string;
    coidNumber: string;
    sarsPin: string;
    projectTenderName: string;
    clientPrincipalName: string;
  };
  docUploads: Record<string, {
    name: string;
    uploaded: boolean;
    fileName?: string;
    size?: string;
  }>;
  selectedTrades: string[];
  staff: {
    ceoSupervisorName: string;
    ceoSupervisorId: string;
    constructionManagerName: string;
    assistantManagerName: string;
    firstAiderName: string;
    firstAiderExpiry: string;
    fireMarshalName: string;
    safetyRepName: string;
    riskAssessorName: string;
    incidentInvestigatorName: string;
  };
  consumables: ConsumableTrackingState;
  accessBlasting: AccessAndBlastingState;
  drilling: DrillingTelemetryState;
  wearSimulation: WearSimulationState;
  resolvedRedFlags: string[];
  customNotes: string;
  isPaidUnlocked: boolean;
  verificationCode?: string;
}
