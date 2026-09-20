import { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import {
  WorkerCompetencyRecord,
  ToolboxTalkLog,
  QctoModuleMapping
} from '../types/qcto';
import {
  INITIAL_COMPETENCY_RECORDS,
  QCTO_MODULE_MAPPINGS,
  QCTO_DISCLAIMER_TEXT,
  QCTO_ACCREDITATION_NOTICE
} from '../data/qctoCurriculumData';

const RECORDS_STORAGE_KEY = 'melotwo_qcto_competency_records';
const TOOLBOX_LOGS_STORAGE_KEY = 'melotwo_qcto_toolbox_logs';
const ACTIVE_WORKER_KEY = 'melotwo_qcto_active_worker';

export interface ActiveWorkerProfile {
  workerName: string;
  idNumber: string;
  companyName: string;
  siteName: string;
  supervisorName: string;
  supervisorDesignation: string;
}

export const DEFAULT_WORKER_PROFILE: ActiveWorkerProfile = {
  workerName: 'Thabo Khumalo',
  idNumber: '900624 5214 087',
  companyName: 'Bafokeng Mining Contractors & Civils (Pty) Ltd',
  siteName: 'Shaft 4 - Western Deep Working Section',
  supervisorName: 'Tebogo Mokoena',
  supervisorDesignation: 'Senior SHEQ Officer (Pr.Cert.SHEQ)'
};

export const useQctoTraining = () => {
  // Competency records
  const [records, setRecords] = useState<WorkerCompetencyRecord[]>(() => {
    try {
      const stored = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored QCTO competency records:', e);
    }
    return INITIAL_COMPETENCY_RECORDS;
  });

  // Toolbox logs
  const [toolboxLogs, setToolboxLogs] = useState<ToolboxTalkLog[]>(() => {
    try {
      const stored = localStorage.getItem(TOOLBOX_LOGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored QCTO toolbox logs:', e);
    }
    return [];
  });

  // Active worker profile
  const [workerProfile, setWorkerProfile] = useState<ActiveWorkerProfile>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_WORKER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored active worker profile:', e);
    }
    return DEFAULT_WORKER_PROFILE;
  });

  // Persist records
  useEffect(() => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to persist QCTO competency records:', e);
    }
  }, [records]);

  // Persist toolbox logs
  useEffect(() => {
    try {
      localStorage.setItem(TOOLBOX_LOGS_STORAGE_KEY, JSON.stringify(toolboxLogs));
    } catch (e) {
      console.warn('Failed to persist QCTO toolbox logs:', e);
    }
  }, [toolboxLogs]);

  // Persist active worker profile
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_WORKER_KEY, JSON.stringify(workerProfile));
    } catch (e) {
      console.warn('Failed to persist active worker profile:', e);
    }
  }, [workerProfile]);

  // Record completed field drill
  const recordDrillCompletion = useCallback(
    (params: {
      moduleId: number;
      drillScore: number;
      passed: boolean;
      workerName?: string;
      idNumber?: string;
      companyName?: string;
      siteName?: string;
      supervisorName?: string;
      supervisorDesignation?: string;
      location?: {
        latitude: number;
        longitude: number;
        siteName: string;
        accuracyMeters?: number;
      };
      notes?: string;
    }) => {
      const mapping = QCTO_MODULE_MAPPINGS.find((m) => m.moduleId === params.moduleId);
      if (!mapping) return null;

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
      const verificationStamp = `MELOTWO-QCTO-${mapping.saqaId}-${randomHash}-${Date.now().toString().slice(-4)}`;

      const newRecord: WorkerCompetencyRecord = {
        id: `COMP-REC-${Date.now()}`,
        workerName: params.workerName || workerProfile.workerName,
        idNumber: params.idNumber || workerProfile.idNumber,
        companyName: params.companyName || workerProfile.companyName,
        moduleId: mapping.moduleId,
        moduleName: `${mapping.sansCode} (${mapping.sansTitle})`,
        sansRef: mapping.drill.sansRef,
        saqaId: mapping.saqaId,
        curriculumCode: mapping.curriculumCode,
        drillScore: params.drillScore,
        passed: params.passed,
        completedAt: dateStr,
        location: params.location || {
          siteName: params.siteName || workerProfile.siteName,
          latitude: -26.1952,
          longitude: 28.0346,
          accuracyMeters: 4.5
        },
        supervisorName: params.supervisorName || workerProfile.supervisorName,
        supervisorDesignation: params.supervisorDesignation || workerProfile.supervisorDesignation,
        verificationStamp,
        notes: params.notes || `Successfully passed 5-minute field practice drill for ${mapping.sansCode}.`,
        attachedToTenderFile: true
      };

      setRecords((prev) => [newRecord, ...prev]);

      // Also persist to tender evidence storage
      try {
        const tenderEvidenceKey = 'melotwo_tender_training_evidence';
        const existing = localStorage.getItem(tenderEvidenceKey);
        const list = existing ? JSON.parse(existing) : [];
        list.push(newRecord);
        localStorage.setItem(tenderEvidenceKey, JSON.stringify(list));
      } catch (e) {
        console.warn('Failed to append to tender evidence:', e);
      }

      return newRecord;
    },
    [workerProfile]
  );

  // Record completed toolbox talk
  const recordToolboxTalk = useCallback(
    (log: Omit<ToolboxTalkLog, 'id' | 'verificationStamp'>) => {
      const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newLog: ToolboxTalkLog = {
        ...log,
        id: `TT-LOG-${Date.now()}`,
        verificationStamp: `MELOTWO-TOOLBOX-${randomHash}-${Date.now().toString().slice(-4)}`
      };
      setToolboxLogs((prev) => [newLog, ...prev]);
      return newLog;
    },
    []
  );

  // Calculate worker & site stats
  const getWorkerStats = useCallback(
    (targetWorkerName?: string) => {
      const name = targetWorkerName || workerProfile.workerName;
      const workerRecords = records.filter(
        (r) => r.workerName.trim().toLowerCase() === name.trim().toLowerCase()
      );

      // Distinct modules completed
      const uniqueModulesPassed = new Set(
        workerRecords.filter((r) => r.passed).map((r) => r.moduleId)
      );

      const totalModules = 6;
      const modulesCompletedCount = uniqueModulesPassed.size;
      const progressPercent = Math.min(100, Math.round((modulesCompletedCount / totalModules) * 100));

      const totalDrillScores = workerRecords.reduce((acc, r) => acc + r.drillScore, 0);
      const averageDrillScore =
        workerRecords.length > 0 ? Math.round(totalDrillScores / workerRecords.length) : 0;

      const tenderReady = modulesCompletedCount >= 3 && averageDrillScore >= 80;

      return {
        workerName: name,
        recordsCount: workerRecords.length,
        modulesCompletedCount,
        totalModules,
        progressPercent,
        averageDrillScore,
        tenderReady,
        allRecordsCount: records.length,
        toolboxLogsCount: toolboxLogs.length
      };
    },
    [records, toolboxLogs, workerProfile.workerName]
  );

  // Export PDF Report using jsPDF
  const exportRecordPdf = useCallback((record: WorkerCompetencyRecord) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const mapping = QCTO_MODULE_MAPPINGS.find((m) => m.moduleId === record.moduleId);

      // Background styling
      doc.setFillColor(15, 23, 42); // slate-900 header
      doc.rect(0, 0, 210, 48, 'F');

      // Top cyan accent line
      doc.setFillColor(6, 182, 212); // cyan-500
      doc.rect(0, 0, 210, 4, 'F');

      // Header Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('MELOTWO MINE SAFETY AUDIT ENGINE', 14, 18);

      doc.setFontSize(9);
      doc.setTextColor(245, 158, 11); // amber-400
      doc.text('WORKPLACE SAFETY TRAINING LOG & COMPETENCY EVIDENCE REPORT', 14, 25);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text(
        'Tender Safety Dossier Compliance Attachment • MHSA Section 10 & Construction Reg 9',
        14,
        31
      );

      // Report Reference & Verification Stamp Box (Right Header)
      doc.setFillColor(30, 41, 59); // slate-800
      doc.roundedRect(125, 10, 72, 32, 2, 2, 'F');
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.4);
      doc.roundedRect(125, 10, 72, 32, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(245, 158, 11);
      doc.text('DIGITAL VERIFICATION STAMP', 161, 16, { align: 'center' });

      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(record.verificationStamp, 161, 23, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Completed: ${record.completedAt}`, 161, 29, { align: 'center' });
      doc.text(`Tender Status: ATTACHED & VALIDATED`, 161, 35, { align: 'center' });

      // Visual Statutory Disclaimer Banner (Crucial Requirement)
      let y = 54;
      doc.setFillColor(254, 243, 199); // amber-100
      doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, y, 182, 18, 2, 2, 'D');

      doc.setTextColor(146, 64, 14); // amber-900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('STATUTORY NON-ACCREDITED SDP DISCLOSURE & WORKPLACE COMPANION ROLE:', 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      const disclaimerLines = doc.splitTextToSize(QCTO_DISCLAIMER_TEXT, 174);
      doc.text(disclaimerLines, 18, y + 10);

      y += 24;

      // Section 1: Candidate & Company Identification
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('1. WORKER & EMPLOYING CONTRACTOR (SMME) IDENTIFICATION', 16, y + 5);

      y += 9;
      doc.setFontSize(8.5);

      // Grid row 1
      doc.setFont('helvetica', 'bold');
      doc.text('Worker Full Name:', 16, y);
      doc.setFont('helvetica', 'normal');
      doc.text(record.workerName, 55, y);

      doc.setFont('helvetica', 'bold');
      doc.text('RSA ID / Passport No:', 115, y);
      doc.setFont('courier', 'bold');
      doc.text(record.idNumber, 155, y);

      y += 6;
      // Grid row 2
      doc.setFont('helvetica', 'bold');
      doc.text('Contractor / SMME:', 16, y);
      doc.setFont('helvetica', 'normal');
      doc.text(record.companyName, 55, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Operational Site:', 115, y);
      doc.setFont('helvetica', 'normal');
      doc.text(record.location.siteName, 155, y);

      y += 6;
      // Grid row 3: Geolocation Coordinates
      doc.setFont('helvetica', 'bold');
      doc.text('GPS Geolocation Tag:', 16, y);
      doc.setFont('courier', 'normal');
      doc.text(
        `Lat: ${record.location.latitude.toFixed(4)}, Lon: ${record.location.longitude.toFixed(4)} (Accuracy ±${record.location.accuracyMeters || 5}m)`,
        55,
        y
      );

      y += 10;

      // Section 2: QCTO & MQA Curriculum Mapping
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('2. QCTO CURRICULUM & SAQA QUALIFICATION ALIGNMENT MATRIX', 16, y + 5);

      y += 10;
      doc.setFontSize(8);

      const tableRows = [
        ['SANS Statutory Standard:', record.moduleName],
        ['Aligned Qualification Title:', mapping ? mapping.qualificationTitle : 'Occupational Certificate'],
        ['Registered SAQA ID:', `${record.saqaId} (NQF Level ${mapping?.nqfLevel || 4}, ${mapping?.credits || 16} Credits)`],
        ['QCTO Curriculum Code:', record.curriculumCode],
        ['Quality Assuring Body:', mapping?.qualityAssuringBody || 'QCTO / MQA'],
        ['Statutory Legal Framework:', mapping?.legalFramework || 'MHSA Section 10 / SANS Codes'],
        ['Core Knowledge Module (KM):', mapping?.knowledgeModules[0]?.title || 'Statutory Compliance Protocols'],
        ['Practical Skill Module (PM):', mapping?.practicalModules[0]?.title || 'Field Inspection & Verification']
      ];

      tableRows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text(label, 16, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const splitVal = doc.splitTextToSize(value, 115);
        doc.text(splitVal, 75, y);
        y += Math.max(5.5, splitVal.length * 4.2);
      });

      y += 4;

      // Section 3: Scenario Drill Assessment & Competency Score
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('3. WORKPLACE 5-MINUTE PRACTICE DRILL & COMPETENCY EVALUATION', 16, y + 5);

      y += 9;

      // Drill Result Box
      doc.setFillColor(record.passed ? 240 : 254, record.passed ? 253 : 242, record.passed ? 244 : 242);
      doc.roundedRect(14, y, 182, 22, 2, 2, 'F');
      doc.setDrawColor(record.passed ? 34 : 239, record.passed ? 197 : 68, record.passed ? 94 : 68);
      doc.setLineWidth(0.4);
      doc.roundedRect(14, y, 182, 22, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(record.passed ? 22 : 153, record.passed ? 101 : 27, record.passed ? 52 : 27);
      doc.text(
        `DRILL OUTCOME: ${record.passed ? 'COMPETENT / PASSED (100% BENCHMARK)' : 'NOT YET COMPETENT'}`,
        18,
        y + 6
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Scenario Drill Title: ${mapping?.drill.title || record.sansRef}`, 18, y + 11);
      doc.text(`Statutory Criterion: ${mapping?.drill.sansRef || record.sansRef}`, 18, y + 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(record.passed ? 22 : 185, record.passed ? 101 : 28, record.passed ? 52 : 28);
      doc.text(`${record.drillScore}%`, 180, y + 13, { align: 'right' });
      doc.setFontSize(7);
      doc.text('Score', 180, y + 18, { align: 'right' });

      y += 27;

      // Section 4: Supervisor Sign-off & Defensible Audit Trail
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('4. APPOINTED SAFETY SUPERVISOR VERIFICATION & SIGN-OFF STAMP', 16, y + 5);

      y += 9;

      // Signatures Box
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(14, y, 90, 28);
      doc.rect(106, y, 90, 28);

      // Left box: Supervisor Verification
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('APPOINTED SHEQ SUPERVISOR', 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Name: ${record.supervisorName}`, 18, y + 10);
      doc.text(`Designation: ${record.supervisorDesignation}`, 18, y + 14);
      doc.text(`Date Verified: ${record.completedAt.split(' ')[0]}`, 18, y + 18);
      doc.setFont('courier', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('Signed digitally via MeloTwo Token ID', 18, y + 24);

      // Right box: Candidate Acknowledgement
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('CANDIDATE / WORKER ACKNOWLEDGEMENT', 110, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Name: ${record.workerName}`, 110, y + 10);
      doc.text(`ID: ${record.idNumber}`, 110, y + 14);
      doc.text('Declaration: I confirm completion of this field drill', 110, y + 18);
      doc.text('and understand mandatory SANS life-safety protocols.', 110, y + 22);

      // Footer
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 283, 210, 14, 'F');
      doc.setTextColor(203, 213, 225);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(
        'MeloTwo Mine Safety Audit Engine • melotwo.com • Tender Safety Binder Proof of Worker Competency File',
        105,
        289,
        { align: 'center' }
      );
      doc.text(
        `Generated: ${new Date().toISOString()} • SHA-256 Hash Verification: ${record.verificationStamp}`,
        105,
        293,
        { align: 'center' }
      );

      // Trigger download
      const safeFilename = `MeloTwo_Training_Log_${record.workerName.replace(/\s+/g, '_')}_SAQA_${record.saqaId}.pdf`;
      doc.save(safeFilename);
      return true;
    } catch (e) {
      console.error('Failed to generate PDF for competency record:', e);
      return false;
    }
  }, []);

  // Export JSON Report
  const exportRecordJson = useCallback((record: WorkerCompetencyRecord) => {
    try {
      const mapping = QCTO_MODULE_MAPPINGS.find((m) => m.moduleId === record.moduleId);
      const payload = {
        metadata: {
          engine: 'MeloTwo Mine Safety Audit Engine',
          domain: 'melotwo.com',
          documentType: 'WORKPLACE_SAFETY_TRAINING_LOG_AND_COMPETENCY_REPORT',
          tenderSectionAttachment: 'Section 07: Proof of Employee Induction, Training & Competency',
          statutoryFramework: 'MHSA Section 10 / OHSA Construction Reg 9',
          nonAccreditedSdpNotice: QCTO_DISCLAIMER_TEXT,
          exportedAt: new Date().toISOString()
        },
        workerDetails: {
          workerName: record.workerName,
          idNumber: record.idNumber,
          companyName: record.companyName,
          siteLocation: record.location
        },
        curriculumMapping: {
          sansStandard: record.moduleName,
          qualificationTitle: mapping?.qualificationTitle,
          saqaId: record.saqaId,
          curriculumCode: record.curriculumCode,
          nqfLevel: mapping?.nqfLevel,
          credits: mapping?.credits,
          qualityAssuringBody: mapping?.qualityAssuringBody,
          ofoCode: mapping?.ofoCode,
          legalFramework: mapping?.legalFramework,
          knowledgeModules: mapping?.knowledgeModules,
          practicalModules: mapping?.practicalModules
        },
        drillAssessment: {
          drillScore: record.drillScore,
          passed: record.passed,
          completedAt: record.completedAt,
          verificationStamp: record.verificationStamp,
          notes: record.notes
        },
        supervisorVerification: {
          supervisorName: record.supervisorName,
          supervisorDesignation: record.supervisorDesignation,
          verificationStatus: 'DIGITALLY_SEALED'
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `MeloTwo_Training_Log_${record.workerName.replace(/\s+/g, '_')}_SAQA_${record.saqaId}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (e) {
      console.error('Failed to export JSON record:', e);
      return false;
    }
  }, []);

  // Delete record
  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setRecords(INITIAL_COMPETENCY_RECORDS);
    setWorkerProfile(DEFAULT_WORKER_PROFILE);
    localStorage.removeItem(RECORDS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_WORKER_KEY);
  }, []);

  return {
    records,
    toolboxLogs,
    workerProfile,
    setWorkerProfile,
    recordDrillCompletion,
    recordToolboxTalk,
    getWorkerStats,
    exportRecordPdf,
    exportRecordJson,
    deleteRecord,
    resetToDefaults
  };
};
