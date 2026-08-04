import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, User, Mic, MicOff, Send, Sparkles, CheckCircle2, AlertTriangle, 
  Thermometer, Clock, ShieldCheck, FileJson, Copy, Download, RefreshCw, 
  Volume2, VolumeX, AlertOctagon, CornerDownLeft, Database, Check
} from 'lucide-react';

export interface ColdRoomTemp {
  unit: string;
  temperature_c: number | null;
  status: string;
  numeric_provided: boolean;
}

export interface CoolingInterval {
  item: string;
  initial_temp_c?: number | null;
  cooling_time_mins?: number | null;
  final_temp_c?: number | null;
  status: string;
}

export interface HygieneInspection {
  overall_status: 'Pass' | 'Fail' | 'Incomplete';
  handwashing_stations: boolean;
  sanitization_verified: boolean;
  notes: string;
}

export interface SafetyHazard {
  hazard: string;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface ExtractedCCPData {
  cold_room_temperatures: ColdRoomTemp[];
  cooling_intervals: CoolingInterval[];
  hygiene_inspection: HygieneInspection;
  safety_hazards: SafetyHazard[];
  missing_critical_data: string[];
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

interface ShiftHandoverAssistantProps {
  onSyncToLedger?: (recordData: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ShiftHandoverAssistant: React.FC<ShiftHandoverAssistantProps> = ({
  onSyncToLedger,
  isOpen = true,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      text: `Greetings! I am the MeloTwo Industrial Safety & Compliance Assistant. I am here to assist mine canteen managers and safety supervisors with shift handovers, Critical Control Point (CCP) logging, and SANS 10330 (HACCP) audit verification under DMRE oversight.\n\nPlease share your inspection status—including cold room temperatures, cooling interval logs, hygiene pass/fail checks, and any safety hazards reported.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [syncedLedger, setSyncedLedger] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [ccpData, setCcpData] = useState<ExtractedCCPData>({
    cold_room_temperatures: [
      { unit: "Cold Room 1 (Main Raw Storage)", temperature_c: null, status: "Pending Numeric Reading", numeric_provided: false },
      { unit: "Cold Room 2 (Dairy & Prep)", temperature_c: null, status: "Pending Numeric Reading", numeric_provided: false },
      { unit: "Walk-in Blast Freezer", temperature_c: null, status: "Pending Numeric Reading", numeric_provided: false }
    ],
    cooling_intervals: [],
    hygiene_inspection: {
      overall_status: 'Incomplete',
      handwashing_stations: false,
      sanitization_verified: false,
      notes: 'Pending shift supervisor verification'
    },
    safety_hazards: [],
    missing_critical_data: [
      "Cold Room 1 exact numeric temperature",
      "Cold Room 2 exact numeric temperature",
      "Hygiene inspection pass/fail verification"
    ]
  });

  const [isHandoverComplete, setIsHandoverComplete] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-ZA';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/handover-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, text: m.text })),
          currentData: ccpData
        })
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: data.reply || "Shift handover log received. Is there any additional temperature or hazard data to log?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      if (data.extracted_ccp_data) {
        setCcpData(data.extracted_ccp_data);
      }
      if (typeof data.is_handover_complete === 'boolean') {
        setIsHandoverComplete(data.is_handover_complete);
      }

      if (ttsEnabled) {
        speakText(botMsg.text);
      }
    } catch (err) {
      console.error("Handover assistant error:", err);
      // Fallback assistant response
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: "Thank you. To maintain defensible SANS 10330 audit compliance, please verify exact numeric temperatures for all active cold storage units.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Cold Room 1 is 3.2°C, Cold Room 2 is 3.8°C",
    "Cold Room 1 is fine", // Test defensive audit enforcement!
    "Cooked beef stew dropped from 74°C to 3.5°C in 80 mins",
    "Hygiene inspection passed, handwash stations fully stocked",
    "Hazard: Wet floor near prep sink, caution sign posted"
  ];

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(ccpData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify({
      audit_type: "MeloTwo SANS 10330 (HACCP) Canteen Shift Handover",
      timestamp: new Date().toISOString(),
      standard: "SANS 10330:2020 & DMRE Mine Safety Regulations",
      extracted_ccp_data: ccpData,
      is_handover_complete: isHandoverComplete
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MeloTwo_SANS10330_Handover_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncLedgerClick = () => {
    if (onSyncToLedger) {
      onSyncToLedger({
        date: new Date().toISOString().slice(0, 10),
        operator: "Canteen Supervisor",
        terminalId: "TERM-CCP-01",
        riskCategory: "SANS 10330 HACCP Handover",
        violationVector: "SANS 10330 / DMRE Oversight",
        severityLevel: isHandoverComplete ? "Low" : "Medium",
        auditStatus: isHandoverComplete ? "Passed" : "Action Required",
        detailedNotes: `Cold Rooms: ${ccpData.cold_room_temperatures.map(c => `${c.unit}: ${c.temperature_c ?? 'N/A'}°C`).join('; ')}. Hygiene: ${ccpData.hygiene_inspection.overall_status}.`
      });
      setSyncedLedger(true);
      setTimeout(() => setSyncedLedger(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-7xl mx-auto flex flex-col my-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white p-5 flex flex-wrap items-center justify-between gap-4 border-b border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-slate-100 tracking-tight">MeloTwo Shift Handover & CCP Assistant</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                SANS 10330 (HACCP)
              </span>
            </div>
            <p className="text-xs text-slate-400">Mine Canteen Shift Handover & Defensible Audit Logging under DMRE Oversight</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              ttsEnabled 
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300' 
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Text-to-Speech audio feedback"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span>Voice Response {ttsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowJsonView(!showJsonView)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              showJsonView 
                ? 'bg-slate-700 border-slate-500 text-amber-300' 
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileJson className="w-4 h-4 text-amber-400" />
            <span>{showJsonView ? 'Hide JSON Log' : 'View Audit JSON'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Container - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] bg-slate-50/50">
        
        {/* Left / Top: Conversation Stream */}
        <div className="lg:col-span-7 flex flex-col border-r border-slate-200 bg-white">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto max-h-[480px] space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  <div
                    className={`text-[10px] mt-2 ${
                      msg.role === 'user' ? 'text-amber-200 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-slate-500 text-xs italic p-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <span>Evaluating SANS 10330 standards & verifying numeric metrics...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-slate-50 border-t border-b border-slate-200 overflow-x-auto">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Recommended Shift Handover Prompts:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 text-slate-700 whitespace-nowrap shadow-xs transition-all flex items-center gap-1 shrink-0"
                >
                  <CornerDownLeft className="w-3 h-3 text-amber-600" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl border transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title="Voice Dictation for Mine Supervisors"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Report cold room temps (°C), cooling intervals, hygiene status, or hazards..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right / Bottom: Live Extracted CCP Audit Log Panel */}
        <div className="lg:col-span-5 p-5 bg-slate-50 flex flex-col justify-between border-l border-slate-200">
          
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                  Extracted CCP Audit Log
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  isHandoverComplete
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isHandoverComplete ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Handover Complete
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Action Required
                  </>
                )}
              </span>
            </div>

            {/* Defensible Audit Enforcement Warning */}
            {ccpData.missing_critical_data && ccpData.missing_critical_data.length > 0 && (
              <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-xs text-amber-900">
                      DMRE Compliance Guard active:
                    </h4>
                    <ul className="mt-1 space-y-1 text-xs text-amber-800 list-disc list-inside">
                      {ccpData.missing_critical_data.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: Cold Room Temperatures */}
            <div className="mb-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  <span>Cold Room Temperatures</span>
                </div>
                <span className="text-[11px] text-slate-500">Target: &le; 4.0°C</span>
              </div>

              <div className="space-y-2 mt-2">
                {ccpData.cold_room_temperatures.map((unit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {unit.unit}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${unit.temperature_c !== null ? 'text-slate-900' : 'text-slate-400'}`}>
                        {unit.temperature_c !== null ? `${unit.temperature_c}°C` : 'N/A'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          unit.numeric_provided && unit.status.includes('Compliant') && !unit.status.includes('Non')
                            ? 'bg-emerald-100 text-emerald-800'
                            : unit.numeric_provided
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {unit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Cooling Intervals */}
            <div className="mb-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <span>Cooling Intervals (90-Min Threshold)</span>
                </div>
              </div>

              {ccpData.cooling_intervals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No cooling intervals reported yet.</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {ccpData.cooling_intervals.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex justify-between font-medium text-slate-800 mb-1">
                        <span>{item.item}</span>
                        <span className="text-emerald-700 font-bold">{item.status}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex gap-3">
                        <span>Time: {item.cooling_time_mins ? `${item.cooling_time_mins} mins` : 'N/A'}</span>
                        <span>Final Temp: {item.final_temp_c ? `${item.final_temp_c}°C` : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Hygiene & Hazards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Hygiene Status
                </span>
                <div className="font-bold text-slate-800 text-sm">
                  {ccpData.hygiene_inspection.overall_status}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">
                  {ccpData.hygiene_inspection.notes}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Safety Hazards
                </span>
                <div className="font-bold text-slate-800 text-sm">
                  {ccpData.safety_hazards.length} Reported
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {ccpData.safety_hazards.length > 0 ? ccpData.safety_hazards[0].hazard : 'None logged'}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions & JSON Drawer */}
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            {showJsonView && (
              <div className="p-3 bg-slate-900 rounded-xl text-amber-300 font-mono text-xs overflow-x-auto max-h-48 mb-2">
                <pre>{JSON.stringify(ccpData, null, 2)}</pre>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedJson ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export JSON</span>
              </button>

              {onSyncToLedger && (
                <button
                  onClick={handleSyncLedgerClick}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors shadow-sm ${
                    syncedLedger ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>{syncedLedger ? 'Synced to Google Sheet Ledger!' : 'Sync to Compliance Ledger'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
