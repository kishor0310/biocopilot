import React, { useState, useEffect, useRef } from 'react';
import {
  X, Send, Bot, User, Sparkles, Mic, MicOff, Volume2, VolumeX,
  Radio, AlertCircle, Play, Square, Compass, CheckCircle2
} from 'lucide-react';
import { queryCopilot } from '../api/client';
import { CopilotQueryResponse } from '../types';

interface CopilotChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRunId: string;
  autoStartVoice?: boolean;
  onExecuteVoiceCommand?: (command: string) => void;
  currentTheme?: 'dark' | 'light';
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  metrics?: Record<string, any>;
  timestamp: string;
  isVoiceCommand?: boolean;
}

export const CopilotChatDrawer: React.FC<CopilotChatDrawerProps> = ({
  isOpen,
  onClose,
  activeRunId,
  autoStartVoice = false,
  onExecuteVoiceCommand,
  currentTheme = 'dark'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your BioCopilot AI Voice & Bioprocess Assistant. I continuously monitor real-time bioreactor telemetry, Monod kinetics, glucose-lactate shifts, and hydrodynamic scale-up.\n\n🎙️ Press the microphone to speak, or type your question. You can also give voice commands like \"Switch to Light Mode\", \"Open Live Sensors\", or \"Start Demo\".",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [lastRecognizedSpeech, setLastRecognizedSpeech] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedQuestions = [
    { label: "Lactate Accumulation", query: "Why is lactate increasing in the reactor?" },
    { label: "Viability Stress", query: "What is affecting cell viability?" },
    { label: "Scale-Up Hydrodynamics", query: "What changes when scaling from 2 L to 1,000 L?" },
    { label: "Feed Strategy Cost", query: "Which feed scenario gives the lowest media cost?" },
    { label: "Metabolic Risk", query: "What are the current process risks?" }
  ];

  const suggestedVoiceCommands = [
    { label: "Switch to Light Mode", cmd: "switch to light mode" },
    { label: "Switch to Dark Mode", cmd: "switch to dark mode" },
    { label: "Open Live Sensors", cmd: "open monitor" },
    { label: "Start 5-Min Demo", cmd: "start demo" }
  ];

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setLastRecognizedSpeech(transcript);
          setInput(transcript);
          setIsListening(false);
          handleSend(transcript);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error !== 'no-speech') {
            setSpeechError(`Voice error: ${event.error}. You can also type or click suggested inquiries.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }, []);

  // Trigger voice listening when opened with autoStartVoice
  useEffect(() => {
    if (isOpen && autoStartVoice && recognitionRef.current && !isListening) {
      const timer = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoStartVoice]);

  // Speech Synthesis: Speak text aloud
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown characters & formulas before vocalizing for natural bioprocess speech
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/10\^6/g, 'ten to the sixth')
      .replace(/1,000 L/g, 'one thousand liters')
      .replace(/2 L/g, 'two liters')
      .replace(/DO/g, 'dissolved oxygen')
      .replace(/VCD/g, 'viable cell density');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setSpeechError("Microphone speech recognition is not natively supported in this browser context. Please use Chrome/Edge or click any suggested prompt to hear spoken answers!");
      return;
    }
    stopSpeaking();
    setSpeechError(null);
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Speech recognition start error (might already be running):', err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  // Inspect and execute spoken or typed commands
  const handleSend = async (questionText: string) => {
    const raw = questionText.trim();
    if (!raw) return;

    const userMsg: Message = {
      sender: 'user',
      text: raw,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Check for voice commands
    const lower = raw.toLowerCase();
    let commandReply: string | null = null;

    if (lower.includes('light mode') || lower.includes('switch to light')) {
      onExecuteVoiceCommand?.('light mode');
      commandReply = "Switching BioCopilot interface to high-contrast clinical Light Mode.";
    } else if (lower.includes('dark mode') || lower.includes('switch to dark')) {
      onExecuteVoiceCommand?.('dark mode');
      commandReply = "Switching BioCopilot interface to dark laboratory observation mode.";
    } else if (lower.includes('demo') || lower.includes('start demo')) {
      onExecuteVoiceCommand?.('demo');
      commandReply = "Launching the automated 5-minute competition demo sequence.";
    } else if (lower.includes('monitor') || lower.includes('sensor') || lower.includes('live telemetry')) {
      onExecuteVoiceCommand?.('monitor');
      commandReply = "Navigating to the 12-channel live virtual sensor telemetry dashboard.";
    } else if (lower.includes('predict') || lower.includes('forecast')) {
      onExecuteVoiceCommand?.('predict');
      commandReply = "Navigating to AI 48-hour trajectory predictions and SHAP explainability.";
    } else if (lower.includes('nutrient') || lower.includes('feed schedule')) {
      onExecuteVoiceCommand?.('nutrient');
      commandReply = "Opening dynamic nutrient and feed rate optimization simulator.";
    } else if (lower.includes('cost') || lower.includes('media cost')) {
      onExecuteVoiceCommand?.('cost');
      commandReply = "Opening media cost analysis and component pricing model.";
    } else if (lower.includes('scale up') || lower.includes('scaleup') || lower.includes('1000')) {
      onExecuteVoiceCommand?.('scaleup');
      commandReply = "Opening bioreactor hydrodynamic scale-up engine from 2 Liters to 1,000 Liters.";
    } else if (lower.includes('risk') || lower.includes('fault')) {
      onExecuteVoiceCommand?.('risk');
      commandReply = "Opening real-time metabolic risk and fault injection center.";
    } else if (lower.includes('approval') || lower.includes('sign off') || lower.includes('audit')) {
      onExecuteVoiceCommand?.('approval');
      commandReply = "Opening human-in-the-loop regulatory sign-off and audit trail.";
    } else if (lower.includes('report') || lower.includes('dossier')) {
      onExecuteVoiceCommand?.('report');
      commandReply = "Opening batch regulatory dossier and export center.";
    }

    if (commandReply) {
      const assistantMsg: Message = {
        sender: 'assistant',
        text: `⚡ Voice Command Executed: ${commandReply}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoiceCommand: true
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (autoSpeak) {
        speakText(commandReply);
      }
      return;
    }

    // Otherwise, call backend bioprocess copilot engine
    setIsLoading(true);
    try {
      const res: CopilotQueryResponse = await queryCopilot(raw, activeRunId);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: res.answer,
        metrics: res.supporting_metrics,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically vocalize the answer if enabled
      if (autoSpeak) {
        speakText(res.answer);
      }
    } catch (err) {
      const fallbackText = "I could not retrieve live telemetry for that query. Based on standard CHO fed-batch kinetics: maintain dissolved oxygen above 40%, keep glucose between 2.0 and 6.0 g/L, and monitor lactate buildup.";
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      if (autoSpeak) {
        speakText(fallbackText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl copilot-drawer transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950/85">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">BioCopilot Voice AI</h3>
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Radio className="h-2.5 w-2.5 animate-pulse" />
                    <span>STT & TTS</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Speech-Enabled Bioprocess Intelligence</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Auto Speak Toggle */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setAutoSpeak(!autoSpeak);
                }}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center space-x-1 text-xs ${
                  autoSpeak ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
                title={autoSpeak ? "Voice Speech Output: ACTIVE (Will read replies aloud)" : "Voice Speech Output: MUTED"}
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-[10px] hidden sm:inline">{autoSpeak ? 'Voice ON' : 'Muted'}</span>
              </button>

              {/* Close Drawer */}
              <button
                onClick={() => {
                  stopSpeaking();
                  stopListening();
                  onClose();
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Close Voice Assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Voice Waveform Live Listening Banner */}
          {isListening && (
            <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 border-b border-emerald-500/40 px-4 py-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 h-5">
                  <div className="w-1.5 bg-emerald-400 rounded-full voice-wave-bar" />
                  <div className="w-1.5 bg-cyan-400 rounded-full voice-wave-bar" />
                  <div className="w-1.5 bg-emerald-400 rounded-full voice-wave-bar" />
                  <div className="w-1.5 bg-cyan-400 rounded-full voice-wave-bar" />
                  <div className="w-1.5 bg-emerald-400 rounded-full voice-wave-bar" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-300 block">
                    Listening to your voice... Speak now!
                  </span>
                  <span className="text-[10px] text-slate-300">Say a question or command (e.g., "Switch to light mode")</span>
                </div>
              </div>
              <button
                onClick={stopListening}
                className="text-[11px] font-mono font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2.5 py-1 rounded border border-rose-500/40 cursor-pointer"
              >
                STOP
              </button>
            </div>
          )}

          {/* Speech Error Banner */}
          {speechError && (
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>{speechError}</span>
              </div>
              <button onClick={() => setSpeechError(null)} className="text-amber-400 hover:text-white font-bold ml-2">×</button>
            </div>
          )}

          {/* Suggested Voice Commands & Inquiries */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>Click to Ask & Hear Spoken Answer:</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q.query)}
                    className="text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-md border border-slate-700/80 transition-all text-left cursor-pointer flex items-center space-x-1"
                  >
                    <Volume2 className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Compass className="h-3 w-3 text-emerald-400" />
                <span>Spoken UI Control Commands:</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedVoiceCommands.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(c.cmd)}
                    className="text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/30 transition-all font-mono cursor-pointer"
                  >
                    "{c.label}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                  {m.sender === 'user' ? (
                    <>
                      <span>Operator</span>
                      <User className="h-3 w-3 text-emerald-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3 text-cyan-400" />
                      <span className="font-semibold text-cyan-400">BioCopilot Voice</span>
                    </>
                  )}
                  <span>• {m.timestamp}</span>

                  {/* Read Aloud Button for Assistant Messages */}
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="text-slate-400 hover:text-cyan-400 ml-1 p-0.5 cursor-pointer flex items-center space-x-1"
                      title="Read answer aloud via Speech Synthesis"
                    >
                      <Volume2 className="h-3 w-3 text-cyan-400" />
                      <span className="text-[9px] uppercase tracking-wide">Play Audio</span>
                    </button>
                  )}
                </div>

                <div
                  className={`max-w-[92%] rounded-xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : m.isVoiceCommand
                      ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-emerald-200 rounded-bl-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none copilot-message-assistant'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Supporting Metrics Card */}
                  {m.metrics && Object.keys(m.metrics).length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/80 text-[11px]">
                      <span className="font-semibold text-cyan-300 block mb-1">Telemetry Evidence:</span>
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-700/50 font-mono">
                        {Object.entries(m.metrics).map(([k, v]) => (
                          <div key={k} className="flex flex-col">
                            <span className="text-slate-400 text-[9px] uppercase">{k}</span>
                            <span className="text-emerald-400 font-bold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 italic p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span>BioCopilot is computing kinetic trajectories and voice response...</span>
              </div>
            )}
          </div>

          {/* Currently Speaking Audio Indicator */}
          {isSpeaking && (
            <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 border-t border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300 font-mono">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 animate-pulse text-cyan-400" />
                <span className="font-semibold">BioCopilot Speaking Answer Aloud...</span>
              </div>
              <button
                onClick={stopSpeaking}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold border border-rose-500/40 cursor-pointer"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
                <span>MUTE AUDIO</span>
              </button>
            </div>
          )}

          {/* Disclaimer Banner */}
          <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 text-center font-mono">
            Voice-enabled decision support • All process interventions require human sign-off
          </div>

          {/* Input & Microphone Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center space-x-2"
            >
              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 shadow-sm'
                }`}
                title={isListening ? "Listening... Click to stop" : "Speak to BioCopilot (Speech-To-Text)"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening to your voice... Speak now!" : "Ask a bioprocess question or command..."}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-3.5 py-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-center shadow-md shadow-cyan-600/20"
                title="Send query"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
