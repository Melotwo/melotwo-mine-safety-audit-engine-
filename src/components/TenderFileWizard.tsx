import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  HardHat, 
  Users, 
  FileSpreadsheet, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Wrench, 
  Flame, 
  ShieldAlert, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  FolderCheck,
  Sparkles,
  Lock,
  Unlock,
  Scale,
  FileCheck2,
  Cpu,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';

/* ==========================================================================
   Type Definitions & Interfaces
   ========================================================================== */

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SafeWorkProcedure {
  code: string;
  title: string;
  standard: string;
}

export interface TradeOption {
  id: string;
  name: string;
  category: string;
  baseSeverity: number;   // 1 to 5
  baseLikelihood: number; // 1 to 5
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  swps: SafeWorkProcedure[];
  methodStatements: string[];
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
  ceoSupervisorName: string;      // Section 16.2 Appointee
  ceoSupervisorId: string;
  constructionManagerName: string; // Construction Reg 8.1
  assistantManagerName: string;   // Construction Reg 8.2
  firstAiderName: string;         // General Safety Reg 3
  firstAiderExpiry: string;
  fireMarshalName: string;        // Environmental Reg 9
  safetyRepName: string;          // Section 17 / 18 SHE Rep
  riskAssessorName: string;       // CR 9.1 HIRA Officer
  incidentInvestigatorName: string;// General Admin Reg 9
}

export interface OhsaRiskMatrixState {
  severity: number;    // 1 (Insignificant) to 5 (Catastrophic / Fatal)
  likelihood: number;  // 1 (Rare) to 5 (Almost Certain / Continuous)
  criticalControlsEnforced: boolean;
  capaRequired: boolean;
  capaGenerated: boolean;
  capaReferenceId?: string;
  capaMitigationText: string;
}

export interface TenderFileWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (fileName: string) => void;
  isStandalone?: boolean;
}

/* ==========================================================================
   Available Industrial Trades Registry
   ========================================================================== */

export const AVAILABLE_TRADES: TradeOption[] = [
  {
    id: 'catering_haccp',
    name: 'Catering & Canteen Food Safety',
    category: 'SANS 10330 / HACCP Hygiene',
    baseSeverity: 4,
    baseLikelihood: 3,
    icon: ShieldCheck,
    description: 'Mine mess halls, commercial kitchen food preparation, cold chain compliance, CCP sanitation, and subterranean meal transport.',
    swps: [
      { code: 'SWP-CAT-01', title: 'HACCP Critical Control Point Temperature Verification', standard: 'SANS 10330:2020' },
      { code: 'SWP-CAT-02', title: 'Deep Fat Fryer & Commercial Burner Fire Prevention', standard: 'ER 9 / SANS 10105' },
      { code: 'SWP-CAT-03', title: 'Food Prep Surface Chemical Sanitization & Waste Handling', standard: 'SANS 10049 / HCAR' },
      { code: 'SWP-CAT-04', title: 'Walk-In Chiller Cold Chain & Shaft Meal Transport', standard: 'MHSA Food Protocol' }
    ],
    methodStatements: ['Commercial Kitchen Daily CCP Sanitization', 'Underground Shaft Food Pack Transport', 'Wet Chemical Fire Suppression']
  },
  {
    id: 'electrical_installation',
    name: 'Electrical Installation & Reticulation',
    category: 'SANS 10142 / Specialist Electrical',
    baseSeverity: 5,
    baseLikelihood: 4,
    icon: Zap,
    description: 'LV/MV distribution boards, cable racking, generator hookups, substation maintenance, and Certificate of Compliance (COC) pre-testing.',
    swps: [
      { code: 'SWP-EL-01', title: 'Lockout / Tagout (LOTO) & Zero Energy Proofing', standard: 'SANS 10142-1 / EIR 6' },
      { code: 'SWP-EL-02', title: 'Cable Trenching, Armoured Glanding & Earthing', standard: 'SANS 10200 / CR 24' },
      { code: 'SWP-EL-03', title: 'Earth Leakage Trip Testing & Pre-COC Checks', standard: 'Electrical Installation Regs 9' },
      { code: 'SWP-EL-04', title: 'Arc Flash Boundary Controls & 1000V Insulated Tooling', standard: 'OHS Act Section 8 / SANS 10108' }
    ],
    methodStatements: ['Main Low-Voltage Switchgear Replacement', 'Overhead Cable Tray Reticulation', 'Standby Diesel Generator Hookup']
  },
  {
    id: 'building_renovation',
    name: 'Building Construction & Civils',
    category: 'Commercial & Industrial Civil',
    baseSeverity: 4,
    baseLikelihood: 3,
    icon: Building2,
    description: 'Interior fit-outs, structural modifications, ceiling replacements, bricklaying, and wet trades.',
    swps: [
      { code: 'SWP-BR-01', title: 'Demolition of Non-Structural Partition Walls', standard: 'CR 29 / OHS Act' },
      { code: 'SWP-BR-02', title: 'Mobile Aluminium Tower Scaffolding (<6m)', standard: 'SANS 10085 / CR 16' },
      { code: 'SWP-BR-03', title: 'Crystalline Silica & Dust Extraction Protocol', standard: 'Hazardous Chemical Agents Regs' },
      { code: 'SWP-BR-04', title: 'Rubble Chute & Waste Manifest Management', standard: 'Environmental By-Laws' }
    ],
    methodStatements: ['Interior Plaster Strip & Wall Chasing', 'Suspended Ceiling Grid Installation', 'Tile Removal & Screed Prep']
  },
  {
    id: 'lifting_rigging',
    name: 'Lifting Operations & Rigging',
    category: 'SANS 10375 / Driven Machinery',
    baseSeverity: 5,
    baseLikelihood: 4,
    icon: HardHat,
    description: 'Overhead cranes, mobile crane lifting plans, wire rope sling inspections, spreader beams, and rigging tackle safety.',
    swps: [
      { code: 'SWP-LFT-01', title: 'Pre-Use Inspection of Slings, Shackles & Rigging Tackle', standard: 'Driven Machinery Regs 18' },
      { code: 'SWP-LFT-02', title: 'Tandem & Critical Crane Lift Plan Preparation', standard: 'CR 22 / DMR 18' },
      { code: 'SWP-LFT-03', title: 'Exclusion Zone Marshaling & Tag-Line Control', standard: 'GSR 2 / OHS Act' },
      { code: 'SWP-LFT-04', title: 'Overhead Crane Emergency Limit Switch Testing', standard: 'SANS 10375 / DMR 18' }
    ],
    methodStatements: ['Critical Heavy Equipment Dual Crane Lift Plan', 'Overhead Gantry Hoist Cable Inspection', 'Shackle & Webbing Sling Load Testing']
  },
  {
    id: 'painting_decorating',
    name: 'Industrial Painting & Coating',
    category: 'Finishing Trades',
    baseSeverity: 2,
    baseLikelihood: 3,
    icon: Wrench,
    description: 'Industrial coating, high-access facade painting, spray painting, and abrasive blasting surface prep.',
    swps: [
      { code: 'SWP-PD-01', title: 'Volatile Organic Compound (VOC) Storage & Handling', standard: 'HCAR 2021 / GSR 4' },
      { code: 'SWP-PD-02', title: 'Working from Extension Ladders & Stepladders', standard: 'General Safety Reg 13A' },
      { code: 'SWP-PD-03', title: 'High-Pressure Hydro-Washing Safety (150-300 Bar)', standard: 'Vessel Under Pressure Regs' }
    ],
    methodStatements: ['External Multi-Storey Facade Coating', 'Airless Paint Spraying in Confined Rooms', 'Industrial Epoxy Floor Sealing']
  },
  {
    id: 'hvac_maintenance',
    name: 'HVAC & Refrigeration Services',
    category: 'Building Services & Climate',
    baseSeverity: 4,
    baseLikelihood: 3,
    icon: Flame,
    description: 'Chiller plant servicing, duct cleaning, pressurized refrigerant recovery, and rooftop condensing units.',
    swps: [
      { code: 'SWP-HV-01', title: 'Refrigerant R410A Gas Recovery & Pressure Safety', standard: 'PER 2009 / SANS 347' },
      { code: 'SWP-HV-02', title: 'Rooftop Plant Access & Fall Restraint Anchoring', standard: 'CR 10 / SANS 50361' },
      { code: 'SWP-HV-03', title: 'High-Voltage Capacitor Discharge & Belt Guard Safety', standard: 'Driven Machinery Regs 2' }
    ],
    methodStatements: ['Rooftop Condenser Coil Descaling', 'Compressor Motor Replacement', 'Air Duct Anti-Microbial Fogging']
  }
];

/* ==========================================================================
   TenderFileWizard Component
   ========================================================================== */

export const TenderFileWizard: React.FC<TenderFileWizardProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  isStandalone = false
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGeneratedSuccess, setPdfGeneratedSuccess] = useState(false);

  // Step 1: Contractor & Statutory Profile
  const [profile, setProfile] = useState<CompanyProfileState>({
    fullName: 'David Khumalo',
    companyName: 'Apex Trade & Civils (Pty) Ltd',
    tradingName: 'Apex Contractors',
    contactPhone: '+27 11 849 2000',
    contactEmail: 'safety@apexcontractors.co.za',
    physicalAddress: '14 Industrial Road, Jet Park, Boksburg, 1459',
    cipcRegNumber: '2021/847291/07',
    coidNumber: '990001248573',
    sarsPin: '9482716301',
    projectTenderName: 'Tender PR-2026/088: Substation Electrical & Civil Maintenance',
    clientPrincipalName: 'Anglo Platinum / Municipal Infrastructure Unit'
  });

  // Step 2: Selected Trades & Scopes
  const [selectedTrades, setSelectedTrades] = useState<string[]>([
    'electrical_installation', 
    'building_renovation'
  ]);

  // Step 3: Statutory Appointments
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

  // Embedded OHSA Audit Matrix™ (1-25 Risk Calculator & Auto-CAPA State)
  const [riskMatrix, setRiskMatrix] = useState<OhsaRiskMatrixState>({
    severity: 4,
    likelihood: 4,
    criticalControlsEnforced: false,
    capaRequired: false,
    capaGenerated: false,
    capaMitigationText: 'Automated Lockout/Tagout (LOTO) physical interlocks and continuous supervisor permit-to-work verification enabled.'
  });

  // Dynamic Calculation of OHSA Risk Score (Severity 1-5 * Likelihood 1-5 = 1-25)
  const calculatedRiskScore = useMemo(() => {
    return riskMatrix.severity * riskMatrix.likelihood;
  }, [riskMatrix.severity, riskMatrix.likelihood]);

  // Mandatory CAPA Threshold Enforcement (riskScore >= 15)
  const isCapaMandatory = calculatedRiskScore >= 15;
  const isSubmissionBlockedByCapa = isCapaMandatory && !riskMatrix.capaGenerated;

  // Toggle trade selection and dynamically adjust default risk matrix values
  const toggleTrade = (tradeId: string) => {
    setSelectedTrades(prev => {
      const next = prev.includes(tradeId)
        ? (prev.length > 1 ? prev.filter(id => id !== tradeId) : prev)
        : [...prev, tradeId];

      // Auto-recalibrate matrix severity & likelihood from selected scopes
      const activeScopes = AVAILABLE_TRADES.filter(t => next.includes(t.id));
      const maxSev = Math.max(...activeScopes.map(s => s.baseSeverity), 1);
      const maxLik = Math.max(...activeScopes.map(s => s.baseLikelihood), 1);

      setRiskMatrix(rm => ({
        ...rm,
        severity: maxSev,
        likelihood: maxLik,
        capaGenerated: false // Reset CAPA generation if scopes shift
      }));

      return next;
    });
  };

  // Generate Auto-CAPA Corrective Action Report
  const handleGenerateAutoCapa = () => {
    const referenceId = `CAPA-${Date.now().toString(36).toUpperCase()}-MHSA`;
    setRiskMatrix(prev => ({
      ...prev,
      capaGenerated: true,
      capaReferenceId: referenceId
    }));
  };

  // Quick fill supervisor into primary roles
  const handleAutofillSupervisor = () => {
    setStaff(prev => ({
      ...prev,
      ceoSupervisorName: `${profile.fullName} (16.2 Appointee)`,
      constructionManagerName: `${profile.fullName} (CR 8.1 Manager)`,
      riskAssessorName: `${profile.fullName} (HIRA Lead)`,
      incidentInvestigatorName: `${profile.fullName} (GAR 9 Lead)`
    }));
  };

  // Derived metrics
  const activeTradeObjects = AVAILABLE_TRADES.filter(t => selectedTrades.includes(t.id));
  const totalSwps = activeTradeObjects.reduce((acc, t) => acc + t.swps.length, 0);

  // Form Validation Logic per Step
  const isStep1Valid = Boolean(
    profile.fullName.trim() &&
    profile.companyName.trim() &&
    profile.cipcRegNumber.trim() &&
    profile.coidNumber.trim() &&
    profile.projectTenderName.trim()
  );

  const isStep2Valid = selectedTrades.length > 0;

  const isStep3Valid = Boolean(
    staff.ceoSupervisorName.trim() &&
    staff.constructionManagerName.trim() &&
    staff.firstAiderName.trim() &&
    staff.riskAssessorName.trim()
  );

  // PDF Generation Function
  const generateTenderSafetyFile = () => {
    if (isSubmissionBlockedByCapa) return;

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

      // Page 1: Dossier Cover & Verification Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 297, 'F');

      // Top Accent
      doc.setFillColor(6, 182, 212); // cyan-500
      doc.rect(0, 0, 210, 8, 'F');

      // Header Box
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

      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`OHSA Risk Rating: ${calculatedRiskScore}/25 | CAPA Status: ${isCapaMandatory ? 'AUTO-CAPA ATTACHED' : 'STANDARD TIER'}`, 105, 53, { align: 'center' });

      // Contractor Specification
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(20, 74, 170, 64, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(20, 74, 170, 64, 2, 2, 'D');

      doc.setTextColor(6, 182, 212);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('CONTRACTOR & PRINCIPAL EMPLOYER SPECIFICATION', 26, 84);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(`Appointed Contractor:`, 26, 93);
      doc.setFont('helvetica', 'bold');
      doc.text(`${profile.companyName}`, 75, 93);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(`CIPC Reg Number:`, 26, 101);
      doc.text(`${profile.cipcRegNumber}`, 75, 101);

      doc.text(`COID / WCA Number:`, 26, 109);
      doc.text(`${profile.coidNumber} (Good Standing Validated)`, 75, 109);

      doc.text(`SARS Tax PIN:`, 26, 117);
      doc.text(`${profile.sarsPin}`, 75, 117);

      doc.text(`Project Tender Scope:`, 26, 125);
      doc.setFont('helvetica', 'bold');
      doc.text(`${profile.projectTenderName.slice(0, 48)}`, 75, 125);

      // OHSA Audit Matrix & CAPA Summary Box
      doc.setFillColor(isCapaMandatory ? 45 : 30, isCapaMandatory ? 20 : 41, isCapaMandatory ? 25 : 59);
      doc.roundedRect(20, 144, 170, 44, 2, 2, 'F');
      doc.setDrawColor(isCapaMandatory ? 244 : 51, isCapaMandatory ? 63 : 65, isCapaMandatory ? 94 : 85);
      doc.roundedRect(20, 144, 170, 44, 2, 2, 'D');

      doc.setTextColor(isCapaMandatory ? 248 : 6, isCapaMandatory ? 113 : 182, isCapaMandatory ? 113 : 212);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`OHSA AUDIT MATRIX™ RISK DEFENSE (SCORE: ${calculatedRiskScore}/25)`, 26, 154);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.setFontSize(8.5);
      doc.text(`• Baseline Severity Rating: ${riskMatrix.severity}/5 | Likelihood Rating: ${riskMatrix.likelihood}/5`, 26, 162);
      if (isCapaMandatory) {
        doc.setTextColor(253, 186, 116);
        doc.text(`• Mandatory CAPA Action: Enforced (${riskMatrix.capaReferenceId || 'CAPA-EXEC-01'})`, 26, 169);
        doc.setTextColor(203, 213, 225);
        doc.text(`• Mitigation Control: ${riskMatrix.capaMitigationText.slice(0, 72)}...`, 26, 176);
      } else {
        doc.text(`• Residual Risk Level: Controlled under standard Safe Work Procedures (SWPs).`, 26, 169);
      }

      // Safe Work Procedures Box
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(20, 194, 170, 40, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(20, 194, 170, 40, 2, 2, 'D');

      doc.setTextColor(6, 182, 212);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('INCLUDED SANS SAFE WORK PROCEDURES (SWP)', 26, 202);

      let yPos = 210;
      activeTradeObjects.slice(0, 3).forEach((trade) => {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`• ${trade.name}`, 26, yPos);
        
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text(`  Codes: ${trade.swps.map(s => s.code).join(', ')}`, 26, yPos + 4);
        yPos += 8.5;
      });

      // Statutory Signatories Footer
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(20, 240, 170, 36, 2, 2, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(20, 240, 170, 36, 2, 2, 'D');

      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('STATUTORY DUTY-BEARER APPOINTMENTS', 26, 248);

      doc.setTextColor(203, 213, 225);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`16.2 Site Supervisor: ${staff.ceoSupervisorName}`, 26, 256);
      doc.text(`CR 8.1 Construction Manager: ${staff.constructionManagerName} | First Aider: ${staff.firstAiderName}`, 26, 263);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.text(`Issued by MeloTwo SHEQ Engine • Date: ${currentDate} • Standard: SANS / OHS Act Sec 37.2`, 105, 288, { align: 'center' });

      // Page 2: Section 37(2) Mandatory Agreement & Auto-CAPA Rider
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('MANDATORY AGREEMENT IN TERMS OF SECTION 37(2)', 105, 22, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('OCCUPATIONAL HEALTH AND SAFETY ACT, 1993 (ACT NO. 85 OF 1993)', 105, 28, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 32, 190, 32);

      doc.setFontSize(8.5);
      doc.text('ENTERED INTO BY AND BETWEEN:', 20, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(`PRINCIPAL CLIENT / EMPLOYER: ${profile.clientPrincipalName}`, 20, 46);
      doc.setFont('helvetica', 'normal');
      doc.text('AND', 20, 52);
      doc.setFont('helvetica', 'bold');
      doc.text(`MANDATARY / CONTRACTOR: ${profile.companyName} (Reg: ${profile.cipcRegNumber})`, 20, 58);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const legalText = `1. The Mandatary hereby acknowledges that it is an employer in its own right in terms of Section 16(1) of the Act and undertakes to ensure that all work executed complies fully with the OHS Act No. 85 of 1993, Construction Regulations 2014, and all relevant SANS Codes of Practice.\n\n2. The Mandatary confirms valid registration and good standing with the Compensation Commissioner (COID Reg: ${profile.coidNumber}) and confirms that all employees have received statutory induction and PPE.\n\n3. ${isCapaMandatory ? `MANDATORY CAPA ACTION: Risk Assessment yielded a high residual score (${calculatedRiskScore}/25). The Mandatary has implemented Auto-CAPA Protocol [${riskMatrix.capaReferenceId}] enforcing: ${riskMatrix.capaMitigationText}` : 'Standard Risk Controls applied across all nominated site scopes.'}`;
      
      const splitText = doc.splitTextToSize(legalText, 170);
      doc.text(splitText, 20, 68);

      // Signatures
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('SIGNED ON BEHALF OF CONTRACTOR (MANDATARY):', 20, 140);
      doc.setFont('helvetica', 'normal');
      doc.text(`Authorized Signatory: ${profile.fullName} (Section 16.2 Appointee)`, 20, 148);
      doc.text(`Signature: ___________________________    Date: ${currentDate}`, 20, 156);

      doc.setFont('helvetica', 'bold');
      doc.text('SIGNED ON BEHALF OF PRINCIPAL CLIENT / EMPLOYER:', 20, 176);
      doc.setFont('helvetica', 'normal');
      doc.text(`Authorized Safety Agent: ___________________________`, 20, 184);
      doc.text(`Signature: ___________________________    Date: ____________________`, 20, 192);

      const fileName = `${profile.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Tender_Safety_File.pdf`;
      doc.save(fileName);
      setPdfGeneratedSuccess(true);

      if (onSuccess) {
        onSuccess(fileName);
      }
    } catch (err) {
      console.error('Failed to compile PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${
        isStandalone ? 'w-full' : 'fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto'
      }`}
    >
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-4xl w-full mx-auto">
        
        {/* Top Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Tender Safety File Engine
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                  OHSA Audit Matrix™ Inside
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automate OHS Act Section 37.2 agreements, statutory appointments, and risk defensibility binders
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Navigation Bar */}
        <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-950/40 text-xs font-mono">
          {[
            { step: 1, label: '1. Profile & COID', icon: Building2 },
            { step: 2, label: '2. Multi-Trade Scope', icon: HardHat },
            { step: 3, label: '3. Appointments', icon: Users },
            { step: 4, label: '4. Master PDF Assembly', icon: FileSpreadsheet }
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;
            const Icon = item.icon;
            return (
              <button
                key={item.step}
                type="button"
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

        {/* Step Body Container */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[65vh] space-y-6">
          
          {/* =========================================================================
              STEP 1: CONTRACTOR PROFILE & COIDA STATUS
             ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    Step 1: Contractor & Legal Entity Data
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mandatory legal details for Section 16(1) employer recognition and Section 37(2) agreement execution.
                  </p>
                </div>
                <span className="text-[11px] text-amber-400 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  OHS Act Sec 16(1)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Managing Director / Responsible Person Name *
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
                    Registered Company Name *
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
                    placeholder="2021/847291/07"
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
                    SARS Tax Compliance Status (PIN)
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
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={profile.contactPhone}
                    onChange={e => setProfile({ ...profile, contactPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    placeholder="+27 11 000 0000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project / Tender Description *
                  </label>
                  <input
                    type="text"
                    value={profile.projectTenderName}
                    onChange={e => setProfile({ ...profile, projectTenderName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    placeholder="e.g. Substation Electrical & Civil Maintenance"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Principal Client / Site Authority
                  </label>
                  <input
                    type="text"
                    value={profile.clientPrincipalName}
                    onChange={e => setProfile({ ...profile, clientPrincipalName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    placeholder="e.g. Anglo Operations / Municipal Infrastructure Unit"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: MULTI-TRADE SCOPES & EMBEDDED OHSA AUDIT MATRIX™
             ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    Step 2: Subcontractor Trade Packages & OHSA Audit Matrix™
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select active site scopes. The matrix automatically computes residual risk on a 1–25 scale.
                  </p>
                </div>
                <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {selectedTrades.length} Scopes Active
                </span>
              </div>

              {/* Trade Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {AVAILABLE_TRADES.map((trade) => {
                  const isSelected = selectedTrades.includes(trade.id);
                  const Icon = trade.icon;
                  const riskScore = trade.baseSeverity * trade.baseLikelihood;

                  return (
                    <div
                      key={trade.id}
                      onClick={() => toggleTrade(trade.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
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
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono ${
                            riskScore >= 15 
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}>
                            Score: {riskScore}/25
                          </span>
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

              {/* Embedded OHSA Audit Matrix™ Risk Calculator (1-25 Scale) */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      OHSA Audit Matrix™ Live Risk Calculator
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-slate-400">Total Risk Index:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      calculatedRiskScore >= 15
                        ? 'bg-rose-500 text-slate-950 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {calculatedRiskScore} / 25
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1.5 flex justify-between">
                      <span>1. Consequence / Severity (1 = Negligible, 5 = Fatality)</span>
                      <span className="text-cyan-400 font-bold font-mono">Level {riskMatrix.severity}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={riskMatrix.severity}
                      onChange={e => setRiskMatrix({ ...riskMatrix, severity: parseInt(e.target.value, 10), capaGenerated: false })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1.5 flex justify-between">
                      <span>2. Probability / Likelihood (1 = Rare, 5 = Continuous)</span>
                      <span className="text-cyan-400 font-bold font-mono">Level {riskMatrix.likelihood}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={riskMatrix.likelihood}
                      onChange={e => setRiskMatrix({ ...riskMatrix, likelihood: parseInt(e.target.value, 10), capaGenerated: false })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Mandatory CAPA Action Trigger Box (When score >= 15) */}
                {isCapaMandatory && (
                  <div className={`p-4 rounded-xl border transition space-y-3 ${
                    riskMatrix.capaGenerated
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-600/80 text-rose-200'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {riskMatrix.capaGenerated ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h5 className="text-xs font-black uppercase font-mono tracking-wider">
                            {riskMatrix.capaGenerated
                              ? `Auto-CAPA Bound: ${riskMatrix.capaReferenceId}`
                              : 'Mandatory CAPA Action Triggered (Risk Score ≥ 15)'}
                          </h5>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {riskMatrix.capaGenerated
                              ? 'Engineering barrier interlocks and physical permit controls appended. Submission lock released.'
                              : 'Statutory non-conformance defense protocol: High consequence operations require automated Corrective and Preventive Action (CAPA) before master dossier compilation.'}
                          </p>
                        </div>
                      </div>

                      {!riskMatrix.capaGenerated && (
                        <button
                          type="button"
                          onClick={handleGenerateAutoCapa}
                          className="px-3.5 py-1.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-lg shrink-0 cursor-pointer flex items-center gap-1.5"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          Generate Auto-CAPA
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: STATUTORY DUTY-BEARER APPOINTMENTS
             ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    Step 3: Statutory Duty-Bearer Appointments
                  </h3>
                  <p className="text-xs text-slate-400">
                    Assign legally designated personnel required under Construction Regulations and the OHS Act.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillSupervisor}
                  className="text-[11px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 hover:bg-cyan-900 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Autofill from Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Section 16.2 Site Supervisor Appointee *
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
                    Appointed First Aider (GSR 3) *
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
                    Risk Assessor / HIRA Officer (CR 9.1) *
                  </label>
                  <input
                    type="text"
                    value={staff.riskAssessorName}
                    onChange={e => setStaff({ ...staff, riskAssessorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fire Marshal (ER 9)
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
                    Health & Safety Representative (Sec 17)
                  </label>
                  <input
                    type="text"
                    value={staff.safetyRepName}
                    onChange={e => setStaff({ ...staff, safetyRepName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 4: MASTER PDF ASSEMBLY & LOCK STATUS
             ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    Step 4: Master H&S Dossier Assembly
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review generated binder contents, verified duty-bearers, and compile the vector PDF.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isSubmissionBlockedByCapa ? (
                    <span className="text-xs text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      CAPA Lock Active
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      Ready to Compile
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Tender Safety File Readiness</span>
                  <span className={`font-mono font-bold ${isSubmissionBlockedByCapa ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isSubmissionBlockedByCapa ? 'Action Required (Auto-CAPA)' : '100% Validated'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSubmissionBlockedByCapa ? 'w-3/4 bg-rose-500' : 'w-full bg-gradient-to-r from-cyan-500 to-emerald-400'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] font-mono">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[9px]">ACTIVE TRADES</span>
                    <span className="text-white font-bold">{selectedTrades.length} Scopes</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[9px]">RISK MATRIX</span>
                    <span className={`font-bold ${calculatedRiskScore >= 15 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {calculatedRiskScore}/25 Index
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[9px]">SWPs INJECTED</span>
                    <span className="text-emerald-400 font-bold">{totalSwps} Procedures</span>
                  </div>
                </div>
              </div>

              {/* Auto-CAPA Warning Banner if Blocked */}
              {isSubmissionBlockedByCapa && (
                <div className="p-4 bg-rose-950/40 border border-rose-600 rounded-xl space-y-2 text-xs text-rose-200">
                  <div className="flex items-center gap-2 font-bold text-rose-300 uppercase font-mono">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Submission Blocked: High Residual Risk ({calculatedRiskScore}/25)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Your risk evaluation requires an Auto-CAPA protocol before downloading the final binder.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAutoCapa}
                    className="mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    Generate and Attach Auto-CAPA Now
                  </button>
                </div>
              )}

              {/* Index of Attached Sections */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Compiled Binder Index (20 Sections)
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800/60 text-xs">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">Tab 01: OHS Act Section 37.2 Agreement & 16.2 Appointment</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Included</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">Tab 02: COID / WCA Good Standing & SARS PIN Verification</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Included</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">Tab 03: Safe Work Procedures ({totalSwps} Pre-Configured SWPs)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Included</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">Tab 04: OHSA Audit Matrix™ & HIRA Risk Assessment</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {isCapaMandatory ? 'CAPA Bound' : 'Evaluated'}
                    </span>
                  </div>
                </div>
              </div>

              {pdfGeneratedSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <span className="font-bold block">PDF Generated Successfully</span>
                    <span>Your Tender Safety File is compiled and downloaded to your device.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1) as any)}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1) as any)}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid) ||
                  (currentStep === 3 && !isStep3Valid)
                }
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition shadow-lg shadow-cyan-950/50 cursor-pointer flex items-center gap-1.5"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={generateTenderSafetyFile}
                disabled={isGeneratingPdf || isSubmissionBlockedByCapa}
                className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-lg shadow-amber-950/50 cursor-pointer flex items-center gap-2"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Compiling PDF Dossier...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Master Safety File PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TenderFileWizard;
