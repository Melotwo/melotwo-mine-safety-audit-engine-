import React, { useState } from 'react';
import {
  X,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Download,
  Plus,
  Trash2,
  Check,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import { QctoModuleMapping, ToolboxTalkTemplate } from '../types/qcto';
import { ActiveWorkerProfile } from '../hooks/useQctoTraining';

interface QctoToolboxTalkModalProps {
  mapping: QctoModuleMapping;
  workerProfile: ActiveWorkerProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogToolboxTalk: (params: {
    moduleId: number;
    topic: string;
    statutoryReference: string;
    companyName: string;
    siteName: string;
    date: string;
    durationMinutes: number;
    supervisorName: string;
    supervisorDesignation: string;
    attendees: Array<{ workerName: string; idNumber: string; acknowledged: boolean }>;
  }) => void;
}

export const QctoToolboxTalkModal: React.FC<QctoToolboxTalkModalProps> = ({
  mapping,
  workerProfile,
  isOpen,
  onClose,
  onLogToolboxTalk
}) => {
  const tt = mapping.toolboxTalk;

  const [companyName, setCompanyName] = useState(workerProfile.companyName);
  const [siteName, setSiteName] = useState(workerProfile.siteName);
  const [supervisorName, setSupervisorName] = useState(workerProfile.supervisorName);
  const [supervisorDesignation, setSupervisorDesignation] = useState(workerProfile.supervisorDesignation);

  const [attendees, setAttendees] = useState<
    Array<{ id: string; workerName: string; idNumber: string; acknowledged: boolean }>
  >([
    {
      id: 'att-1',
      workerName: workerProfile.workerName,
      idNumber: workerProfile.idNumber,
      acknowledged: true
    },
    {
      id: 'att-2',
      workerName: 'Kagiso Molefe',
      idNumber: '951103 5689 081',
      acknowledged: true
    },
    {
      id: 'att-3',
      workerName: 'Bongani Sithole',
      idNumber: '870214 5432 089',
      acknowledged: true
    }
  ]);

  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeId, setNewAttendeeId] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  if (!isOpen) return null;

  const handleAddAttendee = () => {
    if (!newAttendeeName.trim()) return;
    setAttendees((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}`,
        workerName: newAttendeeName.trim(),
        idNumber: newAttendeeId.trim() || 'Pending ID Entry',
        acknowledged: true
      }
    ]);
    setNewAttendeeName('');
    setNewAttendeeId('');
  };

  const handleRemoveAttendee = (id: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAcknowledge = (id: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

  const handleCommitLog = () => {
    const todayStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    onLogToolboxTalk({
      moduleId: mapping.moduleId,
      topic: tt.topic,
      statutoryReference: tt.statutoryReference,
      companyName,
      siteName,
      date: todayStr,
      durationMinutes: 7,
      supervisorName,
      supervisorDesignation,
      attendees: attendees.map((a) => ({
        workerName: a.workerName,
        idNumber: a.idNumber,
        acknowledged: a.acknowledged
      }))
    });
    setIsLogged(true);
  };

  // Export Toolbox Talk PDF
  const handleExportToolboxPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Dark header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, 'F');
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, 210, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('MELOTWO PRE-SHIFT TOOLBOX TALK REGISTER', 14, 16);

      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text(`STATUTORY TOPIC: ${tt.topic.toUpperCase()}`, 14, 23);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `Statutory Reference: ${tt.statutoryReference} • Skill Code: ${tt.mqaSkillCode}`,
        14,
        29
      );
      doc.text(`Tender Dossier Mandatory Shift Log • OHSA 85 of 1993 / MHSA Section 10`, 14, 34);

      let y = 48;

      // Overview
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('TOOLBOX TALK OPERATIONAL BRIEFING OBJECTIVE:', 18, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(71, 85, 105);
      const splitOverview = doc.splitTextToSize(tt.overview, 174);
      doc.text(splitOverview, 18, y + 10);

      y += 24;

      // Key Discussion Points
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1. KEY SHIFT DISCUSSION POINTS:', 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      tt.keyDiscussionPoints.forEach((pt, i) => {
        const splitPt = doc.splitTextToSize(`• ${pt}`, 180);
        doc.text(splitPt, 16, y);
        y += splitPt.length * 4.2;
      });

      y += 3;

      // Golden Safety Rules
      doc.setFillColor(254, 242, 242); // red-50
      doc.roundedRect(14, y, 182, 22, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28); // red-700
      doc.text('2. CRITICAL LIFE-SAVING GOLDEN RULES (ZERO COMPROMISE):', 18, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(153, 27, 27);
      tt.criticalSafetyRules.forEach((rule, i) => {
        doc.text(rule, 18, y + 10 + i * 4);
      });

      y += 27;

      // Attendees Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`3. SHIFT ATTENDANCE & ACKNOWLEDGEMENT REGISTER (${attendees.length} Workers)`, 14, y);
      y += 5;

      // Table Header
      doc.setFillColor(226, 232, 240);
      doc.rect(14, y, 182, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('No.', 16, y + 4.2);
      doc.text('Worker Full Name', 26, y + 4.2);
      doc.text('RSA ID / Passport Number', 85, y + 4.2);
      doc.text('Acknowledged & Understood', 145, y + 4.2);

      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      attendees.forEach((att, idx) => {
        doc.text(`${idx + 1}.`, 16, y);
        doc.text(att.workerName, 26, y);
        doc.text(att.idNumber, 85, y);
        doc.text(att.acknowledged ? 'YES - SIGNED DIGITALLY' : 'NO', 145, y);
        y += 5;
      });

      y += 6;

      // Supervisor Sign-off
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, y, 182, 24, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('APPOINTED SUPERVISOR STATUTORY VERIFICATION & DECLARATION', 18, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Supervisor Name: ${supervisorName}`, 18, y + 10);
      doc.text(`Designation: ${supervisorDesignation}`, 18, y + 14);
      doc.text(`Operational Site: ${siteName} • Contractor: ${companyName}`, 18, y + 18);
      doc.text(`Session Timestamp: ${new Date().toISOString()}`, 110, y + 10);
      doc.setFont('courier', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('Verification: MELOTWO-TOOLBOX-STAMPED-LEGAL', 110, y + 16);

      // Save
      doc.save(`MeloTwo_Toolbox_Talk_${mapping.sansCode.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (e) {
      console.error('Failed to export toolbox PDF:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full my-6 p-5 sm:p-7 text-white space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -left-20 -top-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>Pre-Shift Digital Toolbox Talk</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-900/30 text-blue-300 border border-blue-700/40 text-xs font-bold">
                {mapping.sansCode}
              </span>
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{tt.duration}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tt.topic}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Target Trade: <strong className="text-slate-200">{tt.targetTrade}</strong> •{' '}
              {tt.mqaSkillCode}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Box */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">
            Toolbox Talk Context & Purpose
          </p>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {tt.overview}
          </p>
        </div>

        {/* Discussion Points & Golden Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Discussion Points */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Discussion Points (Supervisor Script)</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {tt.keyDiscussionPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {idx + 1}
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Safety Rules */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Golden Safety Rules (Non-Negotiable)</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-200">
              {tt.criticalSafetyRules.map((rule, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-red-900/60 text-red-300 border border-red-700 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    !
                  </span>
                  <span className="font-medium">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Attendees Register */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Shift Attendance & Digital Sign-off Register ({attendees.length} Attendees)</span>
            </h4>
            <span className="text-[11px] text-slate-400">Attaches to Tender Safety Binder</span>
          </div>

          {/* Add Attendee Input Row */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              placeholder="Worker Full Name"
              value={newAttendeeName}
              onChange={(e) => setNewAttendeeName(e.target.value)}
              className="flex-grow px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="RSA ID / Passport No."
              value={newAttendeeId}
              onChange={(e) => setNewAttendeeId(e.target.value)}
              className="sm:w-48 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleAddAttendee}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Worker</span>
            </button>
          </div>

          {/* Attendee List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
            {attendees.map((att) => (
              <div
                key={att.id}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <button
                    onClick={() => handleToggleAcknowledge(att.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition ${
                      att.acknowledged
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {att.acknowledged && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="truncate">
                    <p className="font-bold text-slate-200 truncate">{att.workerName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{att.idNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-semibold">
                    Acknowledged
                  </span>
                  {attendees.length > 1 && (
                    <button
                      onClick={() => handleRemoveAttendee(att.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {isLogged
              ? 'Toolbox talk saved to site register with SHA-256 digital stamp.'
              : 'Sign off shift briefing to record compliance in tender log.'}
          </p>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleExportToolboxPdf}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2 border border-slate-700"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Register (PDF)</span>
            </button>

            {!isLogged ? (
              <button
                onClick={handleCommitLog}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Log Pre-Shift Session</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition cursor-pointer"
              >
                Done (Logged ✓)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
