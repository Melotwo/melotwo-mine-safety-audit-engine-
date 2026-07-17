import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { ComplianceTrendChart, DailyComplianceData } from './ComplianceTrendChart';
import { AuditHistoryChart } from './AuditHistoryChart';
import { CountUp } from './CountUp';
import { 
    initAuthState, 
    loginWithGoogle, 
    logoutUser, 
    findOrCreateSpreadsheet, 
    fetchLedgerRecords, 
    appendLedgerRecord, 
    ComplianceLedgerRow 
} from '../lib/sheets-api';
import { 
    Shield, 
    FileText, 
    Loader2, 
    Zap, 
    Settings, 
    Clock, 
    Trash2, 
    Search, 
    AlertTriangle, 
    Database, 
    RefreshCw, 
    Upload, 
    User, 
    LogOut, 
    Sparkles, 
    CheckCircle2, 
    Flame, 
    AlertOctagon, 
    Download, 
    ChevronRight, 
    Lock, 
    Cpu 
} from 'lucide-react';

const DEFAULT_LOGS: ComplianceLedgerRow[] = [
  {
    date: '2026-07-01',
    operator: 'Marcus Vance',
    terminalId: 'TERM-04',
    riskCategory: 'Electrical Safety',
    violationVector: 'SANS 10142-1',
    severityLevel: 'High',
    auditStatus: 'Critical Warning',
    detailedNotes: 'Exposed high-voltage sub-breakers in processing plant 3, situated directly below a steam ventilation bypass pipe.'
  },
  {
    date: '2026-07-03',
    operator: 'Elena Rostova',
    terminalId: 'SITE-201',
    riskCategory: 'Explosion Prevention',
    violationVector: 'SANS 10108',
    severityLevel: 'High',
    auditStatus: 'Action Required',
    detailedNotes: 'Flameproof Ex-d enclosures on conveyor motor found with missing locking screws, compromising intrinsic safety zoning.'
  },
  {
    date: '2026-07-04',
    operator: 'Marcus Vance',
    terminalId: 'TERM-04',
    riskCategory: 'Hygiene & PPE',
    violationVector: 'SANS 10049',
    severityLevel: 'Low',
    auditStatus: 'Passed',
    detailedNotes: 'Standard dust masks and protective goggles deployed correctly for drill operators. No particulate breaches logged.'
  },
  {
    date: '2026-07-06',
    operator: 'Dr. Aaron Chen',
    terminalId: 'SYS-AIMS',
    riskCategory: 'AI Governance',
    violationVector: 'ISO/IEC 42001',
    severityLevel: 'Medium',
    auditStatus: 'Action Required',
    detailedNotes: 'Autonomous haulage steering model detected 3.4% algorithmic drift. Require manual human override logs validation.'
  }
];

const SAMPLE_REPORTS = [
  {
    name: "SANS 10142 Mech Log",
    text: "INSPECTION DATE: 2026-07-10\nOPERATOR: Marcus Vance\nTERMINAL ID: TERM-09\nSANS 10142-1 standard violation found during shift 2 audit. Three-phase machine sub-panel is blockaded by mining drilling rods. Egress clearance measures 0.4 meters instead of mandatory 1.0 meters. Severity Level: High. Recommend direct clearance action within 24 hours. Status: Critical Warning"
  },
  {
    name: "SANS 10108 Gas Sheet",
    text: "MeloTwo Mine Safe Inspection sheet.\nDate of Survey: 2026-07-12\nInspector Name: Elena Rostova\nTerminal reference: SITE-201\nFound that explosion proof enclosure Ex-d seals on shaft 2 ventilating blowers are cracked and missing screws. This represents an active risk under SANS 10108 explosive area standards. Action required immediately to replace the locking assemblies. Status: Critical Warning. Severity: High."
  }
];

interface SafetyInspectorPageProps {
    setPage: (page: any) => void;
}

export const SafetyInspectorPage: React.FC<SafetyInspectorPageProps> = ({ setPage }) => {
    // Core states
    const [scenario, setScenario] = useState(() => localStorage.getItem('melotwo_inspector_scenario_draft') || '');
    const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('melotwo_inspector_system_prompt_draft') || 'You are an expert industrial compliance safety officer. Create a professional, detailed audit ledger draft based on the operational scenario.');
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Administrative Demo Bypass Check (via URL query params)
    const isDemoMode = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.location.search.includes('demo=true') || 
               window.location.search.includes('admin=true') ||
               window.location.hash.includes('demo=true');
    }, []);

    // Trial Sessions limit states
    const [generationCount, setGenerationCount] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('melotwo_free_inspection_count');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Google OAuth & Sheets Synchronization States
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [ledgerId, setLedgerId] = useState<string | null>(() => localStorage.getItem('melotwo_ledger_id') || null);
    const [syncStatus, setSyncStatus] = useState<'disconnected' | 'connecting' | 'scanning' | 'connected' | 'error'>('disconnected');
    const [syncError, setSyncError] = useState<string | null>(null);

    // Active records log
    const [ledgerLogs, setLedgerLogs] = useState<ComplianceLedgerRow[]>(() => {
        try {
            const saved = localStorage.getItem('melotwo_sandbox_logs');
            return saved ? JSON.parse(saved) : DEFAULT_LOGS;
        } catch (e) {
            return DEFAULT_LOGS;
        }
    });

    // Auth & Google Drive Sheets Handlers
    const handleGoogleLogin = async () => {
        setAuthLoading(true);
        setSyncStatus('connecting');
        setSyncError(null);
        try {
            const res = await loginWithGoogle();
            if (res) {
                setUser(res.user);
                setToken(res.accessToken);
            }
        } catch (err: any) {
            console.error('Google login error:', err);
            setSyncStatus('error');
            setSyncError('Google authentication was cancelled or blocked by the browser popup blocker.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleGoogleLogout = async () => {
        await logoutUser();
        setUser(null);
        setToken(null);
        setSyncStatus('disconnected');
        // Reset to sandbox logs
        try {
            const saved = localStorage.getItem('melotwo_sandbox_logs');
            setLedgerLogs(saved ? JSON.parse(saved) : DEFAULT_LOGS);
        } catch (e) {
            setLedgerLogs(DEFAULT_LOGS);
        }
    };

    const handleSpreadsheetSync = async (activeToken: string) => {
        setSyncStatus('scanning');
        setSyncError(null);
        try {
            const sheetId = await findOrCreateSpreadsheet(activeToken);
            setLedgerId(sheetId);
            localStorage.setItem('melotwo_ledger_id', sheetId);
            
            const records = await fetchLedgerRecords(activeToken, sheetId);
            setLedgerLogs(records);
            setSyncStatus('connected');
        } catch (err: any) {
            console.error('Ledger synchronization failed:', err);
            setSyncStatus('error');
            setSyncError(err.message || 'Error connecting to Google Sheets ledger.');
        }
    };

    // Auto-sync when token is available
    useEffect(() => {
        if (token) {
            handleSpreadsheetSync(token);
        }
    }, [token]);

    // Save logs to sandbox if offline
    useEffect(() => {
        if (!token) {
            localStorage.setItem('melotwo_sandbox_logs', JSON.stringify(ledgerLogs));
        }
    }, [ledgerLogs, token]);

    // Force sync now trigger
    const handleSyncNow = () => {
        if (token) {
            handleSpreadsheetSync(token);
        }
    };

    // Drag-and-drop document scanner states
    const [dragActive, setDragActive] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanSuccess, setScanSuccess] = useState(false);

    // Editable review fields
    const [parsedDate, setParsedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [parsedOperator, setParsedOperator] = useState('');
    const [parsedTerminalId, setParsedTerminalId] = useState('');
    const [parsedCategory, setParsedCategory] = useState('General Compliance');
    const [parsedViolationVector, setParsedViolationVector] = useState('');
    const [parsedSeverity, setParsedSeverity] = useState('Medium');
    const [parsedStatus, setParsedStatus] = useState('Action Required');
    const [parsedNotes, setParsedNotes] = useState('');

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processUploadedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processUploadedFile(e.target.files[0]);
        }
    };

    const processDocumentText = async (text: string) => {
        setScanLoading(true);
        setScanError(null);
        setScanSuccess(false);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        try {
            const response = await fetch('/api/parse-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ documentText: text }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            let errorMsg = '';
            let data: any = null;
            try {
                const textRes = await response.text();
                data = textRes ? JSON.parse(textRes) : null;
                if (data && data.error) {
                    errorMsg = data.error;
                }
            } catch (e) {
                // Not valid JSON or read failed
            }

            if (!response.ok) {
                throw new Error(errorMsg || `Server scanner error: ${response.statusText || response.status}`);
            }

            if (!data || !data.text) {
                throw new Error('Server returned empty scan results.');
            }

            const parsed = JSON.parse(data.text);
            
            setParsedDate(parsed.date || new Date().toISOString().split('T')[0]);
            setParsedOperator(parsed.operator || 'Site Operator');
            setParsedTerminalId(parsed.terminalId || 'TERM-09');
            setParsedCategory(parsed.riskCategory || 'General Compliance');
            setParsedViolationVector(parsed.violationVector || 'General');
            setParsedSeverity(parsed.severityLevel || 'Medium');
            setParsedStatus(parsed.auditStatus || 'Action Required');
            setParsedNotes(parsed.detailedNotes || '');
            
            setScanSuccess(true);
        } catch (err: any) {
            clearTimeout(timeoutId);
            console.error('Failed to parse document with Gemini:', err);
            let message = 'Failed to automatically parse document. Please enter details manually or retry.';
            if (err.name === 'AbortError') {
                message = 'The scan request timed out (15s). Please enter details manually or verify your network connection.';
            } else if (err.message) {
                message = `Scanner error: ${err.message}`;
            }
            setScanError(message);
        } finally {
            setScanLoading(false);
        }
    };

    // Parse files safely
    const processUploadedFile = (file: File) => {
        setScanLoading(true);
        setScanError(null);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (text) {
                await processDocumentText(text);
            } else {
                setScanError('Empty document uploaded.');
            }
        };
        reader.onerror = () => {
            setScanError('Failed to read file.');
        };
        reader.readAsText(file);
    };

    const handleFileUpload = (file: File) => {
        processUploadedFile(file);
    };

    // Direct sample log tester loader
    const loadSampleLog = async (sampleText: string) => {
        await processDocumentText(sampleText);
    };

    // Commit parameters to Google Sheets / local storage fallback
    const [commitLoading, setCommitLoading] = useState(false);
    const [commitSuccess, setCommitSuccess] = useState(false);

    const handleCommitToLedger = async () => {
        setCommitLoading(true);
        setCommitSuccess(false);
        
        const newRecord: ComplianceLedgerRow = {
            date: parsedDate,
            operator: parsedOperator,
            terminalId: parsedTerminalId,
            riskCategory: parsedCategory,
            violationVector: parsedViolationVector,
            severityLevel: parsedSeverity,
            auditStatus: parsedStatus,
            detailedNotes: parsedNotes
        };

        try {
            if (token && ledgerId) {
                await appendLedgerRecord(token, ledgerId, newRecord);
                const records = await fetchLedgerRecords(token, ledgerId);
                setLedgerLogs(records);
            } else {
                const updated = [newRecord, ...ledgerLogs];
                setLedgerLogs(updated);
                localStorage.setItem('melotwo_sandbox_logs', JSON.stringify(updated));
            }
            setCommitSuccess(true);
            setTimeout(() => setCommitSuccess(false), 3000);
            setScanSuccess(false);
        } catch (err: any) {
            console.error('Commit to ledger failed:', err);
            alert(`Failed to commit record: ${err.message || 'Unknown error'}`);
        } finally {
            setCommitLoading(false);
        }
    };

    // Draft compliance audit generator
    const runAudit = async (isOperationalAudit: boolean) => {
        if (!scenario.trim()) { 
            setError('Please enter a scenario.'); 
            return; 
        }

        if (generationCount >= 3 && !isDemoMode) {
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true); 
        setError(null);
        setResponse({ text: '', score: '...', label: 'Analyzing...', color: 'text-slate-400 bg-slate-900 border-slate-800' });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    scenario,
                    systemPrompt
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            let errorMsg = '';
            let data: any = null;
            try {
                const textRes = await res.text();
                data = textRes ? JSON.parse(textRes) : null;
                if (data && data.error) {
                    errorMsg = data.error;
                }
            } catch (e) {
                // Not valid JSON or read failed
            }

            if (!res.ok) {
                throw new Error(errorMsg || `Draft generation failed: ${res.statusText || res.status}`);
            }

            if (!data || !data.text) {
                throw new Error('Server returned an empty analysis result.');
            }
            
            const scenarioLower = scenario.toLowerCase();
            let score = 92;
            let label = 'Passed';
            let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

            if (scenarioLower.includes('violation') || scenarioLower.includes('leak') || scenarioLower.includes('fail') || scenarioLower.includes('fire') || scenarioLower.includes('obstruction')) {
                score = 58;
                label = 'Critical Warning';
                color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            } else if (scenarioLower.includes('warning') || scenarioLower.includes('hazard') || scenarioLower.includes('rust') || scenarioLower.includes('risk')) {
                score = 76;
                label = 'Action Required';
                color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            }

            setResponse({
                text: data.text,
                score: `${score}%`,
                label,
                color
            });

            if (!isDemoMode) {
                const nextCount = generationCount + 1;
                setGenerationCount(nextCount);
                localStorage.setItem('melotwo_free_inspection_count', nextCount.toString());
            }

        } catch (err: any) {
            clearTimeout(timeoutId);
            console.error('Draft generation failed:', err);
            let message = err.message || 'Failed to generate assessment draft.';
            if (err.name === 'AbortError') {
                message = 'The connection to the audit server timed out after 15 seconds. Please verify your connection status and try again.';
            }
            setError(message);
            setResponse(null);
        } finally {
            setLoading(false);
        }
    };

    // PDF Export function
    const handleDownloadTerminalPDF = () => {
        if (!response) return;
        try {
            const docPdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            docPdf.setFillColor(15, 23, 42); // slate-900
            docPdf.rect(0, 0, 210, 297, 'F');

            docPdf.setFont('helvetica', 'bold');
            docPdf.setFontSize(22);
            docPdf.setTextColor(245, 158, 11); // amber-500
            docPdf.text('MELOTWO COMPLIANCE AUDIT DISPATCH', 20, 30);

            docPdf.setFont('helvetica', 'normal');
            docPdf.setFontSize(10);
            docPdf.setTextColor(148, 163, 184); // slate-400
            docPdf.text(`Generated: ${new Date().toLocaleString()} (UTC)`, 20, 38);
            docPdf.text(`Assessment Score: ${response.score} (${response.label})`, 20, 44);

            docPdf.setDrawColor(51, 65, 85); // slate-700
            docPdf.line(20, 50, 190, 50);

            docPdf.setFont('courier', 'bold');
            docPdf.setFontSize(12);
            docPdf.setTextColor(255, 255, 255);
            docPdf.text('RAW DRAFT COMPLIANCE REPORT OUTPUT:', 20, 62);

            docPdf.setFont('courier', 'normal');
            docPdf.setFontSize(8.5);
            docPdf.setTextColor(203, 213, 225); // slate-300
            
            const splitLines = docPdf.splitTextToSize(response.text, 170);
            let yOffset = 72;
            splitLines.forEach((line: string) => {
                if (yOffset > 270) {
                    docPdf.addPage();
                    docPdf.setFillColor(15, 23, 42);
                    docPdf.rect(0, 0, 210, 297, 'F');
                    yOffset = 30;
                }
                docPdf.text(line, 20, yOffset);
                yOffset += 5;
            });

            docPdf.save(`MeloTwo-Audit-${Date.now()}.pdf`);
        } catch (pdfErr) {
            console.error('PDF Generation error:', pdfErr);
        }
    };

    // Derive metrics dynamically
    const totalAudits = ledgerLogs.length;
    
    const criticalHazards = useMemo(() => {
        return ledgerLogs.filter(log => 
            log.auditStatus === 'Critical Warning' || 
            log.auditStatus === 'Action Required' || 
            log.severityLevel === 'High'
        ).length;
    }, [ledgerLogs]);

    const averageSafetyIndex = useMemo(() => {
        if (ledgerLogs.length === 0) return 92.5;
        let sum = 0;
        ledgerLogs.forEach(log => {
            if (log.auditStatus === 'Passed') sum += 95;
            else if (log.auditStatus === 'Action Required') sum += 75;
            else if (log.auditStatus === 'Critical Warning') sum += 55;
            else sum += 85;
        });
        return Math.round((sum / ledgerLogs.length) * 10) / 10;
    }, [ledgerLogs]);

    const activeOperators = useMemo(() => {
        const ops = new Set(ledgerLogs.map(log => log.operator).filter(Boolean));
        return ops.size || 1;
    }, [ledgerLogs]);

    const chartData = useMemo<DailyComplianceData[]>(() => {
        if (ledgerLogs.length === 0) {
            return [
                { date: '2026-07-01', complianceScore: 92, flaggedIncidents: 0 },
                { date: '2026-07-02', complianceScore: 88, flaggedIncidents: 1 },
                { date: '2026-07-03', complianceScore: 78, flaggedIncidents: 3 }
            ];
        }
        
        const sorted = [...ledgerLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return sorted.map(log => {
            let score = 95;
            if (log.auditStatus === 'Critical Warning') score = 55;
            else if (log.auditStatus === 'Action Required') score = 75;
            else if (log.severityLevel === 'High') score = 65;
            else if (log.severityLevel === 'Medium') score = 85;

            return {
                date: log.date,
                complianceScore: score,
                flaggedIncidents: log.auditStatus !== 'Passed' ? 1 : 0
            };
        });
    }, [ledgerLogs]);

    const handleClearLedger = () => {
        if (confirm('Are you sure you want to clear current logs? If connected to Google Sheets, this only resets local state. If offline, this resets sandbox ledger.')) {
            setLedgerLogs([]);
            if (!token) {
                localStorage.removeItem('melotwo_sandbox_logs');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
            {/* Header / Admin Banner */}
            <div className="max-w-7xl mx-auto flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => setPage('home')} 
                        className="inline-flex items-center justify-center px-4 py-2 border border-slate-800 text-xs font-semibold rounded-xl text-slate-300 bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
                    >
                        ← Back to Home
                    </button>
                </div>

                {isDemoMode && (
                    <div className="w-full flex items-center justify-between px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-mono animate-pulse">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                            <span><strong>ADMIN DEMO BYPASS UNLOCKED</strong>: Unlimited live compliance audits & simulated ledger connections enabled.</span>
                        </div>
                        <span className="hidden sm:inline bg-emerald-500/20 text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-black">ACTIVE</span>
                    </div>
                )}

                {/* Dashboard Brand Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                            <Shield className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">MELOTWO OPERATIONAL GATE</h1>
                                <span className="bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700/50">v2.10</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Centralized site audit console with synchronized Google Workspace SANS & POPIA compliance ledgering.</p>
                        </div>
                    </div>

                    {/* Google OAuth Profile & Sync State Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-3">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-slate-700 referrerPolicy='no-referrer'" />
                                ) : (
                                    <div className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}
                                <div className="text-left">
                                    <span className="text-[10px] text-slate-400 block font-semibold leading-tight">{user.displayName || 'Operator'}</span>
                                    <span className="text-[9px] text-slate-500 block font-mono max-w-[140px] truncate leading-tight">{user.email}</span>
                                </div>
                                <button
                                    onClick={handleGoogleLogout}
                                    title="Disconnect Google Account"
                                    className="p-1.5 hover:bg-slate-800 rounded-lg text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGoogleLogin}
                                disabled={authLoading}
                                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                )}
                                Connect Google Ledger
                            </button>
                        )}

                        {/* Synchronization Pill */}
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 px-3">
                            <span className={`w-2 h-2 rounded-full ${
                                syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                                syncStatus === 'scanning' ? 'bg-amber-500 animate-spin' :
                                syncStatus === 'connecting' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-600'
                            }`} />
                            <span className="text-[10px] text-slate-400 font-mono capitalize">
                                {syncStatus === 'connected' ? 'Sheets Connected' :
                                 syncStatus === 'scanning' ? 'Scanning Drive...' :
                                 syncStatus === 'connecting' ? 'Authorizing...' : 'Local Sandbox'}
                            </span>
                            {syncStatus === 'connected' && (
                                <button
                                    onClick={handleSyncNow}
                                    title="Synchronize Google Sheet Now"
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors ml-1 cursor-pointer"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Metric Cards Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Audits */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Audits Synced</span>
                            <span className="text-3xl font-black text-white mt-1 block">
                                <CountUp end={totalAudits} />
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                            <Database className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 2: Critical Hazards */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical Hazards</span>
                            <span className="text-3xl font-black text-rose-400 mt-1 block">
                                <CountUp end={criticalHazards} />
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-400">
                            <Flame className="w-6 h-6 animate-pulse" />
                        </div>
                    </div>

                    {/* Card 3: Safety Index */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Site Safety Index</span>
                            <span className="text-3xl font-black text-amber-500 mt-1 block">
                                {averageSafetyIndex}%
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                            <Shield className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 4: Active Operators */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Operators</span>
                            <span className="text-3xl font-black text-white mt-1 block">
                                <CountUp end={activeOperators} />
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                            <User className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Main Operations Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Operations: Document Parser & Parameters reviewer (7 Cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        
                        {/* Terminal Document Scanner */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-5">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-amber-500" />
                                    Terminal Document Scanner
                                </h3>
                                <span className="text-[9px] text-slate-500 font-mono">Gemini-2.5 Optical Extraction</span>
                            </div>

                            {/* Drag & Drop Box */}
                            <div 
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('terminal-file-input')?.click()}
                                className={`h-[180px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group select-none relative overflow-hidden ${
                                    dragActive ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                                }`}
                            >
                                <input 
                                    id="terminal-file-input" 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileInputChange} 
                                    accept=".txt,.csv,.json,.doc,.docx"
                                />

                                {scanLoading ? (
                                    <div className="flex flex-col items-center gap-3 animate-pulse">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                                            <RefreshCw className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-white block">SCANNING CORRUPTED OPERATIONAL RECORDS</span>
                                            <span className="text-[9px] text-slate-500 font-mono block mt-1">Lifting structured keys via upstream cognitive models...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 group-hover:text-amber-500 transition-colors">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-300">Drag & Drop Safety Sheets or Plant Logs</p>
                                            <p className="text-[10px] text-slate-500 mt-1 font-mono">Supports raw .txt, .csv, inspection logs, or click to browse</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Presets and Sample Files for instant testing */}
                            <div className="flex flex-col gap-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Or load a messy diagnostic sheet to test parser</span>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    {SAMPLE_REPORTS.map((report, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => loadSampleLog(report.text)}
                                            disabled={scanLoading}
                                            className="text-[10px] font-bold text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                                        >
                                            <span className="truncate">{report.name}</span>
                                            <ChevronRight className="w-3 h-3 text-amber-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {scanError && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs flex items-start gap-2.5">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>{scanError}</p>
                                </div>
                            )}
                        </div>

                        {/* Editable Reviewed Parameters Panel */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-500" />
                                    Review Parsed Parameters
                                </h3>
                                {scanSuccess && (
                                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Auto-Extracted
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Parameter Date */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Log</label>
                                    <input 
                                        type="date" 
                                        value={parsedDate}
                                        onChange={e => setParsedDate(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>

                                {/* Parameter Operator */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operator/Inspector</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., Marcus Vance"
                                        value={parsedOperator}
                                        onChange={e => setParsedOperator(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>

                                {/* Parameter Terminal ID */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terminal ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., SITE-304"
                                        value={parsedTerminalId}
                                        onChange={e => setParsedTerminalId(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>

                                {/* Parameter Risk Category */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Category</label>
                                    <select 
                                        value={parsedCategory}
                                        onChange={e => setParsedCategory(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    >
                                        <option value="Electrical Safety">Electrical Safety</option>
                                        <option value="Explosion Prevention">Explosion Prevention</option>
                                        <option value="Hygiene & PPE">Hygiene & PPE</option>
                                        <option value="AI Governance">AI Governance</option>
                                        <option value="General Compliance">General Compliance</option>
                                    </select>
                                </div>

                                {/* Parameter Violation Vector */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SANS/POPIA Violation Vector</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., SANS 10142-1"
                                        value={parsedViolationVector}
                                        onChange={e => setParsedViolationVector(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>

                                {/* Parameter Severity */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity Level</label>
                                    <select 
                                        value={parsedSeverity}
                                        onChange={e => setParsedSeverity(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Parameter Status (Full width) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Status</label>
                                <select 
                                    value={parsedStatus}
                                    onChange={e => setParsedStatus(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                >
                                    <option value="Passed">Passed (No Breaches)</option>
                                    <option value="Action Required">Action Required (Minor Violation)</option>
                                    <option value="Critical Warning">Critical Warning (Imminent Danger)</option>
                                </select>
                            </div>

                            {/* Parameter Notes */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Findings & Corrective Action Notes</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Enter detailed safety findings, violations, or SANS compliance directives..."
                                    value={parsedNotes}
                                    onChange={e => setParsedNotes(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => {
                                        setParsedDate(new Date().toISOString().split('T')[0]);
                                        setParsedOperator('');
                                        setParsedTerminalId('');
                                        setParsedCategory('General Compliance');
                                        setParsedViolationVector('');
                                        setParsedSeverity('Medium');
                                        setParsedStatus('Action Required');
                                        setParsedNotes('');
                                        setScanSuccess(false);
                                    }}
                                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Reset Form
                                </button>
                                <button
                                    onClick={handleCommitToLedger}
                                    disabled={commitLoading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
                                >
                                    {commitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                                    {commitSuccess ? 'SUCCESSFULLY DIRECTED TO LEDGER!' : token ? 'Commit natively to Sheets Ledger' : 'Commit to Local Sandbox Ledger'}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Operations: Charts, Red-Team Assessments (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        {/* Red Team Operational Analytics Widget */}
                        <AuditHistoryChart />

                        {/* Direct Compliance Assessment Drafter (Red-Team Suite) */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    Automated Assessment Drafter
                                </h3>
                                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <span>{generationCount >= 3 ? '0 credits' : `${3 - generationCount} left`}</span>
                                </div>
                            </div>

                            <form onSubmit={e => { e.preventDefault(); }} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Persona Directives</label>
                                    <input 
                                        type="text"
                                        value={systemPrompt}
                                        onChange={e => { setSystemPrompt(e.target.value); localStorage.setItem('melotwo_inspector_system_prompt_draft', e.target.value); }}
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw Inspection Details / Scenario</label>
                                    <textarea 
                                        rows={4}
                                        value={scenario}
                                        onChange={e => { setScenario(e.target.value); localStorage.setItem('melotwo_inspector_scenario_draft', e.target.value); }}
                                        placeholder="Paste unformatted site audit notes, inspection logs, or violations here to draft comprehensive assessments..."
                                        className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setScenario(''); setResponse(null); setError(null); }}
                                        className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => runAudit(false)}
                                        disabled={loading}
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        Run Cognitive Audit
                                    </button>
                                </div>
                            </form>

                            {/* Assessment Output Display */}
                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs">
                                    <p className="font-bold">Generation Failed</p>
                                    <p className="mt-1 font-mono">{error}</p>
                                </div>
                            )}

                            {response && (
                                <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-5 flex flex-col gap-4 animate-fade-in">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Cognitive Score</span>
                                            <span className="text-lg font-black text-white">{response.score}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${response.color}`}>
                                            {response.label}
                                        </span>
                                    </div>
                                    <div className="max-h-[160px] overflow-y-auto custom-scrollbar">
                                        <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{response.text}</p>
                                    </div>
                                    <div className="flex justify-end pt-2 border-t border-slate-800">
                                        <button
                                            onClick={handleDownloadTerminalPDF}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Export Draft PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* SANS & POPIA Compliance Log Table (Full Width Panel) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4 mb-5">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Database className="w-4 h-4 text-amber-500" />
                                Synchronized Compliance Ledger Logs
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Real-time status of mine terminals, SANS directives, and POPIA data vectors.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleClearLedger}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-500/20"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Clear Ledger Logs
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Operator</th>
                                    <th className="py-3 px-4">Terminal ID</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">SANS / Violation Vector</th>
                                    <th className="py-3 px-4">Severity</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 max-w-[200px]">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                                {ledgerLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                                            No ledger logs synchronized yet. Enter sandbox parameters above or connect your Google Spreadsheet.
                                        </td>
                                    </tr>
                                ) : (
                                    ledgerLogs.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                                            <td className="py-3.5 px-4 text-white whitespace-nowrap">{log.date}</td>
                                            <td className="py-3.5 px-4 font-sans font-medium text-slate-200">{log.operator || 'Unknown'}</td>
                                            <td className="py-3.5 px-4"><span className="bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded text-slate-400">{log.terminalId || 'N/A'}</span></td>
                                            <td className="py-3.5 px-4 font-sans">{log.riskCategory}</td>
                                            <td className="py-3.5 px-4 text-amber-500">{log.violationVector || 'None'}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                    log.severityLevel === 'High' ? 'text-rose-400 bg-rose-500/10' :
                                                    log.severityLevel === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                                                }`}>
                                                    {log.severityLevel}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                                    log.auditStatus === 'Passed' ? 'text-emerald-400 bg-emerald-500/10' :
                                                    log.auditStatus === 'Critical Warning' ? 'text-rose-400 bg-rose-500/10 animate-pulse' : 'text-amber-400 bg-amber-500/10'
                                                }`}>
                                                    {log.auditStatus}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-sans text-xs text-slate-400 max-w-[240px] truncate" title={log.detailedNotes}>
                                                {log.detailedNotes || 'No notes added.'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Premium Upgrade paywall Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-center">
                        <button 
                            type="button"
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <AlertOctagon className="w-8 h-8 text-amber-500 animate-pulse" />
                        </div>

                        <h3 className="text-xl font-bold text-white tracking-tight">Compliance Trial Limits Met</h3>
                        <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
                            You have consumed all <strong className="text-amber-500">3 free compliance credits</strong> allocated to your trial session. Upgrade to a Pro subscription for infinite cognitive safety audits and real-time ledger uploads.
                        </p>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => {
                                    alert('Upgrade Checkout Simulated. Pro licensing covers high-frequency multi-terminal audits under certified ISO frameworks.');
                                }}
                                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
                            >
                                Upgrade to Premium
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                            >
                                Continue with Sandbox Data
                            </button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            <span>MeloTwo Pro Encrypted Transaction Gate</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
