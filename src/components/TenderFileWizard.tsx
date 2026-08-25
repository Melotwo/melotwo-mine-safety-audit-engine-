import React, { useState, useId, useEffect } from 'react';
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
  Printer, 
  AlertTriangle, 
  Info, 
  Users, 
  Check, 
  X, 
  Flame, 
  PlusCircle, 
  FileCode, 
  Zap, 
  Layers, 
  Lock, 
  ShieldAlert, 
  FolderCheck,
  Briefcase,
  Eye,
  CreditCard,
  Crown,
  Ban,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BadgeCheck
} from 'lucide-react';
import jsPDF from 'jspdf';

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
    riskLevel: 'High',
    icon: HardHat,
    description: 'Pothole repairs, asphalt resurfacing, kerbing, and high-traffic road verge maintenance.',
    swps: [
      { code: 'SWP-RM-01', title: 'Traffic Accommodation & Advance Warning Signage', standard: 'SARTSM Vol 2 / CR 2014' },
      { code: 'SWP-RM-02', title: 'Hot/Cold Asphalt Patching & Vibratory Roller Ops', standard: 'SANS 1200 / OHS Act' },
      { code: 'SWP-RM-03', title: 'Bitumen Emulsion Handling & Flammable Liquid Safety', standard: 'GSR 4 / SANS 10228' },
      { code: 'SWP-RM-04', title: 'High-Visibility PPE & Spotter Marshaling Protocol', standard: 'GSR 2 / DMR Rules' }
    ],
    methodStatements: ['Roadway Lane Closure & Taper Set-up', 'Mechanical Saw Cutting of Pavement', 'Hot Bituminous Surface Sealing']
  },
  {
    id: 'building_renovation',
    name: 'Building Construction & Renovation',
    category: 'Commercial & Residential',
    riskLevel: 'Medium',
    icon: Building2,
    description: 'Interior fit-outs, structural modifications, ceiling replacements, bricklaying, and wet trades.',
    swps: [
      { code: 'SWP-BR-01', title: 'Demolition of Non-Structural Partition Walls', standard: 'CR 29 / OHS Act' },
      { code: 'SWP-BR-02', title: 'Mobile Aluminium Tower Scaffolding (<6m)', standard: 'SANS 10085 / CR 16' },
      { code: 'SWP-BR-03', title: 'Crystalline Silica & Dust Extraction Protocol', standard: 'Hazardous Chemical Agents Regs' },
      { code: 'SWP-BR-04', title: 'Rubble Chute & Waste Manifest Management', standard: 'Environmental & Municipal By-Laws' }
    ],
    methodStatements: ['Interior Plaster Strip & Wall Chasing', 'Suspended Ceiling Grid Installation', 'Tile Removal & Screed Prep']
  },
  {
    id: 'painting_decorating',
    name: 'Painting & Surface Decorating',
    category: 'Finishing Trades',
    riskLevel: 'Low',
    icon: Wrench,
    description: 'Industrial coating, high-access facade painting, spray painting, and surface prep.',
    swps: [
      { code: 'SWP-PD-01', title: 'Volatile Organic Compound (VOC) Ventilation & Storage', standard: 'HCAR 2021 / GSR 4' },
      { code: 'SWP-PD-02', title: 'Working from Extension Ladders & Stepladders', standard: 'General Safety Reg 13A' },
      { code: 'SWP-PD-03', title: 'High-Pressure Hydro-Washing Safety (150-300 Bar)', standard: 'Vessel Under Pressure Regs' },
      { code: 'SWP-PD-04', title: 'Chemical Splash Eye & Respiratory Protection', standard: 'GSR 2 / SANS 10330' }
    ],
    methodStatements: ['External Multi-Storey Facade Coating', 'Airless Paint Spraying in Confined Rooms', 'Industrial Epoxy Floor Sealing']
  },
  {
    id: 'agricultural_fencing',
    name: 'Agricultural & Boundary Fencing',
    category: 'Farming & Perimeter Security',
    riskLevel: 'Medium',
    icon: ShieldAlert,
    description: 'Game fencing, razor wire, high-tensile cattle enclosures, and solar electric boundary fences.',
    swps: [
      { code: 'SWP-AF-01', title: 'Post-Hole Auger & Subsurface Utility Verification', standard: 'CR 13 / OHS Act' },
      { code: 'SWP-AF-02', title: 'High-Tensile Wire Tensioning & Recoil Containment', standard: 'GSR 3 / Risk Matrix' },
      { code: 'SWP-AF-03', title: 'Remote Farm Heat Stress, Dehydration & Snakebite Kit', standard: 'First Aid GSR 3 / OHS' },
      { code: 'SWP-AF-04', title: 'Electric Fence Energizer Earth Spike Bonding', standard: 'SANS 10222-3' }
    ],
    methodStatements: ['Boundary Game Wire Strainer Tensioning', 'Treated Wooden Post Auger Planting', 'Electric Fence Multi-Zone Setup']
  },
  {
    id: 'hvac_maintenance',
    name: 'HVAC & Industrial Refrigeration',
    category: 'Building Services',
    riskLevel: 'High',
    icon: Flame,
    description: 'Chiller plant servicing, duct cleaning, refrigerant recovery, and rooftop cooling units.',
    swps: [
      { code: 'SWP-HV-01', title: 'Refrigerant R410A / R32 Gas Recovery & Pressure Safety', standard: 'PER 2009 / SANS 347' },
      { code: 'SWP-HV-02', title: 'Rooftop Plant Access & Fall Restraint Anchoring', standard: 'CR 10 / SANS 50361' },
      { code: 'SWP-HV-03', title: 'High-Voltage Capacitor Discharge & Belt Guard Safety', standard: 'Driven Machinery Regs 2' },
      { code: 'SWP-HV-04', title: 'Chemical Coil Wash & Acid Neutralization Protocol', standard: 'HCAR 2021 / Effluent Laws' }
    ],
    methodStatements: ['Rooftop Condenser Coil Chemical Descaling', 'Compressor Motor Replacement', 'Air Duct Anti-Microbial Fogging']
  },
  {
    id: 'small_works_handyman',
    name: 'Small Works / Facilities Handyman',
    category: 'General Maintenance',
    riskLevel: 'Low',
    icon: Layers,
    description: 'Minor carpentry, plumbing repairs, drywall patching, door hanging, and lock repairs.',
    swps: [
      { code: 'SWP-SW-01', title: 'Portable Electrical Power Tools Pre-Use Inspection', standard: 'Electrical Machinery Regs 10' },
      { code: 'SWP-SW-02', title: 'Ergonomic Manual Handling & Heavy Lifting (>25kg)', standard: 'Ergonomics Regs 2019' },
      { code: 'SWP-SW-03', title: 'Pressurized Domestic Water Pipe Isolation', standard: 'National Building Regs' },
      { code: 'SWP-SW-04', title: 'Drywall Dust & Angle Grinder Eye Safety', standard: 'GSR 2 / OHS Act' }
    ],
    methodStatements: ['Commercial Door & Lock Replacement', 'Drywall Partition Minor Patching', 'Sanitary Ware & Tap Fitting Repair']
  }
];

export interface UploadedDocStatus {
  name: string;
  uploaded: boolean;
  fileName?: string;
  size?: string;
}

export interface CompanyProfileState {
  fullName: string;
  companyName: string;
  tradingName: string;
  contactPhone: string;
  contactEmail: string;
  physicalAddress: string;
  cipcRegNumber: string;
  coidNumber: string;
  sarsPin: string;
  projectTenderName: string;
  clientPrincipalName: string;
}

export interface StatutoryStaffState {
  ceoSupervisorName: string; // 16.2
  ceoSupervisorId: string;
  constructionManagerName: string; // CR 8.1
  assistantManagerName: string; // CR 8.2
  firstAiderName: string; // GSR 3
  firstAiderExpiry: string;
  fireMarshalName: string; // ER 9
  safetyRepName: string; // Sec 17/18
  riskAssessorName: string; // CR 9.1
  incidentInvestigatorName: string; // GAR 9
}

export interface TenderFileWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (pdfBlobUrl: string) => void;
  isStandalone?: boolean;
}

const MAX_DOWNLOAD_LIMIT = 3;
const DOWNLOAD_STORAGE_KEY = 'melotwo_tender_download_count';

export const TenderFileWizard: React.FC<TenderFileWizardProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  isStandalone = false
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGeneratedSuccess, setPdfGeneratedSuccess] = useState(false);
  const [showFullDocIndex, setShowFullDocIndex] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'blueprint' | 'live_preview'>('live_preview');
  
  // Download Limit and Conversion Lock State
  const [downloadCount, setDownloadCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(DOWNLOAD_STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [isPaidUnlocked, setIsPaidUnlocked] = useState<boolean>(false);

  // Form State: Company Profile
  const [profile, setProfile] = useState<CompanyProfileState>({
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
  });

  // Upload placeholder states
  const [docUploads, setDocUploads] = useState<Record<string, UploadedDocStatus>>({
    coid: { name: 'COID Letter of Good Standing', uploaded: true, fileName: 'Apex_COID_Valid_2026.pdf', size: '342 KB' },
    sars: { name: 'Tax Compliance Status (PIN Certificate)', uploaded: true, fileName: 'SARS_TCS_PIN_Apex.pdf', size: '180 KB' },
    cipc: { name: 'CIPC Company Registration (COR14.3)', uploaded: true, fileName: 'COR14.3_2021_847291.pdf', size: '512 KB' },
    insurance: { name: 'Public Liability Insurance (R5m+)', uploaded: false }
  });

  // Form State: Selected Trades
  const [selectedTrades, setSelectedTrades] = useState<string[]>(['building_renovation', 'painting_decorating']);

  // Form State: Statutory Employees
  const [staff, setStaff] = useState<StatutoryStaffState>({
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
  });

  const uniqueId = useId();

  // Persist download count updates
  useEffect(() => {
    try {
      localStorage.setItem(DOWNLOAD_STORAGE_KEY, downloadCount.toString());
    } catch (e) {
      console.warn('Could not save download count to localStorage:', e);
    }
  }, [downloadCount]);

  // Toggle Trade selection
  const toggleTrade = (tradeId: string) => {
    setSelectedTrades(prev => 
      prev.includes(tradeId)
        ? (prev.length > 1 ? prev.filter(id => id !== tradeId) : prev) // keep at least 1
        : [...prev, tradeId]
    );
  };

  // Upload handler simulation
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

  // Quick autofill primary supervisor to all roles
  const handleAutofillSupervisor = () => {
    setStaff(prev => ({
      ...prev,
      ceoSupervisorName: `${profile.fullName} (16.2 Appointee)`,
      constructionManagerName: `${profile.fullName} (CR 8.1 Manager)`,
      riskAssessorName: `${profile.fullName} (HIRA Lead)`,
      incidentInvestigatorName: `${profile.fullName} (GAR 9 Lead)`
    }));
  };

  // Calculate dynamic components generated
  const activeTradeObjects = AVAILABLE_TRADES.filter(t => selectedTrades.includes(t.id));
  const totalSwps = activeTradeObjects.reduce((acc, t) => acc + t.swps.length, 0);
  const totalMethodStatements = activeTradeObjects.reduce((acc, t) => acc + t.methodStatements.length, 0);

  // Generate Actual PDF using jsPDF with download limit enforcement & watermark
  const handleDownloadClick = () => {
    if (!isPaidUnlocked && downloadCount >= MAX_DOWNLOAD_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }
    generateTenderSafetyFile();
  };

  const generateTenderSafetyFile = () => {
    setIsGeneratingPdf(true);

    try {
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

      const watermarkText = 'PREVIEW ONLY - TENDER SAFETY FILE - NOT FOR OFFICIAL SUBMISSION UNTIL PURCHASED';

      // Helper to add semi-transparent diagonal watermark across page
      const addWatermarkToPage = () => {
        doc.saveGraphicsState();
        doc.setTextColor(239, 68, 68); // red-500
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        
        // Diagonal watermark string
        const angle = 45;
        doc.text(watermarkText, 25, 270, { angle: angle });
        doc.text(watermarkText, 5, 170, { angle: angle });
        doc.text(watermarkText, -15, 70, { angle: angle });
        doc.restoreGraphicsState();
      };

      // Page 1: Official Cover Page & Compliance Seal
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 297, 'F');

      // Top Accent Line
      doc.setFillColor(6, 182, 212); // cyan-500
      doc.rect(0, 0, 210, 8, 'F');

      // Gold Security Stamp
      doc.setFillColor(30, 41, 59); // slate-800
      doc.roundedRect(20, 25, 170, 42, 3, 3, 'F');
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.setLineWidth(0.8);
      doc.roundedRect(20, 25, 170, 42, 3, 3, 'D');

      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('STATUTORY HEALTH & SAFETY DOSSIER • OHS ACT 85 OF 1993', 105, 34, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('TENDER-READY MANDATORY SAFETY FILE', 105, 43, { align: 'center' });

      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Per Construction Regulations 2014 & DMR Mine Health Safety Standards', 105, 50, { align: 'center' });
      doc.text(`Digital Verification Hash: M2-SEC372-${Date.now().toString(36).toUpperCase()}-ZA`, 105, 57, { align: 'center' });

      // Contractor & Project Box
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(20, 75, 170, 65, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(20, 75, 170, 65, 2, 2, 'D');

      doc.setTextColor(6, 182, 212);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CONTRACTOR & PRINCIPAL EMPLOYER SPECIFICATION', 26, 85);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`Appointed Contractor:`, 26, 95);
      doc.setFont('helvetica', 'bold');
      doc.text(`${profile.companyName}`, 75, 95);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(`CIPC Reg Number:`, 26, 102);
      doc.text(`${profile.cipcRegNumber}`, 75, 102);

      doc.text(`COID / WCA Number:`, 26, 109);
      doc.text(`${profile.coidNumber} (Letter of Good Standing Attached)`, 75, 109);

      doc.text(`SARS Tax PIN:`, 26, 116);
      doc.text(`${profile.sarsPin} (Good Standing Validated)`, 75, 116);

      doc.text(`Project / Tender Scope:`, 26, 123);
      doc.setFont('helvetica', 'bold');
      doc.text(`${profile.projectTenderName.slice(0, 50)}`, 75, 123);

      doc.setFont('helvetica', 'normal');
      doc.text(`Principal Client:`, 26, 130);
      doc.text(`${profile.clientPrincipalName}`, 75, 130);

      // Section: Selected Work Packages & SWPs
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(20, 148, 170, 80, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(20, 148, 170, 80, 2, 2, 'D');

      doc.setTextColor(6, 182, 212);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ACTIVE TRADE SCOPES & SAFE WORK PROCEDURES (SWP)', 26, 158);

      let yPos = 168;
      activeTradeObjects.forEach((trade) => {
        if (yPos > 215) return;
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text(`• ${trade.name} [Risk Tier: ${trade.riskLevel}]`, 26, yPos);
        
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const swpList = trade.swps.map(s => s.code).join(', ');
        doc.text(`   Mapped Procedures: ${swpList} (${trade.methodStatements.length} Method Statements)`, 26, yPos + 5);
        yPos += 12;
      });

      // Statutory Signatories Footer
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(20, 235, 170, 45, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(20, 235, 170, 45, 2, 2, 'D');

      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('STATUTORY DUTY-BEARER APPOINTMENTS INCLUDED', 26, 243);

      doc.setTextColor(203, 213, 225);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`• 16.2 Site Supervisor: ${staff.ceoSupervisorName}`, 26, 251);
      doc.text(`• CR 8.1 Construction Manager: ${staff.constructionManagerName}`, 26, 257);
      doc.text(`• GSR 3 First Aider: ${staff.firstAiderName}`, 26, 263);
      doc.text(`• Lead Risk Assessor: ${staff.riskAssessorName}`, 26, 269);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.text(`Issued by MeloTwo SHEQ Engine • Date: ${currentDate} • Standard: SANS 10330 / OHS Act Section 37.2`, 105, 288, { align: 'center' });

      if (!isPaidUnlocked) {
        addWatermarkToPage();
      }

      // Page 2: Section 37(2) Mandatory Agreement Template
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('MANDATORY AGREEMENT IN TERMS OF SECTION 37(2)', 105, 22, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OCCUPATIONAL HEALTH AND SAFETY ACT, 1993 (ACT NO. 85 OF 1993)', 105, 28, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 32, 190, 32);

      doc.setFontSize(9);
      doc.text('ENTERED INTO BY AND BETWEEN:', 20, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(`PRINCIPAL CLIENT / EMPLOYER: ${profile.clientPrincipalName}`, 20, 46);
      doc.setFont('helvetica', 'normal');
      doc.text('AND', 20, 52);
      doc.setFont('helvetica', 'bold');
      doc.text(`MANDATARY / CONTRACTOR: ${profile.companyName} (Reg: ${profile.cipcRegNumber})`, 20, 58);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const legalP1 = `1. The Mandatary hereby acknowledges that it is an employer in its own right in terms of Section 16(1) of the Act and undertakes to ensure that all work executed on the project site complies fully with the Occupational Health and Safety Act No. 85 of 1993, the Construction Regulations 2014, and all relevant SANS Codes of Practice.`;
      const splitLegal1 = doc.splitTextToSize(legalP1, 170);
      doc.text(splitLegal1, 20, 68);

      const legalP2 = `2. The Mandatary confirms valid registration and good standing with the Compensation Commissioner (COID Reg: ${profile.coidNumber}) and confirms that all employees, sub-contractors, and supervisors engaged on site have received induction training and statutory PPE.`;
      const splitLegal2 = doc.splitTextToSize(legalP2, 170);
      doc.text(splitLegal2, 20, 88);

      const legalP3 = `3. The Mandatary will maintain an on-site Health and Safety File comprising Baseline Risk Assessments, Method Statements, Tool Inspection Logs, and Statutory Appointment letters for the duration of the works.`;
      const splitLegal3 = doc.splitTextToSize(legalP3, 170);
      doc.text(splitLegal3, 20, 108);

      // Signature Block
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNED ON BEHALF OF CONTRACTOR (MANDATARY):', 20, 135);
      doc.setFont('helvetica', 'normal');
      doc.text(`Authorized Name: ${profile.fullName}`, 20, 143);
      doc.text(`Designation: Managing Director / Section 16.2 Appointee`, 20, 149);
      doc.text(`Signature: ___________________________    Date: ${currentDate}`, 20, 155);

      doc.setFont('helvetica', 'bold');
      doc.text('SIGNED ON BEHALF OF PRINCIPAL CLIENT / EMPLOYER:', 20, 175);
      doc.setFont('helvetica', 'normal');
      doc.text(`Authorized Name: ___________________________`, 20, 183);
      doc.text(`Designation: Client Project Manager / Safety Agent`, 20, 189);
      doc.text(`Signature: ___________________________    Date: ____________________`, 20, 195);

      // Section: Index of Attached Documents
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, 215, 170, 65, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(20, 215, 170, 65, 2, 2, 'D');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('ATTACHED HEALTH & SAFETY FILE MASTER INDEX', 26, 225);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('• Tab 01: OHS Act Section 37.2 Agreement & Section 16.2 Appointment', 26, 233);
      doc.text('• Tab 02: Valid COID Letter of Good Standing & SARS Tax Compliance PIN', 26, 239);
      doc.text('• Tab 03: Baseline Health & Safety Plan & Fall Protection Protocol (CR 10)', 26, 245);
      doc.text(`• Tab 04: Safe Work Procedures (${totalSwps} Pre-Configured SWPs for Active Trades)`, 26, 251);
      doc.text(`• Tab 05: Method Statements (${totalMethodStatements} Scopes) & Daily Risk Assessments`, 26, 257);
      doc.text('• Tab 06: Statutory Inspection Registers (Ladders, Power Tools, First Aid Box)', 26, 263);
      doc.text('• Tab 07: 12 Weekly Toolbox Talks & Employee Induction Sign-off Register', 26, 269);

      if (!isPaidUnlocked) {
        addWatermarkToPage();
      }

      // Increment download count and save PDF
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);

      const fileName = `${profile.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Tender_Safety_File.pdf`;
      doc.save(fileName);
      
      setPdfGeneratedSuccess(true);
      if (onSuccess) {
        onSuccess(fileName);
      }

      // If user hit the max limit after this download, show conversion notice
      if (newCount >= MAX_DOWNLOAD_LIMIT && !isPaidUnlocked) {
        setTimeout(() => {
          setShowUpgradeModal(true);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to compile PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const containerContent = (
    <div 
      id="tender-file"
      data-modal-name="tender-safety-file-wizard"
      className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-4xl w-full mx-auto relative"
    >
      {/* Header Banner */}
      <div className="px-6 py-4 sm:py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FolderCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Tender-Ready Safety File Generator
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                CR 2014 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instant statutory H&S dossier for South African contractors, tenders, and site gate clearances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Download Count Pill */}
          <div 
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer ${
              downloadCount >= MAX_DOWNLOAD_LIMIT && !isPaidUnlocked
                ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
            onClick={() => setShowUpgradeModal(true)}
            title="Click to view upgrade options"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloads: {downloadCount}/{MAX_DOWNLOAD_LIMIT}</span>
            {downloadCount >= MAX_DOWNLOAD_LIMIT && !isPaidUnlocked && (
              <span className="bg-rose-600 text-white text-[9px] px-1 py-0.2 rounded font-bold">LOCKED</span>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Close Wizard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Step Navigation Indicator */}
      <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-950/40 text-xs font-mono">
        {[
          { step: 1, label: '1. Profile & COID', icon: Building2 },
          { step: 2, label: '2. Trades & SWPs', icon: HardHat },
          { step: 3, label: '3. Appointments', icon: Users },
          { step: 4, label: '4. File Blueprint & Preview', icon: FileSpreadsheet }
        ].map((item) => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          const Icon = item.icon;
          return (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step as any)}
              className={`py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
                isActive
                  ? 'border-cyan-500 text-cyan-300 bg-cyan-500/5 font-bold'
                  : isDone
                  ? 'border-emerald-500/80 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Icon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden font-bold">Step {item.step}</span>
            </button>
          );
        })}
      </div>

      {/* Wizard Step Body */}
      <div className="p-6 sm:p-8 overflow-y-auto max-h-[68vh] space-y-6">
        
        {/* ================= STEP 1: Company Profile & Compliance Docs ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
                  Step 1: Contractor & Statutory Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Enter your registered legal entity details. These are embedded directly into Section 37.2 agreements.
                </p>
              </div>
              <span className="text-xs text-amber-400 font-mono font-semibold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                OHS Act 16(1) / (2)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name of Managing Director / Safety Lead *
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  placeholder="e.g. David Khumalo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Legal Entity Name (Pty Ltd / CC) *
                </label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={e => setProfile({ ...profile, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  placeholder="e.g. Apex Trade & Civils (Pty) Ltd"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  CIPC Registration Number *
                </label>
                <input
                  type="text"
                  value={profile.cipcRegNumber}
                  onChange={e => setProfile({ ...profile, cipcRegNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  placeholder="2021/123456/07"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  COIDA / FEM Registration Number *
                </label>
                <input
                  type="text"
                  value={profile.coidNumber}
                  onChange={e => setProfile({ ...profile, coidNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  placeholder="990001248573"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SARS Tax Compliance Status (PIN) *
                </label>
                <input
                  type="text"
                  value={profile.sarsPin}
                  onChange={e => setProfile({ ...profile, sarsPin: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  placeholder="9482716301"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone & WhatsApp *
                </label>
                <input
                  type="text"
                  value={profile.contactPhone}
                  onChange={e => setProfile({ ...profile, contactPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  placeholder="+27 82 000 0000"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Tender Title & Scope Location *
                </label>
                <input
                  type="text"
                  value={profile.projectTenderName}
                  onChange={e => setProfile({ ...profile, projectTenderName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  placeholder="Tender No. / Subcontract Scope Description"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Principal Client / Mining Corporation / Main Contractor *
                </label>
                <input
                  type="text"
                  value={profile.clientPrincipalName}
                  onChange={e => setProfile({ ...profile, clientPrincipalName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  placeholder="e.g. Anglo Platinum, Exxaro, Murray & Roberts, Municipality"
                />
              </div>
            </div>

            {/* Mandatory Document Verification Check */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Mandatory Supporting Compliance Attachments
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(docUploads).map(([key, doc]) => (
                  <div 
                    key={key}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        doc.uploaded ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {doc.uploaded ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {doc.uploaded ? `${doc.fileName} (${doc.size})` : 'Pending attachment'}
                        </div>
                      </div>
                    </div>

                    {!doc.uploaded ? (
                      <button
                        type="button"
                        onClick={() => handleSimulatedUpload(key)}
                        className="px-2.5 py-1 text-[10px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 hover:bg-cyan-900 rounded-lg transition cursor-pointer"
                      >
                        Attach
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: Trades & Scope Selection ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
                  Step 2: Subcontractor Trade Packages & Risk Tier
                </h3>
                <p className="text-xs text-slate-400">
                  Select all active scopes of work. MeloTwo will automatically inject matching SANS Safe Work Procedures and Hazard Identification (HIRA).
                </p>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                {selectedTrades.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AVAILABLE_TRADES.map((trade) => {
                const isSelected = selectedTrades.includes(trade.id);
                const Icon = trade.icon;
                const riskBadgeColors = {
                  Low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                  Medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                  High: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
                  Critical: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }[trade.riskLevel];

                return (
                  <div
                    key={trade.id}
                    onClick={() => toggleTrade(trade.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{trade.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{trade.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono ${riskBadgeColors}`}>
                            {trade.riskLevel} Risk
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-cyan-500 bg-cyan-500 text-slate-950' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        {trade.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{trade.swps.length} Statutory SWPs</span>
                      <span className="text-cyan-400 font-semibold">{trade.methodStatements.length} Method Statements</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: Legal Appointments ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
                  Step 3: Statutory Duty-Bearer Legal Appointments
                </h3>
                <p className="text-xs text-slate-400">
                  Assign key personnel to mandatory legal appointments required by Construction Regulations 2014 & OHSA.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutofillSupervisor}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-fill Lead
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Section 16.2 Assistant to CEO / Director *
                </label>
                <input
                  type="text"
                  value={staff.ceoSupervisorName}
                  onChange={e => setStaff({ ...staff, ceoSupervisorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Construction Manager (CR 8.1) *
                </label>
                <input
                  type="text"
                  value={staff.constructionManagerName}
                  onChange={e => setStaff({ ...staff, constructionManagerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Certified First Aider (GSR 3) *
                </label>
                <input
                  type="text"
                  value={staff.firstAiderName}
                  onChange={e => setStaff({ ...staff, firstAiderName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fire Fighting Officer (ER 9) *
                </label>
                <input
                  type="text"
                  value={staff.fireMarshalName}
                  onChange={e => setStaff({ ...staff, fireMarshalName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Health & Safety Representative (Sec 17/18) *
                </label>
                <input
                  type="text"
                  value={staff.safetyRepName}
                  onChange={e => setStaff({ ...staff, safetyRepName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lead Risk Assessor (CR 9.1) *
                </label>
                <input
                  type="text"
                  value={staff.riskAssessorName}
                  onChange={e => setStaff({ ...staff, riskAssessorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold block">Statutory Legal Protection</span>
                All appointed staff names will be formatted into official statutory appointment templates according to Construction Regulations 2014 Annexure A.
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: Dynamic Output, Watermarking Preview & Blueprint ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
                  Step 4: Safety File Blueprint & Watermarked Preview
                </h3>
                <p className="text-xs text-slate-400">
                  Review the structured dossier, inspect the live watermarked document preview, or compile the complete PDF.
                </p>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('live_preview')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePreviewTab === 'live_preview'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('blueprint')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePreviewTab === 'blueprint'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Section Blueprint
                </button>
              </div>
            </div>

            {/* TAB 1: LIVE WATERMARKED PREVIEW (Anti-Screenshot Layer) */}
            {activePreviewTab === 'live_preview' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Anti-Screenshot Watermarked Draft Document
                  </span>
                  <span className="text-slate-400">Page 1 of 45 (Live Render)</span>
                </div>

                {/* THE WATERMARKED PREVIEW CANVAS */}
                <div className="relative bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-2xl border-4 border-slate-800 select-none overflow-hidden min-h-[380px]">
                  
                  {/* DIAGONAL ANTI-SCREENSHOT WATERMARK OVERLAYS */}
                  <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-around rotate-[-25deg] scale-125 opacity-25">
                    <div className="whitespace-nowrap text-rose-600 font-black text-xs sm:text-sm tracking-widest uppercase text-center py-2 bg-rose-500/10 border-y border-rose-500/30">
                      PREVIEW ONLY • TENDER SAFETY FILE • NOT FOR OFFICIAL SUBMISSION UNTIL PURCHASED
                    </div>
                    <div className="whitespace-nowrap text-rose-600 font-black text-xs sm:text-sm tracking-widest uppercase text-center py-2 bg-rose-500/10 border-y border-rose-500/30">
                      PREVIEW ONLY • TENDER SAFETY FILE • NOT FOR OFFICIAL SUBMISSION UNTIL PURCHASED
                    </div>
                    <div className="whitespace-nowrap text-rose-600 font-black text-xs sm:text-sm tracking-widest uppercase text-center py-2 bg-rose-500/10 border-y border-rose-500/30">
                      PREVIEW ONLY • TENDER SAFETY FILE • NOT FOR OFFICIAL SUBMISSION UNTIL PURCHASED
                    </div>
                    <div className="whitespace-nowrap text-rose-600 font-black text-xs sm:text-sm tracking-widest uppercase text-center py-2 bg-rose-500/10 border-y border-rose-500/30">
                      PREVIEW ONLY • TENDER SAFETY FILE • NOT FOR OFFICIAL SUBMISSION UNTIL PURCHASED
                    </div>
                  </div>

                  {/* Document Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        REPUBLIC OF SOUTH AFRICA • OCCUPATIONAL HEALTH AND SAFETY ACT 85 OF 1993
                      </div>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 mt-1">
                        STATUTORY HEALTH AND SAFETY TENDER FILE
                      </h3>
                      <p className="text-xs font-semibold text-slate-600">
                        Construction Regulations 2014 & Section 37(2) Mandatary Agreement Dossier
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-700">
                        REF: M2-ZA-2026
                      </span>
                    </div>
                  </div>

                  {/* Document Body Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Appointed Contractor</span>
                      <span className="font-bold text-slate-900">{profile.companyName}</span>
                      <span className="block text-[11px] text-slate-600">CIPC: {profile.cipcRegNumber}</span>
                      <span className="block text-[11px] text-slate-600">COID / WCA: {profile.coidNumber}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Principal Employer / Client</span>
                      <span className="font-bold text-slate-900">{profile.clientPrincipalName}</span>
                      <span className="block text-[11px] text-slate-600">Scope: {profile.projectTenderName.slice(0, 40)}...</span>
                      <span className="block text-[11px] text-slate-600">Managing Lead: {profile.fullName}</span>
                    </div>
                  </div>

                  {/* Document Trade Table Sample */}
                  <div className="border border-slate-200 rounded overflow-hidden text-[11px] mb-4">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                      <span>Mapped Trades & Safe Work Procedures ({totalSwps} SWPs)</span>
                      <span>Risk Tier</span>
                    </div>
                    <div className="p-3 space-y-1.5 bg-white">
                      {activeTradeObjects.map(t => (
                        <div key={t.id} className="flex justify-between items-center border-b border-slate-100 pb-1">
                          <span className="font-semibold text-slate-800">• {t.name}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-600">{t.riskLevel}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 37.2 Notice snippet */}
                  <div className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-200 pt-2">
                    * Section 37(2) Mandatary Agreement legally indemnifies the Principal Client by transferring statutory duty of care to appointed Section 16.2 and CR 8.1 personnel in accordance with SANS 10330 & DMR Mine Standards.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECTION BLUEPRINT VIEW */}
            {activePreviewTab === 'blueprint' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Generated Safety File Master Index ({profile.companyName})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullDocIndex(!showFullDocIndex)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                  >
                    {showFullDocIndex ? 'Hide Breakdown' : 'Expand All Sections'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        Tab 01: Legal & Mandatory Agreements
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Included
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Section 37.2 Mandatory Agreement, OHS 16.2 Delegation, and Client SHE Specifications sign-off.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        Tab 02: Statutory Registration & COID
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Included
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      COID Good Standing ({profile.coidNumber}), Tax PIN, CIPC Org Structure, and Public Liability schedule.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-amber-400" />
                        Tab 03: Safe Work Procedures ({totalSwps})
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {totalSwps} Procedures
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tailored for: {activeTradeObjects.map(t => t.name).join(', ')}.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                        Tab 04: Method Statements & HIRA
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {totalMethodStatements} Scopes
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Baseline Risk Assessment Matrix (CR 9.1) & Task Risk Assessments.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        Tab 05: Inspection Registers & Toolbox Talks
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        12 Talks + 8 Logs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Daily portable electrical tool checklist, PPE issue register, ladder inspections, first aid treatment logs, and 12 weekly safety talks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price & Commercial Package Box */}
            <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Once-Off Option */}
                <div className="p-4 bg-slate-900/90 border border-cyan-500/40 rounded-xl space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Tender-Ready Safety File PDF
                    </span>
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                      Once-off
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    R750 <span className="text-xs font-normal text-slate-400">once-off</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Instant complete 45+ page audit-ready PDF formatted for immediate tender submission and client vetting.
                  </p>
                </div>

                {/* Subscription Option */}
                <div className="p-4 bg-slate-950/60 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      SMB Continuous SHEQ Plan
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    R1,999 <span className="text-xs font-normal text-slate-400">/ mo</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Unlimited file generation, mobile offline audits, QR-code worker passport verification, and daily compliance logs.
                  </p>
                </div>
              </div>

              {/* Primary Action Button with Download Limit Enforcement */}
              <div className="pt-2">
                <button
                  id="generate-tender-pdf-cta"
                  type="button"
                  onClick={handleDownloadClick}
                  disabled={isGeneratingPdf}
                  className={`w-full py-3.5 px-4 text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                    downloadCount >= MAX_DOWNLOAD_LIMIT && !isPaidUnlocked
                      ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/80'
                      : 'bg-gradient-to-r from-amber-500 via-cyan-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 shadow-cyan-950/80'
                  }`}
                >
                  {isGeneratingPdf ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Compiling Statutory Documents & Watermarks...
                    </>
                  ) : downloadCount >= MAX_DOWNLOAD_LIMIT && !isPaidUnlocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Download Limit Reached (3/3) • Upgrade to Download
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Generate & Download Safety File PDF ({MAX_DOWNLOAD_LIMIT - downloadCount} Free Left)
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {pdfGeneratedSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-mono animate-in fade-in">
                  ✓ Safety File PDF compiled and downloaded successfully as <span className="font-bold text-white">{profile.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Tender_Safety_File.pdf</span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Footer Navigation Controls */}
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(prev => (prev > 1 ? (prev - 1 as any) : prev))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Step
        </button>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Step {currentStep} of 4 • {currentStep === 4 ? 'Ready to Export' : 'In Progress'}
        </div>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => (prev < 4 ? (prev + 1 as any) : prev))}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={isGeneratingPdf}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              downloadCount >= MAX_DOWNLOAD_LIMIT && !isPaidUnlocked
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/40'
            }`}
          >
            {downloadCount >= MAX_DOWNLOAD_LIMIT && !isPaidUnlocked ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {isGeneratingPdf ? 'Compiling...' : downloadCount >= MAX_DOWNLOAD_LIMIT && !isPaidUnlocked ? 'Upgrade to Unlock' : 'Download File'}
          </button>
        )}
      </div>

      {/* ================= MODAL: UpgradeModal (Triggered when downloadCount >= 3) ================= */}
      {showUpgradeModal && (
        <div 
          id="upgrade-modal-backdrop"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              aria-label="Close Upgrade Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Conversion Lock
                </span>
                <h3 className="text-lg font-black text-white tracking-tight mt-1">
                  Download Limit Reached
                </h3>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Download Limit Reached. To generate unlimited site-specific safety files and conduct live daily site inspections, upgrade to the <strong>SMB Plan (R1,999/mo)</strong>.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Included in the MeloTwo SMB Plan:
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited</strong> Tender-Ready Safety File PDF generation & downloads.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Un-watermarked</strong>, high-res audit dossiers with digital signing.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Live Daily Field Audits</strong> with offline mobile sync & automated CAPA.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>QR Worker Passports</strong> for rapid gate entrance & DMRE compliance.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsPaidUnlocked(true);
                  setShowUpgradeModal(false);
                  alert('Thank you for subscribing to MeloTwo SMB Plan (R1,999/mo). Your account is now fully unlocked for unlimited file downloads!');
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-amber-950/80 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Upgrade to SMB Plan (R1,999 / mo)
              </button>

              <button
                type="button"
                onClick={() => {
                  // Simulate R750 once-off payment
                  setIsPaidUnlocked(true);
                  setShowUpgradeModal(false);
                  alert('Once-off Tender File Purchase (R750) successful. Generating clean unwatermarked PDF...');
                  generateTenderSafetyFile();
                }}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Or Buy Single Tender File (Once-off R750)</span>
              </button>
            </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {containerContent}
    </div>
  );
};
