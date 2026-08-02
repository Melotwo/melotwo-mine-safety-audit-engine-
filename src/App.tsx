import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Shield,
  Layers,
  Sparkles,
  FileText,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Zap,
  HardHat,
  Check,
  ArrowRight,
  ShieldCheck,
  Building,
  Activity,
  Lock,
  Unlock,
  Key,
  Star,
  X,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Page } from '../types';

interface TrainingAcademyPageProps {
  setPage: (page: Page) => void;
}

interface QuizQuestion {
  id: number;
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sansRef: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario: 'A canteen inspector records a core temperature of 68°C for cooked poultry during a shaft canteen audit. Does this pass SANS 10330 standards?',
    options: [
      'Yes, anything above 60°C is acceptable for commercial kitchens.',
      'No. SANS 10330 requires a validated target of 72°C held for at least 15 seconds.',
      'Yes, provided blast cooling starts within 30 minutes.',
      'No. Poultry must always reach a core temperature of 90°C.'
    ],
    correctIndex: 1,
    explanation: 'SANS 10330 (HACCP) mandates that cooked poultry core temperatures must reach and maintain 72°C for a minimum of 15 seconds at Critical Control Points (CCPs).',
    sansRef: 'SANS 10330 (Catering & HACCP)'
  },
  {
    id: 2,
    scenario: 'An electrical isolation panel and 3-phase isolator are installed 100mm from a wet prep sink in a mining site kitchen. Is this layout compliant?',
    options: [
      'Yes, provided the isolator is enclosed in a IP65 waterproof housing.',
      'Yes, as long as rubber mats are placed on the floor.',
      'No. SANS 10142-1 mandates specific physical distances and moisture protection clearances from conductive wet surfaces.',
      'No. SANS 10108 requires all kitchen sinks to be explosion-proof.'
    ],
    correctIndex: 2,
    explanation: 'SANS 10142-1 (Industrial Wiring Code) strictly regulates clearances around electrical isolators to prevent moisture-induced flashovers and electrocution risks.',
    sansRef: 'SANS 10142-1 (Industrial Wiring)'
  },
  {
    id: 3,
    scenario: 'During underground inspection, a fall-arrest safety harness exhibits a PPE Material Oxidation Degradation Index score of 85%. What action is required?',
    options: [
      'Pass the harness for another 6 months of underground usage.',
      'Flag for immediate replacement; the degradation index exceeds critical safety boundaries.',
      'Downgrade the harness for surface light-duty transport only.',
      'Spray with anti-rust lubricant and re-evaluate in 30 days.'
    ],
    correctIndex: 1,
    explanation: 'Under SANS 10049 & MeloTwo PPE Material Auditing logic, a degradation score above 80% signifies severe structural fiber fatigue and requires immediate decommissioning.',
    sansRef: 'SANS 10049 (PPE & Hygiene Controls)'
  },
  {
    id: 4,
    scenario: 'An underground flameproof enclosure in a coal mine shaft is found missing one enclosure bolt in a SANS 10108 classified hazardous area. What system trigger occurs?',
    options: [
      'Triggers a LOW severity routine maintenance ticket.',
      'Triggers an IMMEDIATE ACTION REQUIRED alert due to compromised explosive gas containment.',
      'Logs a pass note with an optional bolt replacement prompt.',
      'Automatically shuts down the main surface ventilation fan.'
    ],
    correctIndex: 1,
    explanation: 'In SANS 10108 hazardous explosive gas zones, any missing enclosure fastener compromises flameproof integrity, instantly escalating to HIGH severity (Immediate Action Required).',
    sansRef: 'SANS 10108 (Hazardous Area Explosive Gas)'
  },
  {
    id: 5,
    scenario: 'An inspector enters Shaft 4 at a depth of 2,400 meters with zero cellular or Wi-Fi signal. How does the MeloTwo platform preserve audit data?',
    options: [
      'Data is lost until the inspector returns to the surface.',
      'The inspector must manually write notes on paper and upload later.',
      'Utilizes Offline Backup Intelligence & local-database replication to store encrypted telemetry locally until a sync connection is re-established.',
      'Relies on satellite connections that penetrate deep granite formations.'
    ],
    correctIndex: 2,
    explanation: 'MeloTwo utilizes client-side local database storage and Offline Backup Intelligence to guarantee uninterrupted audit logging in deep-level shafts without data loss.',
    sansRef: 'MeloTwo Architecture & Offline Engine'
  },
  {
    id: 6,
    scenario: 'A Department of Mineral Resources (DMR) inspector arrives unannounced for a site audit. How can the SHEQ officer produce a legally defensible audit report instantly?',
    options: [
      'Email customer support to request a manual transcript generated overnight.',
      'Generate a 1-click verified PDF download directly from the terminal.',
      'Print raw JSON logs from the server command line interface.',
      'Request a 14-day statutory extension from the inspector.'
    ],
    correctIndex: 1,
    explanation: 'MeloTwo provides instant 1-click verified PDF report compilation, formatted specifically for South African regulatory sign-off compliance.',
    sansRef: 'MeloTwo Compliance Reporting'
  },
  {
    id: 7,
    scenario: 'A regional general manager wants real-time compliance oversight for Shaft 4, Shaft 7, and the surface processing plant simultaneously. Where is this aggregated?',
    options: [
      'Inside individual inspector offline spreadsheets.',
      'In the Multi-User Procurement & Compliance Dashboard.',
      'Via weekly printed physical mailers.',
      'Only inside the local database log file.'
    ],
    correctIndex: 1,
    explanation: 'The Multi-User Procurement & Compliance Dashboard binds multi-site telemetry across shafts to provide centralized, real-time executive visibility.',
    sansRef: 'Multi-Site Governance'
  },
  {
    id: 8,
    scenario: 'Which international standard establishes the framework for AI Safety Management Systems and ethical compliance in automated hazard detection?',
    options: [
      'ISO 9001',
      'ISO 42001',
      'ISO 14001',
      'ISO 27001'
    ],
    correctIndex: 1,
    explanation: 'ISO 42001 is the global standard for AI Management Systems, ensuring automated safety recommendations and telemetry algorithms remain transparent and defensible.',
    sansRef: 'ISO 42001 (AI Governance)'
  },
  {
    id: 9,
    scenario: 'If the MeloTwo Engine detects both a minor hygiene compliance failure and an electrical isolation hazard in an explosive gas zone, how does the Conflict Reconciliation Protocol react?',
    options: [
      'It averages both risks into a MEDIUM severity score.',
      'It ignores the electrical hazard and prompts for hygiene cleanup.',
      'It automatically defaults to the highest severity risk (HIGH / Immediate Action Required) to prioritize life safety.',
      'It asks the inspector to manually vote on which hazard is worse.'
    ],
    correctIndex: 2,
    explanation: 'The Conflict Reconciliation Protocol strictly defaults to the highest life-safety risk override when cross-standard hazards overlap in operational zones.',
    sansRef: 'Conflict Reconciliation Engine'
  },
  {
    id: 10,
    scenario: 'What is the documented first-time regulatory audit sign-off rate achieved by industrial sites deploying the MeloTwo Safety Engine?',
    options: [
      '75.0%',
      '88.2%',
      '99.4%',
      '100.0%'
    ],
    correctIndex: 2,
    explanation: 'MeloTwo enables a 99.4% regulatory first-time sign-off rate by eliminating staging obstacles and enforcing rigorous pre-audit verification checks.',
    sansRef: 'MeloTwo Benchmark Statistics'
  }
];

export const TrainingAcademyPage: React.FC<TrainingAcademyPageProps> = ({ setPage }) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'protocol' | 'quiz' | 'checklist'>('modules');
  const [selectedModule, setSelectedModule] = useState<number | null>(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  
  // Freemium Pro State
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    return localStorage.getItem('melotwo_pro_access') === 'true';
  });
  const [showProPaywallModal, setShowProPaywallModal] = useState<boolean>(false);
  const [paywallFeatureTrigger, setPaywallFeatureTrigger] = useState<string>('Interactive Scenario & Quiz Access');

  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
    5: false
  });

  const toggleProUserMode = () => {
    const nextVal = !isProUser;
    setIsProUser(nextVal);
    localStorage.setItem('melotwo_pro_access', String(nextVal));
  };

  const handleProProtectedAction = (actionName: string, onProSuccess: () => void) => {
    if (isProUser) {
      onProSuccess();
    } else {
      setPaywallFeatureTrigger(actionName);
      setShowProPaywallModal(true);
    }
  };

  const modules = [
    {
      id: 1,
      title: 'Module 1: SANS 10330 (HACCP & Catering Safety)',
      badge: 'SANS 10330',
      icon: Flame,
      color: 'amber',
      objective: 'Master Critical Control Point (CCP) monitoring, blast cooling intervals, and industrial kitchen hygiene across mining canteen facilities.',
      rules: [
        'Cooked core targets must be validated at 72°C held for a minimum of 15 seconds.',
        'Ensure strict monitoring of blast cooling intervals to prevent rapid bacterial proliferation.',
        'Maintain and audit raw poultry storage temperatures under strict CCP limits.'
      ],
      scenario: 'Canteen Inspector evaluating thermal logs in Shaft 3 dining facilities during high-volume shift changes.'
    },
    {
      id: 2,
      title: 'Module 2: SANS 10142-1 (Industrial Wiring Code)',
      badge: 'SANS 10142-1',
      icon: Zap,
      color: 'blue',
      objective: 'Ensure electrical safety clearances, 3-phase commercial isolator grounding, and wet surface isolation in industrial zones.',
      rules: [
        'Verify proper physical clearance for all 3-phase commercial isolator switches.',
        'Ensure all metal wet prep sinks maintain mandatory separation distances from power plug sockets.',
        'Audit combi oven clearances to guarantee adequate shielding from heavy steam exhausts.'
      ],
      scenario: 'High-voltage processing plant electrical audit following equipment retrofits.'
    },
    {
      id: 3,
      title: 'Module 3: SANS 10049 (Occupational Hygiene & PPE)',
      badge: 'SANS 10049',
      icon: HardHat,
      color: 'emerald',
      objective: 'Audit staff sanitation, chemical concentration rates, and simulate PPE material degradation trends in harsh environments.',
      rules: [
        'Conduct routine audits of staff sanitation and open refuse handling procedures.',
        'Track the PPE Material Degradation Index to simulate oxidation wear and predict safety boundaries.',
        'Validate chemical concentration rates against operational health prerequisites.'
      ],
      scenario: 'Underground shaft entrance PPE inspection for 150 incoming shift miners.'
    },
    {
      id: 4,
      title: 'Module 4: SANS 10108 (Hazardous Areas & Gas Zones)',
      badge: 'SANS 10108',
      icon: AlertTriangle,
      color: 'red',
      objective: 'Manage hazardous explosive gas atmospheres, intrinsically safe equipment enclosures, and underground gas sensors.',
      rules: [
        'Perform routine calibration of underground methane and hazardous gas sensors in Ex zones.',
        'Audit the structural integrity of intrinsically safe flameproof enclosures for heavy machinery.',
        'Flag any missing enclosure bolts or cracked seals as IMMEDIATE ACTION REQUIRED alerts.'
      ],
      scenario: 'Sub-surface 2,200m methane-risk mining shaft continuous telemetry audit.'
    },
    {
      id: 5,
      title: 'Module 5: SANS 10375 (Conveyors & Lifting Gear)',
      badge: 'SANS 10375',
      icon: Layers,
      color: 'indigo',
      objective: 'Audit heavy industrial conveyor belts, rigging hardware, and hydrocarbon spill containment systems.',
      rules: [
        'Inspect conveyor belt splice integrity and emergency pull-wire stop triggers for material fatigue.',
        'Conduct high-fidelity non-destructive audits of rigging gear for micro stress fractures.',
        'Verify that all hydrocarbon spill containment bunds meet secondary capacity regulations.'
      ],
      scenario: 'Ore transport conveyor gallery overhaul inspection.'
    },
    {
      id: 6,
      title: 'Module 6: ISO 42001 (AI Safety & Model Governance)',
      badge: 'ISO 42001',
      icon: Cpu,
      color: 'purple',
      objective: 'Deploy automated multi-standard batch parsing, manage AI telemetry models, and ensure ethical algorithm transparency.',
      rules: [
        'Utilize multi-standard batch parsing to evaluate cross-standard data streams simultaneously.',
        'Perform regular AI safety model risk audits to ensure compliance recommendations remain legally defensible.',
        'Monitor the GA4 Telemetry Console for real-time compliance health metrics across all operational sites.'
      ],
      scenario: 'Executive SHEQ deployment of automated telemetry ingestion for multi-site operations.'
    }
  ];

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const toggleChecklist = (id: number) => {
    setChecklistState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedChecklistCount = Object.values(checklistState).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      {/* FREEMIUM / DEMO VIEW TOGGLE FLOATING BAR */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${isProUser ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
            {isProUser ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">Academy View Mode:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${
                isProUser ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {isProUser ? 'Pro Subscribed (Unlocked)' : 'Public Guest (Freemium Teaser)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isProUser 
                ? 'Full interactive quiz runner, terminal drills, and 1-click PDF exports enabled.' 
                : 'Modules & rules are public for SEO/Trust. Interactive quizzes & terminal access show Pro paywall.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleProUserMode}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-2 shrink-0 ${
            isProUser
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
          }`}
        >
          {isProUser ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Simulate Guest / Free Mode</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Switch to Pro Member Mode</span>
            </>
          )}
        </button>
      </div>

      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 text-white shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <GraduationCap className="w-4 h-4" />
              <span>Official SHEQ Training Academy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              MeloTwo Inspector Onboarding & SANS Curriculum
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Designed for Senior SHEQ Officers and Industrial Engineers. Master the 6-module compliance pathway, multi-standard conflict reconciliation protocols, and interactive field verification scenarios.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => handleProProtectedAction('Auditing Terminal Live Execution', () => setPage('inspector'))}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg hover:shadow-amber-500/25 cursor-pointer relative group"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Auditing Terminal</span>
              {!isProUser && (
                <span className="ml-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>PRO</span>
                </span>
              )}
            </button>
            <button
              onClick={() => handleProProtectedAction('10-Question Field Practice Quiz', () => setActiveTab('quiz'))}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-sm transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Take 10-Question Quiz</span>
              {!isProUser && (
                <span className="ml-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>PRO</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-slate-400 text-xs font-medium">Curriculum Modules</p>
            <p className="text-2xl font-black text-white mt-1">6 SANS & ISO</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-slate-400 text-xs font-medium">Field Practice Quiz</p>
            <p className="text-2xl font-black text-amber-400 mt-1">10 Scenarios</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-slate-400 text-xs font-medium">Conflict Priority</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">Auto Overrides</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-slate-400 text-xs font-medium">First-Time Sign-Off</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">99.4% Rate</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none space-x-2 pb-1">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === 'modules'
              ? 'bg-white border border-b-0 border-gray-200 text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. 6-Module Course Pathway</span>
        </button>

        <button
          onClick={() => setActiveTab('protocol')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === 'protocol'
              ? 'bg-white border border-b-0 border-gray-200 text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Conflict Reconciliation & Site Mapping</span>
        </button>

        <button
          onClick={() => {
            if (isProUser) {
              setActiveTab('quiz');
            } else {
              handleProProtectedAction('Interactive 10-Question Field Practice Quiz', () => setActiveTab('quiz'));
            }
          }}
          className={`flex items-center space-x-2 px-5 py-3 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-white border border-b-0 border-gray-200 text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>3. 10-Question Field Practice Quiz</span>
          {!isProUser && <Lock className="w-3 h-3 text-amber-500 ml-1" />}
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-white border border-b-0 border-gray-200 text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>4. 5-Point Quick Reference Field Checklist</span>
        </button>
      </div>

      {/* TAB 1: 6-MODULE COURSE PATHWAY */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Module Overview & Core Compliance Rules</h2>
              <p className="text-gray-600 text-sm mt-1">
                Each module establishes the 3 non-negotiable rules required to achieve S-Tier compliance and prevent multi-million Rand litigation or operational shutdowns.
              </p>
            </div>
            {!isProUser && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center space-x-1.5 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Freemium Teaser Active</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => {
              const IconComp = m.icon;
              const isSelected = selectedModule === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModule(m.id)}
                  className={`rounded-2xl border transition-all cursor-pointer p-6 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 text-white shadow-xl ring-2 ring-indigo-500/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900 shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {m.badge}
                      </span>
                      <div className={`p-2.5 rounded-xl ${
                        isSelected ? 'bg-slate-800 text-amber-400' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-base font-bold leading-snug ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {m.title}
                      </h3>
                      <p className={`text-xs mt-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-gray-600'}`}>
                        {m.objective}
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl text-xs space-y-2 ${isSelected ? 'bg-slate-800/80 border border-slate-700' : 'bg-gray-50 border border-gray-100'}`}>
                      <p className={`font-bold ${isSelected ? 'text-amber-300' : 'text-indigo-900'}`}>
                        3 Critical Compliance Rules:
                      </p>
                      <ul className="space-y-1.5 list-disc list-inside">
                        {m.rules.map((rule, idx) => (
                          <li key={idx} className={isSelected ? 'text-slate-300' : 'text-gray-700'}>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100/10 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? 'text-amber-400' : 'text-indigo-600'}>
                      {isSelected ? 'Active Focus' : 'Click to Select'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProProtectedAction(`${m.badge} Interactive Scenario Drill`, () => setPage('inspector'));
                      }}
                      className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      <span>Scenario Drill</span>
                      {!isProUser ? <Lock className="w-3 h-3 ml-0.5" /> : <ArrowRight className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CONFLICT RECONCILIATION & SITE MAPPING */}
      {activeTab === 'protocol' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CONFLICT RECONCILIATION PROTOCOL */}
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Conflict Reconciliation Protocol</h3>
                  <p className="text-slate-400 text-xs">Automated Multi-Standard Severity Override Engine</p>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                When an operational inspection detects overlapping hazards across multiple SANS standards (e.g., an electrical fault under SANS 10142-1 inside an explosive gas area under SANS 10108), the MeloTwo Engine automatically defaults to the <strong className="text-red-400">highest life-safety severity risk</strong>.
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex items-start space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0"></span>
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase">Level 1: Explosive / Atmospheric Gas Hazards (SANS 10108)</p>
                    <p className="text-slate-300 text-xs mt-1">Methane gas limits, missing enclosure bolts, or spark risks immediately trigger <span className="text-white font-bold underline">IMMEDIATE ACTION REQUIRED</span> override.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex items-start space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                  <div>
                    <p className="text-xs font-bold text-amber-400 uppercase">Level 2: High-Voltage Electrical & Clearance Hazards (SANS 10142-1)</p>
                    <p className="text-slate-300 text-xs mt-1">3-Phase isolator clearance breaches or wet-surface proximity trigger immediate isolation mandates.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex items-start space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                  <div>
                    <p className="text-xs font-bold text-emerald-400 uppercase">Level 3: Hygiene, PPE & Catering Hazards (SANS 10330 / 10049)</p>
                    <p className="text-slate-300 text-xs mt-1">Food core temperature deviations or harness oxidation wear logged as high-priority corrective action tickets.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-200 flex items-center justify-between">
                <span>Regulatory First-Time Sign-Off Guarantee</span>
                <span className="font-bold text-amber-400">99.4% Verified</span>
              </div>
            </div>

            {/* AUTOMATIC SITE MAPPING */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Automatic Location & Site Mapping</h3>
                  <p className="text-gray-500 text-xs">Contextual Telemetry Binding across Shafts & Terminals</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed">
                By entering or selecting a specific <strong>Site ID</strong> (e.g., <code className="bg-gray-100 text-indigo-700 px-2 py-0.5 rounded font-mono text-xs font-bold">SITE-301</code>, <code className="bg-gray-100 text-indigo-700 px-2 py-0.5 rounded font-mono text-xs font-bold">Shaft 4</code>, <code className="bg-gray-100 text-indigo-700 px-2 py-0.5 rounded font-mono text-xs font-bold">Terminal 02</code>), the MeloTwo platform automatically anchors all multi-standard inspection logs to that operational context.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                    <span>1. Contextual Binding</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    No manual filter configuration required. All incoming inspection logs, photo evidence, and sensor readings automatically attach to the active site profile.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                    <span>2. Offline Local Replication</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Deep underground shaft inspections are saved locally in the terminal cache and auto-synchronized to executive procurement dashboards upon reaching surface connectivity.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                    <span>3. Audit Trail Defensibility</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Immutable timestamping ensures all PASSED and ACTION REQUIRED records are backed by digital signatures and ISO 42001 AI governance standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 10-QUESTION PRACTICE QUIZ */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Field Inspector Certification Quiz</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">10-Question Field Inspection Practice Quiz</h2>
              <p className="text-gray-600 text-sm mt-1">
                Test your knowledge on SANS 10330, SANS 10142-1, SANS 10049, SANS 10108, SANS 10375, and ISO 42001 compliance standards.
              </p>
            </div>

            {isQuizSubmitted && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 text-center shrink-0 w-full sm:w-auto">
                <p className="text-xs text-slate-400 font-medium">Your Score</p>
                <p className="text-3xl font-black text-amber-400 mt-1">
                  {calculateScore()} / {QUIZ_QUESTIONS.length}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  {calculateScore() >= 8 ? '🎉 PASS - Certified' : '⚠️ Review Required'}
                </p>
              </div>
            )}
          </div>

          {/* QUIZ LIST */}
          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q, qIndex) => {
              const selectedOpt = userAnswers[q.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-6 sm:p-8 space-y-4 shadow-sm transition ${
                    isQuizSubmitted
                      ? isCorrect
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-red-300 bg-red-50/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        Q{q.id}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                        {q.sansRef}
                      </span>
                    </div>

                    {isQuizSubmitted && (
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? <Check className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                        <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-base font-bold text-gray-900 leading-snug">
                    {q.scenario}
                  </p>

                  <div className="space-y-2 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      let optionStyle = 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100';

                      if (isQuizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          optionStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle = 'bg-red-100 border-red-400 text-red-950 font-bold';
                        } else {
                          optionStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-500/20';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isQuizSubmitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            isOptionSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-500'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-grow">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isQuizSubmitted && (
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-1">
                      <p className="font-bold text-amber-400">SANS Regulatory Citation & Explanation:</p>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SUBMIT BUTTON ROW */}
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div>
              <p className="font-bold text-sm">Completed {Object.keys(userAnswers).length} of 10 questions</p>
              <p className="text-slate-400 text-xs">A minimum score of 80% (8/10) is required for official SHEQ certification.</p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {isQuizSubmitted ? (
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setIsQuizSubmitted(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Quiz</span>
                </button>
              ) : (
                <button
                  disabled={Object.keys(userAnswers).length === 0}
                  onClick={() => setIsQuizSubmitted(true)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Submit & Grade Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 5-POINT QUICK REFERENCE FIELD CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">5-Point Quick Reference Field Checklist</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Mandatory pre-audit verification checklist for Senior SHEQ Officers entering high-risk operational shafts.
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-indigo-600">{completedChecklistCount} / 5</span>
                <p className="text-xs text-gray-500">Items Verified</p>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(completedChecklistCount / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 1,
                title: '1. Context Binding',
                desc: 'Enter Site ID (e.g., SITE-301 or Shaft 4) to anchor all incoming telemetry and audit photos to the correct operational shaft profile.',
                badge: 'Site Mapping'
              },
              {
                id: 2,
                title: '2. Standard Focus Selection',
                desc: 'Choose the active SANS standard focus (10330, 10142, 10049, 10108, 10375) in the Compliance Assessment Sandbox.',
                badge: 'Sandbox Configuration'
              },
              {
                id: 3,
                title: '3. Offline Backup Verification',
                desc: 'Confirm Offline Backup Intelligence is enabled before descending into deep-level shafts without cellular coverage.',
                badge: 'Offline Engine'
              },
              {
                id: 4,
                title: '4. Critical Control Point (CCP) Threshold Check',
                desc: 'Verify core temperatures at 72°C (15s) for catering facilities and confirm mandatory moisture separation clearances for 3-phase isolators.',
                badge: 'Physical Inspection'
              },
              {
                id: 5,
                title: '5. Audit Trail Finalization & Sync',
                desc: 'Generate the Compliance Assessment Draft, compile 1-click verified PDF report, and sync to the executive procurement dashboard.',
                badge: 'Report Sign-off'
              }
            ].map((item) => {
              const isChecked = checklistState[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-6 rounded-2xl border transition cursor-pointer flex items-start space-x-4 ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                    isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-4 h-4" />}
                  </div>

                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-base font-bold ${isChecked ? 'text-emerald-950 line-through' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                        {item.badge}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm ${isChecked ? 'text-emerald-800' : 'text-gray-600'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MELOTWO PRO / FREEMIUM PAYWALL MODAL */}
      {showProPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <button
              onClick={() => setShowProPaywallModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MeloTwo Pro Access</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Unlock MeloTwo Pro & Enterprise Suite
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Unlock full interactive scenario drills, 10-question field quizzes, and official audit exports with MeloTwo Pro.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 text-xs">
              <p className="font-bold text-amber-400 uppercase tracking-wide">Included in MeloTwo Pro Tier:</p>
              <ul className="space-y-2.5">
                <li className="flex items-start space-x-2.5 text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Full 10-Question Field Practice Quiz</strong> with instant scoring and SANS citation breakdowns.</span>
                </li>
                <li className="flex items-start space-x-2.5 text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Deep Auditing Terminal Access</strong> with offline database sync & Conflict Reconciliation engine.</span>
                </li>
                <li className="flex items-start space-x-2.5 text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Click Verified PDF Download</strong> for DMR / SANS legal regulatory sign-off.</span>
                </li>
                <li className="flex items-start space-x-2.5 text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Multi-Site Regional Executive Dashboard</strong> across Shafts & Processing Plants.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowProPaywallModal(false);
                  setIsProUser(true);
                  localStorage.setItem('melotwo_pro_access', 'true');
                  if (paywallFeatureTrigger.includes('Auditing Terminal')) {
                    setPage('inspector');
                  } else if (paywallFeatureTrigger.includes('Quiz')) {
                    setActiveTab('quiz');
                  }
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Subscription / Sign Up for MeloTwo Pro</span>
              </button>

              <button
                onClick={() => setShowProPaywallModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer text-center"
              >
                Explore Free Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
