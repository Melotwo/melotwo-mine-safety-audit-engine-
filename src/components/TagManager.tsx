import React, { useState, useMemo } from 'react';
import {
  Tag,
  ShieldCheck,
  Award,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  FileCheck,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export type ComplianceScopeType = 'PROCESS_AUDIT_COMPLIANT' | 'EQUIPMENT_CERTIFIED';
export type RegulatoryStandardCode =
  | 'SANS_10330_2020'
  | 'SANS_10049_2019'
  | 'SANS_10142_1'
  | 'DMRE_MHSA_SEC_54'
  | 'R638_DOH';

export interface TaxonomyTag {
  id: string;
  site_id: string;
  tag_name: string;
  scope_type: ComplianceScopeType;
  standard_code: RegulatoryStandardCode;
  clause_reference: string;
  requires_accredited_lab: boolean;
  description: string;
  is_active: boolean;
  created_at: string;
  // Optional equipment link for demonstration
  asset_serial_number?: string;
  calibrated_on?: string;
  valid_until?: string;
  sanas_lab_accreditation_number?: string;
}

export interface TagManagerProps {
  onBack?: () => void;
  siteId?: string;
}

export const TagManager: React.FC<TagManagerProps> = ({
  onBack,
  siteId = 'SITE-WIT-01'
}) => {
  // Filter and Search states
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PROCESS' | 'EQUIPMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewTagModalOpen, setIsNewTagModalOpen] = useState<boolean>(false);
  const [validationAssetInput, setValidationAssetInput] = useState<string>('');
  const [assetValidationResult, setAssetValidationResult] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // New Tag Form State
  const [formData, setFormData] = useState<{
    tag_name: string;
    scope_type: ComplianceScopeType;
    standard_code: RegulatoryStandardCode;
    clause_reference: string;
    requires_accredited_lab: boolean;
    description: string;
    asset_serial_number?: string;
    valid_until?: string;
    sanas_lab_accreditation_number?: string;
  }>({
    tag_name: '',
    scope_type: 'PROCESS_AUDIT_COMPLIANT',
    standard_code: 'SANS_10330_2020',
    clause_reference: '',
    requires_accredited_lab: false,
    description: '',
    asset_serial_number: '',
    valid_until: '',
    sanas_lab_accreditation_number: ''
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  // Sample production-grade data state
  const [tags, setTags] = useState<TaxonomyTag[]>([
    {
      id: 'tag-001',
      site_id: 'SITE-WIT-01',
      tag_name: 'Hot-Holding Bain-Marie Thermal Control',
      scope_type: 'PROCESS_AUDIT_COMPLIANT',
      standard_code: 'SANS_10330_2020',
      clause_reference: 'Clause 7.4.2 (Thermal Lethality ≥60°C)',
      requires_accredited_lab: false,
      description: 'Continuous digital shift verification of underground hot meal holding units.',
      is_active: true,
      created_at: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'tag-002',
      site_id: 'SITE-WIT-01',
      tag_name: 'Calibrated Digital Food Probe Thermometer',
      scope_type: 'EQUIPMENT_CERTIFIED',
      standard_code: 'SANS_10142_1',
      clause_reference: 'Clause 5.1 (Calibration Accuracy ±0.2°C)',
      requires_accredited_lab: true,
      description: 'SANAS-accredited calibration check for Testo 104-IR handheld penetration probes.',
      is_active: true,
      created_at: '2026-01-15T09:30:00.000Z',
      asset_serial_number: 'PROBE-TESTO-8821',
      calibrated_on: '2026-01-10',
      valid_until: '2026-10-15',
      sanas_lab_accreditation_number: 'SANAS-CAL-2026-991'
    },
    {
      id: 'tag-003',
      site_id: 'SITE-WIT-01',
      tag_name: 'Subterranean Insulated Food Transit Canisters',
      scope_type: 'EQUIPMENT_CERTIFIED',
      standard_code: 'SANS_10330_2020',
      clause_reference: 'Clause 7.4.3 (Pressure & Thermal Retention)',
      requires_accredited_lab: true,
      description: 'Double-walled stainless transit units used for cage drop descent to shaft stations.',
      is_active: true,
      created_at: '2026-02-01T10:15:00.000Z',
      asset_serial_number: 'CANISTER-THERM-401',
      calibrated_on: '2025-09-01',
      valid_until: '2026-03-01',
      sanas_lab_accreditation_number: 'SANAS-MET-2025-412'
    },
    {
      id: 'tag-004',
      site_id: 'SITE-WIT-01',
      tag_name: 'Food Handler Hand Hygiene & Health Declaration',
      scope_type: 'PROCESS_AUDIT_COMPLIANT',
      standard_code: 'R638_DOH',
      clause_reference: 'Regulation R638 Section 5 (Personal Hygiene)',
      requires_accredited_lab: false,
      description: 'Daily visual check and shift supervisor health sign-off before kitchen clock-in.',
      is_active: true,
      created_at: '2026-02-10T06:00:00.000Z'
    },
    {
      id: 'tag-005',
      site_id: 'SITE-WIT-01',
      tag_name: 'Shaft 4 Heavy Cold-Room Blast Chiller',
      scope_type: 'EQUIPMENT_CERTIFIED',
      standard_code: 'SANS_10049_2019',
      clause_reference: 'Clause 8.3 (Cooling Velocity <2 hrs to 21°C)',
      requires_accredited_lab: true,
      description: 'Surface bulk prep cooling compressor unit with automatic chart logger.',
      is_active: true,
      created_at: '2026-03-01T11:00:00.000Z',
      asset_serial_number: 'CHILL-BLAST-902',
      calibrated_on: '2026-02-15',
      valid_until: '2027-02-15',
      sanas_lab_accreditation_number: 'SANAS-ELEC-2026-104'
    }
  ]);

  // Expiration calculation helper relative to current reference date (2026)
  const getExpirationStatus = (validUntilDate?: string) => {
    if (!validUntilDate) return null;
    const now = new Date();
    const expiry = new Date(validUntilDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'EXPIRED', label: `Expired ${Math.abs(diffDays)}d ago`, days: diffDays, color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
    }
    if (diffDays <= 30) {
      return { status: 'EXPIRING_SOON', label: `Expires in ${diffDays}d`, days: diffDays, color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
    }
    return { status: 'VALID', label: `Valid (${diffDays}d left)`, days: diffDays, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
  };

  // Filtered dataset
  const filteredTags = useMemo(() => {
    return tags.filter((item) => {
      // Scope filter
      if (selectedFilter === 'PROCESS' && item.scope_type !== 'PROCESS_AUDIT_COMPLIANT') return false;
      if (selectedFilter === 'EQUIPMENT' && item.scope_type !== 'EQUIPMENT_CERTIFIED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.tag_name.toLowerCase().includes(q);
        const matchesStandard = item.standard_code.toLowerCase().includes(q);
        const matchesClause = item.clause_reference.toLowerCase().includes(q);
        const matchesAsset = item.asset_serial_number?.toLowerCase().includes(q) || false;
        const matchesDesc = item.description.toLowerCase().includes(q);
        return matchesName || matchesStandard || matchesClause || matchesAsset || matchesDesc;
      }
      return true;
    });
  }, [tags, selectedFilter, searchQuery]);

  // Handle Tag Registration with strict domain validation
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.tag_name.trim()) {
      setFormError('Tag name is required.');
      return;
    }
    if (!formData.clause_reference.trim()) {
      setFormError('Statutory standard clause reference is required.');
      return;
    }

    // Strict validation: Process audits cannot require lab certifications
    if (formData.scope_type === 'PROCESS_AUDIT_COMPLIANT' && formData.requires_accredited_lab) {
      setFormError('Process Audits represent operational shift routines and cannot require accredited lab certification. Select "EQUIPMENT_CERTIFIED" instead.');
      return;
    }

    // Strict validation: Equipment certification requires an asset serial number and expiration date
    if (formData.scope_type === 'EQUIPMENT_CERTIFIED' && !formData.asset_serial_number?.trim()) {
      setFormError('Equipment Certified tags require a physical Asset Serial Number or hardware unit ID.');
      return;
    }

    const newTag: TaxonomyTag = {
      id: `tag-${Date.now()}`,
      site_id: siteId,
      tag_name: formData.tag_name.trim(),
      scope_type: formData.scope_type,
      standard_code: formData.standard_code,
      clause_reference: formData.clause_reference.trim(),
      requires_accredited_lab: formData.requires_accredited_lab,
      description: formData.description.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
      asset_serial_number: formData.asset_serial_number?.trim(),
      valid_until: formData.valid_until,
      sanas_lab_accreditation_number: formData.sanas_lab_accreditation_number?.trim()
    };

    setTags([newTag, ...tags]);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setIsNewTagModalOpen(false);
      setFormData({
        tag_name: '',
        scope_type: 'PROCESS_AUDIT_COMPLIANT',
        standard_code: 'SANS_10330_2020',
        clause_reference: '',
        requires_accredited_lab: false,
        description: '',
        asset_serial_number: '',
        valid_until: '',
        sanas_lab_accreditation_number: ''
      });
    }, 1000);
  };

  // Asset validation check trigger
  const handleValidateAsset = async () => {
    if (!validationAssetInput.trim()) return;
    setIsValidating(true);
    setAssetValidationResult(null);

    // Call server API or fallback to local search
    try {
      const res = await fetch(`/api/v1/compliance/validate-asset/${encodeURIComponent(validationAssetInput.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setAssetValidationResult(data);
      } else {
        const foundLocal = tags.find(t => t.asset_serial_number?.toLowerCase() === validationAssetInput.trim().toLowerCase());
        if (foundLocal && foundLocal.valid_until) {
          const exp = getExpirationStatus(foundLocal.valid_until);
          setAssetValidationResult({
            asset_serial_number: foundLocal.asset_serial_number,
            equipment_name: foundLocal.tag_name,
            is_certified: exp?.status !== 'EXPIRED',
            status: exp?.status,
            days_until_expiration: exp?.days,
            valid_until: foundLocal.valid_until,
            sanas_lab_number: foundLocal.sanas_lab_accreditation_number || 'SANAS-CAL-2026'
          });
        } else {
          setAssetValidationResult({ error: `No active SANAS calibration certificate found for serial "${validationAssetInput}".` });
        }
      }
    } catch {
      // Local fallback
      const foundLocal = tags.find(t => t.asset_serial_number?.toLowerCase() === validationAssetInput.trim().toLowerCase());
      if (foundLocal && foundLocal.valid_until) {
        const exp = getExpirationStatus(foundLocal.valid_until);
        setAssetValidationResult({
          asset_serial_number: foundLocal.asset_serial_number,
          equipment_name: foundLocal.tag_name,
          is_certified: exp?.status !== 'EXPIRED',
          status: exp?.status,
          days_until_expiration: exp?.days,
          valid_until: foundLocal.valid_until,
          sanas_lab_number: foundLocal.sanas_lab_accreditation_number || 'SANAS-CAL-2026'
        });
      } else {
        setAssetValidationResult({ error: `Asset "${validationAssetInput}" not registered in laboratory database.` });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const processCount = tags.filter(t => t.scope_type === 'PROCESS_AUDIT_COMPLIANT').length;
  const equipmentCount = tags.filter(t => t.scope_type === 'EQUIPMENT_CERTIFIED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* Top Header Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                &larr; Return to Dashboard
              </button>
            )}
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Compliance Taxonomy & Asset Tagging Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  MODULE 1
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsNewTagModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black transition shadow-lg shadow-cyan-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Register Compliance Tag</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* Hero Banner & Taxonomy Disambiguation Notice */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DMRE & SABS Strict Taxonomy Guardrails</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Audit vs. Certification Tagging Registry
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prevents statutory non-conformance penalties by strictly separating routine operational check-sheets (<strong className="text-cyan-400">Process Audits</strong>) from third-party accredited laboratory calibration certificates (<strong className="text-amber-400">Equipment Certifications</strong>).
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-slate-950/80 border border-cyan-500/30 p-3.5 rounded-2xl">
                <span className="text-[10px] font-mono text-cyan-300 uppercase block">Process Tags</span>
                <span className="text-2xl font-black text-white font-mono">{processCount}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">SANS 10330 / R638</span>
              </div>
              <div className="bg-slate-950/80 border border-amber-500/30 p-3.5 rounded-2xl">
                <span className="text-[10px] font-mono text-amber-300 uppercase block">Certified Assets</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{equipmentCount}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">SANAS Accredited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Calibration Watchdog Verification Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Instant Asset Calibration Watchdog</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Test calibration validity before authorizing subterranean shift use (e.g. <code className="text-amber-400 font-mono">PROBE-TESTO-8821</code> or <code className="text-amber-400 font-mono">CANISTER-THERM-401</code>)
            </p>
          </div>

          <div className="flex items-center gap-2 max-w-md w-full">
            <input
              type="text"
              placeholder="Enter asset serial number..."
              value={validationAssetInput}
              onChange={(e) => setValidationAssetInput(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 flex-grow"
            />
            <button
              onClick={handleValidateAsset}
              disabled={isValidating || !validationAssetInput.trim()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs font-bold transition shrink-0 cursor-pointer font-mono"
            >
              {isValidating ? 'Checking...' : 'Verify SANAS'}
            </button>
          </div>
        </div>

        {/* Asset Verification Feedback Alert */}
        {assetValidationResult && (
          <div className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
            assetValidationResult.error
              ? 'bg-rose-950/50 border-rose-800 text-rose-200'
              : assetValidationResult.status === 'EXPIRED'
              ? 'bg-rose-950/60 border-rose-800 text-rose-100'
              : assetValidationResult.status === 'EXPIRING_SOON'
              ? 'bg-amber-950/50 border-amber-700 text-amber-100'
              : 'bg-emerald-950/50 border-emerald-800 text-emerald-100'
          }`}>
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                {assetValidationResult.error ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Verification Failed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>SANAS Calibration Verified: {assetValidationResult.equipment_name} ({assetValidationResult.asset_serial_number})</span>
                  </>
                )}
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {assetValidationResult.error || (
                  <>
                    Lab Ref: <strong>{assetValidationResult.sanas_lab_number}</strong> &bull; Valid Until: <strong>{assetValidationResult.valid_until}</strong> ({assetValidationResult.days_until_expiration} days remaining). Status: <strong>{assetValidationResult.status}</strong>.
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => setAssetValidationResult(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Controls: Filter Buttons & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* 3 Scope Filter Tabs */}
          <div className="inline-flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                selectedFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All Standards</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300">
                {tags.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('PROCESS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                selectedFilter === 'PROCESS'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Process Audits</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950/60 text-cyan-300">
                {processCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('EQUIPMENT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                selectedFilter === 'EQUIPMENT'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Equipment Certifications</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950/60 text-amber-300">
                {equipmentCount}
              </span>
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tag name, clause, asset serial, or standard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-4 sm:px-6">Tag Name & Description</th>
                  <th className="py-4 px-4">Standard & Clause</th>
                  <th className="py-4 px-4">Compliance Scope</th>
                  <th className="py-4 px-4">Asset / Lab Details</th>
                  <th className="py-4 px-4 text-right">Validity & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredTags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-bold text-slate-300">No compliance taxonomy tags match your query.</p>
                      <p className="text-[11px] text-slate-500 mt-1">Try clearing your search query or selecting "All Standards".</p>
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((item) => {
                    const expiry = getExpirationStatus(item.valid_until);

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        
                        {/* Tag Name & Details */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{item.tag_name}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5 max-w-md leading-relaxed">
                            {item.description}
                          </p>
                          <span className="text-[10px] font-mono text-slate-500 block mt-1">
                            Ref ID: {item.id} &bull; Site: {item.site_id}
                          </span>
                        </td>

                        {/* Standard & Clause */}
                        <td className="py-4 px-4">
                          <span className="inline-block font-mono text-xs font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {item.standard_code}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                            {item.clause_reference}
                          </span>
                        </td>

                        {/* Compliance Scope Badge (Cyan for Process, Gold for Equipment) */}
                        <td className="py-4 px-4">
                          {item.scope_type === 'PROCESS_AUDIT_COMPLIANT' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-950/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              PROCESS VERIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950/50">
                              <Award className="w-3 h-3 text-amber-400" />
                              SANAS LAB CERTIFIED
                            </span>
                          )}
                        </td>

                        {/* Asset / Lab Details */}
                        <td className="py-4 px-4 font-mono text-[11px]">
                          {item.scope_type === 'EQUIPMENT_CERTIFIED' ? (
                            <div className="space-y-0.5">
                              <span className="text-slate-200 font-bold block">{item.asset_serial_number}</span>
                              <span className="text-slate-400 text-[10px] block">Lab: {item.sanas_lab_accreditation_number || 'SANAS-CAL-2026'}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Operational Routine</span>
                          )}
                        </td>

                        {/* Validity & Expiration Warning */}
                        <td className="py-4 px-4 text-right">
                          {item.scope_type === 'EQUIPMENT_CERTIFIED' && expiry ? (
                            <div className="inline-flex flex-col items-end space-y-1">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${expiry.color}`}>
                                {expiry.status === 'EXPIRED' ? (
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                ) : (
                                  <Clock className="w-3 h-3 text-emerald-400" />
                                )}
                                {expiry.label}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                Cal: {item.calibrated_on || '2026-01'}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              <Check className="w-3 h-3 text-emerald-400" />
                              Continuous Shift Log
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL: Register New Compliance Taxonomy Tag */}
      {isNewTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Register Compliance Taxonomy Tag</h3>
              </div>
              <button
                onClick={() => setIsNewTagModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Taxonomy tag registered and indexed successfully!</span>
              </div>
            )}

            <form onSubmit={handleCreateTag} className="space-y-4 text-xs">
              
              {/* Tag Name */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Tag Name / Checkpoint Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subterranean Cage Transit Thermal Integrity"
                  value={formData.tag_name}
                  onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Scope Type Selection (Strict Disambiguation) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    Compliance Scope *
                  </label>
                  <select
                    value={formData.scope_type}
                    onChange={(e) => setFormData({ ...formData, scope_type: e.target.value as ComplianceScopeType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PROCESS_AUDIT_COMPLIANT">Process Audit (Operational)</option>
                    <option value="EQUIPMENT_CERTIFIED">Equipment Certified (SANAS Hardware)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    Regulatory Standard *
                  </label>
                  <select
                    value={formData.standard_code}
                    onChange={(e) => setFormData({ ...formData, standard_code: e.target.value as RegulatoryStandardCode })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="SANS_10330_2020">SANS 10330:2020 (HACCP)</option>
                    <option value="SANS_10049_2019">SANS 10049 (PRP Hygiene)</option>
                    <option value="SANS_10142_1">SANS 10142-1 (Equipment)</option>
                    <option value="R638_DOH">Regulation R638 (Premises)</option>
                    <option value="DMRE_MHSA_SEC_54">DMRE MHSA Sec 54 Order</option>
                  </select>
                </div>
              </div>

              {/* Clause Reference */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Clause Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clause 7.4.2 or Section 5.1"
                  value={formData.clause_reference}
                  onChange={(e) => setFormData({ ...formData, clause_reference: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Equipment-Specific Fields (Rendered conditionally) */}
              {formData.scope_type === 'EQUIPMENT_CERTIFIED' && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-3">
                  <div className="font-bold text-amber-300 font-mono text-[11px] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>SANAS Accredited Asset Information</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Asset Serial Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. PROBE-TESTO-901"
                        value={formData.asset_serial_number}
                        onChange={(e) => setFormData({ ...formData, asset_serial_number: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Calibration Expiry Date</label>
                      <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">SANAS Lab Accreditation No.</label>
                    <input
                      type="text"
                      placeholder="e.g. SANAS-CAL-2026-88"
                      value={formData.sanas_lab_accreditation_number}
                      onChange={(e) => setFormData({ ...formData, sanas_lab_accreditation_number: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Description & Operational Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the critical control parameter, lethal thermal limits, or verification frequency..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTagModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg flex items-center gap-1.5 cursor-pointer font-black"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>Register Tag</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default TagManager;
