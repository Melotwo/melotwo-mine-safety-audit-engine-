import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  ArrowRight, 
  ChevronRight, 
  Building2, 
  FileText, 
  RotateCcw, 
  Sparkles, 
  Scale, 
  Share2, 
  Check, 
  Info, 
  ExternalLink,
  MapPin,
  Lock,
  Flame,
  Droplets,
  Layers,
  ArrowLeft
} from 'lucide-react';
import jsPDF from 'jspdf';
import { 
  ZAMBIAN_15_POINT_DIAGNOSTIC_QUESTIONS, 
  calculate15PointReadinessScore, 
  DiagnosticQuestion,
  DiagnosticAssessmentResult
} from '../config/zambianMhsCompliance';
import { ZAMBIAN_COMPLIANCE_DISCLAIMERS } from '../config/regulatoryRules.zambia';
import { MeloTwoLogo } from './MeloTwoLogo';

export interface ZambiaComplianceAssessmentProps {
  onClose?: () => void;
  onOpenTenderWizard?: () => void;
  defaultDistrict?: string;
  partnerRefCode?: string;
}

export const ZambiaComplianceAssessmentModal: React.FC<ZambiaComplianceAssessmentProps> = ({
  onClose,
  onOpenTenderWizard,
  defaultDistrict = 'Kitwe, Copperbelt Province',
  partnerRefCode
}) => {
  // Company & Assessment Metadata
  const [companyName, setCompanyName] = useState<string>('Copperbelt Mining Contractor Ltd');
  const [district, setDistrict] = useState<string>(defaultDistrict);
  const [contractorTier, setContractorTier] = useState<'TIER_1_PRIMARY' | 'TIER_2_SUBCONTRACTOR' | 'SME_SUPPLIER'>('TIER_2_SUBCONTRACTOR');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'ZEMA' | 'MSD' | 'OHS' | 'LOCAL_CONTENT'>('ALL');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showFullDisclaimer, setShowFullDisclaimer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'DIAGNOSTIC' | 'RESULTS'>('DIAGNOSTIC');

  // Answers State: questionId -> score (10, 5, 0)
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    // Initial baseline with realistic distribution for a Copperbelt SME contractor
    return {
      'ZM-DIAG-01': 5,
      'ZM-DIAG-02': 10,
      'ZM-DIAG-03': 10,
      'ZM-DIAG-04': 5,
      'ZM-DIAG-05': 5,
      'ZM-DIAG-06': 10,
      'ZM-DIAG-07': 5,
      'ZM-DIAG-08': 10,
      'ZM-DIAG-09': 5,
      'ZM-DIAG-10': 10,
      'ZM-DIAG-11': 5,
      'ZM-DIAG-12': 10,
      'ZM-DIAG-13': 7,
      'ZM-DIAG-14': 5,
      'ZM-DIAG-15': 10
    };
  });

  // Track referral attribution
  const [attributionRef, setAttributionRef] = useState<string>(() => {
    if (partnerRefCode) return partnerRefCode;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get('ref');
      if (urlRef) return urlRef;
      return localStorage.getItem('melotwo_partner_ref') || 'ORGANIC-ZAMBIA';
    }
    return 'ORGANIC-ZAMBIA';
  });

  // Save lead attribution on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get('ref');
      if (urlRef) {
        setAttributionRef(urlRef);
        localStorage.setItem('melotwo_partner_ref', urlRef);
      }
    }
  }, []);

  // Compute dynamic score
  const diagnosticResult: DiagnosticAssessmentResult = useMemo(() => {
    return calculate15PointReadinessScore(answers);
  }, [answers]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = ZAMBIAN_15_POINT_DIAGNOSTIC_QUESTIONS.length;

  const handleSelectOption = (questionId: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleReset = () => {
    const empty: Record<string, number> = {};
    ZAMBIAN_15_POINT_DIAGNOSTIC_QUESTIONS.forEach(q => {
      empty[q.id] = 10;
    });
    setAnswers(empty);
    setActiveTab('DIAGNOSTIC');
  };

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (activeCategoryFilter === 'ALL') return ZAMBIAN_15_POINT_DIAGNOSTIC_QUESTIONS;
    return ZAMBIAN_15_POINT_DIAGNOSTIC_QUESTIONS.filter(q => q.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // Log lead to local storage / partner analytics
  const handleSaveAndGenerateBinder = () => {
    try {
      const partnerLeadsRaw = localStorage.getItem('melotwo_partner_leads');
      let leads = [];
      if (partnerLeadsRaw) {
        leads = JSON.parse(partnerLeadsRaw);
      }
      const newLead = {
        id: 'ZM-LEAD-' + Math.floor(1000 + Math.random() * 9000),
        companyName,
        district,
        tier: contractorTier,
        score: diagnosticResult.overallScore,
        riskTier: diagnosticResult.riskTier,
        attributionRef,
        date: new Date().toISOString(),
        binderGenerated: true
      };
      leads.unshift(newLead);
      localStorage.setItem('melotwo_partner_leads', JSON.stringify(leads));
    } catch (e) {
      console.warn('Failed to save partner lead locally:', e);
    }

    if (onOpenTenderWizard) {
      onOpenTenderWizard();
    }
  };

  // Export Audit-Grade PDF Report
  const handleGeneratePdfReport = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [15, 23, 42]; // Slate 900
      const emeraldColor = [5, 150, 105]; // Emerald 600
      const amberColor = [217, 119, 6]; // Amber 600
      const roseColor = [225, 29, 72]; // Rose 600

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 16;

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('MELOTWO MINE SAFETY & COMPLIANCE ENGINE', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text('Zambia Mining Compliance Diagnostic Summary (15-Point Due-Diligence Audit)', 14, 18);
      doc.text(`Attribution: ${attributionRef} | Date: ${new Date().toLocaleDateString('en-GB')}`, 14, 23);

      y = 35;

      // Contractor & Assessment Profile Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, pageWidth - 28, 22, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Contractor: ${companyName}`, 18, y + 6);
      doc.text(`Mining District: ${district}`, 18, y + 12);
      doc.text(`Supplier Tier: ${contractorTier.replace(/_/g, ' ')}`, 18, y + 18);

      // Scorecard on top right of box
      const scoreColor = diagnosticResult.overallScore >= 75 ? emeraldColor : diagnosticResult.overallScore >= 50 ? amberColor : roseColor;
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.setFontSize(18);
      doc.text(`${diagnosticResult.overallScore}%`, pageWidth - 42, y + 11);
      doc.setFontSize(8);
      doc.text('READINESS SCORE', pageWidth - 44, y + 16);

      y += 28;

      // Statutory Domain Breakdown Bar Chart / Table
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Statutory Domain Compliance Scores', 14, y);
      y += 6;

      const categories = [
        { label: 'ZEMA Environmental Discharge (SI 112)', score: diagnosticResult.categoryScores.ZEMA },
        { label: 'MSD Subterranean Safety Regulations (MSR Kitwe)', score: diagnosticResult.categoryScores.MSD },
        { label: 'OHS & MBOD Silicosis Surveillance', score: diagnosticResult.categoryScores.OHS },
        { label: 'Local Content & Citizen Equity Quota', score: diagnosticResult.categoryScores.LOCAL_CONTENT }
      ];

      categories.forEach(cat => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(cat.label, 14, y + 4);

        // Bar background
        doc.setFillColor(226, 232, 240);
        doc.rect(110, y, 70, 5, 'F');

        // Bar filled
        const barWidth = (cat.score / 100) * 70;
        const bColor = cat.score >= 75 ? emeraldColor : cat.score >= 50 ? amberColor : roseColor;
        doc.setFillColor(bColor[0], bColor[1], bColor[2]);
        doc.rect(110, y, barWidth, 5, 'F');

        // Percentage text
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(bColor[0], bColor[1], bColor[2]);
        doc.text(`${cat.score}%`, 185, y + 4);

        y += 8;
      });

      y += 4;

      // Critical Red Flags & Stoppage Liabilities
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(190, 18, 60);
      doc.text('Critical Regulatory Liabilities & Stoppage Triggers', 14, y);
      y += 6;

      if (diagnosticResult.liabilityRisks.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(16, 185, 129);
        doc.text('No immediate statutory stoppage orders or environmental breach triggers identified.', 14, y);
        y += 7;
      } else {
        diagnosticResult.liabilityRisks.slice(0, 3).forEach(risk => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(159, 18, 57);
          const splitText = doc.splitTextToSize(`* ${risk}`, pageWidth - 28);
          doc.text(splitText, 14, y);
          y += (splitText.length * 4.2);
        });
      }

      y += 4;

      // Missing Statutory Appointments Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Statutory Appointment Deficits (Mines Safety Department Kitwe)', 14, y);
      y += 6;

      if (diagnosticResult.missingStatutoryAppointments.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(16, 185, 129);
        doc.text('All statutory supervisory appointments verified under MSR Part IX & XII.', 14, y);
        y += 7;
      } else {
        diagnosticResult.missingStatutoryAppointments.forEach(app => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(180, 83, 9);
          doc.text(`[!] Deficit: ${app} - Required before subterranean advance authorization.`, 14, y);
          y += 5;
        });
      }

      y += 6;

      // Recommended Action & Remediation Binder
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, pageWidth - 28, 22, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('MeloTwo Automated Remediation Plan:', 18, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Compile: ${diagnosticResult.recommendedBinderType}`, 18, y + 11);
      doc.text('Includes 20 pre-formatted statutory sections, ZEMA SI 112 register, and Form MSD-08 appointment templates.', 18, y + 16);

      y += 28;

      // Mandatory Governance & Platform Disclaimers
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.rect(14, y, pageWidth - 28, 30, 'FD');

      doc.setTextColor(153, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('MANDATORY REGULATORY GOVERNANCE & IP DISCLAIMER', 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(127, 29, 29);
      const discText1 = doc.splitTextToSize(
        `1. Statutory Disclaimer: ${ZAMBIAN_COMPLIANCE_DISCLAIMERS.regulatoryNotice}`,
        pageWidth - 36
      );
      doc.text(discText1, 18, y + 10);

      const discText2 = doc.splitTextToSize(
        `2. IP Protection: ${ZAMBIAN_COMPLIANCE_DISCLAIMERS.ipProtectionNotice}`,
        pageWidth - 36
      );
      doc.text(discText2, 18, y + 19);

      // Save PDF file
      doc.save(`MeloTwo_Zambia_Compliance_Diagnostic_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate diagnostic PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header / Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3 h-3" />
                  Zambia Mining Compliance Diagnostic
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  15-Point Lead Magnet MVP
                </span>
                {attributionRef && (
                  <span className="hidden sm:inline-flex text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    Partner Ref: {attributionRef}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                Zambian Mining Compliance Readiness Assessment
              </h1>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('DIAGNOSTIC')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'DIAGNOSTIC'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Assessment ({answeredCount}/15)</span>
            </button>

            <button
              onClick={() => setActiveTab('RESULTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'RESULTS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic Report ({diagnosticResult.overallScore}%)</span>
            </button>
          </div>
        </div>

        {/* Contractor Profile Config Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 backdrop-blur-md">
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Company / Contractor Name</label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="e.g. Copperbelt Drilling Civils Ltd"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Mining District / Concession</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Kitwe, Copperbelt Province">Kitwe (Mopani / Nkana / Mindolo)</option>
              <option value="Solwezi, North-Western Province">Solwezi (First Quantum Kansanshi)</option>
              <option value="Kalumbila, North-Western Province">Kalumbila (FQM Sentinel)</option>
              <option value="Chingola, Copperbelt Province">Chingola (Konkola Copper Mines / KCM)</option>
              <option value="Mufulira, Copperbelt Province">Mufulira (Mopani Underground)</option>
              <option value="Lumwana, North-Western Province">Lumwana (Barrick Copper)</option>
              <option value="Ndola, Copperbelt Province">Ndola (Bwana Mkubwa / MBOD District)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Contractor Qualification Tier</label>
            <select
              value={contractorTier}
              onChange={(e) => setContractorTier(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="TIER_1_PRIMARY">Tier-1 Primary Contractor (Direct Mining House SLA)</option>
              <option value="TIER_2_SUBCONTRACTOR">Tier-2 Subcontractor (Specialized Services / Drilling)</option>
              <option value="SME_SUPPLIER">SME Mining Supply Chain &amp; Logistics Vendor</option>
            </select>
          </div>
        </div>

        {/* Live Score Overview Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  diagnosticResult.overallScore >= 75 ? 'bg-emerald-400 animate-pulse' : diagnosticResult.overallScore >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Weighted Compliance Readiness Score
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                  diagnosticResult.overallScore >= 75 ? 'text-emerald-400' : diagnosticResult.overallScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {diagnosticResult.overallScore}%
                </div>
                <div className="text-sm font-bold text-slate-300">
                  {diagnosticResult.riskLabel}
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Evaluates statutory alignment across the <strong className="text-white">Mines Safety Department (MSD Kitwe)</strong>, <strong className="text-white">ZEMA SI 112 Aquatic Standards</strong>, <strong className="text-white">MBOD Silicosis Surveillance</strong>, and <strong className="text-white">Zambian Local Content Quotas</strong>.
              </p>
            </div>

            {/* Pillar Breakdown Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center min-w-[110px]">
                <div className="text-[10px] font-mono text-cyan-400 font-bold flex items-center justify-center gap-1">
                  <Droplets className="w-3 h-3" />
                  ZEMA
                </div>
                <div className="text-xl font-black font-mono text-white mt-1">
                  {diagnosticResult.categoryScores.ZEMA}%
                </div>
                <div className="text-[9px] text-slate-400">Effluent / TSF</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center min-w-[110px]">
                <div className="text-[10px] font-mono text-amber-400 font-bold flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" />
                  MSD
                </div>
                <div className="text-xl font-black font-mono text-white mt-1">
                  {diagnosticResult.categoryScores.MSD}%
                </div>
                <div className="text-[9px] text-slate-400">Vent / Ground</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center min-w-[110px]">
                <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  OHS
                </div>
                <div className="text-xl font-black font-mono text-white mt-1">
                  {diagnosticResult.categoryScores.OHS}%
                </div>
                <div className="text-[9px] text-slate-400">MBOD Silicosis</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center min-w-[110px]">
                <div className="text-[10px] font-mono text-indigo-400 font-bold flex items-center justify-center gap-1">
                  <Layers className="w-3 h-3" />
                  LOCAL
                </div>
                <div className="text-xl font-black font-mono text-white mt-1">
                  {diagnosticResult.categoryScores.LOCAL_CONTENT}%
                </div>
                <div className="text-[9px] text-slate-400">Equity / Quota</div>
              </div>
            </div>
          </div>

          {/* Quick CTA banner */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="text-amber-400 font-bold">Action Recommended:</span>
              <span>{diagnosticResult.recommendedBinderType}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGeneratePdfReport}
                disabled={isGeneratingPdf}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Export Audit PDF'}</span>
              </button>

              <button
                onClick={handleSaveAndGenerateBinder}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-red-950/40 cursor-pointer"
              >
                <span>Generate Compliant Binders via MeloTwo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: THE 15-POINT DIAGNOSTIC ASSESSMENT */}
        {activeTab === 'DIAGNOSTIC' && (
          <div className="space-y-4">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
              <span className="text-xs font-mono text-slate-400 mr-2">Filter Pillars:</span>
              <button
                onClick={() => setActiveCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeCategoryFilter === 'ALL'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All 15 Questions
              </button>

              <button
                onClick={() => setActiveCategoryFilter('ZEMA')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryFilter === 'ZEMA'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>ZEMA (4 Qs)</span>
              </button>

              <button
                onClick={() => setActiveCategoryFilter('MSD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryFilter === 'MSD'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>MSD Kitwe (4 Qs)</span>
              </button>

              <button
                onClick={() => setActiveCategoryFilter('OHS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryFilter === 'OHS'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-emerald-400" />
                <span>OHS &amp; Silicosis (4 Qs)</span>
              </button>

              <button
                onClick={() => setActiveCategoryFilter('LOCAL_CONTENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryFilter === 'LOCAL_CONTENT'
                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-indigo-300'
                }`}
              >
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>Local Content (3 Qs)</span>
              </button>

              <button
                onClick={handleReset}
                className="ml-auto text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-900 cursor-pointer"
                title="Reset answers to baseline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Questions Grid */}
            <div className="space-y-4">
              {filteredQuestions.map((q, index) => {
                const currentScore = answers[q.id] !== undefined ? answers[q.id] : 0;
                return (
                  <div 
                    key={q.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
                            {q.id}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {q.categoryLabel}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            Weight: {q.weight}/10
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {q.question}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          Reference: <span className="text-slate-300">{q.statutoryReference}</span>
                        </p>
                      </div>

                      {/* Current Selection Status Badge */}
                      <div className="shrink-0">
                        {currentScore === 10 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Compliant (10 pts)
                          </span>
                        ) : currentScore === 5 || currentScore === 7 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Partial ({currentScore} pts)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            Deficient (0 pts)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Radio Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
                      {q.options.map((option, optIdx) => {
                        const isSelected = currentScore === option.score;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, option.score)}
                            className={`text-left p-3 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? option.indicator === 'COMPLIANT'
                                  ? 'bg-emerald-950/40 border-emerald-500 text-white font-medium shadow-sm'
                                  : option.indicator === 'PARTIAL'
                                  ? 'bg-amber-950/40 border-amber-500 text-white font-medium shadow-sm'
                                  : 'bg-rose-950/40 border-rose-500 text-white font-medium shadow-sm'
                                : 'bg-slate-950/60 border-slate-800/90 text-slate-300 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                                isSelected
                                  ? option.indicator === 'COMPLIANT'
                                    ? 'border-emerald-400 bg-emerald-500'
                                    : option.indicator === 'PARTIAL'
                                    ? 'border-amber-400 bg-amber-500'
                                    : 'border-rose-400 bg-rose-500'
                                  : 'border-slate-700 bg-slate-900'
                              }`}>
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                              <span>{option.label}</span>
                            </div>

                            {option.riskNote && (
                              <div className="text-[10px] text-amber-400/90 font-mono mt-2 pt-1 border-t border-slate-800">
                                <strong>Risk:</strong> {option.riskNote}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Floating Bar */}
            <div className="sticky bottom-4 z-20 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-slate-400">Current Computed Readiness:</span>
                <span className="ml-2 text-lg font-black font-mono text-emerald-400">{diagnosticResult.overallScore}%</span>
                <span className="ml-2 text-xs font-bold text-slate-300">({diagnosticResult.riskLabel})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('RESULTS')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  <span>Review Detailed Gap Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED DIAGNOSTIC GAP & APPOINTMENT REPORT */}
        {activeTab === 'RESULTS' && (
          <div className="space-y-6">
            
            {/* Top Risk Warning Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Critical Liabilities */}
              <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Identified Statutory Liabilities ({diagnosticResult.liabilityRisks.length})
                </h3>

                {diagnosticResult.liabilityRisks.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    Zero immediate statutory stoppage liabilities detected.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {diagnosticResult.liabilityRisks.map((risk, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <div>{risk}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Statutory Appointments */}
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Missing Statutory Appointments ({diagnosticResult.missingStatutoryAppointments.length})
                </h3>

                {diagnosticResult.missingStatutoryAppointments.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    All required MSD &amp; EIZ statutory appointments verified.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {diagnosticResult.missingStatutoryAppointments.map((app, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <div>{app}</div>
                      </div>
                    ))}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                      <strong>Note:</strong> Under MSR Part IX &amp; MMDA 2015, operating without appointed blasters and section overseers exposes directors to criminal fines.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operational Gaps Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Operational Non-Conformances &amp; Remediation Roadmap
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Specific action items needed to achieve Tier-1 preferred contractor prequalification.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  {diagnosticResult.operationalGaps.length} Action Items
                </span>
              </div>

              {diagnosticResult.operationalGaps.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  <h4 className="font-bold text-sm">Perfect Statutory Alignment</h4>
                  <p className="text-xs text-emerald-200/80 mt-1">All 15 assessment points meet full statutory requirements.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {diagnosticResult.operationalGaps.map((gap, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {gap.questionId}
                          </span>
                          <span className="text-xs font-bold text-white">{gap.category}</span>
                        </div>
                        <p className="text-xs text-slate-300">{gap.issue}</p>
                        <p className="text-[11px] text-amber-300/90 font-mono">
                          <strong>Remedy:</strong> {gap.remediationAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct CTA: Generate Compliant Binders */}
            <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/60 border border-red-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
              <div className="inline-flex p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-2xl mx-auto space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Generate Compliant Binders &amp; Remediation Documents via MeloTwo
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Export an audit-ready, 20-Section Zambian Mining Tender Safety File ("The Red File") incorporating ZEMA SI 112 registers, MSD statutory appointment letters (Form MSD-08 / MSD-14), and MBOD Silicosis surveillance schedules.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSaveAndGenerateBinder}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition flex items-center gap-2 shadow-xl shadow-red-950/50 cursor-pointer"
                >
                  <span>Compile 20-Section Zambian Mining Safety File</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleGeneratePdfReport}
                  disabled={isGeneratingPdf}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Audit PDF Summary</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* IP PROTECTION, GOVERNANCE & LEGAL DISCLAIMERS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Platform Governance, Intellectual Property &amp; Legal Disclaimers
            </span>
            <button
              onClick={() => setShowFullDisclaimer(!showFullDisclaimer)}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
            >
              {showFullDisclaimer ? 'Collapse Disclaimers' : 'View Full Statutory Terms'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-amber-300/90 leading-relaxed">
            <strong>Mandatory Regulatory Notice:</strong> {ZAMBIAN_COMPLIANCE_DISCLAIMERS.regulatoryNotice}
          </div>

          {showFullDisclaimer && (
            <div className="space-y-2 text-[11px] leading-relaxed text-slate-400 pt-2 border-t border-slate-800">
              <p>
                <strong className="text-slate-200">MeloTwo Platform IP:</strong> {ZAMBIAN_COMPLIANCE_DISCLAIMERS.ipProtectionNotice}
              </p>
              <p>
                <strong className="text-slate-200">Statutory Authority Benchmarking:</strong> {ZAMBIAN_COMPLIANCE_DISCLAIMERS.zambianAuthoritiesCitation}
              </p>
              <p>
                <strong className="text-slate-200">Co-Pilot Intelligence Separation:</strong> Market intelligence inputs, localized supplier benchmarks, and failure telemetry contributed by channel partners remain separate from MeloTwo core proprietary engine algorithms.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ZambiaComplianceAssessmentModal;
