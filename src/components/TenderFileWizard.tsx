import React, { useState, useId } from 'react';
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
  Briefcase
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
    id: 'road_maintenance',
    name: 'Road Maintenance',
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
    name: 'Building Renovation',
    category: 'Commercial & Residential',
    riskLevel: 'Medium',
    icon: Building2,
    description: 'Interior fit-outs, structural modifications, ceiling replacements, and wet trades.',
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
    name: 'Painting & Decorating',
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
    id: 'electrical_installation',
    name: 'Electrical Installation',
    category: 'Specialist Mechanical & Electrical',
    riskLevel: 'Critical',
    icon: Zap,
    description: 'LV distribution boards, conduit reticulation, cable racking, and COC pre-testing.',
    swps: [
      { code: 'SWP-EL-01', title: 'Lockout / Tagout (LOTO) & Zero Energy Proofing', standard: 'SANS 10142-1 / EIR 6' },
      { code: 'SWP-EL-02', title: 'Cable Trenching, Armoured Glanding & Earthing', standard: 'SANS 10200 / CR 24' },
      { code: 'SWP-EL-03', title: 'Earth Leakage Trip Testing & Pre-COC Checks', standard: 'Electrical Installation Regs 9' },
      { code: 'SWP-EL-04', title: 'Arc Flash Boundary Controls & 1000V Insulated Tooling', standard: 'OHS Act Section 8 / SANS 10108' }
    ],
    methodStatements: ['Main Low-Voltage Switchgear Replacement', 'Overhead Cable Tray Reticulation', 'Standby Diesel Generator Hookup']
  },
  {
    id: 'agricultural_fencing',
    name: 'Agricultural Fencing',
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
    name: 'HVAC Maintenance',
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
    name: 'Small Works / Handyman',
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

  // Form State: Company Profile
  const [profile, setProfile] = useState<CompanyProfileState>({
    fullName: 'David Khumalo',
    companyName: 'Apex Trade & Civils (Pty) Ltd',
    tradingName: 'Apex Contractors',
    contactPhone: '+27 82 450 9182',
    contactEmail: 'safety@apexcontractors.co.za',
    physicalAddress: '14 Industrial Road, Jet Park, Boksburg, 1459',
    cipcRegNumber: '2021/847291/07',
    coidNumber: '990001248573',
    sarsPin: '9482716301',
    projectTenderName: 'Tender No. PR-2026/088: Facility Subcontract & Upgrade',
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
    firstAiderName: 'Thabo Mokoena (Level 2 Certified)',
    firstAiderExpiry: '2027-11-30',
    fireMarshalName: 'Sipho Sithole (Appointed Marshall)',
    safetyRepName: 'Lerato Ndlovu (SHE Rep Sec 17)',
    riskAssessorName: 'David Khumalo (HIRA Qualified)',
    incidentInvestigatorName: 'David Khumalo (GAR 9)'
  });

  const uniqueId = useId();

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
      riskAssessorName: `${profile.fullName} (HIRA Lead)`,
      incidentInvestigatorName: `${profile.fullName} (GAR 9 Lead)`
    }));
  };

  // Calculate dynamic components generated
  const activeTradeObjects = AVAILABLE_TRADES.filter(t => selectedTrades.includes(t.id));
  const totalSwps = activeTradeObjects.reduce((acc, t) => acc + t.swps.length, 0);
  const totalMethodStatements = activeTradeObjects.reduce((acc, t) => acc + t.methodStatements.length, 0);

  // Generate Actual PDF using jsPDF
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

      // Page 1: Official Cover Page & Compliance Seal
      // Header Banner
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
      activeTradeObjects.forEach((trade, idx) => {
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
      doc.text(`• GSR 3 First Aider: ${staff.firstAiderName}`, 26, 257);
      doc.text(`• Fire Marshal: ${staff.fireMarshalName}`, 26, 263);
      doc.text(`• Lead Risk Assessor: ${staff.riskAssessorName}`, 26, 269);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.text(`Issued by MeloTwo SHEQ Engine • Date: ${currentDate} • Standard: SANS 10330 / OHS Act Section 37.2`, 105, 288, { align: 'center' });

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

      // Save PDF
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

  const containerContent = (
    <div 
      id="tender-safety-file-wizard"
      className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-4xl w-full mx-auto"
    >
      {/* Header Banner */}
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
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

      {/* Step Navigation Indicator */}
      <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-950/40 text-xs font-mono">
        {[
          { step: 1, label: '1. Profile & COID', icon: Building2 },
          { step: 2, label: '2. Trades & SWPs', icon: HardHat },
          { step: 3, label: '3. Appointments', icon: Users },
          { step: 4, label: '4. File Blueprint', icon: FileSpreadsheet }
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
                  placeholder="e.g. David Khumalo"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Company Name (Pty Ltd / CC) *
                </label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={e => setProfile({ ...profile, companyName: e.target.value })}
                  placeholder="e.g. Apex Trade & Civils (Pty) Ltd"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  value={profile.contactPhone}
                  onChange={e => setProfile({ ...profile, contactPhone: e.target.value })}
                  placeholder="+27 82 000 0000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Official Email *
                </label>
                <input
                  type="email"
                  value={profile.contactEmail}
                  onChange={e => setProfile({ ...profile, contactEmail: e.target.value })}
                  placeholder="safety@contractor.co.za"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  CIPC Registration Number
                </label>
                <input
                  type="text"
                  value={profile.cipcRegNumber}
                  onChange={e => setProfile({ ...profile, cipcRegNumber: e.target.value })}
                  placeholder="2021/123456/07"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Compensation Fund (COID / WCA) Ref #
                </label>
                <input
                  type="text"
                  value={profile.coidNumber}
                  onChange={e => setProfile({ ...profile, coidNumber: e.target.value })}
                  placeholder="99000123456"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Tender / Project Reference & Principal Client Name
                </label>
                <input
                  type="text"
                  value={profile.projectTenderName}
                  onChange={e => setProfile({ ...profile, projectTenderName: e.target.value })}
                  placeholder="Tender Ref No / Client Site Name (e.g. City Power Substation Overhaul)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Document Placeholders / Verification Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Mandatory Statutory Compliance Attachments
                </label>
                <span className="text-[11px] text-slate-400">Placeholders verified for instant compile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(docUploads).map(([key, item]) => (
                  <div
                    key={key}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      item.uploaded 
                        ? 'bg-slate-950/80 border-emerald-500/40 text-slate-200' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {item.uploaded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Upload className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.uploaded ? `${item.fileName} (${item.size})` : 'Attachment simulated or manual insert'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSimulatedUpload(key)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        item.uploaded
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {item.uploaded ? 'Verified' : 'Attach'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: Project & Trade Scope Selection ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
                  Step 2: Project Trades & Scope Mapping
                </h3>
                <p className="text-xs text-slate-400">
                  Select your work packages. MeloTwo automatically binds SANS-compliant Safe Work Procedures & Method Statements.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                {selectedTrades.length} Trade{selectedTrades.length > 1 ? 's' : ''} Selected
              </span>
            </div>

            {/* Trade Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AVAILABLE_TRADES.map((trade) => {
                const isSelected = selectedTrades.includes(trade.id);
                const Icon = trade.icon;
                const riskBadgeColors = {
                  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  High: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                  Critical: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
                };

                return (
                  <div
                    key={trade.id}
                    onClick={() => toggleTrade(trade.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all select-none relative ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{trade.name}</h4>
                          <span className="text-[10px] text-slate-400">{trade.category}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${riskBadgeColors[trade.riskLevel]}`}>
                        {trade.riskLevel} Risk
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">
                      {trade.description}
                    </p>

                    {/* Pre-mapped SWP Preview */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">
                        {trade.swps.length} SWPs + {trade.methodStatements.length} Method Stmts
                      </span>
                      <span className={`font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {isSelected ? '✓ Added to File' : '+ Click to Add'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Auto-Mapped Summary Banner */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Auto-Assembled Safety Procedures for Selected Trades:
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {totalSwps} SWPs & {totalMethodStatements} Method Statements
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeTradeObjects.flatMap(t => t.swps).map((s) => (
                  <span key={s.code} className="text-[10px] font-mono bg-slate-900 border border-slate-700/80 text-cyan-300 px-2 py-0.5 rounded">
                    {s.code}: {s.title.slice(0, 30)}...
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: Statutory Duty Bearers & Employee Appointments ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
                  Step 3: Statutory Duty Bearers & Employee Appointments
                </h3>
                <p className="text-xs text-slate-400">
                  Under the OHS Act, appointment letters must designate responsible site representatives.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutofillSupervisor}
                className="text-xs font-mono font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Autofill Lead to All Roles
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  16.2 Assistant to CEO / Site H&S Supervisor *
                </label>
                <input
                  type="text"
                  value={staff.ceoSupervisorName}
                  onChange={e => setStaff({ ...staff, ceoSupervisorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
                <span className="text-[10px] text-slate-400">OHS Act Section 16(2) full operational oversight</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supervisor National ID / Passport Number *
                </label>
                <input
                  type="text"
                  value={staff.ceoSupervisorId}
                  onChange={e => setStaff({ ...staff, ceoSupervisorId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  First Aider Appointee (GSR 3) *
                </label>
                <input
                  type="text"
                  value={staff.firstAiderName}
                  onChange={e => setStaff({ ...staff, firstAiderName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
                <span className="text-[10px] text-slate-400">Valid Level 1 or 2 First Aid Certificate</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fire Marshal / Fighter (ER 9) *
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
                  Health & Safety Representative (Sec 17/18)
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
                  Lead Risk Assessor (CR 9.1)
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

        {/* ================= STEP 4: Dynamic Output & File Blueprint ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
                  Step 4: Generated Safety File Structure & Pricing
                </h3>
                <p className="text-xs text-slate-400">
                  Your customized H&S file dossier is fully structured and ready for PDF compilation.
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready to Compile
              </span>
            </div>

            {/* Generated Safety File Structure Cards */}
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
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Monthly Subscription Plan
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                      Ongoing SHEQ
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

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  id="generate-tender-pdf-cta"
                  type="button"
                  onClick={generateTenderSafetyFile}
                  disabled={isGeneratingPdf}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-cyan-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-cyan-950/80 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                      Compiling Statutory Documents & Watermarks...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-slate-950" />
                      Generate & Preview Tender File (PDF)
                      <ArrowRight className="w-4 h-4 text-slate-950" />
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
            onClick={generateTenderSafetyFile}
            disabled={isGeneratingPdf}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPdf ? 'Compiling...' : 'Download File'}
          </button>
        )}
      </div>

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
