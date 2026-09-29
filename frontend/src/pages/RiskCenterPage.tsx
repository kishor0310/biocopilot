import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { fetchAlerts } from '../api/client';
import { BioprocessAlert } from '../types';

export const RiskCenterPage: React.FC = () => {
  const [alerts, setAlerts] = useState<BioprocessAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAlerts();
      setAlerts(res);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <span>Metabolic Risk & Clinical Exception Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time automated detection of substrate starvation, overflow metabolism, toxic byproduct build-up, and DO/pH drifts.
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center space-y-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">All Bioprocess CQAs Within Regulatory Deadbands</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Current cell culture telemetry indicates stable homeostatic metabolism. To test the alerting engine, visit the Live Monitor and inject a fault.
            </p>
          </div>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className="glass-panel rounded-xl p-5 border-l-4 border-l-rose-500 space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadge(a.severity)}`}>
                    {a.severity}
                  </span>
                  <span className="font-mono text-xs font-bold text-white tracking-wider">
                    {a.parameter}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Observed: <strong className="text-rose-400">{a.observed_value}</strong> (Threshold: {a.threshold})
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                  <span>Trend: <strong className="text-slate-300">{a.trend}</strong></span>
                  <span>•</span>
                  <span>Confidence: <strong className="text-emerald-400">{Math.round(a.confidence * 100)}%</strong></span>
                </div>
              </div>

              {/* Clinical Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Evidence & Observation
                  </span>
                  <p className="text-slate-300 leading-snug">{a.evidence}</p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Probable Metabolic Driver
                  </span>
                  <p className="text-slate-300 leading-snug">{a.possible_driver}</p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Projected Biological Impact
                  </span>
                  <p className="text-rose-300 leading-snug">{a.predicted_impact}</p>
                </div>
              </div>

              {/* Recommended Review Action */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start space-x-2 text-xs">
                <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300 mr-1">Recommended Operator Review:</span>
                  <span className="text-slate-200">{a.recommended_review}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
