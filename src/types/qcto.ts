/**
 * QCTO & MQA Curriculum Alignment and Workplace Training Types
 * For MeloTwo Mine Safety Audit Engine (melotwo.com)
 */

export interface QctoCurriculumItem {
  code: string;
  title: string;
  credits: number;
  description?: string;
}

export interface FieldDrillOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface FieldDrill {
  id: string;
  title: string;
  estimatedMinutes: number;
  scenarioContext: string;
  question: string;
  options: FieldDrillOption[];
  sansRef: string;
  qctoRef: string;
  hazardSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  correctActionProtocol: string;
}

export interface ToolboxTalkTemplate {
  id: string;
  topic: string;
  targetTrade: string;
  duration: string;
  statutoryReference: string;
  mqaSkillCode: string;
  overview: string;
  keyDiscussionPoints: string[];
  supervisorActionPoints: string[];
  criticalSafetyRules: string[];
}

export interface QctoModuleMapping {
  moduleId: number;
  sansCode: string;
  sansTitle: string;
  qualificationTitle: string;
  saqaId: string;
  curriculumCode: string;
  nqfLevel: number;
  credits: number;
  qualityAssuringBody: 'QCTO' | 'MQA' | 'MQA / QCTO' | 'QCTO / MQA Co-Accredited';
  ofoCode: string;
  legalFramework: string;
  targetOccupations: string[];
  knowledgeModules: QctoCurriculumItem[];
  practicalModules: QctoCurriculumItem[];
  workExperienceModules: QctoCurriculumItem[];
  drill: FieldDrill;
  toolboxTalk: ToolboxTalkTemplate;
}

export interface WorkerCompetencyRecord {
  id: string;
  workerName: string;
  idNumber: string;
  companyName: string;
  moduleId: number;
  moduleName: string;
  sansRef: string;
  saqaId: string;
  curriculumCode: string;
  drillScore: number;
  passed: boolean;
  completedAt: string;
  location: {
    siteName: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  };
  supervisorName: string;
  supervisorDesignation: string;
  verificationStamp: string;
  notes?: string;
  attachedToTenderFile?: boolean;
}

export interface ToolboxTalkLog {
  id: string;
  moduleId: number;
  topic: string;
  statutoryReference: string;
  companyName: string;
  siteName: string;
  date: string;
  durationMinutes: number;
  supervisorName: string;
  supervisorDesignation: string;
  attendees: Array<{
    workerName: string;
    idNumber: string;
    acknowledged: boolean;
  }>;
  verificationStamp: string;
}
