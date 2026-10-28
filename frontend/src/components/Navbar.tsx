import React from 'react';
import {
  Activity, Database, Cpu, TrendingUp, AlertTriangle, ShieldCheck,
  FileText, Play, Sun, Moon, Sparkles, Scale, DollarSign
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startDemoMode: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  startDemoMode,
  darkMode,
  setDarkMode
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'data', label: 'Data Quality', icon: Database },
    { id: 'sensors', label: 'Live Monitor', icon: Cpu },
    { id: 'predictions', label: 'AI Predictions', icon: TrendingUp },
    { id: 'risks', label: 'Risk Center', icon: AlertTriangle },
    { id: 'feed', label: 'Feed & Cost', icon: DollarSign },
    { id: 'scaleup', label: 'Scale-Up Engine', icon: Scale },
    { id: 'approval', label: 'Human Approval', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Event Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              Bio
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">BioCopilot</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  DECISION SUPPORT
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">YUVA Megathon 2026 — Biotech Track</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-semibold shadow-sm border border-teal-200 dark:border-teal-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: 5-Min Judge Demo + Theme Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={startDemoMode}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 animate-pulse"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START 5-MIN DEMO</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
