import { Express, Request, Response } from 'express';
import crypto from 'crypto';
import {
  DailyComplianceSignOff,
  StatutoryLegalAppointment,
  HighRiskOperationalPermit,
  SafetyFileBinderDossier,
  OperatorCredentialProfile,
  HeavyMachineAsset,
  MachineAssignmentEvaluation,
  TradeQualificationRecord,
  WorkplaceSkillsPlanSummary,
  AnnualTrainingReportSummary,
  BbeeSkillsScorecardSummary,
  Tier1HostSite
} from '../types/complianceEngine';
import {
  StatutoryEnvironmentalLicense,
  LiabilityTransferHandoverItem,
  EsgClosureTransitionMetric,
  MineClosureSuiteOverview,
  EnterpriseTier1Host,
  DefensibilityCategoryScore,
  DefensibilityIndexResult,
  CrossBorderRegulatoryMappingItem,
  ComplianceGapAlert
} from '../types/crossBorderCompliance';

// ============================================================================
// IN-MEMORY STORAGE & SEED DATA
// ============================================================================

// 1. Daily Operational Sign-Offs
let dailySignOffs: DailyComplianceSignOff[] = [
  {
    id: 'SO-2026-001',
    siteId: 'SITE-WIT-01',
    siteName: 'Witwatersrand Deep Reef Shaft 4',
    date: new Date().toISOString().split('T')[0],
    shift: 'DAY_SHIFT',
    type: 'BASELINE_HIRA',
    title: 'Baseline Risk Assessment - Mechanised Stope 44 East',
    taskDescription: 'Daily baseline hazard identification for mechanised drill-and-blast advance on 44-East reef horizon.',
    hazardCategories: ['Fall of Ground (FOG)', 'Methane Transient Gas', 'Mobile Equipment Collision', 'Noise / Dust'],
    residualRiskRating: 'LOW',
    controlMeasuresApplied: [
      'Pre-shift barring down verified with acoustic sounding rod',
      'Continuous CH4 handheld sensor operational (0.0% v/v reading)',
      'Epiroc Boomer drill rig illuminated safety halo barrier activated',
      'Water blast misting active for respirable dust suppression'
    ],
    supervisorName: 'Sipho Sithole (Mine Overseer)',
    supervisorDesignation: 'Section Manager / MHSA 2.9.2 Appointee',
    supervisorSignatureHash: crypto.createHash('sha256').update('Sipho-Sithole-MHSA-2.9.2-Stope44').digest('hex').substring(0, 16),
    teamMembersCount: 14,
    status: 'APPROVED',
    sansReference: 'SANS 31000 / SANS 10108',
    mhsaClause: 'MHSA Act 29 of 1996 Section 11(1)'
  },
  {
    id: 'SO-2026-002',
    siteId: 'SITE-WIT-01',
    siteName: 'Witwatersrand Deep Reef Shaft 4',
    date: new Date().toISOString().split('T')[0],
    shift: 'DAY_SHIFT',
    type: 'SAFE_WORK_PROCEDURE_SWP',
    title: 'SWP-042: High Pressure Water Jet Descaling on Chute 3',
    taskDescription: 'Safe work procedure compliance verification for 500-bar hydraulic chute scale clearing.',
    hazardCategories: ['High-Pressure Fluid Injection', 'Slips & Falls', 'Pinch Points'],
    residualRiskRating: 'LOW',
    controlMeasuresApplied: [
      'Deadman trigger handle inspection passed',
      'Artisan Kevlar whip-check restraints installed on all hose joints',
      'Full ballistic face shield and 800-bar protective gaiters donned'
    ],
    supervisorName: 'Johan van der Merwe (Engineer)',
    supervisorDesignation: 'Mechanical Engineer / MHSA 2.6.1 Appointee',
    supervisorSignatureHash: crypto.createHash('sha256').update('Johan-vdM-MHSA-2.6.1-SWP042').digest('hex').substring(0, 16),
    teamMembersCount: 6,
    status: 'APPROVED',
    sansReference: 'SANS 10287',
    mhsaClause: 'MHSA Act 29 of 1996 Section 10'
  }
];

// 2. Statutory Legal Appointments
let statutoryAppointments: StatutoryLegalAppointment[] = [
  {
    id: 'APPT-MHSA-292',
    act: 'MHSA',
    sectionCode: 'MHSA_2_9_2',
    sectionTitle: 'Subordinate Manager / Mine Overseer (Section 2.9.2)',
    appointeeName: 'Sipho Sithole',
    appointeeIdNumber: '8403155123088',
    appointeeDesignation: 'Underground Production Manager',
    certificateOfCompetency: 'Mine Overseer Certificate of Competency (DMRE Cert #MOC-8841)',
    gazettedLegalScope: 'Full statutory supervision of underground mining operations, ventilation stope boundaries, and shift safety discipline on Shaft 4.',
    appointedAreaOrShaft: 'Shaft 4 (Levels 28 to 36)',
    appointingAuthorityName: 'Dr. Michael van Niekerk',
    appointingAuthorityDesignation: 'Mine General Manager / MHSA 3.1(a) Appointee',
    appointmentDate: '2025-01-15',
    acceptanceDate: '2025-01-16',
    expiryDate: '2027-01-15',
    status: 'ACTIVE',
    daysUntilExpiry: 467,
    verifiedInAuditLedger: true
  },
  {
    id: 'APPT-MHSA-261',
    act: 'MHSA',
    sectionCode: 'MHSA_2_6_1',
    sectionTitle: 'Competent Person / Engineer in Charge of Machinery (Section 2.6.1)',
    appointeeName: 'Johan van der Merwe',
    appointeeIdNumber: '7911025098081',
    appointeeDesignation: 'Chief Mechanical & Electrical Engineer',
    certificateOfCompetency: 'Government Certificate of Competency (GCC Mines & Works Mechanical #GCC-2012-441)',
    gazettedLegalScope: 'Statutory custody, safe maintenance, statutory testing, and LOTO oversight of all tracked and trackless mobile machinery, winder ropes, and surface processing plants.',
    appointedAreaOrShaft: 'Shaft 4 Surface & Underground Machinery Complexes',
    appointingAuthorityName: 'Dr. Michael van Niekerk',
    appointingAuthorityDesignation: 'Mine General Manager',
    appointmentDate: '2025-03-01',
    acceptanceDate: '2025-03-02',
    expiryDate: '2027-03-01',
    status: 'ACTIVE',
    daysUntilExpiry: 512,
    verifiedInAuditLedger: true
  },
  {
    id: 'APPT-OHSA-162',
    act: 'OHSA',
    sectionCode: 'OHSA_16_2',
    sectionTitle: 'Assignee of Chief Executive Officer (Section 16.2)',
    appointeeName: 'Nomsa Khumalo',
    appointeeIdNumber: '8806210214083',
    appointeeDesignation: 'Contractor Operations Director',
    certificateOfCompetency: 'SAMTRAC / ISO 45001 Lead Auditor / BTech Safety Management',
    gazettedLegalScope: 'Assigned corporate duties of CEO under Section 16(1) for contractor operations, SHEQ file governance, and DMRE compliance across SADC operations.',
    appointedAreaOrShaft: 'MeloTwo Industrial Contractor Scope',
    appointingAuthorityName: 'Board of Directors / Managing Director',
    appointingAuthorityDesignation: 'Chief Executive Officer (Section 16.1)',
    appointmentDate: '2026-01-10',
    acceptanceDate: '2026-01-10',
    expiryDate: '2027-01-10',
    status: 'ACTIVE',
    daysUntilExpiry: 279,
    verifiedInAuditLedger: true
  },
  {
    id: 'APPT-OHSA-CR81',
    act: 'OHSA',
    sectionCode: 'OHSA_CR_8_1',
    sectionTitle: 'Construction Manager (Construction Regulation 8.1)',
    appointeeName: 'David Mokoena',
    appointeeIdNumber: '8207195432087',
    appointeeDesignation: 'Site Construction Manager',
    certificateOfCompetency: 'SACPCMP Registered Construction Manager (Pr.CM #4412/2018)',
    gazettedLegalScope: 'Statutory management of structural steel erection, civil engineering structures, and scaffolding safety on surface processing expansion.',
    appointedAreaOrShaft: 'Mogalakwena Concentrator Expansion Civils',
    appointingAuthorityName: 'Nomsa Khumalo',
    appointingAuthorityDesignation: 'OHSA 16.2 Appointee',
    appointmentDate: '2025-08-01',
    acceptanceDate: '2025-08-02',
    expiryDate: '2026-11-01',
    status: 'EXPIRING_SOON',
    daysUntilExpiry: 27,
    verifiedInAuditLedger: true
  }
];

// 3. High-Risk Operational Permits
let highRiskPermits: HighRiskOperationalPermit[] = [
  {
    id: 'PERM-WAH-2026-091',
    permitNumber: 'PERM-WAH-2026-091',
    permitType: 'WORKING_AT_HEIGHT',
    siteId: 'SITE-WIT-01',
    exactWorkLocation: 'Concentrator Thickener Tank 2 Launders (Elevation 14.5m)',
    validFrom: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    validTo: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    issuerName: 'David Mokoena (Construction Manager)',
    issuerDesignation: 'SACPCMP Construction Manager / WAH Issuer',
    receiverName: 'Sibusiso Ndlovu (Artisan Rigger)',
    receiverTeamCount: 4,
    safetyChecklist: [
      { item: 'SANS 10333 Fall Protection Plan site-specific risk assessment verified', verified: true, statutoryMandate: 'OHSA CR 10(1)' },
      { item: 'Full body harnesses with shock-absorbing double lanyards pre-use inspected', verified: true, statutoryMandate: 'SANS 50361' },
      { item: 'Certified static lifeline anchored to engineered points (min 22kN shear strength)', verified: true, statutoryMandate: 'SANS 50795' },
      { item: 'High-angle suspension trauma rescue plan kit & trained rescuer present', verified: true, statutoryMandate: 'MHSA Ch 16' },
      { item: 'Drop-zone barricading erected with danger tape and spotter posted', verified: true, statutoryMandate: 'OHSA Section 8' }
    ],
    fallProtectionPlanVerified: true,
    rescuePlanInPlace: true,
    status: 'ACTIVE_VALID',
    minsRemaining: 360
  },
  {
    id: 'PERM-LOTO-2026-044',
    permitNumber: 'PERM-LOTO-2026-044',
    permitType: 'LOTO_ENERGY_ISOLATION',
    siteId: 'SITE-WIT-01',
    exactWorkLocation: 'Substation 4B - Overland Conveyor CV-02 Main Drive (3.3kV Motor)',
    validFrom: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    validTo: new Date(Date.now() + 7 * 3600 * 1000).toISOString(),
    issuerName: 'Johan van der Merwe (GCC Engineer)',
    issuerDesignation: 'MHSA 2.6.1 Statutory Electrical Engineer',
    receiverName: 'Thulani Mthembu (Master Artisan Electrician)',
    receiverTeamCount: 3,
    safetyChecklist: [
      { item: '3.3kV vacuum circuit breaker racked out to ISOLATED/TEST position', verified: true, statutoryMandate: 'SANS 10142-1' },
      { item: 'Live-line voltage probe test executed to prove ZERO ELECTRICAL ENERGY', verified: true, statutoryMandate: 'MHSA Reg 3.1' },
      { item: 'Gravity counterweight mechanically chocked with certified steel dog-pins', verified: true, statutoryMandate: 'SANS 10287' },
      { item: 'Hydraulic take-up cylinder pressure dumped to 0 bar', verified: true, statutoryMandate: 'MHSA Reg 8.9' }
    ],
    lotoPoints: [
      { equipmentTag: 'CB-CV02-3.3kV', isolationType: 'ELECTRICAL_BREAKER', padlockNumber: 'LOCK-GOLD-881', dangerTagNumber: 'TAG-LOTO-0019', zeroEnergyVerified: true, isolationSignature: 'J. vd Merwe' },
      { equipmentTag: 'VALVE-HYD-TK01', isolationType: 'HYDRAULIC_VALVE', padlockNumber: 'LOCK-RED-442', dangerTagNumber: 'TAG-LOTO-0020', zeroEnergyVerified: true, isolationSignature: 'T. Mthembu' }
    ],
    rescuePlanInPlace: true,
    status: 'ACTIVE_VALID',
    minsRemaining: 420
  },
  {
    id: 'PERM-CSE-2026-019',
    permitNumber: 'PERM-CSE-2026-019',
    permitType: 'CONFINED_SPACE_ENTRY',
    siteId: 'SITE-WIT-01',
    exactWorkLocation: 'Secondary Ball Mill #1 Interior Shell Inspection',
    validFrom: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    validTo: new Date(Date.now() + 5.5 * 3600 * 1000).toISOString(),
    issuerName: 'Johan van der Merwe',
    issuerDesignation: 'MHSA 2.6.1 Engineer',
    receiverName: 'Zanele Sithole (Boilermaker)',
    receiverTeamCount: 3,
    safetyChecklist: [
      { item: 'Mechanical inching drive physically de-energized and locked out', verified: true, statutoryMandate: 'MHSA Reg 8.8' },
      { item: 'Continuous forced-air mechanical ventilation active (> 20 air changes/hr)', verified: true, statutoryMandate: 'SANS 10228' },
      { item: 'Full body rescue harness with retrieval winch line worn by entrant', verified: true, statutoryMandate: 'OHSA GSR 5' },
      { item: 'Dedicated standby sentry posted at manhole with emergency air horn', verified: true, statutoryMandate: 'SANS 10228' }
    ],
    gasTest: {
      o2Percentage: 20.9,
      lelPercentage: 0.0,
      coPpm: 2,
      h2sPpm: 0,
      ch4Percentage: 0.0,
      testedBy: 'A. Malan (Occupational Hygienist)',
      gasProbeSerialNumber: 'MX4-VENTIS-88102',
      calibrationValid: true,
      timestamp: new Date().toISOString()
    },
    rescuePlanInPlace: true,
    status: 'ACTIVE_VALID',
    minsRemaining: 330
  }
];

// 4. Operator Credentials & Heavy Machine Assets
let operatorProfiles: OperatorCredentialProfile[] = [
  {
    id: 'OP-001',
    operatorName: 'Kagiso Molefe',
    idNumber: '8904125189084',
    employeeNumber: 'MT-EMP-4401',
    contractorCompany: 'MeloTwo Mining Services JV',
    primaryMachineClass: 'LHD_LOADER',
    medicalFitness: {
      certificateNumber: 'MED-ANNEX3-2026-881',
      ompName: 'Dr. Brian Khanyile (MBChB, DOH)',
      ompPracticeNumber: 'OMP-440129-SA',
      issueDate: '2026-01-10',
      expiryDate: '2027-01-10',
      isExpired: false,
      daysToExpiry: 279,
      fitnessClassification: 'FIT_UNDERGROUND',
      audiometryPlhPercentage: 1.2,
      lungFunctionFvcPercentage: 98.4,
      cardiacClearance: true,
      specialRestrictions: []
    },
    simulatorCertifications: [
      {
        simulatorOem: 'EPIROC',
        simulatorModel: 'Epiroc Master Cab Simulator (ST14 / ST18)',
        machineClass: 'LHD_LOADER',
        assessmentDate: '2026-02-14',
        virtualHoursLogged: 52,
        hazardAvoidanceScorePct: 96,
        reactionTimeSeconds: 0.85,
        operatingEfficiencyPct: 94,
        gradeLevel: 'LEVEL_3_MASTER_OPERATOR',
        isCertified: true,
        certificateHash: 'EPIROC-SIM-ST14-KM-96PCT'
      }
    ],
    licenses: [
      {
        licenseNumber: 'DMRE-TMM-LHD-01',
        licenseCode: 'DMRE-TMM-LHD-01',
        machineClass: 'LHD_LOADER',
        issuingAuthority: 'DMRE',
        issueDate: '2024-04-10',
        expiryDate: '2027-04-10',
        isValid: true
      }
    ],
    shiftHoursLoggedPast24h: 3.5,
    fatigueRiskScore: 'LOW',
    activePermitsAssigned: ['PERM-SHIFT-4401']
  },
  {
    id: 'OP-002',
    operatorName: 'Dumisani Zulu',
    idNumber: '9208155234081',
    employeeNumber: 'MT-EMP-4402',
    contractorCompany: 'MeloTwo Mining Services JV',
    primaryMachineClass: 'DRILL_RIG',
    medicalFitness: {
      certificateNumber: 'MED-ANNEX3-2026-902',
      ompName: 'Dr. Brian Khanyile',
      ompPracticeNumber: 'OMP-440129-SA',
      issueDate: '2025-11-20',
      expiryDate: '2026-11-20',
      isExpired: false,
      daysToExpiry: 46,
      fitnessClassification: 'FIT_UNDERGROUND',
      audiometryPlhPercentage: 2.1,
      lungFunctionFvcPercentage: 96.0,
      cardiacClearance: true,
      specialRestrictions: []
    },
    simulatorCertifications: [
      {
        simulatorOem: 'IMMERSIVE_TECHNOLOGIES',
        simulatorModel: 'Immersive Technologies PRO5 Underground Cab',
        machineClass: 'DRILL_RIG',
        assessmentDate: '2026-03-01',
        virtualHoursLogged: 48,
        hazardAvoidanceScorePct: 92,
        reactionTimeSeconds: 1.05,
        operatingEfficiencyPct: 89,
        gradeLevel: 'LEVEL_2_ADVANCED',
        isCertified: true,
        certificateHash: 'IMM-TECH-PRO5-DZ-92PCT'
      }
    ],
    licenses: [
      {
        licenseNumber: 'DMRE-TMM-DRILL-02',
        licenseCode: 'DMRE-TMM-DRILL-02',
        machineClass: 'DRILL_RIG',
        issuingAuthority: 'DMRE',
        issueDate: '2025-02-15',
        expiryDate: '2027-02-15',
        isValid: true
      }
    ],
    shiftHoursLoggedPast24h: 4.0,
    fatigueRiskScore: 'LOW',
    activePermitsAssigned: []
  },
  {
    id: 'OP-003',
    operatorName: 'Hendrik Botha (Medically Expired Test Case)',
    idNumber: '8505195029088',
    employeeNumber: 'MT-EMP-4403',
    contractorCompany: 'MeloTwo Mining Services JV',
    primaryMachineClass: 'ROOF_BOLTER',
    medicalFitness: {
      certificateNumber: 'MED-ANNEX3-2025-119',
      ompName: 'Dr. S. Naidoo',
      ompPracticeNumber: 'OMP-221994-SA',
      issueDate: '2024-09-15',
      expiryDate: '2025-09-15', // EXPIRED!
      isExpired: true,
      daysToExpiry: -385,
      fitnessClassification: 'UNFIT',
      audiometryPlhPercentage: 6.4,
      lungFunctionFvcPercentage: 81.0,
      cardiacClearance: false,
      specialRestrictions: ['EXPIRED MEDICAL - IMMEDIATE STAND DOWN MANDATED BY MHSA SECTION 13']
    },
    simulatorCertifications: [
      {
        simulatorOem: 'EPIROC',
        simulatorModel: 'Epiroc Boltec M10 Simulator',
        machineClass: 'ROOF_BOLTER',
        assessmentDate: '2024-10-10',
        virtualHoursLogged: 36,
        hazardAvoidanceScorePct: 88,
        reactionTimeSeconds: 1.35,
        operatingEfficiencyPct: 85,
        gradeLevel: 'LEVEL_2_ADVANCED',
        isCertified: true,
        certificateHash: 'EPIROC-BOLT-HB-88PCT'
      }
    ],
    licenses: [
      {
        licenseNumber: 'TETA-BOLTER-03',
        licenseCode: 'TETA-BOLTER-03',
        machineClass: 'ROOF_BOLTER',
        issuingAuthority: 'TETA_ACCREDITED',
        issueDate: '2024-10-15',
        expiryDate: '2026-10-15',
        isValid: true
      }
    ],
    shiftHoursLoggedPast24h: 0,
    fatigueRiskScore: 'CRITICAL_STAND_DOWN',
    activePermitsAssigned: []
  },
  {
    id: 'OP-004',
    operatorName: 'Bongani Cele (VR Failed Test Case)',
    idNumber: '9512015948083',
    employeeNumber: 'MT-EMP-4404',
    contractorCompany: 'MeloTwo Mining Services JV',
    primaryMachineClass: 'ADT_DUMP_TRUCK',
    medicalFitness: {
      certificateNumber: 'MED-ANNEX3-2026-304',
      ompName: 'Dr. Brian Khanyile',
      ompPracticeNumber: 'OMP-440129-SA',
      issueDate: '2026-02-01',
      expiryDate: '2027-02-01',
      isExpired: false,
      daysToExpiry: 118,
      fitnessClassification: 'FIT_UNDERGROUND',
      audiometryPlhPercentage: 0.8,
      lungFunctionFvcPercentage: 99.0,
      cardiacClearance: true,
      specialRestrictions: []
    },
    simulatorCertifications: [
      {
        simulatorOem: 'THOROUGHTEC_CYBERMINE',
        simulatorModel: 'Cybermine ADT Full Motion Cabin',
        machineClass: 'ADT_DUMP_TRUCK',
        assessmentDate: '2026-03-12',
        virtualHoursLogged: 22,
        hazardAvoidanceScorePct: 74, // FAILED! Target is >= 85%
        reactionTimeSeconds: 2.15, // Slow hazard reaction
        operatingEfficiencyPct: 71,
        gradeLevel: 'LEVEL_1_BASIC',
        isCertified: false,
        certificateHash: 'FAILED-CYBERMINE-ADT-74PCT'
      }
    ],
    licenses: [
      {
        licenseNumber: 'TETA-ADT-BELL-04',
        licenseCode: 'TETA-ADT-BELL-04',
        machineClass: 'ADT_DUMP_TRUCK',
        issuingAuthority: 'TETA_ACCREDITED',
        issueDate: '2025-06-01',
        expiryDate: '2027-06-01',
        isValid: true
      }
    ],
    shiftHoursLoggedPast24h: 1.0,
    fatigueRiskScore: 'LOW',
    activePermitsAssigned: []
  }
];

let machineAssets: HeavyMachineAsset[] = [
  {
    assetId: 'EQ-LHD-01',
    assetTag: 'TMM-ST14-001',
    serialNumber: 'EPI-ST14-88412-2024',
    machineClass: 'LHD_LOADER',
    oemBrand: 'Epiroc',
    modelName: 'Epiroc Scooptram ST14 Battery LHD (14 Ton)',
    operationalDomain: 'UNDERGROUND_HARD_ROCK',
    currentShaftOrBench: 'Shaft 4 Level 32 Stope 44 East',
    minRequiredSimGrade: 85,
    requiresUndergroundFitness: true,
    lastPreStartCheckDate: new Date().toISOString().split('T')[0],
    preStartPassed: true,
    operationalState: 'OPERATIONAL'
  },
  {
    assetId: 'EQ-DRILL-02',
    assetTag: 'TMM-DD422-002',
    serialNumber: 'SND-DD422i-19402-2025',
    machineClass: 'DRILL_RIG',
    oemBrand: 'Sandvik',
    modelName: 'Sandvik DD422i Automated Twin-Boom Face Drill',
    operationalDomain: 'UNDERGROUND_HARD_ROCK',
    currentShaftOrBench: 'Shaft 4 Level 30 Decline Heading',
    minRequiredSimGrade: 85,
    requiresUndergroundFitness: true,
    lastPreStartCheckDate: new Date().toISOString().split('T')[0],
    preStartPassed: true,
    operationalState: 'OPERATIONAL'
  },
  {
    assetId: 'EQ-BOLT-03',
    assetTag: 'TMM-BM10-003',
    serialNumber: 'EPI-BM10-44910-2024',
    machineClass: 'ROOF_BOLTER',
    oemBrand: 'Epiroc',
    modelName: 'Epiroc Boltec M10 Fully Mechanised Rock Bolter',
    operationalDomain: 'UNDERGROUND_HARD_ROCK',
    currentShaftOrBench: 'Shaft 4 Level 32 Stope 44 West Support',
    minRequiredSimGrade: 85,
    requiresUndergroundFitness: true,
    lastPreStartCheckDate: new Date().toISOString().split('T')[0],
    preStartPassed: true,
    operationalState: 'OPERATIONAL'
  },
  {
    assetId: 'EQ-ADT-04',
    assetTag: 'TMM-B45E-004',
    serialNumber: 'BEL-B45E-55102-2023',
    machineClass: 'ADT_DUMP_TRUCK',
    oemBrand: 'Bell',
    modelName: 'Bell B45E Articulated Underground / Surface Dump Truck (45 Ton)',
    operationalDomain: 'UNDERGROUND_HARD_ROCK',
    currentShaftOrBench: 'Shaft 4 Main Ore Haulage Ramp',
    minRequiredSimGrade: 85,
    requiresUndergroundFitness: true,
    lastPreStartCheckDate: new Date().toISOString().split('T')[0],
    preStartPassed: true,
    operationalState: 'OPERATIONAL'
  },
  {
    assetId: 'EQ-HAUL-05',
    assetTag: 'SURF-CAT777-005',
    serialNumber: 'CAT-777G-99120-2024',
    machineClass: 'SURFACE_HAUL_TRUCK',
    oemBrand: 'Caterpillar',
    modelName: 'Cat 777G Rigid Open Cast Haul Truck (100 Ton)',
    operationalDomain: 'SURFACE_OPEN_PIT',
    currentShaftOrBench: 'Mogalakwena Open Pit Bench 14',
    minRequiredSimGrade: 85,
    requiresUndergroundFitness: false,
    lastPreStartCheckDate: new Date().toISOString().split('T')[0],
    preStartPassed: true,
    operationalState: 'OPERATIONAL'
  }
];

// 5. SETA, QCTO & TVET Candidates
let tradeCandidates: TradeQualificationRecord[] = [
  {
    id: 'TRADE-MQA-01',
    candidateName: 'Thulani Mthembu',
    idNumber: '9003185123087',
    seta: 'MQA',
    tradeTitle: 'Diesel Mechanic (Heavy Underground Machinery)',
    ofoCode: '653306',
    saqaQualificationId: '99689',
    tvetCollege: 'Ekurhuleni East TVET College',
    academicQualification: 'N4_N6_NATIONAL_DIPLOMA',
    tradeTestCertification: {
      status: 'RED_SEAL_CERTIFIED',
      redSealCertificateNumber: 'RS-MQA-2024-8842',
      nambVerificationStatus: 'VERIFIED_ON_NATIONAL_DATABASE',
      tradeTestCenter: 'INDLELA National Artisan Moderation Body',
      passDate: '2024-05-18'
    },
    logbookProgress: {
      totalRequiredHours: 4800,
      hoursLogged: 4800,
      percentageCompleted: 100,
      mentorSignedOff: true
    },
    learnershipContract: {
      agreementNumber: 'MQA-APP-2021-0941',
      agreementType: 'SECTION_18_1_EMPLOYED',
      startDate: '2021-06-01',
      endDate: '2024-05-31',
      stipendFundedBy: 'MQA_DISCRETIONARY_GRANT'
    },
    demographics: {
      race: 'AFRICAN',
      gender: 'MALE',
      disability: false,
      youthUnder35: true
    }
  },
  {
    id: 'TRADE-MER-02',
    candidateName: 'Zanele Sithole',
    idNumber: '9609120345089',
    seta: 'MERSETA',
    tradeTitle: 'Boilermaker & Structural Fabricator',
    ofoCode: '651202',
    saqaQualificationId: '97142',
    tvetCollege: 'Orbit TVET College (Mankwe Campus)',
    academicQualification: 'N3_ENGINEERING',
    tradeTestCertification: {
      status: 'APPRENTICE_IN_TRAINING',
      nambVerificationStatus: 'UNDER_REVIEW',
      tradeTestCenter: 'MERSETA Accredited Regional Testing Center Rustenburg',
    },
    logbookProgress: {
      totalRequiredHours: 4000,
      hoursLogged: 3520,
      percentageCompleted: 88,
      mentorSignedOff: true
    },
    learnershipContract: {
      agreementNumber: 'MER-LRN-2024-1102',
      agreementType: 'SECTION_18_2_UNEMPLOYED',
      startDate: '2024-02-01',
      endDate: '2026-07-31',
      stipendFundedBy: 'EMPLOYER_FUNDED'
    },
    demographics: {
      race: 'AFRICAN',
      gender: 'FEMALE',
      disability: false,
      youthUnder35: true
    }
  },
  {
    id: 'TRADE-CETA-03',
    candidateName: 'Sibusiso Ndlovu',
    idNumber: '9105205412085',
    seta: 'CETA',
    tradeTitle: 'Rigger / High-Angle Lifting Specialist',
    ofoCode: '651501',
    saqaQualificationId: '96404',
    tvetCollege: 'Western TVET College',
    academicQualification: 'NCV_LEVEL_4',
    tradeTestCertification: {
      status: 'RED_SEAL_CERTIFIED',
      redSealCertificateNumber: 'RS-CETA-2025-1092',
      nambVerificationStatus: 'VERIFIED_ON_NATIONAL_DATABASE',
      tradeTestCenter: 'Apex Training Center Springs',
      passDate: '2025-03-14'
    },
    logbookProgress: {
      totalRequiredHours: 3600,
      hoursLogged: 3600,
      percentageCompleted: 100,
      mentorSignedOff: true
    },
    learnershipContract: {
      agreementNumber: 'CETA-APP-2022-4410',
      agreementType: 'SECTION_18_1_EMPLOYED',
      startDate: '2022-04-01',
      endDate: '2025-03-31',
      stipendFundedBy: 'MQA_DISCRETIONARY_GRANT'
    },
    demographics: {
      race: 'AFRICAN',
      gender: 'MALE',
      disability: false,
      youthUnder35: true
    }
  }
];

// 6. Mine Closure, Rehabilitation & Environmental Transition Suite Data
let mineClosureSuite: MineClosureSuiteOverview = {
  siteId: 'SITE-WIT-01',
  siteName: 'Witwatersrand Deep Reef Shaft 4 Decommissioning Complex',
  mineStage: 'ACTIVE_DECOMMISSIONING',
  overallRehabilitationProgressPct: 76.5,
  financialProvisionBondGuaranteeZar: 28500000, // R28.5M Financial Provisioning under NEMA GN R1147
  licenses: [
    {
      licenseId: 'LIC-WULA-01',
      licenseNumber: '03/B11J/ACGI/9912',
      statutoryBody: 'DWS',
      title: 'Water Use License (WULA) - Section 21(a), (c), (g), (i)',
      actReference: 'National Water Act 36 of 1998 (DWS Pretoria)',
      issueDate: '2023-04-15',
      renewalDate: '2028-04-15',
      status: 'ACTIVE_COMPLIANT',
      financialProvisionAmountZar: 12400000,
      keyConditions: [
        'Discharge limit: max 1,200 m³/day treated water to Wonderfonteinspruit',
        'Continuous EC telemetry probe logging at discharge point DP-01',
        'Quarterly ICP-MS heavy metal panel across 14 monitoring boreholes'
      ],
      monitoringBoreholesCount: 14,
      waterDischargeLimitM3Day: 1200
    },
    {
      licenseId: 'LIC-MPRDA-CLOSURE-02',
      licenseNumber: 'DMRE-MPRDA-SEC43-8841',
      statutoryBody: 'DMRE',
      title: 'MPRDA Section 43 Decommissioning & Closure Application',
      actReference: 'Mineral & Petroleum Resources Development Act 28 of 2002',
      issueDate: '2024-01-10',
      renewalDate: '2027-01-10',
      status: 'REHABILITATION_TRIGGERED',
      financialProvisionAmountZar: 16100000,
      keyConditions: [
        'Shaft cap engineered plug to SANS 10286 specification',
        'Post-closure latent groundwater pollution indemnity bond in place'
      ]
    },
    {
      licenseId: 'LIC-ZEMA-EPF-03',
      licenseNumber: 'ZEMA-EPF-ZM-2025-441',
      statutoryBody: 'ZEMA_ZAMBIA',
      title: 'Environmental Protection Fund (EPF) Closure Bond & SI 112 License',
      actReference: 'Mines & Minerals Development Act 2015 & ZEMA EMA Act 2011',
      issueDate: '2024-06-01',
      renewalDate: '2027-06-01',
      status: 'ACTIVE_COMPLIANT',
      financialProvisionAmountZar: 32400000, // Equivalent in ZAR (USD $1.8M)
      keyConditions: [
        'Copper tailings seepage cutoff trench operational at Kansanshi basin',
        'Zero untreated acid drainage discharge into Kafue river catchment'
      ]
    }
  ],
  liabilityHandoverItems: [
    {
      itemId: 'HANDOVER-TSF-01',
      phase: 'TAILINGS_DRAWDOWM_GISTM',
      workstreamName: 'Tailings Storage Facility (TSF 2) Dewatering & GISTM Stability Handover',
      locationArea: 'West Basin Tailings Complex (Footprint 114 Hectares)',
      contractorResponsible: 'MeloTwo Earthworks & Environmental Remediation JV',
      clientSuperintendent: 'Johan van der Merwe (GCC Engineer)',
      independentEnvironmentalAuditor: 'SRK Consulting / Pr.Eng Geotechnical Reviewer',
      checklistRequirements: [
        { itemDescription: 'Piezometric pore pressure stabilized below 45 kPa threshold', completed: true, statutoryStandard: 'GISTM Requirement 8.3', verifiedDate: '2026-03-28' },
        { itemDescription: 'Decant pond water volume drawn down by 80% to storm contingency reserve', completed: true, statutoryStandard: 'SANS 10286 / GISTM 7.1', verifiedDate: '2026-03-30' },
        { itemDescription: 'Static factor of safety exceeds 1.60 across outer buttress wall (target > 1.50)', completed: true, statutoryStandard: 'GISTM Requirement 4.2', verifiedDate: '2026-04-01' },
        { itemDescription: 'Automated satellite InSAR displacement radar tracking active (< 2mm/month drift)', completed: true, statutoryStandard: 'GISTM Requirement 11.2', verifiedDate: '2026-04-02' }
      ],
      signOffStatus: 'LIABILITY_DISCHARGED',
      gistmConformance: {
        tailingsFactorOfSafety: 1.62,
        phAcidMineDrainage: 7.4,
        piezometerPressureKpa: 42,
        conformanceLevel: 'CONFORMANT'
      },
      handoverCertificateHash: crypto.createHash('sha256').update('TSF2-GISTM-DISCHARGED-2026').digest('hex').substring(0, 16)
    },
    {
      itemId: 'HANDOVER-PLANT-02',
      phase: 'INFRASTRUCTURE_DEMOLITION',
      workstreamName: 'Heavy Concentrator Plant Structural Demolition & Scrap Decontamination',
      locationArea: 'Primary Milling & Flotation Circuit Area',
      contractorResponsible: 'MeloTwo Industrial Decommissioning Division',
      clientSuperintendent: 'David Mokoena (Construction Manager)',
      independentEnvironmentalAuditor: 'WSP Golder Environmental Inspectorate',
      checklistRequirements: [
        { itemDescription: 'Certified asbestos lagging stripping completed with air clearance testing (< 0.01 f/ml)', completed: true, statutoryStandard: 'OHSA Asbestos Regulations 2020', verifiedDate: '2026-03-14' },
        { itemDescription: 'Ball mill gearboxes oil drained and recycled with certified safe disposal manifest', completed: true, statutoryStandard: 'NEMA Waste Act 59 of 2008', verifiedDate: '2026-03-18' },
        { itemDescription: 'Concrete footings broken to 1.5m below natural ground level and backfilled', completed: false, statutoryStandard: 'MPRDA Closure Plan Guideline' }
      ],
      signOffStatus: 'PARTIALLY_VERIFIED',
      handoverCertificateHash: undefined
    },
    {
      itemId: 'HANDOVER-REVEG-03',
      phase: 'TOPSOIL_REVEGETATION',
      workstreamName: 'Waste Rock Dump Slopes Topsoil Profiling & Native Hydroseeding',
      locationArea: 'Waste Rock Dump 1 Outer Slopes (68 Hectares)',
      contractorResponsible: 'MeloTwo Eco-Remediation Specialist Services',
      clientSuperintendent: 'Dr. Michael van Niekerk (Mine Manager)',
      independentEnvironmentalAuditor: 'Botanical Society of SA / Ecological Specialist',
      checklistRequirements: [
        { itemDescription: 'Topsoil spread to minimum 300mm depth with compost and bio-char conditioner', completed: true, statutoryStandard: 'NEMA Rehabilitation Guidelines', verifiedDate: '2026-02-20' },
        { itemDescription: 'Hydroseeded with certified indigenous seed mix (Themeda triandra, Cynodon dactylon)', completed: true, statutoryStandard: 'DMRE Biodiversity Standard', verifiedDate: '2026-03-01' },
        { itemDescription: 'Canopy vegetation cover achieves 82% density without alien invasive species', completed: true, statutoryStandard: 'CARA Act 43 of 1983', verifiedDate: '2026-03-25' }
      ],
      signOffStatus: 'LIABILITY_DISCHARGED',
      handoverCertificateHash: crypto.createHash('sha256').update('REVEG-WRD1-DISCHARGED-2026').digest('hex').substring(0, 16)
    }
  ],
  esgTransitionMetrics: [
    {
      metricId: 'ESG-AMD-01',
      domain: 'ENVIRONMENTAL_REMEDIATION',
      indicatorName: 'Acid Mine Drainage (AMD) Plume Neutralization & Sulfate Reduction',
      statutoryReference: 'NWA Act 36 Section 21(g) / DWS Water Quality Guidelines',
      baselineAtClosure: 'pH 3.2, Heavy Metals Elevated, SO4 > 2,800 mg/L',
      targetAtFinalRelinquishment: 'pH 6.5 - 8.5, SO4 < 500 mg/L (Potable Standard)',
      currentProgressPct: 91.5,
      status: 'ON_TRACK',
      expenditureToDateZar: 14200000,
      futureForumConsultationHeld: true
    },
    {
      metricId: 'ESG-SLP-02',
      domain: 'SOCIAL_LABOUR_PLAN_SLP',
      indicatorName: 'Community Reskilling & Downscaling Enterprise Handovers',
      statutoryReference: 'MPRDA Regulation 46 / Social & Labour Plan (SLP) Section 52',
      baselineAtClosure: '1,450 Direct Mine Shaft Contractor Employees',
      targetAtFinalRelinquishment: '100% Transitioned: 480 Local Agribusiness Jobs + 220 Solar Microgrid Artisans',
      currentProgressPct: 84.0,
      status: 'ON_TRACK',
      expenditureToDateZar: 8900000,
      slpCommunityBeneficiariesCount: 700,
      futureForumConsultationHeld: true
    },
    {
      metricId: 'ESG-LEGACY-03',
      domain: 'GOVERNANCE_LEGACY',
      indicatorName: 'Municipal Water Purification Asset Transfer to Local Municipality',
      statutoryReference: 'Local Government Municipal Systems Act 32 of 2000',
      baselineAtClosure: 'Mine-owned 8.5 ML/day Ultrafiltration Water Plant',
      targetAtFinalRelinquishment: 'Zero-debt asset transfer with 2-year contractor operational mentoring',
      currentProgressPct: 100.0,
      status: 'TARGET_ACHIEVED',
      expenditureToDateZar: 4500000,
      slpCommunityBeneficiariesCount: 45000,
      futureForumConsultationHeld: true
    }
  ]
};

// 7. Cross-Border SADC Regulatory Mapping Matrix (South Africa vs. Zambia)
let crossBorderMappings: CrossBorderRegulatoryMappingItem[] = [
  {
    id: 'MAP-01-MACHINERY',
    functionalDomain: 'Statutory Machinery & Engineering Appointment',
    southAfricaStatute: {
      authority: 'DMRE',
      legislation: 'Mine Health and Safety Act (Act 29 of 1996)',
      sectionOrStandard: 'Regulation 2.6.1 (Competent Person in charge of Machinery)',
      requiredDocument: 'Section 2.6.1 Appointment Letter + Government Certificate of Competency (GCC Mines & Works)',
      validityCycle: 'Site-specific, valid for contract duration'
    },
    zambiaStatute: {
      authority: 'MSD_KITWE',
      legislation: 'Mines and Minerals Development Act No. 11 of 2015',
      sectionOrStandard: 'Mining Regulations Part II Reg 33 (Resident Engineer Appointment)',
      requiredDocument: 'MSD Form MSR-33 Resident Engineer Appointment + EIZ Registered Practicing License',
      validityCycle: 'Annual EIZ license renewal mandatory'
    },
    harmonizationGuidance: 'South African GCC holders operating in Zambia must register with the Engineering Institution of Zambia (EIZ) and obtain an MSD Kitwe Certificate of Recognition prior to assuming legal custody of machinery.',
    commonPitfall: 'Submitting South African GCC without EIZ local accreditation causes immediate mine gate access refusal at Kansanshi and Lumwana.'
  },
  {
    id: 'MAP-02-MEDICALS',
    functionalDomain: 'Occupational Health & Medical Surveillance (Silicosis & Fitness)',
    southAfricaStatute: {
      authority: 'DMRE',
      legislation: 'MHSA Act 29 Section 13 / DMRE Medical Surveillance Guidelines',
      sectionOrStandard: 'Annexure 3 Certificate of Fitness (Initial, Periodic, Exit)',
      requiredDocument: 'Signed Certificate of Fitness from registered OMP (Audiometry PLH, Chest X-Ray, Spirometry FVC)',
      validityCycle: 'Annual (12 Months)'
    },
    zambiaStatute: {
      authority: 'MBOD',
      legislation: 'Occupational Health and Safety Act 2010 & Workers Compensation Act',
      sectionOrStandard: 'Medical Bureau for Occupational Diseases (MBOD Ndola) Directives',
      requiredDocument: 'MBOD Silicosis Medical Bureau Card / Certificate of Fitness (Chest Radiograph ILO scored)',
      validityCycle: 'Annual (12 Months)'
    },
    harmonizationGuidance: 'Zambia requires primary screening through the statutory Medical Bureau for Occupational Diseases (MBOD Ndola) or an MSD-accredited occupational health provider. A generic clinic certificate is legally defective.',
    commonPitfall: 'Contractors presenting standard South African occupational clinic cards without MBOD verification are prohibited from entering underground shafts in the Copperbelt.'
  },
  {
    id: 'MAP-03-CONTRACTOR-MANDATARY',
    functionalDomain: 'Contractor Liability Transfer & Safety File Mandatary Agreement',
    southAfricaStatute: {
      authority: 'DMRE',
      legislation: 'Mine Health and Safety Act Section 10 / OHSA Section 37(2)',
      sectionOrStandard: 'MHSA Section 37.2 Mandatory Agreement (Mine General Manager ↔ Contractor CEO)',
      requiredDocument: 'Signed Section 37.2 Tripartite Mandatary Agreement + Letter of Good Standing (COIDA/RMA)',
      validityCycle: 'Contract duration (re-validated on scope extension)'
    },
    zambiaStatute: {
      authority: 'MSD_KITWE',
      legislation: 'Mines and Minerals Development Act 2015 / MSD Kitwe MSR Rules',
      sectionOrStandard: 'MSD Form MSR-14 Contractor Safety Accountability Agreement',
      requiredDocument: 'MSD Kitwe Approved Contractor Safety File + Workers Compensation (WCFCB) Certificate',
      validityCycle: 'Contract duration + Annual WCFCB clearance'
    },
    harmonizationGuidance: 'Under South African law, Section 37.2 explicitly transfers statutory OHSA/MHSA duties to the contractor. In Zambia, MSD Kitwe requires joint liability registered on Form MSR-14 with the host mine general manager.',
    commonPitfall: 'Using a standard OHSA 37(2) agreement on a Zambian mine property is null and void; MSD inspectors will shut down contractor operations under Section 87 stoppage notices.'
  },
  {
    id: 'MAP-04-ENVIRONMENTAL',
    functionalDomain: 'Tailings Storage & Environmental Effluent Discharge',
    southAfricaStatute: {
      authority: 'DWS',
      legislation: 'National Water Act 36 of 1998 / NEMA Act 107 of 1998',
      sectionOrStandard: 'Section 21 Water Use License (WULA) & NEMA Financial Provisioning (GN R1147)',
      requiredDocument: 'Approved WULA License + Bank Guarantee for Mine Rehabilitation Bond',
      validityCycle: '5-year review, 20-year term'
    },
    zambiaStatute: {
      authority: 'ZEMA',
      legislation: 'Environmental Management Act No. 12 of 2011 / Statutory Instrument 112',
      sectionOrStandard: 'ZEMA SI 112 Effluent Discharge License & Environmental Protection Fund (EPF)',
      requiredDocument: 'Valid SI 112 Effluent Discharge Permit + EPF Cash/Bond Contribution Receipt',
      validityCycle: 'Annual permit renewal'
    },
    harmonizationGuidance: 'Both jurisdictions mandate strict heavy metal limits (Cu < 1.0 mg/L, Co < 0.5 mg/L, Fe < 1.0 mg/L). Global mining houses (Barrick, Anglo, FQM) overlay GISTM tailings stability requirements (Factor of Safety > 1.5).',
    commonPitfall: 'Failing to lodge the statutory EPF contribution in Zambia triggers immediate ZEMA stop orders and daily compounding statutory fines.'
  },
  {
    id: 'MAP-05-EXPLOSIVES',
    functionalDomain: 'Explosives, Charging & Subterranean Blasting Authorization',
    southAfricaStatute: {
      authority: 'DMRE',
      legislation: 'MHSA Chapter 4 Explosives Regulations',
      sectionOrStandard: 'DMRE Blasting Certificate of Competency (Hard Rock / Fiery Mines)',
      requiredDocument: 'Valid Blasting Ticket + Section 2.13.1 Appointed Blast Master Letter',
      validityCycle: 'Permanent ticket subject to annual medical fitness'
    },
    zambiaStatute: {
      authority: 'MSD_KITWE',
      legislation: 'Explosives Act Cap 115 / Mining Regulations Part V',
      sectionOrStandard: 'MSD Statutory Blaster License (Full Open Pit or Underground Subterranean)',
      requiredDocument: 'MSD Kitwe Blaster Certificate + Annual Police Clearance & Fingerprint vetting',
      validityCycle: 'Annual license re-validation'
    },
    harmonizationGuidance: 'Zambia requires direct physical examination by an MSD Inspector at the Kitwe or Solwezi testing stations before a South African blaster can charge stopes.',
    commonPitfall: 'Deploying a South African blasting artisan without MSD local endorsement violates the Zambian Explosives Act and carries criminal liability.'
  },
  {
    id: 'MAP-06-LOCAL-CONTENT',
    functionalDomain: 'Citizen Economic Empowerment & Local Supply Chain Mandate',
    southAfricaStatute: {
      authority: 'DMRE',
      legislation: 'Broad-Based Black Socio-Economic Empowerment Charter (Mining Charter III)',
      sectionOrStandard: 'Element 2: Minimum 50% + 1 vote Black Owned Procurement Spend Target',
      requiredDocument: 'SANAS Accredited B-BBEE Verification Certificate / Sworn Affidavit',
      validityCycle: 'Annual (12 Months)'
    },
    zambiaStatute: {
      authority: 'MSD_KITWE',
      legislation: 'Citizens Economic Empowerment Commission (CEEC) Act No. 9 of 2006',
      sectionOrStandard: 'Mining Local Content Regulations: 20% Citizen Equity in Contractor JV',
      requiredDocument: 'PACRA Certificate + CEEC Registered Citizen-Owned Enterprise Accreditation',
      validityCycle: 'Annual certification'
    },
    harmonizationGuidance: 'South African contractors bidding on Zambian mining tenders must incorporate a local Zambian Joint Venture with at least 20% citizen equity to qualify for Tier-1 vendor lists at Barrick Lumwana or FQM Sentinel.',
    commonPitfall: 'Submitting a 100% South African entity to a Zambian tender results in disqualification at commercial pre-qualification gate.'
  }
];

// 8. Real-Time Compliance Gap Analysis Alerts (Tender Readiness Scanner)
let complianceGapAlerts: ComplianceGapAlert[] = [
  {
    alertId: 'GAP-2026-001',
    severity: 'CRITICAL_DISQUALIFIER',
    domain: 'Occupational Medical Surveillance',
    title: 'Expired Annexure 3 Medical Fitness for Lead Drill Operator',
    affectedTenderScope: 'Anglo American Mogalakwena North Deep mechanised advance tender',
    statutoryMandate: 'MHSA Section 13 / Anglo American Mandatory Gate Rule 4',
    detailDescription: 'Operator Hendrik Botha has an expired Annexure 3 Certificate of Fitness (expired 385 days ago). If submitted in tender safety file, will trigger immediate disqualification during vendor SHEQ scrutiny.',
    remediationAction: 'Schedule priority OMP medical recertification or reassign certified operator (Kagiso Molefe / Dumisani Zulu).',
    daysToDeadline: 7,
    isResolved: false
  },
  {
    alertId: 'GAP-2026-002',
    severity: 'CRITICAL_DISQUALIFIER',
    domain: 'Statutory Engineering Appointment',
    title: 'Missing MSD Kitwe Section 33 Counter-Signature for Zambian Tender',
    affectedTenderScope: 'First Quantum Minerals (FQM) Sentinel Copper Expansion civil tender',
    statutoryMandate: 'Zambian Mines & Minerals Development Act 2015 Reg 33',
    detailDescription: 'The submitted safety file includes South African MHSA 2.6.1 GCC Engineer appointment, but lacks the mandatory MSD Kitwe Form MSR-33 counter-signature with EIZ practicing certificate.',
    remediationAction: 'Generate and endorse MSD Form MSR-33 with EIZ registered resident engineer before tender deadline.',
    daysToDeadline: 14,
    isResolved: false
  },
  {
    alertId: 'GAP-2026-003',
    severity: 'MAJOR_DEFICIENCY',
    domain: 'Statutory Appointment Expiration Risk',
    title: 'Construction Manager Appointment Expiring in 27 Days',
    affectedTenderScope: 'Valterra Platinum Concentrator structural expansion tender',
    statutoryMandate: 'OHSA Construction Regulation 8.1',
    detailDescription: 'Appointed Construction Manager David Mokoena (Pr.CM #4412/2018) appointment letter expires on 2026-11-01. Host sites require appointments to be valid for minimum 90 days post-bid submission.',
    remediationAction: 'Issue renewed OHSA 16.2 / CR 8.1 appointment letter extension to 2027.',
    daysToDeadline: 21,
    isResolved: false
  },
  {
    alertId: 'GAP-2026-004',
    severity: 'MAJOR_DEFICIENCY',
    domain: 'Tailings & Environmental GISTM Compliance',
    title: 'TSF 2 Concrete Footings Demolition Lacks Verification Sign-Off',
    affectedTenderScope: 'Sibanye-Stillwater Deep Reef Closure & Rehabilitation contract',
    statutoryMandate: 'GISTM Standard Requirement 4.2 / NEMA GN R1147',
    detailDescription: 'Plant demolition workstream is 85% complete but missing independent geotechnical sign-off on concrete footing removal down to 1.5m below ground.',
    remediationAction: 'Upload independent environmental auditor inspection slip and update handover status to LIABILITY_DISCHARGED.',
    daysToDeadline: 18,
    isResolved: false
  }
];

// ============================================================================
// SIMULATION & AUDIT ENGINE HELPERS (PILLAR 1 & 2)
// ============================================================================

export function simulateDefensibilityIndex(
  hostEnterprise: EnterpriseTier1Host,
  customOverrides?: Record<string, any>
): DefensibilityIndexResult {
  const hostNames: Record<EnterpriseTier1Host, { name: string; jurisdiction: 'SOUTH_AFRICA' | 'ZAMBIA' | 'CROSS_BORDER_SADC'; threshold: number }> = {
    ANGLO_AMERICAN: { name: 'Anglo American Platinum / Kumba Iron Ore', jurisdiction: 'SOUTH_AFRICA', threshold: 85 },
    VALTERRA_PLATINUM: { name: 'Valterra Platinum Mechanized Operations', jurisdiction: 'SOUTH_AFRICA', threshold: 82 },
    BARRICK_GOLD: { name: 'Barrick Gold (Lumwana / Kibali SADC Operations)', jurisdiction: 'CROSS_BORDER_SADC', threshold: 88 },
    FIRST_QUANTUM_FQM: { name: 'First Quantum Minerals (Kansanshi / Sentinel)', jurisdiction: 'ZAMBIA', threshold: 85 }
  };

  const meta = hostNames[hostEnterprise] || hostNames.ANGLO_AMERICAN;

  // Category point calculations with domain weightings
  const categories: DefensibilityCategoryScore[] = [
    {
      categoryKey: 'STATUTORY_LEGAL',
      categoryTitle: 'Statutory Appointments & Mandatary Agreements (MHSA / MSD)',
      weightPercentage: 25,
      scoreAchievedPct: hostEnterprise === 'FIRST_QUANTUM_FQM' ? 92 : 96,
      maxPoints: 25,
      pointsAwarded: hostEnterprise === 'FIRST_QUANTUM_FQM' ? 23.0 : 24.0,
      findingsCount: 0,
      mandatoryRequirementsMet: true,
      criticalGaps: []
    },
    {
      categoryKey: 'OCCUPATIONAL_HEALTH',
      categoryTitle: 'Medical Surveillance, Audiometry & Silicosis (Annexure 3 / MBOD)',
      weightPercentage: 20,
      scoreAchievedPct: 90,
      maxPoints: 20,
      pointsAwarded: 18.0,
      findingsCount: 1,
      mandatoryRequirementsMet: true,
      criticalGaps: ['1 Operator (Hendrik Botha) medical expired — stand-down enforced']
    },
    {
      categoryKey: 'PERMITS_AND_HIRAS',
      categoryTitle: 'Operational Permits, SWPs & Issue-Based HIRAs',
      weightPercentage: 20,
      scoreAchievedPct: 95,
      maxPoints: 20,
      pointsAwarded: 19.0,
      findingsCount: 0,
      mandatoryRequirementsMet: true,
      criticalGaps: []
    },
    {
      categoryKey: 'ENVIRONMENTAL_TAILINGS',
      categoryTitle: 'Environmental Authorizations, WULA & GISTM Tailings Conformance',
      weightPercentage: 15,
      scoreAchievedPct: 94,
      maxPoints: 15,
      pointsAwarded: 14.1,
      findingsCount: 0,
      mandatoryRequirementsMet: true,
      criticalGaps: []
    },
    {
      categoryKey: 'ARTISAN_QUALIFICATIONS',
      categoryTitle: 'SETA/QCTO Artisan Trade Accreditations (Red Seal & OEM Simulators)',
      weightPercentage: 20,
      scoreAchievedPct: 93,
      maxPoints: 20,
      pointsAwarded: 18.6,
      findingsCount: 0,
      mandatoryRequirementsMet: true,
      criticalGaps: []
    }
  ];

  const totalPointsAwarded = categories.reduce((sum, c) => sum + c.pointsAwarded, 0);
  const overallDefensibilityScorePct = Math.round((totalPointsAwarded / 100) * 1000) / 10;

  const isQualified = overallDefensibilityScorePct >= meta.threshold;
  const verdict = isQualified 
    ? 'QUALIFIED_FOR_TENDER' 
    : overallDefensibilityScorePct >= 70 
      ? 'CONDITIONAL_REVISION_REQUIRED' 
      : 'REJECTED_AT_MINE_GATE';

  const rating = overallDefensibilityScorePct >= 92 
    ? 'AAA_EXEMPLARY' 
    : overallDefensibilityScorePct >= 85 
      ? 'AA_DEFENSIBLE' 
      : overallDefensibilityScorePct >= 75 
        ? 'A_SATISFACTORY' 
        : 'SUB_STANDARD_RISK';

  const simulationHash = crypto.createHash('sha256')
    .update(`MELOTWO-DEFENSIBILITY-${hostEnterprise}-${overallDefensibilityScorePct}-${Date.now()}`)
    .digest('hex')
    .substring(0, 20)
    .toUpperCase();

  const adviceMap: Record<EnterpriseTier1Host, string> = {
    ANGLO_AMERICAN: 'Dossier complies fully with Anglo American Fatal Risk Standards (FRS) and Section 37.2 liability transfer covenants. Recommended for high-value mechanised tender bid submission.',
    VALTERRA_PLATINUM: 'Meets Valterra mechanized PPR requirements. GISTM tailings stability factor of safety (1.62) provides strong ESG competitive defense.',
    BARRICK_GOLD: 'Meets Barrick Zero Harm Cardinal Rules. SADC cross-border medicals and ISO 45001 accreditation verify readiness for Lumwana or Kibali contract execution.',
    FIRST_QUANTUM_FQM: 'Zambian statutory requirements (MSD Kitwe MSR-33 and ZEMA SI 112) verified. Ensure CEEC 20% citizen equity joint venture certificate is attached in commercial returnable schedule.'
  };

  return {
    simulationId: `SIM-DEF-${hostEnterprise}-${Date.now().toString().slice(-4)}`,
    contractorName: 'MeloTwo Industrial Mining Services (Pty) Ltd',
    hostEnterprise,
    hostEnterpriseName: meta.name,
    jurisdiction: meta.jurisdiction,
    overallDefensibilityScorePct,
    verdict,
    categories,
    defensibilityRating: rating,
    simulatedAt: new Date().toISOString(),
    auditSimulationHash: simulationHash,
    summaryExecutiveAdvice: adviceMap[hostEnterprise]
  };
}

// ============================================================================
// COMPLIANCE ENGINE HELPER FUNCTIONS
// ============================================================================

export function compileSafetyFileBinderForHost(hostSite: Tier1HostSite): SafetyFileBinderDossier {
  const hostNames: Record<Tier1HostSite, string> = {
    ANGLO_AMERICAN: 'Anglo American Platinum / Kumba Iron Ore',
    SIBANYE_STILLWATER: 'Sibanye-Stillwater Deep Reef Operations',
    VALTERRA_PLATINUM: 'Valterra Platinum Mining Operations',
    IVANPLATS: 'Ivanplats Platreef Mechanised Complex'
  };

  const sections = [
    {
      sectionIndex: 1,
      sectionCode: 'SEC-01',
      title: 'Company Profile, CIPC & SHEQ Policy',
      statutoryReference: 'MHSA Section 2.1 / OHS Act Section 7 / ISO 45001:2018',
      documentsAttached: 4,
      requiredDocuments: ['Signed SHEQ Policy Statement', 'CIPC Registration Certificate', 'B-BBEE Sworn Affidavit', 'Tax Clearance PIN'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-03-15'
    },
    {
      sectionIndex: 2,
      sectionCode: 'SEC-02',
      title: 'COID Letter of Good Standing & RMA Compliance',
      statutoryReference: 'Compensation for Occupational Injuries & Diseases Act (COIDA) Act 130',
      documentsAttached: 2,
      requiredDocuments: ['Valid RMA/Compensation Fund Letter of Good Standing', 'W.As.8 Assessment Return'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-03-20'
    },
    {
      sectionIndex: 3,
      sectionCode: 'SEC-03',
      title: 'MHSA Section 37.2 / OHSA Mandatary Legal Agreement',
      statutoryReference: 'MHSA Act 29 of 1996 Section 10 / OHSA Section 37(2)',
      documentsAttached: 3,
      requiredDocuments: ['Mine General Manager Signed 37.2 Agreement', 'Shaft Scope Boundaries Addendum', 'Liability Transfer Schedule'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-03-10'
    },
    {
      sectionIndex: 4,
      sectionCode: 'SEC-04',
      title: 'Statutory Legal Appointments & Certificates of Competency',
      statutoryReference: 'MHSA Regulations 2.6.1, 2.9.2, 2.13.1 & OHSA 16.2',
      documentsAttached: statutoryAppointments.length,
      requiredDocuments: ['MHSA 2.9.2 Subordinate Manager', 'MHSA 2.6.1 Competent Engineer', 'OHSA 16.2 Assignee', 'Certified ID Copies & GCC Certs'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-03-28'
    },
    {
      sectionIndex: 5,
      sectionCode: 'SEC-05',
      title: 'Baseline HIRA & Task-Specific Issue-Based Risk Assessments',
      statutoryReference: 'MHSA Section 11 / SANS 31000 / DMR Guideline 11(2)',
      documentsAttached: dailySignOffs.length + 3,
      requiredDocuments: ['Baseline HIRA Matrix', 'Issue-based HIRA for Mechanised Equipment', 'Daily Pre-Shift Sign-Off Logs', 'Continuous Risk Matrix'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-04-01'
    },
    {
      sectionIndex: 6,
      sectionCode: 'SEC-06',
      title: 'High-Risk Operational Work Permits (WAH, Hot Work, LOTO, Confined Space)',
      statutoryReference: 'SANS 10333 / SANS 10287 / SANS 10142-1 / SANS 10228',
      documentsAttached: highRiskPermits.length,
      requiredDocuments: ['Fall Protection Plan', 'Hot Work Clearance Logs', 'LOTO Zero-Energy Lockout Protocol', 'Gas Testing Calibration Logs'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-04-02'
    },
    {
      sectionIndex: 7,
      sectionCode: 'SEC-07',
      title: 'Medical Surveillance & Annexure 3 Certificates of Fitness',
      statutoryReference: 'MHSA Section 13 / DMRE Guideline on Medical Surveillance',
      documentsAttached: 18,
      requiredDocuments: ['Valid Annexure 3 Medical Fitness Cards', 'Audiometry Baseline Records', 'Chest X-Ray Silicosis Reports', 'Substance Abuse Test Declarations'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-03-22'
    },
    {
      sectionIndex: 8,
      sectionCode: 'SEC-08',
      title: 'VR/Simulator Operator Credentials & Machine Authorization Matrix',
      statutoryReference: 'MHSA TMM Regulations / OEM Operator Competency Mandate',
      documentsAttached: operatorProfiles.length,
      requiredDocuments: ['Epiroc / Immersive Tech VR Simulator Certificates', 'DMRE Machine Licenses', 'Shift Operator Pre-Start Checklists'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-04-01'
    },
    {
      sectionIndex: 9,
      sectionCode: 'SEC-09',
      title: 'SETA, QCTO & TVET Artisan Trade Accreditations (Red Seal)',
      statutoryReference: 'Skills Development Act Section 26D / MQA & MERSETA Codes',
      documentsAttached: tradeCandidates.length * 2,
      requiredDocuments: ['NAMB Verified Red Seal Trade Certificates', 'Logbook Workplace Training Records', 'TVET N3-N6 Diplomas'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-03-30'
    },
    {
      sectionIndex: 10,
      sectionCode: 'SEC-10',
      title: 'Emergency Preparedness, Evacuation & Incident Reporting',
      statutoryReference: 'MHSA Ch 16 / DoEL W.Cl. 2 / SANS 10400',
      documentsAttached: 5,
      requiredDocuments: ['Shaft Evacuation Route Plan', 'First Aid Level 3 Appointments', 'Fire Fighting Certificates', 'DMR Annexure 1 Incident Notification Pack'],
      status: 'COMPLIANT' as const,
      lastAuditDate: '2026-03-18'
    }
  ];

  return {
    binderId: `BINDER-${hostSite}-${Date.now()}`,
    contractorName: 'MeloTwo Industrial Mining Services (Pty) Ltd',
    contractorCipcNumber: '2021/884912/07',
    hostSite,
    hostSiteDisplayName: hostNames[hostSite],
    sections,
    overallAuditScorePct: 100,
    auditReadinessState: '100% AUDIT READY',
    compiledDate: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
    safetyOfficerApprovalHash: crypto.createHash('sha256').update(`MeloTwo-Safety-File-${hostSite}-AuditReady`).digest('hex'),
    exportPdfReady: true
  };
}

export function evaluateMachineAssignment(
  operatorId: string,
  machineAssetId: string
): MachineAssignmentEvaluation {
  const operator = operatorProfiles.find(o => o.id === operatorId);
  const machine = machineAssets.find(m => m.assetId === machineAssetId);

  if (!operator || !machine) {
    return {
      isAuthorized: false,
      authorizationCode: 'COMPLIANCE_LOCKOUT',
      operatorId: operatorId || 'UNKNOWN',
      operatorName: operator ? operator.operatorName : 'Unknown Operator',
      machineAssetId: machineAssetId || 'UNKNOWN',
      machineModel: machine ? machine.modelName : 'Unknown Machine',
      machineClass: machine ? machine.machineClass : 'LHD_LOADER',
      evaluatedTimestamp: new Date().toISOString(),
      ruleChecks: [
        {
          ruleCode: 'RECORD_EXISTS',
          ruleDescription: 'Operator and Machine Asset verification in site database',
          passed: false,
          failureReason: !operator ? `Operator ID ${operatorId} not found` : `Machine Asset ID ${machineAssetId} not found`
        }
      ],
      criticalBlockers: ['UNRECOGNIZED_ENTITY_IDENTIFIER']
    };
  }

  const ruleChecks: { ruleCode: string; ruleDescription: string; passed: boolean; failureReason?: string }[] = [];
  const criticalBlockers: string[] = [];

  // Rule 1: Medical Fitness Expiry
  const isMedExpired = operator.medicalFitness.isExpired || operator.medicalFitness.daysToExpiry < 0;
  if (isMedExpired) {
    ruleChecks.push({
      ruleCode: 'RULE_MED_01',
      ruleDescription: 'Annual MHSA Section 13 Annexure 3 Medical Certificate of Fitness must be current and active',
      passed: false,
      failureReason: `Medical certificate ${operator.medicalFitness.certificateNumber} EXPIRED on ${operator.medicalFitness.expiryDate} (${Math.abs(operator.medicalFitness.daysToExpiry)} days overdue). Immediate stand-down statutory mandate.`
    });
    criticalBlockers.push('LOCKOUT_MEDICAL_FITNESS_EXPIRED');
  } else {
    ruleChecks.push({
      ruleCode: 'RULE_MED_01',
      ruleDescription: 'Annual MHSA Section 13 Annexure 3 Medical Certificate of Fitness must be current and active',
      passed: true
    });
  }

  // Rule 2: Underground Medical Clearance
  if (machine.requiresUndergroundFitness) {
    const isUndergroundFit = operator.medicalFitness.fitnessClassification === 'FIT_UNDERGROUND';
    if (!isUndergroundFit) {
      ruleChecks.push({
        ruleCode: 'RULE_MED_02',
        ruleDescription: 'Underground operation requires unrestricted FIT_UNDERGROUND medical certification',
        passed: false,
        failureReason: `Operator medical classification is ${operator.medicalFitness.fitnessClassification}. Restricted from underground subterranean cabins.`
      });
      criticalBlockers.push('LOCKOUT_UNDERGROUND_MEDICAL_RESTRICTION');
    } else {
      ruleChecks.push({
        ruleCode: 'RULE_MED_02',
        ruleDescription: 'Underground operation requires unrestricted FIT_UNDERGROUND medical certification',
        passed: true
      });
    }
  }

  // Rule 3: Machine-Specific VR/Simulator Certification & Minimum Grade
  const matchingSim = operator.simulatorCertifications.find(s => s.machineClass === machine.machineClass);
  if (!matchingSim) {
    ruleChecks.push({
      ruleCode: 'RULE_SIM_01',
      ruleDescription: `Verified OEM Simulator credential required for ${machine.machineClass}`,
      passed: false,
      failureReason: `No accredited VR simulator training record on file for machine class ${machine.machineClass} (${machine.modelName}).`
    });
    criticalBlockers.push('LOCKOUT_UNACCREDITED_ON_MACHINE_CLASS');
  } else if (matchingSim.hazardAvoidanceScorePct < machine.minRequiredSimGrade) {
    ruleChecks.push({
      ruleCode: 'RULE_SIM_02',
      ruleDescription: `Simulator hazard avoidance grade must be >= ${machine.minRequiredSimGrade}%`,
      passed: false,
      failureReason: `Simulator test score is ${matchingSim.hazardAvoidanceScorePct}%, which fails the mandatory ${machine.minRequiredSimGrade}% pass threshold. Reaction time: ${matchingSim.reactionTimeSeconds}s.`
    });
    criticalBlockers.push('LOCKOUT_SIMULATOR_TEST_FAILURE');
  } else {
    ruleChecks.push({
      ruleCode: 'RULE_SIM_01',
      ruleDescription: `Verified OEM Simulator credential required for ${machine.machineClass}`,
      passed: true
    });
    ruleChecks.push({
      ruleCode: 'RULE_SIM_02',
      ruleDescription: `Simulator hazard avoidance grade must be >= ${machine.minRequiredSimGrade}%`,
      passed: true
    });
  }

  // Rule 4: Accredited Machine Operator License
  const matchingLicense = operator.licenses.find(l => l.machineClass === machine.machineClass && l.isValid);
  if (!matchingLicense) {
    ruleChecks.push({
      ruleCode: 'RULE_LIC_01',
      ruleDescription: `Active DMRE/TETA accredited operating license for ${machine.machineClass}`,
      passed: false,
      failureReason: `Missing or expired statutory operating license for machine class ${machine.machineClass}.`
    });
    criticalBlockers.push('LOCKOUT_OPERATING_LICENSE_INVALID');
  } else {
    ruleChecks.push({
      ruleCode: 'RULE_LIC_01',
      ruleDescription: `Active DMRE/TETA accredited operating license for ${machine.machineClass}`,
      passed: true
    });
  }

  // Rule 5: Fatigue & Shift Hours Limit
  if (operator.shiftHoursLoggedPast24h > 12) {
    ruleChecks.push({
      ruleCode: 'RULE_FATIGUE_01',
      ruleDescription: 'Maximum continuous shift operation must not exceed 12 hours in rolling 24-hour cycle',
      passed: false,
      failureReason: `Operator has logged ${operator.shiftHoursLoggedPast24h} hours in past 24 hours. Exceeds MHSA Section 7 fatigue management limit.`
    });
    criticalBlockers.push('LOCKOUT_FATIGUE_LIMIT_EXCEEDED');
  } else {
    ruleChecks.push({
      ruleCode: 'RULE_FATIGUE_01',
      ruleDescription: 'Maximum continuous shift operation must not exceed 12 hours in rolling 24-hour cycle',
      passed: true
    });
  }

  // Rule 6: Pre-Start Machine Inspection
  if (!machine.preStartPassed) {
    ruleChecks.push({
      ruleCode: 'RULE_MACHINE_01',
      ruleDescription: 'Machine asset must pass pre-start mechanical, hydraulic & braking inspections',
      passed: false,
      failureReason: `Machine asset ${machine.assetTag} failed pre-start audit or is currently tagged out.`
    });
    criticalBlockers.push('LOCKOUT_MACHINE_PRESTART_FAILED');
  } else {
    ruleChecks.push({
      ruleCode: 'RULE_MACHINE_01',
      ruleDescription: 'Machine asset must pass pre-start mechanical, hydraulic & braking inspections',
      passed: true
    });
  }

  const isAuthorized = criticalBlockers.length === 0;
  const authHash = isAuthorized 
    ? crypto.createHash('sha256').update(`${operator.id}-${machine.assetId}-${Date.now()}-PERMIT-APPROVED`).digest('hex').substring(0, 20).toUpperCase()
    : undefined;

  const permitId = isAuthorized
    ? `PERM-AUTH-${machine.machineClass.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`
    : undefined;

  return {
    isAuthorized,
    authorizationCode: isAuthorized ? 'PERMIT_ISSUED' : 'COMPLIANCE_LOCKOUT',
    startupPermitId: permitId,
    authorizationHash: authHash,
    operatorId: operator.id,
    operatorName: operator.operatorName,
    machineAssetId: machine.assetId,
    machineModel: machine.modelName,
    machineClass: machine.machineClass,
    evaluatedTimestamp: new Date().toISOString(),
    ruleChecks,
    criticalBlockers
  };
}

// ============================================================================
// ROUTE REGISTRATION FUNCTION
// ============================================================================

export function registerComplianceEngineRoutes(app: Express) {
  console.log('[Operational Compliance Engine] Mounting enterprise statutory & SETA API endpoints...');

  // --------------------------------------------------------------------------
  // PILLAR 1: AUTOMATED SAFETY FILE & STATUTORY VERIFICATION
  // --------------------------------------------------------------------------

  // Get daily operational compliance sign-offs
  app.get(['/api/compliance/safety-files/sign-offs', '/api/compliance/safety-files/sign-offs/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      count: dailySignOffs.length,
      signOffs: dailySignOffs
    });
  });

  // Create new daily compliance sign-off
  app.post(['/api/compliance/safety-files/sign-offs', '/api/compliance/safety-files/sign-offs/'], (req: Request, res: Response) => {
    try {
      const {
        siteId,
        siteName,
        shift,
        type,
        title,
        taskDescription,
        hazardCategories,
        residualRiskRating,
        controlMeasuresApplied,
        supervisorName,
        supervisorDesignation,
        teamMembersCount,
        sansReference,
        mhsaClause
      } = req.body || {};

      if (!title || !supervisorName) {
        return res.status(400).json({ error: 'Title and supervisor name are required for operational sign-off' });
      }

      const newSignOff: DailyComplianceSignOff = {
        id: `SO-2026-${String(dailySignOffs.length + 1).padStart(3, '0')}`,
        siteId: siteId || 'SITE-WIT-01',
        siteName: siteName || 'Witwatersrand Deep Reef Shaft 4',
        date: new Date().toISOString().split('T')[0],
        shift: shift || 'DAY_SHIFT',
        type: type || 'BASELINE_HIRA',
        title,
        taskDescription: taskDescription || 'Daily routine operations risk evaluation',
        hazardCategories: hazardCategories || ['Operational Hazard'],
        residualRiskRating: residualRiskRating || 'LOW',
        controlMeasuresApplied: controlMeasuresApplied || ['Standard SWP controls enforced'],
        supervisorName,
        supervisorDesignation: supervisorDesignation || 'Shift Supervisor',
        supervisorSignatureHash: crypto.createHash('sha256').update(`${supervisorName}-${Date.now()}`).digest('hex').substring(0, 16),
        teamMembersCount: Number(teamMembersCount) || 8,
        status: 'APPROVED',
        sansReference: sansReference || 'SANS 31000',
        mhsaClause: mhsaClause || 'MHSA Section 11'
      };

      dailySignOffs.unshift(newSignOff);
      res.json({
        success: true,
        message: 'Daily operational compliance sign-off approved and registered in audit trail.',
        signOff: newSignOff
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to register operational sign-off' });
    }
  });

  // Get statutory legal appointments
  app.get(['/api/compliance/safety-files/appointments', '/api/compliance/safety-files/appointments/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      count: statutoryAppointments.length,
      appointments: statutoryAppointments
    });
  });

  // Register new statutory legal appointment
  app.post(['/api/compliance/safety-files/appointments', '/api/compliance/safety-files/appointments/'], (req: Request, res: Response) => {
    try {
      const {
        act,
        sectionCode,
        sectionTitle,
        appointeeName,
        appointeeIdNumber,
        appointeeDesignation,
        certificateOfCompetency,
        gazettedLegalScope,
        appointedAreaOrShaft,
        appointingAuthorityName,
        appointingAuthorityDesignation,
        expiryDate
      } = req.body || {};

      if (!appointeeName || !sectionCode) {
        return res.status(400).json({ error: 'Appointee name and section code are required' });
      }

      const expiry = expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0];
      const daysUntilExpiry = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 3600 * 24));

      const newAppt: StatutoryLegalAppointment = {
        id: `APPT-${String(sectionCode).replace(/_/g, '-')}-${Date.now().toString().slice(-4)}`,
        act: act || (sectionCode.startsWith('MHSA') ? 'MHSA' : 'OHSA'),
        sectionCode,
        sectionTitle: sectionTitle || `Statutory Appointment ${sectionCode}`,
        appointeeName,
        appointeeIdNumber: appointeeIdNumber || '8501015000088',
        appointeeDesignation: appointeeDesignation || 'Appointed Statutory Official',
        certificateOfCompetency: certificateOfCompetency || 'Verified Certificate of Competency',
        gazettedLegalScope: gazettedLegalScope || 'Full legal compliance and statutory enforcement scope.',
        appointedAreaOrShaft: appointedAreaOrShaft || 'Mine Boundary & Designated Operations',
        appointingAuthorityName: appointingAuthorityName || 'Mine General Manager / CEO',
        appointingAuthorityDesignation: appointingAuthorityDesignation || 'Statutory Appointing Authority',
        appointmentDate: new Date().toISOString().split('T')[0],
        acceptanceDate: new Date().toISOString().split('T')[0],
        expiryDate: expiry,
        status: daysUntilExpiry > 30 ? 'ACTIVE' : daysUntilExpiry > 0 ? 'EXPIRING_SOON' : 'EXPIRED',
        daysUntilExpiry,
        verifiedInAuditLedger: true
      };

      statutoryAppointments.unshift(newAppt);
      res.json({
        success: true,
        message: 'Statutory legal appointment registered with verified legal scope.',
        appointment: newAppt
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to record statutory appointment' });
    }
  });

  // Get high-risk operational permits
  app.get(['/api/compliance/safety-files/permits', '/api/compliance/safety-files/permits/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      count: highRiskPermits.length,
      permits: highRiskPermits
    });
  });

  // Issue high-risk operational permit
  app.post(['/api/compliance/safety-files/permits', '/api/compliance/safety-files/permits/'], (req: Request, res: Response) => {
    try {
      const {
        permitType,
        siteId,
        exactWorkLocation,
        validHours,
        issuerName,
        issuerDesignation,
        receiverName,
        receiverTeamCount,
        gasTest,
        lotoPoints,
        safetyChecklist
      } = req.body || {};

      const hours = Number(validHours) || 8;
      const validFrom = new Date().toISOString();
      const validTo = new Date(Date.now() + hours * 3600 * 1000).toISOString();

      const newPermit: HighRiskOperationalPermit = {
        id: `PERM-${permitType?.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
        permitNumber: `PERM-${permitType?.slice(0, 3)}-2026-${Math.floor(100 + Math.random() * 900)}`,
        permitType: permitType || 'HOT_WORK',
        siteId: siteId || 'SITE-WIT-01',
        exactWorkLocation: exactWorkLocation || 'General Operational Workfront',
        validFrom,
        validTo,
        issuerName: issuerName || 'Authorized Statutory Issuer',
        issuerDesignation: issuerDesignation || 'Safety Superintendent',
        receiverName: receiverName || 'Authorized Artisan In Charge',
        receiverTeamCount: Number(receiverTeamCount) || 3,
        safetyChecklist: safetyChecklist || [
          { item: 'Statutory risk assessment completed and verified on site', verified: true, statutoryMandate: 'MHSA Section 11' },
          { item: 'PPE and specialized barrier equipment inspected', verified: true, statutoryMandate: 'SANS 10330' }
        ],
        gasTest: gasTest || undefined,
        lotoPoints: lotoPoints || undefined,
        fallProtectionPlanVerified: permitType === 'WORKING_AT_HEIGHT',
        rescuePlanInPlace: true,
        status: 'ACTIVE_VALID',
        minsRemaining: hours * 60
      };

      highRiskPermits.unshift(newPermit);
      res.json({
        success: true,
        message: 'High-risk operational permit validated and authorized.',
        permit: newPermit
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to issue high-risk permit' });
    }
  });

  // Compile 100% audit-ready digital safety file binder for Tier-1 host sites
  app.get(['/api/compliance/safety-files/binder/:hostSite', '/api/compliance/safety-files/binder/:hostSite/'], (req: Request, res: Response) => {
    try {
      const rawHost = String(req.params.hostSite).toUpperCase();
      const validHosts: Tier1HostSite[] = ['ANGLO_AMERICAN', 'SIBANYE_STILLWATER', 'VALTERRA_PLATINUM', 'IVANPLATS'];
      const hostSite: Tier1HostSite = validHosts.includes(rawHost as Tier1HostSite) ? (rawHost as Tier1HostSite) : 'ANGLO_AMERICAN';

      const binderDossier = compileSafetyFileBinderForHost(hostSite);
      res.json({
        success: true,
        binderDossier
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to compile safety file binder' });
    }
  });

  // --------------------------------------------------------------------------
  // PILLAR 2: VR/SIMULATOR OPERATOR QUALIFICATION & MACHINE AUTHORIZATION
  // --------------------------------------------------------------------------

  // Get operator credentials registry
  app.get(['/api/compliance/operators', '/api/compliance/operators/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      count: operatorProfiles.length,
      operators: operatorProfiles
    });
  });

  // Get heavy machine assets
  app.get(['/api/compliance/machines', '/api/compliance/machines/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      count: machineAssets.length,
      machines: machineAssets
    });
  });

  // Real-time Machine Assignment Rule Engine evaluation
  app.post(['/api/compliance/machine-assignment/evaluate', '/api/compliance/machine-assignment/evaluate/'], (req: Request, res: Response) => {
    try {
      const { operatorId, machineAssetId } = req.body || {};
      if (!operatorId || !machineAssetId) {
        return res.status(400).json({ error: 'Both operatorId and machineAssetId are required for evaluation' });
      }

      const evaluation = evaluateMachineAssignment(operatorId, machineAssetId);
      res.json({
        success: true,
        evaluation
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Machine assignment evaluation failed' });
    }
  });

  // Ingest VR/Simulator training output
  app.post(['/api/compliance/operators/simulator-result', '/api/compliance/operators/simulator-result/'], (req: Request, res: Response) => {
    try {
      const {
        operatorId,
        simulatorOem,
        simulatorModel,
        machineClass,
        virtualHoursLogged,
        hazardAvoidanceScorePct,
        reactionTimeSeconds,
        operatingEfficiencyPct,
        gradeLevel
      } = req.body || {};

      const operator = operatorProfiles.find(o => o.id === operatorId);
      if (!operator) {
        return res.status(404).json({ error: `Operator ${operatorId} not found` });
      }

      const score = Number(hazardAvoidanceScorePct);
      const isCertified = score >= 85;

      const simOutput = {
        simulatorOem: simulatorOem || 'EPIROC',
        simulatorModel: simulatorModel || 'OEM High-Fidelity Cabin Simulator',
        machineClass: machineClass || 'LHD_LOADER',
        assessmentDate: new Date().toISOString().split('T')[0],
        virtualHoursLogged: Number(virtualHoursLogged) || 20,
        hazardAvoidanceScorePct: score,
        reactionTimeSeconds: Number(reactionTimeSeconds) || 1.1,
        operatingEfficiencyPct: Number(operatingEfficiencyPct) || 90,
        gradeLevel: gradeLevel || (score >= 95 ? 'LEVEL_3_MASTER_OPERATOR' : score >= 85 ? 'LEVEL_2_ADVANCED' : 'LEVEL_1_BASIC'),
        isCertified,
        certificateHash: crypto.createHash('sha256').update(`${operatorId}-${simulatorOem}-${score}-${Date.now()}`).digest('hex').substring(0, 16)
      };

      operator.simulatorCertifications.unshift(simOutput);
      res.json({
        success: true,
        message: isCertified ? 'VR Simulator assessment passed and credential issued.' : 'VR Simulator assessment recorded as UNSUCCESSFUL. Recertification required.',
        simOutput
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to record simulator result' });
    }
  });

  // --------------------------------------------------------------------------
  // PILLAR 3: SETA, QCTO & TVET SKILLS VERIFICATION & LEARNERSHIP TRACKER
  // --------------------------------------------------------------------------

  // Get trade candidates and learnership registry
  app.get(['/api/compliance/seta-qcto/candidates', '/api/compliance/seta-qcto/candidates/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      count: tradeCandidates.length,
      candidates: tradeCandidates
    });
  });

  // Verify candidate trade credential onboarding
  app.post(['/api/compliance/seta-qcto/verify-trade', '/api/compliance/seta-qcto/verify-trade/'], (req: Request, res: Response) => {
    try {
      const { candidateId, redSealCertificateNumber, nambSerial } = req.body || {};
      const candidate = tradeCandidates.find(c => c.id === candidateId);
      if (!candidate) {
        return res.status(404).json({ error: `Candidate ${candidateId} not found` });
      }

      if (redSealCertificateNumber) {
        candidate.tradeTestCertification.status = 'RED_SEAL_CERTIFIED';
        candidate.tradeTestCertification.redSealCertificateNumber = redSealCertificateNumber;
        candidate.tradeTestCertification.nambVerificationStatus = 'VERIFIED_ON_NATIONAL_DATABASE';
        candidate.tradeTestCertification.passDate = new Date().toISOString().split('T')[0];
      }

      res.json({
        success: true,
        message: 'Artisan trade qualification verified against NAMB/SETA national registry.',
        candidate
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Trade verification failed' });
    }
  });

  // Generate WSP, ATR, and B-BBEE Scorecard compliance reports
  app.get(['/api/compliance/skills-development/reports', '/api/compliance/skills-development/reports/'], (req: Request, res: Response) => {
    const wspSummary: WorkplaceSkillsPlanSummary = {
      wspReportingYear: 2026,
      submissionDeadline: '2026-04-30',
      primarySeta: 'MQA',
      leviablePayrollAmountZar: 42500000, // R42.5M
      totalPlannedTrainingInterventions: 184,
      estimatedMandatoryGrantClaimZar: 85000, // 20% of 1% SDL
      occupationalBreakdown: [
        { occupationalLevel: 'Managers & Engineers (MHSA 2.9.2/2.6.1)', headcount: 14, plannedTrainees: 12, budgetAllocatedZar: 340000 },
        { occupationalLevel: 'Technicians & Safety Specialists', headcount: 22, plannedTrainees: 20, budgetAllocatedZar: 280000 },
        { occupationalLevel: 'Qualified Artisans (Red Seal Section 26D)', headcount: 58, plannedTrainees: 52, budgetAllocatedZar: 620000 },
        { occupationalLevel: 'Machine Operators (TMM LHD / Drill / Bolter)', headcount: 86, plannedTrainees: 80, budgetAllocatedZar: 850000 },
        { occupationalLevel: 'Learners & Apprentices (Sec 18.1 & 18.2)', headcount: 24, plannedTrainees: 24, budgetAllocatedZar: 490000 }
      ]
    };

    const atrSummary: AnnualTrainingReportSummary = {
      atrReportingYear: 2025,
      actualBeneficiariesCompleted: 172,
      plannedVsActualAchievementPct: 93.5,
      totalExpenditureClaimedZar: 2450000,
      discretionaryGrantsDisbursedZar: 480000,
      completedApprenticeshipsCount: 14,
      completedLearnershipsCount: 22,
      statutoryAuditReadiness: 'READY_TO_SUBMIT'
    };

    const bbeeScorecard: BbeeSkillsScorecardSummary = {
      scorecardYear: 2026,
      totalSkillsPointsEarned: 22.8,
      maxSkillsPoints: 25.0,
      indicators: [
        {
          code: 'IND-4.1.1',
          description: 'Expenditure on learning programmes for black people (Target: 6% of Leviable Amount)',
          targetPct: 6.0,
          actualPct: 5.76,
          pointsAwarded: 7.68,
          maxPoints: 8.0,
          isCompliant: true
        },
        {
          code: 'IND-4.1.2',
          description: 'Expenditure on black employees with disabilities (Target: 0.3% of Leviable Amount)',
          targetPct: 0.3,
          actualPct: 0.32,
          pointsAwarded: 4.0,
          maxPoints: 4.0,
          isCompliant: true
        },
        {
          code: 'IND-4.1.3',
          description: 'Black people participating in Learnerships, Apprenticeships and Internships (Target: 5% of Total Employees)',
          targetPct: 5.0,
          actualPct: 5.4,
          pointsAwarded: 4.0,
          maxPoints: 4.0,
          isCompliant: true
        },
        {
          code: 'IND-4.1.4',
          description: 'Unemployed black learners participating in training programmes (Target: 2.5% of Total Employees)',
          targetPct: 2.5,
          actualPct: 2.8,
          pointsAwarded: 3.12,
          maxPoints: 4.0,
          isCompliant: true
        }
      ],
      absorptionBonusPointsEarned: 4.0,
      absorptionRatePct: 100.0,
      status: 'AUDIT_VERIFIED'
    };

    res.json({
      success: true,
      wspSummary,
      atrSummary,
      bbeeScorecard
    });
  });

  // --------------------------------------------------------------------------
  // CROSS-BORDER & MINE LIFE-CYCLE COMPLIANCE SANDBOX
  // PILLAR 1: MINE CLOSURE, REHABILITATION & ENVIRONMENTAL TRANSITION SUITE
  // --------------------------------------------------------------------------

  // Get Mine Closure Overview, Environmental Licenses, and Handover Checklists
  app.get(['/api/compliance/mine-closure/overview', '/api/compliance/mine-closure/overview/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      overview: mineClosureSuite
    });
  });

  // Add new Statutory Environmental License (DMRE, DWS, NEMA, ZEMA)
  app.post(['/api/compliance/mine-closure/licenses', '/api/compliance/mine-closure/licenses/'], (req: Request, res: Response) => {
    try {
      const {
        licenseNumber,
        statutoryBody,
        title,
        actReference,
        financialProvisionAmountZar,
        keyConditions
      } = req.body || {};

      if (!licenseNumber || !title) {
        return res.status(400).json({ error: 'License number and title are required' });
      }

      const newLicense: StatutoryEnvironmentalLicense = {
        licenseId: `LIC-${Date.now().toString().slice(-6)}`,
        licenseNumber,
        statutoryBody: statutoryBody || 'DMRE',
        title,
        actReference: actReference || 'MPRDA Act 28 of 2002',
        issueDate: new Date().toISOString().split('T')[0],
        renewalDate: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'ACTIVE_COMPLIANT',
        financialProvisionAmountZar: Number(financialProvisionAmountZar) || 5000000,
        keyConditions: Array.isArray(keyConditions) ? keyConditions : ['Quarterly ground water sampling', 'Annual financial provisioning review']
      };

      mineClosureSuite.licenses.unshift(newLicense);
      res.json({
        success: true,
        message: 'Statutory environmental license registered successfully.',
        license: newLicense,
        overview: mineClosureSuite
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to register environmental license' });
    }
  });

  // Sign off or update liability handover checklist item
  app.put(['/api/compliance/mine-closure/handover-items/:itemId/sign-off', '/api/compliance/mine-closure/handover-items/:itemId/sign-off/'], (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const { signOffStatus, checkIndex, completed } = req.body || {};

      const item = mineClosureSuite.liabilityHandoverItems.find(i => i.itemId === itemId);
      if (!item) {
        return res.status(404).json({ error: `Handover item ${itemId} not found` });
      }

      if (typeof checkIndex === 'number' && item.checklistRequirements[checkIndex]) {
        item.checklistRequirements[checkIndex].completed = completed ?? true;
        if (completed) {
          item.checklistRequirements[checkIndex].verifiedDate = new Date().toISOString().split('T')[0];
        }
      }

      if (signOffStatus) {
        item.signOffStatus = signOffStatus;
        if (signOffStatus === 'LIABILITY_DISCHARGED') {
          item.handoverCertificateHash = crypto.createHash('sha256').update(`${itemId}-DISCHARGED-${Date.now()}`).digest('hex');
        }
      }

      // Check if all checklist items are completed to auto-discharge
      const allDone = item.checklistRequirements.every(c => c.completed);
      if (allDone && item.signOffStatus !== 'LIABILITY_DISCHARGED') {
        item.signOffStatus = 'PARTIALLY_VERIFIED';
      }

      res.json({
        success: true,
        message: `Handover item ${itemId} updated successfully.`,
        item,
        overview: mineClosureSuite
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update handover item' });
    }
  });

  // --------------------------------------------------------------------------
  // CROSS-BORDER & MINE LIFE-CYCLE COMPLIANCE SANDBOX
  // PILLAR 2: TIER-1 CONTRACTOR PRE-QUALIFICATION & CROSS-BORDER AUDIT SANDBOX
  // --------------------------------------------------------------------------

  // Get Cross-Border Statutory Safety Regulatory Mapping (SA DMRE vs Zambia MSD / SADC)
  app.get(['/api/compliance/cross-border/mapping', '/api/compliance/cross-border/mapping/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      count: crossBorderMappings.length,
      mappings: crossBorderMappings
    });
  });

  // Defensibility Index Matrix simulation endpoint
  app.get(['/api/compliance/cross-border/defensibility-index', '/api/compliance/cross-border/defensibility-index/'], (req: Request, res: Response) => {
    try {
      const host = (req.query.host as EnterpriseTier1Host) || 'ANGLO_AMERICAN';
      const result = simulateDefensibilityIndex(host);
      res.json({
        success: true,
        result
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Defensibility simulation failed' });
    }
  });

  app.post(['/api/compliance/cross-border/defensibility-index/simulate', '/api/compliance/cross-border/defensibility-index/simulate/'], (req: Request, res: Response) => {
    try {
      const { hostEnterprise, customOverrides } = req.body || {};
      const host = (hostEnterprise as EnterpriseTier1Host) || 'ANGLO_AMERICAN';
      const result = simulateDefensibilityIndex(host, customOverrides);
      res.json({
        success: true,
        result
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Defensibility simulation failed' });
    }
  });

  // Real-time Compliance Gap Analysis Alerts (Tender Readiness Scanner)
  app.get(['/api/compliance/cross-border/gap-alerts', '/api/compliance/cross-border/gap-alerts/'], (req: Request, res: Response) => {
    res.json({
      success: true,
      count: complianceGapAlerts.length,
      alerts: complianceGapAlerts
    });
  });

  // Resolve or remediate a compliance gap alert
  app.post(['/api/compliance/cross-border/gap-alerts/:alertId/resolve', '/api/compliance/cross-border/gap-alerts/:alertId/resolve/'], (req: Request, res: Response) => {
    try {
      const { alertId } = req.params;
      const alert = complianceGapAlerts.find(a => a.alertId === alertId);
      if (!alert) {
        return res.status(404).json({ error: `Alert ${alertId} not found` });
      }

      alert.isResolved = true;
      res.json({
        success: true,
        message: `Compliance gap ${alertId} marked as resolved. Safety file defensibility restored.`,
        alert,
        alerts: complianceGapAlerts
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to resolve compliance gap' });
    }
  });
}
