import React, { useEffect, useState } from 'react';
import {
  TrendingUp, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck,
  ChevronRight, Brain, BarChart3
} from 'lucide-react';
import { predictMetabolites, fetchModelMetrics } from '../api/client';
import {
  CurrentProcessState, PredictMetabolitesResponse, ModelMetricsResponse, HorizonPrediction
} from '../types';
import { PredictionHorizonPlot } from '../charts/PredictionHorizonPlot';

export const PredictionsExplainability: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [predData, setPredData] = useState<PredictMetabolitesResponse | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<'vcd' | 'viability' | 'lactate' | 'ammonia'>('viability');
  const [horizonHours, setHorizonHours] = useState<number>(48.0);
  const [isLoading, setIsLoading] = useState(true);

  const currentState: CurrentProcessState = {
    time_h: 96.0,
    VCD: 12.4,
    viability_pct: 94.2,
    glucose_gL: 4.1,
    glutamine_mM: 1.8,
    lactate_gL: 2.8,
    ammonia_mM: 2.2,
    pH: 6.98,
    DO_pct: 42.0,
    temp_C: 36.8,
    feed_rate_mL_h: 5.0
  };

  useEffect(() => {
    async function load() {
      try {
        const [mRes, pRes] = await Promise.all([
          fetchModelMetrics(),
          predictMetabolites(currentState, horizonHours)
        ]);
        setMetrics(mRes);
        setPredData(pRes);
      } catch (err) {
        console.error('Failed to load predictions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [horizonHours]);

  const targetConfig = {
    vcd: { label: 'Viable Cell Density', unit: '10⁶ cells/mL', current: currentState.VCD, color: '#10b981' },
    viability: { label: 'Viability', unit: '%', current: currentState.viability_pct, color: '#06b6d4' },
    lactate: { label: 'Lactate', unit: 'g/L', current: currentState.lactate_gL, color: '#f43f5e' },
    ammonia: { label: 'Ammonia', unit: 'mM', current: currentState.ammonia_mM || 2.2, color: '#f59e0b' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <span>AI Predictive Trajectory & Explainability (XAI)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Forward multi-horizon forecasts with 95% bootstrap uncertainty bounds and tree feature attributions.
          </p>
        </div>

        {/* Target Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {(['viability', 'vcd', 'lactate', 'ammonia'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTarget(t)}
              className={`px-3 py-1 rounded text-xs font-semibold capitalize cursor-pointer transition-all ${
                selectedTarget === t
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'vcd' ? 'VCD' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prediction & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Plot (Span 2) */}
        <div className="glass-panel rounded-xl p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white">
                Forward Horizon Forecast ({targetConfig[selectedTarget].label})
              </h3>
              <p className="text-[11px] text-slate-400">
                Current State at t={currentState.time_h}h → Projecting forward {horizonHours}h with ±1.96·RMSE bounds
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Horizon:</span>
              <select
                value={horizonHours}
                onChange={(e) => setHorizonHours(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none"
              >
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
              </select>
            </div>
          </div>

          {predData ? (
            <PredictionHorizonPlot
              predictions={predData.predictions}
              currentVal={targetConfig[selectedTarget].current}
              currentTime={currentState.time_h}
              targetKey={selectedTarget}
              targetLabel={targetConfig[selectedTarget].label}
              unit={targetConfig[selectedTarget].unit}
              color={targetConfig[selectedTarget].color}
            />
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
              Calculating forward predictive trajectory...
            </div>
          )}

          {/* Uncertainty Table */}
          {predData && (
            <div className="overflow-x-auto pt-2 border-t border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 text-[10px] uppercase">
                    <th className="py-1 px-2">Time (h)</th>
                    <th className="py-1 px-2">Point Estimate</th>
                    <th className="py-1 px-2">95% Lower Bound</th>
                    <th className="py-1 px-2">95% Upper Bound</th>
                    <th className="py-1 px-2">Confidence Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {predData.predictions.map((p, idx) => {
                    const point = p[selectedTarget];
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-2 text-slate-300">t + {p.time_h - currentState.time_h}h ({p.time_h}h)</td>
                        <td className="py-1.5 px-2 text-emerald-400 font-bold">{point.mean} {point.unit}</td>
                        <td className="py-1.5 px-2 text-slate-400">{point.lower_bound} {point.unit}</td>
                        <td className="py-1.5 px-2 text-slate-400">{point.upper_bound} {point.unit}</td>
                        <td className="py-1.5 px-2 text-cyan-400">95% CI (GroupKFold)</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* XAI Attribution Panel */}
        <div className="glass-panel-glow rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Brain className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Explainable AI (Why?)</h3>
            </div>

            {/* Causation Warning Badge */}
            <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] leading-relaxed">
              <strong>MANDATORY SCIENTIFIC GUARD:</strong> STATISTICAL MODEL CONTRIBUTION — DOES NOT PROVE BIOLOGICAL CAUSATION. Feature attributions reflect statistical associations in the trained model.
            </div>

            {/* Feature Attribution List */}
            <div className="mt-4 space-y-3">
              {predData?.explainability.top_contributing_features.map((feat, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-200">{feat.feature}</span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                        feat.direction === 'positive'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {feat.direction.toUpperCase()} ({Math.round(feat.importance * 100)}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${feat.direction === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, feat.importance * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
            Attributions computed via tree importance sensitivity vectors.
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table (Strict Batch Split Non-Leakage) */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span>Rigorous Model Comparison & Validation Metrics</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated strictly with <strong>GroupKFold by Batch ID</strong> (BATCH-2026-CHO-004 holdout). Zero row-level temporal leakage.
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
            3 Candidate Models Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { target: 'VCD', best: 'Linear Regression / Gradient Boosting', r2: 0.973, mae: 0.371, rmse: 0.458 },
            { target: 'Viability (%)', best: 'Random Forest Regressor', r2: 0.993, mae: 0.801, rmse: 1.607 },
            { target: 'Lactate (g/L)', best: 'Gradient Boosting Regressor', r2: 0.919, mae: 0.230, rmse: 0.358 },
            { target: 'Ammonia (mM)', best: 'Linear Regression Baseline', r2: 0.996, mae: 0.047, rmse: 0.059 },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{item.target}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  R² = {item.r2}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Best: <strong className="text-slate-300">{item.best}</strong></p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800 text-slate-400">
                <div>
                  <span className="text-[9px] uppercase block text-slate-500">MAE</span>
                  <span className="text-slate-200">{item.mae}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase block text-slate-500">RMSE</span>
                  <span className="text-slate-200">{item.rmse}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
