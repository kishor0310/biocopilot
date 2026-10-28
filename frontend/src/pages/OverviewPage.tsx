import React from 'react';
import {
  AlertTriangle, DollarSign, Activity, Scale, ShieldCheck, Play, ArrowRight,
  CheckCircle, Database, Cpu, TrendingUp, Sparkles
} from 'lucide-react';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
  startDemoMode: () => void;
}

export const OverviewPage: React.FC<OverviewProps> = ({ setActiveTab, startDemoMode }) => {
  return (
    <div className="space-y-8 py-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-10 shadow-2xl border border-teal-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono font-semibold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPLAINABLE BIOPROCESS DECISION SUPPORT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            AI Copilot for Scalable Cell-Culture Bioprocess Design
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            From raw cell-culture telemetry to explainable decisions — detect metabolic risk early, predict process trajectory, optimize nutrient feed & media economics, and evaluate 2 L to 1,000 L bioreactor scale-up.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <button
              onClick={startDemoMode}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>START 5-MIN GUIDED JUDGE DEMO</span>
            </button>
            <button
              onClick={() => setActiveTab('sensors')}
              className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              View Live Sensor Monitor
            </button>
          </div>
        </div>
      </div>

      {/* 1. THE PROBLEM vs THE SOLUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Problem */}
        <div className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-4">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">THE INDUSTRY CHALLENGE</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>High Media Costs:</strong> Base media & recombinant growth factors account for &gt;60% of biomanufacturing operational expenditure.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Metabolic Imbalance:</strong> Excess glucose feed triggers toxic lactate & ammonia accumulation, causing premature viability crashes.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Scale-Up Bottlenecks:</strong> Moving from 2 L benchtop to 1,000 L pilot vessels alters oxygen transfer ($k_L a$), mixing time, and cell shear stress.</span>
            </li>
          </ul>
        </div>

        {/* The Solution */}
        <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">THE BioCopilot SOLUTION</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>Data Validation First:</strong> Physiological range checks & Data Quality scoring before any AI model prediction is permitted.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>Explainable AI & Smart Feeding:</strong> SHAP feature contribution matrices paired with Monod kinetics digital twin bounded feed optimization.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>Human-in-the-Loop Safeguard:</strong> Zero direct equipment control; every recommendation requires explicit human operator approval.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. THE PIPELINE */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">End-to-End Decision Support Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'DATA', desc: 'Ingestion & Canonical Schema', tab: 'data', icon: Database },
            { step: '02', title: 'DETECT', desc: 'Metabolic & Sensor Risk Engine', tab: 'risks', icon: AlertTriangle },
            { step: '03', title: 'PREDICT', desc: 'VCD & Viability ML Forecasting', tab: 'predictions', icon: TrendingUp },
            { step: '04', title: 'OPTIMIZE', desc: 'Smart Feed & Media Cost', tab: 'feed', icon: DollarSign },
            { step: '05', title: 'SCALE', desc: '2 L → 1,000 L Engineering', tab: 'scaleup', icon: Scale },
            { step: '06', title: 'APPROVE', desc: 'Human Review & Audit Trail', tab: 'approval', icon: ShieldCheck }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(item.tab)}
                className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  <span>STEP {item.step}</span>
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. COMPACT LIVE PROCESS SUMMARY */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active Bioprocess Telemetry Summary</h3>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
            Batch_01_Control (2.0 L Benchtop)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Viable Cell Density (VCD)</p>
            <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">8.40 <span className="text-xs text-slate-400">10⁶/mL</span></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Culture Viability</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">96.2 <span className="text-xs text-slate-400">%</span></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Lactate Level</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">1.10 <span className="text-xs text-slate-400">g/L</span></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Dissolved Oxygen (DO)</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">42.5 <span className="text-xs text-slate-400">%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
