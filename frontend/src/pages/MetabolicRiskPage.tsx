import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { RiskAlert } from '../types';
import { fetchActiveAlerts } from '../api/client';

export const MetabolicRiskPage: React.FC = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchActiveAlerts();
      setAlerts(data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-red-600 text-white border-red-500';
      case 'HIGH': return 'bg-rose-500 text-white border-rose-400';
      case 'MEDIUM': return 'bg-amber-500 text-white border-amber-400';
      default: return 'bg-teal-600 text-white border-teal-500';
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Metabolic Risk & Anomaly Center</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time detection of metabolic stress, substrate overflow, byproduct toxicity, and DO bottlenecks.
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-200">No Active Metabolic Risk Alerts</h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            All 12 telemetry channels are operating within optimal physiological limits.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-4"
            >
              {/* Alert Title & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-mono font-extrabold rounded-full border ${severityColor(alert.severity)}`}>
                    {alert.severity} SEVERITY
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{alert.parameter}</h3>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Confidence: <span className="font-bold text-teal-600 dark:text-teal-400">{Math.round(alert.confidence * 100)}%</span>
                </div>
              </div>

              {/* Alert Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">OBSERVED TELEMETRY & EVIDENCE:</p>
                  <p className="leading-relaxed">{alert.evidence}</p>
                  <p className="text-slate-500 pt-1 font-mono">Value: {alert.observed_value} ({alert.trend})</p>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">POSSIBLE PROCESS DRIVER:</p>
                  <p className="leading-relaxed">{alert.possible_driver}</p>
                </div>

                <div className="space-y-1 bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <p className="font-bold text-amber-900 dark:text-amber-200">PREDICTED IMPACT:</p>
                  <p className="leading-relaxed text-amber-800 dark:text-amber-300">{alert.predicted_impact}</p>
                </div>

                <div className="space-y-1 bg-teal-50 dark:bg-teal-950/30 p-3.5 rounded-xl border border-teal-200 dark:border-teal-900/50">
                  <p className="font-bold text-teal-900 dark:text-teal-200">RECOMMENDED HUMAN REVIEW:</p>
                  <p className="leading-relaxed text-teal-800 dark:text-teal-300">{alert.recommended_review}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
