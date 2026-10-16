/**
 * Risk Management, WRAC, FMEA & MHSA Section 21 OEM Compliance Types
 * MeloTwo Industrial Safety Terminal & SANS/MHSA Compliance Engine
 */

// ============================================================================
// 1. WORKPLACE RISK ASSESSMENT & CONTROL (WRAC) TYPES
// ============================================================================

export type WracProbability = 1 | 2 | 3 | 4 | 5;
export type WracSeverity = 1 | 2 | 3 | 4 | 5;

export type WracRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ControlHierarchyType = 
  | 'ELIMINATION'
  | 'SUBSTITUTION'
  | 'ENGINEERING'
  | 'ADMINISTRATIVE'
  | 'PPE';

export interface ControlHierarchyDefinition {
  type: ControlHierarchyType;
  label: string;
  shortLabel: string;
  effectiveness: string;
  colorClass: string;
  badgeBg: string;
  description: string;
  examples: string[];
}

export interface WracAssessmentItem {
  id: string;
  activityOrArea: string;
  hazard: string;
  consequence: string;
  initialProbability: WracProbability;
  initialSeverity: WracSeverity;
  initialRiskScore: number; // 1 - 25
  initialRiskLevel: WracRiskLevel;
  selectedHierarchy: ControlHierarchyType;
  controlDescription: string;
  residualProbability: WracProbability;
  residualSeverity: WracSeverity;
  residualRiskScore: number; // 1 - 25
  residualRiskLevel: WracRiskLevel;
  responsiblePerson: string;
  monitoringFrequency: 'CONTINUOUS' | 'PER_SHIFT' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'ACTIVE' | 'REVIEW_REQUIRED' | 'VERIFIED';
  lastReviewedDate: string;
  standardsReference?: string;
}

// ============================================================================
// 2. FAILURE MODES AND EFFECTS ANALYSIS (FMEA) TYPES
// ============================================================================

export type FmeaRpnLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface FmeaItem {
  id: string;
  equipmentSystem: string;
  subsystem: string;
  equipmentSerialId?: string;
  failureMode: string;
  potentialEffects: string;
  potentialCauses: string;
  currentControls: string;
  severity: number;    // 1 - 10
  occurrence: number;  // 1 - 10
  detection: number;   // 1 - 10
  rpn: number;         // Severity x Occurrence x Detection (1 - 1000)
  rpnLevel: FmeaRpnLevel;
  mitigationAction: string;
  safetyOfficer: string;
  dueDate: string;
  taskStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  revisedSeverity?: number;
  revisedOccurrence?: number;
  revisedDetection?: number;
  revisedRpn?: number;
  lastUpdated: string;
}

// ============================================================================
// 3. MHSA SECTION 21 SUPPLIER & OEM COMPLIANCE VAULT TYPES
// ============================================================================

export type EquipmentCategoryType = 
  | 'MOBILE_MACHINERY'
  | 'DRILLING_RIG'
  | 'VENTILATION_SYSTEM'
  | 'HOISTING_WINDER'
  | 'PUMPING_SYSTEM'
  | 'ELECTRICAL_SUBSTATION';

export interface Section21Declaration {
  id: string;
  equipmentSerialId: string;
  equipmentModel: string;
  equipmentCategory: EquipmentCategoryType;
  oemManufacturer: string;
  declarationNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'ACTIVE_VALID' | 'ATTENTION_REQUIRED' | 'EXPIRED';
  signatoryName: string;
  signatoryDesignation: string;
  standardsCompliance: string[];
  ergonomicNoiseDba: number;
  vibrationLevelMps2: number;
  brakingTestCertified: boolean;
  failsafeInterlocksPresent: boolean;
  cryptographicHash: string;
  attachedCertificateUrl?: string;
  inspectionNotes: string;
  bundledInTenderDossier: boolean;
  miningSectionAssigned: string;
}
