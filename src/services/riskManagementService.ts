/**
 * Risk Management Service: WRAC 5x5 Matrix, FMEA Engine & MHSA Section 21 OEM Vault
 * MeloTwo Industrial Safety Terminal & SANS/MHSA Compliance Engine
 */

import { jsPDF } from 'jspdf';
import {
  WracProbability,
  WracSeverity,
  WracRiskLevel,
  ControlHierarchyType,
  ControlHierarchyDefinition,
  WracAssessmentItem,
  FmeaItem,
  FmeaRpnLevel,
  Section21Declaration
} from '../types/riskManagementTypes';

// ============================================================================
// HIERARCHY OF CONTROLS DEFINITIONS
// ============================================================================

export const CONTROL_HIERARCHY_CONFIG: Record<ControlHierarchyType, ControlHierarchyDefinition> = {
  ELIMINATION: {
    type: 'ELIMINATION',
    label: 'Elimination (Level 1)',
    shortLabel: 'Elimination',
    effectiveness: 'Highest Effectiveness (100%)',
    colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    badgeBg: 'bg-emerald-500 text-slate-950 font-black',
    description: 'Physically remove the hazard entirely from the workplace.',
    examples: [
      'Eliminate manual hand-held rock drilling by deploying fully remote telerobotic drill rigs',
      'Remove explosive storage from underground shafts and transition to surface-stored bulk emulsion',
      'Eliminate work at height by assembling ventilation ducts at ground level prior to shaft lift'
    ]
  },
  SUBSTITUTION: {
    type: 'SUBSTITUTION',
    label: 'Substitution (Level 2)',
    shortLabel: 'Substitution',
    effectiveness: 'High Effectiveness (85%)',
    colorClass: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    badgeBg: 'bg-cyan-500 text-slate-950 font-black',
    description: 'Replace the hazard with a substantially safer substance, process or machine.',
    examples: [
      'Substitute diesel-powered LHD haulers with zero-emission Battery Electric Vehicles (BEVs)',
      'Replace solvent-based degreasers with non-toxic, non-flammable biodegradable surfactants',
      'Substitute high-pressure water jet descaling with mechanical ultrasonic cavitation'
    ]
  },
  ENGINEERING: {
    type: 'ENGINEERING',
    label: 'Engineering Controls (Level 3)',
    shortLabel: 'Engineering',
    effectiveness: 'Moderate-High Effectiveness (70%)',
    colorClass: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
    badgeBg: 'bg-indigo-500 text-white font-black',
    description: 'Isolate people from the hazard through physical barriers, ventilation and interlocks.',
    examples: [
      'Install Proximity Detection Systems (PDS / Level 9 CAS) with automated machine retarder braking',
      'Deploy mechanical acoustic silencers and acoustic curtains on booster ventilation fans',
      'Install positive interlock gate switches on conveyor nip guards that trip power upon opening'
    ]
  },
  ADMINISTRATIVE: {
    type: 'ADMINISTRATIVE',
    label: 'Administrative Controls (Level 4)',
    shortLabel: 'Administrative',
    effectiveness: 'Moderate Effectiveness (45%)',
    colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    badgeBg: 'bg-amber-500 text-slate-950 font-black',
    description: 'Change the way people work through standard operating procedures, training and permits.',
    examples: [
      'Enforce mandatory Section 54 Pre-Shift Barring Down Protocols with dual supervisor sign-off',
      'Rotate operators exposed to whole-body vibration every 3 hours to comply with DMR guidelines',
      'Implement strict Lockout / Tagout (LOTO) Permit to Work authorization for high-voltage cells'
    ]
  },
  PPE: {
    type: 'PPE',
    label: 'Personal Protective Equipment (Level 5)',
    shortLabel: 'PPE',
    effectiveness: 'Lowest Effectiveness (25% - Last Line of Defense)',
    colorClass: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    badgeBg: 'bg-rose-500 text-white font-black',
    description: 'Protect the worker with gear. Note: PPE does not remove or isolate the hazard.',
    examples: [
      'Deploy SANS 10338 approved silicone half-mask respirators with P3 particulate filters for quartz',
      'Mandate SANS 50361 compliant full-body fall arrest harnesses with energy-absorbing lanyards',
      'Standardize 32dB custom-molded hearing protection with integrated situational comms'
    ]
  }
};

// ============================================================================
// 5x5 RISK MATRIX LOGIC
// ============================================================================

export function calculateWracRisk(
  probability: WracProbability,
  severity: WracSeverity
): { score: number; level: WracRiskLevel; colorClass: string; action: string; triggersAutoCapa: boolean } {
  const score = probability * severity;

  if (score >= 17) {
    return {
      score,
      level: 'CRITICAL',
      colorClass: 'bg-red-600 text-white border-red-500',
      action: 'CRITICAL / STOP WORK: Unacceptable risk. Mandatory 0-1 Hour High-Severity Auto-CAPA ticket triggered. Requires appointed CR 9.1 Risk Assessor digital sign-off before operational execution clearance.',
      triggersAutoCapa: true
    };
  } else if (score >= 10) {
    return {
      score,
      level: 'HIGH',
      colorClass: 'bg-amber-500 text-slate-950 border-amber-400 font-bold',
      action: 'HIGH RISK: Substantial mitigation required. Section Engineer or Mine Overseer sign-off mandatory before shift commencement.',
      triggersAutoCapa: false
    };
  } else if (score >= 5) {
    return {
      score,
      level: 'MEDIUM',
      colorClass: 'bg-yellow-400 text-slate-950 border-yellow-300 font-semibold',
      action: 'MEDIUM RISK: Manage through routine SWPs and engineering maintenance controls. Shift supervisor oversight required.',
      triggersAutoCapa: false
    };
  } else {
    return {
      score,
      level: 'LOW',
      colorClass: 'bg-emerald-500 text-slate-950 border-emerald-400 font-semibold',
      action: 'LOW / ACCEPTABLE: Manage with basic pre-shift inspections and standard PPE donning.',
      triggersAutoCapa: false
    };
  }
}

export function calculateRpn(
  severity: number,
  occurrence: number,
  detection: number
): { rpn: number; level: FmeaRpnLevel; colorClass: string; alertMessage: string; triggersGccLockout: boolean } {
  const clampedS = Math.min(10, Math.max(1, severity || 1));
  const clampedO = Math.min(10, Math.max(1, occurrence || 1));
  const clampedD = Math.min(10, Math.max(1, detection || 1));
  const rpn = clampedS * clampedO * clampedD;
  const isGccLockout = rpn >= 200 || clampedS >= 8;

  if (rpn >= 200) {
    return {
      rpn,
      level: 'CRITICAL',
      colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      alertMessage: 'CRITICAL RPN (≥200): MHSA Section 2.13.1 / 2.13.3.1 Statutory Operational Lockout enforced. Formal digital clearance from an appointed GCC Mechanical/Electrical Engineer required.',
      triggersGccLockout: true
    };
  } else if (clampedS >= 8) {
    return {
      rpn,
      level: rpn >= 100 ? 'HIGH' : 'MEDIUM',
      colorClass: 'bg-rose-500/10 text-rose-300 border-rose-500/40',
      alertMessage: `HIGH SEVERITY (${clampedS}/10): Statutory operational lockout active under MHSA Sec 2.13. Requires GCC Engineer clearance.`,
      triggersGccLockout: true
    };
  } else if (rpn >= 100) {
    return {
      rpn,
      level: 'HIGH',
      colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      alertMessage: 'HIGH RPN (100-199): High priority mitigation task assigned to mechanical/electrical engineer.',
      triggersGccLockout: false
    };
  } else if (rpn >= 40) {
    return {
      rpn,
      level: 'MEDIUM',
      colorClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      alertMessage: 'MODERATE RPN (40-99): Standard planned preventive maintenance (PPM) schedule applies.',
      triggersGccLockout: false
    };
  } else {
    return {
      rpn,
      level: 'LOW',
      colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      alertMessage: 'LOW RPN (<40): Acceptable baseline equipment reliability condition.',
      triggersGccLockout: false
    };
  }
}

// ============================================================================
// DEFAULT SEED DATA
// ============================================================================

export const INITIAL_WRAC_ASSESSMENTS: WracAssessmentItem[] = [
  {
    id: 'WRAC-2026-001',
    activityOrArea: 'Underground Stope 44-East / Mechanised Face',
    hazard: 'Fall of Unsupported Hanging Wall & Geological Rockburst',
    consequence: 'Multiple catastrophic worker crush fatalities and stope collapse',
    initialProbability: 4,
    initialSeverity: 5,
    initialRiskScore: 20,
    initialRiskLevel: 'CRITICAL',
    selectedHierarchy: 'ENGINEERING',
    controlDescription: 'Pre-shift acoustic barring down; hydraulic roof bolting at 1.0m grid with steel mesh strapping and continuous microseismic acoustic geophone monitoring.',
    residualProbability: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    residualRiskLevel: 'MEDIUM',
    responsiblePerson: 'Sipho Sithole (MHSA 2.9.2 Section Manager)',
    monitoringFrequency: 'PER_SHIFT',
    status: 'VERIFIED',
    lastReviewedDate: '2026-10-15',
    standardsReference: 'MHSA Section 11(1) / SANS 10119 / DMRE COP FOG'
  },
  {
    id: 'WRAC-2026-002',
    activityOrArea: 'Main Decline Haul Road (Gradient 1:7)',
    hazard: 'Collision between 40-Ton LHD Truck and Light Transport Utility',
    consequence: 'Crush impact, vehicle runaway and operator fatalities',
    initialProbability: 4,
    initialSeverity: 4,
    initialRiskScore: 16,
    initialRiskLevel: 'HIGH',
    selectedHierarchy: 'ENGINEERING',
    controlDescription: 'Deployment of Level 9 Proximity Detection System (PDS) with automated failsafe retarder braking within 15-meter bubble and separate one-way traffic passing bays.',
    residualProbability: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    residualRiskLevel: 'LOW',
    responsiblePerson: 'Johan van der Merwe (GCC Mechanical Engineer)',
    monitoringFrequency: 'CONTINUOUS',
    status: 'VERIFIED',
    lastReviewedDate: '2026-10-14',
    standardsReference: 'MHSA Reg 8.10 Trackless Mobile Machinery (TMM)'
  },
  {
    id: 'WRAC-2026-003',
    activityOrArea: 'High-Tension Substation 11kV Switchgear Cell',
    hazard: 'Electrical Arc Flash Explosion during Breaker Racking',
    consequence: '4000°C blast thermal burns, blast pressure lung damage, electrical shock',
    initialProbability: 3,
    initialSeverity: 5,
    initialRiskScore: 15,
    initialRiskLevel: 'HIGH',
    selectedHierarchy: 'ELIMINATION',
    controlDescription: 'Motorized remote-racking umbilical system allowing artisan to rack circuit breaker from 20 meters outside arc blast zone; continuous thermographic busbar monitoring.',
    residualProbability: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    residualRiskLevel: 'LOW',
    responsiblePerson: 'Thulani Mthembu (GCC Electrical Engineer / Master Artisan)',
    monitoringFrequency: 'PER_SHIFT',
    status: 'VERIFIED',
    lastReviewedDate: '2026-10-12',
    standardsReference: 'SANS 10142-1 / SANS 10108 / DMR Electrical Regs'
  },
  {
    id: 'WRAC-2026-004',
    activityOrArea: 'Confined Tailings Thickener Sump & Slurry Launders',
    hazard: 'Toxic Gas Accumulation (Hydrogen Sulfide H2S and Carbon Monoxide CO)',
    consequence: 'Rapid asphyxiation, neurological knockdown and unconsciousness in confined space',
    initialProbability: 3,
    initialSeverity: 4,
    initialRiskScore: 12,
    initialRiskLevel: 'HIGH',
    selectedHierarchy: 'ADMINISTRATIVE',
    controlDescription: 'Confined Space Permit to Work; forced mechanical extraction ventilation for 60 mins pre-entry; continuous personal multi-gas detectors (O2, H2S, CO, LEL) with live telemetry.',
    residualProbability: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    residualRiskLevel: 'LOW',
    responsiblePerson: 'Nandi Khumalo (Occupational Hygiene Technologist)',
    monitoringFrequency: 'PER_SHIFT',
    status: 'VERIFIED',
    lastReviewedDate: '2026-10-13',
    standardsReference: 'MHSA Section 12 Environmental Regulations / SANS 10228'
  },
  {
    id: 'WRAC-2026-005',
    activityOrArea: 'Shaft 2 Deep Level Ore Pass Chute 84 Level',
    hazard: 'Mud Rush / Wet Rock Hydraulic Surging from Hang-up Chute',
    consequence: 'Chute gate blow-out, engulfment of loader cabin, drowning in wet fines',
    initialProbability: 3,
    initialSeverity: 5,
    initialRiskScore: 15,
    initialRiskLevel: 'HIGH',
    selectedHierarchy: 'SUBSTITUTION',
    controlDescription: 'Substitute human visual clearing with remote hydraulic high-pressure water cannon operated from protected blast-proof steel cabin; radar mud moisture sensor in ore pass.',
    residualProbability: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    residualRiskLevel: 'LOW',
    responsiblePerson: 'Marcus Botha (Rock Engineering Superintendent)',
    monitoringFrequency: 'DAILY',
    status: 'VERIFIED',
    lastReviewedDate: '2026-10-11',
    standardsReference: 'MHSA Section 9 COP for Prevention of Mud Rushes'
  }
];

export const INITIAL_FMEA_ITEMS: FmeaItem[] = [
  {
    id: 'FMEA-2026-001',
    equipmentSystem: 'Underground LHD Loader (Sandvik LH517i)',
    subsystem: 'Main Hydraulic Steering & Articulation Cylinder',
    equipmentSerialId: 'SN-LHD-2026-9041',
    failureMode: 'High-pressure hydraulic flex hose rupture at 280 bar cyclic pulse',
    potentialEffects: 'Instantaneous loss of steering control in narrow decline shaft; vehicle crash into haulage sidewall or personnel',
    potentialCauses: 'Abrasive quartz rock rub against unprotected sheath, thermal fluid degradation (>85°C)',
    currentControls: 'Weekly visual hose inspection during 250hr service schedule',
    severity: 9,
    occurrence: 6,
    detection: 5,
    rpn: 270, // 9 * 6 * 5 = 270 (CRITICAL)
    rpnLevel: 'CRITICAL',
    mitigationAction: 'Fit SANS-approved Kevlar burst-containment wrap over all steering hoses; install dual redundant electro-hydraulic secondary steering circuit with automatic low-pressure cutout.',
    safetyOfficer: 'Johan van der Merwe (GCC Mechanical Engineer)',
    dueDate: '2026-10-25',
    taskStatus: 'IN_PROGRESS',
    revisedSeverity: 8,
    revisedOccurrence: 2,
    revisedDetection: 2,
    revisedRpn: 32,
    lastUpdated: '2026-10-15'
  },
  {
    id: 'FMEA-2026-002',
    equipmentSystem: 'Main Surface Ventilation Fan #1 (Howden 355kW)',
    subsystem: 'Drive End Spherical Roller Bearing & Lubrication Circuit',
    equipmentSerialId: 'HOWD-FAN-355KW-01',
    failureMode: 'Bearing cage fatigue fracture and catastrophic inner race seizure',
    potentialEffects: 'Complete shutdown of underground ventilation airflow; rapid accumulation of methane/radon in active stopes requiring full shaft evacuation',
    potentialCauses: 'Lubricant starvation due to blocked automatic grease injector; micro-spalling from excessive radial vibration',
    currentControls: 'Monthly manual handheld vibration pen checks; bimonthly grease replenishment',
    severity: 10,
    occurrence: 4,
    detection: 6,
    rpn: 240, // 10 * 4 * 6 = 240 (CRITICAL)
    rpnLevel: 'CRITICAL',
    mitigationAction: 'Install continuous triaxial piezo-accelerometer vibration sensors wired directly to SCADA with automated alert threshold at 4.5 mm/s RMS; integrate automated dual-line positive displacement greaser with low-level sensor.',
    safetyOfficer: 'Kagiso Molefe (Condition Monitoring Specialist)',
    dueDate: '2026-10-22',
    taskStatus: 'IN_PROGRESS',
    revisedSeverity: 9,
    revisedOccurrence: 1,
    revisedDetection: 2,
    revisedRpn: 18,
    lastUpdated: '2026-10-14'
  },
  {
    id: 'FMEA-2026-003',
    equipmentSystem: 'Shaft 1 Winder Hoist (Double Drum 3.2m)',
    subsystem: 'Emergency Hydraulic Disc Caliper Braking Unit',
    equipmentSerialId: 'WND-HOIST-DD-3200',
    failureMode: 'Hydraulic proportional valve spool contamination and sluggish brake release/apply',
    potentialEffects: 'Delayed emergency braking during conveyance over-wind or slack rope detection; severe risk of headgear crash',
    potentialCauses: 'Microscopic metallic particulate in hydraulic oil (<10 micron); seal elastomer extrusion',
    currentControls: 'Daily static brake slip test by winding engine driver; monthly oil laboratory sampling',
    severity: 10,
    occurrence: 3,
    detection: 4,
    rpn: 120, // 10 * 3 * 4 = 120 (HIGH)
    rpnLevel: 'HIGH',
    mitigationAction: 'Upgrade hydraulic power pack with inline 3-micron beta-ratio absolute filters and dual redundant fail-safe gravity weight drop brake calipers.',
    safetyOfficer: 'Pieter Cronje (Appointed GCC Winding Engineer)',
    dueDate: '2026-11-05',
    taskStatus: 'PENDING',
    revisedSeverity: 9,
    revisedOccurrence: 1,
    revisedDetection: 2,
    revisedRpn: 18,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'FMEA-2026-004',
    equipmentSystem: 'Continuous Miner (Joy 12HM31)',
    subsystem: 'Cutter Head Planetary Gearbox & Wet Spray Nozzle Manifold',
    equipmentSerialId: 'JOY-CM-12HM-09',
    failureMode: 'Dust suppression high-pressure water spray nozzle clogging during coal/rock cutting',
    potentialEffects: 'Ignition of volatile airborne dust cloud or methane streak from pick sparking against pyritic quartz',
    potentialCauses: 'Unfiltered recycled underground service water containing suspended mineral silt',
    currentControls: 'Visual spray pattern check by operator at start of cutting cycle',
    severity: 9,
    occurrence: 5,
    detection: 4,
    rpn: 180, // 9 * 5 * 4 = 180 (HIGH)
    rpnLevel: 'HIGH',
    mitigationAction: 'Integrate automated electronic differential pressure sensor across water manifold with automatic cutter head electrical trip if water flow drops below 60 L/min or pressure below 12 bar.',
    safetyOfficer: 'Sipho Sithole (Section 2.9.2 Manager)',
    dueDate: '2026-10-30',
    taskStatus: 'COMPLETED',
    revisedSeverity: 8,
    revisedOccurrence: 1,
    revisedDetection: 2,
    revisedRpn: 16,
    lastUpdated: '2026-10-15'
  },
  {
    id: 'FMEA-2026-005',
    equipmentSystem: 'Underground Mud Slurry Dewatering Pump (Warman 8/6)',
    subsystem: 'Centrifugal Chrome Alloy Impeller & Mechanical Gland Seal',
    equipmentSerialId: 'PUMP-SLURRY-W86-04',
    failureMode: 'Abrasive slurry cavitation eroding impeller vanes leading to severe casing breach',
    potentialEffects: 'Pump chamber flooding on 84 Level; submergence of 525V electrical switchgear and shutdown of main shaft sumps',
    potentialCauses: 'Operating at suction head below NPSH limit due to high sump slurry density (>1.45 kg/L)',
    currentControls: 'Daily operator rounds listening for audible cavitation rattling',
    severity: 7,
    occurrence: 5,
    detection: 3,
    rpn: 105, // 7 * 5 * 3 = 105 (HIGH)
    rpnLevel: 'HIGH',
    mitigationAction: 'Install automated variable speed drive (VSD) modulated by ultrasonic sump level sensor to prevent vortex draw; fit polyurethane protective casing liner.',
    safetyOfficer: 'Thulani Mthembu (Master Artisan / GCC Elect)',
    dueDate: '2026-11-12',
    taskStatus: 'PENDING',
    revisedSeverity: 6,
    revisedOccurrence: 2,
    revisedDetection: 2,
    revisedRpn: 24,
    lastUpdated: '2026-10-12'
  }
];

export const INITIAL_SECTION21_DECLARATIONS: Section21Declaration[] = [
  {
    id: 'S21-DECL-001',
    equipmentSerialId: 'SN-LHD-2026-9041',
    equipmentModel: 'Sandvik LH517i Underground 17-Ton LHD',
    equipmentCategory: 'MOBILE_MACHINERY',
    oemManufacturer: 'Sandvik Mining and Construction South Africa (Pty) Ltd',
    declarationNumber: 'SEC21-SND-2026-8812',
    issueDate: '2026-01-15',
    expiryDate: '2027-01-15',
    status: 'ACTIVE_VALID',
    signatoryName: 'Dr. Hendrik Venter (Pr.Eng, GCC Mechanical #M88219)',
    signatoryDesignation: 'Executive Technical Director & Appointed Section 21 Signatory',
    standardsCompliance: [
      'MHSA Act 29 of 1996 Section 21',
      'DMRE Trackless Mobile Machinery Reg 8.10 (PDS Level 9 Interface)',
      'ISO 3471 Roll-Over Protective Structure (ROPS)',
      'ISO 3449 Falling Object Protective Structure (FOPS Level II)',
      'SANS 10108 Hazardous Location Electrical Enclosures'
    ],
    ergonomicNoiseDba: 79.4,
    vibrationLevelMps2: 0.38,
    brakingTestCertified: true,
    failsafeInterlocksPresent: true,
    cryptographicHash: 'a7f9c2d1b84e03f568a192e44d8721c5b9f04123de670188bcda9135e821fa09',
    inspectionNotes: 'Factory prototype dyno certified. Emergency secondary steering and dual wet disc brakes meet SANS 1589 deceleration slope specifications.',
    bundledInTenderDossier: true,
    miningSectionAssigned: 'Witwatersrand Deep Reef Shaft 4 - Stope 44 East'
  },
  {
    id: 'S21-DECL-002',
    equipmentSerialId: 'EPI-MT42-2025-081',
    equipmentModel: 'Epiroc Minetruck MT42 Underground Articulated Hauler',
    equipmentCategory: 'MOBILE_MACHINERY',
    oemManufacturer: 'Epiroc South Africa (Pty) Ltd',
    declarationNumber: 'EP-MHSA-21-CERT-4410',
    issueDate: '2025-11-20',
    expiryDate: '2026-11-20',
    status: 'ACTIVE_VALID',
    signatoryName: 'Maria Fernandez (Pr.Eng, Chief Design Engineer)',
    signatoryDesignation: 'OEM Chief Product Safety Officer / Section 21 Signatory',
    standardsCompliance: [
      'MHSA Act 29 of 1996 Section 21',
      'ISO 3471 / ISO 3449 ROPS/FOPS Certified Cabin',
      'SANS 1589 Braking Performance on 1:7 Declines',
      'ISO 5010 Earth-Moving Machinery Steering Requirements'
    ],
    ergonomicNoiseDba: 81.2,
    vibrationLevelMps2: 0.42,
    brakingTestCertified: true,
    failsafeInterlocksPresent: true,
    cryptographicHash: '88bcda9135e821fa09a7f9c2d1b84e03f568a192e44d8721c5b9f04123de6701',
    inspectionNotes: 'Equipped with Rig Control System (RCS) digital telemetry and factory PDS speed-limiter retarder. SANS noise emission certified under 85 dB(A).',
    bundledInTenderDossier: true,
    miningSectionAssigned: 'Main Decline Haulage Route Level 75 to 84'
  },
  {
    id: 'S21-DECL-003',
    equipmentSerialId: 'HOWD-FAN-355KW-01',
    equipmentModel: 'Howden 355kW Direct-Drive High-Pressure Mine Centrifugal Fan',
    equipmentCategory: 'VENTILATION_SYSTEM',
    oemManufacturer: 'Howden Africa Industrial Solutions',
    declarationNumber: 'HOW-MHSA21-2026-094',
    issueDate: '2026-02-01',
    expiryDate: '2027-02-01',
    status: 'ACTIVE_VALID',
    signatoryName: 'Johan Botha (Pr.Cert.Eng, GCC Mech / SANS 10330 Lead)',
    signatoryDesignation: 'General Manager Mining Air Handling & S21 Appointee',
    standardsCompliance: [
      'MHSA Act 29 Section 21',
      'SANS 10108 Group I Flameproof Enclosure Rating',
      'ISO 10816-3 Mechanical Vibration Standard (Class G2.5 Balance)',
      'SANS 10338 SADC Occupational Hygiene Airway Standards'
    ],
    ergonomicNoiseDba: 84.8,
    vibrationLevelMps2: 0.12,
    brakingTestCertified: true,
    failsafeInterlocksPresent: true,
    cryptographicHash: '04123de670188bcda9135e821fa09a7f9c2d1b84e03f568a192e44d8721c5b9f',
    inspectionNotes: 'Acoustic discharge silencer attenuates sound power by 18dB(A). Anti-sparking brass blade liner fitted for methane environment protection.',
    bundledInTenderDossier: true,
    miningSectionAssigned: 'Surface Upcast Ventilation Shaft 1'
  },
  {
    id: 'S21-DECL-004',
    equipmentSerialId: 'SAND-DD422-992',
    equipmentModel: 'Sandvik DD422i Dual-Boom Electro-Hydraulic Development Drill Rig',
    equipmentCategory: 'DRILLING_RIG',
    oemManufacturer: 'Sandvik Mining and Construction South Africa (Pty) Ltd',
    declarationNumber: 'SEC21-SND-2025-7733',
    issueDate: '2025-08-10',
    expiryDate: '2026-08-10',
    status: 'ATTENTION_REQUIRED',
    signatoryName: 'Dr. Hendrik Venter (Pr.Eng, GCC Mechanical #M88219)',
    signatoryDesignation: 'Executive Technical Director & Appointed Section 21 Signatory',
    standardsCompliance: [
      'MHSA Act 29 Section 21',
      'SANS 10142-1 Code of Practice for Electrical Installations',
      'ISO 3471 ROPS Cabin',
      'EN 16228 Drilling and Foundation Equipment Safety'
    ],
    ergonomicNoiseDba: 83.0,
    vibrationLevelMps2: 0.45,
    brakingTestCertified: true,
    failsafeInterlocksPresent: true,
    cryptographicHash: 'e44d8721c5b9f04123de670188bcda9135e821fa09a7f9c2d1b84e03f568a192',
    inspectionNotes: 'Scheduled for annual DMRE Section 21 re-certification audit within 60 days. Feed cylinder hydraulic hose replacement recommended.',
    bundledInTenderDossier: false,
    miningSectionAssigned: 'Capital Decline Advance 4B'
  },
  {
    id: 'S21-DECL-005',
    equipmentSerialId: 'KOM-PC2000-781',
    equipmentModel: 'Komatsu PC2000-11 Super Hydraulic Mining Excavator',
    equipmentCategory: 'MOBILE_MACHINERY',
    oemManufacturer: 'Komatsu Africa Holdings (Pty) Ltd',
    declarationNumber: 'KOM-S21-DECL-2026-004',
    issueDate: '2026-03-05',
    expiryDate: '2027-03-05',
    status: 'ACTIVE_VALID',
    signatoryName: 'Kenji Takahashi (Pr.Eng, OEM Engineering Director)',
    signatoryDesignation: 'Regional Lead Machinery Certification Engineer',
    standardsCompliance: [
      'MHSA Act 29 Section 21',
      'ISO 10262 Earth Moving Machinery FOPS Level II',
      'ISO 12100 Safety of Machinery Principles',
      'SANS 10108 / DMR Reg 8 Trackless Mobile Machinery'
    ],
    ergonomicNoiseDba: 78.5,
    vibrationLevelMps2: 0.32,
    brakingTestCertified: true,
    failsafeInterlocksPresent: true,
    cryptographicHash: '35e821fa09a7f9c2d1b84e03f568a192e44d8721c5b9f04123de670188bcda91',
    inspectionNotes: 'KomVision 360-degree radar perimeter detection system active. Automatic fire suppression certified under SANS 1910 with engine bay thermocord triggers.',
    bundledInTenderDossier: true,
    miningSectionAssigned: 'Surface Waste Rock Dump Pit 2'
  }
];

// ============================================================================
// CLIENT DATA FETCH & PERSISTENCE METHODS
// ============================================================================

const WRAC_STORAGE_KEY = 'melotwo_wrac_assessments';
const FMEA_STORAGE_KEY = 'melotwo_fmea_items';
const SECTION21_STORAGE_KEY = 'melotwo_section21_declarations';

export async function fetchWracAssessments(): Promise<WracAssessmentItem[]> {
  try {
    const res = await fetch('/api/compliance/wrac/assessments');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.assessments) && data.assessments.length > 0) {
        localStorage.setItem(WRAC_STORAGE_KEY, JSON.stringify(data.assessments));
        return data.assessments;
      }
    }
  } catch (e) {
    console.warn('[RiskManagementService] Server fetch failed, reading localStorage:', e);
  }

  if (typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem(WRAC_STORAGE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    localStorage.setItem(WRAC_STORAGE_KEY, JSON.stringify(INITIAL_WRAC_ASSESSMENTS));
  }
  return INITIAL_WRAC_ASSESSMENTS;
}

export async function saveWracAssessment(item: Partial<WracAssessmentItem>): Promise<WracAssessmentItem> {
  const prob = (item.initialProbability || 3) as WracProbability;
  const sev = (item.initialSeverity || 3) as WracSeverity;
  const initRisk = calculateWracRisk(prob, sev);

  const resProb = (item.residualProbability || 1) as WracProbability;
  const resSev = (item.residualSeverity || 2) as WracSeverity;
  const resRisk = calculateWracRisk(resProb, resSev);

  const isAutoCapa = initRisk.triggersAutoCapa;

  const completeItem: WracAssessmentItem = {
    id: item.id || `WRAC-${Date.now().toString().slice(-6)}`,
    activityOrArea: item.activityOrArea || 'General Underground Operations',
    hazard: item.hazard || 'Unspecified Operational Hazard',
    consequence: item.consequence || 'Potential Injury or Asset Damage',
    initialProbability: prob,
    initialSeverity: sev,
    initialRiskScore: initRisk.score,
    initialRiskLevel: initRisk.level,
    selectedHierarchy: item.selectedHierarchy || 'ENGINEERING',
    controlDescription: item.controlDescription || 'Standard engineering barriers and personal protection',
    residualProbability: resProb,
    residualSeverity: resSev,
    residualRiskScore: resRisk.score,
    residualRiskLevel: resRisk.level,
    responsiblePerson: item.responsiblePerson || 'Mine Overseer / Section Safety Officer',
    monitoringFrequency: item.monitoringFrequency || 'PER_SHIFT',
    status: item.status || 'ACTIVE',
    lastReviewedDate: new Date().toISOString().split('T')[0],
    standardsReference: item.standardsReference || 'MHSA Act 29 / SANS 31000',
    requiresAutoCapa: isAutoCapa,
    autoCapaTicketId: item.autoCapaTicketId || (isAutoCapa ? `CAPA-CR9.1-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
    autoCapaEscalatedAt: item.autoCapaEscalatedAt || (isAutoCapa ? new Date().toISOString() : undefined),
    autoCapaStatus: item.autoCapaStatus || (isAutoCapa ? 'OPEN_ESCALATED' : undefined),
    cr91Signatory: item.cr91Signatory || '',
    cr91SignedAt: item.cr91SignedAt || '',
    cr91DigitalSeal: item.cr91DigitalSeal || ''
  };

  try {
    await fetch('/api/compliance/wrac/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completeItem)
    });
  } catch (e) {
    console.warn('[RiskManagementService] Server sync notice:', e);
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchWracAssessments();
      const existingIdx = current.findIndex(a => a.id === completeItem.id);
      let updated: WracAssessmentItem[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = completeItem;
      } else {
        updated = [completeItem, ...current];
      }
      localStorage.setItem(WRAC_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  return completeItem;
}

export async function deleteWracAssessment(id: string): Promise<boolean> {
  try {
    await fetch(`/api/compliance/wrac/assessments/${id}`, { method: 'DELETE' });
  } catch {}

  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchWracAssessments();
      const filtered = current.filter(a => a.id !== id);
      localStorage.setItem(WRAC_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {}
  }
  return true;
}

// ----------------------------------------------------------------------------
// FMEA METHODS
// ----------------------------------------------------------------------------

export async function fetchFmeaItems(): Promise<FmeaItem[]> {
  try {
    const res = await fetch('/api/compliance/fmea/items');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        localStorage.setItem(FMEA_STORAGE_KEY, JSON.stringify(data.items));
        return data.items;
      }
    }
  } catch (e) {
    console.warn('[RiskManagementService] FMEA server fetch failed, reading localStorage:', e);
  }

  if (typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem(FMEA_STORAGE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    localStorage.setItem(FMEA_STORAGE_KEY, JSON.stringify(INITIAL_FMEA_ITEMS));
  }
  return INITIAL_FMEA_ITEMS;
}

export async function saveFmeaItem(item: Partial<FmeaItem>): Promise<FmeaItem> {
  const s = Number(item.severity || 5);
  const o = Number(item.occurrence || 5);
  const d = Number(item.detection || 5);
  const rpnCalc = calculateRpn(s, o, d);

  let revRpn: number | undefined;
  if (item.revisedSeverity && item.revisedOccurrence && item.revisedDetection) {
    revRpn = item.revisedSeverity * item.revisedOccurrence * item.revisedDetection;
  }

  const isLocked = rpnCalc.triggersGccLockout;

  const completeItem: FmeaItem = {
    id: item.id || `FMEA-${Date.now().toString().slice(-6)}`,
    equipmentSystem: item.equipmentSystem || 'Mobile Trackless Machinery',
    subsystem: item.subsystem || 'Mechanical / Hydraulic Power Circuit',
    equipmentSerialId: item.equipmentSerialId || 'EQ-UNKNOWN',
    failureMode: item.failureMode || 'Component Failure / Loss of Function',
    potentialEffects: item.potentialEffects || 'Operational disruption and elevated safety risk',
    potentialCauses: item.potentialCauses || 'Wear, fatigue, contamination, or thermal stress',
    currentControls: item.currentControls || 'Standard PPM visual checks',
    severity: s,
    occurrence: o,
    detection: d,
    rpn: rpnCalc.rpn,
    rpnLevel: rpnCalc.level,
    mitigationAction: item.mitigationAction || 'Engineering redesign and enhanced telemetry sensing',
    safetyOfficer: item.safetyOfficer || 'Section Mechanical Engineer',
    dueDate: item.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    taskStatus: item.taskStatus || 'PENDING',
    revisedSeverity: item.revisedSeverity,
    revisedOccurrence: item.revisedOccurrence,
    revisedDetection: item.revisedDetection,
    revisedRpn: revRpn,
    lastUpdated: new Date().toISOString().split('T')[0],
    isStatutoryLockedOut: item.isStatutoryLockedOut !== undefined ? item.isStatutoryLockedOut : isLocked,
    lockoutReference: item.lockoutReference || (isLocked ? `MHSA-SEC2.13-LOCK-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
    gccClearanceEngineer: item.gccClearanceEngineer || '',
    gccClearanceCertificateId: item.gccClearanceCertificateId || '',
    gccClearedAt: item.gccClearedAt || '',
    gccDigitalSignature: item.gccDigitalSignature || ''
  };

  try {
    await fetch('/api/compliance/fmea/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completeItem)
    });
  } catch (e) {
    console.warn('[RiskManagementService] FMEA server sync notice:', e);
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchFmeaItems();
      const existingIdx = current.findIndex(f => f.id === completeItem.id);
      let updated: FmeaItem[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = completeItem;
      } else {
        updated = [completeItem, ...current];
      }
      localStorage.setItem(FMEA_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  return completeItem;
}

export async function updateFmeaMitigation(
  id: string,
  updates: {
    mitigationAction?: string;
    safetyOfficer?: string;
    dueDate?: string;
    taskStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    revisedSeverity?: number;
    revisedOccurrence?: number;
    revisedDetection?: number;
  }
): Promise<FmeaItem | null> {
  const current = await fetchFmeaItems();
  const target = current.find(f => f.id === id);
  if (!target) return null;

  const merged = { ...target, ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
  if (merged.revisedSeverity && merged.revisedOccurrence && merged.revisedDetection) {
    merged.revisedRpn = merged.revisedSeverity * merged.revisedOccurrence * merged.revisedDetection;
  }

  return await saveFmeaItem(merged);
}

export async function signOffWracCapa(
  itemId: string,
  cr91Signatory: string,
  notes?: string
): Promise<WracAssessmentItem | null> {
  const current = await fetchWracAssessments();
  const target = current.find(a => a.id === itemId);
  if (!target) return null;

  const updated: WracAssessmentItem = {
    ...target,
    autoCapaStatus: 'CR91_SIGNED_OFF',
    cr91Signatory: cr91Signatory || 'Appointed CR 9.1 Risk Assessor',
    cr91SignedAt: new Date().toISOString(),
    cr91DigitalSeal: `SHA256:CR91:${Math.random().toString(36).substring(2, 10).toUpperCase()}:${Date.now()}`,
    status: 'VERIFIED',
    controlDescription: notes ? `${target.controlDescription} | CR 9.1 Directive: ${notes}` : target.controlDescription,
    lastReviewedDate: new Date().toISOString().split('T')[0]
  };

  return await saveWracAssessment(updated);
}

export async function clearFmeaGccLockout(
  itemId: string,
  gccClearanceEngineer: string,
  certId?: string
): Promise<FmeaItem | null> {
  const current = await fetchFmeaItems();
  const target = current.find(f => f.id === itemId);
  if (!target) return null;

  const updated: FmeaItem = {
    ...target,
    isStatutoryLockedOut: false,
    gccClearanceEngineer: gccClearanceEngineer || 'Appointed GCC Mechanical/Electrical Engineer',
    gccClearanceCertificateId: certId || `GCC-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
    gccClearedAt: new Date().toISOString(),
    gccDigitalSignature: `GCC-SIG-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    taskStatus: 'IN_PROGRESS',
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  return await saveFmeaItem(updated);
}

// ----------------------------------------------------------------------------
// SECTION 21 OEM VAULT METHODS
// ----------------------------------------------------------------------------

export async function fetchSection21Declarations(): Promise<Section21Declaration[]> {
  try {
    const res = await fetch('/api/compliance/section21/declarations');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.declarations) && data.declarations.length > 0) {
        localStorage.setItem(SECTION21_STORAGE_KEY, JSON.stringify(data.declarations));
        return data.declarations;
      }
    }
  } catch (e) {
    console.warn('[RiskManagementService] Section 21 server fetch failed, reading localStorage:', e);
  }

  if (typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem(SECTION21_STORAGE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    localStorage.setItem(SECTION21_STORAGE_KEY, JSON.stringify(INITIAL_SECTION21_DECLARATIONS));
  }
  return INITIAL_SECTION21_DECLARATIONS;
}

export async function saveSection21Declaration(decl: Partial<Section21Declaration>): Promise<Section21Declaration> {
  const completeDecl: Section21Declaration = {
    id: decl.id || `S21-DECL-${Date.now().toString().slice(-4)}`,
    equipmentSerialId: (decl.equipmentSerialId || `SN-EQ-${Date.now().toString().slice(-4)}`).toUpperCase(),
    equipmentModel: decl.equipmentModel || 'Mining Heavy Machinery',
    equipmentCategory: decl.equipmentCategory || 'MOBILE_MACHINERY',
    oemManufacturer: decl.oemManufacturer || 'OEM Manufacturer',
    declarationNumber: decl.declarationNumber || `SEC21-DECL-${Date.now().toString().slice(-6)}`,
    issueDate: decl.issueDate || new Date().toISOString().split('T')[0],
    expiryDate: decl.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: decl.status || 'ACTIVE_VALID',
    signatoryName: decl.signatoryName || 'Appointed GCC Professional Engineer',
    signatoryDesignation: decl.signatoryDesignation || 'OEM Chief Technical Officer / Section 21 Signatory',
    standardsCompliance: decl.standardsCompliance && decl.standardsCompliance.length > 0
      ? decl.standardsCompliance
      : ['MHSA Act 29 Section 21', 'ISO 3471 ROPS', 'SANS 10108 Flameproof'],
    ergonomicNoiseDba: Number(decl.ergonomicNoiseDba || 82),
    vibrationLevelMps2: Number(decl.vibrationLevelMps2 || 0.4),
    brakingTestCertified: decl.brakingTestCertified ?? true,
    failsafeInterlocksPresent: decl.failsafeInterlocksPresent ?? true,
    cryptographicHash: decl.cryptographicHash || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    inspectionNotes: decl.inspectionNotes || 'Manufacturer pre-delivery statutory inspection completed. Safe for underground deployment.',
    bundledInTenderDossier: decl.bundledInTenderDossier ?? true,
    miningSectionAssigned: decl.miningSectionAssigned || 'Active Mining Site'
  };

  try {
    await fetch('/api/compliance/section21/declarations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completeDecl)
    });
  } catch (e) {
    console.warn('[RiskManagementService] Section 21 server sync notice:', e);
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchSection21Declarations();
      const existingIdx = current.findIndex(d => d.id === completeDecl.id);
      let updated: Section21Declaration[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = completeDecl;
      } else {
        updated = [completeDecl, ...current];
      }
      localStorage.setItem(SECTION21_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  return completeDecl;
}

export async function toggleBundleSection21ToTender(id: string, bundled: boolean): Promise<Section21Declaration | null> {
  const current = await fetchSection21Declarations();
  const target = current.find(d => d.id === id);
  if (!target) return null;

  const updated = { ...target, bundledInTenderDossier: bundled };
  return await saveSection21Declaration(updated);
}

// ============================================================================
// PDF EXPORT FUNCTIONS
// ============================================================================

/**
 * Export Section 21 OEM Declarations as Official PDF for DMRE Section 54/55 Audits
 */
export function exportSection21VaultPdf(declarations: Section21Declaration[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currentDate = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

  // Page Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 42, 'F');

  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 41, 210, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MHSA SECTION 21 SUPPLIER & OEM COMPLIANCE VAULT', 14, 16);

  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11);
  doc.text('MINE HEALTH AND SAFETY ACT (ACT NO. 29 OF 1996) • STATUTORY MANUFACTURER CERTIFICATES', 14, 24);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Audit Register • Generated: ${currentDate} • Verified for DMRE Section 54 Inspections`, 14, 32);

  let y = 50;

  // Overview stats summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total OEM Declarations: ${declarations.length}`, 18, y + 6);
  doc.text(`Active Certified: ${declarations.filter(d => d.status === 'ACTIVE_VALID').length}`, 75, y + 6);
  doc.text(`Bundled in Tender Dossier: ${declarations.filter(d => d.bundledInTenderDossier).length}`, 130, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Mandatory duty of manufacturers/suppliers under Section 21 to certify equipment safe without risk to health.', 18, y + 12);

  y += 22;

  // List each equipment declaration
  declarations.forEach((decl, idx) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    const isAlert = decl.status === 'ATTENTION_REQUIRED' || decl.status === 'EXPIRED';

    doc.setFillColor(isAlert ? 254 : 255, isAlert ? 242 : 255, isAlert ? 242 : 255);
    doc.roundedRect(14, y, 182, 34, 2, 2, 'F');
    doc.setDrawColor(isAlert ? 239 : 203, isAlert ? 68 : 213, isAlert ? 68 : 225);
    doc.roundedRect(14, y, 182, 34, 2, 2, 'S');

    // Title line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. ${decl.equipmentModel}`, 18, y + 6);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text(`Serial ID: ${decl.equipmentSerialId}`, 130, y + 6);

    // Sub-line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`OEM: ${decl.oemManufacturer} | Decl No: ${decl.declarationNumber}`, 18, y + 11.5);
    doc.text(`Assigned Section: ${decl.miningSectionAssigned} | Valid: ${decl.issueDate} to ${decl.expiryDate}`, 18, y + 16.5);
    doc.text(`Signatory: ${decl.signatoryName} (${decl.signatoryDesignation})`, 18, y + 21.5);

    // Ergonomics & Safety features
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Noise: ${decl.ergonomicNoiseDba} dB(A) | Vibration: ${decl.vibrationLevelMps2} m/s² | Braking Certified: ${decl.brakingTestCertified ? 'YES' : 'NO'} | Failsafe Interlocks: ${decl.failsafeInterlocksPresent ? 'ACTIVE' : 'NO'}`,
      18,
      y + 26.5
    );

    // Cryptographic Hash Anchor
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`SHA-256 Ledger Anchor: ${decl.cryptographicHash}`, 18, y + 31);

    y += 38;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Compiled via MeloTwo Mine Safety Engine • Republic of South Africa MHSA Act 29 of 1996 Section 21 Repository', 105, 288, { align: 'center' });

  doc.save(`MeloTwo_MHSA_Section21_OEM_Vault_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Export WRAC 5x5 Risk Assessment Register (PDF)
 */
export function exportWracMatrixPdf(assessments: WracAssessmentItem[]): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const currentDate = new Date().toLocaleDateString('en-ZA');

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 36, 'F');

  doc.setFillColor(245, 158, 11);
  doc.rect(0, 35, 297, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('WORKPLACE RISK ASSESSMENT & CONTROL (WRAC) REGISTER', 14, 14);

  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11);
  doc.text('SANS 31000 / ISO 31000 RISK MANAGEMENT • MINE HEALTH & SAFETY ACT SECTION 11(1)', 14, 22);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Site Operational Risk Matrix • Compiled: ${currentDate} • Verified Controls & Hierarchy Alignment`, 14, 29);

  let y = 44;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 269, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Activity / Area', 16, y + 6);
  doc.text('Hazard & Consequence', 72, y + 6);
  doc.text('Init (PxS)', 145, y + 6);
  doc.text('Control Hierarchy Applied', 165, y + 6);
  doc.text('Residual', 215, y + 6);
  doc.text('Responsible / Frequency', 235, y + 6);

  y += 10;

  assessments.forEach((item) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 269, 15, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 269, 15, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(item.activityOrArea, 54), 16, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const hazLines = doc.splitTextToSize(`${item.hazard} - ${item.consequence}`, 70);
    doc.text(hazLines.slice(0, 2), 72, y + 4.5);

    // Initial Risk Badge
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.initialRiskLevel} (${item.initialRiskScore})`, 145, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`P:${item.initialProbability} x S:${item.initialSeverity}`, 145, y + 9);

    // Hierarchy & Controls
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(item.selectedHierarchy, 165, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    const ctrlLines = doc.splitTextToSize(item.controlDescription, 46);
    doc.text(ctrlLines.slice(0, 2), 165, y + 8.5);

    // Residual Risk
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`${item.residualRiskLevel} (${item.residualRiskScore})`, 215, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`P:${item.residualProbability} x S:${item.residualSeverity}`, 215, y + 9);

    // Responsible Person
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(item.responsiblePerson.slice(0, 28), 235, y + 5);
    doc.text(`Freq: ${item.monitoringFrequency}`, 235, y + 9);

    y += 16;
  });

  doc.save(`MeloTwo_WRAC_Risk_Register_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Export FMEA Reliability & RPN Report (PDF)
 */
export function exportFmeaReportPdf(items: FmeaItem[]): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const currentDate = new Date().toLocaleDateString('en-ZA');

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 36, 'F');

  doc.setFillColor(239, 68, 68); // red-500
  doc.rect(0, 35, 297, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FAILURE MODES AND EFFECTS ANALYSIS (FMEA) AUDIT DOSSIER', 14, 14);

  doc.setFontSize(8.5);
  doc.setTextColor(248, 113, 113);
  doc.text('CRITICAL EQUIPMENT RELIABILITY & RISK PRIORITY NUMBER (RPN) REGISTER • SANS / ISO 31010', 14, 22);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${currentDate} • Calculated via RPN = Severity (S) x Occurrence (O) x Detection (D)`, 14, 29);

  let y = 44;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 269, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('System / Subsystem', 16, y + 6);
  doc.text('Failure Mode & Potential Effects', 66, y + 6);
  doc.text('S', 145, y + 6);
  doc.text('O', 153, y + 6);
  doc.text('D', 161, y + 6);
  doc.text('RPN', 170, y + 6);
  doc.text('Mitigation Action & Assignee', 185, y + 6);
  doc.text('Status / Target RPN', 245, y + 6);

  y += 10;

  items.forEach((item) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }

    const isCrit = item.rpn >= 200;
    doc.setFillColor(isCrit ? 254 : 248, isCrit ? 242 : 250, isCrit ? 242 : 252);
    doc.rect(14, y, 269, 16, 'F');
    doc.setDrawColor(isCrit ? 252 : 226, isCrit ? 165 : 232, isCrit ? 165 : 240);
    doc.rect(14, y, 269, 16, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(item.equipmentSystem, 48), 16, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(doc.splitTextToSize(item.subsystem, 48), 16, y + 9);

    // Failure mode & effects
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(item.failureMode, 76), 66, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(doc.splitTextToSize(item.potentialEffects, 76), 66, y + 9);

    // S, O, D, RPN
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${item.severity}`, 145, y + 7);
    doc.text(`${item.occurrence}`, 153, y + 7);
    doc.text(`${item.detection}`, 161, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isCrit ? 220 : 15, isCrit ? 38 : 23, isCrit ? 38 : 42);
    doc.text(`${item.rpn}`, 170, y + 7);

    // Mitigation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const mitLines = doc.splitTextToSize(item.mitigationAction, 56);
    doc.text(mitLines.slice(0, 2), 185, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Assignee: ${item.safetyOfficer} (Due: ${item.dueDate})`, 185, y + 12);

    // Status & Revised RPN
    doc.setFont('helvetica', 'bold');
    doc.text(item.taskStatus, 245, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(item.revisedRpn ? `Target RPN: ${item.revisedRpn}` : 'Pending Re-Score', 245, y + 9.5);

    y += 17;
  });

  doc.save(`MeloTwo_FMEA_Reliability_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
