import React, { useState, useRef, useMemo } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Database, 
  Table, 
  Check, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { ComplianceLedgerRow } from '../types';

export interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLogs: (records: ComplianceLedgerRow[]) => Promise<void> | void;
  isSyncingToCloud?: boolean;
}

// Target fields required by ComplianceLedgerRow
export type LedgerFieldKey = Extract<keyof ComplianceLedgerRow, string>;

export interface TargetFieldDef {
  key: LedgerFieldKey;
  label: string;
  required: boolean;
  description: string;
  defaultFallback?: string;
  sampleGuessPatterns: string[];
}

export const TARGET_FIELDS: TargetFieldDef[] = [
  {
    key: 'date',
    label: 'Date',
    required: true,
    description: 'Audit timestamp or inspection date (e.g. YYYY-MM-DD or DD/MM/YYYY)',
    defaultFallback: new Date().toISOString().split('T')[0],
    sampleGuessPatterns: ['date', 'time', 'timestamp', 'inspection_date', 'audit_date', 'day']
  },
  {
    key: 'terminalId',
    label: 'Terminal / Site ID',
    required: true,
    description: 'Unique identifier for the shaft, terminal, station, or vehicle (e.g. SHAFT-04, TERM-09)',
    defaultFallback: 'TERM-01',
    sampleGuessPatterns: ['terminal', 'terminalid', 'terminal_id', 'site', 'site_id', 'shaft', 'location', 'asset', 'equipment_id']
  },
  {
    key: 'violationVector',
    label: 'Violation / Standard Vector',
    required: true,
    description: 'Statutory regulation or standard code (e.g. SANS 10142, MSR 1404, ZEMA SI 112)',
    defaultFallback: 'General SANS / Statutory MSR',
    sampleGuessPatterns: ['violation', 'violationvector', 'violation_vector', 'standard', 'standard_ref', 'regulation', 'rule', 'code']
  },
  {
    key: 'detailedNotes',
    label: 'Notes / Findings',
    required: false,
    description: 'Specific field observations, defect description, inspector remarks, or corrective notes',
    defaultFallback: 'Direct CSV imported audit record.',
    sampleGuessPatterns: ['notes', 'detailednotes', 'detailed_notes', 'findings', 'description', 'remarks', 'comment', 'observation', 'issue']
  },
  {
    key: 'operator',
    label: 'Operator / Inspector',
    required: false,
    description: 'Name of duty bearer, certified auditor, shift technician or contractor',
    defaultFallback: 'Field Safety Officer',
    sampleGuessPatterns: ['operator', 'inspector', 'auditor', 'technician', 'officer', 'personnel', 'user', 'name', 'responsible']
  },
  {
    key: 'riskCategory',
    label: 'Risk Category',
    required: false,
    description: 'SHEQ domain (e.g. Subterranean Ventilation, Electrical Safety, ZEMA Effluent)',
    defaultFallback: 'General Compliance',
    sampleGuessPatterns: ['category', 'riskcategory', 'risk_category', 'hazard_type', 'type', 'domain', 'hazard']
  },
  {
    key: 'severityLevel',
    label: 'Severity Level',
    required: false,
    description: 'High, Medium, or Low severity triage rating',
    defaultFallback: 'Medium',
    sampleGuessPatterns: ['severity', 'severitylevel', 'severity_level', 'priority', 'risk_level', 'level']
  },
  {
    key: 'auditStatus',
    label: 'Audit Status',
    required: false,
    description: 'Passed, Action Required, or Critical Warning',
    defaultFallback: 'Action Required',
    sampleGuessPatterns: ['status', 'auditstatus', 'audit_status', 'result', 'outcome', 'compliance_status']
  }
];

// RFC 4180 compliant CSV parser that correctly handles quoted strings with commas and escaped quotes
export function parseCsvText(csvText: string): { headers: string[]; rows: string[][] } {
  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) return { headers: [], rows: [] };

  const parsedLines: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentVal.trim());
      if (currentRow.some(col => col.length > 0)) {
        parsedLines.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  // Push last field & row if lingering
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(col => col.length > 0)) {
      parsedLines.push(currentRow);
    }
  }

  if (parsedLines.length === 0) return { headers: [], rows: [] };

  const rawHeaders = parsedLines[0];
  // Sanitize headers
  const headers = rawHeaders.map((h, idx) => (h ? h.replace(/^["']|["']$/g, '').trim() : `Column_${idx + 1}`));
  const rows = parsedLines.slice(1);

  return { headers, rows };
}

// Auto-guess initial mapping based on common header names
export function autoGuessMappings(csvHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  TARGET_FIELDS.forEach(field => {
    // Exact or pattern match
    const foundHeader = csvHeaders.find(header => {
      const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      return field.sampleGuessPatterns.some(pattern => {
        const normPattern = pattern.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalized === normPattern || normalized.includes(normPattern) || normPattern.includes(normalized);
      });
    });

    if (foundHeader) {
      mapping[field.key] = foundHeader;
    } else {
      mapping[field.key] = ''; // unmapped
    }
  });

  return mapping;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportLogs,
  isSyncingToCloud = false
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [csvFileName, setCsvFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('upload');
    setCsvFileName('');
    setHeaders([]);
    setRawRows([]);
    setFieldMappings({});
    setErrorMsg(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && !file.type.includes('comma-separated-values')) {
      setErrorMsg('Please upload a valid .csv file format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { headers: parsedHeaders, rows: parsedRows } = parseCsvText(text);

        if (parsedHeaders.length === 0 || parsedRows.length === 0) {
          setErrorMsg('The uploaded CSV file is empty or does not contain data rows.');
          return;
        }

        setCsvFileName(file.name);
        setHeaders(parsedHeaders);
        setRawRows(parsedRows);

        const guessed = autoGuessMappings(parsedHeaders);
        setFieldMappings(guessed);
        setStep('mapping');
      } catch (err: any) {
        setErrorMsg(`Failed to parse CSV file: ${err.message || 'Malformed structure'}`);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading the selected CSV file.');
    };
    reader.readAsText(file);
  };

  // Convert raw rows to typed ComplianceLedgerRow using fieldMappings
  const mappedRecords: ComplianceLedgerRow[] = useMemo(() => {
    if (rawRows.length === 0 || headers.length === 0) return [];

    return rawRows.map((row) => {
      const getVal = (fieldKey: LedgerFieldKey): string => {
        const assignedHeader = fieldMappings[fieldKey];
        if (!assignedHeader) {
          const fieldDef = TARGET_FIELDS.find(f => f.key === fieldKey);
          return fieldDef?.defaultFallback || '';
        }
        const colIdx = headers.indexOf(assignedHeader);
        if (colIdx >= 0 && row[colIdx] !== undefined && row[colIdx] !== '') {
          return row[colIdx].trim();
        }
        const fieldDef = TARGET_FIELDS.find(f => f.key === fieldKey);
        return fieldDef?.defaultFallback || '';
      };

      // Clean date formatting if needed (normalize to YYYY-MM-DD when possible)
      let parsedDate = getVal('date');
      if (parsedDate) {
        // Test standard date parsing
        const timestamp = Date.parse(parsedDate);
        if (!isNaN(timestamp)) {
          const d = new Date(timestamp);
          parsedDate = d.toISOString().split('T')[0];
        }
      } else {
        parsedDate = new Date().toISOString().split('T')[0];
      }

      // Severity triage normalization
      let rawSeverity = getVal('severityLevel');
      let normalizedSeverity = 'Medium';
      if (/high|crit|fatal|sever|major/i.test(rawSeverity)) normalizedSeverity = 'High';
      else if (/low|minor|info|pass/i.test(rawSeverity)) normalizedSeverity = 'Low';

      // Audit status triage normalization
      let rawStatus = getVal('auditStatus');
      let normalizedStatus = 'Action Required';
      if (/pass|ok|cleared|compliant|good/i.test(rawStatus)) normalizedStatus = 'Passed';
      else if (/crit|warn|danger|fail|stop/i.test(rawStatus)) normalizedStatus = 'Critical Warning';

      return {
        date: parsedDate,
        terminalId: getVal('terminalId') || 'TERM-UNASSIGNED',
        violationVector: getVal('violationVector') || 'Statutory SANS / MSR',
        detailedNotes: getVal('detailedNotes') || 'Imported via CSV Data Ingestion Module.',
        operator: getVal('operator') || 'Certified Mine Inspector',
        riskCategory: getVal('riskCategory') || 'General Compliance',
        severityLevel: normalizedSeverity,
        auditStatus: normalizedStatus
      };
    });
  }, [rawRows, headers, fieldMappings]);

  // Check if required fields are mapped (or have valid fallbacks)
  const requiredFieldsMissing = useMemo(() => {
    return TARGET_FIELDS.filter(f => f.required && !fieldMappings[f.key]);
  }, [fieldMappings]);

  const handleExecuteImport = async () => {
    if (mappedRecords.length === 0) return;
    setIsProcessing(true);
    try {
      await onImportLogs(mappedRecords);
      handleReset();
      onClose();
    } catch (err: any) {
      setErrorMsg(`Import failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Sample CSV generator for user convenience
  const handleDownloadTemplate = () => {
    const csvContent = [
      'Date,Terminal,Violation,Notes,Operator,Category,Severity,Status',
      '2026-07-15,SHAFT-04,MSR Reg 1404,Subterranean ventilation velocity below 0.30 m/s at 850L stope,Portipher Ngulube,Subterranean Ventilation,High,Critical Warning',
      '2026-07-16,DECANT-02,ZEMA SI 112,Discharge decant effluent measured Cu at 1.4 mg/L exceeding 1.0 mg/L threshold,Elena Rostova,ZEMA Aquatic Effluent,High,Critical Warning',
      '2026-07-17,TERM-09,SANS 10142-1,Three-phase machine sub-panel cable glands correctly locked and earthed,Marcus Vance,Electrical Safety,Low,Passed',
      '2026-07-18,HOIST-01,SANS 10375,Winder hoist wire rope shows 3% outer strand fatigue. Within acceptable margin,Johan Bezuidenhout,Lifting & Rigging,Medium,Action Required'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'melotwo_compliance_ledger_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">CSV Compliance Data Ingestion Engine</h3>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  RFC 4180
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload historical audits or shift sheets with custom header mapping directly to the active ledger.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-mono font-bold bg-slate-950/30">
          <button
            type="button"
            onClick={() => setStep('upload')}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-r border-slate-800 transition ${
              step === 'upload' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-b-amber-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
            <span>Upload File</span>
          </button>
          <button
            type="button"
            disabled={headers.length === 0}
            onClick={() => setStep('mapping')}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-r border-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed ${
              step === 'mapping' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-b-amber-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
            <span>Column Mapping ({headers.length ? `${headers.length} detected` : 'Pending'})</span>
          </button>
          <button
            type="button"
            disabled={rawRows.length === 0}
            onClick={() => setStep('preview')}
            className={`py-3 px-4 flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
              step === 'preview' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-b-amber-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">3</span>
            <span>Preview &amp; Ingest ({rawRows.length} Rows)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-sans">{errorMsg}</div>
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-950/60 hover:bg-slate-950 rounded-3xl p-10 text-center transition-all cursor-pointer group flex flex-col items-center justify-center gap-4"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv,text/csv"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 group-hover:scale-110 flex items-center justify-center text-amber-400 transition-all duration-300">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Drag and drop your Compliance CSV here
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Supports spreadsheets with headers such as <span className="text-amber-400 font-mono">Date</span>, <span className="text-amber-400 font-mono">Terminal</span>, <span className="text-amber-400 font-mono">Violation</span>, and <span className="text-amber-400 font-mono">Notes</span>.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 text-xs font-bold rounded-xl transition-all">
                  <FileText className="w-4 h-4" />
                  <span>Browse Device Files</span>
                </div>
              </div>

              {/* Sample Template helper */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Need a verified sample template?</h5>
                    <p className="text-[11px] text-slate-400">Download a pre-formatted CSV template with African mining and statutory columns pre-filled.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download Sample Template</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono text-slate-200">
                    Loaded File: <strong className="text-white">{csvFileName}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">({rawRows.length} rows, {headers.length} columns)</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-rose-400 hover:text-rose-300 font-mono transition cursor-pointer"
                >
                  Choose Different File
                </button>
              </div>

              {/* Instructions banner */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed font-sans">
                  Match each MeloTwo target field to a corresponding column from your CSV file. Our parser has automatically mapped the closest matching headers. Unmapped fields will use default statutory values.
                </div>
              </div>

              {/* Mapping Grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 pb-1 border-b border-slate-800">
                  <div className="col-span-5">Target Ledger Field</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-5">Source CSV Header</div>
                </div>

                {TARGET_FIELDS.map((field) => {
                  const currentMappedHeader = fieldMappings[field.key] || '';
                  const isMapped = Boolean(currentMappedHeader);

                  return (
                    <div
                      key={field.key}
                      className={`grid grid-cols-12 items-center gap-2 p-3.5 rounded-2xl border transition ${
                        isMapped 
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' 
                          : field.required 
                          ? 'bg-amber-950/20 border-amber-500/30' 
                          : 'bg-slate-950/30 border-slate-800/50'
                      }`}
                    >
                      {/* Left: Target field info */}
                      <div className="col-span-12 sm:col-span-5 flex flex-col pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{field.label}</span>
                          {field.required ? (
                            <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              REQUIRED
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-slate-500">OPTIONAL</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">{field.description}</span>
                      </div>

                      {/* Middle: Badge indicator */}
                      <div className="col-span-12 sm:col-span-2 flex items-center justify-start sm:justify-center py-1 sm:py-0">
                        {isMapped ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Mapped
                          </span>
                        ) : field.required ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            Fallback Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">Default fallback</span>
                        )}
                      </div>

                      {/* Right: Source Header Selector */}
                      <div className="col-span-12 sm:col-span-5">
                        <select
                          value={currentMappedHeader}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFieldMappings(prev => ({
                              ...prev,
                              [field.key]: val
                            }));
                          }}
                          className={`w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs font-mono transition outline-none cursor-pointer ${
                            isMapped 
                              ? 'border-emerald-500/40 text-emerald-300 focus:border-emerald-400' 
                              : 'border-slate-800 text-slate-400 focus:border-amber-500'
                          }`}
                        >
                          <option value="">-- Do Not Map (Use default statutory fallback) --</option>
                          {headers.map((h, i) => (
                            <option key={`${h}-${i}`} value={h}>
                              CSV Column: &quot;{h}&quot;
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Warning if required fields unmapped */}
              {requiredFieldsMissing.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Notice: <strong>{requiredFieldsMissing.map(f => f.label).join(', ')}</strong> unmapped. Safe statutory fallback defaults will automatically populate these fields.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Preview & Ingest */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Data Transformation Verification</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Showing first {Math.min(5, mappedRecords.length)} of {mappedRecords.length} records parsed and formatted for ledger injection.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Target Ledger Destination</span>
                  <span className="text-xs font-bold text-amber-400">
                    {isSyncingToCloud ? 'Connected Google Sheets + IndexedDB' : 'Local Sandbox Ledger'}
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Terminal ID</th>
                      <th className="py-2.5 px-3">Violation Vector</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {mappedRecords.slice(0, 5).map((rec, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="py-2.5 px-3 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3 text-amber-400">{rec.date}</td>
                        <td className="py-2.5 px-3 text-white font-bold">{rec.terminalId}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-semibold">{rec.violationVector}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            rec.severityLevel === 'High' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' :
                            rec.severityLevel === 'Medium' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' :
                            'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          }`}>
                            {rec.severityLevel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            rec.auditStatus === 'Critical Warning' ? 'text-rose-300 bg-rose-500/20' :
                            rec.auditStatus === 'Action Required' ? 'text-amber-300 bg-amber-500/20' :
                            'text-emerald-300 bg-emerald-500/20'
                          }`}>
                            {rec.auditStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 truncate max-w-[140px]">{rec.riskCategory}</td>
                        <td className="py-2.5 px-3 text-slate-400 truncate max-w-[240px] font-sans text-[11px]" title={rec.detailedNotes}>
                          {rec.detailedNotes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {mappedRecords.length > 5 && (
                <p className="text-center text-[11px] font-mono text-slate-500">
                  + {mappedRecords.length - 5} additional records ready for commit...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div>
            {step === 'mapping' && (
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
              >
                ← Back to Upload
              </button>
            )}
            {step === 'preview' && (
              <button
                type="button"
                onClick={() => setStep('mapping')}
                className="text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
              >
                ← Back to Column Mapping
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            {step === 'mapping' && (
              <button
                type="button"
                onClick={() => setStep('preview')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition cursor-pointer"
              >
                <span>Review Ingestion Preview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'preview' && (
              <button
                type="button"
                disabled={isProcessing || mappedRecords.length === 0}
                onClick={handleExecuteImport}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 transition cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>
                  {isProcessing ? 'Committing to Ledger...' : `Ingest ${mappedRecords.length} Records to Ledger`}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
