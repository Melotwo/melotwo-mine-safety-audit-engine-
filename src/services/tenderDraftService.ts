import {
  TenderSafetyFileDraftState,
  ConsumableTrackingState,
  AccessAndBlastingState,
  DrillingTelemetryState,
  WearSimulationState,
  ComponentWearMetric,
  ContractorTierId,
  CONTRACTOR_TIERS,
  TENDER_ADDONS
} from '../types/tenderTypes';

export const TENDER_DRAFT_STORAGE_KEY = 'melotwo_tender_file_draft';
export const TENDER_PAID_UNLOCKED_KEY = 'melotwo_tender_paid_unlocked';
export const TENDER_PAID_TIER_KEY = 'melotwo_tender_paid_tier';
export const TENDER_PAID_ADDONS_KEY = 'melotwo_tender_paid_addons';

export const DEFAULT_CONSUMABLES: ConsumableTrackingState = {
  oxygenSystem: {
    supplier: 'Afrox Industrial Gases SA (SABS 1499)',
    purityGrade: '99.5% Subterranean Cryogenic Oxygen',
    manifoldPressureBar: 14.5,
    hydrostaticTestExpiry: '2027-08-30',
    dualShutoffValveChecked: true,
    status: 'COMPLIANT'
  },
  gasInfrastructure: {
    systemType: 'Nitrogen Inerting & Methane Gas Dilution Reticulation',
    cylinderBankCertNumber: 'CYL-BANK-2026-AFX-994',
    reticulationPressureBar: 8.2,
    leakDetectorCalibratedUntil: '2027-02-15',
    ventilationDilutionVerified: true,
    status: 'COMPLIANT'
  },
  hydraulicReagents: {
    fluidGrade: 'ISO VG 68 Fire-Resistant Water-Glycol Hydraulic Fluid',
    bundingSANS10089Compliant: true,
    sdsAvailableOnSite: true,
    spillKitInspectionDate: '2026-09-15',
    batchNumber: 'LOT-CHEM-2026-881'
  }
};

export const DEFAULT_ACCESS_BLASTING: AccessAndBlastingState = {
  headcount: {
    shiftCode: 'DAY-SHIFT-06:00',
    inStopeCrew: 48,
    shaftTransitCrew: 12,
    surfaceStandbyCrew: 6,
    tagReconciliationConfirmed: true
  },
  blastingClearance: {
    stopeHeading: 'Stope 34B Advance West / Sub-level 12',
    detonationWindow: '15:45 - 16:15 SAST',
    exclusionRadiusMeters: 800,
    gasThresholds: {
      carbonMonoxidePpm: 12,
      nitrogenOxidePpm: 1.2,
      flammableGasPct: 0.04
    },
    sentryGuardsCount: 4,
    blastingMasterLicense: 'BM-7749-KITWE / MSR Reg 912',
    preDetonationProtocolSigned: true,
    clearanceStatus: 'CLEAR_TO_BLAST'
  }
};

export const DEFAULT_DRILLING: DrillingTelemetryState = {
  coreRigId: 'RIG-CORE-04 (Atlas Copco CS14 Deep Stope)',
  targetBoreholeId: 'BH-KONKOLA-802W (Exploration Horizon)',
  fluidReturnFlowLpm: 145,
  pumpPressureBar: 42,
  downholeMudTempC: 38.5,
  drillStringTorqueNm: 320,
  vibrationRmsMmSec: 2.1,
  boreholeRiskStratum: 'Nominal Basalt',
  telemetryStreamActive: true,
  sensorCalibrationValidUntil: '2027-03-31'
};

export const DEFAULT_WEAR_SIMULATION: WearSimulationState = {
  dutyCyclesHours: 480,
  quartzParticulatePpm: 420,
  ambientTemperatureC: 34,
  chemicalHydrolysisStress: 'MEDIUM',
  lastSimulationRun: new Date().toISOString(),
  monitoredComponents: [
    {
      id: 'harness_01',
      name: 'Full-Body Fall Arrest Webbing',
      category: 'PPE',
      standardRef: 'SANS 50361 / EN 361',
      runningHours: 480,
      wearPercentage: 28,
      healthScore: 72,
      projectedFailureDays: 142,
      discardThreshold: 'Fiber fraying > 1.5mm or UV embrittlement',
      status: 'OPTIMAL'
    },
    {
      id: 'boots_02',
      name: 'Heavy Nitrile Metatarsal Boots',
      category: 'PPE',
      standardRef: 'SANS 20345 / Acid Resistant',
      runningHours: 480,
      wearPercentage: 35,
      healthScore: 65,
      projectedFailureDays: 110,
      discardThreshold: 'Tread depth < 4.0mm or sole acid delamination',
      status: 'OPTIMAL'
    },
    {
      id: 'respirator_03',
      name: 'Half-Mask Particulate P3 Filter Core',
      category: 'PPE',
      standardRef: 'SANS 50143 / DMRE Silicosis Spec',
      runningHours: 480,
      wearPercentage: 58,
      healthScore: 42,
      projectedFailureDays: 28,
      discardThreshold: 'Delta-P resistance > 250 Pa or particulate saturation',
      status: 'MODERATE_WEAR',
      gapAlert: 'Replace P3 filters within 28 operational shifts to prevent silicosis inhalation non-compliance.'
    },
    {
      id: 'winch_rope_04',
      name: 'Subterranean Scraper Winch Steel Wire Rope',
      category: 'RIGGING',
      standardRef: 'SANS 10375 / DMR 18 Wire Rope Standard',
      runningHours: 480,
      wearPercentage: 44,
      healthScore: 56,
      projectedFailureDays: 78,
      discardThreshold: 'Broken wires > 10% in one lay length or 8% diameter loss',
      status: 'OPTIMAL'
    },
    {
      id: 'drill_bit_05',
      name: 'Tungsten Carbide Core Drill Bit (NX Crown)',
      category: 'CUTTING_TOOLS',
      standardRef: 'ISO 10097 Diamond Core Drilling Spec',
      runningHours: 480,
      wearPercentage: 62,
      healthScore: 38,
      projectedFailureDays: 18,
      discardThreshold: 'Carbide button gauge loss > 2.0mm',
      status: 'MODERATE_WEAR',
      gapAlert: 'Bit crown wear at 62%. Schedule bit swap to maintain penetrative core extraction rate.'
    }
  ]
};

export const INITIAL_TENDER_DRAFT: TenderSafetyFileDraftState = {
  version: 2,
  lastSavedAt: new Date().toISOString(),
  selectedTier: 'tier_contractor_pay_per_file',
  customTierPriceZar: 2500,
  selectedAddOns: [],
  diagnosticProgress: { overallScore: 84, riskTier: 'LOW', recommendedBinderType: 'Standard Trade Safety Dossier' },
  diagnosticScore: 84,
  totalAmountZar: 2500,
  currentStep: 1,
  profile: {
    fullName: 'David Khumalo',
    companyName: 'Apex Trade & Civils (Pty) Ltd',
    tradingName: 'Apex Contractors',
    contactPhone: '+27 11 000 0000',
    contactEmail: 'safety@apexcontractors.co.za',
    physicalAddress: '14 Industrial Road, Jet Park, Boksburg, 1459',
    cipcRegNumber: '2021/847291/07',
    coidNumber: '990001248573',
    sarsPin: '9482716301',
    projectTenderName: 'Tender No. PR-2026/088: Site Subcontract & Maintenance Facility',
    clientPrincipalName: 'Anglo Operations / Municipal Infrastructure Unit'
  },
  docUploads: {
    coid: { name: 'COID Letter of Good Standing', uploaded: true, fileName: 'Apex_COID_Valid_2026.pdf', size: '342 KB' },
    sars: { name: 'Tax Compliance Status (PIN Certificate)', uploaded: true, fileName: 'SARS_TCS_PIN_Apex.pdf', size: '180 KB' },
    cipc: { name: 'CIPC Company Registration (COR14.3)', uploaded: true, fileName: 'COR14.3_2021_847291.pdf', size: '512 KB' },
    insurance: { name: 'Public Liability Insurance (R5m+)', uploaded: false }
  },
  selectedTrades: ['building_renovation', 'painting_decorating'],
  staff: {
    ceoSupervisorName: 'David Khumalo (OHS 16.2 Appointee)',
    ceoSupervisorId: '840612 5182 084',
    constructionManagerName: 'David Khumalo (CR 8.1 Manager)',
    assistantManagerName: 'Thabo Mokoena (CR 8.2 Assistant)',
    firstAiderName: 'Thabo Mokoena (Level 2 Certified)',
    firstAiderExpiry: '2027-11-30',
    fireMarshalName: 'Sipho Sithole (Appointed Marshall)',
    safetyRepName: 'Lerato Ndlovu (SHE Rep Sec 17)',
    riskAssessorName: 'David Khumalo (HIRA Qualified)',
    incidentInvestigatorName: 'David Khumalo (GAR 9)'
  },
  consumables: DEFAULT_CONSUMABLES,
  accessBlasting: DEFAULT_ACCESS_BLASTING,
  drilling: DEFAULT_DRILLING,
  wearSimulation: DEFAULT_WEAR_SIMULATION,
  resolvedRedFlags: [],
  customNotes: 'Compiled in strict accordance with SANS 10119 and SACPCMP Guidelines.',
  isPaidUnlocked: false,
  verificationCode: `MT-TDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
};

/**
 * Calculate total amount based on tier, custom tier price, and selected add-ons
 */
export function calculateDraftTotalAmount(
  tierId: ContractorTierId,
  customPrice?: number,
  addOnIds: string[] = []
): number {
  const tier = CONTRACTOR_TIERS.find(t => t.id === tierId) || CONTRACTOR_TIERS[0];
  const basePrice = typeof customPrice === 'number' && customPrice >= tier.basePriceZar && customPrice <= tier.maxPriceZar
    ? customPrice
    : tier.defaultPriceZar;
  
  const addOnsSum = addOnIds.reduce((sum, id) => {
    const addon = TENDER_ADDONS.find(a => a.id === id);
    return sum + (addon ? addon.priceZar : 0);
  }, 0);

  return basePrice + addOnsSum;
}

/**
 * Load draft state from localStorage with safe fallback
 */
export function loadTenderDraft(): TenderSafetyFileDraftState {
  if (typeof localStorage === 'undefined') {
    return INITIAL_TENDER_DRAFT;
  }

  try {
    const raw = localStorage.getItem(TENDER_DRAFT_STORAGE_KEY);
    const paidUnlocked = localStorage.getItem(TENDER_PAID_UNLOCKED_KEY) === 'true';
    const rawPaidTier = localStorage.getItem(TENDER_PAID_TIER_KEY) as ContractorTierId;
    const rawPaidAddOns = localStorage.getItem(TENDER_PAID_ADDONS_KEY);
    const storedAddOns: string[] = rawPaidAddOns ? JSON.parse(rawPaidAddOns) : [];

    let paidTier: ContractorTierId = rawPaidTier || 'tier_contractor_pay_per_file';
    if (paidTier === 'tier_base' || paidTier === 'tier_standard') {
      paidTier = 'tier_contractor_pay_per_file';
    } else if (paidTier === 'tier_enterprise') {
      paidTier = 'tier_enterprise_site_license';
    }

    if (!raw) {
      return {
        ...INITIAL_TENDER_DRAFT,
        isPaidUnlocked: paidUnlocked,
        selectedTier: paidTier,
        selectedAddOns: storedAddOns,
        totalAmountZar: calculateDraftTotalAmount(paidTier, INITIAL_TENDER_DRAFT.customTierPriceZar, storedAddOns)
      };
    }

    const parsed = JSON.parse(raw);
    
    // Normalize tier backwards-compatibility
    let selectedTier: ContractorTierId = parsed.selectedTier || paidTier || 'tier_contractor_pay_per_file';
    if (selectedTier === 'tier_base' || selectedTier === 'tier_standard') {
      selectedTier = 'tier_contractor_pay_per_file';
    } else if (selectedTier === 'tier_enterprise') {
      selectedTier = 'tier_enterprise_site_license';
    }

    const selectedAddOns: string[] = Array.isArray(parsed.selectedAddOns) 
      ? parsed.selectedAddOns 
      : storedAddOns;
    
    const activeTierObj = CONTRACTOR_TIERS.find(t => t.id === selectedTier) || CONTRACTOR_TIERS[0];
    const customTierPriceZar = typeof parsed.customTierPriceZar === 'number'
      ? parsed.customTierPriceZar
      : activeTierObj.defaultPriceZar;

    const totalAmountZar = calculateDraftTotalAmount(selectedTier, customTierPriceZar, selectedAddOns);

    return {
      ...INITIAL_TENDER_DRAFT,
      ...parsed,
      selectedTier,
      customTierPriceZar,
      selectedAddOns,
      totalAmountZar,
      // Deep merge modules to ensure new fields are populated cleanly
      consumables: {
        ...DEFAULT_CONSUMABLES,
        ...(parsed.consumables || {})
      },
      accessBlasting: {
        ...DEFAULT_ACCESS_BLASTING,
        ...(parsed.accessBlasting || {})
      },
      drilling: {
        ...DEFAULT_DRILLING,
        ...(parsed.drilling || {})
      },
      wearSimulation: {
        ...DEFAULT_WEAR_SIMULATION,
        ...(parsed.wearSimulation || {})
      },
      isPaidUnlocked: paidUnlocked || parsed.isPaidUnlocked || false
    };
  } catch (err) {
    console.warn('[TenderDraftService] Error parsing draft from localStorage:', err);
    return INITIAL_TENDER_DRAFT;
  }
}

/**
 * Save current draft state to localStorage
 */
export function saveTenderDraft(draft: Partial<TenderSafetyFileDraftState>): TenderSafetyFileDraftState {
  if (typeof localStorage === 'undefined') {
    return { ...INITIAL_TENDER_DRAFT, ...draft, lastSavedAt: new Date().toISOString() };
  }

  try {
    const existing = loadTenderDraft();
    const updated: TenderSafetyFileDraftState = {
      ...existing,
      ...draft,
      lastSavedAt: new Date().toISOString()
    };

    localStorage.setItem(TENDER_DRAFT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[TenderDraftService] Error saving draft to localStorage:', err);
    return { ...INITIAL_TENDER_DRAFT, ...draft };
  }
}

/**
 * Reset / Clear draft back to defaults
 */
export function clearTenderDraft(): TenderSafetyFileDraftState {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(TENDER_DRAFT_STORAGE_KEY);
  }
  return INITIAL_TENDER_DRAFT;
}

/**
 * Check if the user has unlocked the file
 */
export function checkIfTenderPaidUnlocked(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return (
    localStorage.getItem(TENDER_PAID_UNLOCKED_KEY) === 'true' ||
    localStorage.getItem('melotwo_vip_unlocked') === 'true' ||
    localStorage.getItem('sans_vip_unlocked') === 'true'
  );
}

/**
 * Mark safety file as paid and unlocked with tier and add-ons
 */
export function markTenderPaidUnlocked(
  tier: ContractorTierId = 'tier_contractor_pay_per_file',
  addOns: string[] = []
): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(TENDER_PAID_UNLOCKED_KEY, 'true');
    localStorage.setItem(TENDER_PAID_TIER_KEY, tier);
    localStorage.setItem(TENDER_PAID_ADDONS_KEY, JSON.stringify(addOns));
    localStorage.setItem('melotwo_vip_unlocked', 'true');
    localStorage.setItem('sans_trial_active', 'true');
  }
}

/**
 * Dynamic physics recalculation of component wear based on operational parameters
 */
export function calculatePhysicsWear(
  runningHours: number,
  particulatePpm: number,
  ambientTempC: number,
  hydrolysisStress: 'LOW' | 'MEDIUM' | 'HIGH'
): ComponentWearMetric[] {
  // Base acceleration factors
  const dustFactor = Math.max(0.6, particulatePpm / 350);
  const tempFactor = ambientTempC > 30 ? 1 + ((ambientTempC - 30) * 0.04) : 1;
  const chemFactor = hydrolysisStress === 'HIGH' ? 1.6 : hydrolysisStress === 'MEDIUM' ? 1.2 : 0.9;
  const hoursFactor = Math.max(0.5, runningHours / 400);

  return DEFAULT_WEAR_SIMULATION.monitoredComponents.map(comp => {
    let specificMultiplier = 1.0;
    if (comp.category === 'PPE') specificMultiplier = dustFactor * chemFactor;
    if (comp.category === 'RIGGING') specificMultiplier = tempFactor * chemFactor;
    if (comp.category === 'CUTTING_TOOLS') specificMultiplier = dustFactor * tempFactor * 1.2;

    const calculatedWear = Math.min(98, Math.max(5, Math.round(comp.wearPercentage * hoursFactor * specificMultiplier * 0.9)));
    const healthScore = Math.max(2, 100 - calculatedWear);
    const projectedFailureDays = Math.max(3, Math.round((healthScore / (calculatedWear / 30)) * 10));

    let status: 'OPTIMAL' | 'MODERATE_WEAR' | 'REPLACE_IMMEDIATELY' = 'OPTIMAL';
    let gapAlert: string | undefined = undefined;

    if (calculatedWear >= 75) {
      status = 'REPLACE_IMMEDIATELY';
      gapAlert = `CRITICAL COMPLIANCE GAP: ${comp.name} wear at ${calculatedWear}% exceeds statutory discard criteria under ${comp.standardRef}. Immediate replacement required before next shift.`;
    } else if (calculatedWear >= 50) {
      status = 'MODERATE_WEAR';
      gapAlert = `PREVENTIVE ALERT: ${comp.name} wear at ${calculatedWear}%. Projected remaining service life: ${projectedFailureDays} days.`;
    }

    return {
      ...comp,
      runningHours,
      wearPercentage: calculatedWear,
      healthScore,
      projectedFailureDays,
      status,
      gapAlert
    };
  });
}
