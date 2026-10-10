import jsPDF from 'jspdf';
import { trackGA4Event } from './analyticsService';
import { getUtmForAnalytics } from '../utils/urlParams';

export interface OnboardingPlanOptions {
  clientName?: string;
  companyName?: string;
  email?: string;
  industry?: string;
  shaftCount?: number | string;
  tier?: string;
  notes?: string;
}

/**
 * Generates and downloads the official 30-Day Mining Onboarding & Pilot Execution Plan PDF,
 * firing the custom GA4 'download_pilot_plan' event with UTM parameters.
 */
export function downloadOnboardingPilotPlanPdf(options: OnboardingPlanOptions = {}): void {
  const company = options.companyName?.trim() || 'Tier-1 Industrial Mining Operation';
  const representative = options.clientName?.trim() || 'SHEQ Director & Engineering Lead';
  const email = options.email?.trim() || 'compliance@mine-operation.co.za';
  const tier = options.tier || 'Enterprise Group Pilot';
  const shafts = options.shaftCount || 'Multi-Shaft';

  const planId = `PILOT-${Date.now().toString().slice(-6)}`;
  const dateIssued = new Date().toLocaleDateString('en-ZA');

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ------------------------------------------------------------------------
    // HEADER (Navy & Amber Accent)
    // ------------------------------------------------------------------------
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 42, 'F');

    // Amber accent bar
    doc.setFillColor(245, 158, 11); // Amber 500
    doc.rect(0, 42, 210, 2.5, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('MELOTWO COMPLIANCE ENGINE', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text('30-DAY STATUTORY ONBOARDING & MINE PILOT EXECUTION PLAN', 14, 27);

    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Execution Dossier Ref: ${planId}`, 14, 35);
    doc.text(`Issued: ${dateIssued} | MHSA 2.9.2 & SANS 10330 Benchmark`, 110, 35);

    // ------------------------------------------------------------------------
    // CLIENT & SITE PROFILE BOX
    // ------------------------------------------------------------------------
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(14, 50, 182, 30, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('TARGET HOST OPERATION & PILOT SCOPE:', 18, 57);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Enterprise Host:  ${company}`, 18, 64);
    doc.text(`Key Contact:      ${representative} (${email})`, 18, 71);

    doc.text(`Selected Scope:   ${tier}`, 110, 64);
    doc.text(`Shafts/Sites:     ${shafts} | Zero-Latency Shaft Offline Sync`, 110, 71);

    // ------------------------------------------------------------------------
    // 4-WEEK PILOT EXECUTION TIMELINE (Table / Cards)
    // ------------------------------------------------------------------------
    let currentY = 88;

    const weeks = [
      {
        week: 'WEEK 1: BASELINE AUDIT & STATUTORY CALIBRATION',
        focus: 'Shaft Survey & Digital Master Safety Binder Blueprint',
        deliverables: [
          '• Calibrate SANS 10330 (HACCP Canteen) & SANS 10142-1 (Substation Isolators) baseline.',
          '• Audit existing paper contractor files and generate 20-Section digital index.',
          '• Configure Statutory Legal Appointments (MHSA 2.6.1, 2.9.2, OHSA 16.2) on cryptographic ledger.'
        ]
      },
      {
        week: 'WEEK 2: MOBILE SHAFT ROLLOUT & OFFLINE CAPTURE',
        focus: 'Subterranean Mobile Inspection Terminals & Cold Chain Logging',
        deliverables: [
          '• Deploy offline-first mobile inspection forms to shift supervisors at subterranean levels.',
          '• Activate hourly digital temperature tracking and automated blast heading clearance checks.',
          '• Conduct high-risk permit-to-work simulations (Confined Space, Hot Work, Lockout/Tagout).'
        ]
      },
      {
        week: 'WEEK 3: CONTRACTOR PASSPORTS & DMRE STOPPAGE DRILL',
        focus: 'Vendor Onboarding Verification & Section 54 Mock Defense',
        deliverables: [
          '• Issue digital QR contractor passports for subcontractor gate clearance and medicals.',
          '• Execute simulated DMRE Section 54 inspector audit with 1-click binder PDF generation.',
          '• Test automated deviation alerts and real-time CAPA remediation assignments.'
        ]
      },
      {
        week: 'WEEK 4: EXECUTIVE REVIEW & CROSS-BORDER ACTIVATION',
        focus: 'Regional Group Defensibility Sign-Off & Enterprise SLA',
        deliverables: [
          '• Aggregate multi-shaft compliance telemetry onto Regional Executive Dashboard.',
          '• Verify SADC cross-border mapping (RSA DMRE/MHSA vs. Zambia MSD/ZEMA regulations).',
          '• Deliver Final 30-Day Audit Defensibility Certification and transition to annual SLA.'
        ]
      }
    ];

    weeks.forEach((w) => {
      // Week Header
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.roundedRect(14, currentY, 182, 6.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text(w.week, 18, currentY + 4.5);

      currentY += 8;

      // Week Body
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, currentY, 182, 23, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Primary Focus: ${w.focus}`, 18, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);

      let itemY = currentY + 10;
      w.deliverables.forEach((item) => {
        doc.text(item, 18, itemY);
        itemY += 4.2;
      });

      currentY += 26;
    });

    // ------------------------------------------------------------------------
    // SUCCESS CRITERIA & GUARANTEE
    // ------------------------------------------------------------------------
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(14, currentY, 182, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 95, 70); // Emerald 800
    doc.text('30-DAY PILOT SUCCESS GATES (99.4% FIRST-TIME AUDIT PASS RATE):', 18, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    doc.text('1. Zero paper compliance backlogs — 100% of shift sign-offs completed digitally within 4 hours.', 18, currentY + 11);
    doc.text('2. Section 54 Stoppage Proof — Audit file compilation latency reduced from 14 business days to < 90 seconds.', 18, currentY + 16);
    doc.text('3. Full statutory defensibility with cryptographic timestamping under SANS 10330 and Mine Health and Safety Act.', 18, currentY + 21);

    currentY += 30;

    // ------------------------------------------------------------------------
    // SIGN-OFF APPROVAL BLOCK
    // ------------------------------------------------------------------------
    doc.setDrawColor(203, 213, 225);
    doc.line(14, currentY, 196, currentY);

    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized MeloTwo SHEQ Integration Lead', 18, currentY);
    doc.text('Host Enterprise Operations Representative', 120, currentY);

    doc.setDrawColor(148, 163, 184);
    doc.line(18, currentY + 10, 85, currentY + 10);
    doc.line(120, currentY + 10, 187, currentY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Tumi Seroka, Lead Technical Architect & SHEQ Engineer', 18, currentY + 14);
    doc.text(`Designated SHEQ Director, ${company}`, 120, currentY + 14);

    // Footer
    doc.text('MeloTwo Enterprise Pilot Onboarding Protocol &bull; South Africa & SADC Cross-Border Operations &bull; melotwo.com', 14, 287);
    doc.text('Page 1 of 1', 196, 287, { align: 'right' });

    const fileName = `MeloTwo_30Day_Onboarding_Pilot_Plan_${company.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(fileName);

    // ------------------------------------------------------------------------
    // TRACK GA4 CUSTOM EVENT: 'download_pilot_plan'
    // ------------------------------------------------------------------------
    const utmParams = getUtmForAnalytics();
    trackGA4Event('download_pilot_plan', {
      plan_name: '30-Day Mining Onboarding Pilot Plan',
      plan_id: planId,
      company: company,
      tier: tier,
      file_name: fileName,
      format: 'pdf',
      download_timestamp: new Date().toISOString(),
      ...utmParams
    });
  } catch (err) {
    console.error('[Onboarding Service] Failed to generate onboarding plan PDF:', err);
  }
}
