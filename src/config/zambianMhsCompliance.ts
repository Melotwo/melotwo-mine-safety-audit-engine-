/**
 * Zambian Mine Health & Safety (MHS) Compliance Module
 * 
 * Specifically configured for:
 * 1. MSD / Mining Regulations (MSR) Subterranean Hazard Checklists (Parts IX, X, XII, XIV)
 * 2. ZEMA SI 112 Aquatic Environmental Effluent & Tailings Decant Discharge Limits
 * 3. Mines and Minerals Development Act (MMDA) & OHS Statutory Enforcement
 * 4. Integration interfaces into MeloTwo Regulatory Shift Feed & Audit Engines
 */

export interface MhsChecklistItem {
  id: string;
  code: string;
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
    'Workers Compensation Act No. 10 of 1999'
  ],
  subterraneanChecklist: [
    {
      id: 'ZM-MHS-SUB-01',
      code: 'MSR-VENT-1404',
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
      category: 'STRATA_GROUND_SUPPORT',
      title: 'Underground Geotechnical Ground Support & Rock Bolt Anchorage',
      statutoryRegulation: 'Mining Regulations (MSR) Part X, Regulation 1008',
      hazardRisk: 'Fall of ground (FOG), catastrophic rockburst, roof collapse during excavation.',
      criticalThreshold: 'Hydraulic pull test >= 80 kN; Maximum unsupported advance span <= 2.0m; Mesh overlap >= 100mm',
      inspectionFrequency: 'DAILY',
      passCriteria: '100% of tested resin/friction bolts hold >= 80 kN tensile pull load; zero visual roof sag.',
      stoppageTrigger: 'Pull test failure < 80 kN or unsupported face exceeding 2.0m immediately halts mining.',
      correctiveAction: 'Install immediate temporary hydraulic props, install spin-to-stall mechanical anchors, and apply wire mesh.'
    },
    {
      id: 'ZM-MHS-SUB-05',
      code: 'MSR-ELEC-1202',
      category: 'ELECTRICAL_FLAMEPROOF',
      title: 'Subterranean Substation Flameproof Enclosures (Ex-d) & Neutral Grounding',
      statutoryRegulation: 'Mining Regulations (MSR) Part XII & SANS 10142-1 Mining Annex',
      hazardRisk: 'Subterranean arc flash explosion, secondary methane ignition, fatal electric shock (3.3kV / 550V).',
      criticalThreshold: 'NGR Resistance <= 10 Ohms; Earth leakage trip <= 100 ms at 300 mA; Enclosure gap <= 0.4mm',
      inspectionFrequency: 'WEEKLY',
      passCriteria: 'Earth continuity certified <= 10 Ohms, flameproof enclosure bolts torqued to specification, zero missing bolts.',
      stoppageTrigger: 'Broken flameproof seal, unbolted Ex-d cover, or NGR continuity failure locks out feeder breaker.',
      correctiveAction: 'De-energize circuit, verify zero energy state (LOTO), replace stripped bolt fasteners, re-test relay.'
    },
    {
      id: 'ZM-MHS-SUB-06',
      code: 'MSR-BLAST-912',
      category: 'EXPLOSIVES_REENTRY',
      title: 'Blast Fume Re-entry Interval & Nitrogen Dioxide (NO2) Clearance',
      statutoryRegulation: 'Mining Regulations (MSR) Part IX, Regulation 912',
      hazardRisk: 'Nitrous fume inhalation, acute pulmonary edema, unexploded misfire detonation.',
      criticalThreshold: 'Minimum 30-minute re-entry lockout; NO2 <= 3.0 ppm permissible limit',
      inspectionFrequency: 'EVERY_SHIFT',
      passCriteria: 'Shift blaster logs 30-minute minimum wait, visual misfire inspection logged, NO2 <= 1.0 ppm.',
      stoppageTrigger: 'Entry prior to 30 minutes or presence of visible reddish-brown NO2 fumes prompts immediate blast zone evacuation.',
      correctiveAction: 'Seal blast zone, operate auxiliary ventilation for additional 30 minutes, wash down muck pile with water.'
    },
    {
      id: 'ZM-MHS-SUB-07',
      code: 'MSR-REFUGE-1415',
      category: 'REFUGE_EMERGENCY',
      title: 'Subterranean Fresh Air Refuge Chamber Autonomy & Airlock Integrity',
      statutoryRegulation: 'Mining Regulations (MSR) Emergency Directives & Part XIV',
      hazardRisk: 'Trapped underground personnel asphyxiation during mine fire or shaft obstruction.',
      criticalThreshold: '>= 36 hours continuous breathable oxygen supply; Positive airlock pressure >= +100 Pa',
      inspectionFrequency: 'WEEKLY',
      passCriteria: 'Oxygen cylinders at 200 bar, soda-lime CO2 scrubber active, communication link to surface operational.',
      stoppageTrigger: 'Oxygen reserves < 36 hours or inoperative communication link halts operations within that sector.',
      correctiveAction: 'Replenish reserve oxygen banks, restock emergency rations/potable water, and test battery backup inverter.'
    }
  ],
  zemaEffluentDischargeLimits: [
    {
      parameterId: 'ZEMA-EFF-PH',
      parameterName: 'Industrial Effluent pH Range',
      chemicalSymbol: 'pH',
      statutoryLimit: '6.5 - 9.0',
      unit: 'pH units',
      standardReference: 'ZEMA SI 112 of 2013, Third Schedule',
      targetWaterBody: 'Kafue River Basin / Receiving Drainage Waterways',
      consequenceOfBreach: 'Acid mine drainage (AMD) formation, heavy metal leaching, statutory stop-order and fine.',
      neutralizationMethod: 'Automated hydration lime (Ca(OH)2) slurry dosing into neutralizing retention chamber.'
    },
    {
      parameterId: 'ZEMA-EFF-CU',
      parameterName: 'Total Dissolved Copper',
      chemicalSymbol: 'Cu',
      statutoryLimit: '<= 1.0',
      unit: 'mg/L',
      standardReference: 'ZEMA SI 112 Third Schedule (Effluent Standards)',
      targetWaterBody: 'Municipal streams & natural waterways',
      consequenceOfBreach: 'Aquatic toxicity, heavy metal accumulation in fishery systems, revocation of discharge license.',
      neutralizationMethod: 'Secondary sulfide or hydroxide precipitation followed by polymer flocculation and clarifier settling.'
    },
    {
      parameterId: 'ZEMA-EFF-TSS',
      parameterName: 'Total Suspended Solids',
      chemicalSymbol: 'TSS',
      statutoryLimit: '<= 100.0',
      unit: 'mg/L',
      standardReference: 'ZEMA SI 112 Effluent Standards Table 1',
      targetWaterBody: 'Surface drainage canals & river crossings',
      consequenceOfBreach: 'Siltation of downstream riverbeds, sunlight blockage, aquatic ecosystem destruction.',
      neutralizationMethod: 'Enhanced anionic flocculant dosing into clarifier thickener overflows and multi-stage polishing ponds.'
    },
    {
      parameterId: 'ZEMA-EFF-CO',
      parameterName: 'Total Dissolved Cobalt',
      chemicalSymbol: 'Co',
      statutoryLimit: '<= 1.0',
      unit: 'mg/L',
      standardReference: 'ZEMA SI 112 Third Schedule Table 2',
      targetWaterBody: 'Kafue River Tributaries',
      consequenceOfBreach: 'Carcinogenic heavy metal bioaccumulation, high-tier statutory penalty notice from ZEMA Ndola.',
      neutralizationMethod: 'High pH precipitation (pH >= 9.5) followed by secondary acid trim back to permissible 8.5 range.'
    },
    {
      parameterId: 'ZEMA-EFF-CN',
      parameterName: 'Weak Acid Dissociable (WAD) Cyanide',
      chemicalSymbol: 'CN (WAD)',
      statutoryLimit: '<= 0.2',
      unit: 'mg/L',
      standardReference: 'ZEMA Hazardous Effluent Schedule / Mining Code',
      targetWaterBody: 'TSF Decant return waterways & polishing ponds',
      consequenceOfBreach: 'Immediate lethal toxicity to wildlife and livestock, criminal prosecution under EPPCA Act.',
      neutralizationMethod: 'Caro\'s acid (H2SO5) or SO2/Air oxidation detox circuit prior to return water transfer.'
    },
    {
      parameterId: 'ZEMA-TSF-FREEBOARD',
      parameterName: 'Tailings Dam Dry Freeboard Margin',
      statutoryLimit: '>= 1.50',
      unit: 'meters',
      standardReference: 'ZEMA Code of Practice for Tailings Storage Facility Safety',
      targetWaterBody: 'TSF Embankment Crest & Piezometer Array',
      consequenceOfBreach: 'Catastrophic dam crest overtopping, tailings slurry breach, regional flooding.',
      neutralizationMethod: 'Activate emergency perimeter decant barge pumps; lower pool elevation to designated return pond.'
    },
    {
      parameterId: 'ZEMA-TSF-FOS',
      parameterName: 'Tailings Storage Facility Slope Factor of Safety',
      statutoryLimit: '>= 1.50',
      unit: 'ratio (static FOS)',
      standardReference: 'ZEMA & MSD Tailings Engineering Guidelines',
      targetWaterBody: 'Downstream dam slope & foundation toe',
      consequenceOfBreach: 'Structural slope failure, liquefaction risk during seismic or rainfall surge.',
      neutralizationMethod: 'Install buttressing rockfill toe berms, relieve pore pressure via vibrating wire piezometers.'
    }
  ],
  stoppageClauses: [
    {
      msdSectionNotice: 'MSR Part XIV / Section 54 Equivalent Notice',
      description: 'Issued by the Chief Inspector of Mines for imminent subterranean hazard (flammable gas, defective winding ropes, unventilated headings).',
      remedyPeriodHours: 24
    },
    {
      msdSectionNotice: 'ZEMA SI 112 Environmental Protection Order (EPO)',
      description: 'Issued for unpermitted tailings decant discharge or heavy metal aquatic pollution exceeding statutory parameters.',
      remedyPeriodHours: 12
    }
  ]
};

/**
 * Diagnostic score calculator for Zambian MHS & ZEMA audit state
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
