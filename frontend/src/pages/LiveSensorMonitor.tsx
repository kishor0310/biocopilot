import React, { useEffect, useState, useRef } from 'react';
import {
  Radio, AlertTriangle, ShieldAlert, Zap, RotateCcw,
  TrendingUp, TrendingDown, Minus, CheckCircle2, Flame
} from 'lucide-react';
import { injectFault, resetSensors } from '../api/client';
import { SensorReading, SensorStreamMessage, BioprocessAlert } from '../types';

export const LiveSensorMonitor: React.FC = () => {
  const [sensors, setSensors] = useState<Record<string, SensorReading>>({
    'SENSOR-01': { name: 'pH', value: 7.05, unit: 'pH', status: 'NORMAL', rolling_avg: 7.05 },
    'SENSOR-02': { name: 'DO', value: 48.0, unit: '%', status: 'NORMAL', rolling_avg: 48.2 },
    'SENSOR-03': { name: 'Temperature', value: 36.8, unit: '°C', status: 'NORMAL', rolling_avg: 36.8 },
    'SENSOR-04': { name: 'Glucose', value: 3.8, unit: 'g/L', status: 'NORMAL', rolling_avg: 3.85 },
    'SENSOR-05': { name: 'Glutamine', value: 2.2, unit: 'mM', status: 'NORMAL', rolling_avg: 2.2 },
    'SENSOR-06': { name: 'Lactate', value: 2.1, unit: 'g/L', status: 'NORMAL', rolling_avg: 2.05 },
    'SENSOR-07': { name: 'Ammonia', value: 2.4, unit: 'mM', status: 'NORMAL', rolling_avg: 2.38 },
    'SENSOR-08': { name: 'VCD', value: 8.6, unit: '10⁶ cells/mL', status: 'NORMAL', rolling_avg: 8.4 },
    'SENSOR-09': { name: 'Viability', value: 96.5, unit: '%', status: 'NORMAL', rolling_avg: 96.8 },
    'SENSOR-10': { name: 'Agitation', value: 250.0, unit: 'RPM', status: 'NORMAL', rolling_avg: 250.0 },
    'SENSOR-11': { name: 'Gas Flow', value: 0.12, unit: 'vvm', status: 'NORMAL', rolling_avg: 0.12 },
    'SENSOR-12': { name: 'Feed Rate', value: 4.5, unit: 'mL/h', status: 'NORMAL', rolling_avg: 4.5 },
  });

  const [currentTimeH, setCurrentTimeH] = useState(72.0);
  const [activeFaultMsg, setActiveFaultMsg] = useState<string | null>(null);
  const [isInjecting, setIsInjecting] = useState(false);
  const [historyBuffer, setHistoryBuffer] = useState<Array<{ time: number; vcd: number; viab: number; lac: number; glc: number }>>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/sensors`;

    function connectWs() {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const data: SensorStreamMessage = JSON.parse(event.data);
            setSensors(data.sensors);
            setCurrentTimeH(data.time_h);

            // Append to buffer
            setHistoryBuffer((prev) => {
              const updated = [
                ...prev,
                {
                  time: data.time_h,
                  vcd: data.sensors['SENSOR-08']?.value || 0,
                  viab: data.sensors['SENSOR-09']?.value || 0,
                  lac: data.sensors['SENSOR-06']?.value || 0,
                  glc: data.sensors['SENSOR-04']?.value || 0,
                }
              ];
              return updated.slice(-20); // Keep last 20 ticks
            });
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onerror = () => {
          ws.close();
        };

        ws.onclose = () => {
          // Reconnect after 3s
          setTimeout(connectWs, 3000);
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
      }
    }

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleInject = async (type: string, label: string) => {
    setIsInjecting(true);
    try {
      const res = await injectFault(type, 1.8);
      setActiveFaultMsg(`Fault Perturbation Active: ${label} (+${res.fault_type})`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInjecting(false);
    }
  };

  const handleReset = async () => {
    await resetSensors();
    setActiveFaultMsg(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'border-rose-500/60 bg-rose-500/10 text-rose-400';
      case 'WARNING':
        return 'border-amber-500/60 bg-amber-500/10 text-amber-400';
      default:
        return 'border-emerald-500/30 bg-slate-900/60 text-emerald-400';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Prominent Disclaimer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span>Virtual Bioreactor Sensor Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming 12 biochemical telemetry channels at 2.0s intervals. Monitored for out-of-specification CQA excursions.
          </p>
        </div>

        {/* Mandatory Prominent Simulated Notice */}
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold tracking-wider">
            SIMULATED SENSOR DATA — NOT CONNECTED TO PHYSICAL EQUIPMENT
          </span>
        </div>
      </div>

      {/* Fault Injection Panel (Judge Demo Core) */}
      <div className="glass-panel-glow rounded-xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Judge Interactive Fault Injection Console
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Inject stochastic perturbation directly into the virtual telemetry stream to trigger the risk engine
          </span>
        </div>

        {activeFaultMsg && (
          <div className="flex items-center justify-between bg-rose-500/15 border border-rose-500/40 p-2.5 rounded-lg text-rose-300 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 animate-bounce" />
              <span>{activeFaultMsg}</span>
            </div>
            <button
              onClick={handleReset}
              className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold cursor-pointer"
            >
              CLEAR
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'glucose_overfeed', label: 'Inject Glucose Overfeed', color: 'hover:border-amber-500 hover:text-amber-400' },
            { id: 'lactate_rise', label: 'Inject Lactate Rise', color: 'hover:border-rose-500 hover:text-rose-400' },
            { id: 'do_sensor_failure', label: 'Inject DO Failure', color: 'hover:border-cyan-500 hover:text-cyan-400' },
            { id: 'ph_drift', label: 'Inject pH Drift', color: 'hover:border-yellow-500 hover:text-yellow-400' },
            { id: 'viability_crash', label: 'Inject Viability Crash', color: 'hover:border-red-500 hover:text-red-400' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => handleInject(f.id, f.label)}
              disabled={isInjecting}
              className={`p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200 ${f.color} transition-all cursor-pointer text-left flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[9px] font-mono text-slate-500 uppercase">FAULT</span>
              </div>
              <span className="text-[11px] leading-snug">{f.label}</span>
            </button>
          ))}

          <button
            onClick={handleReset}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[9px] font-mono text-slate-500 uppercase">RESET</span>
            </div>
            <span className="text-[11px] leading-snug">Reset Stream</span>
          </button>
        </div>
      </div>

      {/* 12 Virtual Sensor Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(sensors).map(([sensorId, data]) => {
          const isCritical = data.status === 'CRITICAL';
          const isWarning = data.status === 'WARNING';
          return (
            <div
              key={sensorId}
              className={`rounded-xl p-4 border transition-all ${getStatusColor(data.status)} flex flex-col justify-between shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-400 font-bold">{sensorId}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {data.status}
                  </span>
                </div>
                <h4 className="text-xs font-medium text-slate-300">{data.name}</h4>
              </div>

              <div className="my-2">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-bold font-mono text-white tracking-tight">
                    {data.value}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{data.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                <span>10-Tick Rolling Avg:</span>
                <span className="text-slate-200 font-bold">{data.rolling_avg}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
