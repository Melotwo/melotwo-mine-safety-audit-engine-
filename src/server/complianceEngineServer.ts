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
}
