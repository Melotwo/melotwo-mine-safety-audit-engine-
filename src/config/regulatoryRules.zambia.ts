/**
 * MeloTwo Mining & Environmental Regulatory Engine - Republic of Zambia
 * 
 * Statutory Configuration for:
 * - Mines and Minerals Development Act No. 11 of 2015
 * - Mining Regulations (MSR) under the Mines Safety Department (MSD)
 * - Zambia Environmental Management Agency (ZEMA) SI 112 Effluent Standards
 * - Workers' Compensation & MBOD (Silicosis Bureau) Health Directives
 */

import zambianRulesJson from './regulatoryRules.zambia.json';

export interface RegulatoryThreshold {
  [key: string]: number | string;
}

export interface SubterraneanHazardRule {
  rule_id: string;
  category: 'ATMOSPHERE_AND_GASES' | 'SUBTERRANEAN_VENTILATION' | 'STRATA_CONTROL_AND_ROCKFALL' | 'HIGH_VOLTAGE_AND_ELECTRICAL' | 'BLASTING_AND_EXPLOSIVES' | 'EMERGENCY_PREPAREDNESS';
  name: string;
  parameter_code: string;
  uom: string;
  thresholds: Record<string, number>;
  statutory_reference: string;
  enforcement_protocol: Record<string, string>;
}

export interface ZemaEffluentRule {
  rule_id: string;
  category: 'WATER_QUALITY' | 'HEAVY_METALS' | 'SUSPENDED_SOLIDS' | 'TOXIC_COMPOUNDS' | 'TAILINGS_STORAGE_FACILITIES' | 'HAZARDOUS_SUBSTANCES';
  name: string;
  parameter_code: string;
  uom: string;
  thresholds: Record<string, number>;
  statutory_reference: string;
  enforcement_protocol: Record<string, string>;
}

export interface ContractorCredential {
  institution: string;
  credential: string;
  validity_check: string;
}

export interface ContractorAppointment {
  role: string;
  statutory_license: string;
  form?: string;
  standard?: string;
}

export interface ContractorOnboardingRule {
  rule_id: string;
  category: 'LOCAL_CONTENT_OWNERSHIP' | 'LOCAL_EMPLOYMENT' | 'CONTRACTOR_LEGAL_STANDING' | 'MINING_SAFETY_COMPETENCY' | 'OCCUPATIONAL_HEALTH' | 'SAFETY_FILE_COMPILATION';
  name: string;
  parameter_code: string;
  uom?: string;
  thresholds?: Record<string, number>;
  statutory_reference?: string;
  mandatory_verification_documents?: string[];
  mandatory_credentials?: ContractorCredential[];
  mandatory_appointment_categories?: ContractorAppointment[];
  mandatory_checks?: string[];
  required_dossier_sections?: string[];
  enforcement_protocol: Record<string, string>;
}

export interface ZambianRegulatoryConfig {
  jurisdiction: string;
  jurisdiction_name: string;
  country_code: string;
  currency: string;
  version: string;
  last_updated: string;
  title: string;
  description: string;
  regulatory_authorities: Array<{
    code: string;
    name: string;
    ministry: string;
    headquarters: string;
    statutory_act: string;
  }>;
  modules: {
    subterranean_hazards: {
      module_id: string;
      title: string;
      statutory_basis: string;
      risk_severity: string;
      rules: SubterraneanHazardRule[];
    };
    zema_environmental_effluent: {
      module_id: string;
      title: string;
      statutory_basis: string;
      risk_severity: string;
      rules: ZemaEffluentRule[];
    };
    contractor_onboarding_and_local_content: {
      module_id: string;
      title: string;
      statutory_basis: string;
      risk_severity: string;
      rules: ContractorOnboardingRule[];
    };
  };
}

/**
 * Strongly typed raw JSON configuration
 */
export const ZAMBIAN_REGULATORY_CONFIG: ZambianRegulatoryConfig = zambianRulesJson as unknown as ZambianRegulatoryConfig;

/**
 * Subterranean Atmosphere Evaluation Helper
 */
export interface GasAtmosphereReading {
  ch4_percent: number;
  co_ppm: number;
  o2_percent: number;
  air_velocity_ms: number;
}

export interface AtmosphereEvaluationResult {
  status: 'SAFE' | 'WARNING' | 'CRITICAL_STOPPAGE';
  overallScore: number;
  violations: Array<{
    parameter: string;
    value: number;
    threshold: number;
    severity: 'WARNING' | 'CRITICAL';
    action: string;
    statutoryRef: string;
  }>;
}

export function evaluateSubterraneanAtmosphere(readings: GasAtmosphereReading): AtmosphereEvaluationResult {
  const violations: AtmosphereEvaluationResult['violations'] = [];
  let score = 100;

  // Check CH4 (MSR Reg 1404)
  if (readings.ch4_percent >= 1.25) {
    violations.push({
      parameter: 'Methane (CH4)',
      value: readings.ch4_percent,
      threshold: 1.25,
      severity: 'CRITICAL',
      action: 'MANDATORY EVACUATION: Cut electrical supply, withdraw underground crew to fresh air base.',
      statutoryRef: 'MSR Part XIV, Reg 1404'
    });
    score -= 50;
  } else if (readings.ch4_percent >= 0.8) {
    violations.push({
      parameter: 'Methane (CH4)',
      value: readings.ch4_percent,
      threshold: 0.8,
      severity: 'WARNING',
      action: 'WARNING: Boost auxiliary ventilation fan and log reading on MeloTwo PWA.',
      statutoryRef: 'MSR Part XIV, Reg 1404'
    });
    score -= 20;
  }

  // Check CO (MSR Reg 1406)
  if (readings.co_ppm >= 50) {
    violations.push({
      parameter: 'Carbon Monoxide (CO)',
      value: readings.co_ppm,
      threshold: 50,
      severity: 'CRITICAL',
      action: 'CRITICAL: Don Self-Contained Self-Rescuers (SCSRs) immediately. Halt heading advancement.',
      statutoryRef: 'MSR Part XIV, Reg 1406'
    });
    score -= 40;
  } else if (readings.co_ppm > 30) {
    violations.push({
      parameter: 'Carbon Monoxide (CO)',
      value: readings.co_ppm,
      threshold: 30,
      severity: 'WARNING',
      action: 'ELEVATED CO: TWA threshold exceeded. Investigate post-blast fumes.',
      statutoryRef: 'MSR Part XIV, Reg 1406'
    });
    score -= 15;
  }

  // Check O2 (MSR Reg 1401)
  if (readings.o2_percent < 19.5) {
    violations.push({
      parameter: 'Oxygen (O2)',
      value: readings.o2_percent,
      threshold: 19.5,
      severity: 'CRITICAL',
      action: 'OXYGEN DEFICIENT: Entry prohibited under 19.5%. Red-tag heading.',
      statutoryRef: 'MSR Part XIV, Reg 1401'
    });
    score -= 40;
  }

  // Check Air Velocity (MSR Reg 1410)
  if (readings.air_velocity_ms < 0.3) {
    violations.push({
      parameter: 'Air Velocity',
      value: readings.air_velocity_ms,
      threshold: 0.3,
      severity: 'WARNING',
      action: 'SUB-MINIMUM AIRFLOW: Inspect ducting integrity and auxiliary fan power.',
      statutoryRef: 'MSR Part XIV, Reg 1410'
    });
    score -= 15;
  }

  const status: AtmosphereEvaluationResult['status'] = 
    violations.some(v => v.severity === 'CRITICAL') ? 'CRITICAL_STOPPAGE' :
    violations.length > 0 ? 'WARNING' : 'SAFE';

  return {
    status,
    overallScore: Math.max(0, score),
    violations
  };
}

/**
 * ZEMA Effluent Discharge Evaluation Helper
 */
export interface EffluentSampleReading {
  ph: number;
  copper_mg_l: number;
  tss_mg_l: number;
  cobalt_mg_l: number;
  wad_cyanide_mg_l: number;
}

export interface EffluentEvaluationResult {
  isCompliant: boolean;
  score: number;
  breaches: Array<{
    parameter: string;
    observedValue: number;
    statutoryLimit: string;
    enforcementAction: string;
    citation: string;
  }>;
}

export function evaluateZemaEffluentDischarge(sample: EffluentSampleReading): EffluentEvaluationResult {
  const breaches: EffluentEvaluationResult['breaches'] = [];
  let score = 100;

  // pH (6.5 to 9.0)
  if (sample.ph < 6.5 || sample.ph > 9.0) {
    breaches.push({
      parameter: 'pH Level',
      observedValue: sample.ph,
      statutoryLimit: '6.5 - 9.0 pH units',
      enforcementAction: 'Automated shutoff of river discharge weir gate; redirect to lime neutralization.',
      citation: 'ZEMA SI 112 Third Schedule'
    });
    score -= 30;
  }

  // Copper (<= 1.0 mg/L)
  if (sample.copper_mg_l > 1.0) {
    breaches.push({
      parameter: 'Total Dissolved Copper (Cu)',
      observedValue: sample.copper_mg_l,
      statutoryLimit: '<= 1.0 mg/L',
      enforcementAction: 'Divert decant discharge to retention settling pond No. 3.',
      citation: 'ZEMA SI 112 Heavy Metals Schedule'
    });
    score -= 25;
  }

  // TSS (<= 100 mg/L)
  if (sample.tss_mg_l > 100.0) {
    breaches.push({
      parameter: 'Total Suspended Solids (TSS)',
      observedValue: sample.tss_mg_l,
      statutoryLimit: '<= 100.0 mg/L',
      enforcementAction: 'Increase flocculant dosing rate at thickener overflow ponds.',
      citation: 'ZEMA SI 112 Effluent Standards'
    });
    score -= 20;
  }

  // Cobalt (<= 1.0 mg/L)
  if (sample.cobalt_mg_l > 1.0) {
    breaches.push({
      parameter: 'Total Cobalt (Co)',
      observedValue: sample.cobalt_mg_l,
      statutoryLimit: '<= 1.0 mg/L',
      enforcementAction: 'Engage secondary precipitation reactor; notify catchment team.',
      citation: 'ZEMA SI 112'
    });
    score -= 25;
  }

  // WAD Cyanide (<= 0.2 mg/L)
  if (sample.wad_cyanide_mg_l > 0.2) {
    breaches.push({
      parameter: 'WAD Cyanide',
      observedValue: sample.wad_cyanide_mg_l,
      statutoryLimit: '<= 0.2 mg/L',
      enforcementAction: 'Initiate Caro\'s acid / sodium metabisulfite detox circuit immediately.',
      citation: 'ZEMA SI 112 Hazardous Mining Effluent'
    });
    score -= 35;
  }

  return {
    isCompliant: breaches.length === 0,
    score: Math.max(0, score),
    breaches
  };
}

/**
 * Contractor Onboarding & Local Content Qualification Helper
 */
export interface ContractorOnboardingProfile {
  companyName: string;
  citizenEquityPercent: number;
  localWorkforcePercent: number;
  hasPacraCertificate: boolean;
  hasZraTaxClearance: boolean;
  hasWcfcbCertificate: boolean;
  hasNapsaCertificate: boolean;
  hasMsdBlastingLicense: boolean;
  hasMbodSilicosisCertificates: boolean;
  safetyFileCompiled: boolean;
}

export interface ContractorQualificationResult {
  tierClassification: 'TIER_1_CITIZEN_OWNED' | 'TIER_2_JOINT_VENTURE' | 'NON_COMPLIANT_FOREIGN';
  isOnboardingApproved: boolean;
  complianceScore: number;
  missingRequirements: string[];
}

export function evaluateContractorOnboarding(profile: ContractorOnboardingProfile): ContractorQualificationResult {
  const missingRequirements: string[] = [];
  let score = 100;

  // Local Equity Check
  let tier: ContractorQualificationResult['tierClassification'] = 'NON_COMPLIANT_FOREIGN';
  if (profile.citizenEquityPercent >= 51.0) {
    tier = 'TIER_1_CITIZEN_OWNED';
  } else if (profile.citizenEquityPercent >= 25.0) {
    tier = 'TIER_2_JOINT_VENTURE';
  } else {
    missingRequirements.push('Minimum 25% Zambian citizen equity required for mining supplier onboarding.');
    score -= 30;
  }

  // Local Workforce Quota Check
  if (profile.localWorkforcePercent < 85.0) {
    missingRequirements.push(`Local workforce ratio is ${profile.localWorkforcePercent}% (Minimum 85% required by MMDA Part IV).`);
    score -= 20;
  }

  // Statutory Credentials
  if (!profile.hasPacraCertificate) {
    missingRequirements.push('Missing valid PACRA Certificate of Incorporation.');
    score -= 15;
  }
  if (!profile.hasZraTaxClearance) {
    missingRequirements.push('Missing valid ZRA Tax Clearance Certificate (TPIN).');
    score -= 15;
  }
  if (!profile.hasWcfcbCertificate) {
    missingRequirements.push('Missing Workers\' Compensation Fund Control Board (WCFCB) Certificate of Good Standing.');
    score -= 15;
  }
  if (!profile.hasNapsaCertificate) {
    missingRequirements.push('Missing NAPSA Social Security Clearance Certificate.');
    score -= 15;
  }
  if (!profile.hasMsdBlastingLicense) {
    missingRequirements.push('Missing valid MSD Form MSD-14 Blasting License for appointed blasters.');
    score -= 15;
  }
  if (!profile.hasMbodSilicosisCertificates) {
    missingRequirements.push('Missing Medical Bureau for Occupational Diseases (Silicosis Bureau) Fitness Certificates.');
    score -= 20;
  }
  if (!profile.safetyFileCompiled) {
    missingRequirements.push('Mandatory 20-Section Zambian Mining Tender Safety File not yet generated/approved.');
    score -= 10;
  }

  return {
    tierClassification: tier,
    isOnboardingApproved: missingRequirements.length === 0,
    complianceScore: Math.max(0, score),
    missingRequirements
  };
}

// Export Zambian MHS & ZEMA compliance module
export * from './zambianMhsCompliance';

export default ZAMBIAN_REGULATORY_CONFIG;
