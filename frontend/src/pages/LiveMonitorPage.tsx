import React, { useEffect, useState } from 'react';
import { Cpu, Zap, AlertTriangle, RefreshCw, Radio, CheckCircle, ShieldAlert } from 'lucide-react';
import { VirtualSensorData } from '../types';
import { fetchCurrentSensors, injectSensorFault, clearSensorFault } from '../api/client';

export const LiveMonitorPage: React.FC = () => {
  const [sensors, setSensors] = useState<VirtualSensorData[]>([]);
  const [activeFault, setActiveFault] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isStreaming) {
      loadTelemetry();
      interval = setInterval(loadTelemetry, 2000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const loadTelemetry = async () => {
    try {
      const data = await fetchCurrentSensors();
      setSensors(data.telemetry);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    }
  };

  const handleInjectFault = async (faultType: string) => {
    try {
      await injectSensorFault(faultType);
      setActiveFault(faultType);
      loadTelemetry();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearFault = async () => {
    try {
      await clearSensorFault();
      setActiveFault(null);
      loadTelemetry();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-teal-600" />
            <span>Real-Time Virtual Sensor Monitor</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            12-channel telemetry stream with 2s refresh interval & judge demo fault injection.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-xs font-mono font-bold rounded-full border border-teal-300">
            <Radio className="w-3.5 h-3.5 animate-pulse text-teal-600" />
            <span>LIVE 2S STREAM</span>
          </span>
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-mono font-bold rounded-full border border-amber-300">
            SIMULATED SENSOR DATA
          </span>
        </div>
      </div>

      {/* FAULT INJECTION DEMO CONTROLS (JUDGE DEMO FEATURE P0) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
            <h2 className="font-bold text-base text-amber-300">JUDGE DEMO: SENSOR FAULT INJECTION SUITE</h2>
          </div>
          {activeFault && (
            <span className="px-3 py-1 bg-red-600 text-white font-mono text-xs font-bold rounded-full animate-pulse">
              ACTIVE FAULT: {activeFault.toUpperCase()}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-300">
          Inject real-time process perturbations into the simulated sensor stream to test metabolic risk detection & AI decision support response.
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {[
            { id: 'glucose_overfeed', label: 'Inject Glucose Overfeed', color: 'bg-amber-600 hover:bg-amber-700' },
            { id: 'lactate_rise', label: 'Inject Lactate Rise', color: 'bg-rose-600 hover:bg-rose-700' },
            { id: 'do_failure', label: 'Inject DO Sensor Failure', color: 'bg-indigo-600 hover:bg-indigo-700' },
            { id: 'ph_drift', label: 'Inject pH Drift', color: 'bg-violet-600 hover:bg-violet-700' },
            { id: 'viability_crash', label: 'Inject Viability Crash', color: 'bg-red-700 hover:bg-red-800' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => handleInjectFault(f.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl text-white shadow-md transition-all ${f.color} ${
                activeFault === f.id ? 'ring-2 ring-amber-400 scale-105' : ''
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={handleClearFault}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-colors"
          >
            Clear Active Faults
          </button>
        </div>
      </div>

      {/* 12-CHANNEL SENSOR GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensors.map((s) => {
          const isWarn = s.status === 'WARNING' || s.status === 'CRITICAL';
          return (
            <div
              key={s.channel_id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition-all duration-200 shadow-sm ${
                isWarn
                  ? 'border-red-400 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>{s.channel_id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  s.status === 'OPTIMAL'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                }`}>
                  {s.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{s.name}</h3>

              <div className="flex items-baseline justify-between mt-3">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {s.value}
                </span>
                <span className="text-xs font-medium text-slate-500">{s.unit}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                <span>Range: {s.min_threshold} - {s.max_threshold}</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">Avg: {s.rolling_avg}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
