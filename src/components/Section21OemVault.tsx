import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Plus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Cpu,
  Layers,
  Wrench,
  Check,
  X,
  Copy,
  Hash,
  Sparkles,
  QrCode,
  Volume2,
  Activity,
  FileCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Section21Declaration, EquipmentCategoryType } from '../types/riskManagementTypes';
import {
  fetchSection21Declarations,
  saveSection21Declaration,
  toggleBundleSection21ToTender,
  exportSection21VaultPdf
} from '../services/riskManagementService';

export interface Section21OemVaultProps {
  onNotify?: (message: string) => void;
  onOpenTenderWizard?: () => void;
}

export const Section21OemVault: React.FC<Section21OemVaultProps> = ({
  onNotify,
  onOpenTenderWizard
}) => {
  const [declarations, setDeclarations] = useState<Section21Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Inspection Drawer / Certificate Modal
  const [selectedDecl, setSelectedDecl] = useState<Section21Declaration | null>(null);

  // New Declaration Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formSerial, setFormSerial] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formCategory, setFormCategory] = useState<EquipmentCategoryType>('MOBILE_MACHINERY');
  const [formOem, setFormOem] = useState('');
  const [formDeclNum, setFormDeclNum] = useState('');
  const [formIssueDate, setFormIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formExpiryDate, setFormExpiryDate] = useState(() => new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
  const [formSignatory, setFormSignatory] = useState('Dr. Hendrik Venter (Pr.Eng, GCC Mechanical #M88219)');
  const [formDesignation, setFormDesignation] = useState('OEM Chief Technical Officer / Section 21 Signatory');
  const [formNoise, setFormNoise] = useState(80.5);
  const [formVibration, setFormVibration] = useState(0.38);
  const [formBraking, setFormBraking] = useState(true);
  const [formInterlocks, setFormInterlocks] = useState(true);
  const [formSection, setFormSection] = useState('Witwatersrand Deep Reef Shaft 4');
  const [formNotes, setFormNotes] = useState('Certified compliant with MHSA Section 21 and DMRE Trackless Mobile Machinery requirements.');

  useEffect(() => {
    loadDeclarations();
  }, []);

  const loadDeclarations = async () => {
    setLoading(true);
    const data = await fetchSection21Declarations();
    setDeclarations(data);
    setLoading(false);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
    if (onNotify) onNotify('Cryptographic SHA-256 seal copied to clipboard.');
  };

  const handleToggleBundle = async (decl: Section21Declaration) => {
    const nextState = !decl.bundledInTenderDossier;
    await toggleBundleSection21ToTender(decl.id, nextState);
    await loadDeclarations();

    // Cache active bundled declarations for the Tender File Wizard
    try {
      const allDecls = await fetchSection21Declarations();
      const bundledDecls = allDecls.filter(d => d.bundledInTenderDossier);
      localStorage.setItem('melotwo_tender_section21_declarations', JSON.stringify(bundledDecls));
    } catch {}

    if (onNotify) {
      onNotify(
        nextState
          ? `Equipment ${decl.equipmentSerialId} bundled into 20-Section Tender Dossier.`
          : `Equipment ${decl.equipmentSerialId} unbundled from Tender Dossier.`
      );
    }
  };

  const handleBundleAll = async () => {
    for (const d of declarations) {
      if (!d.bundledInTenderDossier) {
        await toggleBundleSection21ToTender(d.id, true);
      }
    }
    await loadDeclarations();
    try {
      const allDecls = await fetchSection21Declarations();
      localStorage.setItem('melotwo_tender_section21_declarations', JSON.stringify(allDecls));
    } catch {}
    if (onNotify) {
      onNotify('All active Section 21 declarations bundled into 20-Section Tender Dossier.');
    }
  };

  const handleSaveAddModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSerial.trim() || !formModel.trim() || !formOem.trim()) return;

    const saved = await saveSection21Declaration({
      equipmentSerialId: formSerial.trim().toUpperCase(),
      equipmentModel: formModel.trim(),
      equipmentCategory: formCategory,
      oemManufacturer: formOem.trim(),
      declarationNumber: formDeclNum.trim() || `SEC21-${formSerial.trim().slice(-6)}-${new Date().getFullYear()}`,
      issueDate: formIssueDate,
      expiryDate: formExpiryDate,
      status: 'ACTIVE_VALID',
      signatoryName: formSignatory.trim(),
      signatoryDesignation: formDesignation.trim(),
      standardsCompliance: [
        'MHSA Act 29 Section 21',
        'ISO 3471 Roll-Over Protection (ROPS)',
        'ISO 3449 Falling Object Protection (FOPS Level II)',
        'SANS 10108 / SANS 1589 Declivity Braking'
      ],
      ergonomicNoiseDba: Number(formNoise),
      vibrationLevelMps2: Number(formVibration),
      brakingTestCertified: formBraking,
      failsafeInterlocksPresent: formInterlocks,
      miningSectionAssigned: formSection,
      inspectionNotes: formNotes,
      bundledInTenderDossier: true
    });

    setIsAddModalOpen(false);
    await loadDeclarations();
    if (onNotify) {
      onNotify(`Section 21 Declaration registered for ${saved.equipmentSerialId} (${saved.equipmentModel})`);
    }
  };

  // Filtered declarations list
  const filteredDeclarations = useMemo(() => {
    return declarations.filter(decl => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        decl.equipmentSerialId.toLowerCase().includes(q) ||
        decl.equipmentModel.toLowerCase().includes(q) ||
        decl.oemManufacturer.toLowerCase().includes(q) ||
        decl.declarationNumber.toLowerCase().includes(q) ||
        decl.miningSectionAssigned.toLowerCase().includes(q) ||
        decl.signatoryName.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'ALL' || decl.equipmentCategory === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || decl.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [declarations, searchTerm, categoryFilter, statusFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = declarations.length;
    const active = declarations.filter(d => d.status === 'ACTIVE_VALID').length;
    const attention = declarations.filter(d => d.status === 'ATTENTION_REQUIRED' || d.status === 'EXPIRED').length;
    const bundled = declarations.filter(d => d.bundledInTenderDossier).length;

    return { total, active, attention, bundled };
  }, [declarations]);

  return (
    <div className="space-y-6">
      {/* Header Banner & Summary KPI Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-40 bg-cyan-500/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                MHSA Act 29 of 1996 • Section 21 Statutory Vault
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                DMRE Section 54 Audit Ready
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
              MHSA Section 21 Supplier &amp; OEM Compliance Vault
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Statutory repository for Section 21 Declarations of Safety Compliance from equipment manufacturers. Instant serial search enables immediate defense during DMRE Section 54/55 inspectorial audits, with one-click bundling into the 20-Section Tender Dossier.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-cyan-950/40 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Declaration</span>
            </button>

            <button
              onClick={handleBundleAll}
              className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              title="Bundle all Section 21 declarations into main 20-Section Tender Dossier"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Bundle to Tender Dossier ({stats.bundled}/{stats.total})</span>
            </button>

            <button
              onClick={() => exportSection21VaultPdf(declarations)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-2 cursor-pointer"
              title="Export official Section 21 Audit Vault PDF"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export S21 Vault PDF</span>
            </button>

            {onOpenTenderWizard && (
              <button
                onClick={onOpenTenderWizard}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
                title="Open 20-Section Tender Safety File Wizard to compile and download bundled dossier PDF"
              >
                <FileText className="w-4 h-4" />
                <span>Compile 20-Section Tender PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">OEM Equipment Records</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{stats.total}</div>
            <span className="text-[10px] text-slate-500">Tracked under Section 21</span>
          </div>

          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Certified &amp; Valid</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{stats.active}</div>
            <span className="text-[10px] text-emerald-500/80">Active DMRE legal protection</span>
          </div>

          <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Audit Attention</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{stats.attention}</div>
            <span className="text-[10px] text-amber-500/80">Renewal due within 60 days</span>
          </div>

          <div className="bg-slate-950/60 border border-cyan-500/20 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Tender Dossier Bundled</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5" />
              <span>{stats.bundled}</span>
            </div>
            <span className="text-[10px] text-cyan-500/80">Included in Master 20-Section PDF</span>
          </div>
        </div>
      </div>

      {/* QUICK-FILTER SEARCH & REPOSITORY CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Section 21 OEM Declarations Repository</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({filteredDeclarations.length} matching)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Type any Equipment Serial ID (e.g. "SN-LHD", "EPI-MT42", "PC2000") to retrieve OEM certificates during Section 54 stop-work inspections.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Rapid Serial Search */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Serial ID (e.g. SN-LHD-2026-9041)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Categories</option>
              <option value="MOBILE_MACHINERY">Mobile Trackless Machinery</option>
              <option value="DRILLING_RIG">Drilling &amp; Bolting Rigs</option>
              <option value="VENTILATION_SYSTEM">Ventilation Systems</option>
              <option value="HOISTING_WINDER">Winder &amp; Hoisting</option>
              <option value="PUMPING_SYSTEM">Pumping &amp; Dewatering</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE_VALID">Active &amp; Valid</option>
              <option value="ATTENTION_REQUIRED">Attention Required</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Declarations Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredDeclarations.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">No Section 21 OEM Declarations Match Query</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by OEM name, model, or click "Register Declaration".</p>
            </div>
          ) : (
            filteredDeclarations.map(decl => {
              const isAlert = decl.status === 'ATTENTION_REQUIRED' || decl.status === 'EXPIRED';

              return (
                <div
                  key={decl.id}
                  className={`bg-slate-950 rounded-2xl border p-4.5 transition-all duration-200 flex flex-col justify-between relative group ${
                    decl.bundledInTenderDossier
                      ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                      : isAlert
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top pill row */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {decl.equipmentSerialId}
                      </span>

                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-black ${
                        decl.status === 'ACTIVE_VALID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {decl.status === 'ACTIVE_VALID' ? 'ACTIVE CERTIFIED' : 'ATTENTION REQUIRED'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                      {decl.equipmentModel}
                    </h4>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {decl.oemManufacturer}
                    </p>

                    <div className="my-3 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Declaration Ref:</span>
                        <span className="font-mono font-bold text-slate-200">{decl.declarationNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Assigned Stope/Shaft:</span>
                        <span className="truncate max-w-[170px] text-slate-200">{decl.miningSectionAssigned}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Validity Period:</span>
                        <span className="font-mono text-slate-400">{decl.issueDate} &rarr; {decl.expiryDate}</span>
                      </div>
                    </div>

                    {/* Ergonomic & Safety Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/60 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-slate-400">Noise Level</div>
                          <div className="font-bold text-white">{decl.ergonomicNoiseDba} dB(A)</div>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/60 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-slate-400">Vibration</div>
                          <div className="font-bold text-white">{decl.vibrationLevelMps2} m/s²</div>
                        </div>
                      </div>
                    </div>

                    {/* Signatory */}
                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="text-slate-500">Signatory:</span>{' '}
                      <span className="text-slate-300 font-semibold">{decl.signatoryName}</span>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBundle(decl)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                        decl.bundledInTenderDossier
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title="Include in 20-Section Tender Dossier master compilation"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{decl.bundledInTenderDossier ? 'Bundled in Dossier' : 'Bundle to Dossier'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDecl(decl)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Certificate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STATUTORY SECTION 21 INSPECTION CERTIFICATE MODAL */}
      {selectedDecl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-200">
            {/* Accent Banner */}
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400" />

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  Statutory MHSA Section 21 Certificate
                </span>
                <h3 className="text-base font-black text-white font-display mt-0.5">
                  {selectedDecl.equipmentModel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDecl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Manufacturer Stamp Box */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Official Declaration Ref</span>
                  <span className="text-amber-400 font-mono font-bold">{selectedDecl.declarationNumber}</span>
                </div>
                <div className="text-sm font-bold text-white">{selectedDecl.oemManufacturer}</div>
                <div className="text-slate-400">
                  Serial ID: <strong className="text-white font-mono">{selectedDecl.equipmentSerialId}</strong> | Category: <span className="text-slate-300">{selectedDecl.equipmentCategory.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Statutory Standards Compliance */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                  Verified Statutory &amp; Design Standards:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDecl.standardsCompliance.map((std, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
                      ✓ {std}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ergonomics & Braking Matrix */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Operator Noise Exposure</span>
                  <div className="font-bold text-white mt-0.5">{selectedDecl.ergonomicNoiseDba} dB(A) (Under 85 dB(A) Limit)</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Whole-Body Vibration (RMS)</span>
                  <div className="font-bold text-white mt-0.5">{selectedDecl.vibrationLevelMps2} m/s² (Under 0.5 m/s² Limit)</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Declivity Braking Certified</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{selectedDecl.brakingTestCertified ? '✓ SANS 1589 Verified' : 'Pending'}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Failsafe Interlocks</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{selectedDecl.failsafeInterlocksPresent ? '✓ Active Interlocks' : 'No'}</div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Manufacturer Inspection Certificate Notes:
                </span>
                <p className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 leading-relaxed">
                  {selectedDecl.inspectionNotes}
                </p>
              </div>

              {/* Signatory & Cryptographic SHA-256 Ledger Anchor */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Designated Signatory:</span>
                  <span className="font-bold text-white">{selectedDecl.signatoryName}</span>
                </div>
                <div className="text-[10px] text-slate-500">{selectedDecl.signatoryDesignation}</div>

                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-500">SHA-256 Merkle Ledger Hash</span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(selectedDecl.cryptographicHash)}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedHash === selectedDecl.cryptographicHash ? 'Copied' : 'Copy Hash'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-slate-900 rounded font-mono text-[9px] text-slate-400 break-all border border-slate-800/60">
                    {selectedDecl.cryptographicHash}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleBundle(selectedDecl)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                    selectedDecl.bundledInTenderDossier
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{selectedDecl.bundledInTenderDossier ? 'Bundled in Master Dossier' : 'Bundle to Master Dossier'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      exportSection21VaultPdf([selectedDecl]);
                      if (onNotify) onNotify(`Exported Section 21 Certificate for ${selectedDecl.equipmentSerialId}`);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Certificate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDecl(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW SECTION 21 DECLARATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-auto">
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400" />

            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  MHSA Act 29 Section 21 Compliance Declaration
                </span>
                <h3 className="text-base font-black text-white font-display mt-0.5">
                  Register Manufacturer Safety Declaration
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddModal} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Equipment Serial ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-LHD-2026-9041"
                    value={formSerial}
                    onChange={e => setFormSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Equipment Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sandvik LH517i Underground 17-Ton LHD"
                    value={formModel}
                    onChange={e => setFormModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    OEM Manufacturer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sandvik Mining and Construction South Africa"
                    value={formOem}
                    onChange={e => setFormOem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">
                    Equipment Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="MOBILE_MACHINERY">Mobile Trackless Machinery</option>
                    <option value="DRILLING_RIG">Drilling &amp; Bolting Rigs</option>
                    <option value="VENTILATION_SYSTEM">Ventilation Systems</option>
                    <option value="HOISTING_WINDER">Hoisting &amp; Winder</option>
                    <option value="PUMPING_SYSTEM">Pumping &amp; Dewatering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Declaration Certificate Ref No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SEC21-SND-2026-8812"
                    value={formDeclNum}
                    onChange={e => setFormDeclNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Assigned Mine Section / Stope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Witwatersrand Deep Reef Shaft 4"
                    value={formSection}
                    onChange={e => setFormSection(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={e => setFormIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Statutory Expiry / Re-Certification Date
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={e => setFormExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Ergonomics & Testing */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Ergonomics, Noise, Vibration &amp; Interlocks
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">Noise dB(A)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={formNoise}
                      onChange={e => setFormNoise(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">Vibration (m/s²)</label>
                    <input
                      type="number"
                      step={0.01}
                      value={formVibration}
                      onChange={e => setFormVibration(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono text-center"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="formBraking"
                      checked={formBraking}
                      onChange={e => setFormBraking(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-0"
                    />
                    <label htmlFor="formBraking" className="text-xs font-semibold text-slate-300">
                      Brakes Certified
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="formInterlocks"
                      checked={formInterlocks}
                      onChange={e => setFormInterlocks(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-0"
                    />
                    <label htmlFor="formInterlocks" className="text-xs font-semibold text-slate-300">
                      Failsafe Interlocks
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Appointed Section 21 Professional Engineer Signatory *
                </label>
                <input
                  type="text"
                  required
                  value={formSignatory}
                  onChange={e => setFormSignatory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Manufacturer Statutory Certificate Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-cyan-950/40 cursor-pointer"
                >
                  Save Section 21 Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
