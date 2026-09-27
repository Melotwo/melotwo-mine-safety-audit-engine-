/**
 * Zambian Mine Health & Safety (MHS) Compliance Module
 * 
 * Specifically configured for:
 * 1. MSD / Mining Regulations (MSR) Subterranean Hazard Checklists (Parts IX, X, XII, XIV)
 * 2. ZEMA SI 112 Aquatic Environmental Effluent & Tailings Decant Discharge Limits
 * 3. Mines and Minerals Development Act (MMDA) & OHS Statutory Enforcement
 * 4. Multi-Jurisdictional Mapping with Authority Tagging & Verification Status Flags
 * 5. 15-Point Top-of-Funnel Lead Magnet Diagnostic Assessment Framework
 */

import { ZambianAuthorityTag, ComplianceVerificationStatus } from './regulatoryRules.zambia';

export interface MhsChecklistItem {
  id: string;
  code: string;
  authority: ZambianAuthorityTag;
  verificationStatus: ComplianceVerificationStatus;
  category: 'VENTILATION_GAS' | 'STRATA_GROUND_SUPPORT' | 'ELECTRICAL_FLAMEPROOF' | 'EXPLOSIVES_REENTRY' | 'REFUGE_EMERGENCY';
  title: string;
  statutoryRegulation: string;
  hazardRisk: string;
  criticalThreshold: string;
  inspectionFrequency: 'CONTINUOUS_TELEMETRY' | 'EVERY_SHIFT' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  passCriteria: string;
  stoppageTrigger: string;
  correctiveAction: string;
}

export interface ZemaDischargeLimit {
  parameterId: string;
  parameterName: string;
  authority: ZambianAuthorityTag;
  verificationStatus: ComplianceVerificationStatus;
  chemicalSymbol?: string;
  statutoryLimit: string;
  unit: string;
  standardReference: string;
  targetWaterBody: string;
  consequenceOfBreach: string;
  neutralizationMethod: string;
}

export interface ZambianMhsComplianceProfile {
  jurisdiction: 'ZM';
  title: string;
  governingActs: string[];
  subterraneanChecklist: MhsChecklistItem[];
  zemaEffluentDischargeLimits: ZemaDischargeLimit[];
  stoppageClauses: {
    msdSectionNotice: string;
    description: string;
    remedyPeriodHours: number;
  }[];
}

export const ZAMBIAN_MHS_COMPLIANCE_MODULE: ZambianMhsComplianceProfile = {
  jurisdiction: 'ZM',
  title: 'Republic of Zambia - Mine Health & Safety (MHS) Statutory Compliance Architecture',
  governingActs: [
    'Mines and Minerals Development Act No. 11 of 2015',
    'Mining Regulations (MSR) - Mines Safety Department (MSD) Kitwe',
    'Environmental Management Act No. 12 of 2011 (ZEMA)',
    'ZEMA Statutory Instrument No. 112 (Licensing of Emissions and Effluents)',
    'Occupational Health and Safety Act No. 36 of 2010',
    'Workers Compensation Act No. 10 of 1999',
    'Citizen Economic Empowerment Act No. 9 of 2006'
  ],
  subterraneanChecklist: [
    {
      id: 'ZM-MHS-SUB-01',
      code: 'MSR-VENT-1404',
      authority: 'MSD',
      verificationStatus: 'VERIFIED',
      category: 'VENTILATION_GAS',
      title: 'Methane (CH4) & Flammable Gas Telemetry',
      statutoryRegulation: 'Mining Regulations (MSR) Part XIV, Regulation 1404',
      hazardRisk: 'Flammable gas ignition, subterranean fireball, coal/copper dust explosion propagation.',
      criticalThreshold: '< 1.25% by volume (Ceiling); Power cut at 1.0%; Alert at 0.8%',
      inspectionFrequency: 'CONTINUOUS_TELEMETRY',
      passCriteria: 'Methane concentration < 0.5% vol across all active headings, cross-cuts, and return airways.',
      stoppageTrigger: 'Automatic power isolation if CH4 >= 1.0%; immediate subterranean crew withdrawal if >= 1.25%.',
      correctiveAction: 'Activate auxiliary scrubber fans, dilute gas with fresh airflow, and inspect geological fissures.'
    },
    {
      id: 'ZM-MHS-SUB-02',
      code: 'MSR-VENT-1406',
      authority: 'MSD',
      verificationStatus: 'VERIFIED',
      category: 'VENTILATION_GAS',
      title: 'Carbon Monoxide (CO) & Toxic Fume Post-Blast Clearance',
      statutoryRegulation: 'Mining Regulations (MSR) Part XIV, Regulation 1406',
      hazardRisk: 'Severe hypoxia, carbon monoxide asphyxiation, worker incapacitation.',
      criticalThreshold: 'Safe 8h TWA <= 30 ppm; SCSR donning alarm at 50 ppm; Immediate Halt >= 100 ppm',
      inspectionFrequency: 'EVERY_SHIFT',
      passCriteria: 'CO concentration <= 30 ppm verified with calibrated multi-gas detector before re-entry.',
      stoppageTrigger: 'CO > 50 ppm requires immediate SCSR donning and halts heading advancement.',
      correctiveAction: 'Purge heading with minimum 30-minute compressed air / auxiliary ducting flush; re-test before re-entry.'
    },
    {
      id: 'ZM-MHS-SUB-03',
      code: 'MSR-VENT-1410',
      authority: 'MSD',
      verificationStatus: 'VERIFIED',
      category: 'VENTILATION_GAS',
      title: 'Active Face Airflow Velocity & Minimum Dilution',
      statutoryRegulation: 'Mining Regulations (MSR) Part XIV, Regulation 1410',
      hazardRisk: 'Stagnant subterranean air pockets, toxic gas layering, silica dust stagnation.',
      criticalThreshold: '>= 0.30 m/s (Absolute Statutory Min); >= 0.50 m/s (Recommended Active Heading)',
      inspectionFrequency: 'EVERY_SHIFT',
      passCriteria: 'Vane anemometer reading confirms >= 0.30 m/s continuous fresh air sweep at the stope face.',
      stoppageTrigger: 'Air velocity < 0.30 m/s halts drilling, blasting, and mechanical mucking operations.',
      correctiveAction: 'Repair damaged flexible ducting sections, verify secondary booster fan power, and re-clear intake airway.'
    },
    {
      id: 'ZM-MHS-SUB-04',
      code: 'MSR-STRATA-1008',
      authority: 'MSD',
      verificationStatus: 'VERIFIED',
      category: 'STRATA_GROUND_SUPPORT',
      title: 'Ground Support, Rock Bolting & Fall of Ground (FOG) Plan',
      statutoryRegulation: 'Mining Regulations (MSR) Part X, Regulation 1008',
      hazardRisk: 'Catastrophic stope roof collapse, rockburst, personnel burial under unsupported strata.',
      criticalThreshold: 'Rock bolt pull-test resistance >= 80 kN; Maximum unsupported span <= 2.0m; Mesh overlap >= 100mm',
      inspectionFrequency: 'DAILY',
      passCriteria: '100% of advance headings supported to current geomechanical face line with active pull-test certificates.',
      stoppageTrigger: 'Any unsupported heading advance > 2.0 meters triggers immediate Section 54 work stoppage.',
      correctiveAction: 'Install temporary hydraulic mechanical props immediately; drill and resin-grout primary pattern rock bolts.'
    },
    {
      id: 'ZM-MHS-SUB-05',
      code: 'MSR-ELEC-1205',
      authority: 'MSD',
      verificationStatus: 'VERIFIED',
      category: 'ELECTRICAL_FLAMEPROOF',
      title: 'Flameproof Substation Certification & Earth Continuity',
      statutoryRegulation: 'Mining Regulations (MSR) Part XII, Regulation 1205 & SANS 10142',
      hazardRisk: 'Arc-flash explosion in gaseous underground atmosphere, electrocution, electrical fires.',
      criticalThreshold: 'Earth continuity loop <= 10 Ohms; Earth leakage trip <= 300 mA in < 100 ms; Flameproof gap <= 0.4mm',
      inspectionFrequency: 'WEEKLY',
      passCriteria: 'Valid MSD electrical inspection certificate; flameproof glanding and explosion-proof enclosure seals intact.',
      stoppageTrigger: 'Earth resistance > 10 Ohms or breach of flameproof seal requires de-energization of the underground feeder.',
      correctiveAction: 'Lockout/Tagout (LOTO) breaker; re-torque earthing braid straps and replace cracked flameproof glass inspection port.'
    },
    {
      id: 'ZM-MHS-SUB-06',
      code: 'MSR-BLAST-0912',
      authority: 'MSD',
      verificationStatus: 'VERIFIED',
      category: 'EXPLOSIVES_REENTRY',
      title: 'Subterranean Blasting Clearance & Statutory Wait Time',
      statutoryRegulation: 'Mining Regulations (MSR) Part IX, Regulation 912',
      hazardRisk: 'Secondary unexploded charges, nitrogen dioxide (NO2) fume toxicity, misfires.',
      criticalThreshold: 'Statutory wait time: 30 minutes minimum post-blast; NO2 < 3.0 ppm before re-entry declaration',
      inspectionFrequency: 'EVERY_SHIFT',
      passCriteria: 'Appointed Blaster (Form MSD-14) executes re-entry inspection and formally signs shift logbook.',
      stoppageTrigger: 'Premature heading re-entry before blast timer expiry prompts immediate license revocation and site inquiry.',
      correctiveAction: 'Evacuate re-entry crew; flush ventilation line for additional 15 minutes; re-test face with multi-gas monitor.'
    },
    {
      id: 'ZM-MHS-SUB-07',
      code: 'MSR-EMERG-1422',
      authority: 'MSD',
      verificationStatus: 'VERIFIED',
      category: 'REFUGE_EMERGENCY',
      title: 'Underground Refuge Chamber 36-Hour Autonomy Readiness',
      statutoryRegulation: 'Mining Regulations (MSR) Part XIV, Regulation 1422',
      hazardRisk: 'Subterranean entrapment during mine fires, conveyor smoke ingress, toxic atmospheric inundation.',
      criticalThreshold: 'Oxygen supply >= 36 hours for rated capacity; Positive internal pressure >= 100 Pa; Max distance <= 750m',
      inspectionFrequency: 'WEEKLY',
      passCriteria: 'Refuge chamber air scrubber bottles charged; water/rations sealed; battery backup voltage >= 24.5 V.',
      stoppageTrigger: 'Depleted oxygen or inoperable airlock door stops all development advance beyond 750m radius.',
      correctiveAction: 'Replace depleted medical oxygen cylinders; calibrate internal CO2 scrubber and replace airlock gasket seal.'
    }
  ],
  zemaEffluentDischargeLimits: [
    {
      parameterId: 'ZEMA-EFF-PH',
      parameterName: 'Effluent pH (Hydrogen Ion Potential)',
      authority: 'ZEMA',
      verificationStatus: 'VERIFIED',
      chemicalSymbol: 'pH',
      statutoryLimit: '6.5 - 9.0',
      unit: 'pH Units',
      standardReference: 'ZEMA SI 112 Third Schedule, Table 1',
      targetWaterBody: 'Kafue River & Tributary Mining Drainages',
      consequenceOfBreach: 'Acid mine drainage (AMD), severe aquatic ecosystem destruction, immediate statutory fine.',
      neutralizationMethod: 'Automated hydrated lime (calcium hydroxide) dosing into primary neutralizing clarifier.'
    },
    {
      parameterId: 'ZEMA-EFF-CU',
      parameterName: 'Total Dissolved Copper',
      authority: 'ZEMA',
      verificationStatus: 'VERIFIED',
      chemicalSymbol: 'Cu',
      statutoryLimit: '<= 1.0',
      unit: 'mg/L',
      standardReference: 'ZEMA SI 112 Third Schedule, Table 1',
      targetWaterBody: 'Kafue Basin Public Water Systems',
      consequenceOfBreach: 'Severe aquatic toxicity, bioaccumulation in fish stock, environmental remediation order.',
      neutralizationMethod: 'Sulfide/hydroxide precipitation through coagulation clarifier and secondary settling sump.'
    },
    {
      parameterId: 'ZEMA-EFF-TSS',
      parameterName: 'Total Suspended Solids',
      authority: 'ZEMA',
      verificationStatus: 'VERIFIED',
      chemicalSymbol: 'TSS',
      statutoryLimit: '<= 100',
      unit: 'mg/L',
      standardReference: 'ZEMA SI 112 Third Schedule, Table 1',
      targetWaterBody: 'Surface Stream Discharges',
      consequenceOfBreach: 'Siltation of river beds, turbidity exceedance, decant discharge license suspension.',
      neutralizationMethod: 'Polymer flocculant injection into thickener feed and retention in multi-stage settling ponds.'
    },
    {
      parameterId: 'ZEMA-EFF-CO',
      parameterName: 'Total Dissolved Cobalt',
      authority: 'ZEMA',
      verificationStatus: 'VERIFIED',
      chemicalSymbol: 'Co',
      statutoryLimit: '<= 1.0',
      unit: 'mg/L',
      standardReference: 'ZEMA SI 112 Third Schedule, Table 1',
      targetWaterBody: 'Local Aquatic Catchment',
      consequenceOfBreach: 'Heavy metal soil contamination, agricultural aquifer pollution, mandatory ZEMA audit.',
      neutralizationMethod: 'pH elevation to 9.2 with lime slurry followed by ion-exchange scavenging columns.'
    },
    {
      parameterId: 'ZEMA-EFF-CN',
      parameterName: 'Weak Acid Dissociable (WAD) Cyanide',
      authority: 'ZEMA',
      verificationStatus: 'VERIFIED',
      chemicalSymbol: 'WAD CN',
      statutoryLimit: '<= 0.2',
      unit: 'mg/L',
      standardReference: 'ZEMA SI 112 Hazardous Mining Chemicals Criteria',
      targetWaterBody: 'Surrounding Ground & Surface Water Streams',
      consequenceOfBreach: 'Lethal wildlife/livestock poisoning, emergency community evacuation, plant shutdown.',
      neutralizationMethod: 'Caro\'s Acid (H2SO5) or INCO SO2/Air detoxification circuit followed by copper sulfate catalyst.'
    },
    {
      parameterId: 'ZEMA-TSF-FREEBOARD',
      parameterName: 'Tailings Storage Facility (TSF) Dry Freeboard',
      authority: 'ZEMA',
      verificationStatus: 'VERIFIED',
      statutoryLimit: '>= 1.50',
      unit: 'Meters',
      standardReference: 'ZEMA TSF Dam Safety Directives & MSD Engineering Guidelines',
      targetWaterBody: 'Downstream Catchment Areas',
      consequenceOfBreach: 'Catastrophic dam overtopping, breach of tailings wall, mudflow slurry inundation.',
      neutralizationMethod: 'Lower pond decant level with high-capacity barge pumps; construct crest raise earthworks.'
    },
    {
      parameterId: 'ZEMA-TSF-FOS',
      parameterName: 'TSF Embankment Factor of Safety (Slope Stability)',
      authority: 'ZEMA',
      verificationStatus: 'VERIFIED',
      statutoryLimit: '>= 1.50',
      unit: 'Factor (FoS)',
      standardReference: 'Global Industry Standard on Tailings Management (GISTM) & ZEMA Framework',
      targetWaterBody: 'Mine Environs and Riparian Zones',
      consequenceOfBreach: 'Geotechnical slope slippage, structural wall rupture, global regulatory audit.',
      neutralizationMethod: 'Install horizontal toe drainage relief trenches and buttress downstream embankment.'
    }
  ],
  stoppageClauses: [
    {
      msdSectionNotice: 'MSR Part XIV, Section 54 Stoppage Order',
      description: 'Dangerous underground atmosphere (CH4 >= 1.25%, CO >= 100 ppm, or Air Velocity < 0.30 m/s). Immediate suspension of operations.',
      remedyPeriodHours: 24
    },
    {
      msdSectionNotice: 'MSR Part X, Section 55 Defective Ground Support Notice',
      description: 'Advance heading unsupported beyond 2.0 meters without verified rock bolt pull-tests. Operations halted until re-supported.',
      remedyPeriodHours: 12
    },
    {
      msdSectionNotice: 'ZEMA SI 112 Environmental Remediation Order',
      description: 'Breach of aquatic effluent standards into Kafue catchment. Weir gate shutoff and heavy fiscal penalty.',
      remedyPeriodHours: 48
    }
  ]
};

/**
 * 15-Point Top-of-Funnel Lead Magnet Diagnostic Framework
 */
export interface DiagnosticQuestion {
  id: string;
  category: 'ZEMA' | 'MSD' | 'OHS' | 'LOCAL_CONTENT';
  categoryLabel: string;
  weight: number; // 1 to 10
  question: string;
  statutoryReference: string;
  options: {
    label: string;
    score: number; // 0, 5, 10
    indicator: 'COMPLIANT' | 'PARTIAL' | 'DEFICIENT';
    riskNote?: string;
  }[];
}

export const ZAMBIAN_15_POINT_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // --- Pillar 1: ZEMA (Questions 1 - 4) ---
  {
    id: 'ZM-DIAG-01',
    category: 'ZEMA',
    categoryLabel: 'ZEMA Environmental Effluent & Emissions',
    weight: 9,
    question: 'Does the operation hold an active ZEMA SI 112 Effluent Discharge License with quarterly third-party aquatic assay records for copper, cobalt, TSS, and pH?',
    statutoryReference: 'ZEMA Statutory Instrument No. 112 (Licensing of Emissions & Effluents)',
    options: [
      { label: 'Yes - Active license with certified monthly laboratory telemetry (<1.0 mg/L Cu & Co).', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Discharge permit active but laboratory assay logs have gaps in past 60 days.', score: 5, indicator: 'PARTIAL', riskNote: 'Risk of ZEMA audit notice for missing compliance logs.' },
      { label: 'No - Effluent discharged into local drainages without active ZEMA license validation.', score: 0, indicator: 'DEFICIENT', riskNote: 'Immediate statutory closure risk & heavy civil environmental liability.' }
    ]
  },
  {
    id: 'ZM-DIAG-02',
    category: 'ZEMA',
    categoryLabel: 'ZEMA Environmental Effluent & Emissions',
    weight: 8,
    question: 'Are Tailings Storage Facility (TSF) decant levels and embankment dry freeboards maintained at >= 1.50 meters with certified geotechnical piezometer monitoring?',
    statutoryReference: 'ZEMA Environmental Code of Practice for Tailings Dam Safety',
    options: [
      { label: 'Yes - Continuous surveyed freeboard >= 1.50m and Factor of Safety >= 1.50 certified.', score: 10, indicator: 'COMPLIANT' },
      { label: 'In Progress - Freeboard monitored manually; geotechnical review overdue by > 6 months.', score: 5, indicator: 'PARTIAL', riskNote: 'Geotechnical vulnerability during heavy Copperbelt monsoon rains.' },
      { label: 'No - Dry freeboard buffer is < 1.50m or unmonitored crest stability.', score: 0, indicator: 'DEFICIENT', riskNote: 'Catastrophic overtopping breach liability; instant shutdown.' }
    ]
  },
  {
    id: 'ZM-DIAG-03',
    category: 'ZEMA',
    categoryLabel: 'ZEMA Environmental Effluent & Emissions',
    weight: 7,
    question: 'Are chemical containment bunds (lime, acid, diesel, flotation reagents) engineered to hold >= 110% capacity with dedicated spill emergency kits?',
    statutoryReference: 'ZEMA Hazardous Waste Management Regulations',
    options: [
      { label: 'Yes - All reagent bulk storage areas feature certified 110% impermeable bunding.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Bunds constructed but contain cracks or lack certified drainage valves.', score: 5, indicator: 'PARTIAL', riskNote: 'Potential ground aquifer contamination during reagent delivery.' },
      { label: 'No - Drums or bulk tanks stored on bare unbunded soil without containment.', score: 0, indicator: 'DEFICIENT', riskNote: 'Direct violation of ZEMA chemical handling statutory rules.' }
    ]
  },
  {
    id: 'ZM-DIAG-04',
    category: 'ZEMA',
    categoryLabel: 'ZEMA Environmental Effluent & Emissions',
    weight: 8,
    question: 'Is an approved Environmental Management Plan (EMP) in place with an updated Mine Closure & Post-Mining Rehabilitation bond lodged with the Ministry?',
    statutoryReference: 'Environmental Management Act No. 12 of 2011 Part VI',
    options: [
      { label: 'Yes - Approved EMP active; post-mining financial guarantee / escrow fully maintained.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - EMP under five-year review or bond replenishment pending ministerial sign-off.', score: 5, indicator: 'PARTIAL', riskNote: 'Delayed approval of mine expansion permits until bond is cleared.' },
      { label: 'No - No active EMP or post-mining rehabilitation guarantee lodged.', score: 0, indicator: 'DEFICIENT', riskNote: 'Severe licensing breach; forfeiture of operational permit.' }
    ]
  },

  // --- Pillar 2: MSD Mines Safety Department (Questions 5 - 8) ---
  {
    id: 'ZM-DIAG-05',
    category: 'MSD',
    categoryLabel: 'MSD Mines Safety Department Statutory Controls',
    weight: 10,
    question: 'Are all statutory engineering and operational roles formally appointed with valid MSD certificates (Form MSD-08 Mine Captain, Form MSD-14 Blaster, EIZ Registered Engineer)?',
    statutoryReference: 'Mining Regulations (MSR) Part IX & Part XII Competency Mandates',
    options: [
      { label: 'Yes - 100% of statutory appointments lodged, gazetted, and verified by MSD Kitwe.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Appointments held internally but formal stamped MSD notifications are pending.', score: 5, indicator: 'PARTIAL', riskNote: 'Operations carry vicarious liability for non-gazetted supervisors.' },
      { label: 'No - Uncertified supervisors directing high-risk underground blasting or electrical work.', score: 0, indicator: 'DEFICIENT', riskNote: 'Immediate criminal liability under MSR for mining overseers.' }
    ]
  },
  {
    id: 'ZM-DIAG-06',
    category: 'MSD',
    categoryLabel: 'MSD Mines Safety Department Statutory Controls',
    weight: 9,
    question: 'Does the underground ventilation infrastructure guarantee >= 0.30 m/s fresh air velocity at all active faces with telemetry interlocks for CH4 (< 1.25%) and CO (< 50 ppm)?',
    statutoryReference: 'Mining Regulations (MSR) Part XIV, Regulations 1404, 1406, 1410',
    options: [
      { label: 'Yes - Daily anemometer readings >= 0.30 m/s and automated electrical interlocks on gas trip.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Air velocity meets minimum but gas sensors are hand-held only without automated trip.', score: 5, indicator: 'PARTIAL', riskNote: 'Secondary hazard if shift boss fails to detect sudden gas pockets.' },
      { label: 'No - Stagnant air pockets detected; air velocity < 0.30 m/s in production cross-cuts.', score: 0, indicator: 'DEFICIENT', riskNote: 'MSD Section 54 immediate halt notice on all heading advances.' }
    ]
  },
  {
    id: 'ZM-DIAG-07',
    category: 'MSD',
    categoryLabel: 'MSD Mines Safety Department Statutory Controls',
    weight: 9,
    question: 'Is a certified Fall of Ground (FOG) Management Plan executed, ensuring no advance heading exceeds 2.0m unsupported and rock bolts withstand >= 80 kN pull tests?',
    statutoryReference: 'Mining Regulations (MSR) Part X, Regulation 1008 (Excavations & Support)',
    options: [
      { label: 'Yes - Geomechanical support pattern strictly logged with weekly hydraulic pull-test records.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Ground supported with resin bolts but pull-test calibration register is overdue.', score: 5, indicator: 'PARTIAL', riskNote: 'Potential undetected resin failure under seismic rock displacement.' },
      { label: 'No - Unsupported stope advances exceed 2.0 meters without certified ground testing.', score: 0, indicator: 'DEFICIENT', riskNote: 'Fatal fall of ground liability; Section 55 stoppage order.' }
    ]
  },
  {
    id: 'ZM-DIAG-08',
    category: 'MSD',
    categoryLabel: 'MSD Mines Safety Department Statutory Controls',
    weight: 8,
    question: 'Is a 30-minute post-blast clearance SOP enforced with nitrogen dioxide (NO2 < 3.0 ppm) verification prior to underground personnel re-entry?',
    statutoryReference: 'Mining Regulations (MSR) Part IX, Regulation 912 (Handling of Explosives)',
    options: [
      { label: 'Yes - Blaster logs gas test on MeloTwo terminal before unlocking shift access turnstile.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - 30-minute timer observed but multi-gas monitor not systematically logged in register.', score: 5, indicator: 'PARTIAL', riskNote: 'Exposure risk to lingering blasting nitrous fumes.' },
      { label: 'No - Crew re-enters heading without gas test clearance protocol.', score: 0, indicator: 'DEFICIENT', riskNote: 'Fatal fume asphyxiation hazard and gross regulatory violation.' }
    ]
  },

  // --- Pillar 3: OHS & Occupational Health (Questions 9 - 12) ---
  {
    id: 'ZM-DIAG-09',
    category: 'OHS',
    categoryLabel: 'OHS & MBOD Silicosis Surveillance',
    weight: 9,
    question: 'Are 100% of subterranean personnel certified Fit-for-Duty by the Medical Bureau for Occupational Diseases (MBOD Silicosis Bureau Ndola) with valid annual chest X-rays?',
    statutoryReference: 'Occupational Health and Safety Act No. 36 of 2010 & MBOD Protocol',
    options: [
      { label: 'Yes - 100% valid MBOD Bureau Silicosis passports tracked digitally on site roster.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - >85% compliant; 15% awaiting annual re-examination appointments at Ndola.', score: 5, indicator: 'PARTIAL', riskNote: 'Uncertified workers must be restricted from high-dust headings.' },
      { label: 'No - Workers deployed underground with general clinic certificates or expired MBOD fitness.', score: 0, indicator: 'DEFICIENT', riskNote: 'Severe statutory liability for occupational pneumoconiosis claims.' }
    ]
  },
  {
    id: 'ZM-DIAG-10',
    category: 'OHS',
    categoryLabel: 'OHS & MBOD Silicosis Surveillance',
    weight: 7,
    question: 'Are baseline and annual audiometric hearing screening tests performed, and is certified hearing protection (NRR >= 25 dBA) enforced in equipment zones (> 85 dBA)?',
    statutoryReference: 'OHSA Statutory Instrument on Noise Induced Hearing Loss (NIHL)',
    options: [
      { label: 'Yes - Calibrated audiograms maintained in safety files; custom hearing protection deployed.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Ear protection provided but annual audiometric shift threshold tracking is irregular.', score: 5, indicator: 'PARTIAL', riskNote: 'Unmitigated liability for irreversible noise-induced hearing loss.' },
      { label: 'No - Noise levels exceed 85 dBA without hearing protection programs.', score: 0, indicator: 'DEFICIENT', riskNote: 'Workers compensation claims under WCFCB.' }
    ]
  },
  {
    id: 'ZM-DIAG-11',
    category: 'OHS',
    categoryLabel: 'OHS & MBOD Silicosis Surveillance',
    weight: 8,
    question: 'Are underground refuge chambers equipped with >= 36-hour autonomous life support and positive airlocks, backed by bi-annual crew SCSR donning drills?',
    statutoryReference: 'Mining Regulations (MSR) Part XIV Emergency Directives',
    options: [
      { label: 'Yes - Refuge chambers stocked with 36h O2 and crew trained in 60-second SCSR donning.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Chambers installed but oxygen scrubber canisters overdue for quarterly test.', score: 5, indicator: 'PARTIAL', riskNote: 'Critical risk in case of subterranean conveyor or haul-truck fire.' },
      { label: 'No - Refuge chambers missing or located > 750m away from working face advances.', score: 0, indicator: 'DEFICIENT', riskNote: 'Fatal emergency risk; immediate stoppage of active headings.' }
    ]
  },
  {
    id: 'ZM-DIAG-12',
    category: 'OHS',
    categoryLabel: 'OHS & MBOD Silicosis Surveillance',
    weight: 8,
    question: 'Is an automated statutory incident escalation protocol configured for MSD Section 54/55 notifications within 24 hours of lost-time injuries or reportable occurrences?',
    statutoryReference: 'Mines and Minerals Development Act Part VII Incident Reporting',
    options: [
      { label: 'Yes - Formal escalation SOP active with instant SMS/email triggers to MSD Kitwe.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Incidents reported internally on paper; external MSD notification has experienced delays.', score: 5, indicator: 'PARTIAL', riskNote: 'Fines for late statutory reporting to Chief Inspector of Mines.' },
      { label: 'No - No formal incident investigation or statutory notification mechanism.', score: 0, indicator: 'DEFICIENT', riskNote: 'Criminal concealment penalty under Section 56 of MMDA.' }
    ]
  },

  // --- Pillar 4: Local Content & SME Supply Chain (Questions 13 - 15) ---
  {
    id: 'ZM-DIAG-13',
    category: 'LOCAL_CONTENT',
    categoryLabel: 'Local Content & Mining Supply Chain Access',
    weight: 9,
    question: 'Does the company satisfy Zambian Citizen Equity ownership rules (>= 51% citizen-owned for Tier-1 preference or >= 25% for citizen-empowered joint ventures)?',
    statutoryReference: 'Mines & Minerals Development Local Content Regulations & CEEC Act',
    options: [
      { label: 'Yes - Certified PACRA shareholding confirms >= 51% Zambian citizen equity.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - 25% to 50% citizen equity (qualifies as Citizen-Empowered JV).', score: 7, indicator: 'PARTIAL', riskNote: 'Eligible for joint venture tenders but barred from reserved citizen contracts.' },
      { label: 'No - Expatriate or non-citizen ownership (< 25% citizen equity).', score: 0, indicator: 'DEFICIENT', riskNote: 'Locked out of Tier-1 mining house preferential supplier lists.' }
    ]
  },
  {
    id: 'ZM-DIAG-14',
    category: 'LOCAL_CONTENT',
    categoryLabel: 'Local Content & Mining Supply Chain Access',
    weight: 8,
    question: 'Does the staff payroll satisfy statutory workforce localization ratios (>= 85% Zambian citizens in skilled roles and 100% in unskilled positions)?',
    statutoryReference: 'MMDA 2015 Part IV Employment Quota & Immigration Directives',
    options: [
      { label: 'Yes - Verified monthly NAPSA payroll demonstrates compliance with 85%+ local quota.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - 70% - 84% citizen staffing with active succession plans lodged for expats.', score: 5, indicator: 'PARTIAL', riskNote: 'Subject to quarterly immigration and labor audits.' },
      { label: 'No - Exceeds allowable expatriate quotas without approved succession plans.', score: 0, indicator: 'DEFICIENT', riskNote: 'Risk of contractor work permit cancellations and gate pass denial.' }
    ]
  },
  {
    id: 'ZM-DIAG-15',
    category: 'LOCAL_CONTENT',
    categoryLabel: 'Local Content & Mining Supply Chain Access',
    weight: 9,
    question: 'Are all statutory standing certificates current and unencumbered (PACRA, ZRA TPIN Tax Clearance, WCFCB Good Standing, NAPSA clearance)?',
    statutoryReference: 'Public Procurement & Tier-1 Mining Contractor Prequalification Standard',
    options: [
      { label: 'Yes - All four certificates valid within current fiscal period with zero arrears.', score: 10, indicator: 'COMPLIANT' },
      { label: 'Partial - Three valid; one certificate under renewal or payment arrangement.', score: 5, indicator: 'PARTIAL', riskNote: 'May be flagged during automated Tier-1 tender gate reviews.' },
      { label: 'No - Missing ZRA tax clearance or WCFCB certificate of good standing.', score: 0, indicator: 'DEFICIENT', riskNote: 'Instant disqualification from mining tender files & gate passes.' }
    ]
  }
];

export interface DiagnosticAssessmentResult {
  overallScore: number; // 0 - 100%
  riskTier: 'CRITICAL_RISK' | 'MODERATE_RISK' | 'HIGH_READINESS' | 'TIER1_APPROVED';
  riskLabel: string;
  categoryScores: {
    ZEMA: number;
    MSD: number;
    OHS: number;
    LOCAL_CONTENT: number;
  };
  operationalGaps: Array<{
    questionId: string;
    category: string;
    issue: string;
    remediationAction: string;
  }>;
  missingStatutoryAppointments: string[];
  liabilityRisks: string[];
  recommendedBinderType: string;
}

/**
 * Dynamically computes weighted compliance readiness score
 */
export function calculate15PointReadinessScore(
  answers: Record<string, number> // questionId -> chosen score (0, 5, 10)
): DiagnosticAssessmentResult {
  let totalWeightedScore = 0;
  let totalMaxWeight = 0;

  const categoryTotals: Record<'ZEMA' | 'MSD' | 'OHS' | 'LOCAL_CONTENT', { earned: number; max: number }> = {
    ZEMA: { earned: 0, max: 0 },
    MSD: { earned: 0, max: 0 },
    OHS: { earned: 0, max: 0 },
    LOCAL_CONTENT: { earned: 0, max: 0 }
  };

  const operationalGaps: DiagnosticAssessmentResult['operationalGaps'] = [];
  const missingStatutoryAppointments: string[] = [];
  const liabilityRisks: string[] = [];

  ZAMBIAN_15_POINT_DIAGNOSTIC_QUESTIONS.forEach(q => {
    const rawScore = answers[q.id] !== undefined ? answers[q.id] : 0;
    const maxScore = 10;
    const earnedWeight = (rawScore / maxScore) * q.weight;
    const maxWeight = q.weight;

    totalWeightedScore += earnedWeight;
    totalMaxWeight += maxWeight;

    categoryTotals[q.category].earned += earnedWeight;
    categoryTotals[q.category].max += maxWeight;

    if (rawScore < 10) {
      const selectedOption = q.options.find(o => o.score === rawScore) || q.options[q.options.length - 1];
      operationalGaps.push({
        questionId: q.id,
        category: q.categoryLabel,
        issue: q.question,
        remediationAction: selectedOption.riskNote || 'Align operating procedures with statutory MSR / ZEMA mandates.'
      });

      // Track missing appointments
      if (q.id === 'ZM-DIAG-05' && rawScore < 10) {
        missingStatutoryAppointments.push('MSD Statutory Certificate of Competency (Form MSD-08 Mine Captain)');
        missingStatutoryAppointments.push('MSD Blaster License (Form MSD-14)');
        missingStatutoryAppointments.push('Engineering Institution of Zambia (EIZ) Registered Engineer');
      }

      // Track critical liabilities
      if (q.id === 'ZM-DIAG-01' && rawScore === 0) {
        liabilityRisks.push('CRITICAL: ZEMA SI 112 Effluent Discharge Violation (River Weir Gate Shutoff & Heavy Environmental Penalties)');
      }
      if (q.id === 'ZM-DIAG-06' && rawScore === 0) {
        liabilityRisks.push('CRITICAL: MSD Section 54 Ventilation Stoppage Order (Air Velocity < 0.30 m/s or Elevated CH4)');
      }
      if (q.id === 'ZM-DIAG-07' && rawScore === 0) {
        liabilityRisks.push('HIGH: MSD Section 55 Defective Ground Support Notice (Unsupported advance > 2.0m)');
      }
      if (q.id === 'ZM-DIAG-09' && rawScore === 0) {
        liabilityRisks.push('HIGH: MBOD Silicosis Surveillance Breach (Uncertified workers exposed to subterranean silica dust)');
      }
      if (q.id === 'ZM-DIAG-13' && rawScore === 0) {
        liabilityRisks.push('COMMERCIAL: Lockout from Tier-1 Mining Supply Chain Tenders (Non-Compliant Citizen Equity Ratio)');
      }
    }
  });

  const overallScore = totalMaxWeight > 0 ? Math.round((totalWeightedScore / totalMaxWeight) * 100) : 0;

  const categoryScores = {
    ZEMA: categoryTotals.ZEMA.max > 0 ? Math.round((categoryTotals.ZEMA.earned / categoryTotals.ZEMA.max) * 100) : 0,
    MSD: categoryTotals.MSD.max > 0 ? Math.round((categoryTotals.MSD.earned / categoryTotals.MSD.max) * 100) : 0,
    OHS: categoryTotals.OHS.max > 0 ? Math.round((categoryTotals.OHS.earned / categoryTotals.OHS.max) * 100) : 0,
    LOCAL_CONTENT: categoryTotals.LOCAL_CONTENT.max > 0 ? Math.round((categoryTotals.LOCAL_CONTENT.earned / categoryTotals.LOCAL_CONTENT.max) * 100) : 0
  };

  let riskTier: DiagnosticAssessmentResult['riskTier'] = 'CRITICAL_RISK';
  let riskLabel = 'Critical Stoppage & Statutory Liability Risk';

  if (overallScore >= 90) {
    riskTier = 'TIER1_APPROVED';
    riskLabel = 'Tier-1 Mining House Preferred Standing';
  } else if (overallScore >= 75) {
    riskTier = 'HIGH_READINESS';
    riskLabel = 'High Readiness - Minor Statutory Remediation';
  } else if (overallScore >= 50) {
    riskTier = 'MODERATE_RISK';
    riskLabel = 'Moderate Liability Risk - Missing Appointments & Credentials';
  }

  return {
    overallScore,
    riskTier,
    riskLabel,
    categoryScores,
    operationalGaps,
    missingStatutoryAppointments,
    liabilityRisks,
    recommendedBinderType: overallScore >= 75 
      ? 'MeloTwo 20-Section Zambian Mining Tender Safety File (Audited Fast-Track Edition)'
      : 'MeloTwo Zambian Emergency Remediation & Statutory Appointment Dossier'
  };
}

/**
 * Standard Zambian MHS Audit Score (for subterranean and effluent panels)
 */
export function calculateZambianMhsAuditScore(
  checklistResults: Record<string, 'PASS' | 'FLAGGED' | 'CRITICAL_FAIL'>,
  effluentResults: Record<string, { observed: number; limit: number; breached: boolean }>
): {
  overallScore: number;
  isAuditReady: boolean;
  criticalBreachesCount: number;
  warningBreachesCount: number;
  recommendations: string[];
} {
  let score = 100;
  let criticalBreachesCount = 0;
  let warningBreachesCount = 0;
  const recommendations: string[] = [];

  // Evaluate subterranean checklist items
  Object.entries(checklistResults).forEach(([id, status]) => {
    const item = ZAMBIAN_MHS_COMPLIANCE_MODULE.subterraneanChecklist.find(c => c.id === id);
    const label = item ? item.title : id;

    if (status === 'CRITICAL_FAIL') {
      score -= 20;
      criticalBreachesCount++;
      recommendations.push(`CRITICAL STOPPAGE: Immediate intervention required for ${label} (${item?.statutoryRegulation || 'MSR'}). ${item?.correctiveAction || ''}`);
    } else if (status === 'FLAGGED') {
      score -= 8;
      warningBreachesCount++;
      recommendations.push(`WARNING: Corrective maintenance advised for ${label}. ${item?.correctiveAction || ''}`);
    }
  });

  // Evaluate ZEMA effluent limits
  Object.entries(effluentResults).forEach(([paramId, res]) => {
    if (res.breached) {
      const zemaParam = ZAMBIAN_MHS_COMPLIANCE_MODULE.zemaEffluentDischargeLimits.find(p => p.parameterId === paramId);
      score -= 15;
      criticalBreachesCount++;
      recommendations.push(`ZEMA DISCHARGE BREACH: ${zemaParam?.parameterName || paramId} registered ${res.observed}, exceeding statutory limit of ${zemaParam?.statutoryLimit || res.limit} ${zemaParam?.unit || ''}. Execute: ${zemaParam?.neutralizationMethod || 'Neutralize stream'}.`);
    }
  });

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const isAuditReady = clampedScore >= 95 && criticalBreachesCount === 0;

  return {
    overallScore: clampedScore,
    isAuditReady,
    criticalBreachesCount,
    warningBreachesCount,
    recommendations
  };
}

export default ZAMBIAN_MHS_COMPLIANCE_MODULE;
