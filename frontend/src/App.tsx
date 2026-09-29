import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LimitationsBanner } from './components/LimitationsBanner';
import { CopilotChatDrawer } from './components/CopilotChatDrawer';
import { DemoModeRunner } from './pages/DemoModeRunner';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { DataIngestionQuality } from './pages/DataIngestionQuality';
import { LiveSensorMonitor } from './pages/LiveSensorMonitor';
import { PredictionsExplainability } from './pages/PredictionsExplainability';
import { NutrientFeedOptimizer } from './pages/NutrientFeedOptimizer';
import { MediaCostAnalysis } from './pages/MediaCostAnalysis';
import { ScaleUpEnginePage } from './pages/ScaleUpEnginePage';
import { RiskCenterPage } from './pages/RiskCenterPage';
import { AuditApprovalPage } from './pages/AuditApprovalPage';
import { ReportViewPage } from './pages/ReportViewPage';
import { Mic, Sparkles } from 'lucide-react';

function AppContent() {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [autoStartVoice, setAutoStartVoice] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Theme state with local persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('biocopilot_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('biocopilot_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenVoiceAssistant = () => {
    setAutoStartVoice(true);
    setIsCopilotOpen(true);
  };

  const handleOpenTextCopilot = () => {
    setAutoStartVoice(false);
    setIsCopilotOpen(true);
  };

  // Voice command dispatcher
  const handleVoiceCommand = (command: string) => {
    const lower = command.toLowerCase().trim();
    if (lower.includes('light mode') || lower.includes('switch to light')) {
      setTheme('light');
    } else if (lower.includes('dark mode') || lower.includes('switch to dark')) {
      setTheme('dark');
    } else if (lower.includes('monitor') || lower.includes('sensor')) {
      navigate('/monitor');
    } else if (lower.includes('predict') || lower.includes('forecast')) {
      navigate('/predictions');
    } else if (lower.includes('nutrient') || lower.includes('feed')) {
      navigate('/nutrients');
    } else if (lower.includes('cost') || lower.includes('media cost')) {
      navigate('/cost');
    } else if (lower.includes('scale') || lower.includes('scale up')) {
      navigate('/scaleup');
    } else if (lower.includes('risk') || lower.includes('fault')) {
      navigate('/risks');
    } else if (lower.includes('approval') || lower.includes('audit')) {
      navigate('/approval');
    } else if (lower.includes('report') || lower.includes('dossier')) {
      navigate('/reports');
    } else if (lower.includes('overview') || lower.includes('home') || lower.includes('dashboard')) {
      navigate('/');
    } else if (lower.includes('demo') || lower.includes('start demo')) {
      setIsDemoOpen(true);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'light bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenCopilot={handleOpenTextCopilot}
        onOpenVoice={handleOpenVoiceAssistant}
        isConnected={isConnected}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Global Scientific Limitations Banner */}
      <LimitationsBanner />

      {/* Main Routed Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <Routes>
          <Route path="/" element={<OverviewDashboard onStartDemo={() => setIsDemoOpen(true)} />} />
          <Route path="/data" element={<DataIngestionQuality />} />
          <Route path="/monitor" element={<LiveSensorMonitor />} />
          <Route path="/predictions" element={<PredictionsExplainability />} />
          <Route path="/nutrients" element={<NutrientFeedOptimizer />} />
          <Route path="/cost" element={<MediaCostAnalysis />} />
          <Route path="/scaleup" element={<ScaleUpEnginePage />} />
          <Route path="/risks" element={<RiskCenterPage />} />
          <Route path="/approval" element={<AuditApprovalPage />} />
          <Route path="/reports" element={<ReportViewPage />} />
        </Routes>
      </main>

      {/* Floating Interactive Voice Assistant Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-3">
        <button
          onClick={handleOpenVoiceAssistant}
          className="group relative flex items-center space-x-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 p-3.5 sm:px-5 sm:py-3.5 text-slate-950 font-bold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-300/40"
          title="Talk with BioCopilot AI Voice Assistant"
        >
          {/* Subtle pulse ring behind button */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-40 blur-sm group-hover:opacity-75 animate-pulse transition duration-1000 -z-10" />
          
          <div className="relative flex items-center justify-center">
            <Mic className="h-5 w-5 text-slate-950 fill-current animate-bounce" />
          </div>

          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-black tracking-wide uppercase text-slate-950">Voice Assistant</span>
            <span className="text-[10px] text-slate-900 font-medium">Click to Speak</span>
          </div>

          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        </button>
      </div>

      {/* Copilot Chat & Voice Drawer */}
      <CopilotChatDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeRunId="BATCH-2026-CHO-001"
        autoStartVoice={autoStartVoice}
        onExecuteVoiceCommand={handleVoiceCommand}
        currentTheme={theme}
      />

      {/* 5-Min Judge Demo Mode Guided Overlay */}
      <DemoModeRunner
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        BioCopilot v1.0.0 • YUVA Megathon 2026 SRM IST Trichy (Biotech Track) • Decision-Support Only • Zero Direct Hardware Control
      </footer>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
