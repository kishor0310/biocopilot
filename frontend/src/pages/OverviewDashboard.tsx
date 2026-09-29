import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight,
  Database, DollarSign, Layers, Play, Radio, ShieldCheck,
  TrendingDown, TrendingUp, Zap
} from 'lucide-react';
import { fetchHealth, fetchRunDetails, fetchAlerts } from '../api/client';
import { RunDetails, BioprocessAlert } from '../types';
import { ProcessTrendsPlot } from '../charts/ProcessTrendsPlot';

interface OverviewDashboardProps {
  onStartDemo: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onStartDemo }) => {
  const [runData, setRunData] = useState<RunDetails | null>(null);
  const [alerts, setAlerts] = useState<BioprocessAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [run, altList] = await Promise.all([
          fetchRunDetails('BATCH-2026-CHO-001'),
          fetchAlerts()
        ]);
        setRunData(run);
        setAlerts(altList);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner: Positioning & Problem -> Solution */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>YUVA Megathon 2026 — SRM IST Trichy — Biotech Track</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            From cell-culture data to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              explainable process decisions
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
            Detect metabolic risk, predict dynamic trajectory, optimize nutrients & media cost, and evaluate scale-up from 2 L toward 1,000 L.
            A human-in-the-loop decision-support system designed to empower bioprocess engineers.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onStartDemo}
              className="flex items-center space-x-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>START 5-MIN JUDGE DEMO</span>
            </button>
            <Link
              to="/monitor"
              className="flex items-center space-x-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 text-sm border border-slate-700 transition-all"
            >
              <Radio className="h-4 w-4 text-emerald-400" />
              <span>Open Virtual Bioreactor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Section 26 Core: THE PROBLEM vs THE SOLUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* The Problem */}
        <div className="glass-panel-danger rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-base font-bold uppercase tracking-wider">The Bioprocess Challenge</h2>
          </div>
          <p className="text-xs text-slate-300">
            Biopharmaceutical manufacturing suffers from multi-million dollar batch failures due to hidden metabolic shifts and blind scale-up hurdles:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded border border-rose-500/20">
              <span className="font-bold text-rose-400 block mb-0.5">High Media Cost</span>
              <span className="text-slate-400 text-[11px]">Unoptimized nutrient feeds waste costly growth factors and basal media.</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded border border-rose-500/20">
              <span className="font-bold text-rose-400 block mb-0.5">Metabolic Imbalance</span>
              <span className="text-slate-400 text-[11px]">Glucose overfeeding drives toxic lactate accumulation & viability crashes.</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded border border-rose-500/20">
              <span className="font-bold text-rose-400 block mb-0.5">Process Variability</span>
              <span className="text-slate-400 text-[11px]">Run-to-run drift without real-time predictive trajectory oversight.</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded border border-rose-500/20">
              <span className="font-bold text-rose-400 block mb-0.5">Scale-Up Uncertainty</span>
              <span className="text-slate-400 text-[11px]">Transferring 2 L recipes to 1,000 L bioreactors causes hypoxia or fatal shear.</span>
            </div>
          </div>
        </div>

        {/* The Solution */}
        <div className="glass-panel-glow rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Zap className="h-5 w-5" />
            <h2 className="text-base font-bold uppercase tracking-wider">The BioCopilot Solution</h2>
          </div>
          <p className="text-xs text-slate-300">
            A real-time AI copilot and digital twin providing physics-informed decision support with mandatory human review:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block mb-0.5">12 Virtual Sensors</span>
              <span className="text-slate-400 text-[11px]">Continuous telemetry streaming with instant fault perturbation testing.</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block mb-0.5">Explainable AI (XAI)</span>
              <span className="text-slate-400 text-[11px]">Transparent SHAP feature attributions distinguishing correlation from causation.</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block mb-0.5">Unit Economics</span>
              <span className="text-slate-400 text-[11px]">Precise INR / USD batch costing and bounded Pareto feed scheduler.</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block mb-0.5">Scale-Up Hydrodynamics</span>
              <span className="text-slate-400 text-[11px]">Four scaling regimes from 2 L to 1,000 L computing P/V, kLa, and shear risk.</span>
            </div>
          </div>
        </div>
      </div>

      {/* The 6-Stage End-to-End Pipeline */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          End-to-End Decision-Support Pipeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {[
            { step: '01', name: 'DATA INGEST', desc: 'Fuzzy mapping & Quality score', link: '/data', icon: Database },
            { step: '02', name: 'DETECT RISK', desc: 'Lactate & substrate alerts', link: '/risks', icon: AlertTriangle },
            { step: '03', name: 'PREDICT', desc: '48h horizon + 95% CI', link: '/predictions', icon: TrendingUp },
            { step: '04', name: 'OPTIMIZE', desc: 'Bounded feed & media cost', link: '/nutrients', icon: DollarSign },
            { step: '05', name: 'SCALE-UP', desc: '2 L → 1,000 L hydrodynamics', link: '/scaleup', icon: Layers },
            { step: '06', name: 'APPROVE', desc: 'Mandatory human sign-off', link: '/approval', icon: ShieldCheck },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <Link
                key={idx}
                to={s.link}
                className="group bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 p-3 rounded-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                    <span>{s.step}</span>
                    <Icon className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">{s.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{s.desc}</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-400 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Live Bioprocess Trajectory Summary */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">Active Culture Telemetry Profile</h3>
              <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
                BATCH-2026-CHO-001 (2.0 L)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA. Calibrated to published CHO fed-batch kinetics.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400">Harvest Viability: <strong className="text-emerald-400">88.5%</strong></span>
            <span className="text-slate-400">Peak VCD: <strong className="text-emerald-400">17.2 x 10⁶</strong></span>
            <span className="text-slate-400">Duration: <strong className="text-slate-200">336 h</strong></span>
          </div>
        </div>

        {/* Plot */}
        {runData && runData.series.length > 0 ? (
          <ProcessTrendsPlot series={runData.series} />
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
            Loading bioprocess telemetry trajectory...
          </div>
        )}
      </div>
    </div>
  );
};
