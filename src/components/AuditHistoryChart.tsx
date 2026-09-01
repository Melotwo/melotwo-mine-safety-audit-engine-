import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { ComplianceTrendChart, DailyComplianceData } from './ComplianceTrendChart';
import { trackGA4Event } from '../services/analyticsService';

// --- Interface: DataPoint ---
interface DataPoint {
  label: string; // date or audit ID
  complianceScore: number; // 0 - 100
  riskLevel: number; // 1 - 10
  ppeDegradation: number; // 0 - 100
  date?: string;          // YYYY-MM-DD
  flaggedIncidents?: number;
}

export const AuditHistoryChart: React.FC = () => {
  const [metric, setMetric] = useState<'compliance' | 'risk' | 'ppe'>('compliance');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showComparator, setShowComparator] = useState<boolean>(true);
  const [showThresholdConfig, setShowThresholdConfig] = useState<boolean>(false);
  const [compareA, setCompareA] = useState<number>(0);
  const [compareB, setCompareB] = useState<number>(1);

  // Warning thresholds (with localStorage persistence)
  const [complianceThreshold, setComplianceThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('melotwo_compliance_threshold');
    return saved ? parseInt(saved, 10) : 80;
  });
  const [riskThreshold, setRiskThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('melotwo_risk_threshold');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [ppeThreshold, setPpeThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('melotwo_ppe_threshold');
    return saved ? parseInt(saved, 10) : 40;
  });

  useEffect(() => {
    localStorage.setItem('melotwo_compliance_threshold', complianceThreshold.toString());
  }, [complianceThreshold]);

  useEffect(() => {
    localStorage.setItem('melotwo_risk_threshold', riskThreshold.toString());
  }, [riskThreshold]);

  useEffect(() => {
    localStorage.setItem('melotwo_ppe_threshold', ppeThreshold.toString());
  }, [ppeThreshold]);

  // Heatmap constants
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapShifts = [
    { name: 'Graveyard Shift (00:00-06:00)', short: 'Graveyard' },
    { name: 'Morning Shift (06:00-12:00)', short: 'Morning' },
    { name: 'Afternoon Shift (12:00-18:00)', short: 'Afternoon' },
    { name: 'Evening Shift (18:00-24:00)', short: 'Evening' },
  ];

  // Persistent heatmap data
  const [heatmapData, setHeatmapData] = useState<number[][]>(() => {
    const saved = localStorage.getItem('melotwo_audit_heatmap_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      [2, 0, 1, 4, 1, 2, 0], // Graveyard
      [8, 12, 7, 15, 9, 4, 3], // Morning
      [14, 18, 12, 22, 11, 6, 5], // Afternoon
      [6, 8, 5, 10, 7, 3, 2], // Evening
    ];
  });

  useEffect(() => {
    localStorage.setItem('melotwo_audit_heatmap_data', JSON.stringify(heatmapData));
  }, [heatmapData]);

  const handleCellClick = (r: number, c: number) => {
    setHeatmapData(prev => {
      const copy = prev.map(row => [...row]);
      copy[r][c] += 1;
      return copy;
    });
    trackGA4Event('heatmap_cell_incremented', {
      shift: heatmapShifts[r].name,
      day: heatmapDays[c],
      new_intensity: heatmapData[r][c] + 1
    });
  };

  const handleSimulatePatrol = () => {
    setHeatmapData(prev => {
      const copy = prev.map(row => [...row]);
      for (let i = 0; i < 4; i++) {
        const rRow = Math.floor(Math.random() * heatmapShifts.length);
        const rCol = Math.floor(Math.random() * heatmapDays.length);
        copy[rRow][rCol] += Math.floor(Math.random() * 3) + 1;
      }
      return copy;
    });
    trackGA4Event('heatmap_patrol_simulated', {
      timestamp: new Date().toISOString()
    });
  };

  const handleDownloadCSV = () => {
    const csvHeaders = ['Shift Window', ...heatmapDays, 'Weekly Total'];
    const csvRows = heatmapShifts.map((shift, rIdx) => {
      const rowData = heatmapData[rIdx];
      const rowSum = rowData.reduce((a, b) => a + b, 0);
      return [
        `"${shift.name}"`,
        ...rowData,
        rowSum
      ].join(',');
    });

    const colTotals = heatmapDays.map((_, cIdx) => {
      return heatmapShifts.reduce((sum, _, rIdx) => sum + heatmapData[rIdx][cIdx], 0);
    });
    const totalSum = colTotals.reduce((a, b) => a + b, 0);
    const totalsRow = ['"Total Checks"', ...colTotals, totalSum].join(',');

    const csvContent = [csvHeaders.join(','), ...csvRows, totalsRow].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `melotwo_safety_audit_intensity_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackGA4Event('heatmap_csv_downloaded', {
      total_checks: totalSum,
      timestamp: new Date().toISOString()
    });
  };

  // Initial historical audit data
  const [data, setData] = useState<DataPoint[]>(() => {
    const saved = localStorage.getItem('melotwo_audit_chart_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { label: 'Audit #01', complianceScore: 78, riskLevel: 4, ppeDegradation: 12, date: '2026-06-25', flaggedIncidents: 5 },
      { label: 'Audit #02', complianceScore: 82, riskLevel: 3, ppeDegradation: 18, date: '2026-06-26', flaggedIncidents: 3 },
      { label: 'Audit #03', complianceScore: 65, riskLevel: 6, ppeDegradation: 25, date: '2026-06-27', flaggedIncidents: 8 },
      { label: 'Audit #04', complianceScore: 89, riskLevel: 2, ppeDegradation: 31, date: '2026-06-28', flaggedIncidents: 2 },
      { label: 'Audit #05', complianceScore: 94, riskLevel: 1, ppeDegradation: 42, date: '2026-06-29', flaggedIncidents: 1 },
      { label: 'Audit #06', complianceScore: 91, riskLevel: 2, ppeDegradation: 48, date: '2026-06-30', flaggedIncidents: 2 },
      { label: 'Audit #07', complianceScore: 94, riskLevel: 1, ppeDegradation: 40, date: '2026-07-01', flaggedIncidents: 2 },
      { label: 'Audit #08', complianceScore: 91, riskLevel: 2, ppeDegradation: 45, date: '2026-07-02', flaggedIncidents: 4 },
      { label: 'Audit #09', complianceScore: 96, riskLevel: 1, ppeDegradation: 38, date: '2026-07-03', flaggedIncidents: 1 },
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
    const previousPoint = data[data.length - 1] || { complianceScore: 80, riskLevel: 3, ppeDegradation: 30, date: '2026-07-03', flaggedIncidents: 1 };
    
    // Create organic trending values with slight randomness
    const variance = Math.floor(Math.random() * 15) - 7; // -7% to +7%
    const newComplianceScore = Math.max(40, Math.min(100, previousPoint.complianceScore + variance));
    const newRiskLevel = Math.max(1, Math.min(10, Math.round(10 - (newComplianceScore / 10))));
    const newPpeDegradation = Math.min(100, (previousPoint.ppeDegradation || 30) + Math.floor(Math.random() * 10) + 2);

    const lastDateStr = previousPoint.date || '2026-07-03';
    const lastD = new Date(lastDateStr);
    lastD.setDate(lastD.getDate() + 1);
    const nextDateStr = lastD.toISOString().split('T')[0];

    const flaggedIncidents = newComplianceScore < 80 
      ? Math.floor(Math.random() * 5) + 3 
      : newComplianceScore < 90 
        ? Math.floor(Math.random() * 3) + 1 
        : 0;

    const newPoint: DataPoint = {
      label: `Audit #${newAuditNum.toString().padStart(2, '0')}`,
      complianceScore: newComplianceScore,
      riskLevel: newRiskLevel,
      ppeDegradation: newPpeDegradation,
      date: nextDateStr,
      flaggedIncidents
    };

    setTimeout(() => {
      setData(prev => [...prev, newPoint]);
      
      // Update heatmap with random intensity on historical audit logging
      setHeatmapData(prev => {
        const copy = prev.map(row => [...row]);
        const rRow = Math.floor(Math.random() * heatmapShifts.length);
        const rCol = Math.floor(Math.random() * heatmapDays.length);
        copy[rRow][rCol] += Math.floor(Math.random() * 3) + 2;
        return copy;
      });

      trackGA4Event('ai_generation_success', {
        action: 'add_audit_history_point',
        new_point_label: newPoint.label,
        compliance_score: newPoint.complianceScore,
        risk_level: newPoint.riskLevel,
        ppe_degradation: newPoint.ppeDegradation
      });
    }, 400);
  };

  const d3ComplianceData: DailyComplianceData[] = useMemo(() => {
    return data.map((d, index) => {
      const dateOffset = index;
      const date = d.date || `2026-06-${(25 + dateOffset).toString().padStart(2, '0')}`;
      const flaggedIncidents = d.flaggedIncidents !== undefined
        ? d.flaggedIncidents
        : (d.complianceScore < 80 ? 4 : d.complianceScore < 90 ? 2 : 0);
      return {
        date,
        complianceScore: d.complianceScore,
        flaggedIncidents
      };
    });
  }, [data]);

  const safeCompareA = compareA < data.length ? compareA : Math.max(0, data.length - 2);
  const safeCompareB = compareB < data.length ? compareB : Math.max(0, data.length - 1);

  const compAItem = data[safeCompareA] || data[0];
  const compBItem = data[safeCompareB] || data[data.length - 1] || data[0];

  const complianceDelta = compBItem && compAItem ? compBItem.complianceScore - compAItem.complianceScore : 0;
  const riskDelta = compBItem && compAItem ? compBItem.riskLevel - compAItem.riskLevel : 0;
  const ppeDelta = compBItem && compAItem ? compBItem.ppeDegradation - compAItem.ppeDegradation : 0;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const marginX = 20;
    let yOffset = 20;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MELO TWO SAFETY & COMPLIANCE REPORT', marginX, yOffset);
    yOffset += 10;

    doc.setFontSize(10);
    doc.text(`Comparative Analysis: ${compAItem?.label} vs ${compBItem?.label}`, marginX, yOffset);
    yOffset += 10;

    doc.text(`Compliance Delta: ${complianceDelta > 0 ? '+' : ''}${complianceDelta}%`, marginX, yOffset);
    yOffset += 6;
    doc.text(`Risk Index Delta: ${riskDelta > 0 ? '+' : ''}${riskDelta}`, marginX, yOffset);
    yOffset += 6;
    doc.text(`PPE Wear Delta: ${ppeDelta > 0 ? '+' : ''}${ppeDelta}%`, marginX, yOffset);

    doc.save(`MeloTwo_Safety_Report_${compAItem?.label}_vs_${compBItem?.label}.pdf`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col gap-6 w-full relative overflow-hidden" id="compliance-history-widget">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 animate-pulse"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping mr-2.5"></span>
            Operational Compliance & Red Team Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-1">Real-time telemetry and South African safety metrics tracking</p>
        </div>

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

      <ComplianceTrendChart
        data={d3ComplianceData}
        onDataAdd={(newPoint) => {
          const newAuditNum = data.length + 1;
          setData(prev => [...prev, {
            label: `Audit #${newAuditNum.toString().padStart(2, '0')}`,
            complianceScore: newPoint.complianceScore,
            riskLevel: Math.max(1, Math.min(10, Math.round(10 - (newPoint.complianceScore / 10)))),
            ppeDegradation: Math.min(100, Math.max(10, Math.round(100 - newPoint.complianceScore * 0.8))),
            date: newPoint.date,
            flaggedIncidents: newPoint.flaggedIncidents
          }]);
        }}
        onClearData={() => {
          setData([
            { label: 'Audit #01', complianceScore: 78, riskLevel: 4, ppeDegradation: 12, date: '2026-06-25', flaggedIncidents: 5 },
            { label: 'Audit #02', complianceScore: 82, riskLevel: 3, ppeDegradation: 18, date: '2026-06-26', flaggedIncidents: 3 },
            { label: 'Audit #03', complianceScore: 65, riskLevel: 6, ppeDegradation: 25, date: '2026-06-27', flaggedIncidents: 8 },
            { label: 'Audit #04', complianceScore: 89, riskLevel: 2, ppeDegradation: 31, date: '2026-06-28', flaggedIncidents: 2 },
            { label: 'Audit #05', complianceScore: 94, riskLevel: 1, ppeDegradation: 42, date: '2026-06-29', flaggedIncidents: 1 },
          ]);
        }}
      />

      {/* Comparative Analysis & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulatePatrol}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition-colors"
          >
            Simulate Patrols
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition-colors"
          >
            Export CSV
          </button>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default AuditHistoryChart;
