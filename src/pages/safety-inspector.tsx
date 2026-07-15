import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { ComplianceTrendChart, DailyComplianceData } from '../components/ComplianceTrendChart';
import { CountUp } from '../components/CountUp';
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
    AlertOctagon, 
    Download, 
    ChevronRight, 
    Lock 
} from 'lucide-react';

const SAMPLE_REPORTS = [
    {
        name: 'Gauteng Canteen Cold Chain Log',
        text: 'Date: 2026-07-14\nInspector: Thabo Molefe\nTerminal: SENS-CANTEEN-02\nSANS standard checked: SANS 10330\nFindings: Chicken breast compartment running at 7.1°C instead of sub-4°C. Defrost cycle malfunction. High-risk food exposure category SANS 10330 HACCP violated.'
    },
    {
        name: 'Secunda Distribution Board Safety Sheet',
        text: 'Date: 2026-07-12\nInspector: Johan Coetzee\nTerminal: POWER-DIST-05\nSANS standard checked: SANS 10142-1\nFindings: Three-phase industrial cooker isolator has 0.35m clearance space due to dry storage carts. Direct violation of SANS 10142-1 wiring safety code requiring 1.0m unobstructed box boundary.'
    }
];

interface ComplianceFAQProps {}

const ComplianceFAQ: React.FC<ComplianceFAQProps> = () => {
    return (
        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                SANS Compliance Knowledge base
            </h4>
            <div className="grid md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                    <p className="font-extrabold text-slate-200">What is SANS 10330 (HACCP)?</p>
                    <p className="text-slate-400 leading-relaxed font-sans">
                        It governs Hazard Analysis and Critical Control Point standards for South African food safety. High-risk catering lines must verify sub-4°C holding compartments and 72°C core temperature boundaries to block bacterial proliferation.
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="font-extrabold text-slate-200">What is SANS 10142-1 (Wiring Code)?</p>
                    <p className="text-slate-400 leading-relaxed font-sans">
                        Provides the absolute standard for electrical installations. It mandates a 1.0m deep unobstructed exclusion border around high-voltage boards, and physical segregation of commercial isolators from wet steam emission pipelines.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const SafetyInspectorPage: React.FC = () => {
    const isDemoMode = false;

    const [scenario, setScenario] = useState(() => localStorage.getItem('melotwo_inspector_scenario_draft') || '');
    const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('melotwo_inspector_system_prompt_draft') || 'You are an expert industrial compliance safety officer. Create a professional, detailed audit ledger draft based on the operational scenario.');
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Free tier logic counts
    const [generationCount, setGenerationCount] = useState<number>(() => {
        return parseInt(localStorage.getItem('melotwo_free_inspection_count') || '0', 10);
    });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Workspace & auth telemetry
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [ledgerId, setLedgerId] = useState<string | null>(() => localStorage.getItem('melotwo_ledger_id') || null);
    const [syncStatus, setSyncStatus] = useState<'disconnected' | 'connecting' | 'scanning' | 'connected' | 'error'>('disconnected');
    const [syncError, setSyncError] = useState<string | null>(null);

    // Ledger records
    const [ledgerLogs, setLedgerLogs] = useState<ComplianceLedgerRow[]>(() => {
        try {
            const saved = localStorage.getItem('melotwo_sandbox_logs');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // File Drag/Drop / Scanning States
    const [dragActive, setDragActive] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanSuccess, setScanSuccess] = useState(false);

    // Manual / Auto Parsed form controls
    const [parsedDate, setParsedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [parsedOperator, setParsedOperator] = useState('');
    const [parsedTerminalId, setParsedTerminalId] = useState('');
    const [parsedCategory, setParsedCategory] = useState('General Compliance');
    const [parsedViolationVector, setParsedViolationVector] = useState('');
    const [parsedSeverity, setParsedSeverity] = useState('Medium');
    const [parsedStatus, setParsedStatus] = useState('Action Required');
    const [parsedNotes, setParsedNotes] = useState('');

    const [commitLoading, setCommitLoading] = useState(false);
    const [commitSuccess, setCommitSuccess] = useState(false);

    // Monitor Auth Changes
    useEffect(() => {
        const unsubscribe = initAuthState((usr, tkn) => {
            setUser(usr);
            setToken(tkn);
            if (usr && tkn) {
                setSyncStatus('scanning');
                syncSpreadsheetData(tkn, usr.uid);
            } else {
                setSyncStatus('disconnected');
            }
        });
        return () => unsubscribe();
    }, []);

    // Save drafts continuously
    useEffect(() => {
        localStorage.setItem('melotwo_inspector_scenario_draft', scenario);
    }, [scenario]);

    useEffect(() => {
        localStorage.setItem('melotwo_inspector_system_prompt_draft', systemPrompt);
    }, [systemPrompt]);

    // Async Sheets Telemetry Aggregation
    const syncSpreadsheetData = async (accessToken: string, userId: string) => {
        try {
            const id = await findOrCreateSpreadsheet(accessToken, userId, 'Mine Safety Center');
            setLedgerId(id);
            localStorage.setItem('melotwo_ledger_id', id);

            const remoteLogs = await fetchLedgerRecords(accessToken, id);
            setLedgerLogs(remoteLogs);
            localStorage.setItem('melotwo_sandbox_logs', JSON.stringify(remoteLogs));
            setSyncStatus('connected');
        } catch (err: any) {
            console.error('Spreadsheet sync error:', err);
            setSyncError(err.message || 'Verification Error');
            setSyncStatus('error');
        }
    };

    const handleGoogleAuth = async () => {
        setAuthLoading(true);
        setSyncError(null);
        try {
            const { user: usr, token: tkn } = await loginWithGoogle();
            setUser(usr);
            setToken(tkn);
            setSyncStatus('connecting');
            await syncSpreadsheetData(tkn, usr.uid);
        } catch (err: any) {
            console.error('Google login failed:', err);
            setSyncError(err.message || 'Authentication error');
            setSyncStatus('error');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setAuthLoading(true);
        try {
            await logoutUser();
            setUser(null);
            setToken(null);
            setLedgerId(null);
            setSyncStatus('disconnected');
            localStorage.removeItem('melotwo_ledger_id');
        } catch (err: any) {
            console.error('Logout failed:', err);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
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

    const handleFileUpload = (file: File) => {
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

    // Direct sample log tester loader
    const loadSampleLog = async (text: string) => {
        await processDocumentText(text);
    };

    // Commit log to sheets/firebase ledger
    const handleCommitLedgerLog = async (e: React.FormEvent) => {
        e.preventDefault();
        setCommitLoading(true);
        try {
            const newRecord: ComplianceLedgerRow = {
                date: parsedDate,
                operator: parsedOperator.trim() || 'Site Operator',
                terminalId: parsedTerminalId.trim() || 'TERM-GEN',
                riskCategory: parsedCategory,
                violationVector: parsedViolationVector.trim() || 'General',
                severityLevel: parsedSeverity,
                auditStatus: parsedStatus,
                detailedNotes: parsedNotes.trim() || 'Assessment logged via cognitive ingestion gateway.'
            };

            if (user && token && ledgerId) {
                // Online sync mode
                await appendLedgerRecord(token, ledgerId, newRecord);
                const updated = await fetchLedgerRecords(token, ledgerId);
                setLedgerLogs(updated);
                localStorage.setItem('melotwo_sandbox_logs', JSON.stringify(updated));
            } else {
                // Offline Local Sandbox storage fallback
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
            docPdf.line(20, 48, 190, 48);

            docPdf.setTextColor(255, 255, 255);
            docPdf.setFont('helvetica', 'bold');
            docPdf.setFontSize(12);
            docPdf.text('COGNITIVE EVALUATION ANALYSIS FEED:', 20, 56);

            docPdf.setFont('helvetica', 'normal');
            docPdf.setFontSize(9.5);
            docPdf.setTextColor(203, 213, 225); // slate-300
            
            const splitText = docPdf.splitTextToSize(response.text, 170);
            let y = 64;
            splitText.forEach((line: string) => {
                if (y > 270) {
                    docPdf.addPage();
                    docPdf.setFillColor(15, 23, 42);
                    docPdf.rect(0, 0, 210, 297, 'F');
                    y = 20;
                }
                docPdf.text(line, 20, y);
                y += 6;
            });

            docPdf.save('MeloTwo-Safety-Audit-Ledger.pdf');
        } catch (e) {
            console.error('PDF export failed:', e);
        }
    };

    const handleClearLedger = () => {
        if (window.confirm("Are you sure you want to clear the ledger logs?")) {
            setLedgerLogs([]);
            localStorage.removeItem('melotwo_sandbox_logs');
        }
    };

    // Calculate real-time stats from synchronized list
    const stats = useMemo(() => {
        if (ledgerLogs.length === 0) {
            return { total: 0, critical: 0, avgScore: 100, pending: 0 };
        }
        let critical = 0;
        let actionRequired = 0;
        let sum = 0;

        ledgerLogs.forEach(log => {
            if (log.auditStatus === 'Critical Warning' || log.severityLevel === 'High') {
                critical++;
            }
            if (log.auditStatus === 'Action Required') {
                actionRequired++;
            }
            sum += log.auditStatus === 'Passed' ? 95 : (log.auditStatus === 'Action Required' ? 74 : 52);
        });

        return {
            total: ledgerLogs.length,
            critical,
            pending: actionRequired,
            avgScore: Math.round(sum / ledgerLogs.length)
        };
    }, [ledgerLogs]);

    return (
        <div className="w-full text-slate-100 py-6 min-h-screen relative overflow-hidden font-sans">
            {/* Modal for Upgrade / Free limit notification */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md text-center shadow-2xl relative">
                        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Free Usage Tier Reached</h3>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            You have reached your 3 free cognitive audit generations. Connect your custom Google Workspace Sheet to enable persistent unlimited ledger writes and team exports.
                        </p>
                        <div className="flex flex-col gap-2 mt-6">
                            <button
                                onClick={handleGoogleAuth}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                            >
                                <Database className="w-4 h-4" /> Connect Google Sheet & Sync
                            </button>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Stay on Free Tier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Header Board & Real-time Integration Status Indicator */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800/80 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] bg-indigo-600 text-white font-extrabold tracking-widest px-2.5 py-0.5 rounded-full uppercase">SANS Certified Engine</span>
                            {syncStatus === 'connected' ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sheets Connected
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Local Sandbox
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase">Cognitive Compliance Center</h2>
                        <p className="text-slate-400 text-xs mt-1.5 max-w-xl leading-relaxed">
                            Analyze, index, and commit heavy industrial compliance parameters directly into your team ledger or synchronized Google Workspace Sheets.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 pr-4 shadow-lg">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="user avatar" className="w-8 h-8 rounded-full border border-slate-700 referrerPolicy='no-referrer'" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                                <div className="text-left">
                                    <span className="text-[10px] text-slate-500 font-bold block leading-none">OPERATOR SESSION</span>
                                    <span className="text-xs font-black text-white block mt-0.5 max-w-[120px] truncate">{user.displayName || user.email}</span>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={authLoading}
                                    className="ml-2 p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/10 transition-colors cursor-pointer"
                                    title="Disconnect account"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGoogleAuth}
                                disabled={authLoading}
                                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                            >
                                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                                Sync Google Sheet
                            </button>
                        )}
                    </div>
                </div>

                {/* Real-time B2B Operational Telemetry Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 text-left flex flex-col justify-between shadow-lg relative overflow-hidden group">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Ledger Rows Loaded</span>
                        <div className="text-3xl font-black text-white mt-2 font-mono"><CountUp end={stats.total} /></div>
                        <span className="text-[9px] text-slate-400 mt-2 block font-sans">Synced database parameters</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 text-left flex flex-col justify-between shadow-lg relative overflow-hidden group">
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block font-mono">Critical Warnings</span>
                        <div className="text-3xl font-black text-rose-500 mt-2 font-mono"><CountUp end={stats.critical} /></div>
                        <span className="text-[9px] text-slate-400 mt-2 block font-sans">Requires immediate sign-off</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 text-left flex flex-col justify-between shadow-lg relative overflow-hidden group">
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block font-mono">Action Required</span>
                        <div className="text-3xl font-black text-amber-500 mt-2 font-mono"><CountUp end={stats.pending} /></div>
                        <span className="text-[9px] text-slate-400 mt-2 block font-sans">Awaiting mitigation response</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 text-left flex flex-col justify-between shadow-lg relative overflow-hidden group">
                        <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest block font-mono">Mean Audit Health</span>
                        <div className="text-3xl font-black text-teal-400 mt-2 font-mono"><CountUp end={stats.avgScore} />%</div>
                        <span className="text-[9px] text-slate-400 mt-2 block font-sans">SANS quality assurance metric</span>
                    </div>
                </div>

                {/* Primary Interactive Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Log Scanner and Manual Data Comitter (7 Cols) */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-indigo-400" />
                                    1. Ingest Corrupted Safety Log or Inspection Sheet
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Drag & drop raw safety sheets or inspection logs. MeloTwo uses Google Gemini to instantly parse structured compliance keys.</p>
                            </div>

                            {/* Drag & Drop File Zone */}
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
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-mono">
                                    {scanError}
                                </div>
                            )}

                            {scanSuccess && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex items-center gap-2 font-mono">
                                    <CheckCircle2 className="w-4 h-4" /> SUCCESS: Extracted compliance keys mapping directly to SANS frameworks.
                                </div>
                            )}
                        </div>

                        {/* Interactive Verification Form */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                                <Database className="w-4 h-4 text-indigo-400" />
                                2. SANS & SHEQ Compliance verification Form
                            </h3>
                            
                            <form onSubmit={handleCommitLedgerLog} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Audit Date</label>
                                        <input 
                                            type="date" 
                                            value={parsedDate}
                                            onChange={(e) => setParsedDate(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Inspector / Vendor</label>
                                        <input 
                                            type="text" 
                                            placeholder="Thabo Molefe"
                                            value={parsedOperator}
                                            onChange={(e) => setParsedOperator(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none placeholder-slate-600 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Terminal / Site ID</label>
                                        <input 
                                            type="text" 
                                            placeholder="SITE-304"
                                            value={parsedTerminalId}
                                            onChange={(e) => setParsedTerminalId(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none placeholder-slate-600 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Risk Category</label>
                                        <select 
                                            value={parsedCategory}
                                            onChange={(e) => setParsedCategory(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none transition-colors"
                                        >
                                            <option value="Electrical Safety">Electrical Safety</option>
                                            <option value="Explosion Prevention">Explosion Prevention</option>
                                            <option value="Hygiene & PPE">Hygiene & PPE</option>
                                            <option value="AI Governance">AI Governance</option>
                                            <option value="General Compliance">General Compliance</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">SANS / Violation Vector</label>
                                        <input 
                                            type="text" 
                                            placeholder="SANS 10330 / SANS 10142-1"
                                            value={parsedViolationVector}
                                            onChange={(e) => setParsedViolationVector(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none placeholder-slate-600 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Severity Level</label>
                                        <select 
                                            value={parsedSeverity}
                                            onChange={(e) => setParsedSeverity(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none transition-colors"
                                        >
                                            <option value="High">High Severity</option>
                                            <option value="Medium">Medium Severity</option>
                                            <option value="Low">Low Severity</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Audit Status</label>
                                        <select 
                                            value={parsedStatus}
                                            onChange={(e) => setParsedStatus(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none transition-colors"
                                        >
                                            <option value="Passed">Passed / Verified</option>
                                            <option value="Action Required">Action Required</option>
                                            <option value="Critical Warning">Critical Warning</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Findings & Audit Notes</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Summarize exact hardware faults, SANS standard numbers and required corrective actions."
                                        value={parsedNotes}
                                        onChange={(e) => setParsedNotes(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none placeholder-slate-600 transition-colors resize-none font-mono"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={commitLoading}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
                                >
                                    {commitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                                    {user && token ? 'Sync & Commit to Google Sheet' : 'Commit to Local Sandbox Ledger'}
                                </button>

                                {commitSuccess && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs text-center font-mono">
                                        Row committed successfully and cached.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Right Column: AI Sandbox / Cognitive Auditor Terminal (5 Cols) */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-5 text-left relative overflow-hidden">
                            <div>
                                <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold px-2.5 py-0.5 rounded-full uppercase block w-fit font-mono mb-2">Cognitive AI Sandbox</span>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    3. Write Operational Scenario Draft
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-1">Enter raw plant parameters, canteen heat readings, or safety events. Our SANS compliance model parses and drafts complete audit ledgers instantly.</p>
                            </div>

                            <form className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">SANS Compliance Target Prompt</label>
                                    <input 
                                        type="text"
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        placeholder="You are an expert industrial compliance safety officer..."
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none text-xs font-mono transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Operational Scenario Input</label>
                                    <textarea
                                        rows={6}
                                        value={scenario}
                                        onChange={(e) => setScenario(e.target.value)}
                                        placeholder="Example: Gauteng Canteen cold storage thermostatic measurement verified at 7.1°C... Or distribution panels at SECUNDA blockaded by storage carts..."
                                        className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-xs text-slate-300 outline-none transition-colors font-mono resize-none leading-relaxed"
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
                                    <p className="mt-1 font-mono text-[10px] text-rose-300">{error}</p>
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
                                                    log.severityLevel === 'High' ? 'text-rose-400 bg-rose-500/10' : (log.severityLevel === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10')
                                                }`}>
                                                    {log.severityLevel}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                    log.auditStatus === 'Passed' ? 'text-emerald-400 bg-emerald-500/10' : (log.auditStatus === 'Action Required' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10')
                                                }`}>
                                                    {log.auditStatus}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-sans text-slate-400 max-w-[200px] truncate" title={log.detailedNotes}>{log.detailedNotes || 'No notes added.'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ComplianceFAQ />
            </div>
        </div>
    );
};
