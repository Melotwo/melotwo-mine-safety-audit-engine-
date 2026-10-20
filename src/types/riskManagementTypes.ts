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
  // SANS 31000 / MHSA 11(1) 0-1h Auto-CAPA Escalation for Critical Risk (17-25)
  requiresAutoCapa?: boolean;
  autoCapaTicketId?: string;
  autoCapaEscalatedAt?: string;
  autoCapaStatus?: 'OPEN_ESCALATED' | 'CR91_SIGNED_OFF' | 'RESOLVED';
  cr91Signatory?: string;
  cr91SignedAt?: string;
  cr91DigitalSeal?: string;
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
  // MHSA Section 2.13.1 / 2.13.3.1 Statutory Operational Lockout (RPN > 200 or Severity >= 8)
  isStatutoryLockedOut?: boolean;
  lockoutReference?: string;
  gccClearanceEngineer?: string;
  gccClearanceCertificateId?: string;
  gccClearedAt?: string;
  gccDigitalSignature?: string;
}

// ============================================================================
// 3. MHSA SECTION 21 OEM DECLARATION & SUPPLIER COMPLIANCE TYPES
// ============================================================================

export type EquipmentCategoryType =
  | 'MOBILE_MACHINERY'
  | 'DRILLING_RIG'
  | 'VENTILATION_SYSTEM'
  | 'HOISTING_WINDER'
  | 'PUMPING_SYSTEM'
  | 'ELECTRICAL_SUBSTATION'
  | 'CRUSHING_CONVEYOR'
  | 'OTHER';

export type Section21Status = 'ACTIVE_VALID' | 'ATTENTION_REQUIRED' | 'EXPIRED';

export interface Section21Declaration {
  id: string;
  equipmentSerialId: string;
  equipmentModel: string;
  equipmentCategory: EquipmentCategoryType;
  oemManufacturer: string;
  declarationNumber: string;
  issueDate: string;
  expiryDate: string;
  status: Section21Status;
  signatoryName: string;
  signatoryDesignation: string;
  standardsCompliance: string[];
  ergonomicNoiseDba: number;
  vibrationLevelMps2: number;
  brakingTestCertified: boolean;
  failsafeInterlocksPresent: boolean;
  cryptographicHash: string; // SHA-256 seal verification
  inspectionNotes: string;
  bundledInTenderDossier: boolean;
  miningSectionAssigned: string;
  flameproofRating?: string;
  lastDmrAuditDate?: string;
  dmreInspectorBadge?: string;
  qctoAlignment?: string;
}

// ============================================================================
// 4. ISO AUDITING STANDARDS & ENTERPRISE RISK GOVERNANCE TYPES
// Integrated under Durell Bhramadu's Risk & Audit Governance Specifications
// ============================================================================

export type IsoStandardCode = 'ISO_42001' | 'ISO_27001' | 'ISO_27701' | 'ISO_45001' | 'ISO_31000';

export type RegulatoryFrameworkType = 
  | 'ENTERPRISE_RISK_COMPLIANCE'
  | 'MHSA'
  | 'SANS'
  | 'ZEMA_MSR'
  | 'ISO_STANDARDS';

export interface IsoStandardSpecification {
  code: IsoStandardCode;
  designation: string; // e.g. "ISO/IEC 42001:2023"
  title: string;       // e.g. "AI Governance & Risk Management System (AIMS)"
  shortName: string;   // e.g. "ISO 42001"
  domain: 'AI_GOVERNANCE' | 'INFOSEC' | 'PRIVACY_POPIA' | 'OCCUPATIONAL_HEALTH' | 'ENTERPRISE_RISK';
  regulatoryFramework: RegulatoryFrameworkType;
  badgeLabel: string;  // e.g. "ISO 42001 Certified"
  colorTheme: string;  // e.g. "purple"
  leadAuditor: string;
  accreditationAuthority: string; // e.g. "SANAS / IAF MLA"
  mandatoryControls: {
    clauseNumber: string;
    controlName: string;
    objective: string;
    statutoryHarmonization: string;
  }[];
}

export interface EnterpriseRiskGovernanceRecord {
  id: string;
  auditDate: string;
  standard: IsoStandardCode;
  frameworkScope: 'Enterprise Risk & Regulatory Compliance' | 'MHSA' | 'SANS' | 'ZEMA_MSR';
  complianceRating: number; // 0 - 100%
  status: 'CERTIFIED' | 'COMPLIANT' | 'ACTION_REQUIRED' | 'NON_CONFORMANT';
  auditorName: string;
  securityControlsVerified: number;
  totalControlsInScope: number;
  popiaPrivacyDossierVerified: boolean;
  sha256VerificationSeal: string;
  findingsSummary: string;
}

export const ISO_STANDARDS_REGISTRY: Record<string, IsoStandardSpecification> = {
  ISO_42001: {
    code: 'ISO_42001',
    designation: 'ISO/IEC 42001:2023',
    title: 'AI Governance & Risk Management System (AIMS)',
    shortName: 'ISO 42001',
    domain: 'AI_GOVERNANCE',
    regulatoryFramework: 'ENTERPRISE_RISK_COMPLIANCE',
    badgeLabel: 'ISO 42001 Certified',
    colorTheme: 'purple',
    leadAuditor: 'Durell Bhramadu (Lead ISO/IEC 42001 Lead Auditor)',
    accreditationAuthority: 'SANAS Accredited CB-042 / IAF MLA',
    mandatoryControls: [
      {
        clauseNumber: 'Clause 6.1',
        controlName: 'AI Systemic Impact & Risk Assessment',
        objective: 'Identify algorithm bias, drift vectors, and autonomous machinery operating boundaries.',
        statutoryHarmonization: 'MHSA Section 11(1) & ISO 31000'
      },
      {
        clauseNumber: 'Clause 8.2',
        controlName: 'Model Drift & Performance Thresholds',
        objective: 'Continuous real-time telemetry monitoring for drift in autonomous haulage and safety copilot models.',
        statutoryHarmonization: 'SANS 10108 / DMRE Machinery Regulations'
      },
      {
        clauseNumber: 'Clause 8.4',
        controlName: 'Human-in-the-Loop Emergency Override',
        objective: 'Deterministic fail-safe circuit to revert autonomous equipment to manual control under 100ms.',
        statutoryHarmonization: 'MHSA Section 2.13.1 Electrical Lockout'
      },
      {
        clauseNumber: 'Clause 9.2',
        controlName: 'Data Provenance & Algorithmic Transparency',
        objective: 'Cryptographic SHA-256 ledger recording of training datasets and sensor log streams.',
        statutoryHarmonization: 'POPIA Section 17 & ISO 27701'
      }
    ]
  },
  ISO_27001: {
    code: 'ISO_27001',
    designation: 'ISO/IEC 27001:2022',
    title: 'Information Security Management System (ISMS)',
    shortName: 'ISO 27001',
    domain: 'INFOSEC',
    regulatoryFramework: 'ENTERPRISE_RISK_COMPLIANCE',
    badgeLabel: 'ISO 27001 Certified',
    colorTheme: 'cyan',
    leadAuditor: 'Durell Bhramadu (Lead ISO 27001 Lead Auditor)',
    accreditationAuthority: 'SANAS Accredited CB-027 / BSI Group',
    mandatoryControls: [
      {
        clauseNumber: 'Annex A.5.15',
        controlName: 'Access Control & Zero-Trust Authentication',
        objective: 'Enforce multi-factor authentication, duty-bearer RBAC roles, and API bearer token rotation.',
        statutoryHarmonization: 'POPIA Section 19 & SANS 10142-1'
      },
      {
        clauseNumber: 'Annex A.8.20',
        controlName: 'Network Segmentation & SCADA OT Isolation',
        objective: 'Physical and logical DMZ separation between surface enterprise IT and underground SCADA networks.',
        statutoryHarmonization: 'MHSA Section 21 Machinery Control'
      },
      {
        clauseNumber: 'Annex A.8.24',
        controlName: 'Cryptographic Verification & Key Management',
        objective: 'SHA-256 seal verification on all shift handover notes and Section 21 OEM declarations.',
        statutoryHarmonization: 'Electronic Communications and Transactions Act'
      },
      {
        clauseNumber: 'Annex A.5.24',
        controlName: 'Incident Response & Ransomware Resilience',
        objective: 'Tested Disaster Recovery & automated incident escalation protocol with < 1h RTO.',
        statutoryHarmonization: 'Cybercrimes Act No. 19 of 2020'
      }
    ]
  },
  ISO_27701: {
    code: 'ISO_27701',
    designation: 'ISO/IEC 27701:2019',
    title: 'Privacy Information Management System (PIMS) / POPIA',
    shortName: 'ISO 27701',
    domain: 'PRIVACY_POPIA',
    regulatoryFramework: 'ENTERPRISE_RISK_COMPLIANCE',
    badgeLabel: 'ISO 27701 Certified',
    colorTheme: 'indigo',
    leadAuditor: 'Durell Bhramadu (Lead Privacy & POPIA Auditor)',
    accreditationAuthority: 'Information Regulator South Africa / SANAS',
    mandatoryControls: [
      {
        clauseNumber: 'Clause 6.3',
        controlName: 'POPIA Section 11 Lawful Processing & Consent Registry',
        objective: 'Statutory basis verification for processing employee biometrics, silicosis passports, and medicals.',
        statutoryHarmonization: 'POPIA Act 4 of 2013 & MBOD Passports'
      },
      {
        clauseNumber: 'Clause 6.5',
        controlName: 'Automated PII Telemetry Redaction',
        objective: 'Real-time pseudonymization and cryptographic hashing of field inspector names and photos.',
        statutoryHarmonization: 'POPIA Section 14 Data Minimization'
      },
      {
        clauseNumber: 'Clause 7.2',
        controlName: 'Transborder Data Flow Assessment',
        objective: 'Validation of cross-border data transfer between South Africa, Zambia, and SADC cloud regions.',
        statutoryHarmonization: 'POPIA Section 72 & SADC Data Protocols'
      },
      {
        clauseNumber: 'Clause 8.3',
        controlName: 'Data Subject Rights & Breach Notification Workflow',
        objective: 'Automated 72-hour Information Regulator breach notification and DSAR resolution pipeline.',
        statutoryHarmonization: 'POPIA Section 22 Mandatory Notification'
      }
    ]
  }
};

