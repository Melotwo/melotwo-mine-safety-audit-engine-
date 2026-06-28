import React, { useState, useEffect, useMemo, useRef } from 'react';

// Services
import { runSafetyInspector } from './services/geminiService';
import { trackGA4Event, subscribeToAnalytics, GA4Event } from './services/analyticsService';
import { interceptCompliancePrompt, getComplianceMetrics, InterceptedPrompt } from './services/promptMetricsService';

// Types & Constants
import { Page, SafetyInspectionResult, InspectionHistoryItem } from './types';
import { AFFILIATE_LINKS, INSPECTOR_TEMPLATES } from './constants';

// --- Global Setup ---
// These globals are injected by the AI Studio preview environment.
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

// --- Icon Definitions (Inlined to avoid './components/icons' import resolution issues) ---
type IconProps = React.SVGProps<SVGSVGElement>;

const Shield: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

const Settings: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);

const Zap: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

const Search: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

const Loader2: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

const User: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const Clock: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const Trash2: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const AlertTriangle: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

const FileText: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
);


// --- Component: GA4MonitorConsole ---
const GA4MonitorConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<GA4Event[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAnalytics((newEvent) => {
      setEvents(prev => [...prev, newEvent].slice(-30)); // Keep last 30 logs
      setIsOpen(true); // Auto-expand when a new event fires to showcase telemetry activity
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, isOpen]);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col font-mono"
      id="ga4-telemetry-console"
    >
      {/* Trigger Button with pulsing dot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white shadow-2xl transition-all hover:border-blue-500/50 cursor-pointer self-end"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span>GA4 Telemetry Console ({events.length})</span>
        <svg 
          className={`w-3 h-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Console Drawer */}
      {isOpen && (
        <div className="mt-2 w-80 md:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-64 ring-1 ring-blue-500/20 animate-fade-in-up">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            <span>Live GA4 Event Logger</span>
            <button 
              onClick={() => setEvents([])} 
              className="text-slate-500 hover:text-white transition-colors text-[9px]"
            >
              Clear Logs
            </button>
          </div>

          {/* Log Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[10px] leading-relaxed select-text custom-scrollbar">
            {events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4">
                <p>&gt;_ Waiting for events...</p>
                <p className="text-[9px] mt-1 text-slate-700">Trigger actions like running an audit, dropping feedback, or modifying charts to see live unmasked GA4 event logs.</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="border-b border-slate-900/50 pb-2">
                  <div className="flex justify-between text-slate-500 mb-0.5">
                    <span>{event.timestamp}</span>
                    <span className="text-blue-400 font-bold">gtag(&apos;event&apos;)</span>
                  </div>
                  <p className="text-amber-400 font-bold">{event.eventName}</p>
                  <pre className="text-[9px] text-slate-400 mt-1 bg-slate-900/40 p-1.5 rounded-lg overflow-x-auto max-w-full">
                    {JSON.stringify(event.params, null, 2)}
                  </pre>
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
          
          {/* Footer */}
          <div className="bg-slate-900/50 px-4 py-1.5 border-t border-slate-800/80 text-[8px] text-slate-500 flex justify-between">
            <span>Status: Listening...</span>
            <span>Unmasked Compliance Agent</span>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Component: AuditHistoryChart ---
interface DataPoint {
  label: string; // date or audit ID
  complianceScore: number; // 0 - 100
  riskLevel: number; // 1 - 10
  ppeDegradation: number; // 0 - 100
}

const AuditHistoryChart: React.FC = () => {
  const [metric, setMetric] = useState<'compliance' | 'risk' | 'ppe'>('compliance');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Initial historical audit data
  const [data, setData] = useState<DataPoint[]>(() => {
    const saved = localStorage.getItem('melotwo_audit_chart_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { label: 'Audit #01', complianceScore: 78, riskLevel: 4, ppeDegradation: 12 },
      { label: 'Audit #02', complianceScore: 82, riskLevel: 3, ppeDegradation: 18 },
      { label: 'Audit #03', complianceScore: 65, riskLevel: 6, ppeDegradation: 25 },
      { label: 'Audit #04', complianceScore: 89, riskLevel: 2, ppeDegradation: 31 },
      { label: 'Audit #05', complianceScore: 94, riskLevel: 1, ppeDegradation: 42 },
      { label: 'Audit #06', complianceScore: 91, riskLevel: 2, ppeDegradation: 48 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('melotwo_audit_chart_data', JSON.stringify(data));
  }, [data]);

  // Method to handle user manually adding an audit record to the history chart
  const handleAddAuditData = () => {
    trackGA4Event('ai_generation_requested', {
      source: 'Add Audit History Chart Action',
      current_points: data.length
    });

    const newAuditNum = data.length + 1;
    const previousPoint = data[data.length - 1] || { complianceScore: 80, riskLevel: 3, ppeDegradation: 30 };
    
    // Create organic trending values with slight randomness
    const variance = Math.floor(Math.random() * 15) - 7; // -7% to +7%
    const newComplianceScore = Math.max(40, Math.min(100, previousPoint.complianceScore + variance));
    const newRiskLevel = Math.max(1, Math.min(10, Math.round(10 - (newComplianceScore / 10))));
    const newPpeDegradation = Math.min(100, previousPoint.ppeDegradation + Math.floor(Math.random() * 10) + 2);

    const newPoint: DataPoint = {
      label: `Audit #${newAuditNum.toString().padStart(2, '0')}`,
      complianceScore: newComplianceScore,
      riskLevel: newRiskLevel,
      ppeDegradation: newPpeDegradation
    };

    setTimeout(() => {
      setData(prev => [...prev, newPoint]);
      trackGA4Event('ai_generation_success', {
        action: 'add_audit_history_point',
        new_point_label: newPoint.label,
        compliance_score: newPoint.complianceScore,
        risk_level: newPoint.riskLevel,
        ppe_degradation: newPoint.ppeDegradation
      });
    }, 400); // simulate brief operational computation
  };

  const activePoints = useMemo(() => {
    return data.map((d, index) => {
      let value = d.complianceScore;
      let maxVal = 100;
      if (metric === 'risk') {
        value = d.riskLevel;
        maxVal = 10;
      } else if (metric === 'ppe') {
        value = d.ppeDegradation;
        maxVal = 100;
      }
      return {
        index,
        label: d.label,
        value,
        raw: d,
        maxVal
      };
    });
  }, [data, metric]);

  // Chart layout calculations
  const width = 600;
  const height = 240;
  const paddingX = 50;
  const paddingY = 30;

  const pointsCoordinates = useMemo(() => {
    if (activePoints.length === 0) return [];
    const stepX = (width - paddingX * 2) / Math.max(1, activePoints.length - 1);
    
    return activePoints.map((p, i) => {
      const x = paddingX + i * stepX;
      // SVG Y-0 is top, so invert the value scale
      const y = height - paddingY - ((p.value / p.maxVal) * (height - paddingY * 2));
      return { x, y, value: p.value, label: p.label, index: p.index };
    });
  }, [activePoints, width, height, paddingX, paddingY]);

  // Generate SVG Path for line
  const linePath = useMemo(() => {
    if (pointsCoordinates.length === 0) return '';
    return pointsCoordinates.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');
  }, [pointsCoordinates]);

  // Generate SVG Area Path (shaded area below line)
  const areaPath = useMemo(() => {
    if (pointsCoordinates.length === 0) return '';
    const first = pointsCoordinates[0];
    const last = pointsCoordinates[pointsCoordinates.length - 1];
    const basePath = pointsCoordinates.reduce((path, p) => `${path} L ${p.x} ${p.y}`, `M ${first.x} ${height - paddingY}`);
    return `${basePath} L ${last.x} ${height - paddingY} Z`;
  }, [pointsCoordinates, height, paddingY]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col gap-6 w-full relative overflow-hidden" id="compliance-history-widget">
      {/* Decorative safety glow stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 animate-pulse"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping mr-2.5"></span>
            Operational Compliance & Red Team Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-1">Real-time telemetry and South African safety metrics tracking</p>
        </div>

        {/* Action Button: Add Audit History Chart */}
        <button
          onClick={handleAddAuditData}
          id="btn-add-audit-chart"
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_22px_rgba(245,158,11,0.5)] cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Audit History Chart
        </button>
      </div>

      {/* Tabs to select metric */}
      <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
        <button
          onClick={() => setMetric('compliance')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${metric === 'compliance' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          Compliance Scores
        </button>
        <button
          onClick={() => setMetric('risk')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${metric === 'risk' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          Risk Levels
        </button>
        <button
          onClick={() => setMetric('ppe')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${metric === 'ppe' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          PPE Degradation
        </button>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative flex-1 w-full bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 min-h-[250px] flex items-center justify-center">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full max-h-[240px]"
        >
          {/* Y-axis gridlines & labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            const val = metric === 'risk' 
              ? Math.round(10 - ratio * 10) 
              : Math.round(100 - ratio * 100);
            return (
              <g key={i} className="opacity-40">
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="#334155" 
                  strokeWidth={1} 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 4} 
                  fill="#94a3b8" 
                  fontSize={10} 
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {pointsCoordinates.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 8}
              fill="#94a3b8"
              fontSize={10}
              fontFamily="monospace"
              textAnchor="middle"
              className="opacity-70"
            >
              {p.label}
            </text>
          ))}

          {/* Area under curve (Shaded Amber) */}
          <path
            d={areaPath}
            fill="url(#amber-gradient)"
            className="opacity-10 transition-all duration-500"
          />

          {/* Main Line Plot (Amber/Orange Glow) */}
          <path
            d={linePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-filter)"
            className="transition-all duration-500"
          />

          {/* Circular Data Points */}
          {pointsCoordinates.map((p, i) => (
            <g 
              key={i}
              onMouseEnter={() => setHoveredPoint(p.index)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer group"
            >
              {/* Pulse effect on hover */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === p.index ? 10 : 0}
                fill="#f59e0b"
                className="fill-opacity-20 animate-ping transition-all duration-200"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === p.index ? 6 : 4}
                fill={hoveredPoint === p.index ? '#fbbf24' : '#f59e0b'}
                stroke="#1e293b"
                strokeWidth={2}
                className="transition-all duration-200"
              />
            </g>
          ))}

          {/* Gradients and Filters definition */}
          <defs>
            <linearGradient id="amber-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"/>
            </linearGradient>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint !== null && pointsCoordinates[hoveredPoint] && (
          <div 
            className="absolute bg-slate-950 border border-amber-500/50 p-3 rounded-lg shadow-2xl z-20 pointer-events-none text-xs font-mono"
            style={{
              left: `${Math.min(75, Math.max(10, (pointsCoordinates[hoveredPoint].x / width) * 100))}%`,
              top: `${Math.min(65, Math.max(10, (pointsCoordinates[hoveredPoint].y / height) * 100 - 25))}%`
            }}
          >
            <p className="text-amber-500 font-bold">{data[hoveredPoint].label}</p>
            <p className="text-slate-300 mt-1">Compliance: <span className="text-white font-bold">{data[hoveredPoint].complianceScore}%</span></p>
            <p className="text-slate-300">Risk Factor: <span className="text-white font-bold">{data[hoveredPoint].riskLevel}/10</span></p>
            <p className="text-slate-300">PPE Degradation: <span className="text-white font-bold">{data[hoveredPoint].ppeDegradation}%</span></p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-xl text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <span>Target Standard: SANS 10330 / HACCP</span>
        </div>
        <span>Data persistent across local session audits</span>
      </div>
    </div>
  );
};


// --- Component: UserFeedbackWidget ---
const UserFeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [framework, setFramework] = useState('');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!framework.trim() || !region.trim()) return;

    setLoading(true);
    trackGA4Event('ai_generation_requested', {
      source: 'User Feedback Submission',
      region,
      framework
    });

    setTimeout(() => {
      // Store in local storage
      const savedFeedback = localStorage.getItem('melotwo_user_feedback');
      const list = savedFeedback ? JSON.parse(savedFeedback) : [];
      list.push({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        framework,
        region,
        email: email || 'anonymous',
      });
      localStorage.setItem('melotwo_user_feedback', JSON.stringify(list));

      // Fire success telemetry event
      trackGA4Event('ai_generation_success', {
        action: 'submit_compliance_feedback',
        framework,
        region,
        email_provided: !!email
      });

      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        // Reset state after closing
        setFramework('');
        setRegion('');
        setEmail('');
        setSubmitted(false);
      }, 2000);
    }, 600);
  };

  return (
    <>
      {/* High-Contrast Interactive Card Trigger */}
      <div 
        id="feedback-hook-trigger"
        className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border-2 border-amber-500/80 rounded-2xl p-5 shadow-[0_4px_25px_rgba(245,158,11,0.15)] flex flex-col gap-3 relative overflow-hidden"
      >
        {/* Decorative caution stripes */}
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20">
          <svg className="w-full h-full text-amber-500" viewBox="0 0 100 100" fill="currentColor">
            <path d="M0,0 L100,100 M20,0 L100,80 M40,0 L100,60 M60,0 L100,40 M80,0 L100,20 M0,20 L80,100 M0,40 L60,100 M0,60 L40,100 M0,80 L20,100" stroke="currentColor" strokeWidth="15" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">Global Expansion</span>
        </div>

        <p className="text-slate-200 text-sm font-semibold leading-relaxed">
          Testing from outside South Africa? Let us know what compliance framework you need!
        </p>

        <button
          onClick={() => {
            setIsOpen(true);
            trackGA4Event('feedback_modal_opened', { source: 'sidebar_widget' });
          }}
          className="self-start mt-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          Drop Feedback
          <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-100 ring-1 ring-amber-500/20">
            {/* Caution Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600"></div>

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close Modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">Compliance Request</h3>
                  <p className="text-xs text-slate-400 mt-1">Help us map international frameworks like FDA, ISO 22000, and NIST.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Requested Framework</label>
                  <input
                    type="text"
                    required
                    value={framework}
                    onChange={e => setFramework(e.target.value)}
                    placeholder="e.g. ISO 22000, FDA Hygiene, NIST SP 800-53"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder:text-slate-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Your Operating Region</label>
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    placeholder="e.g. United Kingdom, Singapore, Texas (USA)"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder:text-slate-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Corporate Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading && (
                      <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Submit Framework
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Feedback Received!</h3>
                <p className="text-xs text-slate-400">Our SANS Compliance mapping team has logged your operational request.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};


// --- Component: PromptMetricsDashboard ---
const PromptMetricsDashboard: React.FC = () => {
  const [records, setRecords] = useState<InterceptedPrompt[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  useEffect(() => {
    setRecords(getComplianceMetrics());
    // Periodically sync
    const interval = setInterval(() => {
      setRecords(getComplianceMetrics());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Region Distribution
  const regionStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      counts[r.region] = (counts[r.region] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / records.length) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [records]);

  // Calculate Compliance Category Distribution
  const categoryStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      counts[r.complianceStandard] = (counts[r.complianceStandard] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / records.length) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [records]);

  const filteredRecords = selectedRegion === 'All' 
    ? records 
    : records.filter(r => r.region === selectedRegion);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col gap-6" id="compliance-metrics-panel">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          Compliance Search Metrics & Redaction Engine
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Anonymized real-time telemetry analyzing what SANS standards regional operators are querying.
        </p>
      </div>

      {/* Grid of Distribution Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Region Trends */}
        <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Regional Search Traffic</h4>
          <div className="space-y-2.5">
            {regionStats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">{stat.name}</span>
                  <span className="text-amber-500 font-bold">{stat.percentage}% <span className="text-slate-600 font-normal">({stat.count} queries)</span></span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Trends */}
        <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Framework Distributions</h4>
          <div className="space-y-2.5">
            {categoryStats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium truncate max-w-[200px]" title={stat.name}>{stat.name}</span>
                  <span className="text-blue-400 font-bold">{stat.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intercepted Search Prompt Feed */}
      <div className="border border-slate-800 bg-slate-950 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] bg-emerald-500/15 text-emerald-400 font-bold rounded-md border border-emerald-500/30 font-mono">COMPLIANT ANONYMIZATION ON</span>
            <span className="text-xs text-slate-300 font-bold">Secure Scraped Prompts Stream</span>
          </div>

          {/* Region filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Filter Region:</span>
            <select 
              value={selectedRegion} 
              onChange={e => setSelectedRegion(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="All">All Regions</option>
              {regionStats.map(stat => (
                <option key={stat.name} value={stat.name}>{stat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
          {filteredRecords.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 font-mono">No prompts intercepted for the selected filters.</p>
          ) : (
            filteredRecords.map((item, i) => (
              <div key={item.id || i} className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl space-y-2 relative overflow-hidden">
                <div className="flex flex-wrap justify-between items-center gap-2 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">[{new Date(item.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-amber-500 font-bold">{item.region}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-blue-400 font-medium">{item.complianceStandard}</span>
                  </div>

                  {item.piiDetected && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded text-[9px] font-bold">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      PII REDACTED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 italic pl-2.5 border-l-2 border-slate-700 select-all font-mono">
                  &quot;{item.scrubbedText}&quot;
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


// --- Component: Navbar ---
interface NavbarProps {
    currentPage: Page;
    setPage: (page: Page) => void;
    userId: string | null;
    isAuthReady: boolean;
}

const AppNavbar: React.FC<NavbarProps> = ({ currentPage, setPage, userId, isAuthReady }) => {
    const navItems: { name: string; page: Page }[] = [
        { name: 'Home', page: 'home' },
        { name: 'Solutions', page: 'solutions' },
        { name: 'AI Safety Inspector', page: 'inspector' },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button onClick={() => setPage('home')} className="flex items-center space-x-2 shrink-0" aria-label="Go to homepage">
                    <Shield className="w-7 h-7 text-indigo-600" />
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Melotwo</span>
                </button>
                
                <nav className="hidden lg:flex space-x-8">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => setPage(item.page)}
                            className={`px-3 py-2 text-sm font-medium transition duration-150 ease-in-out rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                currentPage === item.page
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center space-x-3 md:space-x-4">
                    {isAuthReady && userId ? (
                        <div 
                            id="user-profile-chip" 
                            className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full pl-1.5 pr-3.5 py-1 shadow-sm transition-all hover:bg-indigo-100/50"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
                                <User className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            
                            <span className="font-mono text-xs font-semibold text-indigo-950" title={userId}>
                                <span className="text-indigo-500 font-bold mr-1">Session ID:</span>
                                {userId.slice(0, 6)}...
                            </span>
                        </div>
                    ) : (
                         <div className="h-9 w-32 bg-gray-100 animate-pulse rounded-full"></div>
                    )}
                    
                    <button className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Get Started
                    </button>
                </div>
            </div>
            
            <div className="lg:hidden border-t border-gray-100 py-2 overflow-x-auto">
                 <div className="flex justify-around px-4 min-w-max">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => setPage(item.page)}
                            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                                currentPage === item.page
                                    ? 'text-indigo-600'
                                    : 'text-gray-500'
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                 </div>
            </div>
        </header>
    );
};


// --- Component: Footer ---
const AppFooter: React.FC = () => (
    <footer className="bg-gray-800 mt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
            <nav className="flex flex-wrap justify-center -mx-5 -my-2">
                <div className="px-5 py-2">
                    <a href="#" className="text-base text-gray-300 hover:text-white">Home</a>
                </div>
                <div className="px-5 py-2">
                    <a href="#" className="text-base text-gray-300 hover:text-white">Solutions</a>
                </div>
                <div className="px-5 py-2">
                    <a href="#" className="text-base text-gray-300 hover:text-white">Inspector</a>
                </div>
                <div className="px-5 py-2">
                    <a href="#" className="text-base text-gray-300 hover:text-white">Careers</a>
                </div>
            </nav>
            <div className="mt-8">
                <h4 className="text-lg font-semibold text-center text-gray-300 mb-4">Affiliate Links</h4>
                <div className="flex justify-center space-x-6">
                    {AFFILIATE_LINKS.map(link => (
                        <a key={link.id} href={link.url} className="text-sm text-indigo-400 hover:text-indigo-300 transition duration-150 ease-in-out">
                            {link.name}
                        </a>
                    ))}
                </div>
            </div>
            <p className="mt-8 text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} Melotwo, Inc. All rights reserved.
            </p>
        </div>
    </footer>
);


// --- Component: SafetyInspectorPage ---
const SafetyInspectorPage: React.FC = () => {
    // State initialization
    const [scenario, setScenario] = useState(() => localStorage.getItem('melotwo_inspector_scenario_draft') || '');
    const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('melotwo_inspector_system_prompt_draft') || 'You are a helpful and ethical AI assistant. Do not generate harmful or illegal content.');
    const [response, setResponse] = useState<SafetyInspectionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<InspectionHistoryItem[]>([]);
    const [historySearchTerm, setHistorySearchTerm] = useState('');

    // Effects
    useEffect(() => { localStorage.setItem('melotwo_inspector_scenario_draft', scenario); }, [scenario]);
    useEffect(() => { localStorage.setItem('melotwo_inspector_system_prompt_draft', systemPrompt); }, [systemPrompt]);
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('melotwo_inspector_history');
            if (savedHistory) setHistory(JSON.parse(savedHistory));
        } catch (e) { console.error(e); }
    }, []);

    // Handlers
    const saveToHistory = (newResult: SafetyInspectionResult, currentScenario: string, currentSystemPrompt: string) => {
        const newItem: InspectionHistoryItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            scenario: currentScenario,
            systemPrompt: currentSystemPrompt,
            result: newResult
        };
        const updatedHistory = [newItem, ...history].slice(0, 50);
        setHistory(updatedHistory);
        localStorage.setItem('melotwo_inspector_history', JSON.stringify(updatedHistory));
    };

    const loadHistoryItem = (item: InspectionHistoryItem) => {
        setScenario(item.scenario);
        setSystemPrompt(item.systemPrompt);
        setResponse(item.result);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const template = INSPECTOR_TEMPLATES.find(t => t.id === e.target.value);
        if (template) {
            setScenario(template.scenario);
            setSystemPrompt(template.systemPrompt);
            setError(null);
            setResponse(null);
        }
    };

    // Generalized Auditor Trigger with full secure prompt interception and GA4 telemetry events
    const runAudit = async (isOperationalAudit: boolean) => {
        if (!scenario.trim()) { 
            setError('Please enter a scenario.'); 
            return; 
        }
        setLoading(true); 
        setError(null);

        // SECURELY AND ANONYMOUSLY INTERCEPT AND STRUCTURE USER INPUT
        interceptCompliancePrompt(scenario);

        // LOG GA4 EVENT: Requested
        trackGA4Event('ai_generation_requested', {
            action_type: isOperationalAudit ? 'secure_operational_audit' : 'red_team_inspector_run',
            prompt_length: scenario.length,
            system_instruction_length: systemPrompt.length,
            standard_detected: scenario.toLowerCase().includes('sans') ? 'SANS Standard' : 'General'
        });
        
        setResponse({ text: '', score: '...', label: 'Analyzing...', color: 'text-gray-500 bg-gray-100 border-gray-500' });

        try {
            const finalResult = await runSafetyInspector(scenario, systemPrompt, (streamedText) => {
                setResponse(prev => prev ? { ...prev, text: streamedText } : null);
            });
            setResponse(finalResult);
            saveToHistory(finalResult, scenario, systemPrompt);

            // LOG GA4 EVENT: Success
            trackGA4Event('ai_generation_success', {
                action_type: isOperationalAudit ? 'secure_operational_audit' : 'red_team_inspector_run',
                risk_score: finalResult.score,
                assessment: finalResult.label,
                prompt_length: scenario.length
            });
        } catch (err: any) {
            const errMsg = err.message || 'An unknown error occurred.';
            setError(errMsg);
            setResponse(null);

            // LOG GA4 EVENT: Failed
            trackGA4Event('ai_generation_failed', {
                action_type: isOperationalAudit ? 'secure_operational_audit' : 'red_team_inspector_run',
                error_message: errMsg,
                prompt_length: scenario.length
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item => 
        item.scenario.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
        item.result.label.toLowerCase().includes(historySearchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">SANS Compliance & Safety Inspector</h1>
                <p className="mt-3 text-lg text-gray-500">
                    Verify South African National Standards compliance, simulate red-team attacks, and secure operational audits.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Input Form & Sidebar Widgets */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900 flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-indigo-500"/> Audit Configuration
                            </h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={(e) => { e.preventDefault(); runAudit(false); }} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Load Template</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <select onChange={handleTemplateChange} defaultValue="" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:bg-white hover:border-gray-300">
                                            <option value="" disabled>Select a predefined scenario...</option>
                                            {INSPECTOR_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">User Prompt / Scenario</label>
                                    <textarea 
                                        value={scenario}
                                        onChange={(e) => setScenario(e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                        placeholder="e.g. Enter SANS 10330 HACCP temperatures, or general prompts..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">System Instructions (Guardrail)</label>
                                    <textarea 
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                        placeholder="Define the AI's persona and safety constraints..."
                                    />
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <div className="flex gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => { setScenario(''); setResponse(null); setError(null); }} 
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            Clear
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => runAudit(false)}
                                            disabled={loading} 
                                            id="btn-run-inspector"
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
                                            {loading ? 'Analyzing...' : 'Run Red-Team'}
                                        </button>
                                    </div>

                                    {/* EXPLICIT ACTION COMPONENT: Secure Your Operational Audit */}
                                    <button 
                                        type="button"
                                        onClick={() => runAudit(true)}
                                        disabled={loading}
                                        id="btn-secure-audit"
                                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.2)] text-slate-950 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-950" /> : (
                                            <svg className="w-4 h-4 mr-2 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                            </svg>
                                        )}
                                        Secure Your Operational Audit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* SANS Regional Feedback Hook Widget */}
                    <UserFeedbackWidget />

                    {/* History Panel */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[300px]">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-500"/> Recent Tests & Audits
                            </h3>
                            {history.length > 0 && (
                                <button 
                                    onClick={() => { if(confirm('Clear history?')) {setHistory([]); localStorage.removeItem('melotwo_inspector_history');}}} 
                                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                    title="Clear History"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                        
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search past results..." 
                                    value={historySearchTerm} 
                                    onChange={e => setHistorySearchTerm(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                    <Clock className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm">No tests run yet.</p>
                                </div>
                            ) : (
                                filteredHistory.map(item => (
                                    <div key={item.id} onClick={() => loadHistoryItem(item)} className="p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 cursor-pointer transition-all group">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.result.color.replace('text-', 'text-opacity-90 ').replace('bg-', 'bg-opacity-60 ')}`}>
                                                {item.result.label}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-mono">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 font-medium group-hover:text-indigo-900 transition-colors">{item.scenario}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Results & Graphs Grid */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Analysis Report Card */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start animate-fade-in-up shadow-sm">
                            <div className="p-2 bg-red-100 rounded-lg mr-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-red-900 font-bold mb-1">Analysis Failed</h3>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {!response && !error ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                <Zap className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Inspect & Audit</h3>
                            <p className="text-gray-500 max-w-sm text-center text-sm">Select a pre-configured template (like SANS 10330 HACCP) or input custom data on the left to trigger safety audits.</p>
                        </div>
                    ) : (
                        response && (
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up ring-1 ring-black/5">
                                {/* Result Header */}
                                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Analysis Report</h2>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                                            <Zap className="w-3 h-3 mr-1 text-indigo-500" /> Powered by Gemini 2.5 Flash
                                        </p>
                                    </div>
                                    <div className={`flex items-center px-6 py-3 rounded-2xl border ${response.color} bg-white shadow-sm`}>
                                        <div className="text-center mr-6">
                                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Audit Score</div>
                                            <div className="text-2xl font-black tracking-tight">{response.score}</div>
                                        </div>
                                        <div className="h-10 w-px bg-current opacity-10 mr-6"></div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Assessment</div>
                                            <div className="text-lg font-bold whitespace-nowrap">{response.label}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Result Body */}
                                <div className="p-8">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2.5"></div>
                                        Compliance Analysis Output
                                    </h3>
                                    <div className="bg-slate-900 rounded-2xl p-6 shadow-inner overflow-hidden relative group">
                                        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(response.text)}
                                                className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded cursor-pointer"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {response.text}
                                            {loading && <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle"/>}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* Highly Polished Amber Industrial Chart */}
                    <AuditHistoryChart />

                    {/* Secure Intercepted Prompt Analytics Dashboard */}
                    <PromptMetricsDashboard />
                </div>
            </div>
        </div>
    );
};


// --- Component: Main App ---
const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Run with standard local session ID
        setUserId(crypto.randomUUID());
        setIsAuthReady(true);
    }, []);

    const renderPage = useMemo(() => {
        return <SafetyInspectorPage />;
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans relative">
            <AppNavbar 
                currentPage={currentPage} 
                setPage={setCurrentPage} 
                userId={userId} 
                isAuthReady={isAuthReady} 
            />
            <main className="flex-grow pt-4">
                {renderPage}
            </main>
            <AppFooter />
            <GA4MonitorConsole />
        </div>
    );
};

export default App;
