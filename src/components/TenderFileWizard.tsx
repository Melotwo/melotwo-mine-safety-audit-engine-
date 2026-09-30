import React, { useState, useEffect, useRef, useId } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Upload, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  HardHat, 
  Wrench, 
  Download, 
  AlertTriangle, 
  Info, 
  Users, 
  Check, 
  X, 
  Flame, 
  Zap, 
  Layers, 
  Lock, 
  ShieldAlert, 
  FolderCheck,
  Eye,
  CreditCard,
  Crown,
  Shield,
  QrCode,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Activity,
  Gauge,
  Droplets,
  RotateCcw,
  FileArchive
} from 'lucide-react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { 
  ContractorTierId, 
  CONTRACTOR_TIERS,
  ConsumableTrackingState,
  AccessAndBlastingState,
  DrillingTelemetryState,
  WearSimulationState,
  TenderSafetyFileDraftState
} from '../types/tenderTypes';
import { 
  loadTenderDraft, 
  saveTenderDraft, 
  clearTenderDraft, 
  checkIfTenderPaidUnlocked, 
  markTenderPaidUnlocked,
  calculatePhysicsWear,
  DEFAULT_CONSUMABLES,
  DEFAULT_ACCESS_BLASTING,
  DEFAULT_DRILLING,
  DEFAULT_WEAR_SIMULATION
} from '../services/tenderDraftService';
import { 
  createAuditLedgerVerificationRecord, 
  generateQrCodeDataUrl, 
  AuditVerificationRecord 
} from '../services/qrVerificationService';
import { PayPalEFTCheckoutModal } from './PayPalEFTCheckoutModal';
import { ComplianceProofViewer } from './ComplianceProofViewer';

export interface TradeOption {
  id: string;
  name: string;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  swps: Array<{ code: string; title: string; standard: string }>;
  methodStatements: string[];
}

export const AVAILABLE_TRADES: TradeOption[] = [
  {
    id: 'catering_haccp',
    name: 'Catering & Canteen Food Safety',
    category: 'SANS 10330 / HACCP Food Hygiene',
    riskLevel: 'High',
    icon: ShieldCheck,
    description: 'Mine mess halls, commercial kitchen food preparation, cold chain compliance, CCP sanitation, and grease trap handling.',
    swps: [
      { code: 'SWP-CAT-01', title: 'HACCP Critical Control Point Temperature Verification', standard: 'SANS 10330:2020 / Food Hygiene' },
      { code: 'SWP-CAT-02', title: 'Deep Fat Fryer & Commercial Burner Fire Prevention', standard: 'ER 9 / SANS 10105' },
      { code: 'SWP-CAT-03', title: 'Food Prep Surface Chemical Sanitization & Waste Handling', standard: 'SANS 10049 / HCAR' },
      { code: 'SWP-CAT-04', title: 'Walk-In Chiller Cold Chain & Shaft Meal Transport', standard: 'MHSA Food Protocol / DMR' }
    ],
    methodStatements: ['Commercial Kitchen Daily CCP Sanitization', 'Underground Shaft Food Pack Transport Protocol', 'Kitchen Fire Blanket & Wet Chemical Suppression']
  },
  {
    id: 'electrical_installation',
    name: 'Electrical Installation & Reticulation',
    category: 'SANS 10142 / Specialist Electrical',
    riskLevel: 'Critical',
    icon: Zap,
    description: 'LV/MV distribution boards, cable racking, generator hookups, substation maintenance, and COC pre-testing.',
    swps: [
      { code: 'SWP-EL-01', title: 'Lockout / Tagout (LOTO) & Zero Energy Proofing', standard: 'SANS 10142-1 / EIR 6' },
      { code: 'SWP-EL-02', title: 'Cable Trenching, Armoured Glanding & Earthing', standard: 'SANS 10200 / CR 24' },
      { code: 'SWP-EL-03', title: 'Earth Leakage Trip Testing & Pre-COC Checks', standard: 'Electrical Installation Regs 9' },
      { code: 'SWP-EL-04', title: 'Arc Flash Boundary Controls & 1000V Insulated Tooling', standard: 'OHS Act Section 8 / SANS 10108' }
    ],
    methodStatements: ['Main Low-Voltage Switchgear Replacement', 'Overhead Cable Tray Reticulation', 'Standby Diesel Generator Hookup']
  },
  {
    id: 'ppe_material_hygiene',
    name: 'PPE & Occupational Hygiene Auditing',
    category: 'SANS 10049 / Workplace Safety',
    riskLevel: 'Medium',
    icon: Shield,
    description: 'Respirator fit checks, personal protective equipment integrity, chemical splash zones, and wash station auditing.',
    swps: [
      { code: 'SWP-PPE-01', title: 'Occupational PPE Inspection & Material Degradation Protocol', standard: 'SANS 10049 / GSR 2' },
      { code: 'SWP-PPE-02', title: 'Respiratory Protective Equipment (RPE) Fit & Seal Check', standard: 'HCAR 2021 / DMR Guidelines' },
      { code: 'SWP-PPE-03', title: 'Emergency Eye Wash Station & Drench Shower Testing', standard: 'GSR 3 / OHS Act' },
      { code: 'SWP-PPE-04', title: 'Bio-Hazardous Waste Segregation & Sharps Disposal', standard: 'National Environmental Waste Act' }
    ],
    methodStatements: ['Daily PPE Issuance & Inspection Register', 'Chemical Drench Shower Monthly Pressure Verification', 'Contaminated PPE Decontamination Protocol']
  },
  {
    id: 'lifting_rigging',
    name: 'Lifting Operations & Rigging',
    category: 'SANS 10375 / DMR 18 Lifting Machinery',
    riskLevel: 'Critical',
    icon: HardHat,
    description: 'Overhead cranes, mobile crane lifting plans, wire rope sling inspections, spreader beams, and rigging tackle safety.',
    swps: [
      { code: 'SWP-LFT-01', title: 'Pre-Use Inspection of Slings, Shackles & Rigging Tackle', standard: 'Driven Machinery Regs 18 / SANS 10375' },
      { code: 'SWP-LFT-02', title: 'Tandem & Critical Crane Lift Plan Preparation', standard: 'CR 22 / DMR 18' },
      { code: 'SWP-LFT-03', title: 'Exclusion Zone Marshaling & Tag-Line Control', standard: 'GSR 2 / OHS Act' },
      { code: 'SWP-LFT-04', title: 'Overhead Crane Emergency Limit Switch Testing', standard: 'SANS 10375 / DMR 18' }
    ],
    methodStatements: ['Critical Heavy Equipment Dual Crane Lift Plan', 'Overhead Gantry Hoist Cable Inspection', 'Shackle & Webbing Sling Load Testing Verification']
  },
  {
    id: 'road_maintenance',
    name: 'Road Maintenance & Civils',
    category: 'Civil & Infrastructure',
    riskLevel: 'Medium',
    icon: Wrench,
    description: 'Pothole repairs, asphalt resurfacing, kerbing, stormwater channel clearing, and heavy plant marshaling.',
    swps: [
      { code: 'SWP-RD-01', title: 'Traffic Accommodation & Roadway Flagging Procedures', standard: 'SARTSM Vol 2 / CR 20' },
      { code: 'SWP-RD-02', title: 'Hot Bitumen & Asphalt Application Safety', standard: 'OHS Act Section 8 / SANS 4001' },
      { code: 'SWP-RD-03', title: 'Pneumatic Breaker & Jackhammer Operation', standard: 'Physical Agents Regs / Noise Regs' },
      { code: 'SWP-RD-04', title: 'Excavator & Tipper Truck Reversing Marshaling', standard: 'CR 23 / Construction Plant' }
    ],
    methodStatements: ['Roadway Asphalt Patching & Compaction', 'Stormwater Culvert Pre-Cast Installation', 'Road Traffic Accommodation Plan Execution']
  },
  {
    id: 'building_renovation',
    name: 'Building Maintenance & Painting',
    category: 'General Construction (CR 2014)',
    riskLevel: 'Low',
    icon: Layers,
    description: 'Internal plastering, roof sealing, epoxy floor coating, scaffolding access, and dry walling.',
    swps: [
      { code: 'SWP-BLD-01', title: 'Mobile Aluminum Tower Scaffolding Erection & Pre-Use Tagging', standard: 'SANS 10085-1 / CR 16' },
      { code: 'SWP-BLD-02', title: 'Hazardous Chemical Substances (HCS) Paint & Solvent Application', standard: 'HCAR 2021 / SANS 10234' },
      { code: 'SWP-BLD-03', title: 'Working at Heights & Full Body Harness Fall Arrest', standard: 'CR 10 / SANS 50361' },
      { code: 'SWP-BLD-04', title: 'Portable Electric Power Tool Pre-Use Inspection & Tagging', standard: 'EMR 9 / OHS Act 85' }
    ],
    methodStatements: ['External High-Level Facade Painting via Scaffolding', 'Industrial Concrete Floor Polyurethane Sealing', 'Ceiling & Partition Dry-Wall Installation']
  }
];

export interface TenderFileWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (pdfBlobUrl: string) => void;
  isStandalone?: boolean;
}

export const TenderFileWizard: React.FC<TenderFileWizardProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  isStandalone = false
}) => {
  // Load restored draft state from localStorage
  const [draftState, setDraftState] = useState<TenderSafetyFileDraftState>(() => loadTenderDraft());

  // Step and View Navigation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(draftState.currentStep || 1);
  const [step2SubTab, setStep2SubTab] = useState<'TRADES' | 'CONSUMABLES' | 'BLASTING' | 'DRILLING' | 'WEAR_PHYSICS'>('TRADES');
  const [activePreviewTab, setActivePreviewTab] = useState<'blueprint' | 'live_preview'>('live_preview');
  
  // Specific Form States
  const [selectedTier, setSelectedTier] = useState<ContractorTierId>(draftState.selectedTier || 'tier_standard');
  const [profile, setProfile] = useState(draftState.profile);
  const [docUploads, setDocUploads] = useState(draftState.docUploads);
  const [selectedTrades, setSelectedTrades] = useState<string[]>(draftState.selectedTrades);
  const [staff, setStaff] = useState(draftState.staff);
  const [consumables, setConsumables] = useState<ConsumableTrackingState>(draftState.consumables || DEFAULT_CONSUMABLES);
  const [accessBlasting, setAccessBlasting] = useState<AccessAndBlastingState>(draftState.accessBlasting || DEFAULT_ACCESS_BLASTING);
  const [drilling, setDrilling] = useState<DrillingTelemetryState>(draftState.drilling || DEFAULT_DRILLING);
  const [wearSimulation, setWearSimulation] = useState<WearSimulationState>(draftState.wearSimulation || DEFAULT_WEAR_SIMULATION);
  
  // Payment & Unlocking state
  const [isPaidUnlocked, setIsPaidUnlocked] = useState<boolean>(() => checkIfTenderPaidUnlocked() || draftState.isPaidUnlocked);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [showVerificationLedgerModal, setShowVerificationLedgerModal] = useState<boolean>(false);
  
  // Live Verification & QR Record
  const [verificationRecord, setVerificationRecord] = useState<AuditVerificationRecord | null>(null);
  const [liveQrDataUrl, setLiveQrDataUrl] = useState<string>('');
  
  // Auto-Save telemetry
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>(new Date().toLocaleTimeString());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGeneratedSuccess, setPdfGeneratedSuccess] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipGeneratedSuccess, setZipGeneratedSuccess] = useState(false);
  const autoSaveTimerRef = useRef<any>(null);

  // Initialize live verification QR code on mount
  useEffect(() => {
    const refCode = draftState.verificationCode || `MT-TDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    createAuditLedgerVerificationRecord({
      docType: '20-Section Mining Tender Safety File (The Red File)',
      reference: refCode,
      enterpriseName: profile.companyName,
      siteId: 'SITE-WIT-01',
      tier: selectedTier
    }).then(rec => {
      setVerificationRecord(rec);
      setLiveQrDataUrl(rec.qrDataUrl);
    }).catch(err => {
      console.warn('Could not generate initial verification record:', err);
    });
  }, []);

  // 1. Real-Time Auto-Save mechanism: Persists on every change to localStorage
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const updated = saveTenderDraft({
        currentStep,
        selectedTier,
        profile,
        docUploads,
        selectedTrades,
        staff,
        consumables,
        accessBlasting,
        drilling,
        wearSimulation,
        isPaidUnlocked
      });
      setLastAutoSaveTime(new Date().toLocaleTimeString());
    }, 400);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    currentStep,
    selectedTier,
    profile,
    docUploads,
    selectedTrades,
    staff,
    consumables,
    accessBlasting,
    drilling,
    wearSimulation,
    isPaidUnlocked
  ]);

  // Recalculate wear simulation physics when parameters change
  const handleRecalculateWear = (
    hours: number, 
    particulatePpm: number, 
    ambientTemp: number, 
    hydrolysis: 'LOW' | 'MEDIUM' | 'HIGH'
  ) => {
    const updatedComponents = calculatePhysicsWear(hours, particulatePpm, ambientTemp, hydrolysis);
    setWearSimulation(prev => ({
      ...prev,
      dutyCyclesHours: hours,
      quartzParticulatePpm: particulatePpm,
      ambientTemperatureC: ambientTemp,
      chemicalHydrolysisStress: hydrolysis,
      monitoredComponents: updatedComponents,
      lastSimulationRun: new Date().toISOString()
    }));
  };

  // Reset draft handler
  const handleResetDraft = () => {
    if (window.confirm('Reset all Tender Safety File inputs to fresh defaults?')) {
      const reset = clearTenderDraft();
      setProfile(reset.profile);
      setDocUploads(reset.docUploads);
      setSelectedTrades(reset.selectedTrades);
      setStaff(reset.staff);
      setConsumables(DEFAULT_CONSUMABLES);
      setAccessBlasting(DEFAULT_ACCESS_BLASTING);
      setDrilling(DEFAULT_DRILLING);
      setWearSimulation(DEFAULT_WEAR_SIMULATION);
      setSelectedTier('tier_standard');
      setCurrentStep(1);
    }
  };

  // Toggle Trade selection
  const toggleTrade = (tradeId: string) => {
    setSelectedTrades(prev => 
      prev.includes(tradeId)
        ? (prev.length > 1 ? prev.filter(id => id !== tradeId) : prev)
        : [...prev, tradeId]
    );
  };

  // Simulated upload handler
  const handleSimulatedUpload = (key: string) => {
    setDocUploads(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        uploaded: true,
        fileName: `${profile.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${key.toUpperCase()}_Verified.pdf`,
        size: `${Math.floor(Math.random() * 400 + 150)} KB`
      }
    }));
  };

  // Quick autofill supervisor
  const handleAutofillSupervisor = () => {
    setStaff(prev => ({
      ...prev,
      ceoSupervisorName: `${profile.fullName} (16.2 Appointee)`,
      constructionManagerName: `${profile.fullName} (CR 8.1 Manager)`,
      riskAssessorName: `${profile.fullName} (HIRA Lead)`,
      incidentInvestigatorName: `${profile.fullName} (GAR 9 Lead)`
    }));
  };

  const selectedTierObj = CONTRACTOR_TIERS.find(t => t.id === selectedTier) || CONTRACTOR_TIERS[1];
  const activeTradeObjects = AVAILABLE_TRADES.filter(t => selectedTrades.includes(t.id));
  const totalSwps = activeTradeObjects.reduce((acc, t) => acc + t.swps.length, 0);
  const totalMethodStatements = activeTradeObjects.reduce((acc, t) => acc + t.methodStatements.length, 0);

  // Compile Master 20-Section PDF Document with Real QR Code
  const compilePdfDocument = async (): Promise<{ doc: jsPDF; fileName: string; verification: AuditVerificationRecord }> => {
    // 1. Generate live cryptographic verification record
      const refCode = draftState.verificationCode || `MT-TDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const verification = await createAuditLedgerVerificationRecord({
        docType: '20-Section Mining Tender Safety File (The Red File)',
        reference: refCode,
        enterpriseName: profile.companyName,
        siteId: 'SITE-WIT-01',
        tier: selectedTierObj.name,
        payload: {
          blastingStatus: accessBlasting.blastingClearance.clearanceStatus,
          oxygenSystemStatus: consumables.oxygenSystem.status,
          wearHealthMin: Math.min(...wearSimulation.monitoredComponents.map(c => c.healthScore)),
          drillingBorehole: drilling.targetBoreholeId
        }
      });
      setVerificationRecord(verification);
      setLiveQrDataUrl(verification.qrDataUrl);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const currentDate = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const watermarkText = 'PREVIEW DRAFT • TENDER SAFETY FILE • NOT FOR OFFICIAL SUBMISSION UNTIL PURCHASED';

      // Diagonal watermark only if unpaid
      const addWatermarkToPage = () => {
        if (isPaidUnlocked) return; // Clean unwatermarked export!
        doc.saveGraphicsState();
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(watermarkText, 25, 270, { angle: 45 });
        doc.text(watermarkText, 5, 170, { angle: 45 });
        doc.text(watermarkText, -15, 70, { angle: 45 });
        doc.restoreGraphicsState();
      };

      // ================= PAGE 1: COVER PAGE & MASTER VERIFICATION SEAL =================
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 297, 'F');

      // Top Security Color Accent Bar
      doc.setFillColor(isPaidUnlocked ? 16 : 220, isPaidUnlocked ? 185 : 38, isPaidUnlocked ? 129 : 38);
      doc.rect(0, 0, 210, 8, 'F');

      // Security Stamp Container
      doc.setFillColor(30, 41, 59); // slate-800
      doc.roundedRect(16, 20, 178, 48, 3, 3, 'F');
      doc.setDrawColor(isPaidUnlocked ? 245 : 239, isPaidUnlocked ? 158 : 68, isPaidUnlocked ? 11 : 68);
      doc.setLineWidth(0.8);
      doc.roundedRect(16, 20, 178, 48, 3, 3, 'D');

      doc.setTextColor(isPaidUnlocked ? 245 : 248, isPaidUnlocked ? 158 : 113, isPaidUnlocked ? 11 : 113);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('STATUTORY MINING SAFETY DOSSIER • MHSA ACT 29 / OHS ACT 85 OF 1993', 22, 29);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text('20-SECTION TENDER SAFETY DOSSIER ("THE RED FILE")', 22, 38);

      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Package Tier: ${selectedTierObj.name.toUpperCase()} • ${isPaidUnlocked ? 'OFFICIAL UNWATERMARKED RELEASE' : 'WATERMARKED PREVIEW'}`, 22, 45);
      doc.text(`Digital Verification Hash: ${verification.hash.slice(0, 36)}...`, 22, 52);
      doc.text(`Verification Ref: ${verification.reference} • Date: ${currentDate}`, 22, 59);

      // Embed Real Scannable QR Code onto Cover Page
      if (verification.qrDataUrl) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(152, 23, 38, 42, 2, 2, 'F');
        doc.addImage(verification.qrDataUrl, 'PNG', 154, 25, 34, 34);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text('SCAN TO VERIFY', 171, 62, { align: 'center' });
      }

      // Contractor Specification Box
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(16, 74, 178, 64, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(16, 74, 178, 64, 2, 2, 'D');

      doc.setTextColor(6, 182, 212);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('CONTRACTOR & PRINCIPAL EMPLOYER SPECIFICATION', 22, 84);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9.5);
      doc.text('Appointed Contractor:', 22, 94);
      doc.setFont('helvetica', 'bold');
      doc.text(`${profile.companyName}`, 75, 94);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text('CIPC Registration:', 22, 101);
      doc.text(`${profile.cipcRegNumber}`, 75, 101);

      doc.text('COID / WCA Good Standing:', 22, 108);
      doc.text(`${profile.coidNumber} (Letter of Good Standing Verified)`, 75, 108);

      doc.text('SARS Tax Compliance PIN:', 22, 115);
      doc.text(`${profile.sarsPin} (Active Good Standing)`, 75, 115);

      doc.text('Project Tender Scope:', 22, 122);
      doc.setFont('helvetica', 'bold');
      doc.text(`${profile.projectTenderName.slice(0, 48)}`, 75, 122);

      doc.setFont('helvetica', 'normal');
      doc.text('Principal Mine Client:', 22, 129);
      doc.text(`${profile.clientPrincipalName}`, 75, 129);

      // Advanced Operations Snapshot on Cover
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(16, 144, 178, 86, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(16, 144, 178, 86, 2, 2, 'D');

      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('HIGH-RISK OPERATIONS & TELEMETRY MODULE STATUS', 22, 154);

      doc.setTextColor(203, 213, 225);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`• Consumable Gas & Oxygen: ${consumables.oxygenSystem.supplier} (Pressure: ${consumables.oxygenSystem.manifoldPressureBar} bar)`, 22, 163);
      doc.text(`• Blasting Zone Perimeter: ${accessBlasting.blastingClearance.stopeHeading} (Radius: ${accessBlasting.blastingClearance.exclusionRadiusMeters}m)`, 22, 170);
      doc.text(`• Subterranean Headcount: In-Stope ${accessBlasting.headcount.inStopeCrew}, Transit ${accessBlasting.headcount.shaftTransitCrew}, Surface Standby ${accessBlasting.headcount.surfaceStandbyCrew}`, 22, 177);
      doc.text(`• Core Drilling Telemetry: Rig ${drilling.coreRigId} • Flow ${drilling.fluidReturnFlowLpm} L/min • Pressure ${drilling.pumpPressureBar} bar`, 22, 184);
      doc.text(`• Physics Wear Simulator: ${wearSimulation.dutyCyclesHours} Running Hours • Ambient ${wearSimulation.ambientTemperatureC}°C • Quartz ${wearSimulation.quartzParticulatePpm} PPM`, 22, 191);
      
      const minHealthComp = wearSimulation.monitoredComponents.reduce((min, c) => c.healthScore < min.healthScore ? c : min, wearSimulation.monitoredComponents[0]);
      doc.text(`• Lowest Component Health Score: ${minHealthComp.name} (${minHealthComp.healthScore}% - Discard in ${minHealthComp.projectedFailureDays} days)`, 22, 198);
      doc.text(`• Selected Trades: ${activeTradeObjects.map(t => t.name).join(', ')}`, 22, 205);
      doc.text(`• Pre-Configured Safe Work Procedures: ${totalSwps} SWPs & ${totalMethodStatements} Method Statements`, 22, 212);
      doc.text(`• Statutory Appointments: 16.2 (${staff.ceoSupervisorName}), CR 8.1 (${staff.constructionManagerName})`, 22, 219);

      // Signatories Footer
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(16, 236, 178, 46, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(16, 236, 178, 46, 2, 2, 'D');

      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('OFFICIAL STATUTORY SIGN-OFF & CRYPTOGRAPHIC LEDGER LINK', 22, 244);

      doc.setTextColor(203, 213, 225);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`• Authorized Appointee: ${profile.fullName} (Designation: Managing Director / Section 16.2)`, 22, 251);
      doc.text(`• First Aider: ${staff.firstAiderName} (Certified Expiry: ${staff.firstAiderExpiry})`, 22, 257);
      doc.text(`• Blasting Master: ${accessBlasting.blastingClearance.blastingMasterLicense}`, 22, 263);
      doc.text(`• Verification URL: ${verification.verificationUrl.slice(0, 60)}...`, 22, 269);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text(`Compiled via MeloTwo SHEQ Cognitive Engine • Timestamp: ${verification.timestamp} • SHA-256 Merkle Proven`, 105, 290, { align: 'center' });

      addWatermarkToPage();

      // ================= PAGE 2: SECTION 37(2) MANDATORY AGREEMENT =================
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('MANDATORY AGREEMENT IN TERMS OF SECTION 37(2)', 105, 20, { align: 'center' });
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text('OCCUPATIONAL HEALTH AND SAFETY ACT 1993 (ACT NO. 85 OF 1993)', 105, 26, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(16, 30, 194, 30);

      doc.setFontSize(8.5);
      doc.text('ENTERED INTO BY AND BETWEEN:', 16, 38);
      doc.setFont('helvetica', 'bold');
      doc.text(`PRINCIPAL CLIENT: ${profile.clientPrincipalName}`, 16, 44);
      doc.setFont('helvetica', 'normal');
      doc.text('AND', 16, 50);
      doc.setFont('helvetica', 'bold');
      doc.text(`MANDATARY / CONTRACTOR: ${profile.companyName} (Reg: ${profile.cipcRegNumber})`, 16, 56);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const legalClauses = [
        '1. The Mandatary acknowledges responsibility under Section 16(1) of the OHS Act and commits to adhering to Construction Regulations 2014, SANS standards, and all applicable DMRE mandatory codes of practice.',
        `2. Valid registration with Compensation Commissioner (COID: ${profile.coidNumber}) and SARS Tax PIN (${profile.sarsPin}) is confirmed on file.`,
        '3. All personnel deployed to high-risk zones, blasting headings, and core drilling stations hold valid medical certificates of fitness and certified PPE.',
        '4. The Mandatary undertakes to execute daily risk assessments, maintain equipment wear inspection logs, and uphold continuous gas monitoring protocols.'
      ];

      let yPos = 65;
      legalClauses.forEach(clause => {
        const split = doc.splitTextToSize(clause, 178);
        doc.text(split, 16, yPos);
        yPos += 14;
      });

      // Signature lines
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRACTOR AUTHORIZATION:', 16, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${profile.fullName}    Signature: _______________________    Date: ${currentDate}`, 16, yPos + 18);

      doc.setFont('helvetica', 'bold');
      doc.text('PRINCIPAL CLIENT RECEIPT:', 16, yPos + 28);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: _______________________    Signature: _______________________    Date: ____________`, 16, yPos + 36);

      // Master 20-Section Index Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(16, yPos + 45, 178, 90, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(16, yPos + 45, 178, 90, 2, 2, 'D');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('MASTER 20-SECTION TENDER SAFETY DOSSIER INDEX ("THE RED FILE")', 22, yPos + 55);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const sectionsList = [
        '• Section 01: OHS Act 37(2) Legal Mandatary Agreement',
        '• Section 02: CIPC Registration & COID Letter of Good Standing',
        '• Section 03: Section 16.2 & Statutory Duty-Bearer Letters',
        '• Section 04: Baseline Risk Assessment (HIRA) & Issue-Based Matrices',
        `• Section 05: Safe Work Procedures (${totalSwps} Active Trade SWPs)`,
        `• Section 06: Method Statements (${totalMethodStatements} Scopes of Work)`,
        '• Section 07: Fall Protection Plan & Working at Heights Protocol',
        '• Section 08: Daily Machine, Ladder & Power Tool Inspection Logs',
        '• Section 09: Hazardous Chemical Substances (HCS) Registers & 16-Pt SDS',
        '• Section 10: PPE Issuance & Material Degradation Inspection Registers',
        '• Section 11: Emergency Preparedness & Evacuation Action Plan',
        '• Section 12: Incident Notification GAR 9 & Root-Cause Protocols',
        '• Section 13: 12-Week Modular Toolbox Talk Schedule & Sign-Offs',
        '• Section 14: Employee Induction Records & Medical Surveillance Matrix',
        '• Section 15: Industrial Consumable & Gas Reticulation Infrastructure Registers',
        '• Section 16: Underground Turnstile Headcount & Blasting Zone Clearance Protocols',
        '• Section 17: Core Drilling & Fluid Return Telemetry Operational Logs',
        '• Section 18: Predictive Physics Wear Simulations & Degradation Schedules',
        '• Section 19: Environmental Waste Management & Effluent Discharge Log',
        '• Section 20: Cryptographic Audit Ledger Verification & SACPCMP Seal'
      ];

      let secY = yPos + 63;
      sectionsList.slice(0, 10).forEach(s => {
        doc.text(s, 22, secY);
        secY += 6;
      });
      secY = yPos + 63;
      sectionsList.slice(10, 20).forEach(s => {
        doc.text(s, 108, secY);
        secY += 6;
      });

      addWatermarkToPage();

      // ================= PAGE 3: ADVANCED OPERATIONS (CONSUMABLES & BLASTING) =================
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('SECTION 15 & 16: CRITICAL INFRASTRUCTURE & UNDERGROUND BLASTING CLEARANCE', 105, 20, { align: 'center' });
      doc.setDrawColor(200, 200, 200);
      doc.line(16, 26, 194, 26);

      // Section 15: Consumables
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(16, 32, 178, 80, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(16, 32, 178, 80, 2, 2, 'D');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('SECTION 15: INDUSTRIAL CONSUMABLE & INVISIBLE INFRASTRUCTURE REGISTER', 22, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`1. Subterranean Oxygen Reticulation System:`, 22, 50);
      doc.text(`   • Supplier: ${consumables.oxygenSystem.supplier}`, 22, 56);
      doc.text(`   • Purity Grade: ${consumables.oxygenSystem.purityGrade} • Manifold Pressure: ${consumables.oxygenSystem.manifoldPressureBar} bar`, 22, 62);
      doc.text(`   • Hydrostatic Test Expiry: ${consumables.oxygenSystem.hydrostaticTestExpiry} • Dual Shutoff Tested: ${consumables.oxygenSystem.dualShutoffValveChecked ? 'Yes (Pass)' : 'No'}`, 22, 68);
      
      doc.text(`2. Mine Gas Supply & Nitrogen Inerting Reticulation:`, 22, 76);
      doc.text(`   • System Type: ${consumables.gasInfrastructure.systemType}`, 22, 82);
      doc.text(`   • Cylinder Certificate: ${consumables.gasInfrastructure.cylinderBankCertNumber} • Line Pressure: ${consumables.gasInfrastructure.reticulationPressureBar} bar`, 22, 88);
      doc.text(`   • Leak Detector Valid Until: ${consumables.gasInfrastructure.leakDetectorCalibratedUntil} • Ventilation Dilution: ${consumables.gasInfrastructure.ventilationDilutionVerified ? 'Verified' : 'Pending'}`, 22, 94);

      doc.text(`3. Heavy Hydraulic Fluid & Reagent Bunding:`, 22, 102);
      doc.text(`   • Fluid Grade: ${consumables.hydraulicReagents.fluidGrade} • Batch: ${consumables.hydraulicReagents.batchNumber}`, 22, 108);

      // Section 16: Blasting Clearance
      doc.setFillColor(254, 242, 242); // red-50
      doc.roundedRect(16, 118, 178, 90, 2, 2, 'F');
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(16, 118, 178, 90, 2, 2, 'D');

      doc.setTextColor(153, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('SECTION 16: UNDERGROUND ACCESS CONTROL & PRE-DETONATION CLEARANCE', 22, 128);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`1. Turnstile Brass Tag Shift Headcount Accountability:`, 22, 136);
      doc.text(`   • Active Shift: ${accessBlasting.headcount.shiftCode} • Tag Reconciliation Confirmed: ${accessBlasting.headcount.tagReconciliationConfirmed ? '100% Accounted For' : 'Unconfirmed'}`, 22, 142);
      doc.text(`   • Subterranean In-Stope Crew: ${accessBlasting.headcount.inStopeCrew} Miners | Shaft Transit Crew: ${accessBlasting.headcount.shaftTransitCrew} Miners`, 22, 148);
      doc.text(`   • Surface Standby & Rescue Brigade: ${accessBlasting.headcount.surfaceStandbyCrew} Personnel | Total Underground: ${accessBlasting.headcount.inStopeCrew + accessBlasting.headcount.shaftTransitCrew}`, 22, 154);

      doc.text(`2. Blasting Zone Detonation Protocol & Safe Perimeter:`, 22, 164);
      doc.text(`   • Blast Heading: ${accessBlasting.blastingClearance.stopeHeading} • Time Window: ${accessBlasting.blastingClearance.detonationWindow}`, 22, 170);
      doc.text(`   • Safe Distance Exclusion Radius: ${accessBlasting.blastingClearance.exclusionRadiusMeters} meters (Barricaded Access Drives)`, 22, 176);
      doc.text(`   • Deployed Sentry Guards: ${accessBlasting.blastingClearance.sentryGuardsCount} Sentries posted with two-way radio telemetry`, 22, 182);
      doc.text(`   • Gas Re-Entry Thresholds: CO ${accessBlasting.blastingClearance.gasThresholds.carbonMonoxidePpm} PPM (Max 30), NOx ${accessBlasting.blastingClearance.gasThresholds.nitrogenOxidePpm} PPM (Max 3), CH4 ${accessBlasting.blastingClearance.gasThresholds.flammableGasPct}% (Max 0.2%)`, 22, 188);
      doc.text(`   • Statutory Blasting Master License: ${accessBlasting.blastingClearance.blastingMasterLicense}`, 22, 194);
      doc.text(`   • Clearance Status: ${accessBlasting.blastingClearance.clearanceStatus} • Protocol Signed: ${accessBlasting.blastingClearance.preDetonationProtocolSigned ? 'Yes' : 'No'}`, 22, 200);

      addWatermarkToPage();

      // ================= PAGE 4: DRILLING TELEMETRY & PHYSICS WEAR SIMULATION =================
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('SECTION 17 & 18: CORE DRILLING TELEMETRY & AUTOMATED WEAR SIMULATIONS', 105, 20, { align: 'center' });
      doc.setDrawColor(200, 200, 200);
      doc.line(16, 26, 194, 26);

      // Section 17: Drilling Telemetry
      doc.setFillColor(240, 253, 250); // teal-50
      doc.roundedRect(16, 32, 178, 64, 2, 2, 'F');
      doc.setDrawColor(204, 251, 241);
      doc.roundedRect(16, 32, 178, 64, 2, 2, 'D');

      doc.setTextColor(17, 94, 89);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('SECTION 17: CORE DRILLING & FLUID TELEMETRY LOG', 22, 42);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`• Core Rig ID: ${drilling.coreRigId}`, 22, 50);
      doc.text(`• Target Borehole: ${drilling.targetBoreholeId} • Geotechnical Stratum: ${drilling.boreholeRiskStratum}`, 22, 56);
      doc.text(`• Return Flow Rate: ${drilling.fluidReturnFlowLpm} L/min • Manifold Pressure: ${drilling.pumpPressureBar} bar (Nominal)`, 22, 62);
      doc.text(`• Downhole Mud Temperature: ${drilling.downholeMudTempC} °C • Drill String Torque: ${drilling.drillStringTorqueNm} Nm`, 22, 68);
      doc.text(`• Vibration RMS: ${drilling.vibrationRmsMmSec} mm/s • Telemetry Active: ${drilling.telemetryStreamActive ? 'Active Stream' : 'Offline'}`, 22, 74);
      doc.text(`• Sensor Calibration Valid Until: ${drilling.sensorCalibrationValidUntil}`, 22, 80);

      // Section 18: Automated Physics Wear Modeling
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(16, 102, 178, 120, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(16, 102, 178, 120, 2, 2, 'D');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('SECTION 18: PREDICTIVE PHYSICS WEAR MODELING & REPLACEMENT SCHEDULES', 22, 112);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Operational Stress Parameters: ${wearSimulation.dutyCyclesHours} Operating Hours • ${wearSimulation.quartzParticulatePpm} PPM Quartz Dust • ${wearSimulation.ambientTemperatureC}°C Ambient • ${wearSimulation.chemicalHydrolysisStress} Chemical Exposure`, 22, 120);

      let compY = 130;
      wearSimulation.monitoredComponents.forEach((comp, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${idx + 1}. ${comp.name} (${comp.category}) - ${comp.standardRef}:`, 22, compY);
        doc.setFont('helvetica', 'normal');
        doc.text(`   Wear: ${comp.wearPercentage}% | Health: ${comp.healthScore}/100 | Projected Life: ${comp.projectedFailureDays} days | Status: ${comp.status}`, 22, compY + 5);
        doc.text(`   Discard Criterion: ${comp.discardThreshold}`, 22, compY + 10);
        if (comp.gapAlert) {
          doc.setTextColor(185, 28, 28);
          doc.text(`   ⚠ GAP ALERT: ${comp.gapAlert}`, 22, compY + 15);
          doc.setTextColor(30, 41, 59);
          compY += 21;
        } else {
          compY += 16;
        }
      });

      // Verification seal on bottom of last page
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(16, 235, 178, 48, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(16, 235, 178, 48, 2, 2, 'D');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('CRYPTOGRAPHIC VERIFICATION SEAL & AUDIT TRAIL', 22, 244);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Verification Ref: ${verification.reference}`, 22, 252);
      doc.text(`Immutable Hash: ${verification.hash}`, 22, 258);
      doc.text(`Online Verification View: ${verification.verificationUrl.slice(0, 68)}...`, 22, 264);
      doc.text(`Certified for official submission under DMR Mine Health & Safety Act & OHS Act Construction Regs.`, 22, 270);

      addWatermarkToPage();

      const fileName = `${profile.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_20_Section_Tender_Safety_File.pdf`;
      return { doc, fileName, verification };
  };

  // Generate Official PDF with Real QR Code and Unlocked Status
  const generateTenderSafetyFile = async () => {
    setIsGeneratingPdf(true);
    try {
      const { doc, fileName } = await compilePdfDocument();
      doc.save(fileName);
      setPdfGeneratedSuccess(true);
      if (onSuccess) onSuccess(fileName);
    } catch (err) {
      console.error('Failed to compile PDF with QR code:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Generate Official ZIP Dossier with PDF, CSV Wear Schedules, Telemetry JSONs, and Verification Seal
  const generateTenderSafetyZip = async () => {
    setIsGeneratingZip(true);
    try {
      const { doc, fileName: pdfFileName, verification } = await compilePdfDocument();
      const pdfBlob = doc.output('blob');

      const zip = new JSZip();

      // 1. Master 20-Section PDF (Clean Unwatermarked if Paid)
      zip.file(pdfFileName, pdfBlob);

      // 2. Monitored Equipment & Physics Wear Schedule CSV
      const csvHeader = 'Component ID,Component Name,Category,Statutory Standard,Running Hours,Wear Percentage,Health Score,Projected Failure Days,Status,Discard Threshold,Compliance Gap Alert\n';
      const csvRows = wearSimulation.monitoredComponents.map(c => 
        `"${c.id}","${c.name}","${c.category}","${c.standardRef}",${c.runningHours},${c.wearPercentage}%,${c.healthScore}/100,${c.projectedFailureDays} days,"${c.status}","${c.discardThreshold.replace(/"/g, '""')}","${(c.gapAlert || 'None - Within Tolerances').replace(/"/g, '""')}"`
      ).join('\n');
      zip.file('01_PPE_and_Equipment_Wear_Simulation_Schedule.csv', csvHeader + csvRows);

      // 3. Operational JSON Logs: Consumables & Invisible Infrastructure
      zip.file('02_Industrial_Consumables_and_Invisible_Infrastructure.json', JSON.stringify({
        generatedAt: new Date().toISOString(),
        companyName: profile.companyName,
        consumables
      }, null, 2));

      // 4. Underground Access Control & Blasting Clearance
      zip.file('03_Underground_Access_Control_and_Blasting_Clearance.json', JSON.stringify({
        generatedAt: new Date().toISOString(),
        companyName: profile.companyName,
        accessAndBlasting: accessBlasting
      }, null, 2));

      // 5. Drilling and Fluid Telemetry
      zip.file('04_Drilling_and_Fluid_Telemetry_Logs.json', JSON.stringify({
        generatedAt: new Date().toISOString(),
        companyName: profile.companyName,
        drillingTelemetry: drilling
      }, null, 2));

      // 6. Company Profile and Statutory Appointments
      zip.file('05_Company_Profile_and_Statutory_Appointments.json', JSON.stringify({
        generatedAt: new Date().toISOString(),
        profile,
        staff,
        selectedTrades,
        docUploads
      }, null, 2));

      // 7. Cryptographic Audit Ledger Verification Seal
      zip.file('06_Cryptographic_Audit_Ledger_Verification.json', JSON.stringify(verification, null, 2));

      // 8. Verification QR Code PNG
      if (verification.qrDataUrl && verification.qrDataUrl.startsWith('data:image/png;base64,')) {
        const base64Data = verification.qrDataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file('07_Verification_Seal_QR.png', base64Data, { base64: true });
      }

      // 9. Compliance Manifesto & Statutory Instructions
      const manifesto = `MELOTWO STATUTORY MINING SAFETY DOSSIER - 20-SECTION RED FILE
========================================================================
Enterprise: ${profile.companyName}
Trading Name: ${profile.tradingName}
CIPC Reg No: ${profile.cipcRegNumber}
COID / Compensation Comm Reg: ${profile.coidNumber}
SARS Tax PIN: ${profile.sarsPin}
Target Tender: ${profile.projectTenderName}
Client / Mine Principal: ${profile.clientPrincipalName}
Verification Reference: ${verification.reference}
Ledger Hash Anchor: ${verification.hash}
Online Verification URL: ${verification.verificationUrl}
Licensing Status: ${isPaidUnlocked ? 'OFFICIAL UNLOCKED DOSSIER (PAID)' : 'PREVIEW DRAFT'}

STATUTORY COMPLIANCE DECLARATION:
This dossier has been compiled in accordance with:
- Republic of South Africa Mine Health and Safety Act (Act 29 of 1996)
- Occupational Health and Safety Act (Act 85 of 1993) Construction Regulations 2014
- Republic of Zambia Mines and Minerals Development Act (No. 11 of 2015)
- SANS 10119: Code of Practice for Construction Safety
- SACPCMP Project and Construction Management Professions Act (Act 48 of 2000)

INCLUDED DOSSIER ARTIFACTS:
1. ${pdfFileName} (Master 20-Section Safety File)
2. 01_PPE_and_Equipment_Wear_Simulation_Schedule.csv (Predictive Wear Schedule)
3. 02_Industrial_Consumables_and_Invisible_Infrastructure.json (Gases, Oxygen & Chemicals)
4. 03_Underground_Access_Control_and_Blasting_Clearance.json (Headcount & Detonation Clearance)
5. 04_Drilling_and_Fluid_Telemetry_Logs.json (Return flow, Mud pressure & Downhole telemetry)
6. 05_Company_Profile_and_Statutory_Appointments.json (Appointee Register)
7. 06_Cryptographic_Audit_Ledger_Verification.json (Proof of Authenticity)
8. 07_Verification_Seal_QR.png (High-Resolution QR Seal for Print & Binders)
`;
      zip.file('00_Compliance_Manifesto_and_Readiness_Index.txt', manifesto);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFileName = `${profile.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_20_Section_Tender_Safety_Dossier_Package.zip`;

      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setZipGeneratedSuccess(true);
      if (onSuccess) onSuccess(zipFileName);
    } catch (err) {
      console.error('Failed to compile ZIP dossier package:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // Handle Checkout success from PayPalEFTCheckoutModal
  const handleCheckoutSuccess = (result: any) => {
    setIsPaidUnlocked(true);
    markTenderPaidUnlocked(selectedTier);
    saveTenderDraft({ isPaidUnlocked: true, selectedTier });
    setIsCheckoutModalOpen(false);
    // Trigger unwatermarked PDF download immediately
    generateTenderSafetyFile();
  };

  const containerContent = (
    <div 
      id="tender-file"
      data-modal-name="tender-safety-file-wizard"
      className="bg-slate-900 border-t sm:border border-slate-800 text-slate-100 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-5xl w-full mx-auto relative h-[100dvh] sm:h-auto sm:max-h-[92dvh]"
    >
      {/* Top Header Banner with Real-Time Auto-Save Telemetry */}
      <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800 bg-slate-950/95 shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/15 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-sm">
            <FolderCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
                Tender Safety File Generator
              </h2>
              <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 font-mono shrink-0">
                20-Section "Red File"
              </span>
              {isPaidUnlocked ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Unlocked / Paid
                </span>
              ) : (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Preview Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden xs:block">
              Statutory DMRE &amp; OHS Act compliance file with real-time wear modeling &amp; online verification QR
            </p>
          </div>
        </div>

        {/* Header Actions: Auto-Save Status, Reset Draft, Close */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Real-Time Auto-Save Telemetry Badge */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
            title="Changes automatically saved to localStorage on every change"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Auto-Saved {lastAutoSaveTime}</span>
          </div>

          {/* Reset Draft Button */}
          <button
            type="button"
            onClick={handleResetDraft}
            className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition cursor-pointer flex items-center gap-1"
            title="Reset form to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Close Wizard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-950/50 text-[10px] sm:text-xs font-mono shrink-0">
        {[
          { step: 1, label: 'Profile & Tier', short: 'Profile', icon: Building2 },
          { step: 2, label: 'Operations & Telemetry', short: 'Operations', icon: Activity },
          { step: 3, label: 'Duty Appointments', short: 'Appointees', icon: Users },
          { step: 4, label: 'Dossier & QR Export', short: 'Export', icon: FileSpreadsheet }
        ].map((item) => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          const Icon = item.icon;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step as any)}
              className={`py-2.5 sm:py-3 px-1 sm:px-3 flex items-center justify-center gap-1 sm:gap-1.5 transition-colors border-b-2 cursor-pointer truncate ${
                isActive
                  ? 'border-red-500 text-red-400 bg-red-600/10 font-bold'
                  : isDone
                  ? 'border-emerald-500/80 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDone ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" /> : <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />}
              <span className="hidden md:inline truncate">{item.step}. {item.label}</span>
              <span className="hidden xs:inline md:hidden truncate">{item.short}</span>
              <span className="xs:hidden font-bold">#{item.step}</span>
            </button>
          );
        })}
      </div>

      {/* Wizard Body Content */}
      <div className="p-4 sm:p-6 md:p-8 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-6">

        {/* ================= STEP 1: Contractor Tier Pricing & Company Profile ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Contractor Tier Pricing Scaffolding */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono text-red-400">
                    Self-Service Contractor Safety File Pricing Scaffolding
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Select your contractor tier. Generates compliant HIRAs, statutory appointments, and SACPCMP-aligned dossiers.
                  </p>
                </div>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  SACPCMP Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CONTRACTOR_TIERS.map(tier => {
                  const isSelected = selectedTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? 'bg-slate-950 border-red-500 shadow-xl shadow-red-950/40 ring-1 ring-red-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                            isSelected ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {tier.badge}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {tier.sectionsIncluded} Sections
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                          {tier.name}
                        </h4>
                        <div className="text-xl font-black text-white font-mono my-2 flex items-baseline gap-1">
                          R{tier.priceZar.toLocaleString('en-ZA')}
                          <span className="text-[10px] font-normal text-slate-400">once-off</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug mb-3">
                          {tier.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-300">
                        {tier.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 truncate">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Registered Company Profile Inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-red-400">
                Registered Company &amp; Statutory Identifiers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Full Legal Name of Safety Officer / MD *
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. David Khumalo"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Company Registered Legal Name *
                  </label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. Apex Trade & Civils (Pty) Ltd"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    CIPC Company Registration Number *
                  </label>
                  <input
                    type="text"
                    value={profile.cipcRegNumber}
                    onChange={(e) => setProfile({ ...profile, cipcRegNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    placeholder="2021/847291/07"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    COID / WCA Reference Number *
                  </label>
                  <input
                    type="text"
                    value={profile.coidNumber}
                    onChange={(e) => setProfile({ ...profile, coidNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    placeholder="990001248573"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    SARS Tax Compliance Status PIN *
                  </label>
                  <input
                    type="text"
                    value={profile.sarsPin}
                    onChange={(e) => setProfile({ ...profile, sarsPin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    placeholder="9482716301"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Principal Client / Mine Site *
                  </label>
                  <input
                    type="text"
                    value={profile.clientPrincipalName}
                    onChange={(e) => setProfile({ ...profile, clientPrincipalName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. Anglo Platinum / Konkola Copper Mines"
                  />
                </div>
              </div>
            </div>

            {/* Document Verification Checkpoints */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono text-red-400">
                Statutory Document Attachments
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(docUploads).map(([key, doc]) => (
                  <div key={key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{doc.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {doc.uploaded ? `${doc.fileName} (${doc.size})` : 'Pending Attachment'}
                      </div>
                    </div>
                    {!doc.uploaded ? (
                      <button
                        type="button"
                        onClick={() => handleSimulatedUpload(key)}
                        className="px-2.5 py-1 text-[10px] font-bold text-red-300 bg-red-950 border border-red-500/40 rounded-lg hover:bg-red-900 cursor-pointer"
                      >
                        Attach
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= STEP 2: Operations, Consumables, Blasting, Drilling & Wear Modeling ================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Sub-tab navigation inside Step 2 */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setStep2SubTab('TRADES')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  step2SubTab === 'TRADES' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Trade Scopes ({selectedTrades.length})
              </button>
              <button
                type="button"
                onClick={() => setStep2SubTab('CONSUMABLES')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  step2SubTab === 'CONSUMABLES' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Consumable Gases &amp; Reticulation
              </button>
              <button
                type="button"
                onClick={() => setStep2SubTab('BLASTING')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  step2SubTab === 'BLASTING' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Access &amp; Blasting Clearance
              </button>
              <button
                type="button"
                onClick={() => setStep2SubTab('DRILLING')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  step2SubTab === 'DRILLING' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                4. Drilling Telemetry
              </button>
              <button
                type="button"
                onClick={() => setStep2SubTab('WEAR_PHYSICS')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  step2SubTab === 'WEAR_PHYSICS' ? 'bg-amber-600 text-slate-950 font-black shadow' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                5. Automated Wear Physics
              </button>
            </div>

            {/* SUB-TAB 1: TRADES */}
            {step2SubTab === 'TRADES' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-red-400">
                      Subcontractor Trade Packages &amp; SANS SWPs
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Select all active trades. SANS Safe Work Procedures and HIRA risk matrices are automatically appended.
                    </p>
                  </div>
                  <span className="text-[10px] text-red-300 font-mono bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                    {selectedTrades.length} Active Scopes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_TRADES.map((trade) => {
                    const isSelected = selectedTrades.includes(trade.id);
                    const Icon = trade.icon;
                    return (
                      <div
                        key={trade.id}
                        onClick={() => toggleTrade(trade.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-950 border-red-500 shadow-md shadow-red-950/40 ring-1 ring-red-500/30'
                            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-white">{trade.name}</h5>
                                <span className="text-[10px] text-slate-400 font-mono">{trade.category}</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {trade.riskLevel} Risk
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug mb-2">
                            {trade.description}
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                          {trade.swps.length} SANS SWPs • {trade.methodStatements.length} Method Statements
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: CONSUMABLES & INVISIBLE INFRASTRUCTURE */}
            {step2SubTab === 'CONSUMABLES' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-red-400">
                      Industrial Consumable &amp; Invisible Infrastructure Tracking
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Track bulk oxygen lines, mine gas supply, nitrogen purging, and hydraulic fluid bunding for supply chain safety.
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    SABS 1499 Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Oxygen System */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5" />
                        Subterranean Cryogenic Oxygen Reticulation
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {consumables.oxygenSystem.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Supplier &amp; Purity Spec</label>
                      <input
                        type="text"
                        value={consumables.oxygenSystem.supplier}
                        onChange={(e) => setConsumables({
                          ...consumables,
                          oxygenSystem: { ...consumables.oxygenSystem, supplier: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Manifold Pressure (bar)</label>
                        <input
                          type="number"
                          value={consumables.oxygenSystem.manifoldPressureBar}
                          onChange={(e) => setConsumables({
                            ...consumables,
                            oxygenSystem: { ...consumables.oxygenSystem, manifoldPressureBar: parseFloat(e.target.value) || 0 }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Hydrostatic Test Expiry</label>
                        <input
                          type="date"
                          value={consumables.oxygenSystem.hydrostaticTestExpiry}
                          onChange={(e) => setConsumables({
                            ...consumables,
                            oxygenSystem: { ...consumables.oxygenSystem, hydrostaticTestExpiry: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nitrogen & Mine Gas Reticulation */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        Nitrogen Inerting &amp; Gas Dilution
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {consumables.gasInfrastructure.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Cylinder Bank Certificate</label>
                      <input
                        type="text"
                        value={consumables.gasInfrastructure.cylinderBankCertNumber}
                        onChange={(e) => setConsumables({
                          ...consumables,
                          gasInfrastructure: { ...consumables.gasInfrastructure, cylinderBankCertNumber: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Line Pressure (bar)</label>
                        <input
                          type="number"
                          value={consumables.gasInfrastructure.reticulationPressureBar}
                          onChange={(e) => setConsumables({
                            ...consumables,
                            gasInfrastructure: { ...consumables.gasInfrastructure, reticulationPressureBar: parseFloat(e.target.value) || 0 }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Leak Calibration Expiry</label>
                        <input
                          type="date"
                          value={consumables.gasInfrastructure.leakDetectorCalibratedUntil}
                          onChange={(e) => setConsumables({
                            ...consumables,
                            gasInfrastructure: { ...consumables.gasInfrastructure, leakDetectorCalibratedUntil: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hydraulic Oils & Reagents */}
                  <div className="sm:col-span-2 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                    <span className="text-xs font-bold text-slate-200">
                      Heavy Hydraulic Oils &amp; Flotation Reagents
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Hydraulic Fluid Grade</label>
                        <input
                          type="text"
                          value={consumables.hydraulicReagents.fluidGrade}
                          onChange={(e) => setConsumables({
                            ...consumables,
                            hydraulicReagents: { ...consumables.hydraulicReagents, fluidGrade: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Spill Kit Monthly Check Date</label>
                        <input
                          type="date"
                          value={consumables.hydraulicReagents.spillKitInspectionDate}
                          onChange={(e) => setConsumables({
                            ...consumables,
                            hydraulicReagents: { ...consumables.hydraulicReagents, spillKitInspectionDate: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Consumable Batch #</label>
                        <input
                          type="text"
                          value={consumables.hydraulicReagents.batchNumber}
                          onChange={(e) => setConsumables({
                            ...consumables,
                            hydraulicReagents: { ...consumables.hydraulicReagents, batchNumber: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: ACCESS & BLASTING CLEARANCE */}
            {step2SubTab === 'BLASTING' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-red-400">
                      Underground Access Control &amp; Blasting Zone Clearance
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Headcount turnstile verification, safe exclusion radius, and statutory Blasting Master Form MSD-14 clearance.
                    </p>
                  </div>
                  <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                    MSR 912 Mandatory
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Headcount Accountability */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      Turnstile &amp; Brass Tag Headcount
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">In-Stope</div>
                        <div className="text-base font-bold text-white font-mono">{accessBlasting.headcount.inStopeCrew}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">In-Transit</div>
                        <div className="text-base font-bold text-white font-mono">{accessBlasting.headcount.shaftTransitCrew}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Surface</div>
                        <div className="text-base font-bold text-white font-mono">{accessBlasting.headcount.surfaceStandbyCrew}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono flex items-center justify-between pt-1">
                      <span>Total Accounted For:</span>
                      <strong className="text-white">{accessBlasting.headcount.inStopeCrew + accessBlasting.headcount.shaftTransitCrew + accessBlasting.headcount.surfaceStandbyCrew} Personnel</strong>
                    </div>
                  </div>

                  {/* Blasting Zone Clearance */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      Detonation Exposure &amp; Safe Radius
                    </span>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Stope Heading &amp; Sub-Level</label>
                      <input
                        type="text"
                        value={accessBlasting.blastingClearance.stopeHeading}
                        onChange={(e) => setAccessBlasting({
                          ...accessBlasting,
                          blastingClearance: { ...accessBlasting.blastingClearance, stopeHeading: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Exclusion Radius (m)</label>
                        <input
                          type="number"
                          value={accessBlasting.blastingClearance.exclusionRadiusMeters}
                          onChange={(e) => setAccessBlasting({
                            ...accessBlasting,
                            blastingClearance: { ...accessBlasting.blastingClearance, exclusionRadiusMeters: parseInt(e.target.value, 10) || 0 }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Sentry Guards</label>
                        <input
                          type="number"
                          value={accessBlasting.blastingClearance.sentryGuardsCount}
                          onChange={(e) => setAccessBlasting({
                            ...accessBlasting,
                            blastingClearance: { ...accessBlasting.blastingClearance, sentryGuardsCount: parseInt(e.target.value, 10) || 0 }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Blasting Master Form MSD-14 License</label>
                      <input
                        type="text"
                        value={accessBlasting.blastingClearance.blastingMasterLicense}
                        onChange={(e) => setAccessBlasting({
                          ...accessBlasting,
                          blastingClearance: { ...accessBlasting.blastingClearance, blastingMasterLicense: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: DRILLING & FLUID TELEMETRY */}
            {step2SubTab === 'DRILLING' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-red-400">
                      Core Drilling &amp; Fluid Telemetry Operational Logging
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Borehole conditions, fluid return flows, torque, and pump pressure dynamics to correlate geotechnical risks.
                    </p>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    Live Telemetry Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Core Rig ID</label>
                    <input
                      type="text"
                      value={drilling.coreRigId}
                      onChange={(e) => setDrilling({ ...drilling, coreRigId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Target Borehole ID</label>
                    <input
                      type="text"
                      value={drilling.targetBoreholeId}
                      onChange={(e) => setDrilling({ ...drilling, targetBoreholeId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Fluid Return Flow (L/min)</label>
                    <input
                      type="number"
                      value={drilling.fluidReturnFlowLpm}
                      onChange={(e) => setDrilling({ ...drilling, fluidReturnFlowLpm: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Pump Pressure (bar)</label>
                    <input
                      type="number"
                      value={drilling.pumpPressureBar}
                      onChange={(e) => setDrilling({ ...drilling, pumpPressureBar: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Downhole Mud Temp (°C)</label>
                    <input
                      type="number"
                      value={drilling.downholeMudTempC}
                      onChange={(e) => setDrilling({ ...drilling, downholeMudTempC: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Drill String Torque (Nm)</label>
                    <input
                      type="number"
                      value={drilling.drillStringTorqueNm}
                      onChange={(e) => setDrilling({ ...drilling, drillStringTorqueNm: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: AUTOMATED WEAR SIMULATIONS & PHYSICS MODELING */}
            {step2SubTab === 'WEAR_PHYSICS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      Automated Wear Simulations &amp; Physics Modeling
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Predictive physics modeling for PPE, harnesses, scraper ropes, and drill bits to flag non-compliance prior to failure.
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Predictive CAPA Engine
                  </span>
                </div>

                {/* Physics Simulation Input Controls */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" />
                      Dynamic Physics Environment Parameters
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Real-Time Degradation Calculations
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Duty Cycles / Running Hours</span>
                        <strong className="text-white">{wearSimulation.dutyCyclesHours} hrs</strong>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="1200"
                        step="50"
                        value={wearSimulation.dutyCyclesHours}
                        onChange={(e) => handleRecalculateWear(
                          parseInt(e.target.value, 10),
                          wearSimulation.quartzParticulatePpm,
                          wearSimulation.ambientTemperatureC,
                          wearSimulation.chemicalHydrolysisStress
                        )}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Quartz Dust Density (PPM)</span>
                        <strong className="text-white">{wearSimulation.quartzParticulatePpm} PPM</strong>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="900"
                        step="50"
                        value={wearSimulation.quartzParticulatePpm}
                        onChange={(e) => handleRecalculateWear(
                          wearSimulation.dutyCyclesHours,
                          parseInt(e.target.value, 10),
                          wearSimulation.ambientTemperatureC,
                          wearSimulation.chemicalHydrolysisStress
                        )}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Ambient Thermal Factor</span>
                        <strong className="text-white">{wearSimulation.ambientTemperatureC} °C</strong>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="55"
                        step="1"
                        value={wearSimulation.ambientTemperatureC}
                        onChange={(e) => handleRecalculateWear(
                          wearSimulation.dutyCyclesHours,
                          wearSimulation.quartzParticulatePpm,
                          parseInt(e.target.value, 10),
                          wearSimulation.chemicalHydrolysisStress
                        )}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Acid / Hydrolysis Stress</label>
                      <select
                        value={wearSimulation.chemicalHydrolysisStress}
                        onChange={(e) => handleRecalculateWear(
                          wearSimulation.dutyCyclesHours,
                          wearSimulation.quartzParticulatePpm,
                          wearSimulation.ambientTemperatureC,
                          e.target.value as any
                        )}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      >
                        <option value="LOW">Low (Dry Atmospheric)</option>
                        <option value="MEDIUM">Medium (Acid Mine Drainage)</option>
                        <option value="HIGH">High (Aggressive Leaching pH &lt; 3.0)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Monitored Components Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Predicted Component Wear Gauges &amp; Statutory Discard Limits
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {wearSimulation.monitoredComponents.map(comp => (
                      <div key={comp.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white">{comp.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{comp.standardRef}</span>
                          </div>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            comp.status === 'REPLACE_IMMEDIATELY' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            comp.status === 'MODERATE_WEAR' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {comp.status === 'REPLACE_IMMEDIATELY' ? 'REPLACE NOW' :
                             comp.status === 'MODERATE_WEAR' ? 'MODERATE WEAR' : 'OPTIMAL'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Wear: {comp.wearPercentage}%</span>
                            <span className="text-slate-300">Remaining Life: ~{comp.projectedFailureDays} days</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                comp.wearPercentage >= 75 ? 'bg-rose-500' :
                                comp.wearPercentage >= 50 ? 'bg-amber-500' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${comp.wearPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono">
                          Discard Rule: {comp.discardThreshold}
                        </div>

                        {comp.gapAlert && (
                          <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-[10px] text-rose-300 font-mono flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{comp.gapAlert}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ================= STEP 3: Statutory Staff Appointments ================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono text-red-400">
                  Step 3: Statutory Appointments &amp; Duty Bearers
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Assign statutory roles. MeloTwo auto-compiles legal appointment letters under OHS Act 85 of 1993 and Construction Regulations 2014.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutofillSupervisor}
                className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autofill Primary Appointee</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  16.2 Assistant to CEO / Site Lead *
                </label>
                <input
                  type="text"
                  value={staff.ceoSupervisorName}
                  onChange={(e) => setStaff({ ...staff, ceoSupervisorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Construction Manager (CR 8.1) *
                </label>
                <input
                  type="text"
                  value={staff.constructionManagerName}
                  onChange={(e) => setStaff({ ...staff, constructionManagerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Lead Risk Assessor (HIRA CR 9) *
                </label>
                <input
                  type="text"
                  value={staff.riskAssessorName}
                  onChange={(e) => setStaff({ ...staff, riskAssessorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Incident Investigator (GAR 9) *
                </label>
                <input
                  type="text"
                  value={staff.incidentInvestigatorName}
                  onChange={(e) => setStaff({ ...staff, incidentInvestigatorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  GSR 3 First Aider Name *
                </label>
                <input
                  type="text"
                  value={staff.firstAiderName}
                  onChange={(e) => setStaff({ ...staff, firstAiderName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  First Aid Certificate Expiry *
                </label>
                <input
                  type="date"
                  value={staff.firstAiderExpiry}
                  onChange={(e) => setStaff({ ...staff, firstAiderExpiry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: Live Preview, QR Verification & Checkout Unlocking ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Unlocked / Paid Status Banner */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isPaidUnlocked 
                ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500/40 text-emerald-300'
                : 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/40 text-amber-300'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isPaidUnlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="text-sm font-bold uppercase tracking-wider font-mono">
                    {isPaidUnlocked 
                      ? '✓ Unlocked & Verified For Official Submission' 
                      : `Selected Package: ${selectedTierObj.name}`}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isPaidUnlocked
                    ? 'All watermarks removed. Immediate one-click unwatermarked PDF download ready.'
                    : `Complete 20-Section Red File ready. Upgrade for R${selectedTierObj.priceZar.toLocaleString('en-ZA')} once-off via PayPal or Direct EFT to download official unwatermarked dossier.`}
                </p>
              </div>

              {!isPaidUnlocked ? (
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Unlock File — R{selectedTierObj.priceZar.toLocaleString('en-ZA')}</span>
                </button>
              ) : (
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30 shrink-0">
                  Official Clean Release
                </span>
              )}
            </div>

            {/* QR Code Online Verification Card */}
            <div className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-2 max-w-lg">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Online Cryptographic Audit Ledger Verification
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every compliance dossier generated includes a unique verifiable hash. Mine safety inspectors, DMRE officers, and client audit committees can scan the QR code to verify immutable timestamps on the central ledger.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                  <span className="text-slate-400">Verification Ref: <strong className="text-amber-400">{verificationRecord?.reference || draftState.verificationCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setShowVerificationLedgerModal(true)}
                    className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Ledger Chain</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Scannable Dynamic QR Code Image */}
              <div 
                onClick={() => setShowVerificationLedgerModal(true)}
                className="p-3 bg-white rounded-xl shadow-lg border border-slate-700 cursor-pointer shrink-0 hover:scale-105 transition-transform text-center"
                title="Click to view full cryptographic proof audit ledger"
              >
                {liveQrDataUrl ? (
                  <img
                    src={liveQrDataUrl}
                    alt="Audit Verification QR"
                    className="w-28 h-28 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-slate-900 font-mono text-[10px]">
                    Generating QR...
                  </div>
                )}
                <span className="text-[8px] font-bold text-slate-950 font-mono block mt-1">
                  TAP TO VERIFY
                </span>
              </div>
            </div>

            {/* Live Document Preview Box */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Compiled Document Sections Summary
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedTierObj.sectionsIncluded} Sections Included
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Contractor</div>
                  <div className="font-bold text-white truncate">{profile.companyName}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{profile.cipcRegNumber}</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Trade SWPs &amp; HIRAs</div>
                  <div className="font-bold text-white">{totalSwps} Pre-Configured SWPs</div>
                  <div className="text-[10px] text-slate-400 font-mono">{activeTradeObjects.length} Active Trades</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Operations &amp; Wear</div>
                  <div className="font-bold text-white">{consumables.oxygenSystem.status} • {accessBlasting.blastingClearance.clearanceStatus}</div>
                  <div className="text-[10px] text-slate-400 font-mono">5 Physics Components Monitored</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={generateTenderSafetyFile}
                  disabled={isGeneratingPdf || isGeneratingZip}
                  className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Compiling Red File PDF &amp; QR Code...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isPaidUnlocked ? 'Download Official File (PDF)' : 'Download Watermarked Draft (PDF)'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={generateTenderSafetyZip}
                  disabled={isGeneratingZip || isGeneratingPdf}
                  className="w-full sm:flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Complete archive containing unwatermarked PDF, wear physics CSV schedule, telemetry JSON logs, and QR code PNG"
                >
                  {isGeneratingZip ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Packaging ZIP Dossier...</span>
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-4 h-4 text-amber-400" />
                      <span>Download Full Dossier (.ZIP)</span>
                    </>
                  )}
                </button>

                {!isPaidUnlocked && (
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="w-full sm:w-auto py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Unlock Unwatermarked Dossier (R{selectedTierObj.priceZar.toLocaleString('en-ZA')})</span>
                  </button>
                )}
              </div>

              {pdfGeneratedSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-mono animate-in fade-in">
                  ✓ Safety File PDF compiled and downloaded successfully with verified QR verification stamp!
                </div>
              )}

              {zipGeneratedSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-mono animate-in fade-in">
                  ✓ Complete ZIP Dossier Package downloaded! Includes 20-Section PDF, wear simulation CSV, telemetry JSON registers, and QR verification seal.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Footer Navigation Bar */}
      <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-800 bg-slate-950 shrink-0 flex items-center justify-between gap-2 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setCurrentStep(prev => (prev > 1 ? (prev - 1 as any) : prev))}
          disabled={currentStep === 1}
          className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-[11px] sm:text-xs text-slate-400 font-mono hidden xs:block">
          Step {currentStep} of 4 • {currentStep === 4 ? 'Ready to Export' : 'In Progress'}
        </div>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => (prev < 4 ? (prev + 1 as any) : prev))}
            className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-950/40 border border-red-500/60 flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generateTenderSafetyZip}
              disabled={isGeneratingZip || isGeneratingPdf}
              className="px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition border border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              title="Download Full Dossier Package as ZIP"
            >
              <FileArchive className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">ZIP Dossier</span>
            </button>
            <button
              type="button"
              onClick={generateTenderSafetyFile}
              disabled={isGeneratingPdf || isGeneratingZip}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-950/40 border border-red-500/60 flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isPaidUnlocked ? 'Download Official Red File' : 'Download Preview'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Embedded Real PayPal & South African EFT Checkout Modal */}
      <PayPalEFTCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        itemTitle={`${selectedTierObj.name} (Tender Safety File)`}
        itemDescription={`${selectedTierObj.description} - Formal 20-Section dossier for ${profile.companyName}`}
        amountZar={selectedTierObj.priceZar}
        enterpriseName={profile.companyName}
        userEmail={profile.contactEmail || 'safety@contractor.co.za'}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Embedded Cryptographic Ledger Online Verification Modal */}
      {showVerificationLedgerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVerificationLedgerModal(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl p-4 sm:p-6">
            <button
              onClick={() => setShowVerificationLedgerModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <ComplianceProofViewer
              siteId="SITE-WIT-01"
              onBack={() => setShowVerificationLedgerModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );

  if (isStandalone) {
    return containerContent;
  }

  if (!isOpen) return null;

  return (
    <div 
      id="tender-file-wizard-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {containerContent}
    </div>
  );
};

export default TenderFileWizard;
