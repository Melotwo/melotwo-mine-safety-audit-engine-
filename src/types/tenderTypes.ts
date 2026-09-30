export type ContractorTierId = 
  | 'tier_contractor_pay_per_file' 
  | 'tier_operational_subscription' 
  | 'tier_enterprise_site_license'
  | 'tier_base' 
  | 'tier_standard' 
  | 'tier_enterprise';

export type TierBillingCycle = 'once-off' | 'monthly' | 'annual';

export interface ContractorTierOption {
  id: ContractorTierId;
  name: string;
  badge: string;
  billingCycle: TierBillingCycle;
  basePriceZar: number;
  maxPriceZar: number;
  defaultPriceZar: number;
  priceZar: number; // Current active / default price
  priceDisplay: string;
  description: string;
  features: string[];
  recommendedFor: string;
  sectionsIncluded: number;
}

export interface TenderAddOn {
  id: string;
  name: string;
  badge: string;
  priceZar: number;
  description: string;
  category: 'REGULATORY' | 'AUDIT' | 'ENGINEERING';
}

export const TENDER_ADDONS: TenderAddOn[] = [
  {
    id: 'addon_zambian_cross_border',
    name: 'Cross-Border Zambian Mining Tender Pack',
    badge: 'Cross-Border ZM',
    priceZar: 45000,
    description: 'Statutory Mines & Minerals Act 2015 alignment, Kitwe/Ndola Copperbelt regional approvals, MSD clearance stamps & cross-border tax compliance.',
    category: 'REGULATORY'
  },
  {
    id: 'addon_sacpcmp_fast_track',
    name: 'SACPCMP Fast-Track Audit Call-out',
    badge: 'Fast-Track 24hr',
    priceZar: 12000,
    description: 'Direct priority review and pre-submission sign-off by a registered Pr.CHSA / Pr.CPM professional with guaranteed 24hr response turnaround.',
    category: 'AUDIT'
  },
  {
    id: 'addon_telemetry_hardware_bridge',
    name: 'Subterranean Rig Telemetry IoT Bridge',
    badge: 'Downhole IoT',
    priceZar: 28000,
    description: 'Direct sensor bridging for drill string torque, core mud return flow sensors, and borehole geothermal transmitters.',
    category: 'ENGINEERING'
  }
];

export const CONTRACTOR_TIERS: ContractorTierOption[] = [
  {
    id: 'tier_contractor_pay_per_file',
    name: 'Small Contractor Pay-Per-File',
    badge: 'Immediate Dossier Pack',
    billingCycle: 'once-off',
    basePriceZar: 1500,
    maxPriceZar: 2500,
    defaultPriceZar: 2500,
    priceZar: 2500,
    priceDisplay: 'R1,500 - R2,500 once-off',
    description: 'Immediate SACPCMP/SANS/Zambian returnable pack PDF/ZIP generation for emerging contractors and site sub-trades.',
    features: [
      'Immediate SACPCMP / SANS / Zambian Returnable Pack',
      'One-Click 20-Section PDF & Full ZIP Dossier Export',
      'Digital Cryptographic Audit Ledger QR Code Seal',
      'Statutory Appointments (OHS 16.2, CR 8.1, CR 8.2)',
      'Baseline HIRA & Trade-Specific Safe Work Procedures',
      'COID & Tax PIN Compliance Verification Linking'
    ],
    recommendedFor: 'Subcontractors, civils teams & small suppliers bidding on active tenders',
    sectionsIncluded: 20
  },
  {
    id: 'tier_operational_subscription',
    name: 'Operational Safety & Wear Simulation Subscription',
    badge: 'Continuous Sync',
    billingCycle: 'monthly',
    basePriceZar: 8500,
    maxPriceZar: 15000,
    defaultPriceZar: 8500,
    priceZar: 8500,
    priceDisplay: 'R8,500 - R15,000 / month',
    description: 'Includes real-time auto-save, physics-driven wear simulations, and drilling fluid telemetry logs for continuous compliance.',
    features: [
      'Continuous Real-Time Local & Cloud Auto-Save Drafts',
      'Physics-Driven Wear Modeling (PPE, Wire Ropes, Drill Crowns)',
      'Core Drilling & Return Fluid Mud Telemetry Logging',
      'Industrial Consumables & Invisible Gas Infrastructure Registers',
      'Predictive Component Discard & Silicosis Hazard Alerts',
      'Monthly Statutory Audit Re-Certification & Re-Issuance'
    ],
    recommendedFor: 'Active operational contractors, drill operators & plant managers',
    sectionsIncluded: 20
  },
  {
    id: 'tier_enterprise_site_license',
    name: 'Enterprise Site License',
    badge: 'Subterranean Authority',
    billingCycle: 'annual',
    basePriceZar: 180000,
    maxPriceZar: 420000,
    defaultPriceZar: 180000,
    priceZar: 180000,
    priceDisplay: 'R180,000 - R420,000 / year',
    description: 'Full live telemetry engine, offline subterranean sync, underground access/blasting clearance, and multi-user executive portal.',
    features: [
      'Full Live Telemetry Engine with Real-Time SCADA/Drill Sync',
      'Offline Subterranean Sync for Low-Connectivity Deep Shafts',
      'Underground Turnstile Headcount & Automated Blasting Clearance',
      'Multi-User Executive Admin & Lead Governance Portal',
      'Custom SANS 10330 / DMRE Statutory Defense Legal Dossier',
      'Dedicated Pr.CHSA / Pr.CPM Compliance Officer SLA & 24/7 Callout'
    ],
    recommendedFor: 'Mine owners, principal contractors, deep-level shafts & complex sites',
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
  customTierPriceZar?: number;
  selectedAddOns: string[];
  diagnosticProgress?: Record<string, any>;
  diagnosticScore?: number;
  totalAmountZar?: number;
  isPaidUnlocked: boolean;
  verificationCode?: string;
}
