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
