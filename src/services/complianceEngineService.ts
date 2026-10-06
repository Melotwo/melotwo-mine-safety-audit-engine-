import jsPDF from 'jspdf';
import {
  DailyComplianceSignOff,
  StatutoryLegalAppointment,
  HighRiskOperationalPermit,
  SafetyFileBinderDossier,
  OperatorCredentialProfile,
  HeavyMachineAsset,
  MachineAssignmentEvaluation,
  TradeQualificationRecord,
  WorkplaceSkillsPlanSummary,
  AnnualTrainingReportSummary,
  BbeeSkillsScorecardSummary,
  Tier1HostSite
} from '../types/complianceEngine';
import {
  StatutoryEnvironmentalLicense,
  LiabilityTransferHandoverItem,
  EsgClosureTransitionMetric,
  MineClosureSuiteOverview,
  EnterpriseTier1Host,
  DefensibilityIndexResult,
  CrossBorderRegulatoryMappingItem,
  ComplianceGapAlert
} from '../types/crossBorderCompliance';

// ============================================================================
// API CLIENT METHODS
// ============================================================================

export async function fetchDailySignOffs(): Promise<DailyComplianceSignOff[]> {
  try {
    const res = await fetch('/api/compliance/safety-files/sign-offs');
    if (res.ok) {
      const data = await res.json();
      return data.signOffs || [];
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch daily sign-offs from server:', err);
  }
  return [];
}

export async function createDailySignOff(payload: Partial<DailyComplianceSignOff>): Promise<DailyComplianceSignOff | null> {
  try {
    const res = await fetch('/api/compliance/safety-files/sign-offs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.signOff;
    }
  } catch (err) {
    console.error('[Compliance Service] Failed to post daily sign-off:', err);
  }
  return null;
}

export async function fetchStatutoryAppointments(): Promise<StatutoryLegalAppointment[]> {
  try {
    const res = await fetch('/api/compliance/safety-files/appointments');
    if (res.ok) {
      const data = await res.json();
      return data.appointments || [];
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch appointments:', err);
  }
  return [];
}

export async function createStatutoryAppointment(payload: Partial<StatutoryLegalAppointment>): Promise<StatutoryLegalAppointment | null> {
  try {
    const res = await fetch('/api/compliance/safety-files/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.appointment;
    }
  } catch (err) {
    console.error('[Compliance Service] Failed to post appointment:', err);
  }
  return null;
}

export async function fetchHighRiskPermits(): Promise<HighRiskOperationalPermit[]> {
  try {
    const res = await fetch('/api/compliance/safety-files/permits');
    if (res.ok) {
      const data = await res.json();
      return data.permits || [];
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch permits:', err);
  }
  return [];
}

export async function createHighRiskPermit(payload: Partial<HighRiskOperationalPermit>): Promise<HighRiskOperationalPermit | null> {
  try {
    const res = await fetch('/api/compliance/safety-files/permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.permit;
    }
  } catch (err) {
    console.error('[Compliance Service] Failed to issue high-risk permit:', err);
  }
  return null;
}

export async function fetchSafetyFileBinder(hostSite: Tier1HostSite = 'ANGLO_AMERICAN'): Promise<SafetyFileBinderDossier | null> {
  try {
    const res = await fetch(`/api/compliance/safety-files/binder/${hostSite}`);
    if (res.ok) {
      const data = await res.json();
      return data.binderDossier;
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch safety file binder:', err);
  }
  return null;
}

export async function fetchOperators(): Promise<OperatorCredentialProfile[]> {
  try {
    const res = await fetch('/api/compliance/operators');
    if (res.ok) {
      const data = await res.json();
      return data.operators || [];
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch operators:', err);
  }
  return [];
}

export async function fetchMachines(): Promise<HeavyMachineAsset[]> {
  try {
    const res = await fetch('/api/compliance/machines');
    if (res.ok) {
      const data = await res.json();
      return data.machines || [];
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch machines:', err);
  }
  return [];
}

export async function evaluateMachineAssignment(
  operatorId: string, 
  machineAssetId: string
): Promise<MachineAssignmentEvaluation | null> {
  try {
    const res = await fetch('/api/compliance/machine-assignment/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId, machineAssetId })
    });
    if (res.ok) {
      const data = await res.json();
      return data.evaluation;
    }
  } catch (err) {
    console.error('[Compliance Service] Machine assignment evaluation error:', err);
  }
  return null;
}

export async function fetchTradeCandidates(): Promise<TradeQualificationRecord[]> {
  try {
    const res = await fetch('/api/compliance/seta-qcto/candidates');
    if (res.ok) {
      const data = await res.json();
      return data.candidates || [];
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch trade candidates:', err);
  }
  return [];
}

export async function verifyTradeCandidate(
  candidateId: string, 
  redSealCertificateNumber: string, 
  nambSerial?: string
): Promise<TradeQualificationRecord | null> {
  try {
    const res = await fetch('/api/compliance/seta-qcto/verify-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, redSealCertificateNumber, nambSerial })
    });
    if (res.ok) {
      const data = await res.json();
      return data.candidate;
    }
  } catch (err) {
    console.error('[Compliance Service] Candidate verification error:', err);
  }
  return null;
}

export async function fetchSkillsDevelopmentReports(): Promise<{
  wspSummary: WorkplaceSkillsPlanSummary;
  atrSummary: AnnualTrainingReportSummary;
  bbeeScorecard: BbeeSkillsScorecardSummary;
} | null> {
  try {
    const res = await fetch('/api/compliance/skills-development/reports');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch skills reports:', err);
  }
  return null;
}

// ============================================================================
// PDF EXPORT UTILITY FOR AUDIT-READY SAFETY FILE BINDER
// ============================================================================

export function exportSafetyFileBinderPdf(binder: SafetyFileBinderDossier): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MELOTWO STATUTORY SAFETY FILE DOSSIER', 14, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Host Site Pre-Qualification: ${binder.hostSiteDisplayName}`, 14, 24);
  doc.text(`Contractor: ${binder.contractorName} | CIPC: ${binder.contractorCipcNumber}`, 14, 30);
  doc.text(`Audit Readiness: ${binder.auditReadinessState} (${binder.overallAuditScorePct}%) | Binder ID: ${binder.binderId}`, 14, 36);

  // Content Area
  let y = 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('10-SECTION STATUTORY RETURNABLE SCHEDULE:', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  binder.sections.forEach((sec, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(sec.status === 'COMPLIANT' ? 240 : 254, sec.status === 'COMPLIANT' ? 253 : 242, sec.status === 'COMPLIANT' ? 244 : 242);
    doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
    doc.setDrawColor(sec.status === 'COMPLIANT' ? 16 : 239, sec.status === 'COMPLIANT' ? 185 : 68, sec.status === 'COMPLIANT' ? 129 : 68);
    doc.roundedRect(14, y, 182, 18, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${sec.sectionCode}: ${sec.title}`, 18, y + 5);

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Statutory Mandate: ${sec.statutoryReference}`, 18, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(sec.status === 'COMPLIANT' ? 5 : 185, sec.status === 'COMPLIANT' ? 150 : 28, sec.status === 'COMPLIANT' ? 105 : 28);
    doc.text(`Status: ${sec.status} | Verified Attachments: ${sec.documentsAttached} items | Audited: ${sec.lastAuditDate}`, 18, y + 15);

    y += 22;
  });

  // Footer & Cryptographic Validation Block
  if (y > 255) {
    doc.addPage();
    y = 20;
  }

  y += 5;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DMRE & SANS COMPLIANCE CERTIFICATION LEDGER HASH:', 14, y);
  y += 4;
  doc.setFont('courier', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(binder.safetyOfficerApprovalHash, 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Certified compiled on ${new Date().toLocaleDateString('en-ZA')} at ${new Date().toLocaleTimeString('en-ZA')}. Valid for 90 days across SADC operations.`, 14, y);

  doc.save(`melotwo-safety-file-${binder.hostSite.toLowerCase()}-audit-ready.pdf`);
}

// ============================================================================
// CROSS-BORDER & MINE LIFE-CYCLE COMPLIANCE SANDBOX METHODS
// ============================================================================

export async function fetchMineClosureOverview(): Promise<MineClosureSuiteOverview | null> {
  try {
    const res = await fetch('/api/compliance/mine-closure/overview');
    if (res.ok) {
      const data = await res.json();
      return data.overview || null;
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch mine closure overview:', err);
  }
  return null;
}

export async function createEnvironmentalLicense(payload: Partial<StatutoryEnvironmentalLicense>): Promise<StatutoryEnvironmentalLicense | null> {
  try {
    const res = await fetch('/api/compliance/mine-closure/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.license || null;
    }
  } catch (err) {
    console.error('[Compliance Service] Failed to add environmental license:', err);
  }
  return null;
}

export async function updateHandoverItemSignOff(
  itemId: string,
  payload: { signOffStatus?: string; checkIndex?: number; completed?: boolean }
): Promise<LiabilityTransferHandoverItem | null> {
  try {
    const res = await fetch(`/api/compliance/mine-closure/handover-items/${itemId}/sign-off`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.item || null;
    }
  } catch (err) {
    console.error('[Compliance Service] Failed to update handover item sign-off:', err);
  }
  return null;
}

export async function fetchCrossBorderMapping(): Promise<CrossBorderRegulatoryMappingItem[]> {
  try {
    const res = await fetch('/api/compliance/cross-border/mapping');
    if (res.ok) {
      const data = await res.json();
      return data.mappings || [];
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch cross-border mappings:', err);
  }
  return [];
}

export async function fetchDefensibilityIndex(host: EnterpriseTier1Host = 'ANGLO_AMERICAN'): Promise<DefensibilityIndexResult | null> {
  try {
    const res = await fetch(`/api/compliance/cross-border/defensibility-index?host=${host}`);
    if (res.ok) {
      const data = await res.json();
      return data.result || null;
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch defensibility index:', err);
  }
  return null;
}

export async function simulateCustomDefensibility(
  hostEnterprise: EnterpriseTier1Host,
  customOverrides?: Record<string, any>
): Promise<DefensibilityIndexResult | null> {
  try {
    const res = await fetch('/api/compliance/cross-border/defensibility-index/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostEnterprise, customOverrides })
    });
    if (res.ok) {
      const data = await res.json();
      return data.result || null;
    }
  } catch (err) {
    console.error('[Compliance Service] Failed to simulate defensibility index:', err);
  }
  return null;
}

export async function fetchComplianceGapAlerts(): Promise<ComplianceGapAlert[]> {
  try {
    const res = await fetch('/api/compliance/cross-border/gap-alerts');
    if (res.ok) {
      const data = await res.json();
      return data.alerts || [];
    }
  } catch (err) {
    console.warn('[Compliance Service] Failed to fetch compliance gap alerts:', err);
  }
  return [];
}

export async function resolveComplianceGapAlert(alertId: string): Promise<ComplianceGapAlert | null> {
  try {
    const res = await fetch(`/api/compliance/cross-border/gap-alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return data.alert || null;
    }
  } catch (err) {
    console.error('[Compliance Service] Failed to resolve compliance gap alert:', err);
  }
  return null;
}

export function exportDefensibilityAuditReportPdf(result: DefensibilityIndexResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MELOTWO SADC COMPLIANCE DEFICIENCY & AUDIT REPORT', 14, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tier-1 Host Site: ${result.hostEnterpriseName}`, 14, 23);
  doc.text(`Contractor: ${result.contractorName} | Rating: ${result.defensibilityRating}`, 14, 29);
  doc.text(`Defensibility Score: ${result.overallDefensibilityScorePct}% | Verdict: ${result.verdict}`, 14, 35);

  let y = 50;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('AUDIT CATEGORY BREAKDOWN & DEFICIENCY MATRIX:', 14, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  result.categories.forEach((cat) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const isPassed = cat.mandatoryRequirementsMet;
    doc.setFillColor(isPassed ? 240 : 254, isPassed ? 253 : 242, isPassed ? 244 : 242);
    doc.roundedRect(14, y, 182, 19, 2, 2, 'F');
    doc.setDrawColor(isPassed ? 16 : 239, isPassed ? 185 : 68, isPassed ? 129 : 68);
    doc.roundedRect(14, y, 182, 19, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${cat.categoryTitle} (${cat.weightPercentage}% weight)`, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(isPassed ? 5 : 185, isPassed ? 150 : 28, isPassed ? 105 : 28);
    doc.text(`Score: ${cat.scoreAchievedPct}% (${cat.pointsAwarded}/${cat.maxPoints} pts) | Findings: ${cat.findingsCount}`, 18, y + 10);

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    const gapStr = cat.criticalGaps.length > 0 ? `Critical Note: ${cat.criticalGaps[0]}` : 'Mandatory host standards verified compliant';
    doc.text(gapStr.substring(0, 95), 18, y + 15);

    y += 23;
  });

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE DEFICIENCY REMEDIATION ADVICE:', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const adviceLines = doc.splitTextToSize(result.summaryExecutiveAdvice, 182);
  doc.text(adviceLines, 14, y);

  y += (adviceLines.length * 4) + 6;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CRYPTOGRAPHIC AUDIT SIMULATION HASH:', 14, y);
  y += 4;
  doc.setFont('courier', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(result.auditSimulationHash, 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-ZA')} for ${result.hostEnterpriseName} pre-qualification submission.`, 14, y);

  doc.save(`melotwo-defensibility-${result.hostEnterprise.toLowerCase()}-audit.pdf`);
}
