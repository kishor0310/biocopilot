import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Database, Radio, TrendingUp, Sparkles, Sliders, DollarSign, Layers, AlertTriangle, ShieldCheck, FileText, MessageSquare, Play, Sun, Moon, Mic } from 'lucide-react';

interface NavbarProps {
  onOpenDemo: () => void;
  onOpenCopilot: () => void;
  onOpenVoice: () => void;
  isConnected: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemo,
  onOpenCopilot,
  onOpenVoice,
  isConnected,
  theme,
  onToggleTheme
}) => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Overview', icon: Activity },
    { to: '/data', label: 'Data Quality', icon: Database },
    { to: '/monitor', label: 'Live Sensors', icon: Radio },
    { to: '/predictions', label: 'AI Predictor', icon: TrendingUp },
    { to: '/nutrients', label: 'Nutrients & Feed', icon: Sliders },
    { to: '/cost', label: 'Media Cost', icon: DollarSign },
    { to: '/scaleup', label: 'Scale-Up (2L→1kL)', icon: Layers },
    { to: '/risks', label: 'Risk Center', icon: AlertTriangle },
    { to: '/approval', label: 'Human Approval', icon: ShieldCheck },
    { to: '/reports', label: 'Report', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">BioCopilot</span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  MEGATHON '26
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI Bioprocess Decision Support</p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* WebSocket Live Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 rounded-full bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px]">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-mono">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>

          {/* 5-Min Judge Demo Button */}
          <button
            onClick={onOpenDemo}
            className="flex items-center space-x-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="font-bold hidden sm:inline">5-MIN DEMO</span>
            <span className="font-bold sm:hidden">DEMO</span>
          </button>

          {/* Voice Assistant Button with animated mic indicator */}
          <button
            onClick={onOpenVoice}
            className="flex items-center space-x-1.5 rounded-md bg-gradient-to-r from-cyan-600/30 to-teal-600/30 hover:from-cyan-600/40 hover:to-teal-600/40 border border-cyan-500/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
            title="Open Voice Assistant & Speak"
          >
            <Mic className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold hidden md:inline">Voice Assistant</span>
          </button>

          {/* Text Copilot Drawer Trigger */}
          <button
            onClick={onOpenCopilot}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all cursor-pointer flex items-center space-x-1"
            title="Ask Copilot Chat"
          >
            <MessageSquare className="h-3.5 w-3.5 text-slate-300" />
            <span className="hidden lg:inline text-xs">Chat</span>
          </button>

          {/* Theme Toggle (Dark / Light Mode) */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800 hover:text-amber-200 hover:border-amber-400/50'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-sm'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-700" />
                <span className="hidden sm:inline text-[11px] font-medium">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Mobile Nav for smaller screens */}
      <div className="xl:hidden flex overflow-x-auto space-x-1 py-2 px-4 border-t border-slate-800/80 bg-slate-950/60 scrollbar-none">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex shrink-0 items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
